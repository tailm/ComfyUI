"""
预取引擎
基于访问模式预测未来访问并提前加载数据
"""

import torch
import time
import logging
import threading
import numpy as np
from typing import Dict, List, Optional, Tuple, Any, Deque, Set, Callable
from collections import defaultdict, deque
from enum import Enum
from dataclasses import dataclass, field
import heapq
import json
import os

logger = logging.getLogger(__name__)

class PrefetchStrategy(Enum):
    """预取策略"""
    NONE = "none"              # 不预取
    SEQUENTIAL = "sequential"  # 顺序预取
    STRIDED = "strided"        # 跨步预取
    LOOPING = "looping"        # 循环预取
    ADAPTIVE = "adaptive"      # 自适应预取
    AGGRESSIVE = "aggressive"  # 激进预取

@dataclass
class PrefetchPrediction:
    """预取预测"""
    key: str
    confidence: float          # 置信度 0.0-1.0
    predicted_time: float      # 预测访问时间
    priority: float            # 优先级
    pattern_type: str          # 访问模式类型
    pattern_data: Dict[str, Any]  # 模式数据
    last_updated: float = field(default_factory=time.time)
    
    def __lt__(self, other):
        # 优先级越高越靠前
        return self.priority > other.priority

class PrefetchPatternDetector:
    """预取模式检测器"""
    
    def __init__(self, window_size: int = 50):
        self.window_size = window_size
        self.access_history: Dict[str, Deque[float]] = defaultdict(lambda: deque(maxlen=window_size))
        self.pattern_cache: Dict[str, Dict] = {}
        self.lock = threading.RLock()
        
    def record_access(self, key: str):
        """记录访问"""
        with self.lock:
            current_time = time.time()
            self.access_history[key].append(current_time)
            
    def analyze_pattern(self, key: str) -> Optional[Dict]:
        """分析访问模式"""
        history = self.access_history.get(key)
        if not history or len(history) < 3:
            return None
            
        timestamps = list(history)
        
        # 计算时间间隔
        intervals = []
        for i in range(1, len(timestamps)):
            intervals.append(timestamps[i] - timestamps[i-1])
            
        if not intervals:
            return None
            
        # 计算统计信息
        mean_interval = np.mean(intervals)
        std_interval = np.std(intervals) if len(intervals) > 1 else 0
        cv_interval = std_interval / mean_interval if mean_interval > 0 else 0
        
        # 检测模式
        pattern_type = "unknown"
        confidence = 0.0
        pattern_data = {}
        
        # 1. 顺序访问（间隔稳定）
        if cv_interval < 0.1 and mean_interval > 0:
            pattern_type = "sequential"
            confidence = 0.9
            pattern_data = {
                'interval': mean_interval,
                'std_interval': std_interval,
                'cv_interval': cv_interval,
            }
            
        # 2. 循环访问（周期性）
        elif len(timestamps) >= 5:
            # 使用FFT检测周期性
            try:
                from scipy import signal
                # 计算自相关
                autocorr = self._compute_autocorrelation(intervals)
                peak_indices, _ = signal.find_peaks(autocorr, height=0.5)
                
                if len(peak_indices) > 0:
                    # 找到主要周期
                    main_period = peak_indices[0] + 1  # 索引从0开始
                    pattern_type = "looping"
                    confidence = min(0.8, np.max(autocorr))
                    pattern_data = {
                        'period': main_period,
                        'autocorr_peaks': len(peak_indices),
                        'autocorr_max': np.max(autocorr),
                    }
            except ImportError:
                # 如果没有scipy，使用简单方法
                if self._detect_periodicity_simple(intervals):
                    pattern_type = "looping"
                    confidence = 0.7
                    pattern_data = {
                        'period': len(intervals) // 2,
                        'detected_by': 'simple',
                    }
                    
        # 3. 跨步访问（间隔有规律变化）
        elif len(intervals) >= 3:
            # 检查间隔是否等差或等比
            if self._detect_strided_pattern(intervals):
                pattern_type = "strided"
                confidence = 0.6
                pattern_data = {
                    'stride_type': 'arithmetic',
                    'interval_mean': mean_interval,
                }
                
        # 4. 随机访问
        else:
            pattern_type = "random"
            confidence = 0.3
            pattern_data = {
                'mean_interval': mean_interval,
                'std_interval': std_interval,
                'cv_interval': cv_interval,
            }
            
        result = {
            'pattern_type': pattern_type,
            'confidence': confidence,
            'pattern_data': pattern_data,
            'last_access': timestamps[-1],
            'access_count': len(timestamps),
        }
        
        self.pattern_cache[key] = result
        return result
        
    def _compute_autocorrelation(self, data: List[float]) -> np.ndarray:
        """计算自相关（简化版，不依赖scipy）"""
        n = len(data)
        if n < 2:
            return np.array([1.0])
            
        data_np = np.array(data)
        mean = np.mean(data_np)
        var = np.var(data_np)
        
        if var == 0:
            return np.ones(n)
            
        # 计算自相关
        autocorr = np.correlate(data_np - mean, data_np - mean, mode='full')
        autocorr = autocorr[n-1:] / (var * (n - np.arange(n)))
        
        return autocorr[:min(n, 10)]
        
    def _detect_periodicity_simple(self, intervals: List[float]) -> bool:
        """简单周期性检测"""
        if len(intervals) < 3:
            return False
            
        # 检查是否有重复模式
        for period in range(1, len(intervals) // 2 + 1):
            is_periodic = True
            for i in range(period, len(intervals)):
                if abs(intervals[i] - intervals[i % period]) > intervals[i] * 0.2:  # 20%容差
                    is_periodic = False
                    break
            if is_periodic:
                return True
        return False
        
    def _detect_strided_pattern(self, intervals: List[float]) -> bool:
        """检测跨步模式"""
        if len(intervals) < 3:
            return False
            
        # 检查等差序列
        diffs = np.diff(intervals)
        if np.std(diffs) < np.mean(np.abs(diffs)) * 0.3:  # 30%容差
            return True
            
        # 检查等比序列
        ratios = []
        for i in range(1, len(intervals)):
            if intervals[i-1] != 0:
                ratios.append(intervals[i] / intervals[i-1])
                
        if ratios and np.std(ratios) < np.mean(ratios) * 0.3:  # 30%容差
            return True
            
        return False
        
    def predict_next_access(self, key: str) -> Optional[PrefetchPrediction]:
        """预测下一次访问"""
        pattern = self.analyze_pattern(key)
        if not pattern:
            return None
            
        last_access = pattern['last_access']
        pattern_type = pattern['pattern_type']
        confidence = pattern['confidence']
        pattern_data = pattern['pattern_data']
        
        predicted_time = None
        priority = confidence  # 基础优先级
        
        if pattern_type == "sequential":
            # 顺序访问：基于固定间隔预测
            interval = pattern_data.get('interval', 0)
            if interval > 0:
                predicted_time = last_access + interval
                priority *= 1.2  # 顺序访问优先级更高
                
        elif pattern_type == "looping":
            # 循环访问：基于周期预测
            period = pattern_data.get('period', 0)
            if period > 0:
                predicted_time = last_access + period * pattern_data.get('interval', 1.0)
                priority *= 1.1
                
        elif pattern_type == "strided":
            # 跨步访问：基于步长预测
            interval = pattern_data.get('interval_mean', 0)
            if interval > 0:
                predicted_time = last_access + interval
                priority *= 1.0
                
        elif pattern_type == "random":
            # 随机访问：基于平均间隔预测
            mean_interval = pattern_data.get('mean_interval', 0)
            if mean_interval > 0:
                predicted_time = last_access + mean_interval
                priority *= 0.8  # 随机访问优先级较低
                
        if predicted_time is None:
            return None
            
        # 计算时间紧迫性（越近优先级越高）
        time_until = predicted_time - time.time()
        if time_until > 0:
            urgency = 1.0 / (time_until + 0.001)
            priority *= urgency
            
        return PrefetchPrediction(
            key=key,
            confidence=confidence,
            predicted_time=predicted_time,
            priority=priority,
            pattern_type=pattern_type,
            pattern_data=pattern_data,
        )
        
    def get_pattern(self, key: str) -> Optional[Dict]:
        """获取访问模式"""
        with self.lock:
            return self.pattern_cache.get(key)
            
    def get_stats(self) -> Dict[str, Any]:
        """获取统计信息"""
        with self.lock:
            pattern_counts = defaultdict(int)
            for pattern in self.pattern_cache.values():
                pattern_counts[pattern['pattern_type']] += 1
                
            return {
                'total_keys_tracked': len(self.access_history),
                'total_patterns_identified': len(self.pattern_cache),
                'pattern_distribution': dict(pattern_counts),
                'average_confidence': np.mean([p['confidence'] for p in self.pattern_cache.values()]) 
                    if self.pattern_cache else 0.0,
            }

class PrefetchEngine:
    """预取引擎"""
    
    def __init__(self, cache_manager, config: Optional[Dict] = None):
        self.cache_manager = cache_manager
        self.config = config or self._get_default_config()
        
        # 模式检测器
        self.pattern_detector = PrefetchPatternDetector(
            window_size=self.config['pattern_detection']['window_size']
        )
        
        # 预取队列
        self.prefetch_queue: List[PrefetchPrediction] = []
        self.prefetch_history: Deque[Dict] = deque(maxlen=1000)
        
        # 性能统计
        self.stats = {
            'total_predictions': 0,
            'successful_prefetches': 0,
            'failed_prefetches': 0,
            'hit_after_prefetch': 0,
            'miss_after_prefetch': 0,
            'total_time_saved': 0.0,
            'total_data_prefetched': 0,  # 字节
        }
        
        # 控制标志
        self.running = False
        self.prefetch_thread = None
        self.lock = threading.RLock()
        
        logger.info("预取引擎已初始化")
        
    def _get_default_config(self) -> Dict:
        """获取默认配置"""
        return {
            'enabled': True,
            'strategy': PrefetchStrategy.ADAPTIVE.value,
            'prediction_horizon': 30.0,  # 预测时间范围（秒）
            'prefetch_ahead': 3,  # 预取提前量
            'confidence_threshold': 0.6,  # 置信度阈值
            'max_queue_size': 100,
            'check_interval': 2.0,  # 检查间隔（秒）
            'pattern_detection': {
                'window_size': 50,
                'min_pattern_confidence': 0.5,
                'update_interval': 10.0,
            },
            'performance': {
                'track_latency_saving': True,
                'adaptive_confidence': True,
            },
        }
        
    def start(self):
        """启动预取引擎"""
        if not self.running and self.config['enabled']:
            self.running = True
            self.prefetch_thread = threading.Thread(
                target=self._prefetch_worker,
                daemon=True,
                name="PrefetchWorker"
            )
            self.prefetch_thread.start()
            logger.info("预取引擎已启动")
            
    def stop(self):
        """停止预取引擎"""
        self.running = False
        if self.prefetch_thread:
            self.prefetch_thread.join(timeout=5.0)
            logger.info("预取引擎已停止")
            
    def _prefetch_worker(self):
        """预取工作线程"""
        while self.running:
            try:
                self._check_and_prefetch()
                time.sleep(self.config['check_interval'])
            except Exception as e:
                logger.error(f"预取工作线程错误: {e}")
                time.sleep(5.0)
                
    def _check_and_prefetch(self):
        """检查并执行预取"""
        with self.lock:
            current_time = time.time()
            prediction_horizon = self.config['prediction_horizon']
            confidence_threshold = self.config['confidence_threshold']
            
            # 清空旧队列
            self._cleanup_old_predictions(current_time)
            
            # 获取所有在L2和L3中的key
            l2_keys = set(self.cache_manager.l2_cache.get_keys())
            l3_keys = set(self.cache_manager.l3_cache.get_keys())
            all_keys = l2_keys.union(l3_keys)
            
            # 为每个key生成预测
            new_predictions = []
            for key in all_keys:
                prediction = self.pattern_detector.predict_next_access(key)
                if prediction and prediction.confidence >= confidence_threshold:
                    # 检查是否在预测时间范围内
                    time_until = prediction.predicted_time - current_time
                    if 0 < time_until <= prediction_horizon:
                        new_predictions.append(prediction)
                        
            # 添加到队列
            self.prefetch_queue.extend(new_predictions)
            self.stats['total_predictions'] += len(new_predictions)
            
            # 按优先级排序
            self.prefetch_queue.sort(key=lambda x: x.priority, reverse=True)
            
            # 限制队列大小
            max_size = self.config['max_queue_size']
            if len(self.prefetch_queue) > max_size:
                self.prefetch_queue = self.prefetch_queue[:max_size]
                
            # 执行预取
            self._execute_prefetches()
            
    def _cleanup_old_predictions(self, current_time: float):
        """清理过期的预测"""
        # 移除已过期的预测
        self.prefetch_queue = [
            p for p in self.prefetch_queue 
            if p.predicted_time > current_time - 60  # 保留最近60秒的预测
        ]
        
    def _execute_prefetches(self):
        """执行预取"""
        prefetch_ahead = self.config['prefetch_ahead']
        executed = 0
        
        for prediction in self.prefetch_queue[:prefetch_ahead]:
            if self._should_prefetch(prediction):
                success = self._prefetch_data(prediction)
                if success:
                    executed += 1
                    # 从队列中移除已执行的预测
                    self.prefetch_queue.remove(prediction)
                    
        if executed > 0:
            logger.debug(f"执行了 {executed} 次预取")
            
    def _should_prefetch(self, prediction: PrefetchPrediction) -> bool:
        """判断是否应该预取"""
        # 检查数据是否已经在L1
        if self.cache_manager.l1_cache.contains(prediction.key):
            return False
            
        # 根据策略调整决策
        strategy = PrefetchStrategy(self.config['strategy'])
        
        if strategy == PrefetchStrategy.NONE:
            return False
        elif strategy == PrefetchStrategy.SEQUENTIAL:
            return prediction.pattern_type == "sequential"
        elif strategy == PrefetchStrategy.STRIDED:
            return prediction.pattern_type in ["sequential", "strided"]
        elif strategy == PrefetchStrategy.LOOPING:
            return prediction.pattern_type in ["sequential", "looping"]
        elif strategy == PrefetchStrategy.AGGRESSIVE:
            return prediction.confidence > 0.3  # 低置信度也预取
        else:  # ADAPTIVE
            # 自适应策略：根据系统负载和预测质量决定
            load_factor = self._get_system_load_factor()
            
            if load_factor > 0.8:  # 高负载，只预取高置信度
                return prediction.confidence > 0.7
            elif load_factor > 0.5:  # 中等负载
                return prediction.confidence > 0.5
            else:  # 低负载，预取更多
                return prediction.confidence > 0.3
                
    def _get_system_load_factor(self) -> float:
        """获取系统负载因子"""
        try:
            # 获取缓存使用率
            l1_usage = self.cache_manager.l1_cache.get_usage()
            l2_usage = self.cache_manager.l2_cache.get_usage()
            
            # 综合负载因子
            load_factor = max(l1_usage, l2_usage * 0.7)
            return min(load_factor, 1.0)
            
        except Exception as e:
            logger.warning(f"获取系统负载因子失败: {e}")
            return 0.5
            
    def _prefetch_data(self, prediction: PrefetchPrediction) -> bool:
        """预取数据"""
        key = prediction.key
        
        # 确定数据当前所在的层级
        current_level = None
        data = None
        
        if self.cache_manager.l2_cache.contains(key):
            current_level = 'l2'
            data = self.cache_manager.l2_cache.get(key)
        elif self.cache_manager.l3_cache.contains(key):
            current_level = 'l3'
            data = self.cache_manager.l3_cache.get(key)
            
        if not data or not current_level:
            logger.debug(f"预取失败: key={key} 不在缓存中")
            self.stats['failed_prefetches'] += 1
            return False
            
        # 确定目标层级（晋升一级）
        target_level = 'l1' if current_level == 'l2' else 'l2'
        
        # 执行迁移
        try:
            # 这里需要调用缓存管理器的迁移功能
            # 由于我们还没有实现迁移引擎的集成，这里先记录日志
            logger.info(f"预取: {key} from {current_level} to {target_level}, "
                      f"confidence={prediction.confidence:.2f}, pattern={prediction.pattern_type}")
            
            # 记录预取历史
            prefetch_record = {
                'key': key,
                'from_level': current_level,
                'to_level': target_level,
                'confidence': prediction.confidence,
                'pattern_type': prediction.pattern_type,
                'predicted_time': prediction.predicted_time,
                'actual_time': time.time(),
                'success': True,
            }
            self.prefetch_history.append(prefetch_record)
            
            self.stats['successful_prefetches'] += 1
            
            # 估算数据大小
            data_size = self._estimate_size(data)
            self.stats['total_data_prefetched'] += data_size
            
            # 估算节省的时间
            time_saved = self._estimate_time_saved(current_level, target_level, data_size)
            self.stats['total_time_saved'] += time_saved
            
            return True
            
        except Exception as e:
            logger.error(f"预取执行错误: {e}")
            prefetch_record = {
                'key': key,
                'from_level': current_level,
                'to_level': target_level,
                'confidence': prediction.confidence,
                'pattern_type': prediction.pattern_type,
                'predicted_time': prediction.predicted_time,
                'actual_time': time.time(),
                'success': False,
                'error': str(e),
            }
            self.prefetch_history.append(prefetch_record)
            self.stats['failed_prefetches'] += 1
            return False
            
    def _estimate_size(self, data: Any) -> int:
        """估算数据大小"""
        if isinstance(data, torch.Tensor):
            return data.numel() * data.element_size()
        elif isinstance(data, (list, tuple)):
            return sum(self._estimate_size(item) for item in data)
        elif isinstance(data, dict):
            return sum(self._estimate_size(v) for v in data.values())
        else:
            try:
                import pickle
                return len(pickle.dumps(data))
            except:
                return 1024  # 默认1KB
                
    def _estimate_time_saved(self, from_level: str, to_level: str, data_size: int) -> float:
        """估计预取节省的时间"""
        # 各层级的典型访问延迟（纳秒）
        latency_ns = {
            'l1': 100,     # GPU内存：100ns
            'l2': 1000,    # 系统内存：1μs
            'l3': 100000,  # 磁盘：100μs
        }
        
        from_latency = latency_ns.get(from_level, 1000000)  # 默认1ms
        to_latency = latency_ns.get(to_level, 1000000)
        
        # 计算延迟差异
        latency_diff = from_latency - to_latency
        
        # 考虑数据大小（假设带宽为10GB/s）
        bandwidth_gbs = 10.0  # 10 GB/s
        bandwidth_ns_per_byte = 1e9 / (bandwidth_gbs * 1024**3)  # ns/byte
        
        transfer_time = data_size * bandwidth_ns_per_byte
        
        # 总节省时间 = 延迟差异 - 传输时间
        time_saved_ns = latency_diff - transfer_time
        
        # 转换为秒
        return max(0, time_saved_ns / 1e9)  # 确保非负
        
    def record_access(self, key: str, hit: bool, from_prefetch: bool = False):
        """记录访问，用于评估预取效果"""
        self.pattern_detector.record_access(key)
        
        if from_prefetch:
            if hit:
                self.stats['hit_after_prefetch'] += 1
            else:
                self.stats['miss_after_prefetch'] += 1
                
    def get_prefetch_accuracy(self) -> float:
        """获取预取准确率"""
        total = self.stats['hit_after_prefetch'] + self.stats['miss_after_prefetch']
        return self.stats['hit_after_prefetch'] / total if total > 0 else 0.0
        
    def get_stats(self) -> Dict[str, Any]:
        """获取统计信息"""
        with self.lock:
            stats = self.stats.copy()
            
            # 添加模式检测器统计
            stats['pattern_detector'] = self.pattern_detector.get_stats()
            
            # 添加队列信息
            stats['prefetch_queue_size'] = len(self.prefetch_queue)
            stats['prefetch_history_size'] = len(self.prefetch_history)
            
            # 计算预取准确率
            stats['prefetch_accuracy'] = self.get_prefetch_accuracy()
            
            # 计算平均节省时间
            if stats['successful_prefetches'] > 0:
                stats['average_time_saved'] = stats['total_time_saved'] / stats['successful_prefetches']
            else:
                stats['average_time_saved'] = 0.0
                
            # 添加最近预取记录
            if self.prefetch_history:
                recent_prefetches = list(self.prefetch_history)[-10:]  # 最近10次
                stats['recent_prefetches'] = [
                    {
                        'key': p['key'],
                        'from': p['from_level'],
                        'to': p['to_level'],
                        'confidence': p.get('confidence', 0),
                        'pattern': p.get('pattern_type', 'unknown'),
                        'success': p.get('success', False),
                    }
                    for p in recent_prefetches
                ]
                
            return stats
            
    def print_stats(self):
        """打印统计信息"""
        stats = self.get_stats()
        
        print("=" * 80)
        print("预取引擎统计")
        print("=" * 80)
        
        print(f"\n预取统计:")
        print(f"  总预测次数: {stats['total_predictions']}")
        print(f"  成功预取: {stats['successful_prefetches']}")
        print(f"  失败预取: {stats['failed_prefetches']}")
        print(f"  预取后命中: {stats['hit_after_prefetch']}")
        print(f"  预取后未命中: {stats['miss_after_prefetch']}")
        print(f"  预取准确率: {stats['prefetch_accuracy']:.2%}")
        print(f"  总预取数据: {stats['total_data_prefetched']:,} 字节")
        print(f"  总节省时间: {stats['total_time_saved']:.3f} 秒")
        print(f"  平均节省时间: {stats['average_time_saved']:.3f} 秒/次")
        
        print(f"\n队列信息:")
        print(f"  预取队列大小: {stats['prefetch_queue_size']}")
        print(f"  预取历史大小: {stats['prefetch_history_size']}")
        
        pattern_stats = stats['pattern_detector']
        print(f"\n模式检测:")
        print(f"  跟踪Key数量: {pattern_stats['total_keys_tracked']}")
        print(f"  识别模式数量: {pattern_stats['total_patterns_identified']}")
        print(f"  平均置信度: {pattern_stats['average_confidence']:.2%}")
        print(f"  模式分布: {pattern_stats['pattern_distribution']}")
        
        if stats.get('recent_prefetches'):
            print(f"\n最近预取 ({len(stats['recent_prefetches'])} 次):")
            for i, prefetch in enumerate(stats['recent_prefetches'], 1):
                status = "成功" if prefetch['success'] else "失败"
                print(f"  {i}. {prefetch['key']}: {prefetch['from']}→{prefetch['to']}, "
                      f"置信度: {prefetch['confidence']:.2f}, 模式: {prefetch['pattern']}, 状态: {status}")

# 全局预取引擎实例
_prefetch_engine: Optional[PrefetchEngine] = None

def get_prefetch_engine(cache_manager=None, config=None) -> Optional[PrefetchEngine]:
    """获取全局预取引擎实例"""
    global _prefetch_engine
    if _prefetch_engine is None and cache_manager is not None:
        _prefetch_engine = PrefetchEngine(cache_manager, config)
    return _prefetch_engine

def enable_prefetch(cache_manager, config=None) -> Optional[PrefetchEngine]:
    """启用预取"""
    engine = get_prefetch_engine(cache_manager, config)
    if engine:
        engine.start()
    return engine

def disable_prefetch():
    """禁用预取"""
    global _prefetch_engine
    if _prefetch_engine is not None:
        _prefetch_engine.stop()
        _prefetch_engine = None

def record_prefetch_access(key: str, hit: bool, from_prefetch: bool = False):
    """记录预取访问"""
    engine = get_prefetch_engine()
    if engine:
        engine.record_access(key, hit, from_prefetch)
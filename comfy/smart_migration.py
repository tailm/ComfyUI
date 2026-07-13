"""
智能数据迁移算法
为三级缓存系统提供智能的数据迁移和预取功能
"""

import torch
import time
import logging
import threading
import numpy as np
from typing import Dict, List, Optional, Tuple, Any, Deque, Set
from collections import defaultdict, deque
from enum import Enum
from dataclasses import dataclass, field
import heapq
import json
import os

logger = logging.getLogger(__name__)

class AccessPattern(Enum):
    """访问模式"""
    SEQUENTIAL = "sequential"      # 顺序访问
    RANDOM = "random"              # 随机访问
    LOOPING = "looping"            # 循环访问
    STRIDED = "strided"            # 跨步访问
    UNKNOWN = "unknown"            # 未知模式

class MigrationStrategy(Enum):
    """迁移策略"""
    CONSERVATIVE = "conservative"  # 保守：只在必要时迁移
    MODERATE = "moderate"          # 适度：平衡性能和内存
    AGGRESSIVE = "aggressive"      # 激进：最大化性能
    ADAPTIVE = "adaptive"          # 自适应：根据模式调整

@dataclass
class AccessRecord:
    """访问记录"""
    key: str
    timestamp: float
    data_size: int
    access_type: str = "read"  # read/write
    
    def __lt__(self, other):
        return self.timestamp < other.timestamp

@dataclass
class PatternInfo:
    """模式信息"""
    pattern_type: AccessPattern
    confidence: float  # 置信度 0.0-1.0
    pattern_data: Dict[str, Any]  # 模式特定数据
    last_updated: float = field(default_factory=time.time)
    
    def update(self, new_pattern: AccessPattern, confidence: float, data: Dict[str, Any]):
        """更新模式信息"""
        self.pattern_type = new_pattern
        self.confidence = confidence
        self.pattern_data = data
        self.last_updated = time.time()

class AccessPatternAnalyzer:
    """访问模式分析器"""
    
    def __init__(self, window_size: int = 100):
        self.window_size = window_size
        self.access_history: Dict[str, Deque[AccessRecord]] = defaultdict(lambda: deque(maxlen=window_size))
        self.patterns: Dict[str, PatternInfo] = {}
        self.lock = threading.RLock()
        
    def record_access(self, key: str, data_size: int, access_type: str = "read"):
        """记录访问"""
        with self.lock:
            record = AccessRecord(key, time.time(), data_size, access_type)
            self.access_history[key].append(record)
            
            # 分析访问模式
            self._analyze_pattern(key)
            
    def _analyze_pattern(self, key: str):
        """分析访问模式"""
        history = self.access_history[key]
        if len(history) < 3:  # 至少需要3次访问才能分析模式
            return
            
        # 提取时间戳
        timestamps = [r.timestamp for r in history]
        sizes = [r.data_size for r in history]
        
        # 分析时间间隔模式
        intervals = np.diff(timestamps)
        mean_interval = np.mean(intervals) if len(intervals) > 0 else 0
        std_interval = np.std(intervals) if len(intervals) > 1 else 0
        
        # 分析大小模式
        mean_size = np.mean(sizes) if sizes else 0
        std_size = np.std(sizes) if len(sizes) > 1 else 0
        
        # 判断模式类型
        pattern_type = AccessPattern.UNKNOWN
        confidence = 0.0
        pattern_data = {}
        
        # 1. 检查顺序访问（时间间隔稳定）
        if std_interval < mean_interval * 0.1 and mean_interval > 0:
            pattern_type = AccessPattern.SEQUENTIAL
            confidence = 0.8
            pattern_data = {
                'interval': mean_interval,
                'std_interval': std_interval,
                'predicted_next': timestamps[-1] + mean_interval,
            }
            
        # 2. 检查循环访问（周期性）
        elif len(timestamps) >= 5:
            # 使用自相关检测周期性
            autocorr = self._compute_autocorrelation(intervals)
            if np.max(autocorr) > 0.7:  # 强自相关
                pattern_type = AccessPattern.LOOPING
                confidence = 0.7
                pattern_data = {
                    'period': len(intervals) / 2,  # 估计周期
                    'autocorr_max': np.max(autocorr),
                }
                
        # 3. 检查跨步访问（大小变化有规律）
        elif std_size < mean_size * 0.2 and len(sizes) >= 3:
            # 检查大小是否等差或等比
            size_diffs = np.diff(sizes)
            if np.std(size_diffs) < np.mean(size_diffs) * 0.3:
                pattern_type = AccessPattern.STRIDED
                confidence = 0.6
                pattern_data = {
                    'mean_size': mean_size,
                    'stride': np.mean(size_diffs),
                }
                
        # 4. 否则为随机访问
        else:
            pattern_type = AccessPattern.RANDOM
            confidence = 0.5
            pattern_data = {
                'mean_interval': mean_interval,
                'std_interval': std_interval,
                'mean_size': mean_size,
                'std_size': std_size,
            }
            
        # 更新模式信息
        if key in self.patterns:
            old_pattern = self.patterns[key]
            # 如果新模式置信度更高，或者旧模式很久没更新，则更新
            if (confidence > old_pattern.confidence * 1.2 or 
                time.time() - old_pattern.last_updated > 300):  # 5分钟
                old_pattern.update(pattern_type, confidence, pattern_data)
        else:
            self.patterns[key] = PatternInfo(pattern_type, confidence, pattern_data)
            
    def _compute_autocorrelation(self, data: List[float]) -> np.ndarray:
        """计算自相关"""
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
        
        return autocorr[:min(n, 10)]  # 只返回前10个
        
    def get_pattern(self, key: str) -> Optional[PatternInfo]:
        """获取访问模式"""
        with self.lock:
            return self.patterns.get(key)
            
    def predict_next_access(self, key: str) -> Optional[float]:
        """预测下一次访问时间"""
        pattern = self.get_pattern(key)
        if not pattern:
            return None
            
        history = self.access_history[key]
        if not history:
            return None
            
        last_access = history[-1].timestamp
        
        if pattern.pattern_type == AccessPattern.SEQUENTIAL:
            # 顺序访问：基于固定间隔预测
            interval = pattern.pattern_data.get('interval', 0)
            if interval > 0:
                return last_access + interval
                
        elif pattern.pattern_type == AccessPattern.LOOPING:
            # 循环访问：基于周期预测
            period = pattern.pattern_data.get('period', 0)
            if period > 0:
                return last_access + period
                
        return None
        
    def get_heat_score(self, key: str, current_time: float = None) -> float:
        """计算热度分数"""
        if current_time is None:
            current_time = time.time()
            
        history = self.access_history.get(key)
        if not history:
            return 0.0
            
        # 基于最近访问计算热度
        recent_accesses = [r for r in history if current_time - r.timestamp < 300]  # 5分钟内
        
        if not recent_accesses:
            return 0.0
            
        # 计算加权热度
        total_weight = 0.0
        weighted_score = 0.0
        
        for record in recent_accesses:
            # 时间衰减权重（越近权重越高）
            time_diff = current_time - record.timestamp
            weight = 1.0 / (time_diff + 1)
            
            # 大小权重（越小权重越高）
            size_weight = 1.0 / (record.data_size / (1024 * 1024) + 1)  # MB为单位
            
            total_weight += weight
            weighted_score += weight * size_weight
            
        return weighted_score / total_weight if total_weight > 0 else 0.0
        
    def get_stats(self) -> Dict[str, Any]:
        """获取分析器统计"""
        with self.lock:
            pattern_counts = defaultdict(int)
            for pattern in self.patterns.values():
                pattern_counts[pattern.pattern_type.value] += 1
                
            return {
                'total_keys_tracked': len(self.access_history),
                'total_patterns_identified': len(self.patterns),
                'pattern_distribution': dict(pattern_counts),
                'average_confidence': np.mean([p.confidence for p in self.patterns.values()]) if self.patterns else 0.0,
            }

class SmartMigrationEngine:
    """智能迁移引擎"""
    
    def __init__(self, l1_cache, l2_cache, l3_cache, config: Optional[Dict] = None):
        self.l1_cache = l1_cache
        self.l2_cache = l2_cache
        self.l3_cache = l3_cache
        
        # 配置
        self.config = config or self._get_default_config()
        
        # 分析器
        self.pattern_analyzer = AccessPatternAnalyzer(
            window_size=self.config['analysis']['window_size']
        )
        
        # 迁移状态
        self.migration_history: Deque[Dict] = deque(maxlen=1000)
        self.pending_migrations: List[Dict] = []
        self.completed_migrations: List[Dict] = []
        
        # 性能统计
        self.stats = {
            'total_migrations': 0,
            'successful_migrations': 0,
            'failed_migrations': 0,
            'total_data_moved': 0,  # 字节
            'total_time_saved': 0.0,  # 秒
            'cache_hits_by_level': defaultdict(int),
            'cache_misses_by_level': defaultdict(int),
        }
        
        # 控制标志
        self.running = False
        self.migration_thread = None
        self.prefetch_thread = None
        self.lock = threading.RLock()
        
        # 预取预测
        self.prefetch_predictions: Dict[str, float] = {}  # key -> 预测访问时间
        
        logger.info("智能迁移引擎已初始化")
        
    def _get_default_config(self) -> Dict:
        """获取默认配置"""
        return {
            'migration': {
                'enabled': True,
                'strategy': MigrationStrategy.ADAPTIVE.value,
                'check_interval': 5.0,  # 检查间隔（秒）
                'batch_size': 10,
                'max_concurrent': 3,
                'heat_thresholds': {
                    'l1_promotion': 0.7,  # L2 -> L1的热度阈值
                    'l2_promotion': 0.5,  # L3 -> L2的热度阈值
                    'l1_demotion': 0.3,   # L1 -> L2的热度阈值
                    'l2_demotion': 0.2,   # L2 -> L3的热度阈值
                },
            },
            'prefetch': {
                'enabled': True,
                'prediction_horizon': 30.0,  # 预测时间范围（秒）
                'prefetch_ahead': 3,  # 预取提前量
                'confidence_threshold': 0.6,  # 置信度阈值
            },
            'analysis': {
                'window_size': 100,
                'update_interval': 60.0,
                'min_pattern_confidence': 0.5,
            },
            'performance': {
                'track_latency': True,
                'track_bandwidth': True,
                'adaptive_thresholds': True,
            },
        }
        
    def start(self):
        """启动迁移引擎"""
        if not self.running:
            self.running = True
            
            # 启动迁移线程
            self.migration_thread = threading.Thread(
                target=self._migration_worker,
                daemon=True,
                name="SmartMigrationWorker"
            )
            self.migration_thread.start()
            
            # 启动预取线程
            if self.config['prefetch']['enabled']:
                self.prefetch_thread = threading.Thread(
                    target=self._prefetch_worker,
                    daemon=True,
                    name="SmartPrefetchWorker"
                )
                self.prefetch_thread.start()
                
            logger.info("智能迁移引擎已启动")
            
    def stop(self):
        """停止迁移引擎"""
        self.running = False
        
        if self.migration_thread:
            self.migration_thread.join(timeout=5.0)
            
        if self.prefetch_thread:
            self.prefetch_thread.join(timeout=5.0)
            
        logger.info("智能迁移引擎已停止")
        
    def _migration_worker(self):
        """迁移工作线程"""
        while self.running:
            try:
                self._check_and_migrate()
                time.sleep(self.config['migration']['check_interval'])
            except Exception as e:
                logger.error(f"迁移工作线程错误: {e}")
                time.sleep(5.0)
                
    def _prefetch_worker(self):
        """预取工作线程"""
        while self.running:
            try:
                self._check_and_prefetch()
                time.sleep(self.config['prefetch']['prediction_horizon'] / 2)  # 每半周期检查一次
            except Exception as e:
                logger.error(f"预取工作线程错误: {e}")
                time.sleep(5.0)
                
    def _check_and_migrate(self):
        """检查并执行迁移"""
        with self.lock:
            current_time = time.time()
            
            # 获取所有缓存key
            all_keys = set()
            all_keys.update(self.l1_cache.get_keys())
            all_keys.update(self.l2_cache.get_keys())
            all_keys.update(self.l3_cache.get_keys())
            
            # 分析每个key的热度和模式
            migration_candidates = []
            
            for key in all_keys:
                # 计算热度分数
                heat_score = self.pattern_analyzer.get_heat_score(key, current_time)
                
                # 获取当前层级
                current_level = self._get_current_level(key)
                if current_level is None:
                    continue
                    
                # 获取访问模式
                pattern = self.pattern_analyzer.get_pattern(key)
                pattern_type = pattern.pattern_type if pattern else AccessPattern.UNKNOWN
                pattern_confidence = pattern.confidence if pattern else 0.0
                
                # 根据策略决定迁移
                migration_decision = self._decide_migration(
                    key, heat_score, current_level, pattern_type, pattern_confidence
                )
                
                if migration_decision:
                    migration_candidates.append({
                        'key': key,
                        'from_level': current_level,
                        'to_level': migration_decision['target_level'],
                        'priority': migration_decision['priority'],
                        'heat_score': heat_score,
                        'pattern_type': pattern_type.value,
                        'pattern_confidence': pattern_confidence,
                    })
                    
            # 按优先级排序并执行迁移
            migration_candidates.sort(key=lambda x: x['priority'], reverse=True)
            
            # 批量执行迁移
            batch_size = min(self.config['migration']['batch_size'], len(migration_candidates))
            for i in range(batch_size):
                candidate = migration_candidates[i]
                self._execute_migration(
                    candidate['key'],
                    candidate['from_level'],
                    candidate['to_level'],
                    candidate['heat_score']
                )
                
    def _decide_migration(self, key: str, heat_score: float, current_level: str,
                         pattern_type: AccessPattern, pattern_confidence: float) -> Optional[Dict]:
        """决定是否迁移以及迁移到哪个层级"""
        
        # 获取配置阈值
        thresholds = self.config['migration']['heat_thresholds']
        strategy = MigrationStrategy(self.config['migration']['strategy'])
        
        # 根据策略调整阈值
        adjusted_thresholds = self._adjust_thresholds_by_strategy(thresholds, strategy)
        
        # 根据模式调整决策
        pattern_adjustment = self._get_pattern_adjustment(pattern_type, pattern_confidence)
        
        # 决策逻辑
        target_level = None
        priority = 0.0
        
        if current_level == 'l1':
            # L1 -> L2 降级
            if heat_score < adjusted_thresholds['l1_demotion'] * pattern_adjustment:
                target_level = 'l2'
                priority = adjusted_thresholds['l1_demotion'] - heat_score
                
        elif current_level == 'l2':
            # L2 -> L1 晋升
            if heat_score > adjusted_thresholds['l1_promotion'] * pattern_adjustment:
                target_level = 'l1'
                priority = heat_score - adjusted_thresholds['l1_promotion']
            # L2 -> L3 降级
            elif heat_score < adjusted_thresholds['l2_demotion'] * pattern_adjustment:
                target_level = 'l3'
                priority = adjusted_thresholds['l2_demotion'] - heat_score
                
        elif current_level == 'l3':
            # L3 -> L2 晋升
            if heat_score > adjusted_thresholds['l2_promotion'] * pattern_adjustment:
                target_level = 'l2'
                priority = heat_score - adjusted_thresholds['l2_promotion']
                
        if target_level:
            return {
                'target_level': target_level,
                'priority': priority,
                'reason': f"heat={heat_score:.3f}, pattern={pattern_type.value}, confidence={pattern_confidence:.2f}"
            }
            
        return None
        
    def _adjust_thresholds_by_strategy(self, thresholds: Dict, strategy: MigrationStrategy) -> Dict:
        """根据策略调整阈值"""
        adjusted = thresholds.copy()
        
        if strategy == MigrationStrategy.CONSERVATIVE:
            # 保守：提高晋升阈值，降低降级阈值
            adjusted['l1_promotion'] *= 1.2
            adjusted['l2_promotion'] *= 1.2
            adjusted['l1_demotion'] *= 0.8
            adjusted['l2_demotion'] *= 0.8
            
        elif strategy == MigrationStrategy.AGGRESSIVE:
            # 激进：降低晋升阈值，提高降级阈值
            adjusted['l1_promotion'] *= 0.8
            adjusted['l2_promotion'] *= 0.8
            adjusted['l1_demotion'] *= 1.2
            adjusted['l2_demotion'] *= 1.2
            
        elif strategy == MigrationStrategy.ADAPTIVE:
            # 自适应：根据系统负载动态调整
            load_factor = self._get_system_load_factor()
            # 负载高时更保守，负载低时更激进
            if load_factor > 0.8:  # 高负载
                adjusted['l1_promotion'] *= 1.1
                adjusted['l2_promotion'] *= 1.1
                adjusted['l1_demotion'] *= 0.9
                adjusted['l2_demotion'] *= 0.9
            elif load_factor < 0.3:  # 低负载
                adjusted['l1_promotion'] *= 0.9
                adjusted['l2_promotion'] *= 0.9
                adjusted['l1_demotion'] *= 1.1
                adjusted['l2_demotion'] *= 1.1
                
        return adjusted
        
    def _get_pattern_adjustment(self, pattern_type: AccessPattern, confidence: float) -> float:
        """根据访问模式调整阈值"""
        base_adjustment = 1.0
        
        if pattern_type == AccessPattern.SEQUENTIAL:
            # 顺序访问：更容易晋升，更难降级
            base_adjustment *= 0.9  # 降低阈值
        elif pattern_type == AccessPattern.RANDOM:
            # 随机访问：更难晋升，更容易降级
            base_adjustment *= 1.1  # 提高阈值
        elif pattern_type == AccessPattern.LOOPING:
            # 循环访问：中等难度
            base_adjustment *= 1.0
        elif pattern_type == AccessPattern.STRIDED:
            # 跨步访问：根据步长调整
            base_adjustment *= 0.95
            
        # 根据置信度调整
        confidence_factor = 0.5 + confidence * 0.5  # 0.5-1.0
        return base_adjustment * confidence_factor
        
    def _get_system_load_factor(self) -> float:
        """获取系统负载因子"""
        try:
            # 获取GPU内存使用率
            if torch.cuda.is_available():
                gpu_memory = torch.cuda.memory_allocated() / torch.cuda.max_memory_allocated()
            else:
                gpu_memory = 0.0
                
            # 获取缓存使用率
            l1_usage = self.l1_cache.get_usage()
            l2_usage = self.l2_cache.get_usage()
            
            # 综合负载因子
            load_factor = max(gpu_memory, l1_usage, l2_usage * 0.5)
            return min(load_factor, 1.0)
            
        except Exception as e:
            logger.warning(f"获取系统负载因子失败: {e}")
            return 0.5
            
    def _get_current_level(self, key: str) -> Optional[str]:
        """获取数据当前所在的缓存层级"""
        if self.l1_cache.contains(key):
            return 'l1'
        elif self.l2_cache.contains(key):
            return 'l2'
        elif self.l3_cache.contains(key):
            return 'l3'
        return None
        
    def _execute_migration(self, key: str, from_level: str, to_level: str, heat_score: float):
        """执行迁移"""
        logger.debug(f"执行迁移: {key} from {from_level} to {to_level}, heat={heat_score:.3f}")
        
        start_time = time.time()
        
        try:
            # 1. 从源缓存获取数据
            if from_level == 'l1':
                data = self.l1_cache.get(key)
                source_cache = self.l1_cache
            elif from_level == 'l2':
                data = self.l2_cache.get(key)
                source_cache = self.l2_cache
            elif from_level == 'l3':
                data = self.l3_cache.get(key)
                source_cache = self.l3_cache
            else:
                logger.error(f"无效的源缓存层级: {from_level}")
                return
                
            if data is None:
                logger.warning(f"迁移失败: 源缓存中不存在key={key}")
                return
                
            # 2. 存储到目标缓存
            # 创建热度对象
            from comfy.three_level_cache import DataHeat, CacheLevel
            heat = DataHeat(key, self._estimate_size(data))
            heat.heat_score = heat_score
            
            success = False
            if to_level == 'l1':
                success = self.l1_cache.put(key, data, heat)
                target_cache = self.l1_cache
            elif to_level == 'l2':
                success = self.l2_cache.put(key, data, heat)
                target_cache = self.l2_cache
            elif to_level == 'l3':
                success = self.l3_cache.put(key, data, heat)
                target_cache = self.l3_cache
            else:
                logger.error(f"无效的目标缓存层级: {to_level}")
                return
                
            if success:
                # 3. 从源缓存移除
                source_cache.remove(key)
                
                # 4. 记录迁移历史
                migration_time = time.time() - start_time
                data_size = self._estimate_size(data)
                
                migration_record = {
                    'key': key,
                    'from_level': from_level,
                    'to_level': to_level,
                    'heat_score': heat_score,
                    'data_size': data_size,
                    'migration_time': migration_time,
                    'timestamp': time.time(),
                    'success': True,
                }
                
                self.migration_history.append(migration_record)
                self.completed_migrations.append(migration_record)
                
                # 5. 更新统计
                self.stats['total_migrations'] += 1
                self.stats['successful_migrations'] += 1
                self.stats['total_data_moved'] += data_size
                
                # 估计节省的时间（基于访问延迟差异）
                time_saved = self._estimate_time_saved(from_level, to_level, data_size)
                self.stats['total_time_saved'] += time_saved
                
                logger.info(f"迁移成功: {key} ({data_size:,} 字节) "
                          f"from {from_level} to {to_level} "
                          f"in {migration_time:.3f}s, estimated time saved: {time_saved:.3f}s")
                          
            else:
                logger.warning(f"迁移失败: 无法存储到目标缓存 {to_level}")
                migration_record = {
                    'key': key,
                    'from_level': from_level,
                    'to_level': to_level,
                    'heat_score': heat_score,
                    'timestamp': time.time(),
                    'success': False,
                    'error': 'target_cache_put_failed',
                }
                self.migration_history.append(migration_record)
                self.stats['failed_migrations'] += 1
                
        except Exception as e:
            logger.error(f"迁移执行错误: {e}")
            migration_record = {
                'key': key,
                'from_level': from_level,
                'to_level': to_level,
                'heat_score': heat_score,
                'timestamp': time.time(),
                'success': False,
                'error': str(e),
            }
            self.migration_history.append(migration_record)
            self.stats['failed_migrations'] += 1
            
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
                return len(pickle.dumps(data))
            except:
                return 1024  # 默认1KB
                
    def _estimate_time_saved(self, from_level: str, to_level: str, data_size: int) -> float:
        """估计迁移节省的时间"""
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
        
        # 总节省时间 = 延迟差异 - 传输时间（如果是降级则为负）
        time_saved_ns = latency_diff - transfer_time
        
        # 转换为秒
        return time_saved_ns / 1e9
        
    def _check_and_prefetch(self):
        """检查并执行预取"""
        if not self.config['prefetch']['enabled']:
            return
            
        current_time = time.time()
        prediction_horizon = self.config['prefetch']['prediction_horizon']
        confidence_threshold = self.config['prefetch']['confidence_threshold']
        
        # 获取所有在L2和L3中的key
        l2_keys = set(self.l2_cache.get_keys())
        l3_keys = set(self.l3_cache.get_keys())
        
        # 分析每个key的访问模式
        prefetch_candidates = []
        
        for key in l2_keys.union(l3_keys):
            pattern = self.pattern_analyzer.get_pattern(key)
            if not pattern or pattern.confidence < confidence_threshold:
                continue
                
            # 预测下一次访问时间
            next_access = self.pattern_analyzer.predict_next_access(key)
            if next_access is None:
                continue
                
            # 检查是否在预测时间范围内
            time_until_access = next_access - current_time
            if 0 < time_until_access <= prediction_horizon:
                # 计算预取优先级（越早需要，优先级越高）
                priority = 1.0 / (time_until_access + 0.001)
                
                # 获取当前层级
                current_level = self._get_current_level(key)
                if current_level is None:
                    continue
                    
                # 确定目标层级（晋升一级）
                if current_level == 'l3':
                    target_level = 'l2'
                elif current_level == 'l2':
                    target_level = 'l1'
                else:
                    continue  # 已经在L1，不需要预取
                    
                prefetch_candidates.append({
                    'key': key,
                    'current_level': current_level,
                    'target_level': target_level,
                    'predicted_time': next_access,
                    'time_until_access': time_until_access,
                    'priority': priority,
                    'pattern_type': pattern.pattern_type.value,
                    'pattern_confidence': pattern.confidence,
                })
                
        # 按优先级排序并执行预取
        prefetch_candidates.sort(key=lambda x: x['priority'], reverse=True)
        
        # 限制预取数量
        prefetch_ahead = self.config['prefetch']['prefetch_ahead']
        for i in range(min(prefetch_ahead, len(prefetch_candidates))):
            candidate = prefetch_candidates[i]
            self._execute_prefetch(
                candidate['key'],
                candidate['current_level'],
                candidate['target_level'],
                candidate['predicted_time'],
                candidate['pattern_confidence']
            )
            
    def _execute_prefetch(self, key: str, from_level: str, to_level: str, 
                         predicted_time: float, confidence: float):
        """执行预取"""
        logger.debug(f"执行预取: {key} from {from_level} to {to_level}, "
                    f"predicted in {predicted_time - time.time():.1f}s, confidence={confidence:.2f}")
        
        # 预取实际上就是提前迁移
        heat_score = 0.5 + confidence * 0.5  # 基于置信度的热度分数
        self._execute_migration(key, from_level, to_level, heat_score)
        
    def record_cache_access(self, key: str, level: str, hit: bool, data_size: int = 0):
        """记录缓存访问"""
        with self.lock:
            # 记录访问模式
            self.pattern_analyzer.record_access(key, data_size)
            
            # 更新统计
            if hit:
                self.stats['cache_hits_by_level'][level] += 1
            else:
                self.stats['cache_misses_by_level'][level] += 1
                
    def get_stats(self) -> Dict[str, Any]:
        """获取引擎统计信息"""
        with self.lock:
            stats = self.stats.copy()
            
            # 添加分析器统计
            stats['pattern_analyzer'] = self.pattern_analyzer.get_stats()
            
            # 添加迁移统计
            stats['migration_history_size'] = len(self.migration_history)
            stats['completed_migrations'] = len(self.completed_migrations)
            
            if self.completed_migrations:
                recent_migrations = list(self.completed_migrations)[-10:]  # 最近10次
                stats['recent_migrations'] = [
                    {
                        'key': m['key'],
                        'from': m['from_level'],
                        'to': m['to_level'],
                        'heat': m.get('heat_score', 0),
                        'size': m.get('data_size', 0),
                        'time': m.get('migration_time', 0),
                    }
                    for m in recent_migrations
                ]
                
            # 计算命中率
            total_hits = sum(stats['cache_hits_by_level'].values())
            total_misses = sum(stats['cache_misses_by_level'].values())
            total_access = total_hits + total_misses
            
            stats['overall_hit_rate'] = total_hits / total_access if total_access > 0 else 0.0
            stats['total_access'] = total_access
            
            # 按层级计算命中率
            for level in ['l1', 'l2', 'l3']:
                hits = stats['cache_hits_by_level'].get(level, 0)
                misses = stats['cache_misses_by_level'].get(level, 0)
                level_access = hits + misses
                stats[f'{level}_hit_rate'] = hits / level_access if level_access > 0 else 0.0
                
            return stats
            
    def print_stats(self):
        """打印统计信息"""
        stats = self.get_stats()
        
        print("=" * 80)
        print("智能迁移引擎统计")
        print("=" * 80)
        
        print(f"\n总体统计:")
        print(f"  总迁移次数: {stats['total_migrations']}")
        print(f"  成功迁移: {stats['successful_migrations']}")
        print(f"  失败迁移: {stats['failed_migrations']}")
        print(f"  总移动数据: {stats['total_data_moved']:,} 字节")
        print(f"  估计节省时间: {stats['total_time_saved']:.3f} 秒")
        
        print(f"\n缓存命中率:")
        print(f"  总体命中率: {stats['overall_hit_rate']:.2%} ({stats['total_access']} 次访问)")
        for level in ['l1', 'l2', 'l3']:
            hit_rate = stats.get(f'{level}_hit_rate', 0.0)
            hits = stats['cache_hits_by_level'].get(level, 0)
            misses = stats['cache_misses_by_level'].get(level, 0)
            print(f"  {level.upper()}命中率: {hit_rate:.2%} (命中: {hits}, 未命中: {misses})")
            
        print(f"\n访问模式分析:")
        pattern_stats = stats['pattern_analyzer']
        print(f"  跟踪Key数量: {pattern_stats['total_keys_tracked']}")
        print(f"  识别模式数量: {pattern_stats['total_patterns_identified']}")
        print(f"  平均置信度: {pattern_stats['average_confidence']:.2%}")
        print(f"  模式分布: {pattern_stats['pattern_distribution']}")
        
        if stats.get('recent_migrations'):
            print(f"\n最近迁移 ({len(stats['recent_migrations'])} 次):")
            for i, migration in enumerate(stats['recent_migrations'], 1):
                print(f"  {i}. {migration['key']}: {migration['from']}→{migration['to']}, "
                      f"热度: {migration['heat']:.3f}, 大小: {migration['size']:,} 字节")

# 全局智能迁移引擎实例
_smart_migration_engine: Optional[SmartMigrationEngine] = None

def get_smart_migration_engine(l1_cache=None, l2_cache=None, l3_cache=None, config=None) -> SmartMigrationEngine:
    """获取全局智能迁移引擎实例"""
    global _smart_migration_engine
    if _smart_migration_engine is None and all([l1_cache, l2_cache, l3_cache]):
        _smart_migration_engine = SmartMigrationEngine(l1_cache, l2_cache, l3_cache, config)
    return _smart_migration_engine

def enable_smart_migration(l1_cache, l2_cache, l3_cache, config=None) -> SmartMigrationEngine:
    """启用智能迁移"""
    engine = get_smart_migration_engine(l1_cache, l2_cache, l3_cache, config)
    if engine:
        engine.start()
    return engine

def disable_smart_migration():
    """禁用智能迁移"""
    global _smart_migration_engine
    if _smart_migration_engine is not None:
        _smart_migration_engine.stop()
        _smart_migration_engine = None
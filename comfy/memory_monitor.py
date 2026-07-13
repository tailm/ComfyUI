"""
内存性能监控和统计
提供详细的内存使用监控、性能分析和优化建议
"""

import torch
import gc
import logging
import time
import threading
import json
import psutil
import os
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from collections import defaultdict, deque
import statistics

logger = logging.getLogger(__name__)

@dataclass
class MemorySnapshot:
    """内存快照"""
    timestamp: float
    total_memory: int
    allocated_memory: int
    free_memory: int
    fragmentation_rate: float
    pool_hit_rate: float
    allocation_count: int
    deallocation_count: int
    defragmentation_count: int
    moved_bytes: int
    
    def to_dict(self) -> Dict:
        return asdict(self)

@dataclass
class PerformanceMetrics:
    """性能指标"""
    timestamp: float
    allocation_latency_avg: float  # 平均分配延迟（毫秒）
    allocation_latency_p95: float  # 95%分配延迟（毫秒）
    deallocation_latency_avg: float  # 平均释放延迟（毫秒）
    cache_hit_rate: float  # 缓存命中率
    fragmentation_rate: float  # 碎片率
    memory_usage_percent: float  # 内存使用率
    throughput_mbps: float  # 吞吐量（MB/秒）
    
    def to_dict(self) -> Dict:
        return asdict(self)

@dataclass
class OptimizationSuggestion:
    """优化建议"""
    level: str  # "low", "medium", "high"
    category: str  # "fragmentation", "allocation", "deallocation", "cache", "general"
    description: str
    recommendation: str
    expected_improvement: str  # 预期改善
    
    def to_dict(self) -> Dict:
        return asdict(self)

class MemoryMonitor:
    """
    内存性能监控器
    收集和分析内存使用数据
    """
    
    def __init__(self, memory_manager):
        self.memory_manager = memory_manager
        self.enabled = True
        self.sampling_interval = 1.0  # 采样间隔（秒）
        self.retention_period = 3600  # 数据保留时间（秒）
        
        # 数据存储
        self.snapshots: List[MemorySnapshot] = []
        self.metrics: List[PerformanceMetrics] = []
        self.suggestions: List[OptimizationSuggestion] = []
        
        # 实时统计
        self.realtime_stats = {
            "allocations": deque(maxlen=1000),  # 最近1000次分配
            "deallocations": deque(maxlen=1000),  # 最近1000次释放
            "cache_hits": 0,
            "cache_misses": 0,
            "total_allocated_bytes": 0,
            "peak_allocated_bytes": 0,
            "fragmentation_events": 0,
            "defragmentation_events": 0,
        }
        
        # 锁
        self.lock = threading.RLock()
        
        # 监控线程
        self.monitor_thread = None
        self.monitor_running = False
        
        # 性能基准
        self.baseline_metrics = None
        
        logger.info("MemoryMonitor initialized")
    
    def start(self):
        """启动监控"""
        with self.lock:
            if self.monitor_running:
                logger.warning("Monitor already running")
                return
            
            self.monitor_running = True
            self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
            self.monitor_thread.start()
            logger.info("Memory monitoring started")
    
    def stop(self):
        """停止监控"""
        with self.lock:
            self.monitor_running = False
            if self.monitor_thread:
                self.monitor_thread.join(timeout=2.0)
                self.monitor_thread = None
            logger.info("Memory monitoring stopped")
    
    def _monitor_loop(self):
        """监控循环"""
        while self.monitor_running:
            try:
                self._collect_snapshot()
                self._analyze_performance()
                self._generate_suggestions()
                time.sleep(self.sampling_interval)
            except Exception as e:
                logger.error(f"Monitor loop error: {e}")
                time.sleep(self.sampling_interval)
    
    def _collect_snapshot(self):
        """收集内存快照"""
        with self.lock:
            # 获取内存池统计
            pool_stats = self.memory_manager.get_all_stats()
            
            # 计算总体统计
            total_memory = 0
            allocated_memory = 0
            free_memory = 0
            total_fragmentation = 0.0
            total_hits = 0
            total_misses = 0
            
            for device, stats in pool_stats.items():
                total_memory += stats.get('total_memory_bytes', 0)
                allocated_memory += stats.get('allocated_memory_bytes', 0)
                free_memory += stats.get('free_memory_bytes', 0)
                total_fragmentation += stats.get('fragmentation_rate', 0.0)
                
                pool_stats_data = stats.get('stats', {})
                total_hits += pool_stats_data.get('cache_hits', 0)
                total_misses += pool_stats_data.get('cache_misses', 0)
            
            # 计算平均碎片率
            avg_fragmentation = total_fragmentation / len(pool_stats) if pool_stats else 0.0
            
            # 计算缓存命中率
            total_operations = total_hits + total_misses
            hit_rate = total_hits / total_operations if total_operations > 0 else 0.0
            
            # 创建快照
            snapshot = MemorySnapshot(
                timestamp=time.time(),
                total_memory=total_memory,
                allocated_memory=allocated_memory,
                free_memory=free_memory,
                fragmentation_rate=avg_fragmentation,
                pool_hit_rate=hit_rate,
                allocation_count=self.realtime_stats["allocations"][-1] if self.realtime_stats["allocations"] else 0,
                deallocation_count=self.realtime_stats["deallocations"][-1] if self.realtime_stats["deallocations"] else 0,
                defragmentation_count=self.realtime_stats["defragmentation_events"],
                moved_bytes=0  # 需要从defragmenter获取
            )
            
            # 保存快照
            self.snapshots.append(snapshot)
            
            # 清理旧数据
            self._cleanup_old_data()
    
    def _cleanup_old_data(self):
        """清理旧数据"""
        cutoff_time = time.time() - self.retention_period
        self.snapshots = [s for s in self.snapshots if s.timestamp >= cutoff_time]
        self.metrics = [m for m in self.metrics if m.timestamp >= cutoff_time]
    
    def _analyze_performance(self):
        """分析性能指标"""
        with self.lock:
            if len(self.snapshots) < 2:
                return
            
            # 获取最近的数据
            recent_snapshots = self.snapshots[-10:]  # 最近10个快照
            
            # 计算分配延迟（从实时统计中获取）
            allocations = list(self.realtime_stats["allocations"])
            if allocations:
                allocation_latencies = [a.get("latency_ms", 0) for a in allocations if "latency_ms" in a]
                if allocation_latencies:
                    avg_allocation_latency = statistics.mean(allocation_latencies)
                    p95_allocation_latency = statistics.quantiles(allocation_latencies, n=20)[18]  # 95th percentile
                else:
                    avg_allocation_latency = 0
                    p95_allocation_latency = 0
            else:
                avg_allocation_latency = 0
                p95_allocation_latency = 0
            
            # 计算释放延迟
            deallocations = list(self.realtime_stats["deallocations"])
            if deallocations:
                deallocation_latencies = [d.get("latency_ms", 0) for d in deallocations if "latency_ms" in d]
                if deallocation_latencies:
                    avg_deallocation_latency = statistics.mean(deallocation_latencies)
                else:
                    avg_deallocation_latency = 0
            else:
                avg_deallocation_latency = 0
            
            # 计算缓存命中率
            total_hits = self.realtime_stats["cache_hits"]
            total_misses = self.realtime_stats["cache_misses"]
            total_ops = total_hits + total_misses
            cache_hit_rate = total_hits / total_ops if total_ops > 0 else 0.0
            
            # 计算平均碎片率
            fragmentation_rates = [s.fragmentation_rate for s in recent_snapshots]
            avg_fragmentation = statistics.mean(fragmentation_rates) if fragmentation_rates else 0.0
            
            # 计算内存使用率
            memory_usage = [s.allocated_memory / s.total_memory if s.total_memory > 0 else 0 
                          for s in recent_snapshots]
            avg_memory_usage = statistics.mean(memory_usage) if memory_usage else 0.0
            
            # 计算吞吐量（MB/秒）
            if len(recent_snapshots) >= 2:
                time_diff = recent_snapshots[-1].timestamp - recent_snapshots[0].timestamp
                allocated_diff = recent_snapshots[-1].allocated_memory - recent_snapshots[0].allocated_memory
                if time_diff > 0:
                    throughput = abs(allocated_diff) / (1024 * 1024) / time_diff  # MB/秒
                else:
                    throughput = 0
            else:
                throughput = 0
            
            # 创建性能指标
            metrics = PerformanceMetrics(
                timestamp=time.time(),
                allocation_latency_avg=avg_allocation_latency,
                allocation_latency_p95=p95_allocation_latency,
                deallocation_latency_avg=avg_deallocation_latency,
                cache_hit_rate=cache_hit_rate,
                fragmentation_rate=avg_fragmentation,
                memory_usage_percent=avg_memory_usage * 100,
                throughput_mbps=throughput
            )
            
            self.metrics.append(metrics)
    
    def _generate_suggestions(self):
        """生成优化建议"""
        with self.lock:
            self.suggestions.clear()
            
            if not self.metrics:
                return
            
            # 获取最新指标
            latest_metrics = self.metrics[-1]
            
            # 检查碎片率
            if latest_metrics.fragmentation_rate > 0.4:
                self.suggestions.append(OptimizationSuggestion(
                    level="high",
                    category="fragmentation",
                    description=f"高内存碎片率 ({latest_metrics.fragmentation_rate:.2%})",
                    recommendation="启用自动碎片整理或增加整理频率",
                    expected_improvement="内存利用率提高10-20%"
                ))
            elif latest_metrics.fragmentation_rate > 0.2:
                self.suggestions.append(OptimizationSuggestion(
                    level="medium",
                    category="fragmentation",
                    description=f"中等内存碎片率 ({latest_metrics.fragmentation_rate:.2%})",
                    recommendation="考虑定期进行碎片整理",
                    expected_improvement="内存利用率提高5-10%"
                ))
            
            # 检查缓存命中率
            if latest_metrics.cache_hit_rate < 0.5:
                self.suggestions.append(OptimizationSuggestion(
                    level="high",
                    category="cache",
                    description=f"低缓存命中率 ({latest_metrics.cache_hit_rate:.2%})",
                    recommendation="增加内存池大小或调整分配策略",
                    expected_improvement="分配速度提高20-30%"
                ))
            elif latest_metrics.cache_hit_rate < 0.7:
                self.suggestions.append(OptimizationSuggestion(
                    level="medium",
                    category="cache",
                    description=f"中等缓存命中率 ({latest_metrics.cache_hit_rate:.2%})",
                    recommendation="优化内存块大小分布",
                    expected_improvement="分配速度提高10-15%"
                ))
            
            # 检查分配延迟
            if latest_metrics.allocation_latency_avg > 10:  # 10ms
                self.suggestions.append(OptimizationSuggestion(
                    level="high",
                    category="allocation",
                    description=f"高分配延迟 ({latest_metrics.allocation_latency_avg:.2f}ms)",
                    recommendation="优化内存池预分配策略",
                    expected_improvement="分配延迟降低30-50%"
                ))
            
            # 检查内存使用率
            if latest_metrics.memory_usage_percent > 90:
                self.suggestions.append(OptimizationSuggestion(
                    level="high",
                    category="general",
                    description=f"高内存使用率 ({latest_metrics.memory_usage_percent:.1f}%)",
                    recommendation="减少并发模型加载或增加可用内存",
                    expected_improvement="避免内存不足错误"
                ))
            elif latest_metrics.memory_usage_percent > 80:
                self.suggestions.append(OptimizationSuggestion(
                    level="medium",
                    category="general",
                    description=f"中等内存使用率 ({latest_metrics.memory_usage_percent:.1f}%)",
                    recommendation="监控内存使用，考虑优化模型卸载策略",
                    expected_improvement="提高系统稳定性"
                ))
    
    def record_allocation(self, size: int, latency_ms: float, cache_hit: bool):
        """记录分配操作"""
        with self.lock:
            self.realtime_stats["allocations"].append({
                "timestamp": time.time(),
                "size": size,
                "latency_ms": latency_ms,
                "cache_hit": cache_hit
            })
            
            if cache_hit:
                self.realtime_stats["cache_hits"] += 1
            else:
                self.realtime_stats["cache_misses"] += 1
            
            self.realtime_stats["total_allocated_bytes"] += size
            self.realtime_stats["peak_allocated_bytes"] = max(
                self.realtime_stats["peak_allocated_bytes"],
                self.realtime_stats["total_allocated_bytes"]
            )
    
    def record_deallocation(self, size: int, latency_ms: float):
        """记录释放操作"""
        with self.lock:
            self.realtime_stats["deallocations"].append({
                "timestamp": time.time(),
                "size": size,
                "latency_ms": latency_ms
            })
            
            self.realtime_stats["total_allocated_bytes"] -= size
    
    def record_defragmentation(self, moved_bytes: int):
        """记录碎片整理操作"""
        with self.lock:
            self.realtime_stats["defragmentation_events"] += 1
    
    def record_fragmentation(self):
        """记录碎片事件"""
        with self.lock:
            self.realtime_stats["fragmentation_events"] += 1
    
    def get_performance_report(self) -> Dict[str, Any]:
        """获取性能报告"""
        with self.lock:
            if not self.metrics:
                return {"error": "No performance data available"}
            
            latest_metrics = self.metrics[-1]
            recent_snapshots = self.snapshots[-5:] if len(self.snapshots) >= 5 else self.snapshots
            
            # 计算趋势
            trends = {
                "fragmentation_trend": "stable",
                "memory_usage_trend": "stable",
                "throughput_trend": "stable"
            }
            
            if len(self.metrics) >= 3:
                # 碎片率趋势
                frag_rates = [m.fragmentation_rate for m in self.metrics[-3:]]
                if frag_rates[2] > frag_rates[0] * 1.1:
                    trends["fragmentation_trend"] = "increasing"
                elif frag_rates[2] < frag_rates[0] * 0.9:
                    trends["fragmentation_trend"] = "decreasing"
                
                # 内存使用趋势
                usage_rates = [m.memory_usage_percent for m in self.metrics[-3:]]
                if usage_rates[2] > usage_rates[0] * 1.1:
                    trends["memory_usage_trend"] = "increasing"
                elif usage_rates[2] < usage_rates[0] * 0.9:
                    trends["memory_usage_trend"] = "decreasing"
                
                # 吞吐量趋势
                throughputs = [m.throughput_mbps for m in self.metrics[-3:]]
                if throughputs[2] > throughputs[0] * 1.1:
                    trends["throughput_trend"] = "increasing"
                elif throughputs[2] < throughputs[0] * 0.9:
                    trends["throughput_trend"] = "decreasing"
            
            # 构建报告
            report = {
                "timestamp": datetime.now().isoformat(),
                "current_metrics": latest_metrics.to_dict(),
                "recent_snapshots": [s.to_dict() for s in recent_snapshots],
                "trends": trends,
                "suggestions": [s.to_dict() for s in self.suggestions],
                "realtime_stats": {
                    "total_allocations": len(self.realtime_stats["allocations"]),
                    "total_deallocations": len(self.realtime_stats["deallocations"]),
                    "cache_hits": self.realtime_stats["cache_hits"],
                    "cache_misses": self.realtime_stats["cache_misses"],
                    "cache_hit_rate": self.realtime_stats["cache_hits"] / max(1, self.realtime_stats["cache_hits"] + self.realtime_stats["cache_misses"]),
                    "total_allocated_bytes": self.realtime_stats["total_allocated_bytes"],
                    "peak_allocated_bytes": self.realtime_stats["peak_allocated_bytes"],
                    "fragmentation_events": self.realtime_stats["fragmentation_events"],
                    "defragmentation_events": self.realtime_stats["defragmentation_events"],
                },
                "system_info": self._get_system_info()
            }
            
            return report
    
    def _get_system_info(self) -> Dict[str, Any]:
        """获取系统信息"""
        try:
            # 获取CPU信息
            cpu_percent = psutil.cpu_percent(interval=0.1)
            cpu_count = psutil.cpu_count()
            
            # 获取内存信息
            memory = psutil.virtual_memory()
            
            # 获取GPU信息（如果可用）
            gpu_info = {}
            if torch.cuda.is_available():
                for i in range(torch.cuda.device_count()):
                    gpu_info[f"cuda:{i}"] = {
                        "name": torch.cuda.get_device_name(i),
                        "memory_allocated": torch.cuda.memory_allocated(i),
                        "memory_reserved": torch.cuda.memory_reserved(i),
                        "memory_total": torch.cuda.get_device_properties(i).total_memory,
                    }
            
            return {
                "cpu_percent": cpu_percent,
                "cpu_count": cpu_count,
                "memory_total": memory.total,
                "memory_available": memory.available,
                "memory_percent": memory.percent,
                "gpu_info": gpu_info,
                "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
                "torch_version": torch.__version__,
                "platform": sys.platform,
            }
        except Exception as e:
            logger.error(f"Failed to get system info: {e}")
            return {"error": str(e)}
    
    def export_report(self, filepath: str):
        """导出报告到文件"""
        try:
            report = self.get_performance_report()
            
            # 添加历史数据
            report["history"] = {
                "snapshots": [s.to_dict() for s in self.snapshots],
                "metrics": [m.to_dict() for m in self.metrics]
            }
            
            # 保存到文件
            with open(filepath, 'w') as f:
                json.dump(report, f, indent=2, default=str)
            
            logger.info(f"Performance report exported to: {filepath}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to export report: {e}")
            return False
    
    def print_report(self):
        """打印性能报告"""
        report = self.get_performance_report()
        
        if "error" in report:
            logger.error(f"Error generating report: {report['error']}")
            return
        
        print("=" * 80)
        print("MEMORY PERFORMANCE REPORT")
        print("=" * 80)
        
        # 当前指标
        metrics = report["current_metrics"]
        print(f"\nCurrent Performance Metrics:")
        print(f"  Allocation Latency: {metrics['allocation_latency_avg']:.2f}ms (p95: {metrics['allocation_latency_p95']:.2f}ms)")
        print(f"  Deallocation Latency: {metrics['deallocation_latency_avg']:.2f}ms")
        print(f"  Cache Hit Rate: {metrics['cache_hit_rate']:.2%}")
        print(f"  Fragmentation Rate: {metrics['fragmentation_rate']:.2%}")
        print(f"  Memory Usage: {metrics['memory_usage_percent']:.1f}%")
        print(f"  Throughput: {metrics['throughput_mbps']:.2f} MB/s")
        
        # 趋势
        trends = report["trends"]
        print(f"\nTrends:")
        print(f"  Fragmentation: {trends['fragmentation_trend']}")
        print(f"  Memory Usage: {trends['memory_usage_trend']}")
        print(f"  Throughput: {trends['throughput_trend']}")
        
        # 实时统计
        stats = report["realtime_stats"]
        print(f"\nReal-time Statistics:")
        print(f"  Total Allocations: {stats['total_allocations']:,}")
        print(f"  Total Deallocations: {stats['total_deallocations']:,}")
        print(f"  Cache Hits: {stats['cache_hits']:,}")
        print(f"  Cache Misses: {stats['cache_misses']:,}")
        print(f"  Cache Hit Rate: {stats['cache_hit_rate']:.2%}")
        print(f"  Current Allocated: {stats['total_allocated_bytes']:,} bytes")
        print(f"  Peak Allocated: {stats['peak_allocated_bytes']:,} bytes")
        print(f"  Fragmentation Events: {stats['fragmentation_events']:,}")
        print(f"  Defragmentation Events: {stats['defragmentation_events']:,}")
        
        # 优化建议
        suggestions = report["suggestions"]
        if suggestions:
            print(f"\nOptimization Suggestions:")
            for i, suggestion in enumerate(suggestions, 1):
                print(f"  {i}. [{suggestion['level'].upper()}] {suggestion['category']}:")
                print(f"      {suggestion['description']}")
                print(f"      Recommendation: {suggestion['recommendation']}")
                print(f"      Expected Improvement: {suggestion['expected_improvement']}")
        else:
            print(f"\nNo optimization suggestions at this time.")
        
        # 系统信息
        sys_info = report["system_info"]
        if "error" not in sys_info:
            print(f"\nSystem Information:")
            print(f"  CPU Usage: {sys_info['cpu_percent']:.1f}% ({sys_info['cpu_count']} cores)")
            print(f"  Memory: {sys_info['memory_available']:,}/{sys_info['memory_total']:,} bytes ({sys_info['memory_percent']:.1f}% used)")
            
            if sys_info['gpu_info']:
                print(f"  GPU Information:")
                for device, info in sys_info['gpu_info'].items():
                    allocated_mb = info['memory_allocated'] / (1024 * 1024)
                    total_mb = info['memory_total'] / (1024 * 1024)
                    usage_percent = (info['memory_allocated'] / info['memory_total']) * 100
                    print(f"    {device} ({info['name']}): {allocated_mb:.1f}/{total_mb:.1f} MB ({usage_percent:.1f}%)")
        
        print("=" * 80)
    
    def reset_stats(self):
        """重置统计信息"""
        with self.lock:
            self.snapshots.clear()
            self.metrics.clear()
            self.suggestions.clear()
            
            self.realtime_stats = {
                "allocations": deque(maxlen=1000),
                "deallocations": deque(maxlen=1000),
                "cache_hits": 0,
                "cache_misses": 0,
                "total_allocated_bytes": 0,
                "peak_allocated_bytes": 0,
                "fragmentation_events": 0,
                "defragmentation_events": 0,
            }
            
            logger.info("Memory monitor statistics reset")

# 全局监控器
_memory_monitor = None

def get_memory_monitor(memory_manager=None):
    """获取或创建内存监控器"""
    global _memory_monitor
    
    if _memory_monitor is None and memory_manager is not None:
        _memory_monitor = MemoryMonitor(memory_manager)
    
    return _memory_monitor

def start_monitoring(memory_manager, interval: float = 1.0):
    """启动内存监控"""
    monitor = get_memory_monitor(memory_manager)
    if monitor:
        monitor.sampling_interval = interval
        monitor.start()

def stop_monitoring():
    """停止内存监控"""
    monitor = get_memory_monitor()
    if monitor:
        monitor.stop()

def get_performance_report() -> Dict[str, Any]:
    """获取性能报告"""
    monitor = get_memory_monitor()
    if monitor:
        return monitor.get_performance_report()
    return {"error": "Memory monitor not initialized"}

def print_performance_report():
    """打印性能报告"""
    monitor = get_memory_monitor()
    if monitor:
        monitor.print_report()
    else:
        print("Memory monitor not initialized")

def export_performance_report(filepath: str):
    """导出性能报告"""
    monitor = get_memory_monitor()
    if monitor:
        return monitor.export_report(filepath)
    return False

def record_allocation(size: int, latency_ms: float, cache_hit: bool):
    """记录分配操作"""
    monitor = get_memory_monitor()
    if monitor:
        monitor.record_allocation(size, latency_ms, cache_hit)

def record_deallocation(size: int, latency_ms: float):
    """记录释放操作"""
    monitor = get_memory_monitor()
    if monitor:
        monitor.record_deallocation(size, latency_ms)

def record_defragmentation(moved_bytes: int):
    """记录碎片整理操作"""
    monitor = get_memory_monitor()
    if monitor:
        monitor.record_defragmentation(moved_bytes)

def record_fragmentation():
    """记录碎片事件"""
    monitor = get_memory_monitor()
    if monitor:
        monitor.record_fragmentation()

# 测试函数
def test_memory_monitor():
    """测试内存监控器"""
    import sys
    
    # 配置日志
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    
    print("Testing memory monitor...")
    
    # 创建模拟内存管理器
    class MockMemoryManager:
        def get_all_stats(self):
            return {
                "cuda:0": {
                    "total_memory_bytes": 1024 * 1024 * 1024,  # 1GB
                    "allocated_memory_bytes": 512 * 1024 * 1024,  # 512MB
                    "free_memory_bytes": 512 * 1024 * 1024,  # 512MB
                    "fragmentation_rate": 0.25,
                    "stats": {
                        "cache_hits": 100,
                        "cache_misses": 50,
                    }
                }
            }
    
    # 创建监控器
    memory_manager = MockMemoryManager()
    monitor = MemoryMonitor(memory_manager)
    
    # 记录一些操作
    monitor.record_allocation(1024 * 1024, 1.5, True)  # 1MB, 1.5ms, cache hit
    monitor.record_allocation(2048 * 1024, 2.1, False)  # 2MB, 2.1ms, cache miss
    monitor.record_deallocation(1024 * 1024, 0.8)  # 1MB, 0.8ms
    monitor.record_defragmentation(512 * 1024)  # 512KB moved
    monitor.record_fragmentation()
    
    # 收集快照
    monitor._collect_snapshot()
    monitor._analyze_performance()
    monitor._generate_suggestions()
    
    # 打印报告
    monitor.print_report()
    
    # 导出报告
    import tempfile
    import os
    temp_file = os.path.join(tempfile.gettempdir(), "memory_report.json")
    if monitor.export_report(temp_file):
        print(f"\nReport exported to: {temp_file}")
    
    # 清理
    monitor.stop()
    
    print("\nTest completed!")

if __name__ == "__main__":
    test_memory_monitor()
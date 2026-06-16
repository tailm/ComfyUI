#!/usr/bin/env python3
"""
实时GPU内存清理模块
在模型调用完成后立即清理GPU内存，不影响后续模型调用
"""

import torch
import gc
import time
import threading
import logging
from typing import Dict, List, Optional, Callable
from dataclasses import dataclass, field
from enum import Enum

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CleanupStrategy(Enum):
    """清理策略"""
    AGGRESSIVE = "aggressive"      # 激进清理，立即释放所有可能的内存
    BALANCED = "balanced"          # 平衡清理，保留一些缓存以提高性能
    CONSERVATIVE = "conservative"  # 保守清理，只在必要时清理

@dataclass
class MemoryStats:
    """内存统计信息"""
    allocated: int = 0          # 已分配内存（字节）
    reserved: int = 0           # 保留内存（字节）
    cached: int = 0             # 缓存内存（字节）
    max_allocated: int = 0      # 最大已分配内存（字节）
    allocation_count: int = 0   # 分配次数
    
    @property
    def allocated_gb(self) -> float:
        return self.allocated / (1024 ** 3)
    
    @property
    def reserved_gb(self) -> float:
        return self.reserved / (1024 ** 3)
    
    @property
    def cached_gb(self) -> float:
        return self.cached / (1024 ** 3)

class RealtimeGPUCleaner:
    """
    实时GPU内存清理器
    监控和清理GPU内存，确保模型调用后立即释放内存
    """
    
    def __init__(self, 
                 device: str = "cuda:0",
                 cleanup_strategy: CleanupStrategy = CleanupStrategy.BALANCED,
                 threshold_percent: float = 70.0,
                 cleanup_interval: float = 1.0):
        """
        初始化清理器
        
        Args:
            device: GPU设备
            cleanup_strategy: 清理策略
            threshold_percent: 清理阈值百分比（当内存使用超过此值时触发清理）
            cleanup_interval: 清理间隔（秒）
        """
        self.device = torch.device(device) if isinstance(device, str) else device
        self.strategy = cleanup_strategy
        self.threshold_percent = threshold_percent
        self.cleanup_interval = cleanup_interval
        
        # 内存统计
        self.stats = MemoryStats()
        self.history: List[MemoryStats] = []
        self.max_history_size = 100
        
        # 清理线程控制
        self._cleanup_thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()
        self._lock = threading.RLock()
        
        # 回调函数
        self._before_cleanup_callbacks: List[Callable] = []
        self._after_cleanup_callbacks: List[Callable] = []
        
        # 检查CUDA是否可用
        if not torch.cuda.is_available():
            logger.warning(f"CUDA不可用，设备 {self.device} 将使用CPU模式")
            self.device = torch.device("cpu")
    
    def start(self) -> None:
        """启动实时清理线程"""
        if self._cleanup_thread is not None and self._cleanup_thread.is_alive():
            logger.warning("清理线程已在运行")
            return
        
        self._stop_event.clear()
        self._cleanup_thread = threading.Thread(
            target=self._cleanup_loop,
            name="GPU-Cleaner-Thread",
            daemon=True
        )
        self._cleanup_thread.start()
        logger.info(f"启动GPU内存清理线程，策略: {self.strategy.value}, 阈值: {self.threshold_percent}%")
    
    def stop(self) -> None:
        """停止清理线程"""
        self._stop_event.set()
        if self._cleanup_thread is not None:
            self._cleanup_thread.join(timeout=5.0)
            self._cleanup_thread = None
        logger.info("GPU内存清理线程已停止")
    
    def _cleanup_loop(self) -> None:
        """清理循环"""
        logger.info("GPU内存清理循环开始")
        
        while not self._stop_event.is_set():
            try:
                # 更新内存统计
                self._update_stats()
                
                # 检查是否需要清理
                if self._should_cleanup():
                    self.cleanup()
                
                # 记录历史
                self._record_history()
                
                # 等待下一个清理周期
                time.sleep(self.cleanup_interval)
                
            except Exception as e:
                logger.error(f"清理循环出错: {e}")
                time.sleep(self.cleanup_interval)
        
        logger.info("GPU内存清理循环结束")
    
    def _update_stats(self) -> None:
        """更新内存统计"""
        with self._lock:
            if torch.cuda.is_available():
                self.stats.allocated = torch.cuda.memory_allocated(self.device)
                self.stats.reserved = torch.cuda.memory_reserved(self.device)
                
                # 更新最大分配值
                if self.stats.allocated > self.stats.max_allocated:
                    self.stats.max_allocated = self.stats.allocated
    
    def _should_cleanup(self) -> bool:
        """检查是否需要清理"""
        if not torch.cuda.is_available():
            return False
        
        # 获取总内存和已使用内存
        total_memory = torch.cuda.get_device_properties(self.device).total_memory
        used_memory = self.stats.allocated
        
        # 计算使用百分比
        usage_percent = (used_memory / total_memory) * 100
        
        # 根据策略决定是否清理
        if self.strategy == CleanupStrategy.AGGRESSIVE:
            # 激进策略：使用超过50%就清理
            return usage_percent > 50.0
        elif self.strategy == CleanupStrategy.BALANCED:
            # 平衡策略：使用超过阈值或分配次数过多
            return usage_percent > self.threshold_percent or self.stats.allocation_count > 1000
        else:  # CONSERVATIVE
            # 保守策略：使用超过90%才清理
            return usage_percent > 90.0
    
    def cleanup(self, aggressive: bool = False) -> Dict[str, float]:
        """
        执行GPU内存清理
        
        Args:
            aggressive: 是否执行激进清理
            
        Returns:
            清理统计信息
        """
        logger.info("开始GPU内存清理...")
        
        # 调用清理前回调
        for callback in self._before_cleanup_callbacks:
            try:
                callback()
            except Exception as e:
                logger.warning(f"清理前回调执行失败: {e}")
        
        # 记录清理前状态
        before_allocated = torch.cuda.memory_allocated(self.device) if torch.cuda.is_available() else 0
        before_reserved = torch.cuda.memory_reserved(self.device) if torch.cuda.is_available() else 0
        
        # 执行清理步骤
        steps = []
        
        # 步骤1: Python垃圾回收
        steps.append(("Python GC", self._run_garbage_collection))
        
        # 步骤2: PyTorch缓存清理
        steps.append(("PyTorch Cache", self._clear_pytorch_cache))
        
        # 步骤3: 激进清理（如果启用）
        if aggressive:
            steps.append(("Aggressive Cleanup", self._aggressive_cleanup))
        
        # 执行所有清理步骤
        results = {}
        for step_name, step_func in steps:
            try:
                freed = step_func()
                results[step_name] = freed
                logger.debug(f"{step_name}: 释放了 {freed/1024**3:.2f} GB")
            except Exception as e:
                logger.warning(f"{step_name} 失败: {e}")
                results[step_name] = 0
        
        # 记录清理后状态
        after_allocated = torch.cuda.memory_allocated(self.device) if torch.cuda.is_available() else 0
        after_reserved = torch.cuda.memory_reserved(self.device) if torch.cuda.is_available() else 0
        
        # 计算释放的内存
        allocated_freed = before_allocated - after_allocated
        reserved_freed = before_reserved - after_reserved
        
        # 更新统计
        with self._lock:
            self.stats.allocation_count = 0
        
        # 调用清理后回调
        for callback in self._after_cleanup_callbacks:
            try:
                callback()
            except Exception as e:
                logger.warning(f"清理后回调执行失败: {e}")
        
        # 记录结果
        total_freed = allocated_freed + reserved_freed
        logger.info(f"GPU内存清理完成，释放了 {total_freed/1024**3:.2f} GB")
        
        return {
            "allocated_freed_gb": allocated_freed / (1024 ** 3),
            "reserved_freed_gb": reserved_freed / (1024 ** 3),
            "total_freed_gb": total_freed / (1024 ** 3),
            "steps": results
        }
    
    def _run_garbage_collection(self) -> int:
        """执行Python垃圾回收"""
        before = torch.cuda.memory_allocated(self.device) if torch.cuda.is_available() else 0
        collected = gc.collect()
        after = torch.cuda.memory_allocated(self.device) if torch.cuda.is_available() else 0
        return before - after
    
    def _clear_pytorch_cache(self) -> int:
        """清理PyTorch缓存"""
        if not torch.cuda.is_available():
            return 0
        
        before = torch.cuda.memory_allocated(self.device)
        torch.cuda.empty_cache()
        torch.cuda.synchronize()
        after = torch.cuda.memory_allocated(self.device)
        return before - after
    
    def _aggressive_cleanup(self) -> int:
        """执行激进清理"""
        if not torch.cuda.is_available():
            return 0
        
        before = torch.cuda.memory_allocated(self.device)
        
        # 重置内存统计
        torch.cuda.reset_peak_memory_stats(self.device)
        torch.cuda.reset_accumulated_memory_stats(self.device)
        
        # 清理IPC缓存
        torch.cuda.ipc_collect()
        
        after = torch.cuda.memory_allocated(self.device)
        return before - after
    
    def _record_history(self) -> None:
        """记录内存使用历史"""
        with self._lock:
            # 创建当前状态的副本
            current_stats = MemoryStats(
                allocated=self.stats.allocated,
                reserved=self.stats.reserved,
                cached=self.stats.cached,
                max_allocated=self.stats.max_allocated,
                allocation_count=self.stats.allocation_count
            )
            
            self.history.append(current_stats)
            
            # 保持历史记录大小
            if len(self.history) > self.max_history_size:
                self.history.pop(0)
    
    def get_memory_info(self) -> Dict:
        """获取内存信息"""
        if not torch.cuda.is_available():
            return {"error": "CUDA not available"}
        
        with self._lock:
            total = torch.cuda.get_device_properties(self.device).total_memory
            allocated = self.stats.allocated
            reserved = self.stats.reserved
            
            return {
                "device": str(self.device),
                "total_memory_gb": total / (1024 ** 3),
                "allocated_memory_gb": allocated / (1024 ** 3),
                "reserved_memory_gb": reserved / (1024 ** 3),
                "usage_percent": (allocated / total) * 100 if total > 0 else 0,
                "max_allocated_gb": self.stats.max_allocated / (1024 ** 3),
                "allocation_count": self.stats.allocation_count,
                "history_size": len(self.history),
                "cleanup_strategy": self.strategy.value,
                "threshold_percent": self.threshold_percent
            }
    
    def register_before_cleanup_callback(self, callback: Callable) -> None:
        """注册清理前回调"""
        self._before_cleanup_callbacks.append(callback)
    
    def register_after_cleanup_callback(self, callback: Callable) -> None:
        """注册清理后回调"""
        self._after_cleanup_callbacks.append(callback)
    
    def force_cleanup(self) -> Dict[str, float]:
        """强制立即清理"""
        return self.cleanup(aggressive=True)
    
    def __enter__(self):
        """上下文管理器入口"""
        self.start()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """上下文管理器出口"""
        self.stop()

# 全局清理器实例
_global_cleaner: Optional[RealtimeGPUCleaner] = None

def get_global_cleaner() -> RealtimeGPUCleaner:
    """获取全局清理器实例"""
    global _global_cleaner
    if _global_cleaner is None:
        _global_cleaner = RealtimeGPUCleaner()
    return _global_cleaner

def init_cleaner(device: str = "cuda:0", 
                 strategy: str = "balanced",
                 threshold: float = 70.0,
                 interval: float = 1.0) -> RealtimeGPUCleaner:
    """
    初始化全局清理器
    
    Args:
        device: GPU设备
        strategy: 清理策略 ("aggressive", "balanced", "conservative")
        threshold: 清理阈值百分比
        interval: 清理间隔（秒）
    
    Returns:
        清理器实例
    """
    global _global_cleaner
    
    # 解析策略
    strategy_map = {
        "aggressive": CleanupStrategy.AGGRESSIVE,
        "balanced": CleanupStrategy.BALANCED,
        "conservative": CleanupStrategy.CONSERVATIVE
    }
    
    cleanup_strategy = strategy_map.get(strategy.lower(), CleanupStrategy.BALANCED)
    
    _global_cleaner = RealtimeGPUCleaner(
        device=device,
        cleanup_strategy=cleanup_strategy,
        threshold_percent=threshold,
        cleanup_interval=interval
    )
    
    return _global_cleaner

def cleanup_after_model() -> Dict[str, float]:
    """
    模型调用后立即清理的便捷函数
    应该在每个模型调用完成后调用
    """
    cleaner = get_global_cleaner()
    return cleaner.cleanup()

def get_memory_status() -> Dict:
    """获取内存状态"""
    cleaner = get_global_cleaner()
    return cleaner.get_memory_info()

# 命令行接口
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="实时GPU内存清理工具")
    parser.add_argument("--start", action="store_true", help="启动清理线程")
    parser.add_argument("--stop", action="store_true", help="停止清理线程")
    parser.add_argument("--cleanup", action="store_true", help="执行一次清理")
    parser.add_argument("--force", action="store_true", help="强制激进清理")
    parser.add_argument("--status", action="store_true", help="显示内存状态")
    parser.add_argument("--monitor", action="store_true", help="监控内存使用")
    parser.add_argument("--interval", type=float, default=2.0, help="监控间隔（秒）")
    parser.add_argument("--duration", type=int, default=60, help="监控持续时间（秒）")
    parser.add_argument("--strategy", choices=["aggressive", "balanced", "conservative"], 
                       default="balanced", help="清理策略")
    parser.add_argument("--threshold", type=float, default=70.0, help="清理阈值百分比")
    
    args = parser.parse_args()
    
    # 初始化清理器
    cleaner = init_cleaner(strategy=args.strategy, threshold=args.threshold)
    
    if args.start:
        cleaner.start()
        print("✅ 清理线程已启动")
    
    elif args.stop:
        cleaner.stop()
        print("✅ 清理线程已停止")
    
    elif args.cleanup:
        result = cleaner.cleanup(aggressive=args.force)
        print(f"✅ 清理完成，释放了 {result['total_freed_gb']:.2f} GB")
        for step, freed in result["steps"].items():
            print(f"  {step}: {freed/1024**3:.2f} GB")
    
    elif args.status:
        info = cleaner.get_memory_info()
        if "error" in info:
            print(f"❌ {info['error']}")
        else:
            print("📊 GPU内存状态:")
            print(f"  设备: {info['device']}")
            print(f"  总内存: {info['total_memory_gb']:.2f} GB")
            print(f"  已分配: {info['allocated_memory_gb']:.2f} GB")
            print(f"  已保留: {info['reserved_memory_gb']:.2f} GB")
            print(f"  使用率: {info['usage_percent']:.1f}%")
            print(f"  最大分配: {info['max_allocated_gb']:.2f} GB")
            print(f"  分配次数: {info['allocation_count']}")
            print(f"  清理策略: {info['cleanup_strategy']}")
            print(f"  清理阈值: {info['threshold_percent']}%")
    
    elif args.monitor:
        print(f"🔍 监控GPU内存使用（每{args.interval}秒一次，共{args.duration}秒）")
        print("-" * 60)
        
        import time
        start_time = time.time()
        
        while time.time() - start_time < args.duration:
            info = cleaner.get_memory_info()
            if "error" not in info:
                timestamp = time.strftime("%H:%M:%S")
                print(f"[{timestamp}] 已分配: {info['allocated_memory_gb']:.2f}GB | "
                      f"使用率: {info['usage_percent']:.1f}% | "
                      f"策略: {info['cleanup_strategy']}")
            
            time.sleep(args.interval)
        
        print("-" * 60)
        print("监控结束")
    
    else:
        parser.print_help()
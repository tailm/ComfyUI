"""
增强的内存管理模块
将智能内存池集成到ComfyUI的内存管理系统中
"""

import torch
import gc
import logging
import time
from typing import Optional, Dict, Any
import threading

# 导入原有内存管理模块
import comfy.model_management as mm
from comfy.model_management import *

# 导入智能内存池
from .memory_pool import memory_manager, SmartMemoryManager

logger = logging.getLogger(__name__)

# 全局配置
ENABLE_SMART_MEMORY = True  # 是否启用智能内存管理
MEMORY_POOL_ENABLED = True  # 是否启用内存池
DEFRAGMENTATION_ENABLED = True  # 是否启用碎片整理
MONITORING_ENABLED = True  # 是否启用监控

# 监控线程
_monitor_thread = None
_monitor_running = False
_monitor_interval = 5.0  # 监控间隔（秒）

def enable_smart_memory(enabled: bool = True):
    """启用或禁用智能内存管理"""
    global ENABLE_SMART_MEMORY
    ENABLE_SMART_MEMORY = enabled
    logger.info(f"Smart memory management {'enabled' if enabled else 'disabled'}")

def enable_memory_pool(enabled: bool = True):
    """启用或禁用内存池"""
    global MEMORY_POOL_ENABLED
    MEMORY_POOL_ENABLED = enabled
    memory_manager.enabled = enabled
    logger.info(f"Memory pool {'enabled' if enabled else 'disabled'}")

def enable_defragmentation(enabled: bool = True):
    """启用或禁用碎片整理"""
    global DEFRAGMENTATION_ENABLED
    DEFRAGMENTATION_ENABLED = enabled
    logger.info(f"Defragmentation {'enabled' if enabled else 'disabled'}")

def enable_monitoring(enabled: bool = True, interval: float = 5.0):
    """启用或禁用内存监控"""
    global MONITORING_ENABLED, _monitor_interval
    MONITORING_ENABLED = enabled
    _monitor_interval = interval
    
    if enabled:
        memory_manager.enable_monitoring(interval)
        start_monitoring()
    else:
        memory_manager.disable_monitoring()
        stop_monitoring()
    
    logger.info(f"Memory monitoring {'enabled' if enabled else 'disabled'} (interval: {interval}s)")

def _monitor_worker():
    """监控工作线程"""
    global _monitor_running
    while _monitor_running:
        try:
            memory_manager.monitor()
            time.sleep(_monitor_interval)
        except Exception as e:
            logger.error(f"Memory monitor error: {e}")
            time.sleep(_monitor_interval)

def start_monitoring():
    """启动内存监控"""
    global _monitor_thread, _monitor_running
    
    if not MONITORING_ENABLED:
        return
    
    if _monitor_thread is None or not _monitor_thread.is_alive():
        _monitor_running = True
        _monitor_thread = threading.Thread(target=_monitor_worker, daemon=True)
        _monitor_thread.start()
        logger.info("Memory monitoring started")

def stop_monitoring():
    """停止内存监控"""
    global _monitor_running
    _monitor_running = False
    logger.info("Memory monitoring stopped")

# 包装原有的内存分配函数
_original_empty_cache = None
_original_unload_all_models = None
_original_get_free_memory = None
_original_get_total_memory = None

def wrap_memory_functions():
    """包装原有的内存管理函数"""
    global _original_empty_cache, _original_unload_all_models
    global _original_get_free_memory, _original_get_total_memory
    
    # 保存原有函数
    _original_empty_cache = mm.soft_empty_cache
    _original_unload_all_models = mm.unload_all_models
    _original_get_free_memory = mm.get_free_memory
    _original_get_total_memory = mm.get_total_memory
    
    logger.info("Memory management functions wrapped")

def enhanced_soft_empty_cache(force: bool = False):
    """
    增强的内存清理函数
    结合智能内存池和原有清理逻辑
    """
    if not ENABLE_SMART_MEMORY:
        return _original_empty_cache(force)
    
    logger.info("Enhanced memory cleanup started")
    
    # 1. 使用智能内存池整理碎片
    if DEFRAGMENTATION_ENABLED:
        memory_manager.defragment_all()
    
    # 2. 打印内存统计
    if MONITORING_ENABLED:
        memory_manager.print_all_stats()
    
    # 3. 调用原有清理逻辑
    result = _original_empty_cache(force)
    
    # 4. 清理内存池中的碎片
    if MEMORY_POOL_ENABLED:
        # 这里可以添加额外的内存池清理逻辑
        pass
    
    logger.info("Enhanced memory cleanup completed")
    return result

def enhanced_unload_all_models():
    """
    增强的模型卸载函数
    结合智能内存池和原有卸载逻辑
    """
    if not ENABLE_SMART_MEMORY:
        _original_unload_all_models()
        return
    
    logger.info("Enhanced model unloading started")
    
    # 1. 调用原有卸载逻辑
    _original_unload_all_models()
    
    # 2. 整理内存碎片
    if DEFRAGMENTATION_ENABLED:
        memory_manager.defragment_all()
    
    # 3. 清理内存池
    if MEMORY_POOL_ENABLED:
        # 可以添加特定的模型卸载后清理逻辑
        pass
    
    logger.info("Enhanced model unloading completed")

def enhanced_get_free_memory(dev=None, torch_free_too=False):
    """
    增强的获取空闲内存函数
    考虑内存池中的空闲块
    """
    if not ENABLE_SMART_MEMORY or not MEMORY_POOL_ENABLED:
        return _original_get_free_memory(dev, torch_free_too)
    
    # 获取原有空闲内存
    original_result = _original_get_free_memory(dev, torch_free_too)
    
    # 获取内存池中的空闲内存
    pool_free = 0
    device = dev or get_torch_device()
    device_str = str(device)
    
    if device_str in memory_manager.pools:
        stats = memory_manager.pools[device_str].get_stats()
        pool_free = stats['free_memory_bytes']
    
    # 处理返回值
    if torch_free_too:
        # 返回元组 (total_free, torch_free)
        original_total, original_torch = original_result
        total_free = original_total + pool_free
        torch_free = original_torch + pool_free
        
        logger.debug(f"Enhanced free memory: original_total={original_total:,}, original_torch={original_torch:,}, "
                     f"pool={pool_free:,}, total={total_free:,}, torch={torch_free:,}")
        return (total_free, torch_free)
    else:
        # 返回单个值
        total_free = original_result + pool_free
        logger.debug(f"Enhanced free memory: original={original_result:,}, pool={pool_free:,}, total={total_free:,}")
        return total_free

def enhanced_get_total_memory(dev=None, torch_total_too=False):
    """
    增强的获取总内存函数
    考虑内存池管理的内存
    """
    if not ENABLE_SMART_MEMORY or not MEMORY_POOL_ENABLED:
        return _original_get_total_memory(dev, torch_total_too)
    
    # 获取原有总内存
    original_result = _original_get_total_memory(dev, torch_total_too)
    
    # 获取内存池管理的总内存
    pool_total = 0
    device = dev or get_torch_device()
    device_str = str(device)
    
    if device_str in memory_manager.pools:
        stats = memory_manager.pools[device_str].get_stats()
        pool_total = stats['total_memory_bytes']
    
    # 处理返回值
    if torch_total_too:
        # 返回元组 (total_memory, torch_total)
        original_total, original_torch = original_result
        total_memory = max(original_total, pool_total)
        torch_total = max(original_torch, pool_total)
        
        logger.debug(f"Enhanced total memory: original_total={original_total:,}, original_torch={original_torch:,}, "
                     f"pool={pool_total:,}, total={total_memory:,}, torch={torch_total:,}")
        return (total_memory, torch_total)
    else:
        # 返回单个值
        total_memory = max(original_result, pool_total)
        logger.debug(f"Enhanced total memory: original={original_result:,}, pool={pool_total:,}, total={total_memory:,}")
        return total_memory

# 增强的Tensor分配函数
def allocate_tensor(size: int, dtype=torch.float32, device=None, pin_memory=False):
    """
    增强的Tensor分配函数
    使用智能内存池进行分配
    """
    if not ENABLE_SMART_MEMORY or not MEMORY_POOL_ENABLED:
        # 回退到原有分配方式
        return torch.empty(size, dtype=dtype, device=device or get_torch_device(),
                          pin_memory=pin_memory)
    
    # 计算字节大小
    element_size = torch.tensor([], dtype=dtype).element_size()
    bytes_needed = size * element_size
    
    # 使用内存池分配
    tensor = memory_manager.allocate(bytes_needed, device, pin_memory)
    
    if tensor is None:
        # 内存池分配失败，回退到原有方式
        logger.warning(f"Memory pool allocation failed for {bytes_needed:,} bytes, falling back to direct allocation")
        return torch.empty(size, dtype=dtype, device=device or get_torch_device(),
                          pin_memory=pin_memory)
    
    # 调整形状和数据类型
    if dtype != torch.float32:
        tensor = tensor.view(dtype)
    
    if size != tensor.numel():
        tensor = tensor.view(size)
    
    return tensor

def free_tensor(tensor: torch.Tensor):
    """
    增强的Tensor释放函数
    使用智能内存池进行释放
    """
    if not ENABLE_SMART_MEMORY or not MEMORY_POOL_ENABLED:
        # 直接删除
        device_type = tensor.device.type
        del tensor
        gc.collect()
        if device_type == 'cuda':
            torch.cuda.empty_cache()
        return True
    
    return memory_manager.free(tensor)

def defragment_memory():
    """整理内存碎片（便捷函数）"""
    if not ENABLE_SMART_MEMORY or not DEFRAGMENTATION_ENABLED:
        return False
    
    return memory_manager.defragment_all()

# 模型patcher增强
def enhance_model_patcher():
    """
    增强ModelPatcher的内存管理
    """
    try:
        from comfy.model_patcher import ModelPatcher
        
        # 保存原有方法
        original_load_model = getattr(ModelPatcher, 'load_model', None)
        original_unload_model = getattr(ModelPatcher, 'unload_model', None)
        
        if original_load_model:
            def enhanced_load_model(self, *args, **kwargs):
                """增强的模型加载方法"""
                logger.debug(f"Enhanced model loading for {self.__class__.__name__}")
                
                # 记录加载前内存状态
                if MONITORING_ENABLED:
                    device = getattr(self, 'load_device', get_torch_device())
                    stats_before = memory_manager.get_pool(device).get_stats()
                
                # 调用原有加载方法
                result = original_load_model(self, *args, **kwargs)
                
                # 记录加载后内存状态
                if MONITORING_ENABLED:
                    stats_after = memory_manager.get_pool(device).get_stats()
                    allocated_diff = stats_after['allocated_memory_bytes'] - stats_before['allocated_memory_bytes']
                    logger.debug(f"Model loaded, allocated {allocated_diff:,} bytes")
                
                return result
            
            # 替换方法
            ModelPatcher.load_model = enhanced_load_model
        
        if original_unload_model:
            def enhanced_unload_model(self, *args, **kwargs):
                """增强的模型卸载方法"""
                logger.debug(f"Enhanced model unloading for {self.__class__.__name__}")
                
                # 记录卸载前内存状态
                if MONITORING_ENABLED:
                    device = getattr(self, 'load_device', get_torch_device())
                    stats_before = memory_manager.get_pool(device).get_stats()
                
                # 调用原有卸载方法
                result = original_unload_model(self, *args, **kwargs)
                
                # 记录卸载后内存状态
                if MONITORING_ENABLED:
                    stats_after = memory_manager.get_pool(device).get_stats()
                    freed_diff = stats_before['allocated_memory_bytes'] - stats_after['allocated_memory_bytes']
                    logger.debug(f"Model unloaded, freed {freed_diff:,} bytes")
                
                # 触发碎片整理
                if DEFRAGMENTATION_ENABLED:
                    memory_manager.defragment_all()
                
                return result
            
            # 替换方法
            ModelPatcher.unload_model = enhanced_unload_model
        
        logger.info("ModelPatcher memory management enhanced")
        
    except ImportError as e:
        logger.warning(f"Could not enhance ModelPatcher: {e}")

# 初始化函数
def initialize():
    """初始化增强的内存管理"""
    global _original_empty_cache, _original_unload_all_models
    
    # 包装原有函数
    wrap_memory_functions()
    
    # 替换函数
    mm.soft_empty_cache = enhanced_soft_empty_cache
    mm.unload_all_models = enhanced_unload_all_models
    mm.get_free_memory = enhanced_get_free_memory
    mm.get_total_memory = enhanced_get_total_memory
    
    # 增强ModelPatcher
    enhance_model_patcher()
    
    # 启动监控
    if MONITORING_ENABLED:
        start_monitoring()
    
    logger.info("Enhanced memory management initialized")
    
    # 打印初始状态
    print_memory_status()

def print_memory_status():
    """打印内存状态"""
    if not ENABLE_SMART_MEMORY:
        return
    
    logger.info("=" * 60)
    logger.info("Enhanced Memory Management Status")
    logger.info(f"  Smart Memory: {'ENABLED' if ENABLE_SMART_MEMORY else 'DISABLED'}")
    logger.info(f"  Memory Pool: {'ENABLED' if MEMORY_POOL_ENABLED else 'DISABLED'}")
    logger.info(f"  Defragmentation: {'ENABLED' if DEFRAGMENTATION_ENABLED else 'DISABLED'}")
    logger.info(f"  Monitoring: {'ENABLED' if MONITORING_ENABLED else 'DISABLED'}")
    
    # 打印各设备内存池状态
    for device_str, pool in memory_manager.pools.items():
        stats = pool.get_stats()
        logger.info(f"  {pool.name}: {stats['allocated_memory_bytes']:,}/{stats['total_memory_bytes']:,} bytes "
                   f"({stats['memory_usage_percent']:.1f}% used), "
                   f"fragmentation: {stats['fragmentation_rate']:.2%}")
    
    logger.info("=" * 60)

def get_memory_usage_report() -> Dict[str, Any]:
    """获取内存使用报告"""
    report = {
        "enabled": ENABLE_SMART_MEMORY,
        "memory_pool_enabled": MEMORY_POOL_ENABLED,
        "defragmentation_enabled": DEFRAGMENTATION_ENABLED,
        "monitoring_enabled": MONITORING_ENABLED,
        "pools": {},
        "total_allocated": 0,
        "total_free": 0,
        "total_fragmentation": 0.0,
    }
    
    if ENABLE_SMART_MEMORY:
        for device_str, pool in memory_manager.pools.items():
            stats = pool.get_stats()
            report["pools"][device_str] = stats
            report["total_allocated"] += stats["allocated_memory_bytes"]
            report["total_free"] += stats["free_memory_bytes"]
            report["total_fragmentation"] += stats["fragmentation_rate"]
        
        if memory_manager.pools:
            report["total_fragmentation"] /= len(memory_manager.pools)
    
    return report

# 导出函数
__all__ = [
    'enable_smart_memory',
    'enable_memory_pool',
    'enable_defragmentation',
    'enable_monitoring',
    'allocate_tensor',
    'free_tensor',
    'initialize',
    'print_memory_status',
    'get_memory_usage_report',
    'memory_manager',
    'enhanced_soft_empty_cache',
    'enhanced_unload_all_models',
    'enhanced_get_free_memory',
    'enhanced_get_total_memory',
    'defragment_memory',  # 添加这个
]

# 自动初始化
try:
    initialize()
except Exception as e:
    logger.error(f"Failed to initialize enhanced memory management: {e}")

# 测试函数
def test_enhanced_memory():
    """测试增强的内存管理"""
    import sys
    
    # 配置日志
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    
    print("Testing enhanced memory management...")
    
    # 启用所有功能
    enable_smart_memory(True)
    enable_memory_pool(True)
    enable_defragmentation(True)
    enable_monitoring(True, interval=2.0)
    
    # 打印状态
    print_memory_status()
    
    # 测试分配
    print("\nTesting tensor allocation...")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # 分配一些Tensor
    tensors = []
    sizes = [1024, 2048, 4096, 8192]  # 元素数量
    
    for i, size in enumerate(sizes):
        tensor = allocate_tensor(size, device=device)
        if tensor is not None:
            tensors.append(tensor)
            print(f"  Allocated tensor {i}: shape={tensor.shape}, dtype={tensor.dtype}, device={tensor.device}")
        else:
            print(f"  Failed to allocate tensor {i}")
    
    # 打印内存状态
    print("\nMemory status after allocation:")
    memory_manager.print_all_stats()
    
    # 释放部分Tensor
    print("\nReleasing some tensors...")
    for i, tensor in enumerate(tensors[:2]):
        if free_tensor(tensor):
            print(f"  Freed tensor {i}")
    
    # 打印内存状态
    print("\nMemory status after deallocation:")
    memory_manager.print_all_stats()
    
    # 测试碎片整理
    print("\nTesting defragmentation...")
    memory_manager.defragment_all()
    
    # 获取报告
    print("\nMemory usage report:")
    report = get_memory_usage_report()
    print(f"  Total allocated: {report['total_allocated']:,} bytes")
    print(f"  Total free: {report['total_free']:,} bytes")
    print(f"  Average fragmentation: {report['total_fragmentation']:.2%}")
    
    # 清理
    for tensor in tensors[2:]:
        free_tensor(tensor)
    
    print("\nTest completed!")

if __name__ == "__main__":
    test_enhanced_memory()
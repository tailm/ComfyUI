"""
三级缓存系统集成模块
将三级缓存系统集成到ComfyUI现有内存优化系统中
"""

import torch
import logging
import time
import threading
from typing import Dict, List, Optional, Any, Union, Callable
from dataclasses import dataclass, field

from .three_level_cache import (
    ThreeLevelCacheManager, CacheLevel, get_three_level_cache_manager,
    enable_three_level_cache, disable_three_level_cache,
    cache_get, cache_put, cache_remove, cache_contains, cache_clear, cache_stats, print_cache_stats
)
from .smart_migration import (
    SmartMigrationEngine, AccessPattern, MigrationStrategy,
    get_smart_migration_engine, enable_smart_migration, disable_smart_migration
)
from .prefetch_engine import (
    PrefetchEngine, PrefetchStrategy,
    get_prefetch_engine, enable_prefetch, disable_prefetch, record_prefetch_access
)
from .cache_level import (
    CacheConfig, EvictionPolicy, create_cache,
    get_default_l1_config, get_default_l2_config, get_default_l3_config
)

logger = logging.getLogger(__name__)

@dataclass
class CacheIntegrationConfig:
    """缓存集成配置"""
    # 三级缓存配置
    enable_three_level_cache: bool = True
    l1_max_size: int = 4 * 1024**3  # 4GB
    l2_max_size: int = 16 * 1024**3  # 16GB
    l3_max_size: int = 100 * 1024**3  # 100GB
    l3_storage_path: str = "./cache/l3"
    
    # 智能迁移配置
    enable_smart_migration: bool = True
    migration_strategy: MigrationStrategy = MigrationStrategy.ADAPTIVE
    migration_check_interval: float = 5.0  # 秒
    migration_batch_size: int = 10
    
    # 预取配置
    enable_prefetch: bool = True
    prefetch_strategy: PrefetchStrategy = PrefetchStrategy.ADAPTIVE
    prefetch_prediction_horizon: float = 30.0  # 秒
    prefetch_ahead: int = 3
    
    # 性能监控
    enable_monitoring: bool = True
    stats_log_interval: float = 60.0  # 秒
    detailed_logging: bool = False
    
    # 与现有系统集成
    integrate_with_memory_pool: bool = True
    integrate_with_model_cache: bool = True
    replace_existing_cache: bool = False

class CacheIntegrationManager:
    """缓存集成管理器"""
    
    def __init__(self, config: Optional[CacheIntegrationConfig] = None):
        self.config = config or CacheIntegrationConfig()
        self.cache_manager: Optional[ThreeLevelCacheManager] = None
        self.migration_engine: Optional[SmartMigrationEngine] = None
        self.prefetch_engine: Optional[PrefetchEngine] = None
        self.monitoring_thread = None
        self.running = False
        
        # 性能统计
        self.stats = {
            'total_requests': 0,
            'cache_hits': 0,
            'cache_misses': 0,
            'l1_hits': 0,
            'l2_hits': 0,
            'l3_hits': 0,
            'migrations': 0,
            'prefetches': 0,
            'total_latency_saved': 0.0,  # 秒
            'start_time': time.time(),
        }
        
        logger.info("缓存集成管理器已初始化")
        
    def start(self):
        """启动缓存集成系统"""
        if self.running:
            logger.warning("缓存集成系统已经在运行")
            return
            
        try:
            # 1. 初始化三级缓存管理器
            if self.config.enable_three_level_cache:
                cache_config = {
                    'l1_cache': {
                        'enabled': True,
                        'max_size': self.config.l1_max_size,
                        'device': 'cuda' if torch.cuda.is_available() else 'cpu',
                        'eviction_policy': 'lru',
                    },
                    'l2_cache': {
                        'enabled': True,
                        'max_size': self.config.l2_max_size,
                        'compression': True,
                        'compression_level': 6,
                    },
                    'l3_cache': {
                        'enabled': True,
                        'storage_path': self.config.l3_storage_path,
                        'max_size': self.config.l3_max_size,
                        'compression': True,
                        'encryption': False,
                        'persistent': True,
                    },
                    'migration': {
                        'enabled': self.config.enable_smart_migration,
                        'check_interval': self.config.migration_check_interval,
                        'batch_size': self.config.migration_batch_size,
                    },
                    'prefetch': {
                        'enabled': self.config.enable_prefetch,
                        'prediction_horizon': self.config.prefetch_prediction_horizon,
                        'prefetch_ahead': self.config.prefetch_ahead,
                    },
                }
                
                self.cache_manager = enable_three_level_cache(cache_config)
                logger.info("三级缓存管理器已启动")
                
                # 2. 初始化智能迁移引擎
                if self.config.enable_smart_migration and self.cache_manager:
                    migration_config = {
                        'migration': {
                            'enabled': True,
                            'strategy': self.config.migration_strategy.value,
                            'check_interval': self.config.migration_check_interval,
                            'batch_size': self.config.migration_batch_size,
                        },
                        'prefetch': {
                            'enabled': self.config.enable_prefetch,
                            'prediction_horizon': self.config.prefetch_prediction_horizon,
                            'prefetch_ahead': self.config.prefetch_ahead,
                        },
                    }
                    
                    self.migration_engine = enable_smart_migration(
                        self.cache_manager.l1_cache,
                        self.cache_manager.l2_cache,
                        self.cache_manager.l3_cache,
                        migration_config
                    )
                    logger.info("智能迁移引擎已启动")
                    
                # 3. 初始化预取引擎
                if self.config.enable_prefetch and self.cache_manager:
                    prefetch_config = {
                        'enabled': True,
                        'strategy': self.config.prefetch_strategy.value,
                        'prediction_horizon': self.config.prefetch_prediction_horizon,
                        'prefetch_ahead': self.config.prefetch_ahead,
                    }
                    
                    self.prefetch_engine = enable_prefetch(self.cache_manager, prefetch_config)
                    logger.info("预取引擎已启动")
                    
            # 4. 启动性能监控
            if self.config.enable_monitoring:
                self._start_monitoring()
                
            # 5. 与现有系统集成
            if self.config.integrate_with_memory_pool:
                self._integrate_with_memory_pool()
                
            if self.config.integrate_with_model_cache:
                self._integrate_with_model_cache()
                
            self.running = True
            logger.info("缓存集成系统已启动")
            
        except Exception as e:
            logger.error(f"启动缓存集成系统失败: {e}")
            self.stop()
            raise
            
    def stop(self):
        """停止缓存集成系统"""
        if not self.running:
            return
            
        # 停止性能监控
        if self.monitoring_thread:
            self.running = False
            self.monitoring_thread.join(timeout=5.0)
            
        # 停止预取引擎
        if self.prefetch_engine:
            disable_prefetch()
            
        # 停止迁移引擎
        if self.migration_engine:
            disable_smart_migration()
            
        # 停止缓存管理器
        if self.cache_manager:
            disable_three_level_cache()
            
        self.running = False
        logger.info("缓存集成系统已停止")
        
    def _start_monitoring(self):
        """启动性能监控"""
        def monitoring_worker():
            while self.running:
                try:
                    self._log_stats()
                    time.sleep(self.config.stats_log_interval)
                except Exception as e:
                    logger.error(f"性能监控错误: {e}")
                    time.sleep(10.0)
                    
        self.monitoring_thread = threading.Thread(
            target=monitoring_worker,
            daemon=True,
            name="CacheMonitoring"
        )
        self.monitoring_thread.start()
        
    def _log_stats(self):
        """记录性能统计"""
        if not self.cache_manager:
            return
            
        # 获取缓存统计
        cache_stats = cache_stats()
        
        # 计算命中率
        total_hits = cache_stats['l1_cache']['hit_count'] + \
                    cache_stats['l2_cache']['hit_count'] + \
                    cache_stats['l3_cache']['hit_count']
        total_misses = cache_stats['l1_cache']['miss_count'] + \
                      cache_stats['l2_cache']['miss_count'] + \
                      cache_stats['l3_cache']['miss_count']
        total_access = total_hits + total_misses
        hit_rate = total_hits / total_access if total_access > 0 else 0.0
        
        # 计算节省时间
        runtime = time.time() - self.stats['start_time']
        
        log_message = (
            f"缓存统计 - 运行时间: {runtime:.1f}s, "
            f"总访问: {total_access}, "
            f"命中率: {hit_rate:.2%}, "
            f"L1使用: {cache_stats['l1_cache']['usage_percent']:.1%}, "
            f"L2使用: {cache_stats['l2_cache']['usage_percent']:.1%}, "
            f"L3使用: {cache_stats['l3_cache']['usage_percent']:.1%}"
        )
        
        if self.config.detailed_logging:
            log_message += (
                f"\n  L1命中: {cache_stats['l1_cache']['hit_count']}, "
                f"L2命中: {cache_stats['l2_cache']['hit_count']}, "
                f"L3命中: {cache_stats['l3_cache']['hit_count']}, "
                f"迁移次数: {cache_stats.get('migration_engine', {}).get('total_migrations', 0)}"
            )
            
        logger.info(log_message)
        
    def _integrate_with_memory_pool(self):
        """与内存池集成"""
        try:
            # 导入内存池模块
            from .memory_pool import MemoryPool, get_memory_pool
            
            # 获取全局内存池实例
            memory_pool = get_memory_pool()
            if not memory_pool:
                logger.warning("内存池未初始化，跳过集成")
                return
                
            # 创建缓存感知的内存分配器
            original_allocate = memory_pool.allocate
            original_free = memory_pool.free
            
            def cache_aware_allocate(size: int, pin_memory: bool = False):
                """缓存感知的内存分配"""
                # 首先尝试从缓存中获取
                cache_key = f"memory_pool_block_{size}_{pin_memory}"
                cached_data = cache_get(cache_key)
                
                if cached_data is not None:
                    # 更新统计
                    self.stats['cache_hits'] += 1
                    self.stats['l1_hits'] += 1  # 假设在L1中
                    logger.debug(f"内存池缓存命中: key={cache_key}, size={size}")
                    return cached_data
                    
                # 缓存未命中，使用原始分配
                self.stats['cache_misses'] += 1
                result = original_allocate(size, pin_memory)
                
                # 将结果存入缓存
                if result is not None:
                    cache_put(cache_key, result, CacheLevel.L1)
                    
                return result
                
            def cache_aware_free(tensor: torch.Tensor):
                """缓存感知的内存释放"""
                # 首先尝试将tensor存入缓存
                if tensor is not None:
                    cache_key = f"memory_pool_tensor_{tensor.shape}_{tensor.dtype}"
                    cache_put(cache_key, tensor, CacheLevel.L2)
                    
                # 调用原始释放
                return original_free(tensor)
                
            # 替换内存池方法
            memory_pool.allocate = cache_aware_allocate
            memory_pool.free = cache_aware_free
            
            logger.info("内存池集成完成")
            
        except ImportError as e:
            logger.warning(f"无法导入内存池模块: {e}")
        except Exception as e:
            logger.error(f"内存池集成失败: {e}")
            
    def _integrate_with_model_cache(self):
        """与模型缓存集成"""
        try:
            # 尝试导入ComfyUI的模型缓存模块
            import sys
            import os
            
            # 添加ComfyUI路径
            comfy_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            if comfy_path not in sys.path:
                sys.path.insert(0, comfy_path)
                
            # 尝试导入模型管理模块
            try:
                from comfy import model_management
                logger.info("找到ComfyUI模型管理模块")
                
                # 包装模型加载函数
                original_load_model = getattr(model_management, 'load_model', None)
                if original_load_model:
                    def cache_aware_load_model(*args, **kwargs):
                        """缓存感知的模型加载"""
                        # 生成缓存key
                        import hashlib
                        key_parts = []
                        for arg in args:
                            key_parts.append(str(arg))
                        for k, v in sorted(kwargs.items()):
                            key_parts.append(f"{k}={v}")
                        cache_key = hashlib.md5("|".join(key_parts).encode()).hexdigest()
                        
                        # 尝试从缓存获取
                        cached_model = cache_get(cache_key)
                        if cached_model is not None:
                            self.stats['cache_hits'] += 1
                            logger.debug(f"模型缓存命中: key={cache_key}")
                            return cached_model
                            
                        # 缓存未命中，加载模型
                        self.stats['cache_misses'] += 1
                        model = original_load_model(*args, **kwargs)
                        
                        # 将模型存入缓存
                        if model is not None:
                            # 估算模型大小
                            model_size = self._estimate_model_size(model)
                            if model_size < self.config.l2_max_size:  # 只缓存适合L2的模型
                                cache_put(cache_key, model, CacheLevel.L2)
                                
                        return model
                        
                    # 替换函数
                    setattr(model_management, 'load_model', cache_aware_load_model)
                    logger.info("模型加载函数已集成缓存")
                    
            except ImportError:
                logger.warning("未找到ComfyUI模型管理模块，跳过模型缓存集成")
                
        except Exception as e:
            logger.error(f"模型缓存集成失败: {e}")
            
    def _estimate_model_size(self, model) -> int:
        """估算模型大小"""
        try:
            if hasattr(model, 'parameters'):
                # 计算所有参数的总大小
                total_params = sum(p.numel() for p in model.parameters())
                # 假设每个参数4字节（float32）
                return total_params * 4
            else:
                # 尝试序列化估算
                import pickle
                return len(pickle.dumps(model))
        except:
            return 0
            
    def get(self, key: str) -> Optional[Any]:
        """从缓存获取数据"""
        self.stats['total_requests'] += 1
        
        if not self.cache_manager:
            return None
            
        start_time = time.time()
        result = self.cache_manager.get(key)
        access_time = time.time() - start_time
        
        # 记录访问统计
        if result is not None:
            self.stats['cache_hits'] += 1
            # 确定命中层级
            if self.cache_manager.l1_cache.contains(key):
                self.stats['l1_hits'] += 1
            elif self.cache_manager.l2_cache.contains(key):
                self.stats['l2_hits'] += 1
            elif self.cache_manager.l3_cache.contains(key):
                self.stats['l3_hits'] += 1
                
            # 记录预取访问
            if self.prefetch_engine:
                record_prefetch_access(key, True, False)
        else:
            self.stats['cache_misses'] += 1
            
        # 记录迁移引擎访问
        if self.migration_engine:
            # 估算数据大小用于热度跟踪
            data_size = self._estimate_data_size(result) if result else 0
            # 这里需要调用迁移引擎的记录方法
            # 由于smart_migration模块没有暴露record_access方法，我们暂时跳过
            
        return result
        
    def put(self, key: str, value: Any, level: Optional[CacheLevel] = None) -> bool:
        """存储数据到缓存"""
        if not self.cache_manager:
            return False
            
        # 估算数据大小
        data_size = self._estimate_data_size(value)
        
        # 根据数据大小自动选择层级
        if level is None:
            if data_size < 1024 * 1024:  # < 1MB
                level = CacheLevel.L1
            elif data_size < 100 * 1024 * 1024:  # < 100MB
                level = CacheLevel.L2
            else:
                level = CacheLevel.L3
                
        success = self.cache_manager.put(key, value, level)
        
        if success and self.prefetch_engine:
            # 记录数据存储，用于模式分析
            record_prefetch_access(key, False, False)
            
        return success
        
    def _estimate_data_size(self, data: Any) -> int:
        """估算数据大小"""
        if isinstance(data, torch.Tensor):
            return data.numel() * data.element_size()
        elif isinstance(data, (list, tuple)):
            return sum(self._estimate_data_size(item) for item in data)
        elif isinstance(data, dict):
            return sum(self._estimate_data_size(v) for v in data.values())
        else:
            try:
                import pickle
                return len(pickle.dumps(data))
            except:
                return 1024  # 默认1KB
                
    def remove(self, key: str) -> bool:
        """从缓存移除数据"""
        if not self.cache_manager:
            return False
        return self.cache_manager.remove(key)
        
    def contains(self, key: str) -> bool:
        """检查缓存是否包含数据"""
        if not self.cache_manager:
            return False
        return self.cache_manager.contains(key)
        
    def clear(self):
        """清空缓存"""
        if self.cache_manager:
            self.cache_manager.clear()
            
    def get_stats(self) -> Dict[str, Any]:
        """获取统计信息"""
        stats = self.stats.copy()
        
        # 添加缓存统计
        if self.cache_manager:
            cache_stats = self.cache_manager.get_stats()
            stats.update({
                'cache_stats': cache_stats,
                'overall_hit_rate': cache_stats.get('overall_hit_rate', 0.0),
                'total_cache_size': cache_stats.get('total_size', 0),
                'total_cache_keys': cache_stats.get('total_keys', 0),
            })
            
        # 添加迁移引擎统计
        if self.migration_engine:
            migration_stats = self.migration_engine.get_stats()
            stats['migration_stats'] = migration_stats
            stats['total_migrations'] = migration_stats.get('total_migrations', 0)
            stats['migration_success_rate'] = (
                migration_stats.get('successful_migrations', 0) / 
                migration_stats.get('total_migrations', 1) 
                if migration_stats.get('total_migrations', 0) > 0 else 0.0
            )
            
        # 添加预取引擎统计
        if self.prefetch_engine:
            prefetch_stats = self.prefetch_engine.get_stats()
            stats['prefetch_stats'] = prefetch_stats
            stats['prefetch_accuracy'] = prefetch_stats.get('prefetch_accuracy', 0.0)
            stats['total_prefetches'] = prefetch_stats.get('successful_prefetches', 0)
            
        # 计算运行时间
        stats['runtime_seconds'] = time.time() - stats['start_time']
        
        # 计算请求速率
        if stats['runtime_seconds'] > 0:
            stats['requests_per_second'] = stats['total_requests'] / stats['runtime_seconds']
        else:
            stats['requests_per_second'] = 0.0
            
        # 计算各层级命中率
        total_hits = stats['l1_hits'] + stats['l2_hits'] + stats['l3_hits']
        if total_hits > 0:
            stats['l1_hit_ratio'] = stats['l1_hits'] / total_hits
            stats['l2_hit_ratio'] = stats['l2_hits'] / total_hits
            stats['l3_hit_ratio'] = stats['l3_hits'] / total_hits
        else:
            stats['l1_hit_ratio'] = 0.0
            stats['l2_hit_ratio'] = 0.0
            stats['l3_hit_ratio'] = 0.0
            
        return stats
        
    def print_stats(self):
        """打印统计信息"""
        stats = self.get_stats()
        
        print("=" * 80)
        print("缓存集成系统统计")
        print("=" * 80)
        
        print(f"\n请求统计:")
        print(f"  总请求数: {stats['total_requests']}")
        print(f"  缓存命中: {stats['cache_hits']}")
        print(f"  缓存未命中: {stats['cache_misses']}")
        print(f"  总体命中率: {stats.get('overall_hit_rate', 0):.2%}")
        print(f"  请求速率: {stats.get('requests_per_second', 0):.1f} 请求/秒")
        
        print(f"\n层级命中分布:")
        print(f"  L1命中: {stats['l1_hits']} ({stats.get('l1_hit_ratio', 0):.1%})")
        print(f"  L2命中: {stats['l2_hits']} ({stats.get('l2_hit_ratio', 0):.1%})")
        print(f"  L3命中: {stats['l3_hits']} ({stats.get('l3_hit_ratio', 0):.1%})")
        
        if 'migration_stats' in stats:
            migration_stats = stats['migration_stats']
            print(f"\n迁移统计:")
            print(f"  总迁移次数: {migration_stats.get('total_migrations', 0)}")
            print(f"  成功迁移: {migration_stats.get('successful_migrations', 0)}")
            print(f"  迁移成功率: {stats.get('migration_success_rate', 0):.2%}")
            print(f"  总移动数据: {migration_stats.get('total_data_moved', 0):,} 字节")
            print(f"  总节省时间: {migration_stats.get('total_time_saved', 0):.3f} 秒")
            
        if 'prefetch_stats' in stats:
            prefetch_stats = stats['prefetch_stats']
            print(f"\n预取统计:")
            print(f"  总预取次数: {prefetch_stats.get('successful_prefetches', 0)}")
            print(f"  预取准确率: {prefetch_stats.get('prefetch_accuracy', 0):.2%}")
            print(f"  预取后命中: {prefetch_stats.get('hit_after_prefetch', 0)}")
            print(f"  预取后未命中: {prefetch_stats.get('miss_after_prefetch', 0)}")
            
        if 'cache_stats' in stats:
            cache_stats = stats['cache_stats']
            print(f"\n缓存使用情况:")
            print(f"  总缓存大小: {cache_stats.get('total_size', 0):,} 字节")
            print(f"  总Key数量: {cache_stats.get('total_keys', 0)}")
            print(f"  L1使用率: {cache_stats.get('l1_cache', {}).get('usage_percent', 0):.1%}")
            print(f"  L2使用率: {cache_stats.get('l2_cache', {}).get('usage_percent', 0):.1%}")
            print(f"  L3使用率: {cache_stats.get('l3_cache', {}).get('usage_percent', 0):.1%}")

# 全局缓存集成管理器实例
_cache_integration_manager: Optional[CacheIntegrationManager] = None

def get_cache_integration_manager(config: Optional[CacheIntegrationConfig] = None) -> CacheIntegrationManager:
    """获取全局缓存集成管理器实例"""
    global _cache_integration_manager
    if _cache_integration_manager is None:
        _cache_integration_manager = CacheIntegrationManager(config)
    return _cache_integration_manager

def enable_cache_integration(config: Optional[CacheIntegrationConfig] = None) -> CacheIntegrationManager:
    """启用缓存集成"""
    manager = get_cache_integration_manager(config)
    manager.start()
    return manager

def disable_cache_integration():
    """禁用缓存集成"""
    global _cache_integration_manager
    if _cache_integration_manager is not None:
        _cache_integration_manager.stop()
        _cache_integration_manager = None

# 便捷函数
def integrated_cache_get(key: str) -> Optional[Any]:
    """集成缓存获取"""
    manager = get_cache_integration_manager()
    return manager.get(key) if manager else None

def integrated_cache_put(key: str, value: Any, level: Optional[CacheLevel] = None) -> bool:
    """集成缓存存储"""
    manager = get_cache_integration_manager()
    return manager.put(key, value, level) if manager else False

def integrated_cache_remove(key: str) -> bool:
    """集成缓存移除"""
    manager = get_cache_integration_manager()
    return manager.remove(key) if manager else False

def integrated_cache_contains(key: str) -> bool:
    """集成缓存检查"""
    manager = get_cache_integration_manager()
    return manager.contains(key) if manager else False

def integrated_cache_clear():
    """集成缓存清空"""
    manager = get_cache_integration_manager()
    if manager:
        manager.clear()

def integrated_cache_stats() -> Dict[str, Any]:
    """获取集成缓存统计"""
    manager = get_cache_integration_manager()
    return manager.get_stats() if manager else {}

def print_integrated_cache_stats():
    """打印集成缓存统计"""
    manager = get_cache_integration_manager()
    if manager:
        manager.print_stats()
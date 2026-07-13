"""
多级缓存优化示例
为ComfyUI提供智能缓存系统，提高缓存命中率
"""

import torch
import hashlib
import pickle
import time
import logging
import os
from typing import Any, Dict, Optional, Tuple, List
from dataclasses import dataclass
from enum import Enum
import threading
from collections import OrderedDict
import json

logger = logging.getLogger(__name__)

class CacheLevel(Enum):
    L1 = "l1"  # GPU内存缓存（最快，容量最小）
    L2 = "l2"  # 系统内存缓存（中等）
    L3 = "l3"  # 磁盘缓存（最慢，容量最大）

@dataclass
class CacheItem:
    """缓存项"""
    key: str
    value: Any
    size: int
    access_count: int = 0
    last_access: float = 0
    creation_time: float = 0
    level: CacheLevel = CacheLevel.L1
    
    def __post_init__(self):
        if self.creation_time == 0:
            self.creation_time = time.time()
        self.last_access = self.creation_time
    
    def access(self):
        """记录访问"""
        self.access_count += 1
        self.last_access = time.time()
        return self.value

class LRUCache:
    """LRU缓存实现"""
    
    def __init__(self, max_size: int, name: str = "cache"):
        self.max_size = max_size
        self.name = name
        self.cache: OrderedDict[str, CacheItem] = OrderedDict()
        self.current_size = 0
        self.hits = 0
        self.misses = 0
        self.lock = threading.RLock()
    
    def get(self, key: str) -> Optional[Any]:
        """获取缓存项"""
        with self.lock:
            if key in self.cache:
                item = self.cache[key]
                # 移动到最近使用位置
                self.cache.move_to_end(key)
                item.access()
                self.hits += 1
                logger.debug(f"{self.name} cache hit: {key}")
                return item.value
            self.misses += 1
            logger.debug(f"{self.name} cache miss: {key}")
            return None
    
    def put(self, key: str, value: Any, size: int, level: CacheLevel = CacheLevel.L1) -> bool:
        """添加缓存项"""
        with self.lock:
            # 如果已存在，更新
            if key in self.cache:
                old_item = self.cache[key]
                self.current_size -= old_item.size
                self.cache.move_to_end(key)
            
            # 创建新缓存项
            item = CacheItem(key=key, value=value, size=size, level=level)
            
            # 检查空间，必要时淘汰旧项
            while self.current_size + size > self.max_size and self.cache:
                self._evict_one()
            
            # 添加新项
            self.cache[key] = item
            self.current_size += size
            logger.debug(f"{self.name} cache put: {key} ({size} bytes)")
            return True
    
    def _evict_one(self):
        """淘汰一个缓存项（LRU策略）"""
        if not self.cache:
            return
        
        # 淘汰最久未使用的项
        key, item = self.cache.popitem(last=False)
        self.current_size -= item.size
        logger.debug(f"{self.name} cache evicted: {key} ({item.size} bytes)")
    
    def remove(self, key: str) -> bool:
        """移除缓存项"""
        with self.lock:
            if key in self.cache:
                item = self.cache.pop(key)
                self.current_size -= item.size
                logger.debug(f"{self.name} cache removed: {key}")
                return True
            return False
    
    def clear(self):
        """清空缓存"""
        with self.lock:
            self.cache.clear()
            self.current_size = 0
            logger.info(f"{self.name} cache cleared")
    
    def get_stats(self) -> Dict:
        """获取缓存统计信息"""
        with self.lock:
            total_access = self.hits + self.misses
            hit_rate = self.hits / total_access if total_access > 0 else 0
            
            return {
                "name": self.name,
                "max_size": self.max_size,
                "current_size": self.current_size,
                "usage_percent": (self.current_size / self.max_size * 100) if self.max_size > 0 else 0,
                "item_count": len(self.cache),
                "hits": self.hits,
                "misses": self.misses,
                "hit_rate": hit_rate,
                "avg_item_size": self.current_size / len(self.cache) if self.cache else 0
            }

class DiskCache:
    """磁盘缓存实现"""
    
    def __init__(self, cache_dir: str, max_size: int):
        self.cache_dir = cache_dir
        self.max_size = max_size
        self.current_size = 0
        self.metadata_file = os.path.join(cache_dir, "metadata.json")
        self.metadata: Dict[str, Dict] = {}
        self.hits = 0
        self.misses = 0
        self.lock = threading.RLock()
        
        # 创建缓存目录
        os.makedirs(cache_dir, exist_ok=True)
        
        # 加载元数据
        self._load_metadata()
    
    def _load_metadata(self):
        """加载元数据"""
        if os.path.exists(self.metadata_file):
            try:
                with open(self.metadata_file, 'r') as f:
                    self.metadata = json.load(f)
                # 计算当前大小
                self.current_size = sum(item["size"] for item in self.metadata.values())
                logger.info(f"Loaded disk cache metadata: {len(self.metadata)} items, {self.current_size:,} bytes")
            except Exception as e:
                logger.error(f"Failed to load cache metadata: {e}")
                self.metadata = {}
                self.current_size = 0
    
    def _save_metadata(self):
        """保存元数据"""
        try:
            with open(self.metadata_file, 'w') as f:
                json.dump(self.metadata, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save cache metadata: {e}")
    
    def _get_cache_path(self, key: str) -> str:
        """获取缓存文件路径"""
        # 使用哈希前2位作为目录名，减少单个目录文件数
        hash_key = hashlib.md5(key.encode()).hexdigest()
        subdir = hash_key[:2]
        dir_path = os.path.join(self.cache_dir, subdir)
        os.makedirs(dir_path, exist_ok=True)
        return os.path.join(dir_path, f"{hash_key}.cache")
    
    def get(self, key: str) -> Optional[Any]:
        """从磁盘获取缓存项"""
        with self.lock:
            if key not in self.metadata:
                self.misses += 1
                return None
            
            cache_path = self._get_cache_path(key)
            if not os.path.exists(cache_path):
                # 文件不存在，从元数据中移除
                del self.metadata[key]
                self._save_metadata()
                self.misses += 1
                return None
            
            try:
                with open(cache_path, 'rb') as f:
                    data = pickle.load(f)
                
                # 更新访问统计
                self.metadata[key]["last_access"] = time.time()
                self.metadata[key]["access_count"] = self.metadata[key].get("access_count", 0) + 1
                self._save_metadata()
                
                self.hits += 1
                logger.debug(f"Disk cache hit: {key}")
                return data
            except Exception as e:
                logger.error(f"Failed to read cache file {cache_path}: {e}")
                self.misses += 1
                return None
    
    def put(self, key: str, value: Any, size: int) -> bool:
        """保存到磁盘缓存"""
        with self.lock:
            # 检查空间，必要时清理
            while self.current_size + size > self.max_size and self.metadata:
                self._evict_one()
            
            cache_path = self._get_cache_path(key)
            try:
                # 保存数据
                with open(cache_path, 'wb') as f:
                    pickle.dump(value, f, protocol=pickle.HIGHEST_PROTOCOL)
                
                # 更新元数据
                self.metadata[key] = {
                    "size": size,
                    "path": cache_path,
                    "creation_time": time.time(),
                    "last_access": time.time(),
                    "access_count": 1
                }
                self.current_size += size
                self._save_metadata()
                
                logger.debug(f"Disk cache put: {key} ({size} bytes)")
                return True
            except Exception as e:
                logger.error(f"Failed to write cache file {cache_path}: {e}")
                return False
    
    def _evict_one(self):
        """淘汰一个缓存项（基于访问频率和大小）"""
        if not self.metadata:
            return
        
        # 计算淘汰分数（访问频率低、创建时间早、文件大的优先淘汰）
        now = time.time()
        candidates = []
        
        for key, info in self.metadata.items():
            # 分数 = 文件大小 * (1 / 访问次数) * (现在 - 最后访问时间)
            access_count = max(info.get("access_count", 1), 1)
            last_access = info.get("last_access", info.get("creation_time", now))
            age = now - last_access
            
            # 标准化分数
            score = info["size"] * (1.0 / access_count) * (age / 3600)  # 年龄按小时计算
            
            candidates.append((score, key, info))
        
        # 淘汰分数最高的项
        candidates.sort(reverse=True)  # 分数高的优先淘汰
        if candidates:
            score, key, info = candidates[0]
            cache_path = info["path"]
            
            try:
                # 删除文件
                if os.path.exists(cache_path):
                    os.remove(cache_path)
                
                # 更新元数据
                del self.metadata[key]
                self.current_size -= info["size"]
                self._save_metadata()
                
                logger.debug(f"Disk cache evicted: {key} (score: {score:.2f}, size: {info['size']:,} bytes)")
            except Exception as e:
                logger.error(f"Failed to evict cache file {cache_path}: {e}")
    
    def get_stats(self) -> Dict:
        """获取磁盘缓存统计信息"""
        with self.lock:
            total_access = self.hits + self.misses
            hit_rate = self.hits / total_access if total_access > 0 else 0
            
            # 计算文件统计
            file_count = len(self.metadata)
            avg_file_size = self.current_size / file_count if file_count > 0 else 0
            
            return {
                "name": "disk_cache",
                "cache_dir": self.cache_dir,
                "max_size": self.max_size,
                "current_size": self.current_size,
                "usage_percent": (self.current_size / self.max_size * 100) if self.max_size > 0 else 0,
                "file_count": file_count,
                "avg_file_size": avg_file_size,
                "hits": self.hits,
                "misses": self.misses,
                "hit_rate": hit_rate
            }

class MultiLevelCache:
    """
    多级缓存管理器
    L1: GPU内存缓存（最快，容量最小）
    L2: 系统内存缓存（中等）
    L3: 磁盘缓存（最慢，容量最大）
    """
    
    def __init__(self, config: Dict = None):
        self.config = config or self._default_config()
        self.lock = threading.RLock()
        
        # 初始化各级缓存
        self.l1_cache = LRUCache(
            max_size=self.config["l1_max_size"],
            name="L1_GPU_Cache"
        )
        
        self.l2_cache = LRUCache(
            max_size=self.config["l2_max_size"],
            name="L2_RAM_Cache"
        )
        
        self.l3_cache = DiskCache(
            cache_dir=self.config["l3_cache_dir"],
            max_size=self.config["l3_max_size"]
        )
        
        # 统计信息
        self.stats = {
            "total_requests": 0,
            "l1_hits": 0,
            "l2_hits": 0,
            "l3_hits": 0,
            "promotions": 0,  # 缓存项升级次数
            "demotions": 0,   # 缓存项降级次数
        }
        
        # 缓存项元数据
        self.item_metadata: Dict[str, Dict] = {}
        
        logger.info("MultiLevelCache initialized")
        logger.info(f"L1 (GPU): {self.config['l1_max_size']:,} bytes")
        logger.info(f"L2 (RAM): {self.config['l2_max_size']:,} bytes")
        logger.info(f"L3 (Disk): {self.config['l3_max_size']:,} bytes")
    
    def _default_config(self) -> Dict:
        """默认配置"""
        return {
            "l1_max_size": 512 * 1024 * 1024,  # 512MB GPU内存
            "l2_max_size": 2 * 1024 * 1024 * 1024,  # 2GB 系统内存
            "l3_max_size": 10 * 1024 * 1024 * 1024,  # 10GB 磁盘空间
            "l3_cache_dir": "/tmp/comfyui_cache",
            "promotion_threshold": 3,  # 访问3次后升级到更高级缓存
            "demotion_threshold": 300,  # 300秒未访问降级
            "max_item_size_l1": 64 * 1024 * 1024,  # L1最大单个项目64MB
            "max_item_size_l2": 256 * 1024 * 1024,  # L2最大单个项目256MB
        }
    
    def _generate_key(self, data: Any) -> str:
        """生成缓存键"""
        # 对于简单类型，直接使用字符串表示
        if isinstance(data, (str, int, float, bool, type(None))):
            return f"{type(data).__name__}:{data}"
        
        # 对于复杂类型，使用pickle哈希
        try:
            pickled = pickle.dumps(data, protocol=pickle.HIGHEST_PROTOCOL)
            return f"pickle:{hashlib.md5(pickled).hexdigest()}"
        except:
            # 如果无法pickle，使用repr
            return f"repr:{hashlib.md5(repr(data).encode()).hexdigest()}"
    
    def _estimate_size(self, data: Any) -> int:
        """估算数据大小"""
        if isinstance(data, torch.Tensor):
            return data.element_size() * data.numel()
        elif isinstance(data, (list, tuple, dict, set)):
            # 粗略估算
            return len(pickle.dumps(data, protocol=pickle.HIGHEST_PROTOCOL))
        elif isinstance(data, (str, bytes)):
            return len(data)
        else:
            # 默认估算
            try:
                return len(pickle.dumps(data, protocol=pickle.HIGHEST_PROTOCOL))
            except:
                return 1024  # 默认1KB
    
    def get(self, key: str) -> Optional[Any]:
        """从缓存中获取数据"""
        with self.lock:
            self.stats["total_requests"] += 1
            
            # 首先检查L1缓存
            value = self.l1_cache.get(key)
            if value is not None:
                self.stats["l1_hits"] += 1
                self._update_metadata(key, CacheLevel.L1)
                return value
            
            # 然后检查L2缓存
            value = self.l2_cache.get(key)
            if value is not None:
                self.stats["l2_hits"] += 1
                # 考虑升级到L1
                self._consider_promotion(key, value, CacheLevel.L2)
                self._update_metadata(key, CacheLevel.L2)
                return value
            
            # 最后检查L3缓存
            value = self.l3_cache.get(key)
            if value is not None:
                self.stats["l3_hits"] += 1
                # 考虑升级到L2
                self._consider_promotion(key, value, CacheLevel.L3)
                self._update_metadata(key, CacheLevel.L3)
                return value
            
            # 所有缓存都未命中
            return None
    
    def put(self, key: str, value: Any, size: int = None) -> bool:
        """将数据放入缓存"""
        with self.lock:
            if size is None:
                size = self._estimate_size(value)
            
            # 根据大小决定缓存级别
            if size <= self.config["max_item_size_l1"]:
                level = CacheLevel.L1
                success = self.l1_cache.put(key, value, size, level)
            elif size <= self.config["max_item_size_l2"]:
                level = CacheLevel.L2
                success = self.l2_cache.put(key, value, size, level)
            else:
                level = CacheLevel.L3
                success = self.l3_cache.put(key, value, size)
            
            if success:
                # 更新元数据
                self.item_metadata[key] = {
                    "size": size,
                    "level": level.value,
                    "access_count": 1,
                    "last_access": time.time(),
                    "creation_time": time.time()
                }
            
            return success
    
    def _update_metadata(self, key: str, level: CacheLevel):
        """更新缓存项元数据"""
        if key in self.item_metadata:
            metadata = self.item_metadata[key]
            metadata["access_count"] = metadata.get("access_count", 0) + 1
            metadata["last_access"] = time.time()
            metadata["level"] = level.value
    
    def _consider_promotion(self, key: str, value: Any, from_level: CacheLevel):
        """考虑将缓存项升级到更高级别"""
        with self.lock:
            if key not in self.item_metadata:
                return
            
            metadata = self.item_metadata[key]
            access_count = metadata.get("access_count", 0)
            size = metadata.get("size", self._estimate_size(value))
            
            # 检查是否满足升级条件
            if (from_level == CacheLevel.L3 and 
                access_count >= self.config["promotion_threshold"] and
                size <= self.config["max_item_size_l2"]):
                # 从L3升级到L2
                if self.l2_cache.put(key, value, size, CacheLevel.L2):
                    self.stats["promotions"] += 1
                    metadata["level"] = CacheLevel.L2.value
                    logger.debug(f"Promoted {key} from L3 to L2")
            
            elif (from_level == CacheLevel.L2 and 
                  access_count >= self.config["promotion_threshold"] * 2 and  # L2->L1需要更多访问
                  size <= self.config["max_item_size_l1"]):
                # 从L2升级到L1
                if self.l1_cache.put(key, value, size, CacheLevel.L1):
                    self.stats["promotions"] += 1
                    metadata["level"] = CacheLevel.L1.value
                    logger.debug(f"Promoted {key} from L2 to L1")
    
    def _consider_demotion(self):
        """考虑将不常用的缓存项降级"""
        with self.lock:
            now = time.time()
            to_demote = []
            
            for key, metadata in self.item_metadata.items():
                last_access = metadata.get("last_access", 0)
                level = CacheLevel(metadata.get("level", CacheLevel.L3.value))
                
                # 检查是否需要降级
                if (now - last_access) > self.config["demotion_threshold"]:
                    if level == CacheLevel.L1:
                        # 从L1降级到L2
                        to_demote.append((key, CacheLevel.L1, CacheLevel.L2))
                    elif level == CacheLevel.L2:
                        # 从L2降级到L3
                        to_demote.append((key, CacheLevel.L2, CacheLevel.L3))
            
            # 执行降级
            for key, from_level, to_level in to_demote:
                # 在实际实现中，需要从原缓存获取数据并存入新缓存
                # 这里简化处理，只更新元数据
                if key in self.item_metadata:
                    self.item_metadata[key]["level"] = to_level.value
                    self.stats["demotions"] += 1
                    logger.debug(f"Demoted {key} from {from_level.value} to {to_level.value}")
    
    def get_stats(self) -> Dict:
        """获取缓存统计信息"""
        with self.lock:
            l1_stats = self.l1_cache.get_stats()
            l2_stats = self.l2_cache.get_stats()
            l3_stats = self.l3_cache.get_stats()
            
            total_hits = self.stats["l1_hits"] + self.stats["l2_hits"] + self.stats["l3_hits"]
            total_misses = self.stats["total_requests"] - total_hits
            total_hit_rate = total_hits / self.stats["total_requests"] if self.stats["total_requests"] > 0 else 0
            
            return {
                "total_requests": self.stats["total_requests"],
                "total_hits": total_hits,
                "total_misses": total_misses,
                "total_hit_rate": total_hit_rate,
                "l1_hit_rate": l1_stats["hit_rate"],
                "l2_hit_rate": l2_stats["hit_rate"],
                "l3_hit_rate": l3_stats["hit_rate"],
                "promotions": self.stats["promotions"],
                "demotions": self.stats["demotions"],
                "item_count": len(self.item_metadata),
                "l1_stats": l1_stats,
                "l2_stats": l2_stats,
                "l3_stats": l3_stats,
            }
    
    def print_stats(self):
        """打印缓存统计信息"""
        stats = self.get_stats()
        logger.info("=" * 60)
        logger.info("Multi-Level Cache Statistics:")
        logger.info(f"  Total requests: {stats['total_requests']:,}")
        logger.info(f"  Total hits: {stats['total_hits']:,}")
        logger.info(f"  Total misses: {stats['total_misses']:,}")
        logger.info(f"  Overall hit rate: {stats['total_hit_rate']:.2%}")
        logger.info(f"  L1 hit rate: {stats['l1_hit_rate']:.2%}")
        logger.info(f"  L2 hit rate: {stats['l2_hit_rate']:.2%}")
        logger.info(f"  L3 hit rate: {stats['l3_hit_rate']:.2%}")
        logger.info(f"  Promotions: {stats['promotions']}")
        logger.info(f"  Demotions: {stats['demotions']}")
        logger.info(f"  Total items: {stats['item_count']}")
        logger.info("-" * 40)
        logger.info("L1 Cache (GPU):")
        logger.info(f"  Usage: {stats['l1_stats']['usage_percent']:.1f}% ({stats['l1_stats']['current_size']:,}/{stats['l1_stats']['max_size']:,} bytes)")
        logger.info(f"  Items: {stats['l1_stats']['item_count']}")
        logger.info("L2 Cache (RAM):")
        logger.info(f"  Usage: {stats['l2_stats']['usage_percent']:.1f}% ({stats['l2_stats']['current_size']:,}/{stats['l2_stats']['max_size']:,} bytes)")
        logger.info(f"  Items: {stats['l2_stats']['item_count']}")
        logger.info("L3 Cache (Disk):")
        logger.info(f"  Usage: {stats['l3_stats']['usage_percent']:.1f}% ({stats['l3_stats']['current_size']:,}/{stats['l3_stats']['max_size']:,} bytes)")
        logger.info(f"  Files: {stats['l3_stats']['file_count']}")
        logger.info("=" * 60)

# 集成到ComfyUI的示例
def integrate_with_comfyui_execution():
    """
    将多级缓存集成到ComfyUI执行引擎的示例
    """
    import comfy_execution.caching as caching
    
    # 创建全局缓存实例
    cache_manager = MultiLevelCache()
    
    # 包装原有的缓存逻辑
    original_get_cache = None  # 需要根据实际代码调整
    
    def enhanced_get_cache(cache_type, cache_args):
        """增强的缓存获取函数"""
        # 根据配置返回适当的缓存实现
        if cache_type == caching.CacheType.RAM_PRESSURE:
            # 使用多级缓存
            return MultiLevelCacheWrapper(cache_manager)
        else:
            # 使用原有缓存
            return original_get_cache(cache_type, cache_args)
    
    class MultiLevelCacheWrapper:
        """多级缓存包装器，兼容原有缓存接口"""
        
        def __init__(self, cache_manager):
            self.cache_manager = cache_manager
        
        def get(self, key, default=None):
            value = self.cache_manager.get(key)
            return value if value is not None else default
        
        def put(self, key, value):
            return self.cache_manager.put(key, value)
        
        def clear(self):
            # 清空所有缓存
            self.cache_manager.l1_cache.clear()
            self.cache_manager.l2_cache.clear()
            # L3磁盘缓存需要特殊处理
        
        def __contains__(self, key):
            return self.cache_manager.get(key) is not None
    
    logger.info("Multi-level cache integrated with ComfyUI execution engine")

# 使用示例
if __name__ == "__main__":
    # 配置日志
    logging.basicConfig(level=logging.INFO)
    
    # 测试多级缓存
    cache = MultiLevelCache({
        "l1_max_size": 100 * 1024 * 1024,  # 100MB
        "l2_max_size": 500 * 1024 * 1024,  # 500MB
        "l3_max_size": 2 * 1024 * 1024 * 1024,  # 2GB
        "l3_cache_dir": "/tmp/test_cache",
    })
    
    # 测试数据
    test_data = {
        "small_tensor": torch.randn(100, 100),  # ~40KB
        "medium_tensor": torch.randn(1000, 1000),  # ~4MB
        "large_tensor": torch.randn(5000, 5000),  # ~100MB
        "text_data": "这是一段测试文本" * 1000,
        "list_data": list(range(10000)),
    }
    
    # 放入缓存
    print("Putting data into cache...")
    for key, value in test_data.items():
        cache.put(key, value)
        print(f"  Put: {key}")
    
    # 获取数据
    print("\nGetting data from cache...")
    for key in test_data.keys():
        value = cache.get(key)
        if value is not None:
            print(f"  Hit: {key} (type: {type(value).__name__})")
        else:
            print(f"  Miss: {key}")
    
    # 多次访问以测试升级机制
    print("\nAccessing small_tensor multiple times to trigger promotion...")
    for i in range(5):
        cache.get("small_tensor")
    
    # 打印统计信息
    print("\nCache statistics:")
    cache.print_stats()
    
    # 清理测试缓存
    import shutil
    if os.path.exists("/tmp/test_cache"):
        shutil.rmtree("/tmp/test_cache")
    
    print("\nTest completed!")
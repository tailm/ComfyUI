"""
缓存层级基类和具体实现
为三级缓存系统提供统一的缓存接口
"""

import torch
import time
import logging
import threading
import json
import pickle
import zlib
import os
import hashlib
from typing import Dict, List, Optional, Tuple, Any, Union, Callable
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from collections import defaultdict, deque
import weakref

logger = logging.getLogger(__name__)

# 从three_level_cache导入CacheLevel以避免重复定义
from .three_level_cache import CacheLevel

class EvictionPolicy(Enum):
    """淘汰策略"""
    LRU = "lru"          # 最近最少使用
    LFU = "lfu"          # 最不经常使用
    FIFO = "fifo"        # 先进先出
    RANDOM = "random"    # 随机淘汰
    ARC = "arc"          # 自适应替换缓存

@dataclass
class CacheConfig:
    """缓存配置"""
    max_size: int                    # 最大大小（字节）
    eviction_policy: EvictionPolicy = EvictionPolicy.LRU  # 淘汰策略
    compression: bool = True         # 是否压缩
    compression_level: int = 6       # 压缩级别
    encryption: bool = False         # 是否加密
    persistent: bool = False         # 是否持久化
    storage_path: Optional[str] = None  # 存储路径（仅L3需要）
    device: Optional[torch.device] = None  # 设备（仅L1需要）

@dataclass
class CacheStats:
    """缓存统计"""
    level: CacheLevel
    max_size: int
    current_size: int
    hit_count: int
    miss_count: int
    eviction_count: int
    put_count: int
    get_count: int
    total_access_time: float
    average_access_time: float
    
    @property
    def usage_percent(self) -> float:
        """使用率百分比"""
        return self.current_size / self.max_size if self.max_size > 0 else 0.0
        
    @property
    def hit_rate(self) -> float:
        """命中率"""
        total = self.hit_count + self.miss_count
        return self.hit_count / total if total > 0 else 0.0
        
    @property
    def eviction_rate(self) -> float:
        """淘汰率"""
        total = self.put_count + self.get_count
        return self.eviction_count / total if total > 0 else 0.0

class CacheLevelBase(ABC):
    """缓存层级基类"""
    
    def __init__(self, level: CacheLevel, config: CacheConfig, name: str = ""):
        self.level = level
        self.config = config
        self.name = name or f"Cache_{level.value}"
        self.current_size = 0
        self.hit_count = 0
        self.miss_count = 0
        self.eviction_count = 0
        self.put_count = 0
        self.get_count = 0
        self.total_access_time = 0.0
        self.stats_lock = threading.RLock()
        self.lock = threading.RLock()
        
    @abstractmethod
    def get(self, key: str) -> Optional[Any]:
        """获取数据"""
        pass
        
    @abstractmethod
    def put(self, key: str, value: Any) -> bool:
        """存储数据"""
        pass
        
    @abstractmethod
    def remove(self, key: str) -> bool:
        """移除数据"""
        pass
        
    @abstractmethod
    def contains(self, key: str) -> bool:
        """检查是否包含key"""
        pass
        
    @abstractmethod
    def clear(self):
        """清空缓存"""
        pass
        
    @abstractmethod
    def get_keys(self) -> List[str]:
        """获取所有key"""
        pass
        
    def record_hit(self, access_time: float = 0.0):
        """记录命中"""
        with self.stats_lock:
            self.hit_count += 1
            self.get_count += 1
            self.total_access_time += access_time
            
    def record_miss(self):
        """记录未命中"""
        with self.stats_lock:
            self.miss_count += 1
            self.get_count += 1
            
    def record_put(self):
        """记录存储"""
        with self.stats_lock:
            self.put_count += 1
            
    def record_eviction(self):
        """记录淘汰"""
        with self.stats_lock:
            self.eviction_count += 1
            
    def get_stats(self) -> CacheStats:
        """获取统计信息"""
        with self.stats_lock:
            avg_access_time = 0.0
            if self.get_count > 0:
                avg_access_time = self.total_access_time / self.get_count
                
            return CacheStats(
                level=self.level,
                max_size=self.config.max_size,
                current_size=self.current_size,
                hit_count=self.hit_count,
                miss_count=self.miss_count,
                eviction_count=self.eviction_count,
                put_count=self.put_count,
                get_count=self.get_count,
                total_access_time=self.total_access_time,
                average_access_time=avg_access_time,
            )
            
    def get_usage(self) -> float:
        """获取使用率"""
        return self.current_size / self.config.max_size if self.config.max_size > 0 else 0.0
        
    def has_space_for(self, size: int) -> bool:
        """检查是否有足够空间"""
        return self.current_size + size <= self.config.max_size
        
    def get_available_space(self) -> int:
        """获取可用空间"""
        return max(0, self.config.max_size - self.current_size)

class L1Cache(CacheLevelBase):
    """L1缓存 - GPU显存缓存"""
    
    def __init__(self, config: CacheConfig, name: str = "L1_GPU_Cache"):
        super().__init__(CacheLevel.L1, config, name)
        
        if config.device is None:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        else:
            self.device = config.device
            
        self.cache: Dict[str, torch.Tensor] = {}
        self.access_order: Dict[str, float] = {}  # key -> 最后访问时间
        self.size_map: Dict[str, int] = {}  # key -> 大小（字节）
        self.frequency_map: Dict[str, int] = {}  # key -> 访问频率（仅LFU使用）
        
    def get(self, key: str) -> Optional[torch.Tensor]:
        """从GPU缓存获取数据"""
        start_time = time.time()
        
        with self.lock:
            if key in self.cache:
                tensor = self.cache[key]
                
                # 更新访问信息
                self.access_order[key] = time.time()
                if self.config.eviction_policy == EvictionPolicy.LFU:
                    self.frequency_map[key] = self.frequency_map.get(key, 0) + 1
                    
                access_time = time.time() - start_time
                self.record_hit(access_time)
                return tensor
            else:
                self.record_miss()
                return None
                
    def put(self, key: str, value: Any, heat: Optional[Any] = None) -> bool:
        """存储数据到GPU缓存"""
        if not isinstance(value, torch.Tensor):
            logger.warning(f"L1缓存只支持torch.Tensor，收到类型: {type(value)}")
            return False
            
        start_time = time.time()
        
        with self.lock:
            # 计算数据大小
            size = value.numel() * value.element_size()
            
            # 如果数据太大，无法缓存
            if size > self.config.max_size:
                logger.warning(f"数据太大({size}字节)，超过L1缓存最大大小({self.config.max_size}字节)")
                return False
                
            # 如果key已存在，先移除旧数据
            if key in self.cache:
                old_size = self.size_map[key]
                self.current_size -= old_size
                del self.cache[key]
                del self.size_map[key]
                if key in self.access_order:
                    del self.access_order[key]
                if key in self.frequency_map:
                    del self.frequency_map[key]
                    
            # 检查是否有足够空间，如果没有则淘汰
            while not self.has_space_for(size) and self.cache:
                self._evict_one()
                
            # 存储数据
            try:
                # 确保数据在正确的设备上
                if value.device != self.device:
                    value = value.to(self.device)
                    
                self.cache[key] = value
                self.size_map[key] = size
                self.access_order[key] = time.time()
                if self.config.eviction_policy == EvictionPolicy.LFU:
                    self.frequency_map[key] = 1
                self.current_size += size
                
                self.record_put()
                logger.debug(f"L1缓存存储: key={key}, size={size}, 当前使用: {self.current_size}/{self.config.max_size}")
                return True
                
            except Exception as e:
                logger.error(f"L1缓存存储失败: {e}")
                return False
                
    def _evict_one(self):
        """淘汰一个数据项"""
        if not self.cache:
            return
            
        # 根据淘汰策略选择要淘汰的key
        if self.config.eviction_policy == EvictionPolicy.LRU:
            # 最近最少使用
            key_to_evict = min(self.access_order.items(), key=lambda x: x[1])[0]
        elif self.config.eviction_policy == EvictionPolicy.LFU:
            # 最不经常使用
            key_to_evict = min(self.frequency_map.items(), key=lambda x: x[1])[0]
        elif self.config.eviction_policy == EvictionPolicy.FIFO:
            # 先进先出
            key_to_evict = min(self.access_order.items(), key=lambda x: x[1])[0]
        elif self.config.eviction_policy == EvictionPolicy.RANDOM:
            # 随机淘汰
            import random
            key_to_evict = random.choice(list(self.cache.keys()))
        else:  # LRU作为默认策略
            key_to_evict = min(self.access_order.items(), key=lambda x: x[1])[0]
            
        # 执行淘汰
        self._evict(key_to_evict)
        
    def _evict(self, key: str):
        """淘汰指定key的数据"""
        if key in self.cache:
            size = self.size_map[key]
            del self.cache[key]
            del self.size_map[key]
            if key in self.access_order:
                del self.access_order[key]
            if key in self.frequency_map:
                del self.frequency_map[key]
            self.current_size -= size
            self.record_eviction()
            logger.debug(f"L1缓存淘汰: key={key}, size={size}")
            
    def remove(self, key: str) -> bool:
        """移除数据"""
        with self.lock:
            if key in self.cache:
                self._evict(key)
                return True
            return False
            
    def contains(self, key: str) -> bool:
        """检查是否包含key"""
        with self.lock:
            return key in self.cache
            
    def clear(self):
        """清空缓存"""
        with self.lock:
            self.cache.clear()
            self.size_map.clear()
            self.access_order.clear()
            self.frequency_map.clear()
            self.current_size = 0
            logger.info("L1缓存已清空")
            
    def get_keys(self) -> List[str]:
        """获取所有key"""
        with self.lock:
            return list(self.cache.keys())
            
    def get_coldest_key(self) -> Optional[str]:
        """获取最冷（最久未访问）的key"""
        with self.lock:
            if not self.access_order:
                return None
            return min(self.access_order.items(), key=lambda x: x[1])[0]

class L2Cache(CacheLevelBase):
    """L2缓存 - 系统内存缓存"""
    
    def __init__(self, config: CacheConfig, name: str = "L2_RAM_Cache"):
        super().__init__(CacheLevel.L2, config, name)
        
        self.cache: Dict[str, bytes] = {}  # 压缩后的数据
        self.metadata: Dict[str, Dict] = {}  # 元数据
        self.access_order: Dict[str, float] = {}
        self.size_map: Dict[str, int] = {}
        self.frequency_map: Dict[str, int] = {}
        
    def _compress(self, data: Any) -> Tuple[bytes, Dict]:
        """压缩数据"""
        try:
            # 序列化数据
            serialized = pickle.dumps(data)
            
            # 压缩数据
            if self.config.compression:
                compressed = zlib.compress(serialized, level=self.config.compression_level)
            else:
                compressed = serialized
                
            # 创建元数据
            metadata = {
                'original_size': len(serialized),
                'compressed_size': len(compressed),
                'compression_ratio': len(compressed) / len(serialized) if len(serialized) > 0 else 1.0,
                'timestamp': time.time(),
                'dtype': str(type(data)),
            }
            
            return compressed, metadata
            
        except Exception as e:
            logger.error(f"数据压缩失败: {e}")
            raise
            
    def _decompress(self, compressed: bytes, metadata: Dict) -> Any:
        """解压数据"""
        try:
            # 解压数据
            if self.config.compression and metadata.get('compressed_size', 0) < metadata.get('original_size', 0):
                serialized = zlib.decompress(compressed)
            else:
                serialized = compressed
                
            # 反序列化
            return pickle.loads(serialized)
            
        except Exception as e:
            logger.error(f"数据解压失败: {e}")
            raise
            
    def get(self, key: str) -> Optional[Any]:
        """从系统内存缓存获取数据"""
        start_time = time.time()
        
        with self.lock:
            if key in self.cache:
                compressed = self.cache[key]
                metadata = self.metadata[key]
                
                try:
                    # 解压数据
                    data = self._decompress(compressed, metadata)
                    
                    # 更新访问信息
                    self.access_order[key] = time.time()
                    if self.config.eviction_policy == EvictionPolicy.LFU:
                        self.frequency_map[key] = self.frequency_map.get(key, 0) + 1
                        
                    access_time = time.time() - start_time
                    self.record_hit(access_time)
                    return data
                    
                except Exception as e:
                    logger.error(f"L2缓存获取失败: key={key}, error={e}")
                    # 移除损坏的数据
                    self.remove(key)
                    return None
            else:
                self.record_miss()
                return None
                
    def put(self, key: str, value: Any, heat: Optional[Any] = None) -> bool:
        """存储数据到系统内存缓存"""
        start_time = time.time()
        
        with self.lock:
            try:
                # 压缩数据
                compressed, metadata = self._compress(value)
                size = len(compressed)
                
                # 如果数据太大，无法缓存
                if size > self.config.max_size:
                    logger.warning(f"数据太大({size}字节)，超过L2缓存最大大小({self.config.max_size}字节)")
                    return False
                    
                # 如果key已存在，先移除旧数据
                if key in self.cache:
                    old_size = self.size_map[key]
                    self.current_size -= old_size
                    del self.cache[key]
                    del self.metadata[key]
                    del self.size_map[key]
                    if key in self.access_order:
                        del self.access_order[key]
                    if key in self.frequency_map:
                        del self.frequency_map[key]
                        
                # 检查是否有足够空间，如果没有则淘汰
                while not self.has_space_for(size) and self.cache:
                    self._evict_one()
                    
                # 存储数据
                self.cache[key] = compressed
                self.metadata[key] = metadata
                self.size_map[key] = size
                self.access_order[key] = time.time()
                if self.config.eviction_policy == EvictionPolicy.LFU:
                    self.frequency_map[key] = 1
                self.current_size += size
                
                self.record_put()
                logger.debug(f"L2缓存存储: key={key}, size={size}, 压缩率: {metadata['compression_ratio']:.2%}, "
                           f"当前使用: {self.current_size}/{self.config.max_size}")
                return True
                
            except Exception as e:
                logger.error(f"L2缓存存储失败: {e}")
                return False
                
    def _evict_one(self):
        """淘汰一个数据项"""
        if not self.cache:
            return
            
        # 根据淘汰策略选择要淘汰的key
        if self.config.eviction_policy == EvictionPolicy.LRU:
            # 最近最少使用
            key_to_evict = min(self.access_order.items(), key=lambda x: x[1])[0]
        elif self.config.eviction_policy == EvictionPolicy.LFU:
            # 最不经常使用
            key_to_evict = min(self.frequency_map.items(), key=lambda x: x[1])[0]
        elif self.config.eviction_policy == EvictionPolicy.FIFO:
            # 先进先出
            key_to_evict = min(self.access_order.items(), key=lambda x: x[1])[0]
        elif self.config.eviction_policy == EvictionPolicy.RANDOM:
            # 随机淘汰
            import random
            key_to_evict = random.choice(list(self.cache.keys()))
        else:  # LRU作为默认策略
            key_to_evict = min(self.access_order.items(), key=lambda x: x[1])[0]
            
        # 执行淘汰
        self._evict(key_to_evict)
        
    def _evict(self, key: str):
        """淘汰指定key的数据"""
        if key in self.cache:
            size = self.size_map[key]
            del self.cache[key]
            del self.metadata[key]
            del self.size_map[key]
            if key in self.access_order:
                del self.access_order[key]
            if key in self.frequency_map:
                del self.frequency_map[key]
            self.current_size -= size
            self.record_eviction()
            logger.debug(f"L2缓存淘汰: key={key}, size={size}")
            
    def remove(self, key: str) -> bool:
        """移除数据"""
        with self.lock:
            if key in self.cache:
                self._evict(key)
                return True
            return False
            
    def contains(self, key: str) -> bool:
        """检查是否包含key"""
        with self.lock:
            return key in self.cache
            
    def clear(self):
        """清空缓存"""
        with self.lock:
            self.cache.clear()
            self.metadata.clear()
            self.size_map.clear()
            self.access_order.clear()
            self.frequency_map.clear()
            self.current_size = 0
            logger.info("L2缓存已清空")
            
    def get_keys(self) -> List[str]:
        """获取所有key"""
        with self.lock:
            return list(self.cache.keys())
            
    def get_coldest_key(self) -> Optional[str]:
        """获取最冷（最久未访问）的key"""
        with self.lock:
            if not self.access_order:
                return None
            return min(self.access_order.items(), key=lambda x: x[1])[0]

class L3Cache(CacheLevelBase):
    """L3缓存 - 持久化存储缓存"""
    
    def __init__(self, config: CacheConfig, name: str = "L3_Disk_Cache"):
        super().__init__(CacheLevel.L3, config, name)
        
        if not config.storage_path:
            raise ValueError("L3缓存需要storage_path配置")
            
        self.storage_path = config.storage_path
        self.cache_index: Dict[str, Dict] = {}  # key -> 文件信息
        self.access_order: Dict[str, float] = {}
        self.size_map: Dict[str, int] = {}
        self.frequency_map: Dict[str, int] = {}
        
        # 确保存储目录存在
        os.makedirs(self.storage_path, exist_ok=True)
        
        # 加载现有索引
        self._load_index()
        
    def _get_file_path(self, key: str) -> str:
        """获取文件路径"""
        # 使用key的哈希作为文件名，避免特殊字符问题
        key_hash = hashlib.md5(key.encode()).hexdigest()
        return os.path.join(self.storage_path, f"{key_hash}.cache")
        
    def _load_index(self):
        """加载缓存索引"""
        index_file = os.path.join(self.storage_path, "cache_index.json")
        if os.path.exists(index_file):
            try:
                with open(index_file, 'r') as f:
                    data = json.load(f)
                    self.cache_index = data.get('index', {})
                    self.access_order = data.get('access_order', {})
                    self.size_map = data.get('size_map', {})
                    self.current_size = sum(self.size_map.values())
                logger.info(f"L3缓存索引已加载: {len(self.cache_index)} 个条目")
            except Exception as e:
                logger.error(f"加载L3缓存索引失败: {e}")
                self.cache_index = {}
                self.access_order = {}
                self.size_map = {}
                self.current_size = 0
                
    def _save_index(self):
        """保存缓存索引"""
        index_file = os.path.join(self.storage_path, "cache_index.json")
        try:
            with open(index_file, 'w') as f:
                json.dump({
                    'index': self.cache_index,
                    'access_order': self.access_order,
                    'size_map': self.size_map,
                }, f, indent=2)
        except Exception as e:
            logger.error(f"保存L3缓存索引失败: {e}")
            
    def _compress(self, data: Any) -> bytes:
        """压缩数据"""
        serialized = pickle.dumps(data)
        if self.config.compression:
            return zlib.compress(serialized, level=self.config.compression_level)
        return serialized
        
    def _decompress(self, compressed: bytes) -> Any:
        """解压数据"""
        if self.config.compression:
            serialized = zlib.decompress(compressed)
        else:
            serialized = compressed
        return pickle.loads(serialized)
        
    def get(self, key: str) -> Optional[Any]:
        """从磁盘缓存获取数据"""
        start_time = time.time()
        
        with self.lock:
            if key not in self.cache_index:
                self.record_miss()
                return None
                
            file_info = self.cache_index[key]
            file_path = file_info.get('path', '')
            
            if not os.path.exists(file_path):
                logger.warning(f"L3缓存文件不存在: {file_path}")
                self.remove(key)
                self.record_miss()
                return None
                
            try:
                # 读取文件
                with open(file_path, 'rb') as f:
                    compressed = f.read()
                    
                # 解压数据
                data = self._decompress(compressed)
                
                # 更新访问信息
                self.access_order[key] = time.time()
                if self.config.eviction_policy == EvictionPolicy.LFU:
                    self.frequency_map[key] = self.frequency_map.get(key, 0) + 1
                    
                access_time = time.time() - start_time
                self.record_hit(access_time)
                logger.debug(f"L3缓存命中: key={key}, size={len(compressed)}")
                return data
                
            except Exception as e:
                logger.error(f"L3缓存读取失败: key={key}, error={e}")
                self.remove(key)
                return None
                
    def put(self, key: str, value: Any, heat: Optional[Any] = None) -> bool:
        """存储数据到磁盘缓存"""
        start_time = time.time()
        
        with self.lock:
            try:
                # 压缩数据
                compressed = self._compress(value)
                size = len(compressed)
                
                # 如果数据太大，无法缓存
                if size > self.config.max_size:
                    logger.warning(f"数据太大({size}字节)，超过L3缓存最大大小({self.config.max_size}字节)")
                    return False
                    
                # 检查是否有足够空间，如果没有则淘汰
                while not self.has_space_for(size) and self.cache_index:
                    self._evict_one()
                    
                # 生成文件路径
                file_path = self._get_file_path(key)
                
                # 写入文件
                with open(file_path, 'wb') as f:
                    f.write(compressed)
                    
                # 更新索引
                self.cache_index[key] = {
                    'path': file_path,
                    'size': size,
                    'timestamp': time.time(),
                    'compression': self.config.compression,
                    'encryption': self.config.encryption,
                }
                self.size_map[key] = size
                self.access_order[key] = time.time()
                if self.config.eviction_policy == EvictionPolicy.LFU:
                    self.frequency_map[key] = 1
                self.current_size += size
                
                # 保存索引
                self._save_index()
                
                self.record_put()
                logger.debug(f"L3缓存存储: key={key}, size={size}, 文件: {file_path}, "
                           f"当前使用: {self.current_size}/{self.config.max_size}")
                return True
                
            except Exception as e:
                logger.error(f"L3缓存存储失败: {e}")
                return False
                
    def _evict_one(self):
        """淘汰一个数据项"""
        if not self.cache_index:
            return
            
        # 根据淘汰策略选择要淘汰的key
        if self.config.eviction_policy == EvictionPolicy.LRU:
            # 最近最少使用
            key_to_evict = min(self.access_order.items(), key=lambda x: x[1])[0]
        elif self.config.eviction_policy == EvictionPolicy.LFU:
            # 最不经常使用
            key_to_evict = min(self.frequency_map.items(), key=lambda x: x[1])[0]
        elif self.config.eviction_policy == EvictionPolicy.FIFO:
            # 先进先出
            key_to_evict = min(self.access_order.items(), key=lambda x: x[1])[0]
        elif self.config.eviction_policy == EvictionPolicy.RANDOM:
            # 随机淘汰
            import random
            key_to_evict = random.choice(list(self.cache_index.keys()))
        else:  # LRU作为默认策略
            key_to_evict = min(self.access_order.items(), key=lambda x: x[1])[0]
            
        # 执行淘汰
        self._evict(key_to_evict)
        
    def _evict(self, key: str):
        """淘汰指定key的数据"""
        if key in self.cache_index:
            file_info = self.cache_index[key]
            file_path = file_info.get('path', '')
            
            # 删除文件
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                logger.warning(f"删除L3缓存文件失败: {file_path}, error={e}")
                
            # 更新索引
            size = self.size_map.get(key, 0)
            del self.cache_index[key]
            if key in self.size_map:
                del self.size_map[key]
            if key in self.access_order:
                del self.access_order[key]
            if key in self.frequency_map:
                del self.frequency_map[key]
            self.current_size -= size
            self.record_eviction()
            
            # 保存索引
            self._save_index()
            
            logger.debug(f"L3缓存淘汰: key={key}, size={size}")
            
    def remove(self, key: str) -> bool:
        """移除数据"""
        with self.lock:
            if key in self.cache_index:
                self._evict(key)
                return True
            return False
            
    def contains(self, key: str) -> bool:
        """检查是否包含key"""
        with self.lock:
            return key in self.cache_index
            
    def clear(self):
        """清空缓存"""
        with self.lock:
            # 删除所有缓存文件
            for key, file_info in list(self.cache_index.items()):
                file_path = file_info.get('path', '')
                try:
                    if os.path.exists(file_path):
                        os.remove(file_path)
                except Exception as e:
                    logger.warning(f"删除缓存文件失败: {file_path}, error={e}")
                    
            # 清空索引
            self.cache_index.clear()
            self.access_order.clear()
            self.size_map.clear()
            self.frequency_map.clear()
            self.current_size = 0
            
            # 保存空索引
            self._save_index()
            
            logger.info("L3缓存已清空")
            
    def get_keys(self) -> List[str]:
        """获取所有key"""
        with self.lock:
            return list(self.cache_index.keys())
            
    def get_coldest_key(self) -> Optional[str]:
        """获取最冷（最久未访问）的key"""
        with self.lock:
            if not self.access_order:
                return None
            return min(self.access_order.items(), key=lambda x: x[1])[0]
            
    def cleanup(self):
        """清理损坏或过期的缓存文件"""
        with self.lock:
            keys_to_remove = []
            for key, file_info in self.cache_index.items():
                file_path = file_info.get('path', '')
                if not os.path.exists(file_path):
                    keys_to_remove.append(key)
                    logger.warning(f"清理损坏的缓存文件: {file_path}")
                    
            for key in keys_to_remove:
                self._evict(key)
                
            logger.info(f"L3缓存清理完成，移除了 {len(keys_to_remove)} 个损坏的条目")

# 缓存工厂函数
def create_cache(level: CacheLevel, config: CacheConfig, name: str = "") -> CacheLevelBase:
    """创建缓存实例"""
    if level == CacheLevel.L1:
        return L1Cache(config, name)
    elif level == CacheLevel.L2:
        return L2Cache(config, name)
    elif level == CacheLevel.L3:
        return L3Cache(config, name)
    else:
        raise ValueError(f"不支持的缓存层级: {level}")

# 默认配置
def get_default_l1_config() -> CacheConfig:
    """获取L1缓存默认配置"""
    return CacheConfig(
        max_size=4 * 1024**3,  # 4GB
        eviction_policy=EvictionPolicy.LRU,
        device=torch.device('cuda' if torch.cuda.is_available() else 'cpu'),
    )

def get_default_l2_config() -> CacheConfig:
    """获取L2缓存默认配置"""
    return CacheConfig(
        max_size=16 * 1024**3,  # 16GB
        eviction_policy=EvictionPolicy.LRU,
        compression=True,
        compression_level=6,
    )

def get_default_l3_config(storage_path: str = "./cache/l3") -> CacheConfig:
    """获取L3缓存默认配置"""
    return CacheConfig(
        max_size=100 * 1024**3,  # 100GB
        eviction_policy=EvictionPolicy.LRU,
        compression=True,
        compression_level=6,
        encryption=False,
        persistent=True,
        storage_path=storage_path,
    )
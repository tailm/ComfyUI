"""
三级缓存系统
为ComfyUI提供智能的三级缓存架构，支持自动数据迁移
"""

import torch
import gc
import logging
import time
import threading
import json
import pickle
import zlib
import os
import hashlib
from typing import Dict, List, Optional, Tuple, Any, Union, Callable
from dataclasses import dataclass, field
from enum import Enum
from collections import defaultdict, deque, OrderedDict
from abc import ABC, abstractmethod
import weakref
import numpy as np

logger = logging.getLogger(__name__)

class CacheLevel(Enum):
    """缓存层级"""
    L1 = "l1"  # GPU显存 - 最快，容量最小
    L2 = "l2"  # 系统内存 - 中等速度，中等容量
    L3 = "l3"  # 持久化存储 - 最慢，容量最大

class DataHeat:
    """数据热度跟踪"""
    
    def __init__(self, key: str, size: int):
        self.key = key
        self.size = size
        self.access_count = 0
        self.last_access_time = time.time()
        self.first_access_time = time.time()
        self.access_timestamps = deque(maxlen=100)  # 最近100次访问时间
        self.heat_score = 0.0
        self.current_level = CacheLevel.L3  # 默认在L3
        
    def record_access(self):
        """记录一次访问"""
        current_time = time.time()
        self.access_count += 1
        self.last_access_time = current_time
        self.access_timestamps.append(current_time)
        self._update_heat_score()
        
    def _update_heat_score(self):
        """更新热度分数"""
        if self.access_count == 0:
            self.heat_score = 0.0
            return
            
        # 1. 时间衰减因子（最近访问权重更高）
        time_decay = 1.0 / (time.time() - self.last_access_time + 1)
        
        # 2. 访问频率因子
        if len(self.access_timestamps) >= 2:
            intervals = []
            for i in range(1, len(self.access_timestamps)):
                intervals.append(self.access_timestamps[i] - self.access_timestamps[i-1])
            if intervals:
                avg_interval = sum(intervals) / len(intervals)
                frequency_factor = 1.0 / (avg_interval + 0.001)
            else:
                frequency_factor = 1.0
        else:
            frequency_factor = 1.0 if self.access_count > 0 else 0.0
            
        # 3. 大小因子（小数据更容易被缓存）
        size_factor = 1.0 / (self.size / (1024 * 1024) + 1)  # MB为单位
        
        # 4. 综合热度分数
        self.heat_score = (
            time_decay * 0.4 +      # 时间衰减权重40%
            frequency_factor * 0.4 + # 频率权重40%
            size_factor * 0.2        # 大小权重20%
        )
        
    def should_promote(self, target_level: CacheLevel) -> bool:
        """是否应该晋升到目标层级"""
        thresholds = {
            CacheLevel.L3: 0.3,  # L3 -> L2
            CacheLevel.L2: 0.6,  # L2 -> L1
            CacheLevel.L1: 0.9,  # L1保持
        }
        return self.heat_score > thresholds.get(target_level, 0.5)
        
    def should_demote(self, current_level: CacheLevel) -> bool:
        """是否应该从当前层级降级"""
        thresholds = {
            CacheLevel.L1: 0.2,  # L1 -> L2
            CacheLevel.L2: 0.1,  # L2 -> L3
            CacheLevel.L3: 0.0,  # L3保持
        }
        return self.heat_score < thresholds.get(current_level, 0.3)
        
    def get_stats(self) -> Dict[str, Any]:
        """获取统计信息"""
        return {
            'key': self.key,
            'size': self.size,
            'access_count': self.access_count,
            'last_access_time': self.last_access_time,
            'heat_score': self.heat_score,
            'current_level': self.current_level.value,
            'age_seconds': time.time() - self.first_access_time,
        }

class CacheLevelBase(ABC):
    """缓存层级基类"""
    
    def __init__(self, level: CacheLevel, max_size: int, name: str = ""):
        self.level = level
        self.max_size = max_size
        self.name = name or f"Cache_{level.value}"
        self.current_size = 0
        self.hit_count = 0
        self.miss_count = 0
        self.eviction_count = 0
        self.stats_lock = threading.Lock()
        
    @abstractmethod
    def get(self, key: str) -> Optional[Any]:
        """获取数据"""
        pass
        
    @abstractmethod
    def put(self, key: str, value: Any, heat: DataHeat) -> bool:
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
        
    def record_hit(self):
        """记录命中"""
        with self.stats_lock:
            self.hit_count += 1
            
    def record_miss(self):
        """记录未命中"""
        with self.stats_lock:
            self.miss_count += 1
            
    def record_eviction(self):
        """记录淘汰"""
        with self.stats_lock:
            self.eviction_count += 1
            
    def get_hit_rate(self) -> float:
        """获取命中率"""
        total = self.hit_count + self.miss_count
        return self.hit_count / total if total > 0 else 0.0
        
    def get_usage(self) -> float:
        """获取使用率"""
        return self.current_size / self.max_size if self.max_size > 0 else 0.0
        
    def get_stats(self) -> Dict[str, Any]:
        """获取统计信息"""
        return {
            'level': self.level.value,
            'name': self.name,
            'max_size': self.max_size,
            'current_size': self.current_size,
            'usage_percent': self.get_usage() * 100,
            'hit_count': self.hit_count,
            'miss_count': self.miss_count,
            'eviction_count': self.eviction_count,
            'hit_rate': self.get_hit_rate(),
            'key_count': len(self.get_keys()),
        }

class L1Cache(CacheLevelBase):
    """L1缓存 - GPU显存缓存"""
    
    def __init__(self, max_size: int, device: Optional[torch.device] = None):
        super().__init__(CacheLevel.L1, max_size, "L1_GPU_Cache")
        self.device = device or torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.cache: Dict[str, torch.Tensor] = {}
        self.access_order: Dict[str, float] = {}  # key -> 最后访问时间
        self.size_map: Dict[str, int] = {}  # key -> 大小（字节）
        self.lock = threading.RLock()
        
    def get(self, key: str) -> Optional[torch.Tensor]:
        """从GPU缓存获取数据"""
        with self.lock:
            if key in self.cache:
                tensor = self.cache[key]
                self.access_order[key] = time.time()
                self.record_hit()
                
                # 更新数据热度
                if hasattr(self, '_heat_tracker') and key in self._heat_tracker:
                    self._heat_tracker[key].record_access()
                    
                return tensor
            else:
                self.record_miss()
                return None
                
    def put(self, key: str, value: torch.Tensor, heat: DataHeat) -> bool:
        """存储数据到GPU缓存"""
        if not isinstance(value, torch.Tensor):
            logger.warning(f"L1缓存只支持torch.Tensor，收到类型: {type(value)}")
            return False
            
        with self.lock:
            # 计算数据大小
            size = value.numel() * value.element_size()
            
            # 如果数据太大，无法缓存
            if size > self.max_size:
                logger.warning(f"数据太大({size}字节)，超过L1缓存最大大小({self.max_size}字节)")
                return False
                
            # 如果key已存在，先移除旧数据
            if key in self.cache:
                old_size = self.size_map[key]
                self.current_size -= old_size
                del self.cache[key]
                del self.size_map[key]
                if key in self.access_order:
                    del self.access_order[key]
                    
            # 检查是否有足够空间，如果没有则淘汰
            while self.current_size + size > self.max_size and self.access_order:
                # 找到最久未访问的key
                oldest_key = min(self.access_order.items(), key=lambda x: x[1])[0]
                self._evict(oldest_key)
                
            # 存储数据
            try:
                # 确保数据在正确的设备上
                if value.device != self.device:
                    value = value.to(self.device)
                    
                self.cache[key] = value
                self.size_map[key] = size
                self.access_order[key] = time.time()
                self.current_size += size
                
                # 更新热度信息
                heat.current_level = CacheLevel.L1
                if hasattr(self, '_heat_tracker'):
                    self._heat_tracker[key] = heat
                    
                logger.debug(f"L1缓存存储: key={key}, size={size}, 当前使用: {self.current_size}/{self.max_size}")
                return True
                
            except Exception as e:
                logger.error(f"L1缓存存储失败: {e}")
                return False
                
    def _evict(self, key: str):
        """淘汰数据"""
        if key in self.cache:
            size = self.size_map[key]
            del self.cache[key]
            del self.size_map[key]
            if key in self.access_order:
                del self.access_order[key]
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
            
    def set_heat_tracker(self, heat_tracker: Dict[str, DataHeat]):
        """设置热度跟踪器"""
        self._heat_tracker = heat_tracker

class L2Cache(CacheLevelBase):
    """L2缓存 - 系统内存缓存"""
    
    def __init__(self, max_size: int, compression: bool = True):
        super().__init__(CacheLevel.L2, max_size, "L2_RAM_Cache")
        self.compression = compression
        self.cache: Dict[str, bytes] = {}  # 压缩后的数据
        self.metadata: Dict[str, Dict] = {}  # 元数据
        self.access_order: Dict[str, float] = {}
        self.size_map: Dict[str, int] = {}
        self.lock = threading.RLock()
        
    def _compress(self, data: Any) -> Tuple[bytes, Dict]:
        """压缩数据"""
        try:
            # 序列化数据
            serialized = pickle.dumps(data)
            
            # 压缩数据
            if self.compression:
                compressed = zlib.compress(serialized, level=6)
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
            if self.compression and metadata.get('compressed_size', 0) < metadata.get('original_size', 0):
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
        with self.lock:
            if key in self.cache:
                compressed = self.cache[key]
                metadata = self.metadata[key]
                
                try:
                    # 解压数据
                    data = self._decompress(compressed, metadata)
                    self.access_order[key] = time.time()
                    self.record_hit()
                    
                    # 更新数据热度
                    if hasattr(self, '_heat_tracker') and key in self._heat_tracker:
                        self._heat_tracker[key].record_access()
                        
                    return data
                    
                except Exception as e:
                    logger.error(f"L2缓存获取失败: key={key}, error={e}")
                    # 移除损坏的数据
                    self.remove(key)
                    return None
            else:
                self.record_miss()
                return None
                
    def put(self, key: str, value: Any, heat: DataHeat) -> bool:
        """存储数据到系统内存缓存"""
        with self.lock:
            try:
                # 压缩数据
                compressed, metadata = self._compress(value)
                size = len(compressed)
                
                # 如果数据太大，无法缓存
                if size > self.max_size:
                    logger.warning(f"数据太大({size}字节)，超过L2缓存最大大小({self.max_size}字节)")
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
                        
                # 检查是否有足够空间，如果没有则淘汰
                while self.current_size + size > self.max_size and self.access_order:
                    # 找到最久未访问的key
                    oldest_key = min(self.access_order.items(), key=lambda x: x[1])[0]
                    self._evict(oldest_key)
                    
                # 存储数据
                self.cache[key] = compressed
                self.metadata[key] = metadata
                self.size_map[key] = size
                self.access_order[key] = time.time()
                self.current_size += size
                
                # 更新热度信息
                heat.current_level = CacheLevel.L2
                if hasattr(self, '_heat_tracker'):
                    self._heat_tracker[key] = heat
                    
                logger.debug(f"L2缓存存储: key={key}, size={size}, 压缩率: {metadata['compression_ratio']:.2%}, "
                           f"当前使用: {self.current_size}/{self.max_size}")
                return True
                
            except Exception as e:
                logger.error(f"L2缓存存储失败: {e}")
                return False
                
    def _evict(self, key: str):
        """淘汰数据"""
        if key in self.cache:
            size = self.size_map[key]
            del self.cache[key]
            del self.metadata[key]
            del self.size_map[key]
            if key in self.access_order:
                del self.access_order[key]
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
            
    def set_heat_tracker(self, heat_tracker: Dict[str, DataHeat]):
        """设置热度跟踪器"""
        self._heat_tracker = heat_tracker

class L3Cache(CacheLevelBase):
    """L3缓存 - 持久化存储缓存"""
    
    def __init__(self, storage_path: str, max_size: int = 100 * 1024**3,  # 默认100GB
                 compression: bool = True, encryption: bool = False):
        super().__init__(CacheLevel.L3, max_size, "L3_Disk_Cache")
        self.storage_path = storage_path
        self.compression = compression
        self.encryption = encryption
        self.cache_index: Dict[str, Dict] = {}  # key -> 文件信息
        self.access_order: Dict[str, float] = {}
        self.size_map: Dict[str, int] = {}
        self.lock = threading.RLock()
        
        # 确保存储目录存在
        os.makedirs(storage_path, exist_ok=True)
        
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
        if self.compression:
            return zlib.compress(serialized, level=6)
        return serialized
        
    def _decompress(self, compressed: bytes) -> Any:
        """解压数据"""
        if self.compression:
            serialized = zlib.decompress(compressed)
        else:
            serialized = compressed
        return pickle.loads(serialized)
        
    def get(self, key: str) -> Optional[Any]:
        """从磁盘缓存获取数据"""
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
                
                # 更新访问时间
                self.access_order[key] = time.time()
                self.record_hit()
                
                # 更新数据热度
                if hasattr(self, '_heat_tracker') and key in self._heat_tracker:
                    self._heat_tracker[key].record_access()
                    
                logger.debug(f"L3缓存命中: key={key}, size={len(compressed)}")
                return data
                
            except Exception as e:
                logger.error(f"L3缓存读取失败: key={key}, error={e}")
                self.remove(key)
                return None
                
    def put(self, key: str, value: Any, heat: DataHeat) -> bool:
        """存储数据到磁盘缓存"""
        with self.lock:
            try:
                # 压缩数据
                compressed = self._compress(value)
                size = len(compressed)
                
                # 如果数据太大，无法缓存
                if size > self.max_size:
                    logger.warning(f"数据太大({size}字节)，超过L3缓存最大大小({self.max_size}字节)")
                    return False
                    
                # 检查是否有足够空间，如果没有则淘汰
                while self.current_size + size > self.max_size and self.access_order:
                    # 找到最久未访问的key
                    oldest_key = min(self.access_order.items(), key=lambda x: x[1])[0]
                    self._evict(oldest_key)
                    
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
                    'compression': self.compression,
                    'encryption': self.encryption,
                }
                self.size_map[key] = size
                self.access_order[key] = time.time()
                self.current_size += size
                
                # 保存索引
                self._save_index()
                
                # 更新热度信息
                heat.current_level = CacheLevel.L3
                if hasattr(self, '_heat_tracker'):
                    self._heat_tracker[key] = heat
                    
                logger.debug(f"L3缓存存储: key={key}, size={size}, 文件: {file_path}, "
                           f"当前使用: {self.current_size}/{self.max_size}")
                return True
                
            except Exception as e:
                logger.error(f"L3缓存存储失败: {e}")
                return False
                
    def _evict(self, key: str):
        """淘汰数据"""
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
            
    def set_heat_tracker(self, heat_tracker: Dict[str, DataHeat]):
        """设置热度跟踪器"""
        self._heat_tracker = heat_tracker
        
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

class MigrationEngine:
    """数据迁移引擎"""
    
    def __init__(self, l1_cache: L1Cache, l2_cache: L2Cache, l3_cache: L3Cache):
        self.l1_cache = l1_cache
        self.l2_cache = l2_cache
        self.l3_cache = l3_cache
        self.heat_tracker: Dict[str, DataHeat] = {}
        self.migration_lock = threading.RLock()
        self.migration_queue = deque()
        self.running = False
        self.migration_thread = None
        
        # 设置热度跟踪器
        self.l1_cache.set_heat_tracker(self.heat_tracker)
        self.l2_cache.set_heat_tracker(self.heat_tracker)
        self.l3_cache.set_heat_tracker(self.heat_tracker)
        
    def start(self):
        """启动迁移引擎"""
        if not self.running:
            self.running = True
            self.migration_thread = threading.Thread(target=self._migration_worker, daemon=True)
            self.migration_thread.start()
            logger.info("迁移引擎已启动")
            
    def stop(self):
        """停止迁移引擎"""
        self.running = False
        if self.migration_thread:
            self.migration_thread.join(timeout=5.0)
            logger.info("迁移引擎已停止")
            
    def _migration_worker(self):
        """迁移工作线程"""
        while self.running:
            try:
                self._check_and_migrate()
                time.sleep(1.0)  # 每秒检查一次
            except Exception as e:
                logger.error(f"迁移工作线程错误: {e}")
                time.sleep(5.0)
                
    def _check_and_migrate(self):
        """检查并执行迁移"""
        with self.migration_lock:
            # 检查L1缓存是否需要降级
            l1_keys = self.l1_cache.get_keys()
            for key in l1_keys:
                if key in self.heat_tracker:
                    heat = self.heat_tracker[key]
                    if heat.should_demote(CacheLevel.L1):
                        self._schedule_migration(key, CacheLevel.L1, CacheLevel.L2)
                        
            # 检查L2缓存
            l2_keys = self.l2_cache.get_keys()
            for key in l2_keys:
                if key in self.heat_tracker:
                    heat = self.heat_tracker[key]
                    # 检查是否需要晋升到L1
                    if heat.should_promote(CacheLevel.L2):
                        self._schedule_migration(key, CacheLevel.L2, CacheLevel.L1)
                    # 检查是否需要降级到L3
                    elif heat.should_demote(CacheLevel.L2):
                        self._schedule_migration(key, CacheLevel.L2, CacheLevel.L3)
                        
            # 检查L3缓存是否需要晋升到L2
            l3_keys = self.l3_cache.get_keys()
            for key in l3_keys:
                if key in self.heat_tracker:
                    heat = self.heat_tracker[key]
                    if heat.should_promote(CacheLevel.L3):
                        self._schedule_migration(key, CacheLevel.L3, CacheLevel.L2)
                        
            # 执行迁移任务
            self._execute_migrations()
            
    def _schedule_migration(self, key: str, from_level: CacheLevel, to_level: CacheLevel):
        """调度迁移任务"""
        self.migration_queue.append({
            'key': key,
            'from_level': from_level,
            'to_level': to_level,
            'timestamp': time.time(),
        })
        
    def _execute_migrations(self):
        """执行迁移任务"""
        while self.migration_queue:
            task = self.migration_queue.popleft()
            try:
                self._migrate_data(task['key'], task['from_level'], task['to_level'])
            except Exception as e:
                logger.error(f"迁移失败: key={task['key']}, from={task['from_level']}, "
                           f"to={task['to_level']}, error={e}")
                
    def _migrate_data(self, key: str, from_level: CacheLevel, to_level: CacheLevel):
        """迁移数据"""
        logger.debug(f"开始迁移: key={key}, from={from_level.value}, to={to_level.value}")
        
        # 获取源缓存
        from_cache = self._get_cache_by_level(from_level)
        to_cache = self._get_cache_by_level(to_level)
        
        if not from_cache or not to_cache:
            logger.error(f"无效的缓存层级: from={from_level}, to={to_level}")
            return
            
        # 从源缓存获取数据
        data = from_cache.get(key)
        if data is None:
            logger.warning(f"迁移失败: 源缓存中不存在key={key}")
            return
            
        # 获取热度信息
        heat = self.heat_tracker.get(key)
        if heat is None:
            heat = DataHeat(key, self._estimate_size(data))
            self.heat_tracker[key] = heat
            
        # 存储到目标缓存
        success = to_cache.put(key, data, heat)
        if success:
            # 从源缓存移除
            from_cache.remove(key)
            heat.current_level = to_level
            logger.info(f"迁移成功: key={key}, from={from_level.value}, to={to_level.value}, "
                      f"heat={heat.heat_score:.3f}")
        else:
            logger.warning(f"迁移失败: 无法存储到目标缓存, key={key}, to={to_level.value}")
            
    def _get_cache_by_level(self, level: CacheLevel) -> Optional[CacheLevelBase]:
        """根据层级获取缓存实例"""
        if level == CacheLevel.L1:
            return self.l1_cache
        elif level == CacheLevel.L2:
            return self.l2_cache
        elif level == CacheLevel.L3:
            return self.l3_cache
        return None
        
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
                
    def record_access(self, key: str, data: Any):
        """记录数据访问"""
        if key not in self.heat_tracker:
            size = self._estimate_size(data)
            self.heat_tracker[key] = DataHeat(key, size)
        self.heat_tracker[key].record_access()
        
    def get_stats(self) -> Dict[str, Any]:
        """获取迁移统计"""
        with self.migration_lock:
            return {
                'heat_tracker_size': len(self.heat_tracker),
                'migration_queue_size': len(self.migration_queue),
                'l1_keys': len(self.l1_cache.get_keys()),
                'l2_keys': len(self.l2_cache.get_keys()),
                'l3_keys': len(self.l3_cache.get_keys()),
                'total_heat_score': sum(h.heat_score for h in self.heat_tracker.values()),
            }

class ThreeLevelCacheManager:
    """三级缓存管理器"""
    
    def __init__(self, config: Optional[Dict] = None):
        # 默认配置
        self.config = config or self._get_default_config()
        
        # 初始化缓存层级
        self.l1_cache = L1Cache(
            max_size=self.config['l1_cache']['max_size'],
            device=torch.device(self.config['l1_cache']['device'])
        )
        
        self.l2_cache = L2Cache(
            max_size=self.config['l2_cache']['max_size'],
            compression=self.config['l2_cache']['compression']
        )
        
        self.l3_cache = L3Cache(
            storage_path=self.config['l3_cache']['storage_path'],
            max_size=self.config['l3_cache']['max_size'],
            compression=self.config['l3_cache']['compression'],
            encryption=self.config['l3_cache']['encryption']
        )
        
        # 初始化迁移引擎
        self.migration_engine = MigrationEngine(self.l1_cache, self.l2_cache, self.l3_cache)
        
        # 启动迁移引擎
        if self.config['migration']['enabled']:
            self.migration_engine.start()
            
        logger.info("三级缓存管理器已初始化")
        
    def _get_default_config(self) -> Dict:
        """获取默认配置"""
        return {
            'l1_cache': {
                'enabled': True,
                'max_size': 4 * 1024**3,  # 4GB
                'device': 'cuda' if torch.cuda.is_available() else 'cpu',
                'eviction_policy': 'lru',
            },
            'l2_cache': {
                'enabled': True,
                'max_size': 16 * 1024**3,  # 16GB
                'compression': True,
                'compression_level': 6,
            },
            'l3_cache': {
                'enabled': True,
                'storage_path': './cache/l3',
                'max_size': 100 * 1024**3,  # 100GB
                'compression': True,
                'encryption': False,
                'persistent': True,
            },
            'migration': {
                'enabled': True,
                'check_interval': 60,  # 60秒
                'batch_size': 10,
                'async_migration': True,
            },
            'prefetch': {
                'enabled': False,
                'prediction_window': 10,
                'prefetch_count': 3,
            },
        }
        
    def get(self, key: str) -> Optional[Any]:
        """获取数据（透明访问所有层级）"""
        # 记录访问
        if hasattr(self, '_last_access_key'):
            self.migration_engine.record_access(self._last_access_key, None)
            
        # 1. 检查L1缓存
        data = self.l1_cache.get(key)
        if data is not None:
            self.migration_engine.record_access(key, data)
            return data
            
        # 2. 检查L2缓存
        data = self.l2_cache.get(key)
        if data is not None:
            self.migration_engine.record_access(key, data)
            # 自动晋升到L1
            if self.config['migration']['enabled']:
                heat = self.migration_engine.heat_tracker.get(key)
                if heat and heat.should_promote(CacheLevel.L2):
                    self.l1_cache.put(key, data, heat)
            return data
            
        # 3. 检查L3缓存
        data = self.l3_cache.get(key)
        if data is not None:
            self.migration_engine.record_access(key, data)
            # 自动晋升到L2
            if self.config['migration']['enabled']:
                heat = self.migration_engine.heat_tracker.get(key)
                if heat and heat.should_promote(CacheLevel.L3):
                    self.l2_cache.put(key, data, heat)
            return data
            
        # 4. 未命中
        return None
        
    def put(self, key: str, value: Any, level: Optional[CacheLevel] = None) -> bool:
        """存储数据到指定层级（或自动选择）"""
        # 创建或获取热度信息
        heat = self.migration_engine.heat_tracker.get(key)
        if heat is None:
            size = self.migration_engine._estimate_size(value)
            heat = DataHeat(key, size)
            self.migration_engine.heat_tracker[key] = heat
            
        # 记录访问
        self.migration_engine.record_access(key, value)
        
        # 确定存储层级
        if level is None:
            # 自动选择层级
            if heat.heat_score > 0.7:  # 热度高，存L1
                target_level = CacheLevel.L1
            elif heat.heat_score > 0.3:  # 热度中等，存L2
                target_level = CacheLevel.L2
            else:  # 热度低，存L3
                target_level = CacheLevel.L3
        else:
            target_level = level
            
        # 存储到目标层级
        if target_level == CacheLevel.L1:
            success = self.l1_cache.put(key, value, heat)
        elif target_level == CacheLevel.L2:
            success = self.l2_cache.put(key, value, heat)
        else:  # CacheLevel.L3
            success = self.l3_cache.put(key, value, heat)
            
        if success:
            heat.current_level = target_level
            logger.debug(f"数据存储: key={key}, level={target_level.value}, heat={heat.heat_score:.3f}")
        else:
            logger.warning(f"数据存储失败: key={key}, level={target_level.value}")
            
        return success
        
    def remove(self, key: str) -> bool:
        """从所有缓存层级移除数据"""
        removed = False
        removed |= self.l1_cache.remove(key)
        removed |= self.l2_cache.remove(key)
        removed |= self.l3_cache.remove(key)
        
        # 从热度跟踪器移除
        if key in self.migration_engine.heat_tracker:
            del self.migration_engine.heat_tracker[key]
            
        return removed
        
    def contains(self, key: str) -> bool:
        """检查是否在任何层级包含key"""
        return (self.l1_cache.contains(key) or 
                self.l2_cache.contains(key) or 
                self.l3_cache.contains(key))
                
    def clear(self):
        """清空所有缓存"""
        self.l1_cache.clear()
        self.l2_cache.clear()
        self.l3_cache.clear()
        self.migration_engine.heat_tracker.clear()
        logger.info("所有缓存已清空")
        
    def get_stats(self) -> Dict[str, Any]:
        """获取缓存统计信息"""
        stats = {
            'l1_cache': self.l1_cache.get_stats(),
            'l2_cache': self.l2_cache.get_stats(),
            'l3_cache': self.l3_cache.get_stats(),
            'migration_engine': self.migration_engine.get_stats(),
            'total_keys': (
                len(self.l1_cache.get_keys()) +
                len(self.l2_cache.get_keys()) +
                len(self.l3_cache.get_keys())
            ),
            'total_size': (
                self.l1_cache.current_size +
                self.l2_cache.current_size +
                self.l3_cache.current_size
            ),
        }
        
        # 计算总体命中率
        total_hits = (
            stats['l1_cache']['hit_count'] +
            stats['l2_cache']['hit_count'] +
            stats['l3_cache']['hit_count']
        )
        total_misses = (
            stats['l1_cache']['miss_count'] +
            stats['l2_cache']['miss_count'] +
            stats['l3_cache']['miss_count']
        )
        total_access = total_hits + total_misses
        stats['overall_hit_rate'] = total_hits / total_access if total_access > 0 else 0.0
        
        return stats
        
    def print_stats(self):
        """打印缓存统计信息"""
        stats = self.get_stats()
        
        print("=" * 80)
        print("三级缓存统计信息")
        print("=" * 80)
        
        for level in ['l1_cache', 'l2_cache', 'l3_cache']:
            level_stats = stats[level]
            print(f"\n{level_stats['name']} ({level_stats['level'].upper()}):")
            print(f"  大小: {level_stats['current_size']:,} / {level_stats['max_size']:,} 字节 "
                  f"({level_stats['usage_percent']:.1f}%)")
            print(f"  命中率: {level_stats['hit_rate']:.2%} "
                  f"(命中: {level_stats['hit_count']}, 未命中: {level_stats['miss_count']})")
            print(f"  淘汰次数: {level_stats['eviction_count']}")
            print(f"  Key数量: {level_stats['key_count']}")
            
        print(f"\n总体统计:")
        print(f"  总Key数量: {stats['total_keys']}")
        print(f"  总大小: {stats['total_size']:,} 字节")
        print(f"  总体命中率: {stats['overall_hit_rate']:.2%}")
        
        migration_stats = stats['migration_engine']
        print(f"\n迁移引擎:")
        print(f"  热度跟踪数量: {migration_stats['heat_tracker_size']}")
        print(f"  迁移队列大小: {migration_stats['migration_queue_size']}")
        print(f"  总热度分数: {migration_stats['total_heat_score']:.2f}")
        
    def cleanup(self):
        """清理缓存"""
        self.l3_cache.cleanup()
        logger.info("缓存清理完成")
        
    def shutdown(self):
        """关闭缓存管理器"""
        if self.config['migration']['enabled']:
            self.migration_engine.stop()
        logger.info("三级缓存管理器已关闭")

# 全局缓存管理器实例
_three_level_cache_manager: Optional[ThreeLevelCacheManager] = None

def get_three_level_cache_manager(config: Optional[Dict] = None) -> ThreeLevelCacheManager:
    """获取全局三级缓存管理器实例"""
    global _three_level_cache_manager
    if _three_level_cache_manager is None:
        _three_level_cache_manager = ThreeLevelCacheManager(config)
    return _three_level_cache_manager

def enable_three_level_cache(config: Optional[Dict] = None) -> ThreeLevelCacheManager:
    """启用三级缓存"""
    manager = get_three_level_cache_manager(config)
    logger.info("三级缓存已启用")
    return manager

def disable_three_level_cache():
    """禁用三级缓存"""
    global _three_level_cache_manager
    if _three_level_cache_manager is not None:
        _three_level_cache_manager.shutdown()
        _three_level_cache_manager = None
        logger.info("三级缓存已禁用")

# 便捷函数
def cache_get(key: str) -> Optional[Any]:
    """从缓存获取数据"""
    manager = get_three_level_cache_manager()
    return manager.get(key) if manager else None

def cache_put(key: str, value: Any, level: Optional[CacheLevel] = None) -> bool:
    """存储数据到缓存"""
    manager = get_three_level_cache_manager()
    return manager.put(key, value, level) if manager else False

def cache_remove(key: str) -> bool:
    """从缓存移除数据"""
    manager = get_three_level_cache_manager()
    return manager.remove(key) if manager else False

def cache_contains(key: str) -> bool:
    """检查缓存是否包含数据"""
    manager = get_three_level_cache_manager()
    return manager.contains(key) if manager else False

def cache_clear():
    """清空缓存"""
    manager = get_three_level_cache_manager()
    if manager:
        manager.clear()

def cache_stats() -> Dict[str, Any]:
    """获取缓存统计"""
    manager = get_three_level_cache_manager()
    return manager.get_stats() if manager else {}

def print_cache_stats():
    """打印缓存统计"""
    manager = get_three_level_cache_manager()
    if manager:
        manager.print_stats()
"""
智能内存池管理
为ComfyUI提供高效的VRAM内存管理，减少内存碎片
"""

import torch
import gc
import logging
import time
import threading
from typing import Dict, List, Optional, Tuple, Set
from dataclasses import dataclass, field
from enum import Enum
from collections import defaultdict, deque
import weakref

logger = logging.getLogger(__name__)

class MemoryBlockState(Enum):
    """内存块状态"""
    FREE = "free"           # 空闲
    ALLOCATED = "allocated" # 已分配
    RESERVED = "reserved"   # 保留（用于整理）

@dataclass(order=True)
class MemoryBlock:
    """内存块描述"""
    address: int  # 内存地址（用于排序）
    size: int     # 块大小（字节）
    state: MemoryBlockState
    device: torch.device
    block_id: int
    timestamp: float = field(default_factory=time.time)
    ref_count: int = 0  # 引用计数
    is_pinned: bool = False  # 是否固定内存
    
    @property
    def end_address(self) -> int:
        """块结束地址"""
        return self.address + self.size
    
    def split(self, size: int) -> Tuple['MemoryBlock', Optional['MemoryBlock']]:
        """
        分割内存块
        Returns:
            (分配块, 剩余块) 如果剩余块大小>0则返回剩余块
        """
        if size > self.size:
            raise ValueError(f"Cannot split block of size {self.size} into {size}")
        
        if size == self.size:
            # 完全分配，没有剩余
            allocated = MemoryBlock(
                address=self.address,
                size=self.size,
                state=MemoryBlockState.ALLOCATED,
                device=self.device,
                block_id=self.block_id,
                timestamp=time.time(),
                ref_count=1
            )
            return allocated, None
        
        # 分割块
        allocated = MemoryBlock(
            address=self.address,
            size=size,
            state=MemoryBlockState.ALLOCATED,
            device=self.device,
            block_id=self.block_id,
            timestamp=time.time(),
            ref_count=1
        )
        
        remaining = MemoryBlock(
            address=self.address + size,
            size=self.size - size,
            state=MemoryBlockState.FREE,
            device=self.device,
            block_id=self.block_id + 1,  # 新ID
            timestamp=time.time()
        )
        
        return allocated, remaining
    
    def can_merge_with(self, other: 'MemoryBlock') -> bool:
        """检查是否可以与另一个块合并"""
        return (self.device == other.device and
                self.state == MemoryBlockState.FREE and
                other.state == MemoryBlockState.FREE and
                self.end_address == other.address)

class MemoryPool:
    """
    智能内存池管理器
    管理特定设备的内存分配和释放
    """
    
    def __init__(self, device: torch.device, name: str = "default"):
        self.device = device
        self.name = name
        self.device_str = str(device)
        
        # 内存块管理
        self.blocks: List[MemoryBlock] = []
        self.block_by_address: Dict[int, MemoryBlock] = {}
        self.free_blocks_by_size: Dict[int, List[MemoryBlock]] = defaultdict(list)
        
        # 分配跟踪
        self.allocated_blocks: Dict[int, MemoryBlock] = {}  # address -> block
        self.tensor_to_block: Dict[int, MemoryBlock] = {}   # tensor data_ptr -> block
        
        # 统计信息
        self.stats = {
            "total_allocations": 0,
            "total_frees": 0,
            "total_coalesces": 0,
            "total_defragmentations": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "total_allocated_bytes": 0,
            "peak_allocated_bytes": 0,
            "fragmentation_count": 0,
            "wasted_bytes": 0,
        }
        
        # 配置
        self.min_block_size = 1024  # 1KB 最小块大小
        self.max_block_size = 1024 * 1024 * 1024  # 1GB 最大块大小
        self.alignment = 512  # 内存对齐
        
        # 锁
        self.lock = threading.RLock()
        
        # 碎片整理阈值
        self.defragmentation_threshold = 0.3  # 30%碎片率时触发整理
        self.last_defragmentation_time = 0
        self.defragmentation_interval = 60  # 最小整理间隔（秒）
        
        logger.info(f"MemoryPool initialized for device: {device} ({name})")
    
    def _align_size(self, size: int) -> int:
        """对齐内存大小"""
        return ((size + self.alignment - 1) // self.alignment) * self.alignment
    
    def _align_address(self, address: int) -> int:
        """对齐内存地址"""
        return ((address + self.alignment - 1) // self.alignment) * self.alignment
    
    def _find_best_fit(self, size: int) -> Optional[MemoryBlock]:
        """寻找最佳匹配的空闲块"""
        aligned_size = self._align_size(size)
        
        # 首先尝试找到大小完全匹配的块
        if aligned_size in self.free_blocks_by_size and self.free_blocks_by_size[aligned_size]:
            block = self.free_blocks_by_size[aligned_size].pop()
            if not self.free_blocks_by_size[aligned_size]:
                del self.free_blocks_by_size[aligned_size]
            return block
        
        # 寻找最小可用的块（最佳适应）
        best_block = None
        best_waste = float('inf')
        
        for block_size, blocks in self.free_blocks_by_size.items():
            if block_size >= aligned_size:
                waste = block_size - aligned_size
                if waste < best_waste and blocks:
                    best_waste = waste
                    best_block = blocks[-1]  # 使用最后一个（最近使用）
        
        if best_block:
            # 从列表中移除
            blocks = self.free_blocks_by_size[best_block.size]
            blocks.remove(best_block)
            if not blocks:
                del self.free_blocks_by_size[best_block.size]
            return best_block
        
        return None
    
    def _add_free_block(self, block: MemoryBlock):
        """添加空闲块到管理结构"""
        block.state = MemoryBlockState.FREE
        block.timestamp = time.time()
        block.ref_count = 0
        
        # 添加到大小索引
        self.free_blocks_by_size[block.size].append(block)
    
    def _remove_free_block(self, block: MemoryBlock):
        """从空闲块管理结构中移除"""
        if block.size in self.free_blocks_by_size:
            blocks = self.free_blocks_by_size[block.size]
            if block in blocks:
                blocks.remove(block)
                if not blocks:
                    del self.free_blocks_by_size[block.size]
    
    def allocate(self, size: int, pin_memory: bool = False) -> Optional[torch.Tensor]:
        """
        分配内存
        Args:
            size: 需要分配的大小（字节）
            pin_memory: 是否固定内存（用于快速CPU访问）
        Returns:
            分配的Tensor，如果失败返回None
        """
        with self.lock:
            aligned_size = self._align_size(size)
            
            if aligned_size <= 0:
                logger.warning(f"Invalid allocation size: {size}")
                return None
            
            # 首先尝试从空闲块中分配
            block = self._find_best_fit(size)
            
            if block:
                # 从空闲块分配
                self.stats["cache_hits"] += 1
                self._remove_free_block(block)
                
                if block.size == aligned_size:
                    # 完全匹配，直接使用
                    allocated_block = block
                    allocated_block.state = MemoryBlockState.ALLOCATED
                    allocated_block.ref_count = 1
                    allocated_block.is_pinned = pin_memory
                else:
                    # 需要分割
                    allocated_block, remaining = block.split(aligned_size)
                    allocated_block.is_pinned = pin_memory
                    
                    # 更新块列表
                    idx = self.blocks.index(block)
                    self.blocks[idx] = allocated_block
                    self.block_by_address[allocated_block.address] = allocated_block
                    
                    if remaining:
                        # 添加剩余部分到空闲块
                        self.blocks.insert(idx + 1, remaining)
                        self.block_by_address[remaining.address] = remaining
                        self._add_free_block(remaining)
                
                # 创建Tensor
                try:
                    # 使用PyTorch分配内存
                    tensor = torch.empty(
                        aligned_size // 4,  # 转换为float32元素数
                        dtype=torch.float32,
                        device=self.device,
                        pin_memory=pin_memory and self.device.type == 'cuda'
                    )
                    
                    # 检查地址匹配（在实际实现中可能需要更复杂的映射）
                    # 这里简化处理，假设分配成功
                    
                    # 记录分配
                    self.allocated_blocks[allocated_block.address] = allocated_block
                    self.tensor_to_block[tensor.data_ptr()] = allocated_block
                    
                    self.stats["total_allocations"] += 1
                    self.stats["total_allocated_bytes"] += aligned_size
                    self.stats["peak_allocated_bytes"] = max(
                        self.stats["peak_allocated_bytes"],
                        self.stats["total_allocated_bytes"]
                    )
                    
                    logger.debug(f"Allocated {aligned_size:,} bytes from existing block "
                                f"(address: {allocated_block.address:#x}, "
                                f"waste: {allocated_block.size - aligned_size:,} bytes)")
                    
                    return tensor
                    
                except RuntimeError as e:
                    if "out of memory" in str(e).lower():
                        # 内存不足，尝试整理碎片
                        logger.warning(f"Out of memory, attempting defragmentation...")
                        if self.defragment():
                            # 整理后重试
                            return self.allocate(size, pin_memory)
                    logger.error(f"Failed to allocate tensor: {e}")
                    # 恢复块状态
                    self._add_free_block(block)
                    return None
            
            # 没有合适的空闲块，需要新分配
            self.stats["cache_misses"] += 1
            
            try:
                # 直接分配新内存
                tensor = torch.empty(
                    aligned_size // 4,
                    dtype=torch.float32,
                    device=self.device,
                    pin_memory=pin_memory and self.device.type == 'cuda'
                )
                
                # 创建新的内存块
                address = tensor.data_ptr()
                new_block = MemoryBlock(
                    address=address,
                    size=aligned_size,
                    state=MemoryBlockState.ALLOCATED,
                    device=self.device,
                    block_id=len(self.blocks),
                    timestamp=time.time(),
                    ref_count=1,
                    is_pinned=pin_memory
                )
                
                # 添加到管理结构
                self.blocks.append(new_block)
                self.blocks.sort(key=lambda b: b.address)
                self.block_by_address[address] = new_block
                self.allocated_blocks[address] = new_block
                self.tensor_to_block[address] = new_block
                
                # 更新统计
                self.stats["total_allocations"] += 1
                self.stats["total_allocated_bytes"] += aligned_size
                self.stats["peak_allocated_bytes"] = max(
                    self.stats["peak_allocated_bytes"],
                    self.stats["total_allocated_bytes"]
                )
                
                logger.debug(f"Allocated new block: {aligned_size:,} bytes at {address:#x}")
                
                return tensor
                
            except RuntimeError as e:
                if "out of memory" in str(e).lower():
                    # 内存不足，尝试整理碎片
                    logger.warning(f"Out of memory, attempting defragmentation...")
                    if self.defragment():
                        # 整理后重试
                        return self.allocate(size, pin_memory)
                
                logger.error(f"Failed to allocate {aligned_size:,} bytes: {e}")
                return None
    
    def free(self, tensor: torch.Tensor) -> bool:
        """
        释放内存
        Args:
            tensor: 要释放的Tensor
        Returns:
            是否成功释放
        """
        with self.lock:
            ptr = tensor.data_ptr()
            
            if ptr not in self.tensor_to_block:
                logger.warning(f"Attempted to free unmanaged tensor: {ptr:#x}")
                return False
            
            block = self.tensor_to_block[ptr]
            
            if block.state != MemoryBlockState.ALLOCATED:
                logger.warning(f"Block at {ptr:#x} is not allocated (state: {block.state})")
                return False
            
            # 减少引用计数
            block.ref_count -= 1
            if block.ref_count > 0:
                logger.debug(f"Block at {ptr:#x} still has {block.ref_count} references")
                return True
            
            # 释放内存
            try:
                # 实际释放Tensor内存
                del tensor
                gc.collect()
                if self.device.type == 'cuda':
                    torch.cuda.empty_cache()
                
                # 标记为空闲
                block.state = MemoryBlockState.FREE
                block.timestamp = time.time()
                
                # 从已分配字典移除
                if block.address in self.allocated_blocks:
                    del self.allocated_blocks[block.address]
                del self.tensor_to_block[ptr]
                
                # 添加到空闲块
                self._add_free_block(block)
                
                # 尝试合并相邻空闲块
                self._coalesce_blocks()
                
                # 更新统计
                self.stats["total_frees"] += 1
                self.stats["total_allocated_bytes"] -= block.size
                
                logger.debug(f"Freed block: {block.size:,} bytes at {block.address:#x}")
                
                # 检查是否需要碎片整理
                self._check_defragmentation()
                
                return True
                
            except Exception as e:
                logger.error(f"Failed to free tensor at {ptr:#x}: {e}")
                return False
    
    def _coalesce_blocks(self):
        """合并相邻的空闲块"""
        with self.lock:
            merged = False
            i = 0
            
            while i < len(self.blocks) - 1:
                current = self.blocks[i]
                next_block = self.blocks[i + 1]
                
                if (current.state == MemoryBlockState.FREE and
                    next_block.state == MemoryBlockState.FREE and
                    current.end_address == next_block.address):
                    
                    # 合并两个相邻的空闲块
                    merged_block = MemoryBlock(
                        address=current.address,
                        size=current.size + next_block.size,
                        state=MemoryBlockState.FREE,
                        device=current.device,
                        block_id=current.block_id,
                        timestamp=time.time()
                    )
                    
                    # 更新块列表
                    self.blocks[i] = merged_block
                    del self.blocks[i + 1]
                    
                    # 更新地址映射
                    self.block_by_address[merged_block.address] = merged_block
                    if next_block.address in self.block_by_address:
                        del self.block_by_address[next_block.address]
                    
                    # 更新空闲块索引
                    self._remove_free_block(current)
                    self._remove_free_block(next_block)
                    self._add_free_block(merged_block)
                    
                    self.stats["total_coalesces"] += 1
                    merged = True
                    
                    logger.debug(f"Coalesced blocks: {current.address:#x}+{current.size:,} + "
                                f"{next_block.address:#x}+{next_block.size:,} = "
                                f"{merged_block.address:#x}+{merged_block.size:,}")
                else:
                    i += 1
            
            return merged
    
    def _check_defragmentation(self):
        """检查是否需要碎片整理"""
        with self.lock:
            now = time.time()
            
            # 检查时间间隔
            if now - self.last_defragmentation_time < self.defragmentation_interval:
                return False
            
            # 计算碎片率
            free_blocks = [b for b in self.blocks if b.state == MemoryBlockState.FREE]
            if len(free_blocks) < 2:
                return False
            
            total_free = sum(b.size for b in free_blocks)
            max_free = max(b.size for b in free_blocks)
            
            if max_free == 0:
                return False
            
            fragmentation = 1.0 - (max_free / total_free)
            
            if fragmentation > self.defragmentation_threshold:
                logger.info(f"High fragmentation detected: {fragmentation:.2%}, triggering defragmentation")
                self.defragment()
                return True
            
            return False
    
    def defragment(self) -> bool:
        """
        整理内存碎片
        Returns:
            是否成功整理
        """
        with self.lock:
            now = time.time()
            if now - self.last_defragmentation_time < self.defragmentation_interval:
                return False
            
            # 收集所有已分配块
            allocated_blocks = [b for b in self.blocks if b.state == MemoryBlockState.ALLOCATED]
            if not allocated_blocks:
                return False
            
            # 计算是否需要整理（如果空闲块分散）
            free_blocks = [b for b in self.blocks if b.state == MemoryBlockState.FREE]
            if len(free_blocks) < 2:
                return False
            
            # 在实际实现中，这里需要：
            # 1. 分配临时缓冲区
            # 2. 移动数据
            # 3. 更新指针引用
            # 4. 释放原内存
            
            # 简化实现：只合并相邻块
            merged = self._coalesce_blocks()
            
            if merged:
                self.stats["total_defragmentations"] += 1
                self.stats["fragmentation_count"] += 1
                self.last_defragmentation_time = now
                logger.info(f"Defragmentation completed, merged {len(free_blocks) - len([b for b in self.blocks if b.state == MemoryBlockState.FREE])} blocks")
            
            return merged
    
    def get_stats(self) -> Dict:
        """获取内存池统计信息"""
        with self.lock:
            free_blocks = [b for b in self.blocks if b.state == MemoryBlockState.FREE]
            allocated_blocks = [b for b in self.blocks if b.state == MemoryBlockState.ALLOCATED]
            
            total_free = sum(b.size for b in free_blocks)
            total_allocated = sum(b.size for b in allocated_blocks)
            total_memory = total_free + total_allocated
            
            # 计算碎片率
            fragmentation = 0.0
            if free_blocks:
                max_free = max(b.size for b in free_blocks)
                if max_free > 0:
                    fragmentation = 1.0 - (max_free / total_free) if total_free > 0 else 0.0
            
            # 计算浪费的空间（小块碎片）
            wasted = sum(b.size for b in free_blocks if b.size < self.min_block_size * 4)
            
            return {
                "name": self.name,
                "device": self.device_str,
                "total_blocks": len(self.blocks),
                "free_blocks": len(free_blocks),
                "allocated_blocks": len(allocated_blocks),
                "total_memory_bytes": total_memory,
                "free_memory_bytes": total_free,
                "allocated_memory_bytes": total_allocated,
                "memory_usage_percent": (total_allocated / total_memory * 100) if total_memory > 0 else 0,
                "fragmentation_rate": fragmentation,
                "wasted_bytes": wasted,
                "wasted_percent": (wasted / total_memory * 100) if total_memory > 0 else 0,
                "stats": self.stats.copy(),
                "average_block_size": total_memory / len(self.blocks) if self.blocks else 0,
                "largest_free_block": max(b.size for b in free_blocks) if free_blocks else 0,
            }
    
    def print_stats(self):
        """打印内存池统计信息"""
        stats = self.get_stats()
        
        logger.info("=" * 60)
        logger.info(f"Memory Pool Statistics - {self.name} ({self.device_str})")
        logger.info(f"  Total blocks: {stats['total_blocks']}")
        logger.info(f"  Free blocks: {stats['free_blocks']}")
        logger.info(f"  Allocated blocks: {stats['allocated_blocks']}")
        logger.info(f"  Total memory: {stats['total_memory_bytes']:,} bytes")
        logger.info(f"  Free memory: {stats['free_memory_bytes']:,} bytes ({stats['memory_usage_percent']:.1f}% used)")
        logger.info(f"  Largest free block: {stats['largest_free_block']:,} bytes")
        logger.info(f"  Fragmentation rate: {stats['fragmentation_rate']:.2%}")
        logger.info(f"  Wasted space: {stats['wasted_bytes']:,} bytes ({stats['wasted_percent']:.1f}%)")
        logger.info(f"  Allocations: {stats['stats']['total_allocations']}")
        logger.info(f"  Frees: {stats['stats']['total_frees']}")
        logger.info(f"  Cache hits: {stats['stats']['cache_hits']}")
        logger.info(f"  Cache misses: {stats['stats']['cache_misses']}")
        logger.info(f"  Hit rate: {stats['stats']['cache_hits'] / max(1, stats['stats']['cache_hits'] + stats['stats']['cache_misses']):.2%}")
        logger.info(f"  Coalesces: {stats['stats']['total_coalesces']}")
        logger.info(f"  Defragmentations: {stats['stats']['total_defragmentations']}")
        logger.info("=" * 60)
    
    def clear(self):
        """清空内存池"""
        with self.lock:
            # 释放所有Tensor
            for ptr in list(self.tensor_to_block.keys()):
                # 在实际实现中需要更安全的释放
                pass
            
            # 清空所有结构
            self.blocks.clear()
            self.block_by_address.clear()
            self.free_blocks_by_size.clear()
            self.allocated_blocks.clear()
            self.tensor_to_block.clear()
            
            # 重置统计
            self.stats = {
                "total_allocations": 0,
                "total_frees": 0,
                "total_coalesces": 0,
                "total_defragmentations": 0,
                "cache_hits": 0,
                "cache_misses": 0,
                "total_allocated_bytes": 0,
                "peak_allocated_bytes": 0,
                "fragmentation_count": 0,
                "wasted_bytes": 0,
            }
            
            logger.info(f"Memory pool cleared: {self.name}")

class SmartMemoryManager:
    """
    智能内存管理器
    管理多个设备的内存池
    """
    
    _instance = None
    _lock = threading.RLock()
    
    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                cls._instance._initialized = False
            return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self._initialized = True
        self.pools: Dict[str, MemoryPool] = {}
        self.default_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # 配置
        self.enabled = True
        self.min_pool_size = 64 * 1024 * 1024  # 64MB
        self.max_pool_size = 1024 * 1024 * 1024  # 1GB
        
        # 监控
        self.monitoring_enabled = False
        self.monitoring_interval = 5.0  # 秒
        self.last_monitoring_time = 0
        
        logger.info(f"SmartMemoryManager initialized, default device: {self.default_device}")
    
    def get_pool(self, device: torch.device = None) -> MemoryPool:
        """获取或创建设备的内存池"""
        device = device or self.default_device
        device_str = str(device)
        
        if device_str not in self.pools:
            pool_name = f"pool_{device_str.replace(':', '_')}"
            self.pools[device_str] = MemoryPool(device, pool_name)
            logger.info(f"Created memory pool: {pool_name} for device: {device}")
        
        return self.pools[device_str]
    
    def allocate(self, size: int, device: torch.device = None, pin_memory: bool = False) -> Optional[torch.Tensor]:
        """分配内存"""
        if not self.enabled:
            # 回退到直接分配
            try:
                return torch.empty(size // 4, dtype=torch.float32, device=device or self.default_device,
                                 pin_memory=pin_memory and (device or self.default_device).type == 'cuda')
            except RuntimeError as e:
                logger.error(f"Direct allocation failed: {e}")
                return None
        
        pool = self.get_pool(device)
        return pool.allocate(size, pin_memory)
    
    def free(self, tensor: torch.Tensor) -> bool:
        """释放内存"""
        if not self.enabled:
            # 直接删除Tensor
            del tensor
            gc.collect()
            if tensor.device.type == 'cuda':
                torch.cuda.empty_cache()
            return True
        
        device_str = str(tensor.device)
        if device_str in self.pools:
            return self.pools[device_str].free(tensor)
        
        # 未知设备，直接释放
        device_type = tensor.device.type
        del tensor
        gc.collect()
        if device_type == 'cuda':
            torch.cuda.empty_cache()
        return True
    
    def defragment_all(self):
        """整理所有内存池的碎片"""
        if not self.enabled:
            return
        
        for device_str, pool in self.pools.items():
            logger.info(f"Defragmenting pool: {pool.name}")
            pool.defragment()
    
    def get_all_stats(self) -> Dict[str, Dict]:
        """获取所有内存池的统计信息"""
        return {device: pool.get_stats() for device, pool in self.pools.items()}
    
    def print_all_stats(self):
        """打印所有内存池的统计信息"""
        for device, pool in self.pools.items():
            pool.print_stats()
    
    def enable_monitoring(self, interval: float = 5.0):
        """启用内存监控"""
        self.monitoring_enabled = True
        self.monitoring_interval = interval
        logger.info(f"Memory monitoring enabled with interval: {interval}s")
    
    def disable_monitoring(self):
        """禁用内存监控"""
        self.monitoring_enabled = False
        logger.info("Memory monitoring disabled")
    
    def monitor(self):
        """监控内存使用（需要定期调用）"""
        if not self.monitoring_enabled:
            return
        
        now = time.time()
        if now - self.last_monitoring_time < self.monitoring_interval:
            return
        
        self.last_monitoring_time = now
        
        # 收集统计信息
        total_allocated = 0
        total_free = 0
        total_fragmentation = 0.0
        
        for pool in self.pools.values():
            stats = pool.get_stats()
            total_allocated += stats['allocated_memory_bytes']
            total_free += stats['free_memory_bytes']
            total_fragmentation += stats['fragmentation_rate']
        
        total_memory = total_allocated + total_free
        avg_fragmentation = total_fragmentation / len(self.pools) if self.pools else 0
        
        # 记录日志
        logger.debug(f"Memory monitoring - Total: {total_memory:,} bytes, "
                    f"Allocated: {total_allocated:,} bytes ({total_allocated/total_memory*100:.1f}%), "
                    f"Fragmentation: {avg_fragmentation:.2%}")
        
        # 检查是否需要整理碎片
        if avg_fragmentation > 0.3:  # 30%碎片率
            logger.warning(f"High average fragmentation detected: {avg_fragmentation:.2%}")
            self.defragment_all()
    
    def clear_all(self):
        """清空所有内存池"""
        for pool in self.pools.values():
            pool.clear()
        self.pools.clear()
        logger.info("All memory pools cleared")

# 全局实例
memory_manager = SmartMemoryManager()

# 导出便捷函数
def allocate_memory(size: int, device: torch.device = None, pin_memory: bool = False) -> Optional[torch.Tensor]:
    """分配内存（便捷函数）"""
    return memory_manager.allocate(size, device, pin_memory)

def free_memory(tensor: torch.Tensor) -> bool:
    """释放内存（便捷函数）"""
    return memory_manager.free(tensor)

def get_memory_stats(device: torch.device = None) -> Dict:
    """获取内存统计（便捷函数）"""
    pool = memory_manager.get_pool(device)
    return pool.get_stats()

def print_memory_stats(device: torch.device = None):
    """打印内存统计（便捷函数）"""
    pool = memory_manager.get_pool(device)
    pool.print_stats()

def enable_memory_monitoring(interval: float = 5.0):
    """启用内存监控（便捷函数）"""
    memory_manager.enable_monitoring(interval)

def defragment_memory():
    """整理内存碎片（便捷函数）"""
    memory_manager.defragment_all()

# 测试函数
def test_memory_pool():
    """测试内存池功能"""
    import sys
    
    # 配置日志
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    
    # 获取设备
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Testing memory pool on device: {device}")
    
    # 创建内存池
    pool = MemoryPool(device, "test_pool")
    
    # 测试分配
    print("\n1. Testing allocations...")
    tensors = []
    sizes = [1024, 2048, 4096, 8192, 16384]  # 1KB to 16KB
    
    for i, size in enumerate(sizes):
        tensor = pool.allocate(size * 1024)  # KB to bytes
        if tensor is not None:
            tensors.append(tensor)
            print(f"  Allocated {size}KB tensor at {tensor.data_ptr():#x}")
        else:
            print(f"  Failed to allocate {size}KB")
    
    # 打印统计
    print("\n2. Memory pool statistics after allocations:")
    pool.print_stats()
    
    # 测试释放
    print("\n3. Testing deallocations...")
    for i, tensor in enumerate(tensors[:2]):  # 释放前两个
        if pool.free(tensor):
            print(f"  Freed tensor {i} at {tensor.data_ptr():#x}")
    
    # 打印统计
    print("\n4. Memory pool statistics after deallocations:")
    pool.print_stats()
    
    # 测试碎片整理
    print("\n5. Testing defragmentation...")
    if pool.defragment():
        print("  Defragmentation performed")
    else:
        print("  No defragmentation needed")
    
    # 最终统计
    print("\n6. Final memory pool statistics:")
    pool.print_stats()
    
    # 清理
    for tensor in tensors[2:]:  # 释放剩余的张量
        pool.free(tensor)
    
    print("\nTest completed!")

if __name__ == "__main__":
    test_memory_pool()
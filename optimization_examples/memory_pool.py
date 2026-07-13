"""
内存池管理优化示例
为ComfyUI提供智能内存管理，减少VRAM碎片
"""

import torch
import gc
import logging
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import threading
import time

logger = logging.getLogger(__name__)

class MemoryBlockState(Enum):
    FREE = "free"
    ALLOCATED = "allocated"
    RESERVED = "reserved"

@dataclass
class MemoryBlock:
    """内存块描述"""
    ptr: int
    size: int
    state: MemoryBlockState
    timestamp: float
    device: torch.device
    block_id: int
    
    def __lt__(self, other):
        return self.ptr < other.ptr

class MemoryPool:
    """
    智能内存池管理器
    减少VRAM碎片，提高内存利用率
    """
    
    def __init__(self, device: torch.device = None):
        self.device = device or torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.blocks: List[MemoryBlock] = []
        self.free_blocks: Dict[int, MemoryBlock] = {}  # size -> block
        self.allocated_blocks: Dict[int, MemoryBlock] = {}  # ptr -> block
        self.next_block_id = 0
        self.lock = threading.RLock()
        self.total_allocated = 0
        self.max_allocated = 0
        self.fragmentation_count = 0
        
        # 统计信息
        self.stats = {
            "allocations": 0,
            "frees": 0,
            "coalesces": 0,
            "defragmentations": 0,
            "cache_hits": 0,
            "cache_misses": 0
        }
    
    def allocate(self, size: int, alignment: int = 512) -> Optional[int]:
        """
        分配内存
        Args:
            size: 需要分配的大小（字节）
            alignment: 内存对齐要求
        Returns:
            分配的内存指针，如果失败返回None
        """
        with self.lock:
            # 对齐调整
            aligned_size = ((size + alignment - 1) // alignment) * alignment
            
            # 首先尝试从空闲块中分配
            best_block = None
            best_waste = float('inf')
            
            for block_size, block in list(self.free_blocks.items()):
                if block.size >= aligned_size:
                    waste = block.size - aligned_size
                    if waste < best_waste:
                        best_waste = waste
                        best_block = block
            
            if best_block:
                # 从空闲块中分配
                self.stats["cache_hits"] += 1
                return self._allocate_from_block(best_block, aligned_size)
            
            # 没有合适的空闲块，分配新内存
            self.stats["cache_misses"] += 1
            try:
                # 使用PyTorch分配内存
                tensor = torch.empty(aligned_size // 4, dtype=torch.float32, device=self.device)
                ptr = tensor.data_ptr()
                
                # 创建新的内存块
                block = MemoryBlock(
                    ptr=ptr,
                    size=aligned_size,
                    state=MemoryBlockState.ALLOCATED,
                    timestamp=time.time(),
                    device=self.device,
                    block_id=self.next_block_id
                )
                self.next_block_id += 1
                
                # 添加到已分配块列表
                self.allocated_blocks[ptr] = block
                self.blocks.append(block)
                self.blocks.sort()
                
                # 更新统计信息
                self.total_allocated += aligned_size
                self.max_allocated = max(self.max_allocated, self.total_allocated)
                self.stats["allocations"] += 1
                
                logger.debug(f"Allocated {aligned_size} bytes at {ptr:#x}, total: {self.total_allocated:,} bytes")
                return ptr
                
            except RuntimeError as e:
                if "out of memory" in str(e).lower():
                    # 内存不足，尝试整理碎片
                    logger.warning(f"Out of memory, attempting defragmentation...")
                    if self.defragment():
                        # 整理后重试
                        return self.allocate(size, alignment)
                logger.error(f"Failed to allocate {size} bytes: {e}")
                return None
    
    def _allocate_from_block(self, block: MemoryBlock, size: int) -> int:
        """从现有块中分配内存"""
        with self.lock:
            # 从空闲块中移除
            del self.free_blocks[block.size]
            
            if block.size == size:
                # 完全匹配，直接使用整个块
                block.state = MemoryBlockState.ALLOCATED
                self.allocated_blocks[block.ptr] = block
                self.total_allocated += size
                return block.ptr
            else:
                # 分割块
                allocated_block = MemoryBlock(
                    ptr=block.ptr,
                    size=size,
                    state=MemoryBlockState.ALLOCATED,
                    timestamp=time.time(),
                    device=block.device,
                    block_id=self.next_block_id
                )
                self.next_block_id += 1
                
                # 剩余部分作为新空闲块
                remaining_block = MemoryBlock(
                    ptr=block.ptr + size,
                    size=block.size - size,
                    state=MemoryBlockState.FREE,
                    timestamp=time.time(),
                    device=block.device,
                    block_id=self.next_block_id
                )
                self.next_block_id += 1
                
                # 更新块列表
                idx = self.blocks.index(block)
                self.blocks[idx] = allocated_block
                self.blocks.insert(idx + 1, remaining_block)
                
                # 更新字典
                self.allocated_blocks[allocated_block.ptr] = allocated_block
                self.free_blocks[remaining_block.size] = remaining_block
                
                self.total_allocated += size
                self.stats["allocations"] += 1
                
                logger.debug(f"Split block: allocated {size} bytes, remaining {remaining_block.size} bytes")
                return allocated_block.ptr
    
    def free(self, ptr: int) -> bool:
        """
        释放内存
        Args:
            ptr: 要释放的内存指针
        Returns:
            是否成功释放
        """
        with self.lock:
            if ptr not in self.allocated_blocks:
                logger.warning(f"Attempted to free unallocated pointer: {ptr:#x}")
                return False
            
            block = self.allocated_blocks[ptr]
            block.state = MemoryBlockState.FREE
            block.timestamp = time.time()
            
            # 从已分配字典移除，添加到空闲字典
            del self.allocated_blocks[ptr]
            self.free_blocks[block.size] = block
            
            # 更新统计
            self.total_allocated -= block.size
            self.stats["frees"] += 1
            
            logger.debug(f"Freed {block.size} bytes at {ptr:#x}, total: {self.total_allocated:,} bytes")
            
            # 尝试合并相邻的空闲块
            self._coalesce_blocks()
            
            return True
    
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
                    current.ptr + current.size == next_block.ptr):
                    
                    # 合并两个相邻的空闲块
                    merged_block = MemoryBlock(
                        ptr=current.ptr,
                        size=current.size + next_block.size,
                        state=MemoryBlockState.FREE,
                        timestamp=time.time(),
                        device=current.device,
                        block_id=self.next_block_id
                    )
                    self.next_block_id += 1
                    
                    # 更新块列表
                    self.blocks[i] = merged_block
                    del self.blocks[i + 1]
                    
                    # 更新空闲字典
                    if current.size in self.free_blocks:
                        del self.free_blocks[current.size]
                    if next_block.size in self.free_blocks:
                        del self.free_blocks[next_block.size]
                    self.free_blocks[merged_block.size] = merged_block
                    
                    self.stats["coalesces"] += 1
                    merged = True
                    logger.debug(f"Coalesced blocks: {current.ptr:#x}+{current.size} + {next_block.ptr:#x}+{next_block.size} = {merged_block.ptr:#x}+{merged_block.size}")
                else:
                    i += 1
            
            return merged
    
    def defragment(self) -> bool:
        """
        整理内存碎片
        Returns:
            是否成功整理
        """
        with self.lock:
            # 收集所有空闲块
            free_blocks = [b for b in self.blocks if b.state == MemoryBlockState.FREE]
            if len(free_blocks) < 2:
                return False  # 没有足够碎片
            
            # 计算碎片率
            total_free = sum(b.size for b in free_blocks)
            if total_free == 0:
                return False
            
            # 尝试移动数据来合并碎片
            # 这里简化实现，实际需要更复杂的算法
            logger.info(f"Defragmenting {len(free_blocks)} free blocks, total {total_free:,} bytes")
            
            # 标记为正在整理
            for block in free_blocks:
                block.state = MemoryBlockState.RESERVED
            
            # 在实际实现中，这里需要：
            # 1. 分配临时缓冲区
            # 2. 移动数据
            # 3. 更新指针引用
            # 4. 释放原内存
            
            # 简化：只合并相邻块
            self._coalesce_blocks()
            
            self.stats["defragmentations"] += 1
            self.fragmentation_count += 1
            
            return True
    
    def get_stats(self) -> Dict:
        """获取内存池统计信息"""
        with self.lock:
            free_blocks = [b for b in self.blocks if b.state == MemoryBlockState.FREE]
            allocated_blocks = [b for b in self.blocks if b.state == MemoryBlockState.ALLOCATED]
            
            total_free = sum(b.size for b in free_blocks)
            total_allocated = sum(b.size for b in allocated_blocks)
            
            # 计算碎片率
            fragmentation = 0
            if free_blocks:
                avg_free_size = total_free / len(free_blocks)
                max_free_size = max(b.size for b in free_blocks)
                if max_free_size > 0:
                    fragmentation = 1 - (avg_free_size / max_free_size)
            
            return {
                "total_blocks": len(self.blocks),
                "free_blocks": len(free_blocks),
                "allocated_blocks": len(allocated_blocks),
                "total_free_bytes": total_free,
                "total_allocated_bytes": total_allocated,
                "max_allocated_bytes": self.max_allocated,
                "fragmentation_rate": fragmentation,
                "fragmentation_count": self.fragmentation_count,
                "stats": self.stats.copy()
            }
    
    def print_stats(self):
        """打印内存池统计信息"""
        stats = self.get_stats()
        logger.info("=" * 60)
        logger.info("Memory Pool Statistics:")
        logger.info(f"  Total blocks: {stats['total_blocks']}")
        logger.info(f"  Free blocks: {stats['free_blocks']}")
        logger.info(f"  Allocated blocks: {stats['allocated_blocks']}")
        logger.info(f"  Total free: {stats['total_free_bytes']:,} bytes")
        logger.info(f"  Total allocated: {stats['total_allocated_bytes']:,} bytes")
        logger.info(f"  Max allocated: {stats['max_allocated_bytes']:,} bytes")
        logger.info(f"  Fragmentation rate: {stats['fragmentation_rate']:.2%}")
        logger.info(f"  Allocations: {stats['stats']['allocations']}")
        logger.info(f"  Frees: {stats['stats']['frees']}")
        logger.info(f"  Cache hits: {stats['stats']['cache_hits']}")
        logger.info(f"  Cache misses: {stats['stats']['cache_misses']}")
        logger.info(f"  Hit rate: {stats['stats']['cache_hits'] / max(1, stats['stats']['cache_hits'] + stats['stats']['cache_misses']):.2%}")
        logger.info("=" * 60)

class SmartMemoryManager:
    """
    智能内存管理器
    集成到ComfyUI的model_management中
    """
    
    _instance = None
    _lock = threading.Lock()
    
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
        
        # 初始化默认内存池
        self.get_pool(self.default_device)
        
        logger.info(f"SmartMemoryManager initialized on device: {self.default_device}")
    
    def get_pool(self, device: torch.device) -> MemoryPool:
        """获取或创建设备的内存池"""
        device_str = str(device)
        if device_str not in self.pools:
            self.pools[device_str] = MemoryPool(device)
            logger.info(f"Created memory pool for device: {device}")
        return self.pools[device_str]
    
    def allocate(self, size: int, device: torch.device = None, alignment: int = 512) -> Optional[int]:
        """分配内存"""
        device = device or self.default_device
        pool = self.get_pool(device)
        return pool.allocate(size, alignment)
    
    def free(self, ptr: int, device: torch.device = None) -> bool:
        """释放内存"""
        device = device or self.default_device
        device_str = str(device)
        if device_str in self.pools:
            return self.pools[device_str].free(ptr)
        return False
    
    def defragment_all(self):
        """整理所有内存池的碎片"""
        for device_str, pool in self.pools.items():
            logger.info(f"Defragmenting pool for device: {device_str}")
            pool.defragment()
    
    def get_all_stats(self) -> Dict[str, Dict]:
        """获取所有内存池的统计信息"""
        return {device: pool.get_stats() for device, pool in self.pools.items()}
    
    def print_all_stats(self):
        """打印所有内存池的统计信息"""
        for device, pool in self.pools.items():
            logger.info(f"\nMemory pool for {device}:")
            pool.print_stats()

# 集成到ComfyUI的示例
def integrate_with_comfyui():
    """
    将智能内存管理器集成到ComfyUI的示例
    """
    import comfy.model_management as mm
    
    # 创建全局内存管理器实例
    memory_manager = SmartMemoryManager()
    
    # 包装原有的内存分配函数
    original_soft_empty_cache = mm.soft_empty_cache
    original_unload_all_models = mm.unload_all_models
    
    def enhanced_soft_empty_cache():
        """增强的内存清理函数"""
        logger.info("Enhanced memory cleanup started")
        
        # 先使用原有的清理逻辑
        original_soft_empty_cache()
        
        # 添加智能内存整理
        memory_manager.defragment_all()
        
        # 打印统计信息
        memory_manager.print_all_stats()
        
        logger.info("Enhanced memory cleanup completed")
    
    def enhanced_unload_all_models():
        """增强的模型卸载函数"""
        logger.info("Enhanced model unloading started")
        
        # 先使用原有的卸载逻辑
        original_unload_all_models()
        
        # 整理内存碎片
        memory_manager.defragment_all()
        
        logger.info("Enhanced model unloading completed")
    
    # 替换原有函数
    mm.soft_empty_cache = enhanced_soft_empty_cache
    mm.unload_all_models = enhanced_unload_all_models
    
    logger.info("Smart memory management integrated with ComfyUI")

# 使用示例
if __name__ == "__main__":
    # 配置日志
    logging.basicConfig(level=logging.INFO)
    
    # 测试内存池
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    pool = MemoryPool(device)
    
    # 分配一些内存
    pointers = []
    for i in range(5):
        ptr = pool.allocate(1024 * 1024)  # 1MB
        if ptr:
            pointers.append(ptr)
            print(f"Allocated {i}: {ptr:#x}")
    
    # 释放部分内存
    for i in range(2):
        if pointers:
            ptr = pointers.pop()
            pool.free(ptr)
            print(f"Freed: {ptr:#x}")
    
    # 打印统计信息
    pool.print_stats()
    
    # 测试智能内存管理器
    manager = SmartMemoryManager()
    
    # 分配内存
    ptr1 = manager.allocate(2048 * 1024)  # 2MB
    ptr2 = manager.allocate(4096 * 1024)  # 4MB
    
    print(f"\nSmart manager allocations:")
    print(f"  ptr1: {ptr1:#x}")
    print(f"  ptr2: {ptr2:#x}")
    
    # 打印所有统计信息
    manager.print_all_stats()
    
    # 整理碎片
    manager.defragment_all()
    
    # 最终统计
    print("\nFinal statistics:")
    manager.print_all_stats()
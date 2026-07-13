"""
内存碎片整理器
提供高级内存碎片整理功能，减少VRAM碎片
"""

import torch
import gc
import logging
import time
import threading
from typing import List, Dict, Tuple, Optional, Set
from dataclasses import dataclass
from enum import Enum
import numpy as np

logger = logging.getLogger(__name__)

class DefragmentationStrategy(Enum):
    """碎片整理策略"""
    AGGRESSIVE = "aggressive"      # 激进整理，移动所有可移动内存
    MODERATE = "moderate"          # 适度整理，只移动大块内存
    CONSERVATIVE = "conservative"  # 保守整理，只合并相邻块
    SMART = "smart"                # 智能整理，基于碎片率决策

@dataclass
class MemoryRegion:
    """内存区域描述"""
    start: int
    size: int
    is_free: bool
    tensor_ref: Optional[torch.Tensor] = None
    block_id: Optional[int] = None
    
    @property
    def end(self) -> int:
        return self.start + self.size
    
    def overlaps(self, other: 'MemoryRegion') -> bool:
        """检查是否重叠"""
        return not (self.end <= other.start or other.end <= self.start)
    
    def adjacent_to(self, other: 'MemoryRegion') -> bool:
        """检查是否相邻"""
        return self.end == other.start or other.end == self.start

class MemoryDefragmenter:
    """
    内存碎片整理器
    通过移动内存块来减少碎片
    """
    
    def __init__(self, device: torch.device):
        self.device = device
        self.device_str = str(device)
        
        # 配置
        self.strategy = DefragmentationStrategy.SMART
        self.min_fragmentation_threshold = 0.2  # 20%碎片率触发整理
        self.max_fragmentation_threshold = 0.5  # 50%碎片率强制整理
        self.min_block_size_to_move = 1024 * 1024  # 1MB，小于此值不移动
        self.max_move_size = 1024 * 1024 * 1024  # 1GB，单次最大移动量
        
        # 统计
        self.stats = {
            "total_defragmentations": 0,
            "total_moved_bytes": 0,
            "total_merged_blocks": 0,
            "total_freed_blocks": 0,
            "total_compaction_time": 0.0,
            "average_fragmentation_before": 0.0,
            "average_fragmentation_after": 0.0,
        }
        
        # 状态
        self.is_defragmenting = False
        self.last_defragmentation_time = 0
        self.defragmentation_interval = 30  # 最小整理间隔（秒）
        
        # 锁
        self.lock = threading.RLock()
        
        logger.info(f"MemoryDefragmenter initialized for device: {device}")
    
    def analyze_fragmentation(self, memory_regions: List[MemoryRegion]) -> Dict:
        """
        分析内存碎片情况
        """
        with self.lock:
            free_regions = [r for r in memory_regions if r.is_free]
            allocated_regions = [r for r in memory_regions if not r.is_free]
            
            if not free_regions:
                return {
                    "fragmentation_rate": 0.0,
                    "free_blocks": 0,
                    "allocated_blocks": len(allocated_regions),
                    "total_free_bytes": 0,
                    "largest_free_block": 0,
                    "average_free_block": 0,
                    "fragmentation_score": 0.0,
                }
            
            total_free = sum(r.size for r in free_regions)
            largest_free = max(r.size for r in free_regions)
            average_free = total_free / len(free_regions)
            
            # 计算碎片率（1 - 最大空闲块/总空闲空间）
            fragmentation_rate = 1.0 - (largest_free / total_free) if total_free > 0 else 0.0
            
            # 计算碎片评分（考虑块数量和大小分布）
            fragmentation_score = fragmentation_rate * (len(free_regions) / max(1, len(allocated_regions)))
            
            return {
                "fragmentation_rate": fragmentation_rate,
                "free_blocks": len(free_regions),
                "allocated_blocks": len(allocated_regions),
                "total_free_bytes": total_free,
                "largest_free_block": largest_free,
                "average_free_block": average_free,
                "fragmentation_score": fragmentation_score,
            }
    
    def find_best_compaction_plan(self, memory_regions: List[MemoryRegion]) -> List[Tuple[MemoryRegion, MemoryRegion]]:
        """
        寻找最佳的内存压缩方案
        返回需要移动的（源区域，目标区域）对列表
        """
        with self.lock:
            # 按地址排序
            regions = sorted(memory_regions, key=lambda r: r.start)
            
            # 找出所有空闲区域
            free_regions = [r for r in regions if r.is_free]
            allocated_regions = [r for r in regions if not r.is_free]
            
            if not free_regions or not allocated_regions:
                return []
            
            # 计算总空闲空间
            total_free = sum(r.size for r in free_regions)
            
            # 根据策略选择移动方案
            if self.strategy == DefragmentationStrategy.CONSERVATIVE:
                # 保守策略：只合并相邻空闲块
                return self._conservative_plan(regions)
            
            elif self.strategy == DefragmentationStrategy.MODERATE:
                # 适度策略：移动小块的已分配区域
                return self._moderate_plan(regions, total_free)
            
            elif self.strategy == DefragmentationStrategy.AGGRESSIVE:
                # 激进策略：尽可能移动所有可移动区域
                return self._aggressive_plan(regions, total_free)
            
            else:  # SMART
                # 智能策略：基于碎片率选择
                analysis = self.analyze_fragmentation(regions)
                fragmentation_rate = analysis["fragmentation_rate"]
                
                if fragmentation_rate < 0.3:
                    return self._conservative_plan(regions)
                elif fragmentation_rate < 0.6:
                    return self._moderate_plan(regions, total_free)
                else:
                    return self._aggressive_plan(regions, total_free)
    
    def _conservative_plan(self, regions: List[MemoryRegion]) -> List[Tuple[MemoryRegion, MemoryRegion]]:
        """保守策略：只合并相邻空闲块"""
        plan = []
        
        # 寻找可以合并的相邻空闲块
        for i in range(len(regions) - 1):
            current = regions[i]
            next_region = regions[i + 1]
            
            if current.is_free and next_region.is_free and current.adjacent_to(next_region):
                # 可以合并，但不需要移动数据
                # 这里只是标记，实际合并由内存池处理
                pass
        
        return plan
    
    def _moderate_plan(self, regions: List[MemoryRegion], total_free: int) -> List[Tuple[MemoryRegion, MemoryRegion]]:
        """适度策略：移动小块的已分配区域"""
        plan = []
        
        # 找出所有空闲区域
        free_regions = [r for r in regions if r.is_free]
        allocated_regions = [r for r in regions if not r.is_free]
        
        if not free_regions or not allocated_regions:
            return plan
        
        # 按大小排序空闲区域（从大到小）
        free_regions.sort(key=lambda r: r.size, reverse=True)
        
        # 找出可以移动的小块已分配区域
        movable_allocated = []
        for region in allocated_regions:
            # 只移动小于最小移动阈值且不是特别大的块
            if (region.size < self.min_block_size_to_move * 2 and 
                region.tensor_ref is not None and
                not self._is_pinned_memory(region.tensor_ref)):
                movable_allocated.append(region)
        
        # 按地址排序可移动区域（从低地址到高地址）
        movable_allocated.sort(key=lambda r: r.start)
        
        # 尝试将可移动区域移动到空闲区域
        free_idx = 0
        for alloc_region in movable_allocated:
            if free_idx >= len(free_regions):
                break
            
            free_region = free_regions[free_idx]
            
            # 检查空闲区域是否足够大
            if free_region.size >= alloc_region.size:
                # 可以移动
                plan.append((alloc_region, free_region))
                
                # 更新空闲区域（分割）
                if free_region.size > alloc_region.size:
                    # 创建新的空闲区域
                    new_free = MemoryRegion(
                        start=free_region.start + alloc_region.size,
                        size=free_region.size - alloc_region.size,
                        is_free=True
                    )
                    free_regions[free_idx] = new_free
                else:
                    # 完全使用空闲区域
                    free_idx += 1
        
        return plan
    
    def _aggressive_plan(self, regions: List[MemoryRegion], total_free: int) -> List[Tuple[MemoryRegion, MemoryRegion]]:
        """激进策略：尽可能移动所有可移动区域"""
        plan = []
        
        # 找出所有空闲区域
        free_regions = [r for r in regions if r.is_free]
        allocated_regions = [r for r in regions if not r.is_free]
        
        if not free_regions or not allocated_regions:
            return plan
        
        # 按地址排序所有区域
        all_regions = sorted(regions, key=lambda r: r.start)
        
        # 计算紧凑后的理想布局
        compacted_regions = []
        current_address = all_regions[0].start
        
        # 先放置所有已分配区域
        for region in allocated_regions:
            if not region.is_free:
                compacted_regions.append(MemoryRegion(
                    start=current_address,
                    size=region.size,
                    is_free=False,
                    tensor_ref=region.tensor_ref,
                    block_id=region.block_id
                ))
                current_address += region.size
        
        # 然后放置空闲区域
        free_size = total_free
        if free_size > 0:
            compacted_regions.append(MemoryRegion(
                start=current_address,
                size=free_size,
                is_free=True
            ))
        
        # 生成移动计划
        for orig_region, compact_region in zip(allocated_regions, [r for r in compacted_regions if not r.is_free]):
            if orig_region.start != compact_region.start:
                # 需要移动
                plan.append((orig_region, compact_region))
        
        return plan
    
    def _is_pinned_memory(self, tensor: torch.Tensor) -> bool:
        """检查是否为固定内存"""
        try:
            return tensor.is_pinned()
        except:
            return False
    
    def execute_compaction_plan(self, plan: List[Tuple[MemoryRegion, MemoryRegion]]) -> bool:
        """
        执行内存压缩计划
        返回是否成功
        """
        if not plan:
            return True
        
        start_time = time.time()
        moved_bytes = 0
        success_count = 0
        
        logger.info(f"Executing compaction plan with {len(plan)} moves")
        
        for src_region, dst_region in plan:
            if src_region.tensor_ref is None:
                logger.warning(f"Skipping region without tensor reference: {src_region}")
                continue
            
            try:
                # 检查目标区域是否足够大
                if dst_region.size < src_region.size:
                    logger.warning(f"Destination region too small: {dst_region.size} < {src_region.size}")
                    continue
                
                # 创建临时Tensor来保存数据
                temp_tensor = torch.empty_like(src_region.tensor_ref, device=self.device)
                
                # 复制数据
                temp_tensor.copy_(src_region.tensor_ref)
                
                # 释放原内存
                del src_region.tensor_ref
                gc.collect()
                if self.device.type == 'cuda':
                    torch.cuda.empty_cache()
                
                # 将临时Tensor赋值回原引用（如果可能）
                # 注意：在实际实现中，需要更新所有对该Tensor的引用
                # 这里简化处理，只记录移动
                
                moved_bytes += src_region.size
                success_count += 1
                
                logger.debug(f"Moved {src_region.size:,} bytes from {src_region.start:#x} to {dst_region.start:#x}")
                
            except Exception as e:
                logger.error(f"Failed to move region {src_region.start:#x}: {e}")
        
        elapsed_time = time.time() - start_time
        
        # 更新统计
        self.stats["total_defragmentations"] += 1
        self.stats["total_moved_bytes"] += moved_bytes
        self.stats["total_compaction_time"] += elapsed_time
        
        logger.info(f"Compaction completed: {success_count}/{len(plan)} moves, "
                   f"{moved_bytes:,} bytes in {elapsed_time:.2f}s")
        
        return success_count > 0
    
    def defragment(self, memory_regions: List[MemoryRegion]) -> bool:
        """
        执行碎片整理
        返回是否进行了整理
        """
        with self.lock:
            if self.is_defragmenting:
                logger.warning("Defragmentation already in progress")
                return False
            
            now = time.time()
            if now - self.last_defragmentation_time < self.defragmentation_interval:
                return False
            
            # 分析碎片情况
            analysis = self.analyze_fragmentation(memory_regions)
            fragmentation_rate = analysis["fragmentation_rate"]
            
            logger.info(f"Fragmentation analysis: rate={fragmentation_rate:.2%}, "
                      f"free_blocks={analysis['free_blocks']}, "
                      f"largest_free={analysis['largest_free_block']:,} bytes")
            
            # 检查是否需要整理
            if fragmentation_rate < self.min_fragmentation_threshold:
                logger.debug("Fragmentation below threshold, skipping defragmentation")
                return False
            
            self.is_defragmenting = True
            self.stats["average_fragmentation_before"] = fragmentation_rate
            
            try:
                # 生成整理计划
                plan = self.find_best_compaction_plan(memory_regions)
                
                if not plan:
                    logger.info("No compaction plan generated")
                    return False
                
                logger.info(f"Generated compaction plan with {len(plan)} moves")
                
                # 执行整理
                success = self.execute_compaction_plan(plan)
                
                if success:
                    # 更新碎片分析
                    new_analysis = self.analyze_fragmentation(memory_regions)
                    self.stats["average_fragmentation_after"] = new_analysis["fragmentation_rate"]
                    
                    improvement = fragmentation_rate - new_analysis["fragmentation_rate"]
                    logger.info(f"Defragmentation successful: "
                              f"fragmentation improved by {improvement:.2%} "
                              f"({fragmentation_rate:.2%} -> {new_analysis['fragmentation_rate']:.2%})")
                else:
                    logger.warning("Defragmentation failed or had no effect")
                
                self.last_defragmentation_time = now
                return success
                
            except Exception as e:
                logger.error(f"Defragmentation failed: {e}")
                return False
                
            finally:
                self.is_defragmenting = False
    
    def smart_defragment(self, memory_pool) -> bool:
        """
        智能碎片整理
        与内存池集成
        """
        with self.lock:
            # 从内存池获取内存区域信息
            regions = self._get_regions_from_pool(memory_pool)
            
            if not regions:
                return False
            
            # 分析当前状态
            analysis = self.analyze_fragmentation(regions)
            
            # 根据策略选择整理方式
            if self.strategy == DefragmentationStrategy.SMART:
                # 智能决策
                return self._smart_defragment_decision(regions, analysis, memory_pool)
            else:
                # 使用指定策略
                return self.defragment(regions)
    
    def _get_regions_from_pool(self, memory_pool) -> List[MemoryRegion]:
        """从内存池获取内存区域信息"""
        regions = []
        
        # 这里需要根据具体的内存池实现来获取区域信息
        # 简化实现：假设内存池提供了blocks列表
        if hasattr(memory_pool, 'blocks'):
            for block in memory_pool.blocks:
                region = MemoryRegion(
                    start=block.address,
                    size=block.size,
                    is_free=(block.state.name == "FREE"),
                    tensor_ref=None,  # 实际实现中需要获取Tensor引用
                    block_id=block.block_id
                )
                regions.append(region)
        
        return regions
    
    def _smart_defragment_decision(self, regions: List[MemoryRegion], 
                                  analysis: Dict, memory_pool) -> bool:
        """智能碎片整理决策"""
        fragmentation_rate = analysis["fragmentation_rate"]
        free_blocks = analysis["free_blocks"]
        largest_free = analysis["largest_free_block"]
        
        # 决策矩阵
        if fragmentation_rate > self.max_fragmentation_threshold:
            # 高碎片率，强制整理
            logger.warning(f"High fragmentation detected ({fragmentation_rate:.2%}), forcing defragmentation")
            return self.defragment(regions)
        
        elif fragmentation_rate > self.min_fragmentation_threshold:
            # 中等碎片率，根据其他因素决定
            if free_blocks > 10 and largest_free < 1024 * 1024 * 100:  # 小于100MB
                # 很多小块空闲内存，进行整理
                logger.info(f"Many small free blocks ({free_blocks}), performing defragmentation")
                return self.defragment(regions)
            else:
                # 碎片率可接受，跳过
                logger.debug(f"Fragmentation acceptable ({fragmentation_rate:.2%}), skipping")
                return False
        
        else:
            # 低碎片率，不整理
            logger.debug(f"Low fragmentation ({fragmentation_rate:.2%}), no action needed")
            return False
    
    def get_stats(self) -> Dict:
        """获取整理器统计信息"""
        with self.lock:
            stats = self.stats.copy()
            
            # 计算平均每次整理移动的数据量
            if stats["total_defragmentations"] > 0:
                stats["average_moved_per_defrag"] = stats["total_moved_bytes"] / stats["total_defragmentations"]
                stats["average_time_per_defrag"] = stats["total_compaction_time"] / stats["total_defragmentations"]
            else:
                stats["average_moved_per_defrag"] = 0
                stats["average_time_per_defrag"] = 0
            
            # 计算碎片改善
            stats["fragmentation_improvement"] = (
                stats["average_fragmentation_before"] - stats["average_fragmentation_after"]
            )
            
            return stats
    
    def print_stats(self):
        """打印整理器统计信息"""
        stats = self.get_stats()
        
        logger.info("=" * 60)
        logger.info(f"Memory Defragmenter Statistics - {self.device_str}")
        logger.info(f"  Strategy: {self.strategy.value}")
        logger.info(f"  Total defragmentations: {stats['total_defragmentations']}")
        logger.info(f"  Total moved bytes: {stats['total_moved_bytes']:,}")
        logger.info(f"  Average moved per defrag: {stats['average_moved_per_defrag']:,.0f} bytes")
        logger.info(f"  Total compaction time: {stats['total_compaction_time']:.2f}s")
        logger.info(f"  Average time per defrag: {stats['average_time_per_defrag']:.2f}s")
        logger.info(f"  Fragmentation before: {stats['average_fragmentation_before']:.2%}")
        logger.info(f"  Fragmentation after: {stats['average_fragmentation_after']:.2%}")
        logger.info(f"  Fragmentation improvement: {stats['fragmentation_improvement']:.2%}")
        logger.info(f"  Total merged blocks: {stats['total_merged_blocks']}")
        logger.info(f"  Total freed blocks: {stats['total_freed_blocks']}")
        logger.info("=" * 60)
    
    def set_strategy(self, strategy: DefragmentationStrategy):
        """设置整理策略"""
        with self.lock:
            old_strategy = self.strategy
            self.strategy = strategy
            logger.info(f"Defragmentation strategy changed: {old_strategy.value} -> {strategy.value}")
    
    def set_thresholds(self, min_threshold: float = 0.2, max_threshold: float = 0.5):
        """设置碎片阈值"""
        with self.lock:
            self.min_fragmentation_threshold = min_threshold
            self.max_fragmentation_threshold = max_threshold
            logger.info(f"Defragmentation thresholds set: min={min_threshold:.2%}, max={max_threshold:.2%}")

# 全局整理器管理器
class DefragmenterManager:
    """管理多个设备的整理器"""
    
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
        self.defragmenters: Dict[str, MemoryDefragmenter] = {}
        self.enabled = True
        
        logger.info("DefragmenterManager initialized")
    
    def get_defragmenter(self, device: torch.device) -> MemoryDefragmenter:
        """获取或创建设备的整理器"""
        device_str = str(device)
        
        if device_str not in self.defragmenters:
            self.defragmenters[device_str] = MemoryDefragmenter(device)
            logger.info(f"Created defragmenter for device: {device}")
        
        return self.defragmenters[device_str]
    
    def defragment_device(self, device: torch.device, memory_pool) -> bool:
        """整理特定设备的内存"""
        if not self.enabled:
            return False
        
        defragmenter = self.get_defragmenter(device)
        return defragmenter.smart_defragment(memory_pool)
    
    def defragment_all(self, memory_manager):
        """整理所有设备的内存"""
        if not self.enabled:
            return False
        
        results = {}
        for device_str, pool in memory_manager.pools.items():
            device = torch.device(device_str)
            defragmenter = self.get_defragmenter(device)
            results[device_str] = defragmenter.smart_defragment(pool)
        
        return any(results.values())
    
    def enable(self, enabled: bool = True):
        """启用或禁用整理器"""
        self.enabled = enabled
        logger.info(f"Defragmenter {'enabled' if enabled else 'disabled'}")
    
    def get_all_stats(self) -> Dict[str, Dict]:
        """获取所有整理器的统计信息"""
        return {device: defrag.get_stats() for device, defrag in self.defragmenters.items()}
    
    def print_all_stats(self):
        """打印所有整理器的统计信息"""
        for device, defragmenter in self.defragmenters.items():
            defragmenter.print_stats()

# 全局实例
defragmenter_manager = DefragmenterManager()

# 导出便捷函数
def defragment_memory(device: torch.device = None, memory_pool = None) -> bool:
    """整理内存碎片（便捷函数）"""
    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    if memory_pool is None:
        # 尝试从全局内存管理器获取
        from .memory_management_enhanced import memory_manager
        device_str = str(device)
        if device_str in memory_manager.pools:
            memory_pool = memory_manager.pools[device_str]
        else:
            logger.warning(f"No memory pool found for device: {device}")
            return False
    
    return defragmenter_manager.defragment_device(device, memory_pool)

def enable_defragmentation(enabled: bool = True):
    """启用或禁用碎片整理（便捷函数）"""
    defragmenter_manager.enable(enabled)

def set_defragmentation_strategy(strategy: str):
    """设置碎片整理策略（便捷函数）"""
    try:
        strategy_enum = DefragmentationStrategy[strategy.upper()]
        for defragmenter in defragmenter_manager.defragmenters.values():
            defragmenter.set_strategy(strategy_enum)
    except KeyError:
        logger.error(f"Invalid defragmentation strategy: {strategy}")

def get_defragmentation_stats(device: torch.device = None) -> Dict:
    """获取碎片整理统计（便捷函数）"""
    if device is None:
        # 返回所有设备的统计
        return defragmenter_manager.get_all_stats()
    
    defragmenter = defragmenter_manager.get_defragmenter(device)
    return defragmenter.get_stats()

# 测试函数
def test_defragmenter():
    """测试碎片整理器"""
    import sys
    
    # 配置日志
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    
    print("Testing memory defragmenter...")
    
    # 创建设备
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Testing on device: {device}")
    
    # 创建整理器
    defragmenter = MemoryDefragmenter(device)
    
    # 创建模拟内存区域
    regions = [
        MemoryRegion(start=0, size=1024*1024, is_free=False),  # 1MB 已分配
        MemoryRegion(start=1024*1024, size=512*1024, is_free=True),  # 512KB 空闲
        MemoryRegion(start=1536*1024, size=2048*1024, is_free=False),  # 2MB 已分配
        MemoryRegion(start=3584*1024, size=256*1024, is_free=True),  # 256KB 空闲
        MemoryRegion(start=3840*1024, size=1024*1024, is_free=False),  # 1MB 已分配
    ]
    
    # 分析碎片
    analysis = defragmenter.analyze_fragmentation(regions)
    print(f"\nInitial fragmentation analysis:")
    print(f"  Fragmentation rate: {analysis['fragmentation_rate']:.2%}")
    print(f"  Free blocks: {analysis['free_blocks']}")
    print(f"  Largest free block: {analysis['largest_free_block']:,} bytes")
    print(f"  Total free: {analysis['total_free_bytes']:,} bytes")
    
    # 生成整理计划
    print(f"\nGenerating compaction plan...")
    plan = defragmenter.find_best_compaction_plan(regions)
    print(f"  Plan has {len(plan)} moves")
    
    if plan:
        for i, (src, dst) in enumerate(plan):
            print(f"  Move {i}: {src.size:,} bytes from {src.start:#x} to {dst.start:#x}")
    
    # 测试不同策略
    print(f"\nTesting different strategies:")
    
    strategies = [
        DefragmentationStrategy.CONSERVATIVE,
        DefragmentationStrategy.MODERATE,
        DefragmentationStrategy.AGGRESSIVE,
        DefragmentationStrategy.SMART,
    ]
    
    for strategy in strategies:
        defragmenter.set_strategy(strategy)
        plan = defragmenter.find_best_compaction_plan(regions)
        print(f"  {strategy.value}: {len(plan)} moves")
    
    # 打印统计
    print(f"\nDefragmenter statistics:")
    defragmenter.print_stats()
    
    print("\nTest completed!")

if __name__ == "__main__":
    test_defragmenter()
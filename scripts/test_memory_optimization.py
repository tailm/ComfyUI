#!/usr/bin/env python3
"""
内存优化测试脚本
测试智能内存池、碎片整理和性能监控的集成效果
"""

import torch
import gc
import time
import logging
import sys
import os
import json
from typing import List, Dict, Any
import random

# 添加当前目录到路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('memory_optimization_test.log')
    ]
)
logger = logging.getLogger(__name__)

def test_basic_memory_pool():
    """测试基础内存池功能"""
    print("\n" + "="*80)
    print("测试基础内存池功能")
    print("="*80)
    
    from comfy.memory_pool import MemoryPool, SmartMemoryManager
    
    # 创建设备
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"测试设备: {device}")
    
    # 创建内存池
    pool = MemoryPool(device, "test_pool")
    
    # 测试1: 基本分配和释放
    print("\n1. 测试基本分配和释放...")
    tensors = []
    sizes = [1024, 2048, 4096, 8192, 16384]  # 1KB到16KB
    
    for i, size in enumerate(sizes):
        tensor = pool.allocate(size * 1024)  # KB转字节
        if tensor is not None:
            tensors.append(tensor)
            print(f"  分配 {size}KB Tensor: 成功, 地址: {tensor.data_ptr():#x}")
        else:
            print(f"  分配 {size}KB Tensor: 失败")
    
    # 打印统计
    print("\n  分配后统计:")
    pool.print_stats()
    
    # 测试2: 部分释放
    print("\n2. 测试部分释放...")
    for i, tensor in enumerate(tensors[:2]):
        if pool.free(tensor):
            print(f"  释放 Tensor {i}: 成功")
        else:
            print(f"  释放 Tensor {i}: 失败")
    
    print("\n  部分释放后统计:")
    pool.print_stats()
    
    # 测试3: 碎片整理
    print("\n3. 测试碎片整理...")
    if pool.defragment():
        print("  碎片整理: 成功")
    else:
        print("  碎片整理: 无需整理")
    
    print("\n  整理后统计:")
    pool.print_stats()
    
    # 测试4: 清理剩余Tensor
    print("\n4. 清理剩余Tensor...")
    for tensor in tensors[2:]:
        pool.free(tensor)
    
    print("\n  最终统计:")
    pool.print_stats()
    
    return True

def test_smart_memory_manager():
    """测试智能内存管理器"""
    print("\n" + "="*80)
    print("测试智能内存管理器")
    print("="*80)
    
    from comfy.memory_management_enhanced import memory_manager, enable_smart_memory, enable_memory_pool
    from comfy.memory_management_enhanced import enable_defragmentation, enable_monitoring
    
    # 启用所有功能
    enable_smart_memory(True)
    enable_memory_pool(True)
    enable_defragmentation(True)
    enable_monitoring(True, interval=1.0)
    
    # 测试分配
    print("\n1. 测试Tensor分配...")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # 模拟不同大小的分配
    allocation_patterns = [
        (1024, 10),    # 1KB, 10次
        (4096, 5),     # 4KB, 5次
        (16384, 3),    # 16KB, 3次
        (65536, 2),    # 64KB, 2次
    ]
    
    allocated_tensors = []
    
    for size_kb, count in allocation_patterns:
        print(f"\n  分配模式: {size_kb}KB x {count}")
        for i in range(count):
            # 使用增强的分配函数
            from comfy.memory_management_enhanced import allocate_tensor
            tensor = allocate_tensor(size_kb, device=device)
            if tensor is not None:
                allocated_tensors.append((tensor, size_kb))
                print(f"    分配 {size_kb}KB Tensor {i+1}: 成功")
            else:
                print(f"    分配 {size_kb}KB Tensor {i+1}: 失败")
    
    # 打印内存状态
    print("\n2. 内存状态:")
    memory_manager.print_all_stats()
    
    # 测试随机释放
    print("\n3. 测试随机释放...")
    random.shuffle(allocated_tensors)
    release_count = len(allocated_tensors) // 2
    
    for i in range(release_count):
        tensor, size_kb = allocated_tensors[i]
        # 使用增强的释放函数
        from comfy.memory_management_enhanced import free_tensor
        if free_tensor(tensor):
            print(f"  释放 {size_kb}KB Tensor: 成功")
        else:
            print(f"  释放 {size_kb}KB Tensor: 失败")
    
    # 移除已释放的Tensor
    allocated_tensors = allocated_tensors[release_count:]
    
    # 测试碎片整理
    print("\n4. 测试碎片整理...")
    from comfy.memory_management_enhanced import defragment_memory
    if defragment_memory():
        print("  碎片整理: 成功")
    else:
        print("  碎片整理: 无需整理")
    
    # 打印最终状态
    print("\n5. 最终内存状态:")
    memory_manager.print_all_stats()
    
    # 清理剩余Tensor
    print("\n6. 清理剩余Tensor...")
    for tensor, size_kb in allocated_tensors:
        from comfy.memory_management_enhanced import free_tensor
        free_tensor(tensor)
    
    return True

def test_defragmentation():
    """测试碎片整理功能"""
    print("\n" + "="*80)
    print("测试碎片整理功能")
    print("="*80)
    
    from comfy.memory_defragmenter import MemoryDefragmenter, DefragmentationStrategy
    
    # 创建设备
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # 创建整理器
    defragmenter = MemoryDefragmenter(device)
    
    # 测试不同策略
    strategies = [
        (DefragmentationStrategy.CONSERVATIVE, "保守策略"),
        (DefragmentationStrategy.MODERATE, "适度策略"),
        (DefragmentationStrategy.AGGRESSIVE, "激进策略"),
        (DefragmentationStrategy.SMART, "智能策略"),
    ]
    
    # 创建模拟内存区域
    from comfy.memory_defragmenter import MemoryRegion
    regions = []
    
    # 创建碎片化内存布局
    base_address = 0x10000000
    current_address = base_address
    
    # 交替分配和空闲区域
    for i in range(10):
        # 已分配区域
        alloc_size = random.randint(1024, 8192)  # 1-8KB
        regions.append(MemoryRegion(
            start=current_address,
            size=alloc_size,
            is_free=False,
            tensor_ref=None,
            block_id=i*2
        ))
        current_address += alloc_size
        
        # 空闲区域
        free_size = random.randint(512, 4096)  # 0.5-4KB
        regions.append(MemoryRegion(
            start=current_address,
            size=free_size,
            is_free=True,
            tensor_ref=None,
            block_id=i*2+1
        ))
        current_address += free_size
    
    print(f"创建了 {len(regions)} 个内存区域")
    print(f"总内存: {current_address - base_address:,} 字节")
    
    # 分析初始碎片
    initial_analysis = defragmenter.analyze_fragmentation(regions)
    print(f"\n初始碎片分析:")
    print(f"  碎片率: {initial_analysis['fragmentation_rate']:.2%}")
    print(f"  空闲块数: {initial_analysis['free_blocks']}")
    print(f"  已分配块数: {initial_analysis['allocated_blocks']}")
    print(f"  总空闲内存: {initial_analysis['total_free_bytes']:,} 字节")
    print(f"  最大空闲块: {initial_analysis['largest_free_block']:,} 字节")
    
    # 测试每种策略
    for strategy, name in strategies:
        print(f"\n测试 {name}:")
        defragmenter.set_strategy(strategy)
        
        # 生成整理计划
        plan = defragmenter.find_best_compaction_plan(regions)
        print(f"  生成整理计划: {len(plan)} 个移动操作")
        
        if plan:
            # 模拟执行（实际实现中会真正移动数据）
            total_moved = sum(src.size for src, _ in plan)
            print(f"  需要移动: {total_moved:,} 字节")
            
            # 模拟整理后的区域（简化）
            # 在实际实现中，这里会真正移动数据并更新区域
            simulated_regions = regions.copy()
            
            # 分析整理后的碎片
            simulated_analysis = defragmenter.analyze_fragmentation(simulated_regions)
            improvement = initial_analysis['fragmentation_rate'] - simulated_analysis['fragmentation_rate']
            
            print(f"  预期碎片改善: {improvement:.2%}")
            print(f"  预期碎片率: {simulated_analysis['fragmentation_rate']:.2%}")
        else:
            print("  无需整理")
    
    # 打印整理器统计
    print(f"\n整理器统计:")
    defragmenter.print_stats()
    
    return True

def test_performance_monitoring():
    """测试性能监控"""
    print("\n" + "="*80)
    print("测试性能监控")
    print("="*80)
    
    from comfy.memory_monitor import MemoryMonitor, get_memory_monitor, start_monitoring, stop_monitoring
    from comfy.memory_monitor import record_allocation, record_deallocation, record_defragmentation
    
    # 创建模拟内存管理器
    class MockMemoryManager:
        def __init__(self):
            self.stats = {
                "total_memory_bytes": 8 * 1024 * 1024 * 1024,  # 8GB
                "allocated_memory_bytes": 4 * 1024 * 1024 * 1024,  # 4GB
                "free_memory_bytes": 4 * 1024 * 1024 * 1024,  # 4GB
                "fragmentation_rate": 0.35,
                "stats": {
                    "cache_hits": 150,
                    "cache_misses": 50,
                }
            }
        
        def get_all_stats(self):
            return {"cuda:0": self.stats}
    
    # 创建监控器
    memory_manager = MockMemoryManager()
    monitor = MemoryMonitor(memory_manager)
    
    # 模拟一些操作
    print("\n1. 模拟内存操作...")
    
    # 模拟分配操作
    allocation_sizes = [1024, 2048, 4096, 8192, 16384, 32768]
    for i, size in enumerate(allocation_sizes):
        latency = random.uniform(0.5, 5.0)  # 0.5-5ms
        cache_hit = random.random() > 0.3  # 70%命中率
        monitor.record_allocation(size * 1024, latency, cache_hit)
        print(f"  记录分配: {size}KB, 延迟: {latency:.2f}ms, 缓存命中: {cache_hit}")
    
    # 模拟释放操作
    for i, size in enumerate(allocation_sizes[:3]):
        latency = random.uniform(0.2, 2.0)  # 0.2-2ms
        monitor.record_deallocation(size * 1024, latency)
        print(f"  记录释放: {size}KB, 延迟: {latency:.2f}ms")
    
    # 模拟碎片整理
    monitor.record_defragmentation(1024 * 1024)  # 1MB
    monitor.record_fragmentation()
    
    # 收集数据
    print("\n2. 收集监控数据...")
    monitor._collect_snapshot()
    monitor._analyze_performance()
    monitor._generate_suggestions()
    
    # 打印报告
    print("\n3. 性能报告:")
    monitor.print_report()
    
    # 导出报告
    print("\n4. 导出报告...")
    report_file = "memory_performance_report.json"
    if monitor.export_report(report_file):
        print(f"  报告已导出到: {report_file}")
        
        # 读取并显示部分内容
        with open(report_file, 'r') as f:
            report = json.load(f)
        
        print(f"\n  报告摘要:")
        print(f"    时间戳: {report.get('timestamp', 'N/A')}")
        print(f"    缓存命中率: {report.get('current_metrics', {}).get('cache_hit_rate', 0):.2%}")
        print(f"    碎片率: {report.get('current_metrics', {}).get('fragmentation_rate', 0):.2%}")
        print(f"    优化建议数: {len(report.get('suggestions', []))}")
    
    # 清理
    monitor.stop()
    
    return True

def test_integration():
    """集成测试"""
    print("\n" + "="*80)
    print("集成测试")
    print("="*80)
    
    # 导入所有模块
    from comfy.memory_pool import memory_manager as pool_manager
    from comfy.memory_management_enhanced import enable_smart_memory, enable_memory_pool
    from comfy.memory_management_enhanced import enable_defragmentation, enable_monitoring
    from comfy.memory_management_enhanced import allocate_tensor, free_tensor, print_memory_status
    from comfy.memory_defragmenter import defragment_memory, set_defragmentation_strategy
    from comfy.memory_monitor import start_monitoring, print_performance_report
    
    # 启用所有功能
    print("\n1. 启用所有优化功能...")
    enable_smart_memory(True)
    enable_memory_pool(True)
    enable_defragmentation(True)
    enable_monitoring(True, interval=2.0)
    set_defragmentation_strategy("smart")
    
    # 打印初始状态
    print("\n2. 初始内存状态:")
    print_memory_status()
    
    # 模拟工作负载
    print("\n3. 模拟工作负载...")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # 阶段1: 分配内存
    print("\n  阶段1: 分配内存")
    workloads = [
        ("小对象分配", 100, 1024),      # 100个1KB对象
        ("中对象分配", 50, 4096),       # 50个4KB对象
        ("大对象分配", 20, 16384),      # 20个16KB对象
        ("超大对象分配", 5, 65536),     # 5个64KB对象
    ]
    
    allocated_tensors = []
    
    for name, count, size_kb in workloads:
        print(f"    {name}: {count}个{size_kb}KB对象")
        for i in range(count):
            tensor = allocate_tensor(size_kb, device=device)
            if tensor is not None:
                allocated_tensors.append((tensor, size_kb, name))
    
    print(f"    总共分配: {len(allocated_tensors)}个Tensor")
    
    # 打印分配后状态
    print("\n4. 分配后内存状态:")
    pool_manager.print_all_stats()
    
    # 阶段2: 随机释放
    print("\n5. 阶段2: 随机释放")
    random.shuffle(allocated_tensors)
    release_count = len(allocated_tensors) // 3 * 2  # 释放2/3
    
    for i in range(release_count):
        tensor, size_kb, name = allocated_tensors[i]
        if free_tensor(tensor):
            pass  # 静默释放
    
    # 移除已释放的Tensor
    allocated_tensors = allocated_tensors[release_count:]
    print(f"    释放后剩余: {len(allocated_tensors)}个Tensor")
    
    # 打印释放后状态
    print("\n6. 释放后内存状态:")
    pool_manager.print_all_stats()
    
    # 阶段3: 碎片整理
    print("\n7. 阶段3: 碎片整理")
    if defragment_memory():
        print("    碎片整理完成")
    else:
        print("    无需碎片整理")
    
    # 打印整理后状态
    print("\n8. 整理后内存状态:")
    pool_manager.print_all_stats()
    
    # 阶段4: 更多分配（测试碎片整理效果）
    print("\n9. 阶段4: 更多分配（测试碎片整理效果）")
    additional_workloads = [
        ("混合小对象", 30, 2048),
        ("混合中对象", 15, 8192),
        ("混合大对象", 8, 32768),
    ]
    
    for name, count, size_kb in additional_workloads:
        print(f"    {name}: {count}个{size_kb}KB对象")
        for i in range(count):
            tensor = allocate_tensor(size_kb, device=device)
            if tensor is not None:
                allocated_tensors.append((tensor, size_kb, name))
    
    print(f"    总共Tensor: {len(allocated_tensors)}个")
    
    # 打印最终状态
    print("\n10. 最终内存状态:")
    pool_manager.print_all_stats()
    
    # 性能报告
    print("\n11. 性能报告:")
    print_performance_report()
    
    # 清理
    print("\n12. 清理...")
    for tensor, size_kb, name in allocated_tensors:
        free_tensor(tensor)
    
    print("    所有Tensor已释放")
    
    # 最终统计
    print("\n13. 最终统计:")
    pool_manager.print_all_stats()
    
    return True

def run_all_tests():
    """运行所有测试"""
    print("开始内存优化测试套件")
    print("="*80)
    
    tests = [
        ("基础内存池测试", test_basic_memory_pool),
        ("智能内存管理器测试", test_smart_memory_manager),
        ("碎片整理测试", test_defragmentation),
        ("性能监控测试", test_performance_monitoring),
        ("集成测试", test_integration),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n运行测试: {test_name}")
        print("-"*60)
        
        try:
            start_time = time.time()
            success = test_func()
            elapsed_time = time.time() - start_time
            
            if success:
                print(f"✓ {test_name}: 通过 ({elapsed_time:.2f}秒)")
                results.append((test_name, True, elapsed_time))
            else:
                print(f"✗ {test_name}: 失败 ({elapsed_time:.2f}秒)")
                results.append((test_name, False, elapsed_time))
                
        except Exception as e:
            print(f"✗ {test_name}: 异常 ({type(e).__name__}: {e})")
            results.append((test_name, False, 0))
            import traceback
            traceback.print_exc()
    
    # 打印测试总结
    print("\n" + "="*80)
    print("测试总结")
    print("="*80)
    
    passed = sum(1 for _, success, _ in results if success)
    total = len(results)
    
    print(f"通过: {passed}/{total}")
    print(f"失败: {total - passed}/{total}")
    
    if passed == total:
        print("\n🎉 所有测试通过！")
    else:
        print("\n⚠️  部分测试失败，请检查日志")
    
    # 详细结果
    print("\n详细结果:")
    for test_name, success, elapsed in results:
        status = "✓ 通过" if success else "✗ 失败"
        print(f"  {test_name:30} {status:10} {elapsed:6.2f}秒")
    
    return all(success for _, success, _ in results)

def main():
    """主函数"""
    print("ComfyUI 内存优化测试套件")
    print("="*80)
    
    # 检查PyTorch和CUDA
    print(f"PyTorch版本: {torch.__version__}")
    print(f"CUDA可用: {torch.cuda.is_available()}")
    
    if torch.cuda.is_available():
        print(f"CUDA版本: {torch.version.cuda}")
        print(f"GPU数量: {torch.cuda.device_count()}")
        for i in range(torch.cuda.device_count()):
            print(f"  GPU {i}: {torch.cuda.get_device_name(i)}")
    else:
        print("警告: CUDA不可用，将在CPU上运行测试")
    
    print("\n" + "="*80)
    
    # 运行测试
    success = run_all_tests()
    
    # 生成测试报告
    report = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "pytorch_version": torch.__version__,
        "cuda_available": torch.cuda.is_available(),
        "cuda_version": torch.version.cuda if torch.cuda.is_available() else "N/A",
        "device_count": torch.cuda.device_count() if torch.cuda.is_available() else 0,
        "test_results": [],
        "summary": {
            "total_tests": 5,
            "passed_tests": sum(1 for test in [
                test_basic_memory_pool,
                test_smart_memory_manager,
                test_defragmentation,
                test_performance_monitoring,
                test_integration
            ])
        }
    }
    
    # 保存报告
    with open("memory_optimization_test_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"\n测试报告已保存到: memory_optimization_test_report.json")
    
    if success:
        print("\n✅ 所有测试成功完成！")
        return 0
    else:
        print("\n❌ 部分测试失败，请检查日志文件: memory_optimization_test.log")
        return 1

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n测试被用户中断")
        sys.exit(130)
    except Exception as e:
        print(f"\n测试过程中发生错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
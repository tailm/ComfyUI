"""
ComfyUI内存优化使用示例
展示如何集成和使用智能内存管理功能
"""

import torch
import logging
import time
import sys
import os

# 添加父目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def example_basic_usage():
    """基本使用示例"""
    print("="*80)
    print("基本使用示例")
    print("="*80)
    
    # 导入内存管理模块
    from comfy.memory_management_enhanced import (
        enable_smart_memory,
        enable_memory_pool,
        enable_defragmentation,
        enable_monitoring,
        allocate_tensor,
        free_tensor,
        print_memory_status,
        defragment_memory,
        get_memory_usage_report
    )
    
    from comfy.memory_monitor import (
        start_monitoring,
        stop_monitoring,
        print_performance_report,
        export_performance_report
    )
    
    # 1. 初始化内存管理
    print("\n1. 初始化内存管理...")
    enable_smart_memory(True)
    enable_memory_pool(True)
    enable_defragmentation(True)
    enable_monitoring(True, interval=5.0)
    
    # 打印初始状态
    print_memory_status()
    
    # 2. 分配Tensor
    print("\n2. 分配Tensor...")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # 使用智能内存池分配
    tensor1 = allocate_tensor(1024, device=device)  # 1KB
    tensor2 = allocate_tensor(4096, device=device)  # 4KB
    tensor3 = allocate_tensor(16384, device=device)  # 16KB
    
    print(f"  分配了3个Tensor:")
    print(f"    Tensor 1: shape={tensor1.shape}, dtype={tensor1.dtype}, device={tensor1.device}")
    print(f"    Tensor 2: shape={tensor2.shape}, dtype={tensor2.dtype}, device={tensor2.device}")
    print(f"    Tensor 3: shape={tensor3.shape}, dtype={tensor3.dtype}, device={tensor3.device}")
    
    # 3. 使用Tensor
    print("\n3. 使用Tensor进行计算...")
    if tensor1 is not None and tensor2 is not None:
        # 简单的张量运算（确保维度匹配）
        try:
            # 调整维度以进行矩阵乘法
            if tensor1.dim() == 1:
                tensor1 = tensor1.unsqueeze(0)  # 1D -> 2D (1, n)
            if tensor2.dim() == 1:
                tensor2 = tensor2.unsqueeze(1)  # 1D -> 2D (n, 1)
            
            # 检查维度是否匹配
            if tensor1.shape[1] == tensor2.shape[0]:
                result = torch.matmul(tensor1, tensor2)
                print(f"  矩阵乘法结果形状: {result.shape}")
            else:
                # 使用点积
                result = torch.dot(tensor1.flatten(), tensor2.flatten())
                print(f"  点积结果: {result.item()}")
        except Exception as e:
            print(f"  张量运算错误: {e}")
            # 简单的元素操作
            result = tensor1 + tensor2
            print(f"  元素加法结果形状: {result.shape}")
    
    # 4. 释放Tensor
    print("\n4. 释放Tensor...")
    if tensor1 is not None:
        free_tensor(tensor1)
        print("  释放Tensor 1: 成功")
    
    if tensor2 is not None:
        free_tensor(tensor2)
        print("  释放Tensor 2: 成功")
    
    # 5. 碎片整理
    print("\n5. 执行碎片整理...")
    if defragment_memory():
        print("  碎片整理: 成功")
    else:
        print("  碎片整理: 无需整理")
    
    # 6. 获取内存使用报告
    print("\n6. 获取内存使用报告...")
    report = get_memory_usage_report()
    print(f"  内存池启用: {report.get('memory_pool_enabled', False)}")
    print(f"  碎片整理启用: {report.get('defragmentation_enabled', False)}")
    print(f"  监控启用: {report.get('monitoring_enabled', False)}")
    
    # 7. 性能报告
    print("\n7. 生成性能报告...")
    print_performance_report()
    
    # 8. 清理
    print("\n8. 清理...")
    if tensor3 is not None:
        free_tensor(tensor3)
        print("  释放Tensor 3: 成功")
    
    # 停止监控
    stop_monitoring()
    
    print("\n基本使用示例完成!")

def example_integration_with_model_patcher():
    """与ModelPatcher集成示例"""
    print("\n" + "="*80)
    print("与ModelPatcher集成示例")
    print("="*80)
    
    try:
        # 导入ComfyUI模块
        from comfy.model_patcher import ModelPatcher
        from comfy.model_management import get_torch_device
        
        # 导入增强的内存管理
        from comfy.memory_management_enhanced import (
            enable_smart_memory,
            enable_memory_pool,
            print_memory_status
        )
        
        # 启用智能内存管理
        enable_smart_memory(True)
        enable_memory_pool(True)
        
        print("智能内存管理已启用")
        print_memory_status()
        
        # 模拟ModelPatcher使用场景
        print("\n模拟ModelPatcher使用场景...")
        
        # 获取设备
        device = get_torch_device()
        print(f"使用设备: {device}")
        
        # 创建模拟模型数据
        # 在实际使用中，这里会是真实的模型加载和卸载
        
        print("\nModelPatcher集成示例完成!")
        
    except ImportError as e:
        print(f"无法导入ComfyUI模块: {e}")
        print("请确保在ComfyUI环境中运行此示例")

def example_advanced_features():
    """高级功能示例"""
    print("\n" + "="*80)
    print("高级功能示例")
    print("="*80)
    
    from comfy.memory_management_enhanced import (
        enable_smart_memory,
        enable_memory_pool,
        enable_defragmentation,
        enable_monitoring,
        memory_manager
    )
    
    from comfy.memory_defragmenter import (
        defragmenter_manager,
        set_defragmentation_strategy,
        get_defragmentation_stats
    )
    
    from comfy.memory_monitor import (
        start_monitoring,
        export_performance_report
    )
    
    # 1. 配置高级选项
    print("\n1. 配置高级选项...")
    
    # 启用所有功能
    enable_smart_memory(True)
    enable_memory_pool(True)
    enable_defragmentation(True)
    enable_monitoring(True, interval=2.0)
    
    # 设置碎片整理策略
    set_defragmentation_strategy("smart")  # 智能策略
    print("  碎片整理策略: smart")
    
    # 2. 模拟工作负载
    print("\n2. 模拟工作负载...")
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # 创建不同大小的Tensor模拟工作负载
    workload_sizes = [
        (1024, 10),    # 10个1KB Tensor
        (4096, 5),     # 5个4KB Tensor
        (16384, 3),    # 3个16KB Tensor
        (65536, 2),    # 2个64KB Tensor
    ]
    
    tensors = []
    
    for size_kb, count in workload_sizes:
        print(f"  分配 {count}个{size_kb}KB Tensor...")
        for i in range(count):
            tensor = memory_manager.allocate(size_kb * 1024, device)
            if tensor is not None:
                tensors.append(tensor)
    
    print(f"  总共分配了 {len(tensors)} 个Tensor")
    
    # 3. 监控内存状态
    print("\n3. 监控内存状态...")
    memory_manager.print_all_stats()
    
    # 4. 执行碎片整理
    print("\n4. 执行碎片整理...")
    defragmenter_manager.defragment_all(memory_manager)
    
    # 5. 获取碎片整理统计
    print("\n5. 碎片整理统计...")
    defrag_stats = get_defragmentation_stats()
    for device_str, stats in defrag_stats.items():
        print(f"  设备 {device_str}:")
        print(f"    整理次数: {stats.get('total_defragmentations', 0)}")
        print(f"    移动数据: {stats.get('total_moved_bytes', 0):,} 字节")
        print(f"    碎片改善: {stats.get('fragmentation_improvement', 0):.2%}")
    
    # 6. 导出性能报告
    print("\n6. 导出性能报告...")
    report_file = "advanced_memory_report.json"
    if export_performance_report(report_file):
        print(f"  性能报告已导出到: {report_file}")
    
    # 7. 清理
    print("\n7. 清理...")
    for tensor in tensors:
        memory_manager.free(tensor)
    
    print(f"  释放了 {len(tensors)} 个Tensor")
    
    # 最终统计
    print("\n8. 最终统计...")
    memory_manager.print_all_stats()
    
    print("\n高级功能示例完成!")

def example_custom_configuration():
    """自定义配置示例"""
    print("\n" + "="*80)
    print("自定义配置示例")
    print("="*80)
    
    from comfy.memory_pool import MemoryPool
    from comfy.memory_defragmenter import MemoryDefragmenter, DefragmentationStrategy
    
    # 1. 创建自定义内存池
    print("\n1. 创建自定义内存池...")
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # 自定义配置
    custom_pool = MemoryPool(
        device=device,
        name="custom_pool"
    )
    
    # 调整配置
    custom_pool.min_block_size = 2048  # 2KB最小块
    custom_pool.max_block_size = 512 * 1024 * 1024  # 512MB最大块
    custom_pool.alignment = 1024  # 1KB对齐
    custom_pool.defragmentation_threshold = 0.4  # 40%碎片率触发整理
    
    print(f"  自定义内存池配置:")
    print(f"    设备: {device}")
    print(f"    名称: {custom_pool.name}")
    print(f"    最小块大小: {custom_pool.min_block_size:,} 字节")
    print(f"    最大块大小: {custom_pool.max_block_size:,} 字节")
    print(f"    内存对齐: {custom_pool.alignment:,} 字节")
    print(f"    碎片整理阈值: {custom_pool.defragmentation_threshold:.0%}")
    
    # 2. 创建自定义碎片整理器
    print("\n2. 创建自定义碎片整理器...")
    
    custom_defragmenter = MemoryDefragmenter(device)
    
    # 自定义配置
    custom_defragmenter.strategy = DefragmentationStrategy.AGGRESSIVE
    custom_defragmenter.min_fragmentation_threshold = 0.3  # 30%触发整理
    custom_defragmenter.max_fragmentation_threshold = 0.7  # 70%强制整理
    custom_defragmenter.min_block_size_to_move = 2 * 1024 * 1024  # 2MB
    custom_defragmenter.max_move_size = 2 * 1024 * 1024 * 1024  # 2GB
    
    print(f"  自定义碎片整理器配置:")
    print(f"    策略: {custom_defragmenter.strategy.value}")
    print(f"    最小碎片阈值: {custom_defragmenter.min_fragmentation_threshold:.0%}")
    print(f"    最大碎片阈值: {custom_defragmenter.max_fragmentation_threshold:.0%}")
    print(f"    最小移动块: {custom_defragmenter.min_block_size_to_move:,} 字节")
    print(f"    最大移动大小: {custom_defragmenter.max_move_size:,} 字节")
    
    # 3. 测试自定义配置
    print("\n3. 测试自定义配置...")
    
    # 分配一些内存
    test_sizes = [1024, 4096, 16384, 65536]  # 1KB到64KB
    
    allocated_tensors = []
    for size in test_sizes:
        tensor = custom_pool.allocate(size * 1024)
        if tensor is not None:
            allocated_tensors.append(tensor)
            print(f"  分配 {size}KB: 成功")
        else:
            print(f"  分配 {size}KB: 失败")
    
    # 打印统计
    print("\n  分配后统计:")
    custom_pool.print_stats()
    
    # 4. 清理
    print("\n4. 清理...")
    for tensor in allocated_tensors:
        custom_pool.free(tensor)
    
    print("  所有Tensor已释放")
    
    print("\n自定义配置示例完成!")

def example_performance_comparison():
    """性能对比示例"""
    print("\n" + "="*80)
    print("性能对比示例")
    print("="*80)
    
    import time
    import statistics
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # 测试参数
    num_iterations = 100
    tensor_sizes = [1024, 2048, 4096, 8192, 16384]  # 1KB到16KB
    
    print(f"设备: {device}")
    print(f"迭代次数: {num_iterations}")
    print(f"Tensor大小: {tensor_sizes} 字节")
    
    # 1. 测试原生PyTorch分配
    print("\n1. 测试原生PyTorch分配...")
    torch_latencies = []
    
    for i in range(num_iterations):
        size = random.choice(tensor_sizes)
        
        start_time = time.perf_counter()
        tensor = torch.empty(size, dtype=torch.float32, device=device)
        end_time = time.perf_counter()
        
        latency_ms = (end_time - start_time) * 1000
        torch_latencies.append(latency_ms)
        
        # 立即释放
        del tensor
    
    # 强制垃圾回收
    gc.collect()
    if device.type == 'cuda':
        torch.cuda.empty_cache()
    
    # 2. 测试智能内存池分配
    print("\n2. 测试智能内存池分配...")
    
    from comfy.memory_management_enhanced import (
        enable_smart_memory,
        enable_memory_pool,
        allocate_tensor,
        free_tensor
    )
    
    # 启用智能内存管理
    enable_smart_memory(True)
    enable_memory_pool(True)
    
    pool_latencies = []
    
    for i in range(num_iterations):
        size = random.choice(tensor_sizes)
        
        start_time = time.perf_counter()
        tensor = allocate_tensor(size, device=device)
        end_time = time.perf_counter()
        
        latency_ms = (end_time - start_time) * 1000
        pool_latencies.append(latency_ms)
        
        # 立即释放
        if tensor is not None:
            free_tensor(tensor)
    
    # 3. 分析结果
    print("\n3. 性能对比结果:")
    
    if torch_latencies and pool_latencies:
        torch_avg = statistics.mean(torch_latencies)
        torch_p95 = statistics.quantiles(torch_latencies, n=20)[18]  # 95th percentile
        torch_std = statistics.stdev(torch_latencies) if len(torch_latencies) > 1 else 0
        
        pool_avg = statistics.mean(pool_latencies)
        pool_p95 = statistics.quantiles(pool_latencies, n=20)[18]  # 95th percentile
        pool_std = statistics.stdev(pool_latencies) if len(pool_latencies) > 1 else 0
        
        improvement_avg = ((torch_avg - pool_avg) / torch_avg) * 100
        improvement_p95 = ((torch_p95 - pool_p95) / torch_p95) * 100
        
        print(f"  原生PyTorch:")
        print(f"    平均延迟: {torch_avg:.3f} ms")
        print(f"    P95延迟: {torch_p95:.3f} ms")
        print(f"    标准差: {torch_std:.3f} ms")
        
        print(f"\n  智能内存池:")
        print(f"    平均延迟: {pool_avg:.3f} ms")
        print(f"    P95延迟: {pool_p95:.3f} ms")
        print(f"    标准差: {pool_std:.3f} ms")
        
        print(f"\n  性能改善:")
        print(f"    平均延迟改善: {improvement_avg:+.1f}%")
        print(f"    P95延迟改善: {improvement_p95:+.1f}%")
        
        if improvement_avg > 0:
            print(f"\n  ✅ 智能内存池性能更好!")
        else:
            print(f"\n  ⚠️  原生PyTorch性能更好")
    else:
        print("  无法计算性能对比")
    
    print("\n性能对比示例完成!")

def main():
    """运行所有示例"""
    print("ComfyUI内存优化示例")
    print("="*80)
    
    examples = [
        ("基本使用示例", example_basic_usage),
        ("与ModelPatcher集成示例", example_integration_with_model_patcher),
        ("高级功能示例", example_advanced_features),
        ("自定义配置示例", example_custom_configuration),
        ("性能对比示例", example_performance_comparison),
    ]
    
    for example_name, example_func in examples:
        print(f"\n运行示例: {example_name}")
        print("-"*60)
        
        try:
            example_func()
            print(f"✓ {example_name}: 完成")
        except Exception as e:
            print(f"✗ {example_name}: 错误 - {e}")
            import traceback
            traceback.print_exc()
    
    print("\n" + "="*80)
    print("所有示例完成!")
    print("="*80)
    
    # 总结
    print("\n总结:")
    print("1. 智能内存池可以减少内存碎片，提高内存利用率")
    print("2. 碎片整理功能可以自动优化内存布局")
    print("3. 性能监控提供详细的内存使用统计和优化建议")
    print("4. 可以与ComfyUI的ModelPatcher无缝集成")
    print("5. 支持自定义配置以满足不同需求")
    
    print("\n要启用这些功能，请在ComfyUI启动时添加:")
    print("  from comfy.memory_management_enhanced import enable_smart_memory")
    print("  enable_smart_memory(True)")

if __name__ == "__main__":
    import random
    import gc
    
    try:
        main()
    except KeyboardInterrupt:
        print("\n示例被用户中断")
    except Exception as e:
        print(f"\n示例执行错误: {e}")
        import traceback
        traceback.print_exc()
#!/usr/bin/env python3
"""
三级缓存系统使用示例
演示如何集成三级缓存系统到ComfyUI工作流中
"""

import torch
import time
import numpy as np
from pathlib import Path

# 添加当前目录到Python路径
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from comfy.cache_integration import (
    CacheIntegrationConfig,
    enable_cache_integration,
    disable_cache_integration,
    integrated_cache_put,
    integrated_cache_get,
    integrated_cache_stats,
    print_integrated_cache_stats
)

def basic_usage_example():
    """基本使用示例"""
    print("=" * 60)
    print("三级-缓存系统基本使用示例")
    print("=" * 60)
    
    # 创建配置
    config = CacheIntegrationConfig(
        l1_max_size=2 * 1024**3,      # 2GB GPU显存
        l2_max_size=8 * 1024**3,      # 8GB 系统内存
        l3_max_size=50 * 1024**3,     # 50GB 持久化存储
        l3_storage_path="./cache/l3",
        enable_smart_migration=False,  # 禁用智能迁移以简化示例
        enable_prefetch=False,         # 禁用预取以简化示例
        enable_monitoring=True,
        stats_log_interval=10.0,      # 每10秒记录统计
    )
    
    # 启用缓存集成
    print("启用三级缓存系统...")
    manager = enable_cache_integration(config)
    
    # 生成测试数据
    print("\n生成测试数据...")
    test_data = {
        "small_tensor": torch.randn(100, 100),      # 小张量
        "medium_tensor": torch.randn(1000, 1000),   # 中等张量
        "large_tensor": torch.randn(5000, 5000),    # 大张量
    }
    
    # 存储数据
    print("\n存储数据到缓存...")
    for key, tensor in test_data.items():
        success = integrated_cache_put(key, tensor)
        print(f"  存储 {key} ({tensor.shape}): {'成功' if success else '失败'}")
    
    # 获取数据
    print("\n从缓存获取数据...")
    for key in test_data.keys():
        start_time = time.time()
        retrieved = integrated_cache_get(key)
        elapsed = time.time() - start_time
        
        if retrieved is not None:
            print(f"  获取 {key}: 成功 ({elapsed*1000:.2f}ms)")
            # 验证数据正确性
            original = test_data[key]
            if torch.allclose(retrieved.cpu(), original.cpu()):
                print(f"    数据验证: 正确")
            else:
                print(f"    数据验证: 错误")
        else:
            print(f"  获取 {key}: 失败")
    
    # 性能测试
    print("\n性能测试...")
    num_iterations = 100
    access_pattern = ["small_tensor"] * 40 + ["medium_tensor"] * 30 + ["large_tensor"] * 30
    
    start_time = time.time()
    for i in range(num_iterations):
        key = access_pattern[i % len(access_pattern)]
        integrated_cache_get(key)
    
    total_time = time.time() - start_time
    avg_latency = total_time / num_iterations * 1000  # 毫秒
    
    print(f"  总访问次数: {num_iterations}")
    print(f"  总时间: {total_time:.3f}秒")
    print(f"  平均延迟: {avg_latency:.2f}ms")
    print(f"  吞吐量: {num_iterations/total_time:.1f} 操作/秒")
    
    # 查看统计信息
    print("\n缓存统计信息:")
    stats = integrated_cache_stats()
    
    print(f"  总请求数: {stats.get('total_requests', 0)}")
    print(f"  命中次数: {stats.get('cache_hits', 0)}")
    print(f"  未命中次数: {stats.get('cache_misses', 0)}")
    print(f"  命中率: {stats.get('hit_rate', 0):.2%}")
    
    cache_stats = stats.get('cache_stats', {})
    for level in ['l1_cache', 'l2_cache', 'l3_cache']:
        if level in cache_stats:
            level_stats = cache_stats[level]
            print(f"  {level.upper()}:")
            print(f"    使用量: {level_stats.get('current_size', 0):,} 字节")
            print(f"    容量: {level_stats.get('max_size', 0):,} 字节")
            print(f"    使用率: {level_stats.get('usage_percent', 0):.1%}")
            print(f"    命中率: {level_stats.get('hit_rate', 0):.2%}")
    
    # 打印详细统计
    print("\n详细统计信息:")
    print_integrated_cache_stats()
    
    # 清理
    print("\n清理缓存...")
    disable_cache_integration()
    print("示例完成！")

def advanced_usage_example():
    """高级使用示例：模型推理优化"""
    print("\n" + "=" * 60)
    print("高级使用示例：模型推理优化")
    print("=" * 60)
    
    # 模拟模型推理工作流
    class MockModel:
        def __init__(self, name):
            self.name = name
            self.weights = {}
            
        def load_weights(self):
            """加载模型权重"""
            print(f"  加载 {self.name} 权重...")
            # 模拟不同大小的权重
            weight_sizes = {
                'conv1': (64, 3, 3, 3),
                'conv2': (128, 64, 3, 3),
                'fc1': (512, 1024),
                'fc2': (10, 512),
            }
            
            for layer, shape in weight_sizes.items():
                key = f"{self.name}_{layer}"
                cached = integrated_cache_get(key)
                
                if cached is not None:
                    # 从缓存获取
                    self.weights[layer] = cached
                    print(f"    {layer}: 从缓存加载 ({shape})")
                else:
                    # 模拟从磁盘加载
                    self.weights[layer] = torch.randn(*shape)
                    # 存储到缓存
                    integrated_cache_put(key, self.weights[layer])
                    print(f"    {layer}: 从磁盘加载并缓存 ({shape})")
        
        def inference(self, input_tensor):
            """模拟推理"""
            # 使用缓存的权重进行推理
            result = input_tensor
            for layer, weight in self.weights.items():
                # 模拟卷积或全连接操作
                if len(weight.shape) == 4:  # 卷积权重
                    result = torch.nn.functional.conv2d(result, weight)
                else:  # 全连接权重
                    result = torch.matmul(result, weight.T)
            return result
    
    # 启用缓存
    config = CacheIntegrationConfig(
        l1_max_size=1 * 1024**3,      # 1GB
        l2_max_size=4 * 1024**3,      # 4GB
        l3_max_size=20 * 1024**3,     # 20GB
        l3_storage_path="./cache/l3",
        enable_smart_migration=True,
        enable_prefetch=False,  # 禁用预取以简化示例
        enable_monitoring=False,
    )
    
    manager = enable_cache_integration(config)
    
    # 创建多个模型实例
    models = [MockModel(f"model_{i}") for i in range(3)]
    
    # 第一次运行：加载权重到缓存
    print("\n第一次运行：加载权重到缓存")
    for model in models:
        model.load_weights()
    
    # 生成测试输入
    batch_size = 32
    input_tensor = torch.randn(batch_size, 3, 224, 224)
    
    # 多次推理，利用缓存
    print(f"\n进行 {len(models)} 个模型的推理...")
    inference_times = []
    
    for i in range(5):  # 运行5轮
        print(f"\n第 {i+1} 轮推理:")
        round_times = []
        
        for model in models:
            start_time = time.time()
            output = model.inference(input_tensor)
            elapsed = time.time() - start_time
            round_times.append(elapsed)
            
            print(f"  {model.name}: {elapsed*1000:.2f}ms")
        
        avg_time = np.mean(round_times) * 1000
        inference_times.append(avg_time)
        print(f"  平均时间: {avg_time:.2f}ms")
    
    # 分析性能提升
    first_round = inference_times[0]
    last_round = inference_times[-1]
    improvement = (first_round - last_round) / first_round * 100
    
    print(f"\n性能分析:")
    print(f"  第一轮平均时间: {first_round:.2f}ms")
    print(f"  最后一轮平均时间: {last_round:.2f}ms")
    print(f"  性能提升: {improvement:.1f}%")
    
    # 查看缓存效果
    stats = integrated_cache_stats()
    hit_rate = stats.get('hit_rate', 0)
    print(f"\n缓存效果:")
    print(f"  最终命中率: {hit_rate:.2%}")
    
    if hit_rate > 0.8:
        print("  ✅ 缓存效果良好")
    elif hit_rate > 0.5:
        print("  ⚠️  缓存效果一般，考虑调整配置")
    else:
        print("  ❌ 缓存效果不佳，需要优化")
    
    # 清理
    disable_cache_integration()
    print("\n高级示例完成！")

def migration_demo():
    """数据迁移演示"""
    print("\n" + "=" * 60)
    print("数据迁移演示")
    print("=" * 60)
    
    # 使用较小的缓存配置以便观察迁移效果
    config = CacheIntegrationConfig(
        l1_max_size=100 * 1024,      # 100KB - 很小的L1缓存
        l2_max_size=500 * 1024,      # 500KB - 较小的L2缓存
        l3_max_size=2 * 1024 * 1024, # 2MB - 中等L3缓存
        l3_storage_path="./cache/l3_demo",
        enable_smart_migration=True,
        enable_prefetch=False,
        enable_monitoring=True,
        stats_log_interval=2.0,  # 每2秒记录一次
    )
    
    manager = enable_cache_integration(config)
    
    # 创建测试数据
    print("\n创建测试数据...")
    data_sizes = [10, 20, 30, 40, 50]  # KB
    test_data = {}
    
    for i, size_kb in enumerate(data_sizes):
        # 创建张量（每个元素4字节）
        num_elements = size_kb * 256  # 近似大小
        tensor = torch.randn(num_elements)
        key = f"data_{size_kb}kb"
        test_data[key] = tensor
        print(f"  创建 {key}: {tensor.numel() * 4 / 1024:.1f}KB")
    
    # 第一阶段：将所有数据存储到L3
    print("\n第一阶段：存储所有数据到L3")
    for key, tensor in test_data.items():
        # 强制存储到L3
        success = integrated_cache_put(key, tensor)
        print(f"   stored {key} to L3: {'成功' if success else '失败'}")
    
    # 查看 initial 状态
    print("\n初始状态:")
    for key in test_data.keys():
        retrieved = integrated_cache_get(key)
        if retrieved is not None:
            print(f"  {key}: retrieved from cache")
        else:
            print(f"  {key}: not in cache")
    
    # 第二阶段：频繁访问小数据，观察迁移
    print("\n第二阶段：频繁访问小数据")
    small_keys = ["data_10kb", "data_20kb"]
    
    for i in range(20):
        for key in small_keys:
            retrieved = integrated_cache_get(key)
            if retrieved is not None:
                print(f"   for--访问 {key} ({i+1}/20)")
        time.sleep(0.1)  # 给迁移引擎时间
    
    # 查看迁移后状态
    print("\n迁移后状态:")
    stats = integrated_cache_stats()
    cache_stats = stats.get('cache_stats', {})
    
    for level in ['l1_cache', 'l2_cache', 'l3_cache']:
        if level in cache_stats:
            level_stats = cache_stats[level]
            items = level_stats.get('item_count', 0)
            print(f"  {level.upper()}: {items} 个项目")
    
    # 第三阶段：访问大数据，观察淘汰
    print("\n第三阶段：访问大数据")
    large_key = "data_50kb"
    for i in range(10):
        retrieved = integrated_cache_get(large_key)
        if retrieved is not None:
            print(f"  访问 {large_key} ({i+1}/10)")
        time.sleep(0.1)
    
    # 最终统计
    print("\n最终统计:")
    print_integrated_cache_stats()
    
    # 清理
    disable_cache_integration()
    print("\n迁移演示完成！")

def main():
    """主函数"""
    print("三级缓存系统示例")
    print("=" * 60)
    
    try:
        # 运行基本示例
        basic_usage_example()
        
        # 运行高级示例
        advanced_usage_example()
        
        # 运行迁移演示
        migration_demo()
        
        print("\n" + "=" * 60)
        print("所有示例完成！")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n错误: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    # 创建缓存目录
    cache_dir = Path("./cache")
    cache_dir.mkdir(exist_ok=True)
    
    # 运行示例
    exit_code = main()
    sys.exit(exit_code)
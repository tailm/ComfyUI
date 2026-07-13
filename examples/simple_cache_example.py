#!/usr/bin/env python3
"""
三级缓存系统简单示例
演示基本的三级缓存使用，不依赖内存池
"""

import torch
import time
import numpy as np
from pathlib import Path

# 添加当前目录到Python路径
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

def simple_cache_demo():
    """简单缓存演示"""
    print("=" * 60)
    print("三级缓存系统简单演示")
    print("=" * 60)
    
    # 直接使用三级缓存管理器，避免集成依赖
    from comfy.three_level_cache import (
        ThreeLevelCacheManager,
        CacheLevel,
        enable_three_level_cache,
        disable_three_level_cache,
        cache_get,
        cache_put,
        cache_stats
    )
    
    # 创建缓存配置
    cache_config = {
        'l1_cache': {
            'enabled': True,
            'max_size': 100 * 1024**2,  # 100MB
            'device': 'cuda' if torch.cuda.is_available() else 'cpu',
            'eviction_policy': 'lru',
        },
        'l2_cache': {
            'enabled': True,
            'max_size': 500 * 1024**2,  # 500MB
            'compression': False,  # 简化测试
        },
        'l3_cache': {
            'enabled': True,
            'storage_path': './cache/simple_demo',
            'max_size': 2 * 1024**3,  # 2GB
            'compression': False,
            'encryption': False,
            'persistent': False,  # 不持久化以简化
        },
        'migration': {
            'enabled': False,  # 禁用迁移以简化
        },
        'prefetch': {
            'enabled': False,  # 禁用预取以简化
        },
    }
    
    # 启用三级缓存
    print("启用三级缓存...")
    enable_three_level_cache(cache_config)
    
    # 测试数据
    print("\n创建测试数据...")
    test_data = {}
    
    # 小数据（适合L1）
    small_tensor = torch.randn(100, 100)
    test_data["small"] = small_tensor
    print(f"  小数据: {small_tensor.shape}, 大小: {small_tensor.numel() * 4 / 1024:.1f}KB")
    
    # 中等数据（适合L2）
    medium_tensor = torch.randn(1000, 1000)
    test_data["medium"] = medium_tensor
    print(f"  中等数据: {medium_tensor.shape}, 大小: {medium_tensor.numel() * 4 / 1024 / 1024:.1f}MB")
    
    # 大数据（适合L3）
    large_tensor = torch.randn(2000, 2000)
    test_data["large"] = large_tensor
    print(f"  大数据: {large_tensor.shape}, 大小: {large_tensor.numel() * 4 / 1024 / 1024:.1f}MB")
    
    # 存储数据
    print("\n存储数据到缓存...")
    for key, tensor in test_data.items():
        # 根据大小选择缓存层级
        size_mb = tensor.numel() * 4 / 1024 / 1024
        
        if size_mb < 1:  # < 1MB 存到L1
            level = CacheLevel.L1
            level_name = "L1"
        elif size_mb < 10:  # < 10MB 存到L2
            level = CacheLevel.L2
            level_name = "L2"
        else:  # >= 10MB 存到L3
            level = CacheLevel.L3
            level_name = "L3"
        
        success = cache_put(key, tensor, level)
        print(f"  存储 {key} 到 {level_name}: {'成功' if success else '失败'}")
    
    # 获取数据
    print("\n从缓存获取数据...")
    for key in test_data.keys():
        start_time = time.time()
        retrieved = cache_get(key)
        elapsed = (time.time() - start_time) * 1000  # 毫秒
        
        if retrieved is not None:
            print(f"  获取 {key}: 成功 ({elapsed:.2f}ms)")
            # 验证数据
            original = test_data[key]
            if torch.allclose(retrieved.cpu(), original.cpu()):
                print(f"    数据验证: ✓ 正确")
            else:
                print(f"    数据验证: ✗ 错误")
        else:
            print(f"  获取 {key}: 失败")
    
    # 性能测试
    print("\n性能测试...")
    num_iterations = 50
    access_pattern = ["small"] * 20 + ["medium"] * 20 + ["large"] * 10
    
    start_time = time.time()
    for i in range(num_iterations):
        key = access_pattern[i % len(access_pattern)]
        cache_get(key)
    
    total_time = time.time() - start_time
    avg_latency = total_time / num_iterations * 1000  # 毫秒
    
    print(f"  总访问次数: {num_iterations}")
    print(f"  总时间: {total_time:.3f}秒")
    print(f"  平均延迟: {avg_latency:.2f}ms")
    print(f"  吞吐量: {num_iterations/total_time:.1f} 操作/秒")
    
    # 查看统计信息
    print("\n缓存统计信息:")
    stats = cache_stats()
    
    print(f"  总请求数: {stats.get('total_requests', 0)}")
    print(f"  命中次数: {stats.get('cache_hits', 0)}")
    print(f"  未命中次数: {stats.get('cache_misses', 0)}")
    print(f"  命中率: {stats.get('hit_rate', 0):.2%}")
    
    # 各层级统计
    for level in ['l1_cache', 'l2_cache', 'l3_cache']:
        if level in stats:
            level_stats = stats[level]
            print(f"  {level.upper()}:")
            print(f"    使用量: {level_stats.get('current_size', 0):,} 字节")
            print(f"    容量: {level_stats.get('max_size', 0):,} 字节")
            print(f"    使用率: {level_stats.get('usage_percent', 0):.1%}")
            print(f"    命中率: {level_stats.get('hit_rate', 0):.2%}")
            print(f"    项目数: {level_stats.get('item_count', 0)}")
    
    # 清理
    print("\n清理缓存...")
    disable_three_level_cache()
    print("简单演示完成！")

def cache_level_demo():
    """缓存层级演示"""
    print("\n" + "=" * 60)
    print("缓存层级演示")
    print("=" * 60)
    
    from comfy.three_level_cache import (
        ThreeLevelCacheManager,
        CacheLevel
    )
    
    # 创建缓存管理器
    cache_config = {
        'l1_cache': {
            'enabled': True,
            'max_size': 50 * 1024**2,  # 50MB
            'device': 'cpu',  # 使用CPU以简化
        },
        'l2_cache': {
            'enabled': True,
            'max_size': 200 * 1024**2,  # 200MB
            'compression': False,
        },
        'l3_cache': {
            'enabled': True,
            'storage_path': './cache/level_demo',
            'max_size': 1 * 1024**3,  # 1GB
            'compression': False,
            'encryption': False,
            'persistent': False,
        },
        'migration': {
            'enabled': False,
        },
        'prefetch': {
            'enabled': False,
        },
    }
    
    print("创建三级缓存管理器...")
    manager = ThreeLevelCacheManager(cache_config)
    
    # 演示不同层级存储
    print("\n演示不同层级存储:")
    
    # L1存储（小数据）
    small_data = torch.randn(10, 10)
    print(f"  存储小数据到L1...")
    success = manager.put("l1_data", small_data, CacheLevel.L1)
    print(f"    结果: {'成功' if success else '失败'}")
    
    # L2存储（中等数据）
    medium_data = torch.randn(100, 100)
    print(f"  存储中等数据到L2...")
    success = manager.put("l2_data", medium_data, CacheLevel.L2)
    print(f"    结果: {'成功' if success else '失败'}")
    
    # L3存储（大数据）
    large_data = torch.randn(500, 500)
    print(f"  存储大数据到L3...")
    success = manager.put("l3_data", large_data, CacheLevel.L3)
    print(f"    结果: {'成功' if success else '失败'}")
    
    # 验证数据存在
    print("\n验证数据存在:")
    for key in ["l1_data", "l2_data", "l3_data"]:
        exists = manager.contains(key)
        print(f"  {key}: {'存在' if exists else '不存在'}")
    
    # 获取数据
    print("\n获取数据:")
    for key in ["l1_data", "l2_data", "l3_data"]:
        start_time = time.time()
        data = manager.get(key)
        elapsed = (time.time() - start_time) * 1000
        
        if data is not None:
            print(f"  {key}: 获取成功 ({elapsed:.2f}ms)")
        else:
            print(f"  {key}: 获取失败")
    
    # 查看管理器统计
    print("\n管理器统计:")
    stats = manager.get_stats()
    print(f"  总项目数: {stats.get('total_items', 0)}")
    print(f"  总大小: {stats.get('total_size', 0):,} 字节")
    
    # 清理
    print("\n清理管理器...")
    manager.clear()
    print("层级演示完成！")

def main():
    """主函数"""
    print("三级缓存系统简单示例")
    print("=" * 60)
    
    try:
        # 创建缓存目录
        cache_dir = Path("./cache")
        cache_dir.mkdir(exist_ok=True)
        
        # 运行简单演示
        simple_cache_demo()
        
        # 运行层级演示
        cache_level_demo()
        
        print("\n" + "=" * 60)
        print("所有演示完成！")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n错误: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
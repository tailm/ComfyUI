#!/usr/bin/env python3
"""
测试实时GPU内存清理效果
模拟CLIP Text Encode等操作的内存使用和清理
"""

import torch
import gc
import time
import sys
import os

# 添加ComfyUI路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def simulate_clip_text_encode_memory_usage():
    """模拟CLIP Text Encode的内存使用模式"""
    print("🧪 模拟CLIP Text Encode内存使用模式")
    
    # 创建一些模拟张量来占用内存（模拟CLIP模型）
    memory_blocks = []
    
    # 模拟不同大小的内存分配（类似CLIP的不同层）
    block_sizes = [
        100 * 1024 * 1024,  # 100MB - 小型张量
        200 * 1024 * 1024,  # 200MB - 中等张量
        500 * 1024 * 1024,  # 500MB - 大型张量
        1000 * 1024 * 1024, # 1GB - 非常大的张量
    ]
    
    print("分配模拟内存块...")
    for i, size in enumerate(block_sizes):
        try:
            # 在GPU上分配内存
            block = torch.zeros(size // 4, dtype=torch.float32, device='cuda')  # float32每个元素4字节
            memory_blocks.append(block)
            allocated = torch.cuda.memory_allocated() / (1024 * 1024)  # MB
            print(f"  块 {i+1}: {size/(1024*1024):.0f}MB, 总分配: {allocated:.1f}MB")
        except torch.cuda.OutOfMemoryError:
            print(f"  ❌ 内存不足，无法分配 {size/(1024*1024):.0f}MB 的块")
            break
    
    return memory_blocks

def test_standard_cleanup():
    """测试标准清理方法"""
    print("\n" + "="*60)
    print("测试标准清理方法")
    print("="*60)
    
    # 模拟内存使用
    blocks = simulate_clip_text_encode_memory_usage()
    
    # 记录清理前内存
    before = torch.cuda.memory_allocated() / (1024 * 1024)  # MB
    
    # 标准清理
    print("\n执行标准清理...")
    start_time = time.time()
    
    # 1. Python垃圾回收
    gc.collect()
    
    # 2. PyTorch缓存清理
    torch.cuda.empty_cache()
    torch.cuda.synchronize()
    
    cleanup_time = time.time() - start_time
    
    # 记录清理后内存
    after = torch.cuda.memory_allocated() / (1024 * 1024)  # MB
    freed = before - after
    
    print(f"清理前: {before:.1f}MB")
    print(f"清理后: {after:.1f}MB")
    print(f"释放了: {freed:.1f}MB")
    print(f"清理时间: {cleanup_time:.3f}秒")
    
    # 清理内存块
    for block in blocks:
        del block
    blocks.clear()
    
    # 最终清理
    gc.collect()
    torch.cuda.empty_cache()
    
    return freed

def test_enhanced_cleanup():
    """测试增强清理方法"""
    print("\n" + "="*60)
    print("测试增强清理方法")
    print("="*60)
    
    # 导入增强清理模块
    try:
        from enhanced_memory_cleanup import EnhancedMemoryCleaner
    except ImportError:
        # 如果模块不可用，使用本地实现
        print("⚠️ 增强清理模块不可用，使用简化版本")
        
        # 模拟内存使用
        blocks = simulate_clip_text_encode_memory_usage()
        
        # 记录清理前内存
        before = torch.cuda.memory_allocated() / (1024 * 1024)  # MB
        
        print("\n执行增强清理...")
        start_time = time.time()
        
        # 增强清理步骤
        # 1. 强制Python垃圾回收
        collected = gc.collect()
        print(f"  Python GC回收了 {collected} 个对象")
        
        # 2. 清理PyTorch缓存
        torch.cuda.empty_cache()
        torch.cuda.synchronize()
        
        # 3. 重置内存统计
        torch.cuda.reset_peak_memory_stats()
        torch.cuda.reset_accumulated_memory_stats()
        
        # 4. 清理IPC缓存
        torch.cuda.ipc_collect()
        
        cleanup_time = time.time() - start_time
        
        # 记录清理后内存
        after = torch.cuda.memory_allocated() / (1024 * 1024)  # MB
        freed = before - after
        
        print(f"清理前: {before:.1f}MB")
        print(f"清理后: {after:.1f}MB")
        print(f"释放了: {freed:.1f}MB")
        print(f"清理时间: {cleanup_time:.3f}秒")
        
        # 清理内存块
        for block in blocks:
            del block
        blocks.clear()
        
        return freed
    
    # 使用增强清理模块
    cleaner = EnhancedMemoryCleaner(cleanup_threshold_mb=100)
    
    # 模拟内存使用
    blocks = simulate_clip_text_encode_memory_usage()
    
    print("\n执行增强清理...")
    result = cleaner.cleanup(aggressive=True)
    
    print(f"清理结果:")
    print(f"  释放了: {result['freed_mb']:.1f}MB")
    print(f"  当前使用: {result['current_usage_mb']:.1f}MB")
    print(f"  清理次数: {result['cleanup_count']}")
    
    # 清理步骤详情
    if 'steps' in result:
        print("  清理步骤:")
        for step, info in result['steps'].items():
            print(f"    {step}: {info}")
    
    # 清理内存块
    for block in blocks:
        del block
    blocks.clear()
    
    # 最终清理
    cleaner.cleanup()
    
    return result['freed_mb']

def test_multiple_operations():
    """测试多次操作的内存清理效果"""
    print("\n" + "="*60)
    print("测试多次操作的内存清理效果")
    print("="*60)
    
    # 导入增强清理模块
    try:
        from enhanced_memory_cleanup import EnhancedMemoryCleaner
        cleaner = EnhancedMemoryCleaner(cleanup_threshold_mb=200)
    except ImportError:
        cleaner = None
    
    operations = [
        ("CLIP Text Encode (小型)", 100 * 1024 * 1024),
        ("CLIP Text Encode (中型)", 300 * 1024 * 1024),
        ("CLIP Text Encode (大型)", 600 * 1024 * 1024),
        ("VAE Decode", 400 * 1024 * 1024),
        ("UNet Inference", 800 * 1024 * 1024),
    ]
    
    memory_history = []
    
    for op_name, size in operations:
        print(f"\n操作: {op_name}")
        
        # 模拟操作内存使用
        try:
            # 分配内存
            block = torch.zeros(size // 4, dtype=torch.float32, device='cuda')
            
            # 记录内存使用
            allocated = torch.cuda.memory_allocated() / (1024 * 1024)
            memory_history.append((op_name, allocated, "分配后"))
            print(f"  分配后内存: {allocated:.1f}MB")
            
            # 执行清理
            if cleaner:
                result = cleaner.cleanup_after_model(op_name)
                freed = result.get('freed_mb', 0)
                current = result.get('current_usage_mb', 0)
                print(f"  清理后释放: {freed:.1f}MB")
                print(f"  当前内存: {current:.1f}MB")
            else:
                # 标准清理
                gc.collect()
                torch.cuda.empty_cache()
                after = torch.cuda.memory_allocated() / (1024 * 1024)
                freed = allocated - after
                print(f"  清理后释放: {freed:.1f}MB")
                print(f"  当前内存: {after:.1f}MB")
            
            # 释放内存块
            del block
            
        except torch.cuda.OutOfMemoryError:
            print(f"  ❌ 内存不足，无法分配 {size/(1024*1024):.0f}MB")
            break
    
    # 最终清理
    gc.collect()
    torch.cuda.empty_cache()
    final_memory = torch.cuda.memory_allocated() / (1024 * 1024)
    print(f"\n最终内存使用: {final_memory:.1f}MB")
    
    return memory_history

def monitor_memory_usage(duration=30, interval=2):
    """监控内存使用情况"""
    print("\n" + "="*60)
    print(f"监控内存使用情况 ({duration}秒)")
    print("="*60)
    
    import threading
    import time
    
    stop_monitoring = False
    memory_readings = []
    
    def monitor_thread():
        nonlocal stop_monitoring
        start_time = time.time()
        
        while not stop_monitoring and time.time() - start_time < duration:
            allocated = torch.cuda.memory_allocated() / (1024 * 1024)
            reserved = torch.cuda.memory_reserved() / (1024 * 1024)
            memory_readings.append((time.time() - start_time, allocated, reserved))
            time.sleep(interval)
    
    # 启动监控线程
    monitor = threading.Thread(target=monitor_thread)
    monitor.start()
    
    # 模拟一些内存操作
    print("模拟内存操作...")
    blocks = []
    
    for i in range(5):
        try:
            size = 200 * 1024 * 1024  # 200MB
            block = torch.zeros(size // 4, dtype=torch.float32, device='cuda')
            blocks.append(block)
            print(f"  操作 {i+1}: 分配了 {size/(1024*1024):.0f}MB")
            
            # 等待一会儿
            time.sleep(1)
            
            # 清理
            if i % 2 == 0:  # 每隔一次操作清理一次
                gc.collect()
                torch.cuda.empty_cache()
                print(f"    清理后内存: {torch.cuda.memory_allocated()/(1024*1024):.1f}MB")
            
        except torch.cuda.OutOfMemoryError:
            print(f"  ❌ 内存不足")
            break
    
    # 停止监控
    stop_monitoring = True
    monitor.join()
    
    # 清理内存
    for block in blocks:
        del block
    gc.collect()
    torch.cuda.empty_cache()
    
    # 输出监控结果
    print("\n内存使用监控结果:")
    print("时间(秒) | 已分配(MB) | 已保留(MB)")
    print("-" * 40)
    for t, allocated, reserved in memory_readings[::3]:  # 每3个采样显示一个
        print(f"{t:7.1f} | {allocated:10.1f} | {reserved:10.1f}")
    
    # 计算统计信息
    if memory_readings:
        max_allocated = max(allocated for _, allocated, _ in memory_readings)
        avg_allocated = sum(allocated for _, allocated, _ in memory_readings) / len(memory_readings)
        print(f"\n最大内存使用: {max_allocated:.1f}MB")
        print(f"平均内存使用: {avg_allocated:.1f}MB")
    
    return memory_readings

def main():
    """主测试函数"""
    print("🚀 GPU内存实时清理测试")
    print("="*60)
    
    # 检查CUDA是否可用
    if not torch.cuda.is_available():
        print("❌ CUDA不可用，无法进行GPU内存测试")
        return
    
    # 获取GPU信息
    device_count = torch.cuda.device_count()
    device_name = torch.cuda.get_device_name(0)
    total_memory = torch.cuda.get_device_properties(0).total_memory / (1024 ** 3)  # GB
    
    print(f"GPU设备: {device_name}")
    print(f"设备数量: {device_count}")
    print(f"总显存: {total_memory:.1f} GB")
    print("="*60)
    
    try:
        # 测试1: 标准清理
        freed_standard = test_standard_cleanup()
        
        # 测试2: 增强清理
        freed_enhanced = test_enhanced_cleanup()
        
        # 测试3: 多次操作
        memory_history = test_multiple_operations()
        
        # 测试4: 内存监控
        monitor_memory_usage(duration=20, interval=1)
        
        # 总结
        print("\n" + "="*60)
        print("测试总结")
        print("="*60)
        print(f"标准清理释放: {freed_standard:.1f}MB")
        print(f"增强清理释放: {freed_enhanced:.1f}MB")
        
        if freed_enhanced > freed_standard:
            improvement = ((freed_enhanced - freed_standard) / freed_standard) * 100
            print(f"增强清理提升: +{improvement:.1f}%")
        else:
            print("增强清理效果与标准清理相似")
        
        # 最终内存状态
        final_allocated = torch.cuda.memory_allocated() / (1024 * 1024)
        final_reserved = torch.cuda.memory_reserved() / (1024 * 1024)
        print(f"\n最终内存状态:")
        print(f"  已分配: {final_allocated:.1f}MB")
        print(f"  已保留: {final_reserved:.1f}MB")
        
        if final_allocated < 100:  # 小于100MB
            print("✅ 内存清理效果良好")
        elif final_allocated < 500:  # 小于500MB
            print("⚠️  内存清理效果一般，仍有较多内存占用")
        else:
            print("❌ 内存清理效果不佳，内存占用较高")
        
    except Exception as e:
        print(f"❌ 测试过程中出错: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # 最终清理
        print("\n执行最终清理...")
        gc.collect()
        torch.cuda.empty_cache()
        torch.cuda.synchronize()
        
        final = torch.cuda.memory_allocated() / (1024 * 1024)
        print(f"最终内存占用: {final:.1f}MB")
        
        if final < 50:
            print("🎉 测试完成，内存清理效果优秀！")
        else:
            print("📊 测试完成，内存清理效果可接受")

if __name__ == "__main__":
    main()
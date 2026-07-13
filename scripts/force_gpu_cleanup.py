#!/usr/bin/env python3
"""
强制GPU内存清理脚本
用于在CLIP Text Encode等操作后彻底清理GPU内存
"""

import torch
import gc
import time
import logging
import sys
import os

# 添加ComfyUI路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def force_gpu_cleanup(aggressive=False):
    """
    强制清理GPU内存
    
    Args:
        aggressive: 是否进行激进清理（包括强制垃圾回收）
    """
    print("=" * 60)
    print("开始强制GPU内存清理")
    print("=" * 60)
    
    # 1. 检查CUDA是否可用
    if not torch.cuda.is_available():
        print("❌ CUDA不可用，跳过GPU清理")
        return
    
    # 2. 获取清理前的内存状态
    device = torch.device("cuda:0")
    before_memory = torch.cuda.memory_allocated(device)
    before_reserved = torch.cuda.memory_reserved(device)
    before_cached = torch.cuda.memory_cached(device) if hasattr(torch.cuda, 'memory_cached') else 0
    
    print(f"清理前:")
    print(f"  已分配内存: {before_memory / 1024**3:.2f} GB")
    print(f"  保留内存: {before_reserved / 1024**3:.2f} GB")
    if before_cached > 0:
        print(f"  缓存内存: {before_cached / 1024**3:.2f} GB")
    
    # 3. 第一步：清理PyTorch缓存
    print("\n[1/4] 清理PyTorch CUDA缓存...")
    torch.cuda.empty_cache()
    time.sleep(0.5)
    
    # 4. 第二步：Python垃圾回收
    print("[2/4] 执行Python垃圾回收...")
    collected = gc.collect()
    print(f"  回收了 {collected} 个对象")
    
    # 5. 第三步：再次清理PyTorch缓存
    print("[3/4] 再次清理PyTorch CUDA缓存...")
    torch.cuda.empty_cache()
    time.sleep(0.5)
    
    # 6. 第四步：激进清理（如果需要）
    if aggressive:
        print("[4/4] 执行激进清理...")
        # 强制重置CUDA设备（危险操作，仅作为最后手段）
        try:
            # 尝试释放所有CUDA内存
            torch.cuda.synchronize()
            torch.cuda.ipc_collect()
            
            # 重置CUDA设备（仅在其他方法无效时使用）
            # torch.cuda.reset_peak_memory_stats()
            # torch.cuda.reset_accumulated_memory_stats()
            
            print("  激进清理完成")
        except Exception as e:
            print(f"  激进清理失败: {e}")
    
    # 7. 获取清理后的内存状态
    after_memory = torch.cuda.memory_allocated(device)
    after_reserved = torch.cuda.memory_reserved(device)
    after_cached = torch.cuda.memory_cached(device) if hasattr(torch.cuda, 'memory_cached') else 0
    
    # 8. 计算释放的内存
    memory_freed = before_memory - after_memory
    reserved_freed = before_reserved - after_reserved
    
    print(f"\n清理后:")
    print(f"  已分配内存: {after_memory / 1024**3:.2f} GB")
    print(f"  保留内存: {after_reserved / 1024**3:.2f} GB")
    if after_cached > 0:
        print(f"  缓存内存: {after_cached / 1024**3:.2f} GB")
    
    print(f"\n✅ 清理完成!")
    print(f"  释放的已分配内存: {memory_freed / 1024**3:.2f} GB")
    print(f"  释放的保留内存: {reserved_freed / 1024**3:.2f} GB")
    
    # 9. 获取当前GPU状态
    try:
        import subprocess
        result = subprocess.run(['nvidia-smi', '--query-gpu=memory.used,memory.free,memory.total', '--format=csv,noheader,nounits'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            used, free, total = map(int, result.stdout.strip().split(','))
            print(f"\n📊 GPU内存状态:")
            print(f"  已使用: {used} MiB")
            print(f"  可用: {free} MiB")
            print(f"  总计: {total} MiB")
            print(f"  使用率: {used/total*100:.1f}%")
    except Exception as e:
        print(f"  无法获取GPU状态: {e}")
    
    print("=" * 60)

def monitor_gpu_memory(interval=5, duration=60):
    """
    监控GPU内存使用情况
    
    Args:
        interval: 监控间隔（秒）
        duration: 监控持续时间（秒）
    """
    if not torch.cuda.is_available():
        print("❌ CUDA不可用，无法监控GPU内存")
        return
    
    print(f"\n🔍 开始监控GPU内存（每{interval}秒一次，共{duration}秒）")
    print("-" * 40)
    
    device = torch.device("cuda:0")
    start_time = time.time()
    
    while time.time() - start_time < duration:
        allocated = torch.cuda.memory_allocated(device)
        reserved = torch.cuda.memory_reserved(device)
        
        # 获取nvidia-smi信息
        try:
            import subprocess
            result = subprocess.run(['nvidia-smi', '--query-gpu=memory.used,memory.free', '--format=csv,noheader,nounits'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                used, free = map(int, result.stdout.strip().split(','))
                print(f"[{time.strftime('%H:%M:%S')}] PyTorch: {allocated/1024**3:.2f}GB / {reserved/1024**3:.2f}GB | GPU: {used}MiB / {free}MiB")
        except:
            print(f"[{time.strftime('%H:%M:%S')}] PyTorch: {allocated/1024**3:.2f}GB / {reserved/1024**3:.2f}GB")
        
        time.sleep(interval)
    
    print("-" * 40)
    print("监控结束")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="强制GPU内存清理工具")
    parser.add_argument("--aggressive", action="store_true", help="执行激进清理")
    parser.add_argument("--monitor", action="store_true", help="监控GPU内存使用情况")
    parser.add_argument("--interval", type=int, default=5, help="监控间隔（秒）")
    parser.add_argument("--duration", type=int, default=60, help="监控持续时间（秒）")
    
    args = parser.parse_args()
    
    if args.monitor:
        monitor_gpu_memory(args.interval, args.duration)
    else:
        force_gpu_cleanup(args.aggressive)
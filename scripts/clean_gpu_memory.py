#!/usr/bin/env python3
"""
GPU显存清理脚本
在每次视频生成后自动清理GPU显存，防止累积导致OOM错误
"""

import torch
import gc
import os
import sys
import time
from datetime import datetime

def clean_gpu_memory(verbose=True):
    """
    清理GPU显存
    """
    try:
        if verbose:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 开始清理GPU显存...")
        
        # 记录清理前的显存使用情况
        if torch.cuda.is_available():
            device = torch.cuda.current_device()
            allocated_before = torch.cuda.memory_allocated(device) / 1024**3  # GB
            reserved_before = torch.cuda.memory_reserved(device) / 1024**3  # GB
            
            if verbose:
                print(f"清理前: 已分配 {allocated_before:.2f} GiB, 保留 {reserved_before:.2f} GiB")
        
        # 强制Python垃圾回收
        gc.collect()
        
        # 清理PyTorch缓存
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            torch.cuda.synchronize()
            
            # 记录清理后的显存使用情况
            allocated_after = torch.cuda.memory_allocated(device) / 1024**3  # GB
            reserved_after = torch.cuda.memory_reserved(device) / 1024**3  # GB
            
            if verbose:
                print(f"清理后: 已分配 {allocated_after:.2f} GiB, 保留 {reserved_after:.2f} GiB")
                print(f"释放了 {allocated_before - allocated_after:.2f} GiB 显存")
        
        # 清理系统缓存（如果可能）
        try:
            if sys.platform == 'linux':
                # 尝试清理系统页面缓存
                os.system('sync')
                with open('/proc/sys/vm/drop_caches', 'w') as f:
                    f.write('3\n')
        except:
            pass  # 忽略权限错误
        
        if verbose:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] GPU显存清理完成")
        
        return True
        
    except Exception as e:
        print(f"清理GPU显存时出错: {e}")
        return False

def monitor_gpu_memory(interval=5, duration=60):
    """
    监控GPU显存使用情况
    """
    if not torch.cuda.is_available():
        print("CUDA不可用，无法监控GPU显存")
        return
    
    print(f"开始监控GPU显存使用情况，间隔{interval}秒，持续{duration}秒...")
    
    start_time = time.time()
    while time.time() - start_time < duration:
        device = torch.cuda.current_device()
        allocated = torch.cuda.memory_allocated(device) / 1024**3  # GB
        reserved = torch.cuda.memory_reserved(device) / 1024**3  # GB
        max_allocated = torch.cuda.max_memory_allocated(device) / 1024**3  # GB
        
        print(f"[{datetime.now().strftime('%H:%M:%S')}] "
              f"已分配: {allocated:.2f} GiB, "
              f"保留: {reserved:.2f} GiB, "
              f"峰值: {max_allocated:.2f} GiB")
        
        # 如果显存使用超过阈值，自动清理
        if allocated > 12:  # 超过12GB时清理
            print(f"警告: 显存使用超过12GB，自动清理...")
            clean_gpu_memory(verbose=True)
        
        time.sleep(interval)
    
    print("GPU显存监控结束")

def get_gpu_memory_info():
    """
    获取GPU显存信息
    """
    if not torch.cuda.is_available():
        return {"available": False}
    
    device = torch.cuda.current_device()
    info = {
        "available": True,
        "device_name": torch.cuda.get_device_name(device),
        "allocated_gb": torch.cuda.memory_allocated(device) / 1024**3,
        "reserved_gb": torch.cuda.memory_reserved(device) / 1024**3,
        "max_allocated_gb": torch.cuda.max_memory_allocated(device) / 1024**3,
        "total_memory_gb": torch.cuda.get_device_properties(device).total_memory / 1024**3,
        "free_memory_gb": 0
    }
    
    # 计算可用显存
    info["free_memory_gb"] = info["total_memory_gb"] - info["allocated_gb"]
    
    return info

def print_gpu_memory_info():
    """
    打印GPU显存信息
    """
    info = get_gpu_memory_info()
    
    if not info["available"]:
        print("CUDA不可用")
        return
    
    print("=" * 50)
    print("GPU显存信息:")
    print(f"设备: {info['device_name']}")
    print(f"总显存: {info['total_memory_gb']:.2f} GiB")
    print(f"已分配: {info['allocated_gb']:.2f} GiB")
    print(f"已保留: {info['reserved_gb']:.2f} GiB")
    print(f"可用: {info['free_memory_gb']:.2f} GiB")
    print(f"峰值使用: {info['max_allocated_gb']:.2f} GiB")
    print("=" * 50)
    
    # 警告信息
    if info["allocated_gb"] > info["total_memory_gb"] * 0.8:
        print("⚠️  警告: 显存使用超过80%!")
    elif info["allocated_gb"] > info["total_memory_gb"] * 0.6:
        print("⚠️  注意: 显存使用超过60%")

if __name__ == "__main__":
    # 命令行接口
    import argparse
    
    parser = argparse.ArgumentParser(description="GPU显存清理工具")
    parser.add_argument("--clean", action="store_true", help="清理GPU显存")
    parser.add_argument("--monitor", action="store_true", help="监控GPU显存使用情况")
    parser.add_argument("--info", action="store_true", help="显示GPU显存信息")
    parser.add_argument("--interval", type=int, default=5, help="监控间隔（秒）")
    parser.add_argument("--duration", type=int, default=60, help="监控持续时间（秒）")
    
    args = parser.parse_args()
    
    if args.info:
        print_gpu_memory_info()
    
    if args.clean:
        clean_gpu_memory(verbose=True)
    
    if args.monitor:
        monitor_gpu_memory(interval=args.interval, duration=args.duration)
    
    # 如果没有指定任何参数，显示信息并清理
    if not any([args.clean, args.monitor, args.info]):
        print_gpu_memory_info()
        clean_gpu_memory(verbose=True)
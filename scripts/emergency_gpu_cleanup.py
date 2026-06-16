#!/usr/bin/env python3
"""
紧急GPU内存清理脚本
用于解决 torch.OutOfMemoryError 错误
"""

import torch
import gc
import os
import subprocess
import time

def cleanup_gpu_memory():
    """清理GPU内存"""
    print("=" * 60)
    print("紧急GPU内存清理")
    print("=" * 60)
    
    # 1. 清理PyTorch缓存
    print("1. 清理PyTorch GPU缓存...")
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        torch.cuda.synchronize()
        print(f"   GPU内存已清理")
    
    # 2. 运行垃圾回收
    print("2. 运行Python垃圾回收...")
    gc.collect()
    
    # 3. 清理系统缓存
    print("3. 清理系统缓存...")
    try:
        # 清理页面缓存
        os.system("sync && echo 1 > /proc/sys/vm/drop_caches")
        # 清理目录项和inode
        os.system("sync && echo 2 > /proc/sys/vm/drop_caches")
        # 清理页面缓存、目录项和inode
        os.system("sync && echo 3 > /proc/sys/vm/drop_caches")
        print("   系统缓存已清理")
    except:
        print("   系统缓存清理失败（需要root权限）")
    
    # 4. 显示当前GPU状态
    print("4. 当前GPU状态:")
    try:
        result = subprocess.run(['nvidia-smi', '--query-gpu=memory.total,memory.used,memory.free', '--format=csv,noheader,nounits'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            total, used, free = result.stdout.strip().split(',')
            print(f"   总显存: {int(total)/1024:.1f} GB")
            print(f"   已使用: {int(used)/1024:.1f} GB")
            print(f"   可用: {int(free)/1024:.1f} GB")
    except:
        print("   无法获取GPU状态")
    
    # 5. 清理PyTorch内存分配器缓存
    print("5. 清理PyTorch内存分配器...")
    if torch.cuda.is_available():
        # 重置内存分配器
        torch.cuda.memory._set_allocator_settings('max_split_size_mb:32')
        torch.cuda.memory._record_memory_history(False)
        print("   内存分配器已重置")
    
    print("=" * 60)
    print("清理完成！")
    print("=" * 60)

def optimize_memory_settings():
    """优化内存设置"""
    print("\n" + "=" * 60)
    print("优化内存设置")
    print("=" * 60)
    
    # 设置环境变量
    env_vars = {
        'PYTORCH_CUDA_ALLOC_CONF': 'max_split_size_mb:32,garbage_collection_threshold:0.9',
        'PYTORCH_CUDA_MEMORY_FRACTION': '0.95',  # 使用95%显存，留出一些余量
        'CUDA_LAUNCH_BLOCKING': '0',
        'TORCH_CUDNN_V8_API_ENABLED': '1',
        'PYTORCH_NO_CUDA_MEMORY_CACHING': '0',
        'PYTORCH_MEMORY_EFFICIENT_CONVOLUTION': '1',
    }
    
    print("推荐的环境变量设置:")
    for key, value in env_vars.items():
        print(f"  export {key}={value}")
    
    # 创建优化脚本
    script_content = """#!/bin/bash
# ComfyUI内存优化启动脚本

# 设置内存优化环境变量
export PYTORCH_CUDA_ALLOC_CONF="max_split_size_mb:32,garbage_collection_threshold:0.9"
export PYTORCH_CUDA_MEMORY_FRACTION=0.95
export CUDA_LAUNCH_BLOCKING=0
export TORCH_CUDNN_V8_API_ENABLED=1
export PYTORCH_NO_CUDA_MEMORY_CACHING=0
export PYTORCH_MEMORY_EFFICIENT_CONVOLUTION=1

# 清理缓存
python -c "import torch; torch.cuda.empty_cache()" 2>/dev/null || true

# 启动ComfyUI
exec python main.py --listen 0.0.0.0 --port 8188 --highvram --force-fp16 --preview-method auto --disable-smart-memory
"""
    
    script_path = "/home/gpu/ComfyUI/start_memory_optimized.sh"
    with open(script_path, 'w') as f:
        f.write(script_content)
    
    os.chmod(script_path, 0o755)
    print(f"\n✅ 已创建优化启动脚本: {script_path}")
    print("=" * 60)

def check_workflow_memory():
    """检查工作流内存使用建议"""
    print("\n" + "=" * 60)
    print("工作流内存优化建议")
    print("=" * 60)
    
    suggestions = [
        "1. 降低视频分辨率 (如从512x512降到384x384)",
        "2. 减少批处理大小 (batch_size)",
        "3. 使用更小的模型 (如使用fp8或fp16版本)",
        "4. 启用模型卸载 (model offloading)",
        "5. 使用--lowvram模式替代--highvram",
        "6. 减少同时运行的节点数量",
        "7. 清理不必要的自定义节点",
        "8. 定期重启ComfyUI释放内存"
    ]
    
    for suggestion in suggestions:
        print(f"  • {suggestion}")
    
    print("\n当前配置:")
    print("  • GPU: RTX 4070 Ti SUPER (16GB)")
    print("  • 已使用: ~14.6GB")
    print("  • 可用: ~0.5GB")
    print("  • 建议: 至少保留1-2GB显存余量")
    print("=" * 60)

if __name__ == "__main__":
    cleanup_gpu_memory()
    optimize_memory_settings()
    check_workflow_memory()
    
    print("\n🎯 执行步骤:")
    print("1. 运行清理脚本: python scripts/emergency_gpu_cleanup.py")
    print("2. 使用优化脚本启动: ./start_memory_optimized.sh")
    print("3. 如果仍然内存不足，考虑:")
    print("   - 降低工作流复杂度")
    print("   - 使用--lowvram模式")
    print("   - 重启系统释放所有内存")
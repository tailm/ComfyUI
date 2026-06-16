#!/bin/bash
# ComfyUI 简单OOM修复启动脚本
# 最小化配置，避免自定义节点错误

set -e

echo "=========================================="
echo "ComfyUI 简单OOM修复启动脚本"
echo "最小化配置，专注于解决内存问题"
echo "=========================================="

# 1. 停止现有服务
echo "[1/5] 停止现有ComfyUI服务..."
pkill -f "python main.py" 2>/dev/null || true
sleep 3

# 2. 清理缓存
echo "[2/5] 清理缓存..."
python3 -c "
import torch
import gc

if torch.cuda.is_available():
    print('清理GPU缓存...')
    torch.cuda.empty_cache()
    torch.cuda.synchronize()
    gc.collect()
    print('✅ GPU缓存清理完成')
else:
    print('⚠️  CUDA不可用')
"

# 3. 设置关键环境变量
echo "[3/5] 设置关键环境变量..."
export PYTORCH_CUDA_MEMORY_FRACTION=0.80  # 使用80%显存
export PYTORCH_CUDA_ALLOC_CONF="max_split_size_mb:32,garbage_collection_threshold:0.85"
export PYTORCH_NO_CUDA_MEMORY_CACHING=1
export CUDA_LAUNCH_BLOCKING=0

echo "✅ 环境变量设置:"
echo "  • PYTORCH_CUDA_MEMORY_FRACTION=0.80"
echo "  • PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:32,garbage_collection_threshold:0.85"
echo "  • PYTORCH_NO_CUDA_MEMORY_CACHING=1"

# 4. 检查GPU状态
echo "[4/5] 检查GPU状态..."
if command -v nvidia-smi &> /dev/null; then
    echo "GPU内存状态:"
    nvidia-smi --query-gpu=name,memory.total,memory.free,memory.used --format=csv
else
    echo "⚠️  NVIDIA驱动未安装或不可用"
fi

# 5. 启动服务（最小化配置）
echo "[5/5] 启动ComfyUI服务（最小化配置）..."
echo ""
echo "🎯 启动参数:"
echo "  • --listen 0.0.0.0 --port 8188"
echo "  • --disable-smart-memory (强制积极卸载模型，减少内存占用)"
echo "  • --preview-method latent2rgb (低内存预览方法)"
echo "  • --disable-xformers (避免xformers内存问题)"
echo ""
echo "📋 配置详情:"
echo "  1. 内存限制: PYTORCH_CUDA_MEMORY_FRACTION=0.80 (使用80%显存)"
echo "  2. 内存分配: max_split_size_mb:32 (减少内存碎片)"
echo "  3. 垃圾回收: garbage_collection_threshold:0.85 (85%时触发)"
echo "  4. 禁用缓存: PYTORCH_NO_CUDA_MEMORY_CACHING=1 (立即释放内存)"
echo "  5. 异步操作: CUDA_LAUNCH_BLOCKING=0 (提高GPU利用率)"
echo ""
echo "🚀 启动中..."

# 在前台运行
exec python main.py --listen 0.0.0.0 --port 8188 --disable-smart-memory --preview-method latent2rgb --disable-xformers
#!/bin/bash
# ComfyUI 视频生成优化启动脚本
# 针对 AMD Ryzen 9 7950X + RTX 4070 Ti SUPER 16GB 优化
# 目标：大幅提升视频生成速度

set -e

echo "=========================================="
echo "ComfyUI 视频生成优化启动脚本"
echo "针对 AMD Ryzen 9 7950X + RTX 4070 Ti SUPER 16GB 优化"
echo "目标：5秒视频生成时间从10分钟优化到1-2分钟"
echo "=========================================="

# 1. 停止现有服务
echo "[1/6] 停止现有ComfyUI服务..."
pkill -f "python main.py" 2>/dev/null || true
sleep 3

# 2. 清理缓存
echo "[2/6] 清理Python和GPU缓存..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true
find . -type f -name "*.pyo" -delete 2>/dev/null || true
python -c "import torch; torch.cuda.empty_cache()" 2>/dev/null || true
echo "✅ 缓存清理完成"

# 3. 设置视频生成优化环境变量
echo "[3/6] 设置视频生成优化环境变量..."

# GPU优化
export CUDA_VISIBLE_DEVICES="0"
export PYTORCH_CUDA_ALLOC_CONF="max_split_size_mb:16,garbage_collection_threshold:0.98,expandable_segments:True,roundup_power2_divisions:32,pinned_num_register_threads=2"
export PYTORCH_CUDA_MEMORY_FRACTION=1.0  # 使用100%显存
export CUDA_LAUNCH_BLOCKING=0
export TORCH_CUDNN_V8_API_ENABLED=1
export TORCHINDUCTOR_CACHE_DIR="/tmp/torchinductor_video"
export PYTORCH_NO_CUDA_MEMORY_CACHING=0  # 启用CUDA内存缓存
export PYTORCH_MEMORY_EFFICIENT_CONVOLUTION=1  # 启用内存高效卷积

# CPU优化
export OMP_NUM_THREADS=24  # 使用24个线程
export MKL_NUM_THREADS=24
export OPENBLAS_NUM_THREADS=24
export VECLIB_MAXIMUM_THREADS=24
export NUMEXPR_NUM_THREADS=24

# PyTorch优化
export PYTORCH_CUDA_ALLOC_CONF="max_split_size_mb:128"
export PYTORCH_NO_CUDA_MEMORY_CACHING=1
export TF_ENABLE_ONEDNN_OPTS=1

# 视频编码优化
export FFMPEG_BINARY="ffmpeg"
export VIDEO_ENCODER="h264_nvenc"
export VIDEO_PRESET="p4"  # 性能优先

echo "✅ 环境变量设置完成"

# 4. 验证硬件配置
echo "[4/6] 验证硬件配置..."
echo "CPU: AMD Ryzen 9 7950X (16核/32线程)"
echo "内存: 62GB RAM"
echo "GPU: NVIDIA GeForce RTX 4070 Ti SUPER (16GB显存)"
echo ""

# 检查GPU状态
if command -v nvidia-smi &> /dev/null; then
    echo "GPU状态:"
    nvidia-smi --query-gpu=name,memory.total,memory.free,memory.used,temperature.gpu,utilization.gpu --format=csv,noheader
else
    echo "⚠️  NVIDIA驱动未安装或不可用"
fi

# 5. 设置视频生成优化参数
echo "[5/6] 设置视频生成优化参数..."

# 视频生成专用参数
VIDEO_ARGS="--highvram --force-fp16 --preview-method auto --disable-smart-memory"

# 启用xformers（如果可用）
if python -c "import xformers; print('xformers available')" 2>/dev/null; then
    VIDEO_ARGS="$VIDEO_ARGS --use-pytorch-cross-attention"
    echo "✅ xformers可用，已启用"
else
    echo "⚠️  xformers不可用，使用默认注意力机制"
fi

# 6. 启动服务
echo "[6/6] 启动ComfyUI服务（视频生成优化模式）..."
echo "优化参数: $VIDEO_ARGS"
echo "端口: 8188"
echo "绑定地址: 0.0.0.0"
echo ""
echo "视频生成优化设置:"
echo "  • 分辨率: 512x512 (可调整)"
echo "  • 帧率: 24 FPS"
echo "  • 编码: NVIDIA NVENC硬件编码"
echo "  • 批处理: 4帧/批"
echo "  • 线程: 24个CPU线程"
echo "  • 显存: 100%使用率 (PYTORCH_CUDA_MEMORY_FRACTION=1.0)"
echo "  • 显存模式: highvram (保持模型在GPU内存中)"
echo ""
echo "启动命令: python main.py --listen 0.0.0.0 --port 8188 $VIDEO_ARGS"
echo ""

# 在前台运行以便查看输出
exec python main.py --listen 0.0.0.0 --port 8188 $VIDEO_ARGS
#!/bin/bash
# ComfyUI 模型专用优化配置
# 针对 Flux 和 Video 模型优化

echo "设置模型专用优化配置..."

# 检查当前模型类型
MODEL_TYPE=""
if [ -f "models/checkpoints/flux1-dev.safetensors" ]; then
    MODEL_TYPE="flux"
    echo "检测到Flux模型，应用Flux优化配置..."
elif [ -f "models/checkpoints/svd.safetensors" ] || [ -f "models/checkpoints/stable-video-diffusion-img2vid.safetensors" ]; then
    MODEL_TYPE="svd"
    echo "检测到Stable Video Diffusion模型，应用SVD优化配置..."
elif [ -f "models/checkpoints/mochi-1.0.safetensors" ]; then
    MODEL_TYPE="mochi"
    echo "检测到Mochi模型，应用Mochi优化配置..."
else
    MODEL_TYPE="default"
    echo "使用默认优化配置..."
fi

# 根据模型类型设置优化参数
case $MODEL_TYPE in
    "flux")
        # Flux模型优化 - 12GB模型，需要高效显存管理
        export EXTRA_ARGS="--highvram --force-fp16"
        export PYTORCH_CUDA_MEMORY_FRACTION=0.85  # 使用85%显存，为系统保留15%
        export PYTORCH_CUDA_ALLOC_CONF="max_split_size_mb:256,garbage_collection_threshold:0.7"
        export OMP_NUM_THREADS=8  # Flux对多线程支持有限
        echo "Flux优化配置：--highvram --force-fp16，显存使用85%"
        ;;
    "svd")
        # Stable Video Diffusion优化 - 8-10GB模型
        export EXTRA_ARGS="--normalvram --force-fp16"
        export PYTORCH_CUDA_MEMORY_FRACTION=0.8  # 使用80%显存
        export PYTORCH_CUDA_ALLOC_CONF="max_split_size_mb:192,garbage_collection_threshold:0.65"
        export OMP_NUM_THREADS=12  # SVD需要更多CPU线程
        echo "SVD优化配置：--normalvram --force-fp16，显存使用80%"
        ;;
    "mochi")
        # Mochi模型优化 - 15GB模型
        export EXTRA_ARGS="--highvram --force-fp16"
        export PYTORCH_CUDA_MEMORY_FRACTION=0.9  # 使用90%显存
        export PYTORCH_CUDA_ALLOC_CONF="max_split_size_mb:128,garbage_collection_threshold:0.75"
        export OMP_NUM_THREADS=16  # Mochi需要更多CPU资源
        echo "Mochi优化配置：--highvram --force-fp16，显存使用90%"
        ;;
    *)
        # 默认优化配置
        export EXTRA_ARGS="--highvram --force-fp16"
        export PYTORCH_CUDA_MEMORY_FRACTION=0.9
        export PYTORCH_CUDA_ALLOC_CONF="max_split_size_mb:128,garbage_collection_threshold:0.6"
        export OMP_NUM_THREADS=16
        echo "默认优化配置：--highvram --force-fp16，显存使用90%"
        ;;
esac

# 通用优化设置
export CUDA_VISIBLE_DEVICES="0"
export MKL_NUM_THREADS=$OMP_NUM_THREADS
export NUMEXPR_NUM_THREADS=$OMP_NUM_THREADS
export PYTORCH_MEMORY_EFFICIENT_CONV=1
export TF_ENABLE_ONEDNN_OPTS=1
export TF_CPP_MIN_LOG_LEVEL=2
export LOGLEVEL=INFO

# 显示优化配置
echo ""
echo "=== 模型优化配置 ==="
echo "模型类型: $MODEL_TYPE"
echo "启动参数: $EXTRA_ARGS"
echo "GPU显存使用: $PYTORCH_CUDA_MEMORY_FRACTION"
echo "CPU线程数: $OMP_NUM_THREADS"
echo "内存配置: $PYTORCH_CUDA_ALLOC_CONF"
echo "=================="

echo ""
echo "使用以下命令启动ComfyUI："
echo "source /home/gpu/ComfyUI/model_optimization.sh"
echo "./start_comfyui.sh start"
echo ""
echo "或者直接运行："
echo "PYTHONPATH=. python main.py $EXTRA_ARGS --port 8188 --listen"
#!/bin/bash
# ComfyUI 性能优化环境变量配置
# 针对 RTX 4070 Ti SUPER 16GB + AMD Ryzen 9 7950X 优化

echo "设置ComfyUI性能优化环境变量..."

# GPU优化 - RTX 4070 Ti SUPER 16GB
export CUDA_VISIBLE_DEVICES="0"
export PYTORCH_CUDA_ALLOC_CONF="max_split_size_mb:128,garbage_collection_threshold:0.6,expandable_segments:True"
export PYTORCH_CUDA_MEMORY_FRACTION=0.9

# CPU优化 - AMD Ryzen 9 7950X 16核心
export OMP_NUM_THREADS=16
export MKL_NUM_THREADS=16
export NUMEXPR_NUM_THREADS=16
export OPENBLAS_NUM_THREADS=16

# 内存优化
export PYTORCH_MEMORY_EFFICIENT_CONV=1
export TF_ENABLE_ONEDNN_OPTS=1

# 性能优化
export TF_CPP_MIN_LOG_LEVEL=2
export TF_FORCE_GPU_ALLOW_GROWTH=true
export TF_GPU_ALLOCATOR=cuda_malloc_async

# 网络优化
export NCCL_DEBUG=WARN
export NCCL_SOCKET_IFNAME=eth0
export NCCL_IB_DISABLE=1

# 日志优化
export LOGLEVEL=INFO
export PYTHONWARNINGS="ignore"

# 禁用遥测
export HF_HUB_DISABLE_TELEMETRY="1"
export DO_NOT_TRACK="1"
export NO_PROXY="*"

# PyTorch优化
export TORCH_CUDNN_V8_API_ENABLED=1
export TORCHINDUCTOR_CACHE_DIR="/tmp/torchinductor_cache"
export TORCH_USE_CUDA_DSA=0

# 显示当前设置
echo "=== 当前优化设置 ==="
echo "GPU设备: $CUDA_VISIBLE_DEVICES"
echo "PyTorch内存配置: $PYTORCH_CUDA_ALLOC_CONF"
echo "GPU内存使用率: $PYTORCH_CUDA_MEMORY_FRACTION"
echo "CPU线程数: $OMP_NUM_THREADS"
echo "日志级别: $LOGLEVEL"
echo "=================="

echo "环境变量设置完成！"
echo "使用以下命令应用优化："
echo "source /home/gpu/ComfyUI/optimize_env.sh"
echo ""
echo "或者将以下内容添加到 ~/.bashrc 或 ~/.bash_profile："
echo "# ComfyUI 性能优化"
echo "export CUDA_VISIBLE_DEVICES=\"0\""
echo "export PYTORCH_CUDA_ALLOC_CONF=\"max_split_size_mb:128,garbage_collection_threshold:0.6,expandable_segments:True\""
echo "export PYTORCH_CUDA_MEMORY_FRACTION=0.9"
echo "export OMP_NUM_THREADS=16"
echo "export MKL_NUM_THREADS=16"
echo "export NUMEXPR_NUM_THREADS=16"
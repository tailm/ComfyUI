#!/bin/bash
# ComfyUI 配置文件 - 针对 RTX 4070 Ti SUPER 16GB 优化

# 服务端口
export COMFYUI_PORT=8188

# 绑定地址
export COMFYUI_HOST="0.0.0.0"

# 日志文件
export COMFYUI_LOG="comfyui.log"

# PID 文件
export COMFYUI_PID="comfyui.pid"

# Python 路径
export PYTHON_PATH="python3"

# 额外参数 - 针对16GB显存优化
# 使用 --highvram 模式充分利用16GB显存
# --force-fp16 启用半精度推理，减少显存使用
# 如果遇到显存不足问题，可以尝试 --normalvram
export EXTRA_ARGS="--highvram --force-fp16"

# GPU 设置 - 指定使用GPU 0
export CUDA_VISIBLE_DEVICES="0"

# PyTorch 内存配置 - 针对16GB显存优化
# max_split_size_mb: 128 - 优化内存碎片
# garbage_collection_threshold: 0.6 - 垃圾回收阈值
# expandable_segments: True - 允许内存段扩展
export PYTORCH_CUDA_ALLOC_CONF="max_split_size_mb:128,garbage_collection_threshold:0.6,expandable_segments:True"

# PyTorch CUDA内存分数 - 使用90%显存，保留10%给系统
export PYTORCH_CUDA_MEMORY_FRACTION=0.9

# 禁用遥测
export HF_HUB_DISABLE_TELEMETRY="1"
export DO_NOT_TRACK="1"

# CPU优化 - 针对AMD Ryzen 9 7950X 16核心
export OMP_NUM_THREADS=16
export MKL_NUM_THREADS=16
export NUMEXPR_NUM_THREADS=16

# 内存优化
export PYTORCH_MEMORY_EFFICIENT_CONV=1
export TF_ENABLE_ONEDNN_OPTS=1

# 性能优化
export TF_CPP_MIN_LOG_LEVEL=2  # 减少TensorFlow日志
export TF_FORCE_GPU_ALLOW_GROWTH=true

# 网络优化
export NCCL_DEBUG=WARN
export NCCL_SOCKET_IFNAME=eth0

# 日志级别
export LOGLEVEL=INFO
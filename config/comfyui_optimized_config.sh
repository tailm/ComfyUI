#!/bin/bash
# ComfyUI 优化配置文件 - 针对 AMD Ryzen 9 7950X + RTX 4070 Ti SUPER 16GB 优化
# 硬件配置:
# - CPU: AMD Ryzen 9 7950X 16-Core Processor (32线程)
# - 内存: 62GB RAM
# - GPU: NVIDIA GeForce RTX 4070 Ti SUPER (16GB显存)
# - 存储: 1.8TB SSD

# ============================================
# 基础配置
# ============================================

# 服务端口
export COMFYUI_PORT=8188

# 绑定地址
export COMFYUI_HOST="0.0.0.0"

# Python路径
export PYTHON_PATH="python3"

# ============================================
# GPU显存优化配置 (RTX 4070 Ti SUPER 16GB)
# ============================================

# 指定使用GPU 0
export CUDA_VISIBLE_DEVICES="0"

# PyTorch CUDA内存分配器配置
# max_split_size_mb: 128 - 优化内存碎片，适合16GB显存
# garbage_collection_threshold: 0.8 - 提高垃圾回收阈值，减少频繁回收
# expandable_segments: True - 允许内存段扩展
# roundup_power2_divisions: 4 - 减少内存碎片
export PYTORCH_CUDA_ALLOC_CONF="max_split_size_mb:128,garbage_collection_threshold:0.8,expandable_segments:True,roundup_power2_divisions:4"

# PyTorch CUDA内存分数 - 使用95%显存，保留5%给系统
export PYTORCH_CUDA_MEMORY_FRACTION=0.95

# 启用CUDA流
export CUDA_LAUNCH_BLOCKING=0

# 启用CUDA图优化
export TORCH_CUDNN_V8_API_ENABLED=1

# ============================================
# CPU优化配置 (AMD Ryzen 9 7950X 16核32线程)
# ============================================

# OpenMP线程数 - 使用物理核心数 (16核心)
export OMP_NUM_THREADS=16

# MKL线程数 - 使用物理核心数
export MKL_NUM_THREADS=16

# NumExpr线程数
export NUMEXPR_NUM_THREADS=16

# PyTorch CPU线程数
export TORCH_NUM_THREADS=16

# 启用CPU亲和性优化
export OMP_PROC_BIND=true
export OMP_PLACES=cores

# ============================================
# 内存优化配置 (62GB RAM)
# ============================================

# PyTorch内存高效卷积
export PYTORCH_MEMORY_EFFICIENT_CONV=1

# 启用OneDNN优化
export TF_ENABLE_ONEDNN_OPTS=1

# 设置大页面支持
export PYTORCH_CUDA_ALLOC_CONF+=",pinned_num_register_threads:4"

# 禁用内存碎片整理 (对于大内存系统)
export PYTORCH_NO_CUDA_MEMORY_CACHING=0

# ============================================
# ComfyUI启动参数优化
# ============================================

# 基础参数
BASE_ARGS="--listen 0.0.0.0 --port 8188"

# 显存模式选择 (根据GPU显存大小)
# --highvram: 高显存模式，适合16GB以上显存
# --normalvram: 正常显存模式
# --lowvram: 低显存模式
# --novram: 无显存模式 (纯CPU)
VRAM_MODE="--highvram"

# 精度设置
# --force-fp16: 强制使用FP16精度，减少显存使用，提高速度
# --force-fp32: 使用FP32精度，质量更好但更慢
# --bf16-unet: 使用BF16精度 (如果GPU支持)
PRECISION="--force-fp16"

# 性能优化参数
PERF_ARGS="--preview-method auto --disable-smart-memory --auto-clean-models --model-cleanup-threshold 0.8"

# 模型缓存优化
CACHE_ARGS=""

# 组合所有参数
export COMFYUI_ARGS="${BASE_ARGS} ${VRAM_MODE} ${PRECISION} ${PERF_ARGS} ${CACHE_ARGS}"

# ============================================
# 系统级优化
# ============================================

# 禁用遥测
export HF_HUB_DISABLE_TELEMETRY="1"
export DO_NOT_TRACK="1"
export DISABLE_TELEMETRY="1"

# 国内镜像源配置
export HF_ENDPOINT="https://hf-mirror.com"  # HuggingFace国内镜像
export HF_HUB_ENABLE_HF_TRANSFER="1"        # 启用快速传输
export HF_HUB_OFFLINE="0"                   # 在线模式
export HF_HUB_DISABLE_PROGRESS_BARS="0"     # 显示进度条
export HF_HUB_DISABLE_TELEMETRY="1"         # 禁用遥测（已设置，重复确保）
export HF_HUB_VERBOSITY="warning"           # 日志级别

# 减少TensorFlow日志
export TF_CPP_MIN_LOG_LEVEL=2

# 允许GPU内存增长
export TF_FORCE_GPU_ALLOW_GROWTH=true

# NCCL网络优化
export NCCL_DEBUG=WARN
export NCCL_SOCKET_IFNAME=eth0
export NCCL_NSOCKS_PERTHREAD=4
export NCCL_SOCKET_NTHREADS=2

# 日志级别
export LOGLEVEL=INFO

# ============================================
# Python优化
# ============================================

# Python垃圾回收优化
export PYTHONGCENABLE=1
export PYTHONGCTHRESHOLD=70000

# Python内存分配器优化
export PYTHONMALLOC=malloc

# ============================================
# 模型加载优化
# ============================================

# 模型预加载设置
export COMFYUI_PRELOAD_MODELS="true"

# 模型缓存大小 (MB)
export COMFYUI_MODEL_CACHE_SIZE=4096

# 启用模型分片加载
export COMFYUI_ENABLE_MODEL_SHARDING="true"

# ============================================
# 启动命令生成
# ============================================

# 完整的启动命令
get_start_command() {
    echo "\${PYTHON_PATH} main.py \${COMFYUI_ARGS}"
}

# 显示配置信息
show_config() {
    echo "=========================================="
    echo "ComfyUI 优化配置 - AMD Ryzen 9 7950X + RTX 4070 Ti SUPER"
    echo "=========================================="
    echo ""
    echo "硬件配置:"
    echo "  CPU: AMD Ryzen 9 7950X (16核/32线程)"
    echo "  内存: 62GB RAM"
    echo "  GPU: NVIDIA GeForce RTX 4070 Ti SUPER (16GB)"
    echo "  存储: 1.8TB SSD"
    echo ""
    echo "优化配置:"
    echo "  GPU显存: 使用95% (15.2GB)"
    echo "  CPU线程: 16核心 (物理核心数)"
    echo "  精度: FP16 (平衡速度和质量)"
    echo "  显存模式: 高显存模式 (--highvram)"
    echo ""
    echo "环境变量:"
    echo "  CUDA_VISIBLE_DEVICES: \${CUDA_VISIBLE_DEVICES}"
    echo "  PYTORCH_CUDA_ALLOC_CONF: \${PYTORCH_CUDA_ALLOC_CONF}"
    echo "  PYTORCH_CUDA_MEMORY_FRACTION: \${PYTORCH_CUDA_MEMORY_FRACTION}"
    echo "  OMP_NUM_THREADS: \${OMP_NUM_THREADS}"
    echo "  MKL_NUM_THREADS: \${MKL_NUM_THREADS}"
    echo "  HF_ENDPOINT: \${HF_ENDPOINT} (国内镜像源)"
    echo ""
    echo "启动命令:"
    echo "  \$(get_start_command)"
    echo ""
    echo "=========================================="
}

# 验证配置
validate_config() {
    echo "验证配置..."
    
    # 检查GPU
    if command -v nvidia-smi > /dev/null 2>&1; then
        GPU_INFO=$(nvidia-smi --query-gpu=name,memory.total --format=csv,noheader 2>/dev/null || echo "无法获取GPU信息")
        echo "  GPU: $GPU_INFO"
    else
        echo "  ⚠️  NVIDIA驱动未安装或nvidia-smi不可用"
    fi
    
    # 检查CPU
    CPU_CORES=$(nproc 2>/dev/null || echo "未知")
    echo "  CPU核心数: $CPU_CORES"
    
    # 检查内存
    MEM_TOTAL=$(free -h 2>/dev/null | awk '/^Mem:/ {print $2}' || echo "未知")
    echo "  内存总量: $MEM_TOTAL"
    
    # 检查Python
    if command -v python3 > /dev/null 2>&1; then
        PYTHON_VERSION=$(python3 --version 2>/dev/null || echo "未知版本")
        echo "  Python版本: $PYTHON_VERSION"
    else
        echo "  ❌ Python3未安装"
        return 1
    fi
    
    # 检查PyTorch
    if python3 -c "import torch; print('PyTorch版本:', torch.__version__, 'CUDA可用:', torch.cuda.is_available())" 2>/dev/null; then
        echo "  PyTorch: 已安装"
    else
        echo "  ⚠️  PyTorch未安装或不可用"
    fi
    
    echo "配置验证完成"
    return 0
}

# 主函数
main() {
    case "\${1:-}" in
        "show")
            show_config
            ;;
        "validate")
            validate_config
            ;;
        "command")
            get_start_command
            ;;
        *)
            echo "用法: source comfyui_optimized_config.sh [show|validate|command]"
            echo ""
            echo "命令:"
            echo "  show     显示配置信息"
            echo "  validate 验证配置"
            echo "  command  获取启动命令"
            echo ""
            echo "示例:"
            echo "  source comfyui_optimized_config.sh show"
            echo "  source comfyui_optimized_config.sh validate"
            echo "  python main.py \$(source comfyui_optimized_config.sh command)"
            ;;
    esac
}

# 如果直接执行，显示帮助
if [ "\${BASH_SOURCE[0]}" = "\$0" ]; then
    main "\$@"
fi
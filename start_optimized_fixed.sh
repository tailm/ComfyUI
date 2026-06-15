#!/bin/bash
# ComfyUI 优化启动脚本（修复版）
# 针对 AMD Ryzen 9 7950X + RTX 4070 Ti SUPER 16GB 优化

set -e

echo "=========================================="
echo "ComfyUI 优化启动脚本（修复版）"
echo "针对 AMD Ryzen 9 7950X + RTX 4070 Ti SUPER 16GB 优化"
echo "=========================================="

# 加载优化配置
if [ -f "config/comfyui_optimized_config.sh" ]; then
    source config/comfyui_optimized_config.sh
    echo "✅ 加载优化配置"
else
    echo "❌ 优化配置文件不存在: config/comfyui_optimized_config.sh"
    echo "使用默认配置启动..."
    export COMFYUI_PORT=8188
    export COMFYUI_HOST="0.0.0.0"
    export COMFYUI_ARGS="--listen 0.0.0.0 --port 8188 --highvram --force-fp16"
fi

# 显示配置信息
echo ""
echo "硬件配置:"
echo "  CPU: AMD Ryzen 9 7950X (16核/32线程)"
echo "  内存: 62GB RAM"
echo "  GPU: NVIDIA GeForce RTX 4070 Ti SUPER (16GB)"
echo ""
echo "优化设置:"
echo "  GPU显存: 使用95% (15.2GB)"
echo "  CPU线程: 16核心"
echo "  精度: FP16"
echo "  显存模式: 高显存模式"
echo ""

# 1. 停止现有服务
echo "[1/5] 停止现有ComfyUI服务..."
pkill -f "python main.py" 2>/dev/null || true
sleep 3

# 2. 清理缓存
echo "[2/5] 清理Python缓存..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true
find . -type f -name "*.pyo" -delete 2>/dev/null || true
find . -type f -name "*.pyd" -delete 2>/dev/null || true

# 3. 清理GPU缓存
echo "[3/5] 清理GPU缓存..."
echo "  当前GPU使用情况:"
nvidia-smi --query-gpu=name,memory.total,memory.used,memory.free --format=csv,noheader,nounits 2>/dev/null || echo "  NVIDIA驱动未安装或不可用"
echo "  清理GPU缓存..."
python -c "import torch; torch.cuda.empty_cache()" 2>/dev/null || true
echo "  GPU缓存已清理"

# 4. 验证系统配置
echo "[4/5] 验证系统配置..."
echo "检查关键依赖..."
python -c "import torch; print(f'PyTorch版本: {torch.__version__}')" 2>/dev/null || echo "  PyTorch未安装"
python -c "import torch; print(f'CUDA可用: {torch.cuda.is_available()}')" 2>/dev/null || echo "  CUDA不可用"
python -c "import torch; print(f'GPU数量: {torch.cuda.device_count()}')" 2>/dev/null || echo "  无GPU设备"

# 5. 启动服务
echo "[5/5] 启动ComfyUI服务（使用优化配置）..."
echo "  启动命令: python main.py ${COMFYUI_ARGS}"
echo ""

# 在前台运行以便查看输出
exec python main.py ${COMFYUI_ARGS}
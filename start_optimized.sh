#!/bin/bash
# ComfyUI 优化启动脚本
# 针对 AMD Ryzen 9 7950X + RTX 4070 Ti SUPER 16GB 优化

set -e

echo "=========================================="
echo "ComfyUI 优化启动脚本"
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
echo "[1/7] 停止现有ComfyUI服务..."
pkill -f "python main.py" 2>/dev/null || true
sleep 3

# 2. 清理缓存
echo "[2/7] 清理Python缓存..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true
find . -type f -name "*.pyo" -delete 2>/dev/null || true
find . -type f -name "*.pyd" -delete 2>/dev/null || true
python -c "import sys; sys.path_importer_cache.clear(); import importlib; importlib.invalidate_caches()" 2>/dev/null || true

# 3. 清理GPU缓存
echo "[3/7] 清理GPU缓存..."
if command -v nvidia-smi &> /dev/null; then
    echo "  当前GPU使用情况:"
    nvidia-smi --query-gpu=name,memory.total,memory.used,memory.free,utilization.gpu --format=csv,noheader
    echo "  清理GPU缓存..."
    python3 -c "
import torch
if torch.cuda.is_available():
    torch.cuda.empty_cache()
    print('GPU缓存已清理')
else:
    print('CUDA不可用')
" 2>/dev/null || echo "GPU缓存清理失败"
else
    echo "  NVIDIA驱动未安装，跳过GPU缓存清理"
fi

# 4. 验证配置
echo "[4/7] 验证系统配置..."
if [ -f "comfyui_optimized_config.sh" ]; then
    source comfyui_optimized_config.sh validate
fi

# 检查关键依赖
echo "检查关键依赖..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3未安装"
    exit 1
fi

if ! python3 -c "import torch" &> /dev/null; then
    echo "❌ PyTorch未安装"
    exit 1
fi

if ! python3 -c "import torch; print('CUDA可用:', torch.cuda.is_available())" 2>/dev/null | grep -q "True"; then
    echo "⚠️  CUDA不可用，将使用CPU模式"
fi

# 5. 设置环境变量
echo "[5/7] 设置优化环境变量..."
export LOG_FILE="comfyui_optimized_$(date +%Y%m%d_%H%M%S).log"
echo "  日志文件: \$LOG_FILE"

# 显示环境变量
echo "  关键环境变量:"
echo "    CUDA_VISIBLE_DEVICES: \$CUDA_VISIBLE_DEVICES"
echo "    PYTORCH_CUDA_ALLOC_CONF: \$PYTORCH_CUDA_ALLOC_CONF"
echo "    PYTORCH_CUDA_MEMORY_FRACTION: \$PYTORCH_CUDA_MEMORY_FRACTION"
echo "    OMP_NUM_THREADS: \$OMP_NUM_THREADS"
echo "    MKL_NUM_THREADS: \$MKL_NUM_THREADS"

# 6. 启动服务
echo "[6/7] 启动ComfyUI服务（使用优化配置）..."
echo "  启动命令: python main.py \$COMFYUI_ARGS"

# 获取启动命令
START_CMD="python main.py \$COMFYUI_ARGS"
echo "  完整命令: \$START_CMD"

# 启动服务
nohup bash -c "
echo '=== ComfyUI 优化启动日志 ===' > \$LOG_FILE
echo '启动时间: \$(date)' >> \$LOG_FILE
echo '启动命令: \$START_CMD' >> \$LOG_FILE
echo '环境变量:' >> \$LOG_FILE
env | grep -E '(CUDA|PYTORCH|OMP|MKL|NUMEXPR|TORCH)' >> \$LOG_FILE
echo '' >> \$LOG_FILE
echo '系统信息:' >> \$LOG_FILE
nproc >> \$LOG_FILE 2>/dev/null || echo 'CPU核心数: 未知' >> \$LOG_FILE
free -h >> \$LOG_FILE 2>/dev/null || echo '内存信息: 未知' >> \$LOG_FILE
if command -v nvidia-smi &> /dev/null; then
    nvidia-smi --query-gpu=name,memory.total,memory.free,memory.used,utilization.gpu,temperature.gpu --format=csv >> \$LOG_FILE
fi
echo '' >> \$LOG_FILE
echo '=== 服务输出 ===' >> \$LOG_FILE
exec \$START_CMD
" >> "\$LOG_FILE" 2>&1 &

START_PID=\$!
echo "服务启动PID: \$START_PID"

# 7. 等待服务启动
echo "[7/7] 等待服务启动（最多90秒）..."
START_TIME=\$(date +%s)
TIMEOUT=90
SUCCESS=0

for i in \$(seq 1 \$TIMEOUT); do
    if ps -p \$START_PID > /dev/null 2>&1; then
        # 检查端口是否监听
        if (ss -tlnp 2>/dev/null | grep -q ":\${COMFYUI_PORT} ") || (netstat -tlnp 2>/dev/null | grep -q ":\${COMFYUI_PORT} "); then
            # 检查服务是否可访问
            HTTP_CODE=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:\${COMFYUI_PORT} 2>/dev/null || echo "000")
            if [[ "\$HTTP_CODE" =~ ^(200|302|301)$ ]]; then
                CURRENT_TIME=\$(date +%s)
                ELAPSED=\$((CURRENT_TIME - START_TIME))
                echo "✅ 服务启动成功！耗时: \${ELAPSED}秒"
                echo "   PID: \$START_PID"
                echo "   端口: \${COMFYUI_PORT}"
                echo "   访问地址: http://localhost:\${COMFYUI_PORT}"
                echo "   网络地址: http://192.168.50.228:\${COMFYUI_PORT}"
                echo "   日志文件: \$LOG_FILE"
                SUCCESS=1
                break
            fi
        fi
    else
        echo "❌ 服务进程已退出"
        echo "查看日志: tail -100 \$LOG_FILE"
        tail -100 "\$LOG_FILE"
        exit 1
    fi
    
    # 显示进度
    if [ \$((i % 10)) -eq 0 ]; then
        echo "  已等待 \${i}秒..."
    fi
    
    sleep 1
done

if [ \$SUCCESS -eq 0 ]; then
    echo "⚠️  服务启动超时（\$TIMEOUT秒）"
    echo "服务可能仍在启动中，请检查日志: tail -f \$LOG_FILE"
    echo "PID: \$START_PID"
fi

# 显示最终状态
echo ""
echo "=========================================="
echo "启动完成！"
echo "=========================================="
echo ""
echo "重要信息:"
echo "1. 服务PID: \$START_PID"
echo "2. 访问地址: http://localhost:\${COMFYUI_PORT}"
echo "3. 查看日志: tail -f \$LOG_FILE"
echo "4. 停止服务: kill \$START_PID"
echo "5. 重启服务: ./start_optimized.sh"
echo ""
echo "优化配置摘要:"
echo "  GPU显存: 使用95% (15.2GB/16GB)"
echo "  CPU线程: 16核心 (物理核心数)"
echo "  内存分配: 优化内存碎片管理"
echo "  精度模式: FP16 (加速推理)"
echo "  显存模式: 高显存模式"
echo ""
echo "性能监控:"
echo "  GPU使用: nvidia-smi"
echo "  内存使用: free -h"
echo "  进程监控: top -p \$START_PID"
echo ""
echo "故障排除:"
echo "1. 如果服务无法启动，检查日志: tail -100 \$LOG_FILE"
echo "2. 如果显存不足，修改 comfyui_optimized_config.sh 中的 PYTORCH_CUDA_MEMORY_FRACTION"
echo "3. 如果CPU使用过高，减少 OMP_NUM_THREADS 和 MKL_NUM_THREADS"
echo "4. 如果遇到内存问题，调整 PYTORCH_CUDA_ALLOC_CONF"
echo ""
echo "配置文件: comfyui_optimized_config.sh"
echo "可以编辑此文件调整优化参数"

# 保存PID到文件
echo \$START_PID > /tmp/comfyui_optimized_pid.txt
echo "PID已保存到: /tmp/comfyui_optimized_pid.txt"

exit 0
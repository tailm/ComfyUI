#!/bin/bash

# ComfyUI简单启动脚本
# 使用GPU模式，在前台运行以便查看输出

set -e

echo "=========================================="
echo "ComfyUI简单启动脚本 (GPU模式)"
echo "=========================================="

# 停止现有服务
echo "[1/3] 停止现有ComfyUI服务..."
pkill -f "python main.py" 2>/dev/null || true
sleep 2

# 清理缓存
echo "[2/3] 清理缓存..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true
find . -type f -name "*.pyo" -delete 2>/dev/null || true

# 启动服务
echo "[3/3] 启动ComfyUI服务 (GPU模式)..."
echo "启动命令: python main.py --listen 0.0.0.0 --port 8188"
echo ""
echo "按 Ctrl+C 停止服务"
echo "服务启动后，可通过以下地址访问："
echo "  本地: http://localhost:8188"
echo "  网络: http://192.168.50.228:8188"
echo ""
echo "正在启动..."

# 在前台运行，以便查看输出
exec python main.py --listen 0.0.0.0 --port 8188
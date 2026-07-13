#!/bin/bash

# ComfyUI启动脚本（启用资产管理系统）
# 使用GPU模式并启用资产管理系统功能

set -e

echo "=========================================="
echo "ComfyUI启动脚本（启用资产管理系统）"
echo "=========================================="

# 停止现有服务
echo "[1/4] 停止现有ComfyUI服务..."
pkill -f "python main.py" 2>/dev/null || true
sleep 2

# 清理缓存
echo "[2/4] 清理缓存..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true
find . -type f -name "*.pyo" -delete 2>/dev/null || true

# 检查数据库依赖
echo "[3/4] 检查数据库依赖..."
if ! python -c "import sqlalchemy" 2>/dev/null; then
    echo "❌ 缺少SQLAlchemy依赖，正在安装..."
    pip install sqlalchemy alembic
fi

if ! python -c "import alembic" 2>/dev/null; then
    echo "❌ 缺少Alembic依赖，正在安装..."
    pip install alembic
fi

# 启动服务（启用资产管理系统）
echo "[4/4] 启动ComfyUI服务（启用资产管理系统）..."
echo "启动命令: python main.py --listen 0.0.0.0 --port 8188 --enable-assets"
echo ""
echo "📁 资产管理系统功能已启用："
echo "  • 数据库: SQLite (user/comfyui.db)"
echo "  • 自动扫描: models, input, output 目录"
echo "  • API路由: /assets/*"
echo "  • 功能: 文件去重、元数据管理、标签系统"
echo ""
echo "按 Ctrl+C 停止服务"
echo "服务启动后，可通过以下地址访问："
echo "  本地: http://localhost:8188"
echo "  网络: http://192.168.50.228:8188"
echo ""
echo "资产API端点："
echo "  • GET /assets/ - 列出资产"
echo "  • POST /assets/upload - 上传资产"
echo "  • GET /assets/{id} - 获取资产详情"
echo "  • PUT /assets/{id} - 更新资产"
echo "  • DELETE /assets/{id} - 删除资产"
echo "  • GET /assets/tags - 获取标签"
echo ""
echo "正在启动..."

# 在前台运行，以便查看输出
exec python main.py --listen 0.0.0.0 --port 8188 --enable-assets
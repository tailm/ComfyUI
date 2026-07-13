#!/bin/bash

# 清理Python缓存脚本
# 在重启ComfyUI服务前运行此脚本清理Python缓存

echo "开始清理Python缓存..."

# 1. 清理__pycache__目录
echo "清理 __pycache__ 目录..."
find /home/gpu/ComfyUI -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null

# 2. 清理.pyc文件
echo "清理 .pyc 文件..."
find /home/gpu/ComfyUI -name "*.pyc" -delete 2>/dev/null

# 3. 清理.pyo文件
echo "清理 .pyo 文件..."
find /home/gpu/ComfyUI -name "*.pyo" -delete 2>/dev/null

# 4. 清理Python字节码缓存目录
echo "清理 Python 字节码缓存..."
find /home/gpu/ComfyUI -type d -name "__pycache__" -prune -o -type f -name "*.py[co]" -delete 2>/dev/null

# 5. 清理dist-packages缓存（如果存在）
if [ -d "/usr/local/lib/python3.13/dist-packages/__pycache__" ]; then
    echo "清理 dist-packages 缓存..."
    sudo rm -rf /usr/local/lib/python3.13/dist-packages/__pycache__ 2>/dev/null || true
fi

# 6. 清理site-packages缓存（如果存在）
if [ -d "/home/gpu/.local/lib/python3.13/site-packages/__pycache__" ]; then
    echo "清理 site-packages 缓存..."
    rm -rf /home/gpu/.local/lib/python3.13/site-packages/__pycache__ 2>/dev/null || true
fi

# 7. 清理pip缓存
echo "清理 pip 缓存..."
python3 -m pip cache purge 2>/dev/null || true

# 8. 清理ComfyUI自定义节点缓存
echo "清理 ComfyUI 自定义节点缓存..."
if [ -d "/home/gpu/ComfyUI/custom_nodes" ]; then
    find /home/gpu/ComfyUI/custom_nodes -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
    find /home/gpu/ComfyUI/custom_nodes -name "*.pyc" -delete 2>/dev/null
    find /home/gpu/ComfyUI/custom_nodes -name "*.pyo" -delete 2>/dev/null
fi

# 9. 清理ComfyUI自身缓存
echo "清理 ComfyUI 自身缓存..."
if [ -d "/home/gpu/ComfyUI/__pycache__" ]; then
    rm -rf /home/gpu/ComfyUI/__pycache__ 2>/dev/null
fi

# 10. 清理Python编译缓存
echo "清理 Python 编译缓存..."
python3 -c "import sys; import shutil; import os; cache_dir = os.path.join(os.path.expanduser('~'), '.cache', 'python'); [shutil.rmtree(os.path.join(cache_dir, d), ignore_errors=True) for d in os.listdir(cache_dir) if os.path.isdir(os.path.join(cache_dir, d))] if os.path.exists(cache_dir) else None" 2>/dev/null || true

echo "Python缓存清理完成！"

# 显示清理结果
echo -e "\n清理结果："
echo "1. __pycache__ 目录: 已清理"
echo "2. .pyc 文件: 已清理"
echo "3. .pyo 文件: 已清理"
echo "4. 字节码缓存: 已清理"
echo "5. pip 缓存: 已清理"
echo "6. 自定义节点缓存: 已清理"
echo "7. ComfyUI 缓存: 已清理"
echo "8. Python 编译缓存: 已清理"

# 检查是否还有缓存文件
echo -e "\n检查剩余缓存文件："
remaining_cache=$(find /home/gpu/ComfyUI -type d -name "__pycache__" -o -name "*.pyc" -o -name "*.pyo" 2>/dev/null | wc -l)
if [ "$remaining_cache" -eq 0 ]; then
    echo "✅ 所有Python缓存已清理干净！"
else
    echo "⚠️  还有 $remaining_cache 个缓存文件/目录，可能需要手动清理"
    find /home/gpu/ComfyUI -type d -name "__pycache__" -o -name "*.pyc" -o -name "*.pyo" 2>/dev/null | head -10
fi
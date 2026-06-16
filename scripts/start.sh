#!/bin/bash
# ComfyUI 默认启动脚本
# 使用视频生成优化配置作为默认启动方式

set -e

echo "=========================================="
echo "ComfyUI 默认启动脚本"
echo "使用视频生成优化配置 (start_video_optimized.sh)"
echo "=========================================="

# 检查视频优化脚本是否存在
if [ -f "start_video_optimized.sh" ]; then
    echo "✅ 找到视频优化启动脚本"
    echo "正在启动视频优化模式..."
    echo ""
    
    # 执行视频优化启动脚本
    exec ./start_video_optimized.sh
else
    echo "❌ 视频优化启动脚本不存在: start_video_optimized.sh"
    echo "正在查找其他启动脚本..."
    
    # 检查其他启动脚本
    if [ -f "start_optimized.sh" ]; then
        echo "✅ 找到优化启动脚本"
        echo "正在启动优化模式..."
        exec ./start_optimized.sh
    elif [ -f "start_comfyui_simple.sh" ]; then
        echo "✅ 找到简单启动脚本"
        echo "正在启动简单模式..."
        exec ./start_comfyui_simple.sh
    else
        echo "❌ 未找到任何启动脚本"
        echo "使用默认参数启动..."
        echo ""
        echo "启动命令: python main.py --listen 0.0.0.0 --port 8188"
        echo ""
        exec python main.py --listen 0.0.0.0 --port 8188
    fi
fi
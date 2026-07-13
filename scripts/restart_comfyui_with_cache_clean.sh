#!/bin/bash

# ComfyUI重启脚本（包含缓存清理）
# 在重启服务前自动清理Python缓存

echo "=========================================="
echo "ComfyUI 服务重启脚本（带缓存清理）"
echo "=========================================="

# 1. 停止当前运行的ComfyUI服务
echo -e "\n[1/4] 停止当前ComfyUI服务..."
pids=$(ps aux | grep "python main.py" | grep -v grep | awk '{print $2}')
if [ -n "$pids" ]; then
    echo "找到ComfyUI进程: $pids"
    kill -9 $pids 2>/dev/null
    sleep 2
    echo "✅ ComfyUI服务已停止"
else
    echo "⚠️  未找到运行的ComfyUI进程"
fi

# 2. 清理Python缓存
echo -e "\n[2/4] 清理Python缓存..."
if [ -f "/home/gpu/ComfyUI/scripts/clean_python_cache.sh" ]; then
    /home/gpu/ComfyUI/scripts/clean_python_cache.sh
else
    echo "❌ 清理脚本不存在，使用基本清理..."
    # 基本清理
    find /home/gpu/ComfyUI -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
    find /home/gpu/ComfyUI -name "*.pyc" -delete 2>/dev/null
    find /home/gpu/ComfyUI -name "*.pyo" -delete 2>/dev/null
    echo "✅ 基本缓存清理完成"
fi

# 3. 等待缓存清理完成
echo -e "\n[3/4] 等待缓存清理完成..."
sleep 1

# 4. 启动ComfyUI服务
echo -e "\n[4/4] 启动ComfyUI服务..."
cd /home/gpu/ComfyUI

python_exec="python"
if [ -x "./.venv/bin/python" ]; then
    python_exec="./.venv/bin/python"
fi

mkdir -p /home/gpu/ComfyUI/logs
log_file="/home/gpu/ComfyUI/logs/comfyui.log"

# 检查端口是否被占用
port=8188
if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 $port 已被占用，尝试释放..."
    fuser -k $port/tcp 2>/dev/null
    sleep 1
fi

# 启动服务
echo "启动命令: $python_exec main.py --listen 0.0.0.0 --port $port --enable-manager"
echo "日志文件: $log_file"
nohup $python_exec main.py --listen 0.0.0.0 --port $port --enable-manager > "$log_file" 2>&1 &

# 等待服务启动
echo -e "\n等待服务启动..."
sleep 3

# 检查服务是否启动成功
if ps aux | grep "python main.py" | grep -v grep > /dev/null; then
    pid=$(ps aux | grep "python main.py" | grep -v grep | awk '{print $2}')
    echo "✅ ComfyUI服务已启动 (PID: $pid)"
    
    # 检查服务状态
    echo -e "\n检查服务状态..."
    sleep 2
    
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$port > /dev/null; then
        echo "✅ 服务运行正常，可通过以下地址访问："
        echo "  本地: http://localhost:$port"
        echo "  网络: http://$(hostname -I | awk '{print $1}'):$port"
    else
        echo "⚠️  服务已启动但可能还在初始化中..."
        echo "查看日志: tail -f $log_file"
    fi
    
    # 显示日志文件位置
    echo -e "\n日志文件: $log_file"
    echo "查看日志: tail -f $log_file"
    
else
    echo "❌ ComfyUI服务启动失败"
    echo "查看错误日志:"
    tail -20 "$log_file"
fi

echo -e "\n=========================================="
echo "重启完成！"
echo "=========================================="

# 显示快速命令
echo -e "\n快速命令："
echo "查看服务状态: ps aux | grep 'python main.py' | grep -v grep"
echo "停止服务: pkill -f 'python main.py'"
echo "查看日志: tail -f $log_file"
echo "清理缓存: /home/gpu/ComfyUI/clean_python_cache.sh"
echo "重启服务: /home/gpu/ComfyUI/restart_comfyui_with_cache_clean.sh"
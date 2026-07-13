#!/bin/bash

# ComfyUI服务状态检查脚本

SERVICE_NAME="ComfyUI"
PORT=8188
LOG_FILE="/home/gpu/ComfyUI/comfyui.log"
PID_FILE="/home/gpu/ComfyUI/data/comfyui.pid"

echo "=== $SERVICE_NAME 服务状态检查 ==="
echo "检查时间: $(date)"
echo ""

# 检查进程
echo "1. 检查进程状态:"
if pgrep -f "main.py --listen 0.0.0.0 --port $PORT" > /dev/null; then
    PID=$(pgrep -f "main.py --listen 0.0.0.0 --port $PORT")
    echo "   ✅ 服务正在运行 (PID: $PID)"
    
    # 获取进程详细信息
    echo "   进程信息:"
    ps -p $PID -o pid,ppid,user,%cpu,%mem,cmd --no-headers | awk '{print "     PID:", $1, "PPID:", $2, "用户:", $3, "CPU:", $4, "内存:", $5, "命令:", $6}'
else
    echo "   ❌ 服务未运行"
fi

echo ""

# 检查端口监听
echo "2. 检查端口监听状态:"
if netstat -tlnp 2>/dev/null | grep ":$PORT" > /dev/null; then
    echo "   ✅ 端口 $PORT 正在监听"
    netstat -tlnp 2>/dev/null | grep ":$PORT"
else
    echo "   ❌ 端口 $PORT 未监听"
fi

echo ""

# 检查HTTP服务
echo "3. 检查HTTP服务响应:"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/ 2>/dev/null || echo "无法连接")
if [ "$HTTP_STATUS" = "200" ]; then
    echo "   ✅ HTTP服务正常 (状态码: $HTTP_STATUS)"
elif [ "$HTTP_STATUS" = "无法连接" ]; then
    echo "   ❌ 无法连接到HTTP服务"
else
    echo "   ⚠️  HTTP服务异常 (状态码: $HTTP_STATUS)"
fi

echo ""

# 检查日志文件
echo "4. 检查日志文件:"
if [ -f "$LOG_FILE" ]; then
    LOG_SIZE=$(du -h "$LOG_FILE" | cut -f1)
    LOG_LINES=$(wc -l < "$LOG_FILE")
    echo "   ✅ 日志文件存在 ($LOG_SIZE, $LOG_LINES 行)"
    
    # 显示最后5行日志
    echo "   最近日志:"
    tail -5 "$LOG_FILE" | sed 's/^/     /'
else
    echo "   ⚠️  日志文件不存在: $LOG_FILE"
fi

echo ""

# 检查服务启动时间
echo "5. 检查服务运行时间:"
if pgrep -f "main.py --listen 0.0.0.0 --port $PORT" > /dev/null; then
    PID=$(pgrep -f "main.py --listen 0.0.0.0 --port $PORT")
    START_TIME=$(ps -p $PID -o lstart=)
    ELAPSED=$(ps -p $PID -o etime=)
    echo "   ✅ 服务启动时间: $START_TIME"
    echo "   ✅ 已运行时间: $ELAPSED"
else
    echo "   ❌ 服务未运行"
fi

echo ""
echo "=== 检查完成 ==="
echo "访问地址: http://localhost:$PORT"
echo "管理界面: http://localhost:$PORT/manager"
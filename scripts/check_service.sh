#!/bin/bash

# ComfyUI 服务状态检查脚本

SERVICE_NAME="ComfyUI"
PORT=8188
LOG_FILE="/home/gpu/ComfyUI/comfyui.log"
WEB_DIR="/home/gpu/ComfyUI/web"

echo "=== $SERVICE_NAME 服务状态检查 ==="
echo "检查时间: $(date)"
echo ""

# 检查进程
echo "1. 检查进程状态:"
if pgrep -f "main.py.*--port $PORT" > /dev/null; then
    PID=$(pgrep -f "main.py.*--port $PORT")
    echo "   [OK] 服务正在运行 (PID: $PID)"
    echo "   运行时间: $(ps -p $PID -o etime=)"
    echo "   内存使用: $(ps -p $PID -o rss= | awk '{printf "%.1f MB", $1/1024}')"
else
    echo "   [FAIL] 服务未运行"
fi

echo ""

# 检查端口监听
echo "2. 检查端口监听状态:"
if ss -tln 2>/dev/null | grep ":$PORT" > /dev/null; then
    echo "   [OK] 端口 $PORT 正在监听"
else
    echo "   [FAIL] 端口 $PORT 未监听"
fi

echo ""

# 检查HTTP服务
echo "3. 检查HTTP服务响应:"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/ 2>/dev/null || echo "无法连接")
if [ "$HTTP_STATUS" = "200" ]; then
    echo "   [OK] HTTP服务正常 (状态码: $HTTP_STATUS)"
else
    echo "   [FAIL] HTTP服务异常 (状态码: $HTTP_STATUS)"
fi

echo ""

# 检查前端文件
echo "4. 检查前端文件:"
if [ -f "$WEB_DIR/index.html" ]; then
    echo "   [OK] 前端文件存在: $WEB_DIR/index.html"
else
    echo "   [FAIL] 前端文件缺失，请执行: ./scripts/service_manager.sh rebuild"
fi

echo ""

# 检查日志
echo "5. 检查日志:"
if [ -f "$LOG_FILE" ]; then
    LOG_SIZE=$(du -h "$LOG_FILE" | cut -f1)
    echo "   [OK] 日志文件存在 ($LOG_SIZE)"
    echo "   最近日志:"
    tail -3 "$LOG_FILE" | sed 's/^/     /'
else
    echo "   [INFO] 日志文件不存在"
fi

echo ""
echo "=== 检查完成 ==="
echo "访问地址: http://localhost:$PORT"

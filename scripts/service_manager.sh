#!/bin/bash

# ComfyUI 服务管理脚本
# 适配本地前端 + 多用户模式

SERVICE_NAME="ComfyUI"
PORT=8188
LISTEN="0.0.0.0"
LOG_FILE="/home/gpu/ComfyUI/comfyui.log"
PID_FILE="/home/gpu/ComfyUI/data/comfyui.pid"
PYTHON_BIN="python"
MAIN_SCRIPT="/home/gpu/ComfyUI/main.py"
BASE_DIR="/home/gpu/ComfyUI"
FRONTEND_DIR="/home/gpu/ComfyUI/ComfyUI_frontend"
WEB_DIR="/home/gpu/ComfyUI/web"
SYNC_SCRIPT="/home/gpu/ComfyUI/scripts/sync_frontend.py"

# 启动参数
START_ARGS="--listen $LISTEN --port $PORT --multi-user"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[OK]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查服务状态
check_status() {
    echo "=== $SERVICE_NAME 服务状态 ==="
    echo ""

    # 检查进程
    if pgrep -f "main.py.*--port $PORT" > /dev/null; then
        PIDS=$(pgrep -f "main.py.*--port $PORT")
        print_success "服务正在运行"
        echo "进程ID: $PIDS"

        MAIN_PID=$(echo "$PIDS" | head -1)
        if [ -n "$MAIN_PID" ]; then
            echo "启动命令: $(ps -p $MAIN_PID -o cmd=)"
            echo "运行时间: $(ps -p $MAIN_PID -o etime=)"
            echo "内存使用: $(ps -p $MAIN_PID -o rss= | awk '{printf "%.1f MB", $1/1024}')"
            echo "CPU使用: $(ps -p $MAIN_PID -o %cpu=)%"
        fi
    else
        print_warning "服务未运行"
    fi

    echo ""

    # 检查端口
    if ss -tln 2>/dev/null | grep ":$PORT" > /dev/null; then
        print_success "端口 $PORT 正在监听"
    else
        print_warning "端口 $PORT 未监听"
    fi

    echo ""

    # 检查HTTP服务
    HTTP_STATUS=$(timeout 5 curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/ 2>/dev/null || echo "timeout")
    if [ "$HTTP_STATUS" = "200" ]; then
        print_success "HTTP服务正常 (状态码: 200)"
    elif [ "$HTTP_STATUS" = "timeout" ]; then
        print_warning "HTTP服务连接超时"
    else
        print_warning "HTTP服务异常 (状态码: $HTTP_STATUS)"
    fi

    echo ""

    # 检查前端文件
    if [ -f "$WEB_DIR/index.html" ]; then
        print_success "前端文件存在: $WEB_DIR/index.html"
    else
        print_error "前端文件缺失: $WEB_DIR/index.html"
        echo "  请执行: $0 rebuild"
    fi

    echo ""

    # 检查日志
    if [ -f "$LOG_FILE" ]; then
        LOG_SIZE=$(du -h "$LOG_FILE" | cut -f1)
        LOG_LINES=$(wc -l < "$LOG_FILE")
        print_info "日志文件: $LOG_FILE ($LOG_SIZE, $LOG_LINES 行)"

        ERROR_COUNT=$(grep -c "\[ERROR\]" "$LOG_FILE" 2>/dev/null || echo 0)
        if [ "$ERROR_COUNT" -gt 0 ]; then
            print_warning "日志中有 $ERROR_COUNT 个错误"
        fi

        echo "最近日志:"
        tail -3 "$LOG_FILE" | sed 's/^/  /'
    else
        print_info "日志文件不存在"
    fi

    echo ""
    echo "访问地址: http://localhost:$PORT"
    echo "=== 状态检查完成 ==="
}

# 启动服务
start_service() {
    echo "=== 启动 $SERVICE_NAME 服务 ==="

    if pgrep -f "main.py.*--port $PORT" > /dev/null; then
        print_warning "服务已在运行"
        check_status
        return 1
    fi

    # 检查前端文件
    if [ ! -f "$WEB_DIR/index.html" ]; then
        print_error "前端文件缺失: $WEB_DIR/index.html"
        echo "请先执行: $0 rebuild"
        return 1
    fi

    # 检查主脚本
    if [ ! -f "$MAIN_SCRIPT" ]; then
        print_error "主脚本不存在: $MAIN_SCRIPT"
        return 1
    fi

    print_info "正在启动服务 (多用户模式, 本地前端)..."
    cd "$BASE_DIR"
    mkdir -p "$(dirname "$PID_FILE")"
    nohup $PYTHON_BIN $MAIN_SCRIPT $START_ARGS > "$LOG_FILE" 2>&1 &

    SERVICE_PID=$!
    echo $SERVICE_PID > "$PID_FILE"

    print_info "服务启动中 (PID: $SERVICE_PID)..."

    for i in {1..30}; do
        if curl -s -o /dev/null http://localhost:$PORT/ 2>/dev/null; then
            print_success "服务启动成功!"
            check_status
            return 0
        fi
        sleep 1
        echo -n "."
    done

    print_error "服务启动超时"
    return 1
}

# 停止服务
stop_service() {
    echo "=== 停止 $SERVICE_NAME 服务 ==="

    PIDS=$(pgrep -f "main.py.*--port $PORT")

    if [ -z "$PIDS" ]; then
        print_warning "服务未运行"
        return 0
    fi

    print_info "找到进程: $PIDS"

    for PID in $PIDS; do
        kill -TERM $PID 2>/dev/null
    done

    for i in {1..10}; do
        if ! pgrep -f "main.py.*--port $PORT" > /dev/null; then
            print_success "服务已停止"
            rm -f "$PID_FILE"
            return 0
        fi
        sleep 1
    done

    print_warning "优雅停止失败，强制停止..."
    for PID in $PIDS; do
        kill -9 $PID 2>/dev/null
    done

    sleep 2

    if ! pgrep -f "main.py.*--port $PORT" > /dev/null; then
        print_success "服务已强制停止"
        rm -f "$PID_FILE"
        return 0
    else
        print_error "无法停止服务"
        return 1
    fi
}

# 重启服务
restart_service() {
    echo "=== 重启 $SERVICE_NAME 服务 ==="
    stop_service
    if [ $? -eq 0 ]; then
        sleep 2
        start_service
        return $?
    else
        print_error "停止服务失败，无法重启"
        return 1
    fi
}

# 构建前端并重启
rebuild_service() {
    echo "=== 构建前端并重启服务 ==="

    # 检查前端目录
    if [ ! -d "$FRONTEND_DIR" ]; then
        print_error "前端源码目录不存在: $FRONTEND_DIR"
        return 1
    fi

    # 停止服务
    if pgrep -f "main.py.*--port $PORT" > /dev/null; then
        print_info "停止当前服务..."
        stop_service
        sleep 2
    fi

    # 构建前端
    print_info "构建前端..."
    cd "$FRONTEND_DIR"
    if [ ! -d "node_modules" ]; then
        print_info "安装前端依赖..."
        pnpm install
        if [ $? -ne 0 ]; then
            print_error "前端依赖安装失败"
            return 1
        fi
    fi

    pnpm build
    if [ $? -ne 0 ]; then
        print_error "前端构建失败"
        return 1
    fi
    print_success "前端构建完成"

    # 同步到 web 目录
    print_info "同步前端到 web 目录..."
    cd "$BASE_DIR"
    $PYTHON_BIN "$SYNC_SCRIPT"
    if [ $? -ne 0 ]; then
        print_error "前端同步失败"
        return 1
    fi
    print_success "前端同步完成"

    # 启动服务
    start_service
    return $?
}

# 查看日志
view_logs() {
    echo "=== 查看 $SERVICE_NAME 日志 ==="

    if [ ! -f "$LOG_FILE" ]; then
        print_error "日志文件不存在: $LOG_FILE"
        return 1
    fi

    tail -50 "$LOG_FILE"

    echo ""
    echo "日志文件: $LOG_FILE"
    echo "总行数: $(wc -l < "$LOG_FILE")"
    echo "文件大小: $(du -h "$LOG_FILE" | cut -f1)"
}

# 清理日志
clean_logs() {
    echo "=== 清理 $SERVICE_NAME 日志 ==="

    if [ ! -f "$LOG_FILE" ]; then
        print_warning "日志文件不存在"
        return 0
    fi

    BACKUP_FILE="${LOG_FILE}.$(date +%Y%m%d_%H%M%S).bak"
    cp "$LOG_FILE" "$BACKUP_FILE"
    > "$LOG_FILE"

    print_success "日志已清理并备份到: $BACKUP_FILE"
    echo "原日志大小: $(du -h "$BACKUP_FILE" | cut -f1)"
    echo "原日志行数: $(wc -l < "$BACKUP_FILE")"
}

# 主函数
main() {
    case "$1" in
        start)
            start_service
            ;;
        stop)
            stop_service
            ;;
        restart)
            restart_service
            ;;
        rebuild)
            rebuild_service
            ;;
        status)
            check_status
            ;;
        logs)
            view_logs
            ;;
        clean)
            clean_logs
            ;;
        *)
            echo "用法: $0 {start|stop|restart|rebuild|status|logs|clean}"
            echo ""
            echo "命令说明:"
            echo "  start    - 启动服务 (多用户模式, 本地前端)"
            echo "  stop     - 停止服务"
            echo "  restart  - 重启服务"
            echo "  rebuild  - 构建前端并重启服务"
            echo "  status   - 查看服务状态"
            echo "  logs     - 查看日志"
            echo "  clean    - 清理日志"
            echo ""
            echo "启动参数: $START_ARGS"
            exit 1
            ;;
    esac
}

main "$@"

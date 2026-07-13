#!/bin/bash

# ComfyUI服务管理脚本

SERVICE_NAME="ComfyUI"
PORT=8188
LOG_FILE="/home/gpu/ComfyUI/comfyui.log"
PID_FILE="/home/gpu/ComfyUI/data/comfyui.pid"
VENV_PATH="/home/gpu/ComfyUI/.venv/bin/python"
MAIN_SCRIPT="/home/gpu/ComfyUI/main.py"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数：打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 函数：检查服务状态
check_status() {
    echo "=== $SERVICE_NAME 服务状态 ==="
    echo ""
    
    # 检查进程
    if pgrep -f "main.py --listen 0.0.0.0 --port $PORT" > /dev/null; then
        PIDS=$(pgrep -f "main.py --listen 0.0.0.0 --port $PORT")
        print_success "服务正在运行"
        echo "进程ID: $PIDS"
        
        # 获取主进程信息
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
    if netstat -tln 2>/dev/null | grep ":$PORT" > /dev/null; then
        print_success "端口 $PORT 正在监听"
        netstat -tln 2>/dev/null | grep ":$PORT"
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
    
    # 检查日志
    if [ -f "$LOG_FILE" ]; then
        LOG_SIZE=$(du -h "$LOG_FILE" | cut -f1)
        LOG_LINES=$(wc -l < "$LOG_FILE")
        print_info "日志文件: $LOG_FILE ($LOG_SIZE, $LOG_LINES 行)"
        
        # 显示错误和警告
        ERROR_COUNT=$(grep -c "ERROR\|error" "$LOG_FILE" | tail -100)
        WARNING_COUNT=$(grep -c "WARNING\|warning" "$LOG_FILE" | tail -100)
        
        if [ "$ERROR_COUNT" -gt 0 ]; then
            print_warning "最近日志中有 $ERROR_COUNT 个错误"
        fi
        
        if [ "$WARNING_COUNT" -gt 0 ]; then
            print_info "最近日志中有 $WARNING_COUNT 个警告"
        fi
        
        # 显示最后3行日志
        echo "最近日志:"
        tail -3 "$LOG_FILE" | sed 's/^/  /'
    else
        print_warning "日志文件不存在"
    fi
    
    echo ""
    echo "访问地址: http://localhost:$PORT"
    echo "管理界面: http://localhost:$PORT/manager"
    echo "=== 状态检查完成 ==="
}

# 函数：启动服务
start_service() {
    echo "=== 启动 $SERVICE_NAME 服务 ==="
    
    # 检查是否已运行
    if pgrep -f "main.py --listen 0.0.0.0 --port $PORT" > /dev/null; then
        print_warning "服务已在运行"
        check_status
        return 1
    fi
    
    # 检查虚拟环境
    if [ ! -f "$VENV_PATH" ]; then
        print_error "虚拟环境不存在: $VENV_PATH"
        return 1
    fi
    
    # 检查主脚本
    if [ ! -f "$MAIN_SCRIPT" ]; then
        print_error "主脚本不存在: $MAIN_SCRIPT"
        return 1
    fi
    
    # 启动服务
    print_info "正在启动服务..."
    cd /home/gpu/ComfyUI
    nohup $VENV_PATH $MAIN_SCRIPT --listen 0.0.0.0 --port $PORT --enable-manager > "$LOG_FILE" 2>&1 &
    
    # 保存PID
    SERVICE_PID=$!
    echo $SERVICE_PID > "$PID_FILE"
    
    print_info "服务启动中 (PID: $SERVICE_PID)..."
    
    # 等待服务启动
    for i in {1..30}; do
        if curl -s -o /dev/null http://localhost:$PORT/; then
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

# 函数：停止服务
stop_service() {
    echo "=== 停止 $SERVICE_NAME 服务 ==="
    
    # 查找进程
    PIDS=$(pgrep -f "main.py --listen 0.0.0.0 --port $PORT")
    
    if [ -z "$PIDS" ]; then
        print_warning "服务未运行"
        return 0
    fi
    
    print_info "找到进程: $PIDS"
    
    # 优雅停止
    for PID in $PIDS; do
        print_info "停止进程 $PID..."
        kill -TERM $PID 2>/dev/null
    done
    
    # 等待进程停止
    for i in {1..10}; do
        if ! pgrep -f "main.py --listen 0.0.0.0 --port $PORT" > /dev/null; then
            print_success "服务已停止"
            
            # 清理PID文件
            if [ -f "$PID_FILE" ]; then
                rm "$PID_FILE"
            fi
            
            return 0
        fi
        sleep 1
    done
    
    # 强制停止
    print_warning "优雅停止失败，尝试强制停止..."
    for PID in $PIDS; do
        kill -9 $PID 2>/dev/null
    done
    
    sleep 2
    
    if ! pgrep -f "main.py --listen 0.0.0.0 --port $PORT" > /dev/null; then
        print_success "服务已强制停止"
        
        # 清理PID文件
        if [ -f "$PID_FILE" ]; then
            rm "$PID_FILE"
        fi
        
        return 0
    else
        print_error "无法停止服务"
        return 1
    fi
}

# 函数：重启服务
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

# 函数：查看日志
view_logs() {
    echo "=== 查看 $SERVICE_NAME 日志 ==="
    
    if [ ! -f "$LOG_FILE" ]; then
        print_error "日志文件不存在: $LOG_FILE"
        return 1
    fi
    
    # 显示最后50行日志
    tail -50 "$LOG_FILE"
    
    echo ""
    echo "日志文件: $LOG_FILE"
    echo "总行数: $(wc -l < "$LOG_FILE")"
    echo "文件大小: $(du -h "$LOG_FILE" | cut -f1)"
}

# 函数：清理日志
clean_logs() {
    echo "=== 清理 $SERVICE_NAME 日志 ==="
    
    if [ ! -f "$LOG_FILE" ]; then
        print_warning "日志文件不存在"
        return 0
    fi
    
    # 备份当前日志
    BACKUP_FILE="${LOG_FILE}.$(date +%Y%m%d_%H%M%S).bak"
    cp "$LOG_FILE" "$BACKUP_FILE"
    
    # 清空日志文件
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
            echo "用法: $0 {start|stop|restart|status|logs|clean}"
            echo ""
            echo "命令说明:"
            echo "  start    - 启动服务"
            echo "  stop     - 停止服务"
            echo "  restart  - 重启服务"
            echo "  status   - 查看服务状态"
            echo "  logs     - 查看日志"
            echo "  clean    - 清理日志"
            echo ""
            echo "示例:"
            echo "  $0 start     # 启动ComfyUI服务"
            echo "  $0 status    # 查看服务状态"
            echo "  $0 logs      # 查看日志"
            echo "  $0 restart   # 重启服务"
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
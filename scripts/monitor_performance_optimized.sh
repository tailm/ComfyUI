#!/bin/bash
# ComfyUI 性能监控脚本
# 针对 AMD Ryzen 9 7950X + RTX 4070 Ti SUPER 16GB 优化

set -e

echo "=========================================="
echo "ComfyUI 性能监控脚本"
echo "针对 AMD Ryzen 9 7950X + RTX 4070 Ti SUPER 16GB"
echo "=========================================="

# 配置
MONITOR_INTERVAL=5  # 监控间隔（秒）
LOG_FILE="comfyui_performance_$(date +%Y%m%d_%H%M%S).log"
PID_FILE="/tmp/comfyui_optimized_pid.txt"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 获取ComfyUI进程PID
get_comfyui_pid() {
    if [ -f "$PID_FILE" ]; then
        cat "$PID_FILE" 2>/dev/null
    else
        pgrep -f "python main.py" | head -1
    fi
}

# 显示系统信息
show_system_info() {
    echo -e "${BLUE}=== 系统信息 ===${NC}"
    echo "CPU: $(lscpu | grep "Model name" | cut -d: -f2 | xargs)"
    echo "核心数: $(nproc)"
    echo "内存: $(free -h | awk '/^Mem:/ {print $2}')"
    echo "存储: $(df -h / | awk 'NR==2 {print $4 " 可用 / " $2 " 总量"}')"
    
    if command -v nvidia-smi &> /dev/null; then
        GPU_INFO=$(nvidia-smi --query-gpu=name,memory.total --format=csv,noheader)
        echo "GPU: $GPU_INFO"
    else
        echo "GPU: NVIDIA驱动未安装"
    fi
    echo ""
}

# 显示优化配置
show_optimization_config() {
    echo -e "${GREEN}=== 优化配置 ===${NC}"
    
    if [ -f "comfyui_optimized_config.sh" ]; then
        source comfyui_optimized_config.sh show 2>/dev/null || echo "无法加载优化配置"
    else
        echo "优化配置文件不存在: comfyui_optimized_config.sh"
    fi
    echo ""
}

# 监控CPU使用率
monitor_cpu() {
    local pid=$1
    if [ -n "$pid" ]; then
        # 获取进程CPU使用率
        local cpu_usage=$(ps -p $pid -o %cpu --no-headers 2>/dev/null | xargs)
        if [ -n "$cpu_usage" ]; then
            echo -e "CPU使用率: ${YELLOW}${cpu_usage}%${NC}"
        else
            echo -e "CPU使用率: ${RED}N/A${NC}"
        fi
    fi
    
    # 系统CPU使用率
    local system_cpu=$(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}' | cut -d. -f1)
    echo -e "系统CPU: ${system_cpu}%"
    
    # CPU频率
    if [ -f "/proc/cpuinfo" ]; then
        local cpu_freq=$(cat /proc/cpuinfo | grep "cpu MHz" | head -1 | awk '{print $4}')
        echo -e "CPU频率: $(echo "scale=1; $cpu_freq/1000" | bc) GHz"
    fi
}

# 监控内存使用
monitor_memory() {
    local pid=$1
    if [ -n "$pid" ]; then
        # 获取进程内存使用
        local mem_usage=$(ps -p $pid -o rss --no-headers 2>/dev/null | xargs)
        if [ -n "$mem_usage" ]; then
            local mem_mb=$(echo "scale=1; $mem_usage/1024" | bc)
            echo -e "进程内存: ${YELLOW}${mem_mb} MB${NC}"
        else
            echo -e "进程内存: ${RED}N/A${NC}"
        fi
    fi
    
    # 系统内存使用
    local total_mem=$(free -m | awk '/^Mem:/ {print $2}')
    local used_mem=$(free -m | awk '/^Mem:/ {print $3}')
    local free_mem=$(free -m | awk '/^Mem:/ {print $4}')
    local mem_percent=$(echo "scale=1; $used_mem*100/$total_mem" | bc)
    
    echo -e "系统内存: ${used_mem}M / ${total_mem}M (${mem_percent}%)"
    echo -e "可用内存: ${free_mem} MB"
}

# 监控GPU使用
monitor_gpu() {
    if command -v nvidia-smi &> /dev/null; then
        local gpu_info=$(nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits)
        if [ -n "$gpu_info" ]; then
            IFS=',' read -r gpu_usage mem_used mem_total gpu_temp <<< "$gpu_info"
            
            # 计算内存使用百分比
            local mem_percent=$(echo "scale=1; $mem_used*100/$mem_total" | bc)
            
            # 颜色编码
            local gpu_color=$GREEN
            if [ "$gpu_usage" -gt 80 ]; then
                gpu_color=$RED
            elif [ "$gpu_usage" -gt 60 ]; then
                gpu_color=$YELLOW
            fi
            
            local mem_color=$GREEN
            if [ "$(echo "$mem_percent > 80" | bc)" -eq 1 ]; then
                mem_color=$RED
            elif [ "$(echo "$mem_percent > 60" | bc)" -eq 1 ]; then
                mem_color=$YELLOW
            fi
            
            local temp_color=$GREEN
            if [ "$gpu_temp" -gt 80 ]; then
                temp_color=$RED
            elif [ "$gpu_temp" -gt 70 ]; then
                temp_color=$YELLOW
            fi
            
            echo -e "GPU使用率: ${gpu_color}${gpu_usage}%${NC}"
            echo -e "GPU显存: ${mem_color}${mem_used}M / ${mem_total}M (${mem_percent}%)${NC}"
            echo -e "GPU温度: ${temp_color}${gpu_temp}°C${NC}"
        else
            echo -e "GPU信息: ${RED}无法获取${NC}"
        fi
    else
        echo -e "GPU监控: ${YELLOW}NVIDIA驱动未安装${NC}"
    fi
}

# 监控磁盘IO
monitor_disk() {
    local disk_usage=$(df -h /home/gpu/ComfyUI | awk 'NR==2 {print $5}')
    local disk_available=$(df -h /home/gpu/ComfyUI | awk 'NR==2 {print $4}')
    
    echo -e "磁盘使用: ${disk_usage}"
    echo -e "可用空间: ${disk_available}"
    
    # IO统计
    if command -v iostat &> /dev/null; then
        local io_stats=$(iostat -d -x 1 1 | grep -A1 "Device" | tail -1)
        if [ -n "$io_stats" ]; then
            local device=$(echo $io_stats | awk '{print $1}')
            local util=$(echo $io_stats | awk '{print $14}')
            echo -e "磁盘IO使用率: ${util}% (${device})"
        fi
    fi
}

# 监控网络
monitor_network() {
    if command -v netstat &> /dev/null; then
        local comfyui_port=8188
        local connections=$(netstat -an | grep ":$comfyui_port" | grep ESTABLISHED | wc -l)
        echo -e "ComfyUI连接数: ${connections}"
    fi
}

# 监控进程状态
monitor_process() {
    local pid=$1
    if [ -n "$pid" ]; then
        if ps -p $pid > /dev/null 2>&1; then
            local process_info=$(ps -p $pid -o pid,ppid,user,%cpu,%mem,rss,vsz,etime,cmd --no-headers)
            IFS=' ' read -r pid ppid user cpu mem rss vsz etime cmd <<< "$process_info"
            
            echo -e "${GREEN}进程状态: 运行中${NC}"
            echo -e "进程ID: ${pid}"
            echo -e "运行时间: ${etime}"
            echo -e "用户: ${user}"
            echo -e "虚拟内存: $(echo "scale=1; $vsz/1024" | bc) MB"
            
            # 检查端口监听
            if ss -tlnp 2>/dev/null | grep -q ":$COMFYUI_PORT.*pid=$pid" || \
               netstat -tlnp 2>/dev/null | grep -q ":$COMFYUI_PORT.*$pid/"; then
                echo -e "端口状态: ${GREEN}监听中 (${COMFYUI_PORT})${NC}"
            else
                echo -e "端口状态: ${RED}未监听${NC}"
            fi
        else
            echo -e "${RED}进程状态: 未运行${NC}"
        fi
    else
        echo -e "${RED}未找到ComfyUI进程${NC}"
    fi
}

# 性能建议
performance_advice() {
    echo -e "${PURPLE}=== 性能建议 ===${NC}"
    
    local pid=$1
    local advice=""
    
    # 获取当前指标
    local cpu_usage=$(ps -p $pid -o %cpu --no-headers 2>/dev/null | xargs || echo "0")
    local mem_usage=$(ps -p $pid -o rss --no-headers 2>/dev/null | xargs || echo "0")
    local mem_mb=$(echo "scale=1; $mem_usage/1024" | bc)
    
    # GPU信息
    if command -v nvidia-smi &> /dev/null; then
        local gpu_info=$(nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total --format=csv,noheader,nounits)
        IFS=',' read -r gpu_usage mem_used mem_total <<< "$gpu_info"
        local mem_percent=$(echo "scale=1; $mem_used*100/$mem_total" | bc)
    else
        local gpu_usage=0
        local mem_percent=0
    fi
    
    # CPU建议
    if [ -n "$cpu_usage" ] && [ "$cpu_usage" != "0" ]; then
        if [ "$(echo "$cpu_usage > 80" | bc 2>/dev/null || echo 0)" -eq 1 ]; then
            advice+="• CPU使用率较高 (${cpu_usage}%)，考虑增加 OMP_NUM_THREADS\n"
        elif [ "$(echo "$cpu_usage < 30" | bc 2>/dev/null || echo 0)" -eq 1 ]; then
            advice+="• CPU使用率较低 (${cpu_usage}%)，可减少 OMP_NUM_THREADS 以节省资源\n"
        fi
    fi
    
    # 内存建议
    if [ "$(echo "$mem_mb > 8000" | bc 2>/dev/null || echo 0)" -eq 1 ]; then
        advice+="• 进程内存使用较高 (${mem_mb}MB)，检查内存泄漏\n"
    fi
    
    # GPU建议
    if [ -n "$gpu_usage" ] && [ "$gpu_usage" -gt 90 ]; then
        advice+="• GPU使用率很高 (${gpu_usage}%)，考虑减少批处理大小\n"
    fi
    
    if [ -n "$mem_percent" ] && [ "$(echo "$mem_percent > 90" | bc 2>/dev/null || echo 0)" -eq 1 ]; then
        advice+="• GPU显存使用率很高 (${mem_percent}%)，考虑启用 --lowvram 模式\n"
    fi
    
    # 通用建议
    advice+="• 确保使用 --highvram 模式 (16GB显存)\n"
    advice+="• 使用 --force-fp16 加速推理\n"
    advice+="• 调整 PYTORCH_CUDA_ALLOC_CONF 优化显存分配\n"
    advice+="• 使用模型缓存减少加载时间\n"
    
    if [ -z "$advice" ]; then
        advice="• 系统运行良好，无需调整\n"
    fi
    
    echo -e "$advice"
}

# 主监控循环
monitor_loop() {
    local pid=$1
    local count=0
    
    echo -e "${CYAN}开始性能监控，按 Ctrl+C 停止...${NC}"
    echo "监控间隔: ${MONITOR_INTERVAL}秒"
    echo "日志文件: ${LOG_FILE}"
    echo ""
    
    # 写入日志头
    echo "时间,进程CPU%,系统CPU%,进程内存(MB),系统内存%,GPU使用%,GPU显存%,GPU温度,磁盘使用,连接数" > "$LOG_FILE"
    
    while true; do
        count=$((count + 1))
        clear
        
        echo -e "${BLUE}==========================================${NC}"
        echo -e "${BLUE} ComfyUI 性能监控 - 第 ${count} 次采样${NC}"
        echo -e "${BLUE}==========================================${NC}"
        echo ""
        
        # 显示时间
        echo -e "时间: $(date '+%Y-%m-%d %H:%M:%S')"
        echo ""
        
        # 监控各项指标
        echo -e "${YELLOW}=== 进程监控 ===${NC}"
        monitor_process "$pid"
        echo ""
        
        echo -e "${YELLOW}=== CPU监控 ===${NC}"
        monitor_cpu "$pid"
        echo ""
        
        echo -e "${YELLOW}=== 内存监控 ===${NC}"
        monitor_memory "$pid"
        echo ""
        
        echo -e "${YELLOW}=== GPU监控 ===${NC}"
        monitor_gpu
        echo ""
        
        echo -e "${YELLOW}=== 磁盘监控 ===${NC}"
        monitor_disk
        echo ""
        
        echo -e "${YELLOW}=== 网络监控 ===${NC}"
        monitor_network
        echo ""
        
        # 性能建议
        performance_advice "$pid"
        
        echo -e "${BLUE}==========================================${NC}"
        echo -e "按 Ctrl+C 停止监控"
        echo ""
        
        # 记录到日志文件
        local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        local cpu_usage=$(ps -p $pid -o %cpu --no-headers 2>/dev/null | xargs || echo "0")
        local system_cpu=$(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}' | cut -d. -f1)
        local mem_usage=$(ps -p $pid -o rss --no-headers 2>/dev/null | xargs || echo "0")
        local mem_mb=$(echo "scale=0; $mem_usage/1024" | bc)
        local total_mem=$(free -m | awk '/^Mem:/ {print $2}')
        local used_mem=$(free -m | awk '/^Mem:/ {print $3}')
        local mem_percent=$(echo "scale=1; $used_mem*100/$total_mem" | bc)
        
        # GPU数据
        local gpu_usage=0
        local gpu_mem_percent=0
        local gpu_temp=0
        if command -v nvidia-smi &> /dev/null; then
            local gpu_info=$(nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits 2>/dev/null)
            if [ -n "$gpu_info" ]; then
                IFS=',' read -r gpu_usage mem_used mem_total gpu_temp <<< "$gpu_info"
                gpu_mem_percent=$(echo "scale=1; $mem_used*100/$mem_total" | bc)
            fi
        fi
        
        local disk_usage=$(df -h /home/gpu/ComfyUI | awk 'NR==2 {print $5}' | tr -d '%')
        local connections=$(netstat -an 2>/dev/null | grep ":8188" | grep ESTABLISHED | wc -l || echo "0")
        
        # 写入CSV日志
        echo "$timestamp,$cpu_usage,$system_cpu,$mem_mb,$mem_percent,$gpu_usage,$gpu_mem_percent,$gpu_temp,$disk_usage,$connections" >> "$LOG_FILE"
        
        sleep $MONITOR_INTERVAL
    done
}

# 生成性能报告
generate_report() {
    echo -e "${GREEN}=== 性能报告 ===${NC}"
    echo "生成时间: $(date)"
    echo "监控日志: $LOG_FILE"
    echo ""
    
    if [ -f "$LOG_FILE" ]; then
        echo "最后10条记录:"
        tail -10 "$LOG_FILE" | column -t -s ','
        echo ""
        
        # 计算平均值
        echo "平均值统计:"
        awk -F',' 'NR>1 {
            cpu_sum+=$2; sys_cpu_sum+=$3; mem_sum+=$4; sys_mem_sum+=$5;
            gpu_sum+=$6; gpu_mem_sum+=$7; temp_sum+=$8;
            count++
        } END {
            if(count>0) {
                printf "进程CPU: %.1f%%\n", cpu_sum/count
                printf "系统CPU: %.1f%%\n", sys_cpu_sum/count
                printf "进程内存: %.0fMB\n", mem_sum/count
                printf "系统内存: %.1f%%\n", sys_mem_sum/count
                printf "GPU使用: %.1f%%\n", gpu_sum/count
                printf "GPU显存: %.1f%%\n", gpu_mem_sum/count
                printf "GPU温度: %.1f°C\n", temp_sum/count
            }
        }' "$LOG_FILE"
    else
        echo "日志文件不存在"
    fi
}

# 主函数
main() {
    # 显示系统信息
    show_system_info
    
    # 显示优化配置
    show_optimization_config
    
    # 获取ComfyUI进程PID
    local pid=$(get_comfyui_pid)
    
    if [ -z "$pid" ]; then
        echo -e "${RED}错误: 未找到运行的ComfyUI进程${NC}"
        echo "请先启动ComfyUI服务:"
        echo "  ./start_optimized.sh"
        echo "或"
        echo "  python main.py --listen 0.0.0.0 --port 8188 --highvram --force-fp16"
        exit 1
    fi
    
    echo -e "${GREEN}找到ComfyUI进程: PID ${pid}${NC}"
    echo ""
    
    case "${1:-}" in
        "report")
            generate_report
            ;;
        "log")
            if [ -f "$LOG_FILE" ]; then
                tail -f "$LOG_FILE"
            else
                echo "日志文件不存在: $LOG_FILE"
            fi
            ;;
        *)
            # 启动监控
            trap 'echo -e "\n${CYAN}监控已停止${NC}"; generate_report; exit 0' INT
            monitor_loop "$pid"
            ;;
    esac
}

# 检查参数
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "用法: $0 [command]"
        echo ""
        echo "命令:"
        echo "  (无)     启动实时监控"
        echo "  report   生成性能报告"
        echo "  log      查看实时日志"
        echo "  help     显示帮助信息"
        echo ""
        echo "示例:"
        echo "  $0          # 启动实时监控"
        echo "  $0 report   # 生成性能报告"
        echo "  $0 log      # 查看实时日志"
        exit 0
        ;;
esac

# 运行主函数
main "$@"
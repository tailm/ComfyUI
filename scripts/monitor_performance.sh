#!/bin/bash
# ComfyUI 性能监控脚本
# 针对 RTX 4070 Ti SUPER 16GB + AMD Ryzen 9 7950X 优化监控

echo "启动ComfyUI性能监控..."
echo "按 Ctrl+C 停止监控"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 监控间隔（秒）
INTERVAL=2

# 性能阈值
GPU_MEMORY_WARNING=14000  # 14GB警告
GPU_MEMORY_CRITICAL=15000 # 15GB临界
GPU_TEMP_WARNING=80       # 80°C警告
GPU_TEMP_CRITICAL=85      # 85°C临界
CPU_USAGE_WARNING=80      # 80%警告
MEMORY_USAGE_WARNING=80   # 80%警告

monitor_performance() {
    while true; do
        clear
        echo -e "${BLUE}=== ComfyUI 性能监控 ===${NC}"
        echo -e "时间: $(date '+%Y-%m-%d %H:%M:%S')"
        echo ""
        
        # GPU监控
        echo -e "${GREEN}=== GPU 状态 ===${NC}"
        GPU_INFO=$(nvidia-smi --query-gpu=name,temperature.gpu,utilization.gpu,memory.used,memory.total --format=csv,noheader,nounits)
        IFS=',' read -r GPU_NAME GPU_TEMP GPU_UTIL GPU_USED GPU_TOTAL <<< "$GPU_INFO"
        
        GPU_USED_MB=$GPU_USED
        GPU_TOTAL_MB=$GPU_TOTAL
        GPU_USAGE_PERCENT=$((GPU_USED_MB * 100 / GPU_TOTAL_MB))
        
        # GPU温度颜色
        if [ "$GPU_TEMP" -ge "$GPU_TEMP_CRITICAL" ]; then
            TEMP_COLOR=$RED
        elif [ "$GPU_TEMP" -ge "$GPU_TEMP_WARNING" ]; then
            TEMP_COLOR=$YELLOW
        else
            TEMP_COLOR=$GREEN
        fi
        
        # GPU显存颜色
        if [ "$GPU_USED_MB" -ge "$GPU_MEMORY_CRITICAL" ]; then
            MEM_COLOR=$RED
        elif [ "$GPU_USED_MB" -ge "$GPU_MEMORY_WARNING" ]; then
            MEM_COLOR=$YELLOW
        else
            MEM_COLOR=$GREEN
        fi
        
        echo -e "GPU: ${GPU_NAME}"
        echo -e "温度: ${TEMP_COLOR}${GPU_TEMP}°C${NC}"
        echo -e "使用率: ${GPU_UTIL}%"
        echo -e "显存: ${MEM_COLOR}${GPU_USED_MB}MB / ${GPU_TOTAL_MB}MB (${GPU_USAGE_PERCENT}%)${NC}"
        
        # CPU监控
        echo ""
        echo -e "${GREEN}=== CPU 状态 ===${NC}"
        CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
        CPU_USAGE_INT=${CPU_USAGE%.*}
        
        if [ "$CPU_USAGE_INT" -ge "$CPU_USAGE_WARNING" ]; then
            CPU_COLOR=$YELLOW
        else
            CPU_COLOR=$GREEN
        fi
        
        echo -e "使用率: ${CPU_COLOR}${CPU_USAGE}%${NC}"
        echo -e "核心数: 16核心 / 32线程"
        
        # 内存监控
        echo ""
        echo -e "${GREEN}=== 内存状态 ===${NC}"
        MEM_INFO=$(free -m | grep Mem)
        TOTAL_MEM=$(echo $MEM_INFO | awk '{print $2}')
        USED_MEM=$(echo $MEM_INFO | awk '{print $3}')
        FREE_MEM=$(echo $MEM_INFO | awk '{print $4}')
        MEM_USAGE_PERCENT=$((USED_MEM * 100 / TOTAL_MEM))
        
        if [ "$MEM_USAGE_PERCENT" -ge "$MEMORY_USAGE_WARNING" ]; then
            MEM_COLOR=$YELLOW
        else
            MEM_COLOR=$GREEN
        fi
        
        echo -e "内存: ${MEM_COLOR}${USED_MEM}MB / ${TOTAL_MEM}MB (${MEM_USAGE_PERCENT}%)${NC}"
        echo -e "可用: ${FREE_MEM}MB"
        
        # 进程监控
        echo ""
        echo -e "${GREEN}=== ComfyUI 进程 ===${NC}"
        COMFYUI_PID=$(pgrep -f "python.*main\.py")
        if [ -n "$COMFYUI_PID" ]; then
            echo -e "进程ID: ${GREEN}${COMFYUI_PID}${NC} (运行中)"
            
            # 获取进程资源使用
            PROCESS_INFO=$(ps -p $COMFYUI_PID -o %cpu,%mem,cmd --no-headers)
            CPU_PERCENT=$(echo $PROCESS_INFO | awk '{print $1}')
            MEM_PERCENT=$(echo $PROCESS_INFO | awk '{print $2}')
            
            echo -e "CPU使用: ${CPU_PERCENT}%"
            echo -e "内存使用: ${MEM_PERCENT}%"
            
            # 检查端口
            PORT_STATUS=$(netstat -tlnp 2>/dev/null | grep :8188 | grep $COMFYUI_PID)
            if [ -n "$PORT_STATUS" ]; then
                echo -e "服务状态: ${GREEN}运行中 (端口 8188)${NC}"
            else
                echo -e "服务状态: ${YELLOW}进程存在但端口未监听${NC}"
            fi
        else
            echo -e "状态: ${RED}未运行${NC}"
        fi
        
        # 磁盘监控
        echo ""
        echo -e "${GREEN}=== 磁盘状态 ===${NC}"
        DISK_INFO=$(df -h /home/gpu | tail -1)
        DISK_TOTAL=$(echo $DISK_INFO | awk '{print $2}')
        DISK_USED=$(echo $DISK_INFO | awk '{print $3}')
        DISK_AVAIL=$(echo $DISK_INFO | awk '{print $4}')
        DISK_USE_PERCENT=$(echo $DISK_INFO | awk '{print $5}' | tr -d '%')
        
        if [ "$DISK_USE_PERCENT" -ge 90 ]; then
            DISK_COLOR=$RED
        elif [ "$DISK_USE_PERCENT" -ge 80 ]; then
            DISK_COLOR=$YELLOW
        else
            DISK_COLOR=$GREEN
        fi
        
        echo -e "磁盘: ${DISK_COLOR}${DISK_USED} / ${DISK_TOTAL} (${DISK_USE_PERCENT}%)${NC}"
        echo -e "可用: ${DISK_AVAIL}"
        
        # 性能建议
        echo ""
        echo -e "${BLUE}=== 性能建议 ===${NC}"
        
        if [ "$GPU_USED_MB" -ge "$GPU_MEMORY_WARNING" ]; then
            echo -e "${YELLOW}⚠️  GPU显存使用较高，考虑：${NC}"
            echo -e "  - 使用 --normalvram 模式"
            echo -e "  - 降低 PYTORCH_CUDA_MEMORY_FRACTION 值"
            echo -e "  - 关闭其他GPU应用"
        fi
        
        if [ "$GPU_TEMP" -ge "$GPU_TEMP_WARNING" ]; then
            echo -e "${YELLOW}⚠️  GPU温度较高，考虑：${NC}"
            echo -e "  - 改善散热"
            echo -e "  - 降低工作负载"
            echo -e "  - 检查风扇状态"
        fi
        
        if [ "$CPU_USAGE_INT" -ge "$CPU_USAGE_WARNING" ]; then
            echo -e "${YELLOW}⚠️  CPU使用率较高，考虑：${NC}"
            echo -e "  - 减少 OMP_NUM_THREADS 值"
            echo -e "  - 关闭不必要的进程"
        fi
        
        if [ "$MEM_USAGE_PERCENT" -ge "$MEMORY_USAGE_WARNING" ]; then
            echo -e "${YELLOW}⚠️  内存使用率较高，考虑：${NC}"
            echo -e "  - 增加swap空间"
            echo -e "  - 关闭不必要的应用"
        fi
        
        if [ -z "$COMFYUI_PID" ]; then
            echo -e "${RED}❌  ComfyUI未运行，使用 ./start_comfyui.sh start 启动${NC}"
        fi
        
        echo ""
        echo -e "${BLUE}监控间隔: ${INTERVAL}秒 | 按 Ctrl+C 退出${NC}"
        sleep $INTERVAL
    done
}

# 检查nvidia-smi是否可用
if ! command -v nvidia-smi &> /dev/null; then
    echo -e "${RED}错误: nvidia-smi 未找到，请安装NVIDIA驱动${NC}"
    exit 1
fi

# 启动监控
monitor_performance
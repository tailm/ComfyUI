#!/bin/bash
# ComfyUI 性能测试脚本
# 针对 RTX 4070 Ti SUPER 16GB 优化测试

echo "开始ComfyUI性能测试..."
echo "硬件配置: RTX 4070 Ti SUPER 16GB + AMD Ryzen 9 7950X"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试结果文件
TEST_RESULTS="performance_test_$(date +%Y%m%d_%H%M%S).log"

# 记录测试结果
log_result() {
    echo "$1" | tee -a "$TEST_RESULTS"
}

# 测试1: 系统基准测试
test_system_baseline() {
    echo -e "${BLUE}=== 测试1: 系统基准测试 ===${NC}"
    log_result "=== 系统基准测试 ==="
    
    # CPU测试
    echo -e "${GREEN}1. CPU性能测试...${NC}"
    CPU_SCORE=$(sysbench cpu --cpu-max-prime=20000 run | grep "events per second" | awk '{print $4}')
    log_result "CPU性能: ${CPU_SCORE} events/sec"
    echo -e "CPU性能: ${CPU_SCORE} events/sec"
    
    # 内存测试
    echo -e "${GREEN}2. 内存性能测试...${NC}"
    MEM_SCORE=$(sysbench memory --memory-block-size=1M --memory-total-size=10G run | grep "MiB/sec" | awk '{print $4}')
    log_result "内存性能: ${MEM_SCORE} MiB/sec"
    echo -e "内存性能: ${MEM_SCORE} MiB/sec"
    
    # 磁盘测试
    echo -e "${GREEN}3. 磁盘性能测试...${NC}"
    DISK_SCORE=$(dd if=/dev/zero of=testfile bs=1G count=1 oflag=direct 2>&1 | grep "copied" | awk '{print $8, $9}')
    log_result "磁盘写入速度: ${DISK_SCORE}"
    echo -e "磁盘写入速度: ${DISK_SCORE}"
    rm -f testfile
    
    echo ""
}

# 测试2: GPU性能测试
test_gpu_performance() {
    echo -e "${BLUE}=== 测试2: GPU性能测试 ===${NC}"
    log_result "=== GPU性能测试 ==="
    
    # GPU信息
    echo -e "${GREEN}1. GPU信息...${NC}"
    GPU_INFO=$(nvidia-smi --query-gpu=name,driver_version,memory.total,temperature.gpu --format=csv,noheader)
    log_result "GPU信息: ${GPU_INFO}"
    echo -e "GPU信息: ${GPU_INFO}"
    
    # CUDA测试
    echo -e "${GREEN}2. CUDA性能测试...${NC}"
    if command -v nvidia-smi &> /dev/null; then
        CUDA_TEST=$(nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total --format=csv,noheader)
        log_result "CUDA状态: ${CUDA_TEST}"
        echo -e "CUDA状态: ${CUDA_TEST}"
    else
        log_result "CUDA测试: nvidia-smi未找到"
        echo -e "${YELLOW}CUDA测试: nvidia-smi未找到${NC}"
    fi
    
    # PyTorch测试
    echo -e "${GREEN}3. PyTorch测试...${NC}"
    python3 -c "
import torch
print('PyTorch版本:', torch.__version__)
print('CUDA可用:', torch.cuda.is_available())
if torch.cuda.is_available():
    print('CUDA版本:', torch.version.cuda)
    print('GPU数量:', torch.cuda.device_count())
    for i in range(torch.cuda.device_count()):
        print(f'GPU {i}: {torch.cuda.get_device_name(i)}')
        print(f'  显存总量: {torch.cuda.get_device_properties(i).total_memory / 1024**3:.2f} GB')
        print(f'  已用显存: {torch.cuda.memory_allocated(i) / 1024**3:.2f} GB')
        print(f'  缓存显存: {torch.cuda.memory_reserved(i) / 1024**3:.2f} GB')
" 2>&1 | tee -a "$TEST_RESULTS"
    
    echo ""
}

# 测试3: ComfyUI启动测试
test_comfyui_startup() {
    echo -e "${BLUE}=== 测试3: ComfyUI启动测试 ===${NC}"
    log_result "=== ComfyUI启动测试 ==="
    
    # 检查服务状态
    echo -e "${GREEN}1. 检查当前服务状态...${NC}"
    if pgrep -f "python.*main\.py" > /dev/null; then
        echo -e "${YELLOW}ComfyUI已在运行，先停止服务...${NC}"
        ./start_comfyui.sh stop
        sleep 3
    fi
    
    # 启动服务并计时
    echo -e "${GREEN}2. 启动ComfyUI服务...${NC}"
    START_TIME=$(date +%s)
    ./start_comfyui.sh start > /dev/null 2>&1 &
    START_PID=$!
    
    # 等待服务启动
    echo -e "${GREEN}3. 等待服务启动...${NC}"
    MAX_WAIT=60
    WAITED=0
    STARTED=false
    
    while [ $WAITED -lt $MAX_WAIT ]; do
        if curl -s http://localhost:8188 > /dev/null; then
            END_TIME=$(date +%s)
            STARTUP_TIME=$((END_TIME - START_TIME))
            log_result "启动时间: ${STARTUP_TIME}秒"
            echo -e "${GREEN}服务启动成功！耗时: ${STARTUP_TIME}秒${NC}"
            STARTED=true
            break
        fi
        sleep 1
        WAITED=$((WAITED + 1))
        echo -n "."
    done
    
    if [ "$STARTED" = false ]; then
        log_result "启动失败: 超时"
        echo -e "${RED}服务启动超时${NC}"
        kill $START_PID 2>/dev/null
        return 1
    fi
    
    # 检查服务状态
    echo -e "${GREEN}4. 检查服务状态...${NC}"
    SERVICE_STATUS=$(./start_comfyui.sh status)
    log_result "服务状态: ${SERVICE_STATUS}"
    echo -e "服务状态: ${SERVICE_STATUS}"
    
    # 检查资源使用
    echo -e "${GREEN}5. 检查资源使用...${NC}"
    sleep 5
    COMFYUI_PID=$(pgrep -f "python.*main\.py")
    if [ -n "$COMFYUI_PID" ]; then
        PROCESS_INFO=$(ps -p $COMFYUI_PID -o %cpu,%mem,vsz,rss --no-headers)
        log_result "进程资源: ${PROCESS_INFO}"
        echo -e "进程资源: ${PROCESS_INFO}"
    fi
    
    echo ""
    return 0
}

# 测试4: 模型加载测试
test_model_loading() {
    echo -e "${BLUE}=== 测试4: 模型加载测试 ===${NC}"
    log_result "=== 模型加载测试 ==="
    
    # 检查模型目录
    echo -e "${GREEN}1. 检查模型文件...${NC}"
    MODEL_COUNT=$(find models/checkpoints -name "*.safetensors" -o -name "*.ckpt" -o -name "*.pth" 2>/dev/null | wc -l)
    log_result "模型文件数量: ${MODEL_COUNT}"
    echo -e "模型文件数量: ${MODEL_COUNT}"
    
    if [ "$MODEL_COUNT" -eq 0 ]; then
        echo -e "${YELLOW}未找到模型文件，跳过模型加载测试${NC}"
        log_result "未找到模型文件，跳过测试"
        return 0
    fi
    
    # 列出模型文件
    echo -e "${GREEN}2. 模型文件列表:${NC}"
    find models/checkpoints -name "*.safetensors" -o -name "*.ckpt" -o -name "*.pth" 2>/dev/null | while read -r model; do
        MODEL_SIZE=$(du -h "$model" | cut -f1)
        log_result "模型: $(basename "$model") - 大小: ${MODEL_SIZE}"
        echo -e "  - $(basename "$model") (${MODEL_SIZE})"
    done
    
    echo ""
}

# 测试5: 性能基准测试
test_performance_benchmark() {
    echo -e "${BLUE}=== 测试5: 性能基准测试 ===${NC}"
    log_result "=== 性能基准测试 ==="
    
    # 获取当前资源使用
    echo -e "${GREEN}1. 基准资源使用...${NC}"
    GPU_BASE=$(nvidia-smi --query-gpu=memory.used --format=csv,noheader,nounits)
    MEM_BASE=$(free -m | grep Mem | awk '{print $3}')
    log_result "基准GPU显存: ${GPU_BASE}MB"
    log_result "基准内存: ${MEM_BASE}MB"
    
    # 运行简单测试
    echo -e "${GREEN}2. 运行简单推理测试...${NC}"
    TEST_SCRIPT="
import torch
import time

# 测试张量运算
print('开始性能测试...')
start_time = time.time()

# 创建测试张量
x = torch.randn(1024, 1024).cuda()
y = torch.randn(1024, 1024).cuda()

# 矩阵乘法测试
for i in range(100):
    z = torch.matmul(x, y)

elapsed = time.time() - start_time
print(f'矩阵乘法测试完成: {elapsed:.2f}秒')

# 显存测试
allocated = torch.cuda.memory_allocated() / 1024**2
reserved = torch.cuda.memory_reserved() / 1024**2
print(f'已分配显存: {allocated:.2f} MB')
print(f'已保留显存: {reserved:.2f} MB')

# 清理
del x, y, z
torch.cuda.empty_cache()
"
    
    echo "$TEST_SCRIPT" | python3 2>&1 | tee -a "$TEST_RESULTS"
    
    # 获取测试后资源使用
    GPU_AFTER=$(nvidia-smi --query-gpu=memory.used --format=csv,noheader,nounits)
    MEM_AFTER=$(free -m | grep Mem | awk '{print $3}')
    GPU_DIFF=$((GPU_AFTER - GPU_BASE))
    MEM_DIFF=$((MEM_AFTER - MEM_BASE))
    
    log_result "测试后GPU显存: ${GPU_AFTER}MB (增加: ${GPU_DIFF}MB)"
    log_result "测试后内存: ${MEM_AFTER}MB (增加: ${MEM_DIFF}MB)"
    
    echo ""
}

# 测试6: 停止服务测试
test_service_stop() {
    echo -e "${BLUE}=== 测试6: 服务停止测试 ===${NC}"
    log_result "=== 服务停止测试 ==="
    
    echo -e "${GREEN}1. 停止ComfyUI服务...${NC}"
    STOP_START=$(date +%s)
    ./start_comfyui.sh stop
    STOP_END=$(date +%s)
    STOP_TIME=$((STOP_END - STOP_START))
    
    log_result "停止时间: ${STOP_TIME}秒"
    echo -e "服务停止耗时: ${STOP_TIME}秒"
    
    # 检查是否完全停止
    sleep 2
    if pgrep -f "python.*main\.py" > /dev/null; then
        log_result "停止状态: 失败"
        echo -e "${RED}服务停止失败${NC}"
        return 1
    else
        log_result "停止状态: 成功"
        echo -e "${GREEN}服务停止成功${NC}"
    fi
    
    echo ""
}

# 主测试流程
main() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}    ComfyUI 性能测试套件${NC}"
    echo -e "${BLUE}    硬件: RTX 4070 Ti SUPER 16GB${NC}"
    echo -e "${BLUE}    CPU: AMD Ryzen 9 7950X${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    
    # 创建测试结果文件
    echo "测试开始时间: $(date)" > "$TEST_RESULTS"
    echo "硬件配置: RTX 4070 Ti SUPER 16GB + AMD Ryzen 9 7950X" >> "$TEST_RESULTS"
    echo "========================================" >> "$TEST_RESULTS"
    
    # 运行所有测试
    test_system_baseline
    test_gpu_performance
    test_comfyui_startup
    if [ $? -eq 0 ]; then
        test_model_loading
        test_performance_benchmark
        test_service_stop
    else
        echo -e "${RED}ComfyUI启动失败，跳过后续测试${NC}"
        log_result "测试中止: ComfyUI启动失败"
    fi
    
    # 测试总结
    echo -e "${BLUE}=== 测试总结 ===${NC}"
    echo -e "${GREEN}测试完成！结果保存在: ${TEST_RESULTS}${NC}"
    echo ""
    echo -e "${YELLOW}建议操作:${NC}"
    echo "1. 查看详细测试结果: cat $TEST_RESULTS"
    echo "2. 应用优化配置: source optimize_env.sh"
    echo "3. 启动监控: ./monitor_performance.sh"
    echo "4. 根据测试结果调整配置"
    
    # 添加到日志
    echo "" >> "$TEST_RESULTS"
    echo "测试结束时间: $(date)" >> "$TEST_RESULTS"
    echo "========================================" >> "$TEST_RESULTS"
}

# 检查依赖
check_dependencies() {
    echo -e "${GREEN}检查依赖...${NC}"
    
    # 检查sysbench
    if ! command -v sysbench &> /dev/null; then
        echo -e "${YELLOW}警告: sysbench未安装，跳过CPU/内存测试${NC}"
        echo "安装命令: sudo apt install sysbench"
        SKIP_SYSBENCH=true
    else
        SKIP_SYSBENCH=false
    fi
    
    # 检查curl
    if ! command -v curl &> /dev/null; then
        echo -e "${YELLOW}警告: curl未安装，跳过服务状态检查${NC}"
        echo "安装命令: sudo apt install curl"
        SKIP_CURL=true
    else
        SKIP_CURL=false
    fi
    
    # 检查nvidia-smi
    if ! command -v nvidia-smi &> /dev/null; then
        echo -e "${RED}错误: nvidia-smi未找到，请安装NVIDIA驱动${NC}"
        exit 1
    fi
    
    # 检查Python
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}错误: python3未找到${NC}"
        exit 1
    fi
    
    # 检查PyTorch
    if ! python3 -c "import torch" &> /dev/null; then
        echo -e "${YELLOW}警告: PyTorch未安装，部分测试可能失败${NC}"
        echo "安装命令: pip install torch torchvision torchaudio"
    fi
    
    echo ""
}

# 运行检查
check_dependencies

# 运行主测试
main
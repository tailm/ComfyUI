#!/bin/bash
# ComfyUI 优化测试脚本
# 测试优化配置的效果

set -e

echo "=========================================="
echo "ComfyUI 优化配置测试脚本"
echo "=========================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试函数
test_system() {
    echo -e "${BLUE}[1/6] 测试系统配置...${NC}"
    
    # CPU测试
    echo -e "  CPU信息:"
    lscpu | grep -E "Model name|CPU\(s\)|Thread|Core|MHz" | head -5 | sed 's/^/    /'
    
    # 内存测试
    echo -e "  内存信息:"
    free -h | sed 's/^/    /'
    
    # GPU测试
    echo -e "  GPU信息:"
    if command -v nvidia-smi &> /dev/null; then
        nvidia-smi --query-gpu=name,memory.total,memory.free,driver_version --format=csv,noheader | sed 's/^/    /'
    else
        echo -e "    ${RED}NVIDIA驱动未安装${NC}"
    fi
    
    # 存储测试
    echo -e "  存储信息:"
    df -h /home/gpu/ComfyUI | sed 's/^/    /'
    
    echo -e "${GREEN}✓ 系统配置测试完成${NC}"
    echo ""
}

test_python() {
    echo -e "${BLUE}[2/6] 测试Python环境...${NC}"
    
    # Python版本
    echo -e "  Python版本:"
    python3 --version 2>/dev/null || echo -e "    ${RED}Python3未安装${NC}"
    
    # PyTorch测试
    echo -e "  PyTorch测试:"
    python3 -c "
import torch
print(f'    PyTorch版本: {torch.__version__}')
print(f'    CUDA可用: {torch.cuda.is_available()}')
if torch.cuda.is_available():
    print(f'    CUDA版本: {torch.version.cuda}')
    print(f'    GPU数量: {torch.cuda.device_count()}')
    for i in range(torch.cuda.device_count()):
        print(f'    GPU {i}: {torch.cuda.get_device_name(i)}')
        print(f'      显存: {torch.cuda.get_device_properties(i).total_memory / 1024**3:.1f} GB')
" 2>/dev/null || echo -e "    ${RED}PyTorch未安装${NC}"
    
    # 关键库测试
    echo -e "  关键库测试:"
    for lib in "numpy" "pillow" "requests" "aiohttp" "torchvision" "transformers"; do
        if python3 -c "import $lib; print(f'    $lib: {${lib}.__version__}')" 2>/dev/null; then
            :
        else
            echo -e "    ${YELLOW}$lib: 未安装或版本未知${NC}"
        fi
    done
    
    echo -e "${GREEN}✓ Python环境测试完成${NC}"
    echo ""
}

test_optimization_config() {
    echo -e "${BLUE}[3/6] 测试优化配置...${NC}"
    
    if [ -f "comfyui_optimized_config.sh" ]; then
        echo -e "  加载优化配置..."
        source comfyui_optimized_config.sh validate
        
        echo -e "  环境变量检查:"
        echo -e "    CUDA_VISIBLE_DEVICES: ${CUDA_VISIBLE_DEVICES:-未设置}"
        echo -e "    PYTORCH_CUDA_ALLOC_CONF: ${PYTORCH_CUDA_ALLOC_CONF:-未设置}"
        echo -e "    PYTORCH_CUDA_MEMORY_FRACTION: ${PYTORCH_CUDA_MEMORY_FRACTION:-未设置}"
        echo -e "    OMP_NUM_THREADS: ${OMP_NUM_THREADS:-未设置}"
        echo -e "    MKL_NUM_THREADS: ${MKL_NUM_THREADS:-未设置}"
        
        # 测试环境变量
        echo -e "  环境变量测试:"
        if [ -n "$CUDA_VISIBLE_DEVICES" ]; then
            echo -e "    ${GREEN}✓ CUDA_VISIBLE_DEVICES 已设置${NC}"
        else
            echo -e "    ${YELLOW}⚠ CUDA_VISIBLE_DEVICES 未设置${NC}"
        fi
        
        if [ -n "$PYTORCH_CUDA_ALLOC_CONF" ]; then
            echo -e "    ${GREEN}✓ PYTORCH_CUDA_ALLOC_CONF 已设置${NC}"
        else
            echo -e "    ${YELLOW}⚠ PYTORCH_CUDA_ALLOC_CONF 未设置${NC}"
        fi
        
        echo -e "${GREEN}✓ 优化配置测试完成${NC}"
    else
        echo -e "  ${RED}优化配置文件不存在: comfyui_optimized_config.sh${NC}"
        echo -e "  请先创建优化配置文件"
    fi
    echo ""
}

test_comfyui_service() {
    echo -e "${BLUE}[4/6] 测试ComfyUI服务...${NC}"
    
    # 检查服务是否运行
    local pid=$(pgrep -f "python main.py" | head -1)
    if [ -n "$pid" ]; then
        echo -e "  ${GREEN}✓ ComfyUI服务正在运行 (PID: $pid)${NC}"
        
        # 检查端口
        if ss -tlnp 2>/dev/null | grep -q ":8188" || netstat -tlnp 2>/dev/null | grep -q ":8188"; then
            echo -e "  ${GREEN}✓ 端口8188正在监听${NC}"
        else
            echo -e "  ${YELLOW}⚠ 端口8188未监听${NC}"
        fi
        
        # 测试HTTP访问
        echo -e "  测试HTTP访问..."
        local http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8188 2>/dev/null || echo "000")
        if [[ "$http_code" =~ ^(200|302|301)$ ]]; then
            echo -e "  ${GREEN}✓ HTTP访问正常 (状态码: $http_code)${NC}"
        else
            echo -e "  ${RED}✗ HTTP访问失败 (状态码: $http_code)${NC}"
        fi
        
        # 检查进程资源使用
        echo -e "  进程资源使用:"
        ps -p $pid -o pid,ppid,user,%cpu,%mem,rss,vsz,etime,cmd --no-headers | sed 's/^/    /'
        
    else
        echo -e "  ${YELLOW}⚠ ComfyUI服务未运行${NC}"
        echo -e "  启动命令: ./start_optimized.sh"
    fi
    echo ""
}

test_performance() {
    echo -e "${BLUE}[5/6] 性能基准测试...${NC}"
    
    # CPU性能测试
    echo -e "  CPU性能测试 (单核):"
    local cpu_single=$(python3 -c "
import time
start = time.time()
sum = 0
for i in range(10000000):
    sum += i*i
print(f'    {(time.time() - start):.3f} 秒')
" 2>/dev/null || echo "测试失败")
    echo -e "    $cpu_single"
    
    # 内存性能测试
    echo -e "  内存性能测试:"
    local mem_test=$(python3 -c "
import time
import numpy as np
start = time.time()
# 分配1GB内存
data = np.random.rand(250000000).astype(np.float32)  # 1GB
result = np.sum(data)
print(f'    {(time.time() - start):.3f} 秒 (1GB数组求和)')
del data
" 2>/dev/null || echo "测试失败 (可能需要numpy)")
    echo -e "    $mem_test"
    
    # GPU性能测试 (如果可用)
    echo -e "  GPU性能测试:"
    local gpu_test=$(python3 -c "
import torch
import time
if torch.cuda.is_available():
    # 测试GPU矩阵乘法
    size = 4096
    a = torch.randn(size, size, device='cuda')
    b = torch.randn(size, size, device='cuda')
    
    # 预热
    for _ in range(10):
        torch.matmul(a, b)
    torch.cuda.synchronize()
    
    # 正式测试
    start = time.time()
    for _ in range(100):
        torch.matmul(a, b)
    torch.cuda.synchronize()
    elapsed = time.time() - start
    
    print(f'    {elapsed:.3f} 秒 (100次 {size}x{size} 矩阵乘法)')
    print(f'    平均: {(elapsed/100*1000):.1f} 毫秒/次')
else:
    print('    GPU不可用')
" 2>/dev/null || echo "测试失败")
    echo -e "    $gpu_test"
    
    echo -e "${GREEN}✓ 性能基准测试完成${NC}"
    echo ""
}

generate_report() {
    echo -e "${BLUE}[6/6] 生成测试报告...${NC}"
    
    local report_file="comfyui_optimization_test_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "=========================================="
        echo "ComfyUI 优化配置测试报告"
        echo "生成时间: $(date)"
        echo "=========================================="
        echo ""
        
        echo "=== 系统配置 ==="
        lscpu | grep -E "Model name|CPU\(s\)|Thread|Core"
        free -h
        if command -v nvidia-smi &> /dev/null; then
            nvidia-smi --query-gpu=name,memory.total,memory.free,driver_version --format=csv,noheader
        fi
        df -h /home/gpu/ComfyUI
        echo ""
        
        echo "=== Python环境 ==="
        python3 --version 2>/dev/null || echo "Python3未安装"
        python3 -c "
import torch
print(f'PyTorch版本: {torch.__version__}')
print(f'CUDA可用: {torch.cuda.is_available()}')
if torch.cuda.is_available():
    print(f'CUDA版本: {torch.version.cuda}')
    print(f'GPU数量: {torch.cuda.device_count()}')
    for i in range(torch.cuda.device_count()):
        print(f'GPU {i}: {torch.cuda.get_device_name(i)}')
" 2>/dev/null || echo "PyTorch测试失败"
        echo ""
        
        echo "=== 优化配置 ==="
        if [ -f "comfyui_optimized_config.sh" ]; then
            source comfyui_optimized_config.sh show 2>/dev/null || echo "无法加载优化配置"
        else
            echo "优化配置文件不存在"
        fi
        echo ""
        
        echo "=== 服务状态 ==="
        local pid=$(pgrep -f "python main.py" | head -1)
        if [ -n "$pid" ]; then
            echo "服务运行中 (PID: $pid)"
            ps -p $pid -o pid,ppid,user,%cpu,%mem,rss,vsz,etime,cmd --no-headers
            echo ""
            echo "端口状态:"
            ss -tlnp 2>/dev/null | grep ":8188" || netstat -tlnp 2>/dev/null | grep ":8188" || echo "端口未监听"
            echo ""
            echo "HTTP访问:"
            curl -s -o /dev/null -w "状态码: %{http_code}\n" http://localhost:8188 2>/dev/null || echo "HTTP访问失败"
        else
            echo "服务未运行"
        fi
        echo ""
        
        echo "=== 性能建议 ==="
        echo "1. 确保使用 --highvram 模式 (16GB显存)"
        echo "2. 使用 --force-fp16 加速推理"
        echo "3. 调整 PYTORCH_CUDA_ALLOC_CONF 优化显存分配"
        echo "4. 使用模型缓存减少加载时间"
        echo "5. 根据工作负载调整 OMP_NUM_THREADS"
        echo ""
        
        echo "=== 配置文件 ==="
        echo "优化配置: comfyui_optimized_config.sh"
        echo "启动脚本: start_optimized.sh"
        echo "监控脚本: monitor_performance_optimized.sh"
        echo "模型配置: model_optimization_config.yaml"
        echo ""
        
        echo "=== 使用说明 ==="
        echo "1. 启动优化服务: ./start_optimized.sh"
        echo "2. 监控性能: ./monitor_performance_optimized.sh"
        echo "3. 查看报告: ./monitor_performance_optimized.sh report"
        echo "4. 实时日志: ./monitor_performance_optimized.sh log"
        
    } > "$report_file"
    
    echo -e "  ${GREEN}测试报告已保存到: $report_file${NC}"
    echo ""
    echo -e "  ${BLUE}报告摘要:${NC}"
    tail -20 "$report_file"
    echo ""
    echo -e "${GREEN}✓ 测试报告生成完成${NC}"
}

# 主函数
main() {
    echo -e "${BLUE}开始ComfyUI优化配置测试...${NC}"
    echo ""
    
    # 运行所有测试
    test_system
    test_python
    test_optimization_config
    test_comfyui_service
    test_performance
    generate_report
    
    echo -e "${GREEN}==========================================${NC}"
    echo -e "${GREEN}所有测试完成！${NC}"
    echo -e "${GREEN}==========================================${NC}"
    echo ""
    echo -e "下一步操作:"
    echo -e "1. ${YELLOW}启动优化服务:${NC} ./start_optimized.sh"
    echo -e "2. ${YELLOW}监控性能:${NC} ./monitor_performance_optimized.sh"
    echo -e "3. ${YELLOW}查看测试报告:${NC} cat comfyui_optimization_test_*.txt"
    echo -e "4. ${YELLOW}调整配置:${NC} 编辑 comfyui_optimized_config.sh"
    echo ""
    echo -e "优化配置文件说明:"
    echo -e "  ${BLUE}comfyui_optimized_config.sh${NC} - 环境变量和启动参数"
    echo -e "  ${BLUE}model_optimization_config.yaml${NC} - 模型加载和推理优化"
    echo -e "  ${BLUE}start_optimized.sh${NC} - 优化启动脚本"
    echo -e "  ${BLUE}monitor_performance_optimized.sh${NC} - 性能监控脚本"
    echo ""
}

# 检查参数
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "用法: $0"
        echo ""
        echo "功能: 测试ComfyUI优化配置"
        echo ""
        echo "测试项目:"
        echo "  1. 系统配置测试"
        echo "  2. Python环境测试"
        echo "  3. 优化配置测试"
        echo "  4. 服务状态测试"
        echo "  5. 性能基准测试"
        echo "  6. 生成测试报告"
        echo ""
        echo "输出文件:"
        echo "  comfyui_optimization_test_YYYYMMDD_HHMMSS.txt"
        exit 0
        ;;
esac

# 运行主函数
main
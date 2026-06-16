# ComfyUI 常见问题与故障排除

## 🚨 常见问题

### 1. OOM（内存不足）错误

#### 问题描述
```
torch.OutOfMemoryError: Allocation on device 0 would exceed allowed memory.
Currently allocated: 14.60 GiB
Requested: 567.00 MiB
Device limit: 15.57 GiB
Free (according to CUDA): 8.38 MiB
```

#### 解决方案
1. **使用OOM优化启动脚本**:
   ```bash
   chmod +x scripts/start_simple_oom_fix.sh
   ./scripts/start_simple_oom_fix.sh
   ```

2. **调整内存限制**:
   ```bash
   # 修改 scripts/start_simple_oom_fix.sh
   export PYTORCH_CUDA_MEMORY_FRACTION=0.70  # 降低到70%
   ```

3. **使用内存优化节点**:
   - 在工作流中添加 `MemoryOptimizer` 节点
   - 配置 `cleanup_threshold_mb: 1024`
   - 设置 `operation: "sequential_execution"`

4. **紧急内存清理**:
   ```bash
   python scripts/emergency_memory_fix.py
   ```

### 2. 服务启动失败

#### 问题描述
服务无法启动或立即崩溃。

#### 解决方案
1. **检查端口占用**:
   ```bash
   netstat -tlnp | grep :8188
   # 如果端口被占用，停止占用进程或更改端口
   ```

2. **检查依赖**:
   ```bash
   pip install -r requirements.txt
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
   ```

3. **清理缓存**:
   ```bash
   python -m pip cache purge
   rm -rf __pycache__/
   ```

4. **检查Python版本**:
   ```bash
   python --version
   # 需要Python 3.8+
   ```

### 3. 自定义节点加载失败

#### 问题描述
```
[ERROR] An error occurred while retrieving information for the 'MemoryOptimizer' node.
```

#### 解决方案
1. **检查节点文件**:
   ```bash
   ls -la custom_nodes/memory_optimizer.py
   ```

2. **检查节点注册**:
   ```bash
   # 确保 custom_nodes/__init__.py 存在
   ls -la custom_nodes/__init__.py
   ```

3. **重启服务**:
   ```bash
   pkill -f "python main.py"
   ./scripts/start_simple_oom_fix.sh
   ```

4. **检查Python路径**:
   ```bash
   python -c "import sys; print(sys.path)"
   ```

### 4. 模型加载缓慢

#### 问题描述
模型加载时间过长，影响工作流执行。

#### 解决方案
1. **使用本地模型缓存**:
   ```bash
   # 检查模型缓存目录
   ls -la models/checkpoints/
   ```

2. **优化模型存储**:
   - 将模型放在SSD上
   - 使用符号链接到快速存储
   - 定期清理不需要的模型

3. **预加载常用模型**:
   ```bash
   # 在启动时预加载
   python -c "import comfy.model_management; comfy.model_management.load_models(['model1.safetensors', 'model2.safetensors'])"
   ```

### 5. 工作流执行错误

#### 问题描述
工作流执行过程中出现各种错误。

#### 解决方案
1. **检查工作流JSON**:
   ```bash
   python -m json.tool your_workflow.json
   ```

2. **简化工作流**:
   - 减少节点数量
   - 分批执行复杂操作
   - 使用子工作流

3. **更新节点**:
   ```bash
   # 更新自定义节点
   cd custom_nodes
   git pull origin main
   ```

### 6. 图像生成质量差

#### 问题描述
生成的图像质量不佳，有噪点或 artifacts。

#### 解决方案
1. **调整采样参数**:
   - 增加采样步数 (steps: 20-30)
   - 调整CFG scale (7.5-9.0)
   - 使用更好的采样器 (Euler, DPM++ 2M)

2. **检查模型质量**:
   ```bash
   # 检查模型文件完整性
   sha256sum models/checkpoints/*.safetensors
   ```

3. **使用VAE优化**:
   - 使用专门的VAE模型
   - 调整VAE参数

## 🔧 故障排除步骤

### 第一步：基础检查
1. **检查服务状态**:
   ```bash
   ps aux | grep "python main.py"
   curl http://localhost:8188
   ```

2. **检查日志**:
   ```bash
   tail -f comfyui.log
   ```

3. **检查GPU状态**:
   ```bash
   nvidia-smi
   ```

### 第二步：内存问题排查
1. **运行内存监控**:
   ```bash
   python /tmp/comfyui_memory_monitor.py
   ```

2. **检查内存使用**:
   ```bash
   watch -n 1 nvidia-smi
   ```

3. **清理GPU内存**:
   ```bash
   python scripts/emergency_memory_fix.py
   ```

### 第三步：配置检查
1. **检查启动配置**:
   ```bash
   cat scripts/start_simple_oom_fix.sh | grep "export\|python main.py"
   ```

2. **检查环境变量**:
   ```bash
   env | grep -i pytorch
   env | grep -i cuda
   ```

3. **检查模型路径**:
   ```bash
   ls -la models/checkpoints/
   ls -la models/vae/
   ls -la models/loras/
   ```

### 第四步：性能优化
1. **调整工作流**:
   - 减少同时加载的模型数量
   - 使用内存优化节点
   - 调整图像分辨率

2. **优化启动参数**:
   ```bash
   # 编辑 scripts/start_simple_oom_fix.sh
   # 调整 PYTORCH_CUDA_MEMORY_FRACTION
   # 调整 PYTORCH_CUDA_ALLOC_CONF
   ```

3. **使用性能监控**:
   ```bash
   # 监控CPU和内存使用
   htop
   # 监控GPU使用
   nvidia-smi -l 1
   ```

## 📊 性能监控

### 实时监控命令
```bash
# GPU监控
watch -n 1 nvidia-smi

# 内存监控
python /tmp/comfyui_memory_monitor.py

# 进程监控
htop

# 网络监控
iftop
```

### 日志分析
```bash
# 查看错误日志
grep -i error comfyui.log

# 查看警告日志
grep -i warning comfyui.log

# 查看内存相关日志
grep -i memory comfyui.log

# 查看启动日志
tail -f /tmp/comfyui_startup.log
```

### 性能基准测试
```bash
# 运行性能测试
python scripts/performance_test.sh

# 监控测试结果
tail -f performance_test.log
```

## 🛠️ 工具脚本

### 紧急修复脚本
```bash
# 紧急内存清理
python scripts/emergency_memory_fix.py

# GPU内存清理
python scripts/clean_gpu_memory.py

# Python缓存清理
./scripts/clean_python_cache.sh

# 实时GPU清理
python scripts/realtime_gpu_cleaner.py
```

### 性能测试脚本
```bash
# 性能测试
./scripts/performance_test.sh

# 性能监控
./scripts/monitor_performance.sh

# 优化性能监控
./scripts/monitor_performance_optimized.sh
```

### 环境优化脚本
```bash
# 环境优化
./scripts/optimize_env.sh

# 模型优化
./scripts/model_optimization.sh
```

## 🔄 维护流程

### 日常维护
1. **日志轮转**:
   ```bash
   # 备份旧日志
   mv comfyui.log comfyui.log.$(date +%Y%m%d)
   # 创建新日志
   touch comfyui.log
   ```

2. **缓存清理**:
   ```bash
   # 清理Python缓存
   find . -name "__pycache__" -type d -exec rm -rf {} +
   find . -name "*.pyc" -delete
   ```

3. **临时文件清理**:
   ```bash
   # 清理临时文件
   rm -f /tmp/comfyui_*.log
   rm -f /tmp/comfyui_*.pid
   ```

### 定期维护
1. **模型更新**:
   ```bash
   # 检查模型更新
   cd models/checkpoints
   # 下载新模型
   ```

2. **依赖更新**:
   ```bash
   # 更新Python包
   pip install --upgrade -r requirements.txt
   ```

3. **系统更新**:
   ```bash
   # 更新系统包
   sudo apt update && sudo apt upgrade
   # 更新NVIDIA驱动
   sudo apt install nvidia-driver-550
   ```

### 备份与恢复
1. **配置备份**:
   ```bash
   # 备份配置文件
   tar -czf comfyui_config_backup_$(date +%Y%m%d).tar.gz config/ custom_nodes/ scripts/
   ```

2. **模型备份**:
   ```bash
   # 备份模型文件
   tar -czf comfyui_models_backup_$(date +%Y%m%d).tar.gz models/
   ```

3. **工作流备份**:
   ```bash
   # 备份工作流
   tar -czf comfyui_workflows_backup_$(date +%Y%m%d).tar.gz input/ output/
   ```

## 📝 最佳实践

### 启动最佳实践
1. **总是使用OOM优化脚本**:
   ```bash
   ./scripts/start_simple_oom_fix.sh
   ```

2. **监控启动过程**:
   ```bash
   tail -f /tmp/comfyui_startup.log
   ```

3. **验证服务状态**:
   ```bash
   curl http://localhost:8188
   ps aux | grep "python main.py"
   ```

### 工作流最佳实践
1. **使用内存优化节点**:
   - 在模型之间添加 `MemoryOptimizer`
   - 配置适当的清理阈值
   - 使用顺序执行模式

2. **优化模型加载**:
   - 预加载常用模型
   - 使用模型缓存
   - 避免重复加载

3. **监控资源使用**:
   - 实时监控GPU内存
   - 监控CPU使用率
   - 监控磁盘IO

### 故障排除最佳实践
1. **记录问题**:
   - 记录错误信息
   - 记录复现步骤
   - 记录系统状态

2. **逐步排查**:
   - 从简单到复杂
   - 一次只改变一个变量
   - 记录每次更改的结果

3. **寻求帮助**:
   - 查看官方文档
   - 搜索类似问题
   - 在社区提问

## 🔗 相关资源

### 官方文档
- [ComfyUI GitHub](https://github.com/comfyanonymous/ComfyUI)
- [ComfyUI Wiki](https://github.com/comfyanonymous/ComfyUI/wiki)
- [ComfyUI Examples](https://github.com/comfyanonymous/ComfyUI_examples)

### 社区支持
- [ComfyUI Discord](https://discord.gg/comfyui)
- [ComfyUI Reddit](https://www.reddit.com/r/comfyui/)
- [ComfyUI 论坛](https://github.com/comfyanonymous/ComfyUI/discussions)

### 工具和扩展
- [ComfyUI Manager](https://github.com/ltdrdata/ComfyUI-Manager)
- [ComfyUI Custom Nodes](https://github.com/comfyanonymous/ComfyUI/discussions/categories/custom-nodes)
- [ComfyUI Workflows](https://github.com/comfyanonymous/ComfyUI/discussions/categories/workflows)

## 📞 支持渠道

### 问题报告
1. **GitHub Issues**:
   - [ComfyUI Issues](https://github.com/comfyanonymous/ComfyUI/issues)
   - 提供详细的错误信息
   - 包括复现步骤
   - 附上日志文件

2. **社区讨论**:
   - [GitHub Discussions](https://github.com/comfyanonymous/ComfyUI/discussions)
   - 分享解决方案
   - 讨论最佳实践
   - 寻求帮助

### 贡献指南
1. **代码贡献**:
   - Fork 仓库
   - 创建功能分支
   - 提交 Pull Request

2. **文档贡献**:
   - 更新文档
   - 添加示例
   - 翻译文档

3. **问题反馈**:
   - 报告 Bug
   - 提出功能建议
   - 分享使用经验

---

**最后更新**: 2026-06-15  
**维护者**: ComfyUI 优化团队  
**支持**: 通过 GitHub Issues 或社区讨论获取帮助
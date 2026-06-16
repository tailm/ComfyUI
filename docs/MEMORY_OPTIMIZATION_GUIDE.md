# ComfyUI 工作流内存优化指南

针对工作流 `http://192.168.50.228:8188/#ec7da562-7e21-4dac-a0d2-f4441e1efd3b` 的GPU内存优化方案

## 📋 概述

本指南介绍如何在ComfyUI工作流中优化6个模型的GPU内存使用，通过顺序执行和内存清理避免内存溢出(OOM)错误。

## 🎯 优化目标

- **工作流**: `http://192.168.50.228:8188/#ec7da562-7e21-4dac-a0d2-f4441e1efd3b`
- **模型数量**: 6个
- **目标**: 避免同时加载所有模型导致的内存溢出
- **策略**: 顺序执行 + 内存清理

## 🔧 安装的优化节点

### 1. 内存优化器 (MemoryOptimizer)
**功能**: 清理GPU内存并监控内存使用

**输入参数**:
- `operation`: 操作模式
  - `cleanup_only`: 仅清理内存
  - `cleanup_and_monitor`: 清理并监控
  - `sequential_execution`: 顺序执行模式
  - `aggressive_cleanup`: 激进清理
- `cleanup_threshold_mb`: 清理阈值(MB)，默认1024
- `delay_seconds`: 清理后的延迟时间(秒)，默认0.5
- `model_name`: 当前处理的模型名称（用于日志）
- `log_level`: 日志级别（none/basic/detailed/debug）

**输出**:
- `status`: 状态信息
- `memory_info`: 内存信息
- `freed_memory_mb`: 释放的内存(MB)

### 2. 顺序模型执行器 (SequentialModelExecutor)
**功能**: 按顺序执行多个模型并清理内存

**输入参数**:
- `workflow_id`: 工作流ID，默认 `ec7da562-7e21-4dac-a0d2-f4441e1efd3b`
- `model_count`: 模型数量，默认6
- `cleanup_threshold_mb`: 清理阈值(MB)，默认1024
- `delay_between_models`: 模型间延迟(秒)，默认1.0
- `execution_mode`: 执行模式（auto/manual/step_by_step）

**输出**:
- `execution_log`: 执行日志
- `memory_summary`: 内存摘要
- `total_execution_time`: 总执行时间(秒)

## 🚀 使用方法

### 方法1: 在工作流中插入内存优化节点

1. **在ComfyUI中打开工作流**: `http://192.168.50.228:8188/#ec7da562-7e21-4dac-a0d2-f4441e1efd3b`

2. **添加内存优化节点**:
   - 在节点搜索框中输入 "内存优化器" 或 "MemoryOptimizer"
   - 将节点拖放到工作流中

3. **配置节点**:
   - 设置 `operation` 为 `sequential_execution`
   - 设置 `cleanup_threshold_mb` 为 `1024` (1GB)
   - 设置 `log_level` 为 `detailed` 以查看详细日志

4. **连接节点**:
   - 将内存优化节点插入到每个模型节点之间
   - 或者在工作流开始和结束时各插入一个

### 方法2: 使用顺序模型执行器

1. **添加顺序模型执行器节点**:
   - 在节点搜索框中输入 "顺序模型执行器" 或 "SequentialModelExecutor"
   - 将节点拖放到工作流开始位置

2. **配置参数**:
   - `workflow_id`: `ec7da562-7e21-4dac-a0d2-f4441e1efd3b`
   - `model_count`: `6`
   - `cleanup_threshold_mb`: `1024`
   - `delay_between_models`: `1.0`
   - `execution_mode`: `auto`

3. **查看输出**:
   - 连接 `execution_log` 到文本显示节点
   - 连接 `memory_summary` 到另一个文本显示节点

### 方法3: 组合使用

对于6个模型的工作流，建议的节点布局:

```
[顺序模型执行器] → [模型1] → [内存优化器] → [模型2] → [内存优化器] → [模型3] → 
[内存优化器] → [模型4] → [内存优化器] → [模型5] → [内存优化器] → [模型6] → [内存优化器]
```

## ⚙️ 推荐配置

### 针对RTX 4070 Ti SUPER 16GB的优化配置:

```yaml
内存优化器配置:
  operation: sequential_execution
  cleanup_threshold_mb: 1024  # 1GB阈值
  delay_seconds: 0.5
  log_level: detailed

顺序模型执行器配置:
  workflow_id: ec7da562-7e21-4dac-a0d2-f4441e1efd3b
  model_count: 6
  cleanup_threshold_mb: 1024
  delay_between_models: 1.0
  execution_mode: auto
```

### 模型执行顺序建议:

1. **文本编码器** (约800MB) → 清理
2. **潜在扩散模型** (约2.5GB) → 清理
3. **VAE解码器** (约1.2GB) → 清理
4. **ControlNet** (约1.8GB) → 清理
5. **超分辨率模型** (约1.5GB) → 清理
6. **后处理模型** (约600MB) → 最终清理

## 📊 监控和调试

### 查看日志:
1. 在ComfyUI控制台查看节点输出
2. 设置 `log_level` 为 `detailed` 或 `debug` 获取更多信息
3. 查看内存使用统计

### 内存监控命令:
```bash
# 实时监控GPU内存
watch -n 1 nvidia-smi

# 查看详细内存信息
nvidia-smi --query-gpu=memory.total,memory.used,memory.free --format=csv
```

### 性能指标:
- **峰值内存使用**: 不应超过14GB (为系统保留2GB)
- **每个模型后释放的内存**: 应大于500MB
- **总执行时间**: 与原始工作流相比增加不超过20%

## 🔧 故障排除

### 问题1: 节点未显示
**解决方案**:
1. 重启ComfyUI服务
2. 检查 `custom_nodes/memory_optimizer.py` 文件是否存在
3. 查看ComfyUI启动日志是否有错误

### 问题2: 内存清理无效
**解决方案**:
1. 增加 `cleanup_threshold_mb` 值
2. 使用 `aggressive_cleanup` 模式
3. 增加 `delay_seconds` 给系统更多时间释放内存

### 问题3: 性能下降
**解决方案**:
1. 减少 `delay_between_models` 值
2. 使用 `cleanup_only` 模式减少清理开销
3. 调整 `cleanup_threshold_mb` 避免频繁清理

## 🎯 最佳实践

1. **测试阶段**:
   - 使用 `log_level: debug` 查看详细内存信息
   - 从少量模型开始测试
   - 逐步增加模型数量

2. **生产阶段**:
   - 使用 `log_level: basic` 减少日志输出
   - 根据实际内存使用调整阈值
   - 监控峰值内存使用

3. **优化建议**:
   - 在内存密集型模型后插入内存优化节点
   - 为大模型设置更高的清理阈值
   - 为小模型设置较低的清理阈值

## 📈 预期效果

### 内存使用优化:
- **原始**: 同时加载6个模型 ≈ 7.4GB
- **优化后**: 单个最大模型 ≈ 2.5GB
- **内存节省**: 约65%

### 稳定性提升:
- 减少OOM错误
- 更稳定的长时间运行
- 更好的多任务处理能力

### 性能影响:
- 增加约10-20%的执行时间
- 显著降低内存峰值
- 提高系统稳定性

## 🔄 更新和维护

### 更新节点:
```bash
cd /home/gpu/ComfyUI
# 备份现有配置
cp custom_nodes/memory_optimizer.py custom_nodes/memory_optimizer.py.backup
# 更新文件
# 然后重启ComfyUI服务
```

### 重启服务:
```bash
cd /home/gpu/ComfyUI
pkill -f "python main.py"
./start_video_optimized.sh
```

## 📞 支持

如有问题，请检查:
1. ComfyUI服务日志: `/tmp/comfyui_start.log`
2. 节点输出日志
3. GPU内存状态: `nvidia-smi`

通过以上优化，您的工作流应该能够更稳定地运行，避免内存溢出错误。🎯
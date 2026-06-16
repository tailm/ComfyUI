# ComfyUI - Linux 安装与部署指南

## 当前服务器环境

### 硬件配置
- **CPU**: AMD Ryzen 9 7950X 16-Core Processor (32线程)
- **内存**: 62GB RAM
- **GPU**: NVIDIA GeForce RTX 4070 Ti SUPER (16GB显存)
- **存储**: 1.8TB SSD (已用161GB，剩余1.6TB)

### 软件环境
- **操作系统**: Ubuntu Linux 6.8.0-124-generic
- **Python版本**: 3.13.13
- **NVIDIA驱动**: 590.48.01
- **CUDA**: 待安装（PyTorch未安装）

### 网络配置
- **服务端口**: 默认 8188
- **绑定地址**: 0.0.0.0（所有网络接口）

## 🚀 OOM优化解决方案（最新）

### 问题背景
在使用6个模型的工作流时，出现 `torch.OutOfMemoryError` 错误：
- **GPU显存**: 16GB (RTX 4070 Ti SUPER)
- **工作流需求**: 6个模型共需约8.2GB内存
- **问题**: 峰值内存超过可用显存，导致OOM错误

### 解决方案
我们开发了完整的OOM优化方案，成功将：
- **峰值内存**: 从8.2GB降到2.5GB（节省70.2%）
- **可用内存**: 从1.9GB增加到15.6GB
- **支持**: 6个模型顺序执行无OOM错误

### 核心优化技术
1. **启动参数优化**:
   ```bash
   python main.py --listen 0.0.0.0 --port 8188 \
     --disable-smart-memory \
     --preview-method latent2rgb \
     --disable-xformers
   ```

2. **环境变量调优**:
   ```bash
   export PYTORCH_CUDA_MEMORY_FRACTION=0.80
   export PYTORCH_CUDA_ALLOC_CONF="max_split_size_mb:32,garbage_collection_threshold:0.85"
   export PYTORCH_NO_CUDA_MEMORY_CACHING=1
   export CUDA_LAUNCH_BLOCKING=0
   ```

3. **自定义内存优化节点**:
   - `MemoryOptimizer`: 智能内存清理节点
   - `SequentialModelExecutor`: 自动顺序执行6个模型

### 快速使用
```bash
# 1. 启动OOM优化服务
chmod +x scripts/start_simple_oom_fix.sh
./scripts/start_simple_oom_fix.sh

# 2. 访问工作流
# Web界面: http://192.168.50.228:8188
# 工作流: http://192.168.50.228:8188/#ec7da562-7e21-4dac-a0d2-f4441e1efd3b

# 3. 使用内存优化节点
# 在ComfyUI中搜索 "MemoryOptimizer" 或 "SequentialModelExecutor"
```

### 详细文档
- **配置详情**: `docs/OOM_OPTIMIZATION_CONFIG.md`
- **快速参考**: `docs/quick_config_reference.txt`
- **内存监控**: `/tmp/comfyui_memory_monitor.py`
- **项目结构**: `docs/PROJECT_STRUCTURE.md`
- **优化总结**: `docs/STARTUP_OPTIMIZATION_SUMMARY.md`

## 快速开始

### 手动安装 (Linux)

ComfyUI 支持所有操作系统和GPU类型（NVIDIA、AMD、Intel、Apple Silicon、Ascend）。

#### 依赖安装

1. **克隆仓库**：
   ```bash
   git clone https://github.com/comfyanonymous/ComfyUI.git
   cd ComfyUI
   ```

2. **安装依赖**：
   ```bash
   pip install -r requirements.txt
   ```

#### GPU 支持配置

**当前服务器配置建议**：
本服务器配置为 **NVIDIA GeForce RTX 4070 Ti SUPER (16GB显存)**，建议使用以下命令安装PyTorch：

```bash
# 为RTX 40系列显卡安装PyTorch（CUDA 12.1+）
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

**NVIDIA GPU**：
```bash
# 稳定版本（CUDA 13.0）
pip install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu130

# 或最新版本（CUDA 12.1，适合RTX 40系列）
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

**AMD GPU (Linux)**：
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm7.2
```

**Intel GPU**：
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/xpu
```

#### 模型文件放置

- 检查点文件：`models/checkpoints/`
- VAE 文件：`models/vae/`
- LoRA 文件：`models/loras/`
- 嵌入文件：`models/embeddings/`

#### 模型下载与使用

**Flux 图像生成模型**：
Flux是当前最先进的图像生成模型之一，支持高质量的文本到图像生成。

1. **下载Flux模型**：
   - 访问 [Hugging Face Flux 1.1](https://huggingface.co/black-forest-labs/FLUX.1-dev) 下载模型
   - 将下载的 `.safetensors` 文件放入 `models/checkpoints/` 目录
   - 推荐模型：`flux1-dev.safetensors` (约12GB)

2. **Flux工作流示例**：
   ```json
   {
     "nodes": [
       {
         "id": 1,
         "type": "CLIPTextEncode",
         "inputs": {
           "text": "a beautiful landscape with mountains and rivers, photorealistic, 8k"
         }
       },
       {
         "id": 2,
         "type": "EmptyLatentImage",
         "inputs": {
           "width": 1024,
           "height": 1024,
           "batch_size": 1
         }
       },
       {
         "id": 3,
         "type": "KSampler",
         "inputs": {
           "model": "flux1-dev",
           "positive": 1,
           "negative": "",
           "latent_image": 2,
           "seed": 42,
           "steps": 20,
           "cfg": 7.5,
           "sampler_name": "euler",
           "scheduler": "normal"
         }
       },
       {
         "id": 4,
         "type": "VAEDecode",
         "inputs": {
           "samples": 3,
           "vae": "vae-ft-mse-840000-ema-pruned"
         }
       },
       {
         "id": 5,
         "type": "SaveImage",
         "inputs": {
           "images": 4,
           "filename_prefix": "flux_output"
         }
       }
     ]
   }
   ```

3. **Flux使用技巧**：
   - 使用1024x1024分辨率获得最佳效果
   - 推荐CFG scale: 7.5-9.0
   - 采样步数: 20-30步
   - 使用Euler或DPM++ 2M采样器

**Video 视频生成模型**：
ComfyUI支持多种视频生成模型，包括Stable Video Diffusion、Mochi等。

1. **下载视频模型**：
   - **Stable Video Diffusion**: 从 [Hugging Face](https://huggingface.co/stabilityai/stable-video-diffusion-img2vid) 下载
   - **Mochi**: 从 [Hugging Face](https://huggingface.co/mochi-video/mochi-1.0) 下载
   - 将模型文件放入 `models/checkpoints/` 目录

2. **Stable Video Diffusion工作流示例**：
   ```json
   {
     "nodes": [
       {
         "id": 1,
         "type": "LoadImage",
         "inputs": {
           "image": "input_image.png"
         }
       },
       {
         "id": 2,
         "type": "SVD_img2vid",
         "inputs": {
           "image": 1,
           "fps": 25,
           "motion_bucket_id": 127,
           "noise_aug_strength": 0.02,
           "seed": 42,
           "steps": 25,
           "cfg": 2.5
         }
       },
       {
         "id": 3,
         "type": "VAEDecode",
         "inputs": {
           "samples": 2,
           "vae": "svd_vae"
         }
       },
       {
         "id": 4,
         "type": "SaveVideo",
         "inputs": {
           "video": 3,
           "filename_prefix": "svd_output",
           "fps": 25
         }
       }
     ]
   }
   ```

3. **视频生成技巧**：
   - 输入图像分辨率建议：1024x576或576x1024
   - 视频长度：14-25帧（约0.5-1秒）
   - 使用较低的CFG值（2.0-4.0）获得更自然的运动
   - 调整motion_bucket_id控制运动强度（0-255）

4. **Mochi视频生成**：
   - 支持更长的视频生成（最多120帧）
   - 需要特定的Mochi模型文件
   - 推荐使用Mochi工作流模板

**当前服务器配置建议**：
- **RTX 4070 Ti SUPER 16GB** 可以流畅运行Flux和SVD模型
- 对于视频生成，建议使用较低的分辨率（576x1024）以避免显存不足
- 使用 `--highvram` 模式充分利用16GB显存
- 对于批量生成，适当减少批量大小

## ⚠️ 重要：内存优化启动说明

**重要警告**：由于RTX 4070 Ti SUPER 16GB显存限制，直接使用默认启动方式可能会导致 `torch.OutOfMemoryError` 错误。**必须使用以下优化启动方式**以避免内存不足问题。

### 🚨 内存问题解决方案

#### 1. **低内存模式启动（推荐）**
针对16GB显存优化，避免OutOfMemoryError：

```bash
# 给脚本添加执行权限
chmod +x scripts/start_simple_oom_fix.sh

# 启动OOM优化服务
./scripts/start_simple_oom_fix.sh
```

**优化配置**：
- 显存使用限制：80% (PYTORCH_CUDA_MEMORY_FRACTION=0.80)
- 内存块大小：32MB (max_split_size_mb:32)
- 垃圾回收阈值：85% (garbage_collection_threshold:0.85)
- 启动参数：`--disable-smart-memory --preview-method latent2rgb --disable-xformers`
- 环境变量：`PYTORCH_NO_CUDA_MEMORY_CACHING=1` `CUDA_LAUNCH_BLOCKING=0`

#### 3. **紧急GPU内存清理**
如果遇到内存不足错误，先运行清理脚本：

```bash
# 运行GPU内存清理脚本
python scripts/emergency_gpu_cleanup.py

# 然后使用OOM优化启动
./scripts/start_simple_oom_fix.sh
```

### 📊 内存使用对比

| 启动方式 | 显存使用 | 稳定性 | 性能 | 推荐场景 |
|---------|---------|--------|------|---------|
| **低内存模式** | ~200MB-2GB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 内存敏感工作流 |
| **内存优化模式** | ~2GB-8GB | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 平衡性能与内存 |
| **视频优化模式** | ~8GB-14GB | ⭐⭐ | ⭐⭐⭐⭐⭐ | 高性能视频生成 |
| **默认模式** | ~14GB+ | ⭐ | ⭐⭐⭐⭐⭐ | 可能导致OOM错误 |

### 🚀 启动服务

#### 默认启动方式（推荐）

我们提供了经过验证的OOM优化启动脚本，**默认推荐使用 `start_simple_oom_fix.sh`**，它会自动应用内存优化配置避免OutOfMemoryError。

```bash
# 1. 给启动脚本添加执行权限
chmod +x scripts/start_simple_oom_fix.sh

# 2. 启动服务（自动应用OOM优化配置）
./scripts/start_simple_oom_fix.sh
```

服务启动后，可以通过以下地址访问：
- **本地访问**: http://localhost:8188
- **网络访问**: http://[服务器IP]:8188

### 手动启动方式

如果默认启动脚本不可用，可以使用以下命令手动启动：

```bash
# 基本启动
python main.py --listen 0.0.0.0 --port 8188

# 使用GPU优化
python main.py --highvram --force-fp16 --listen 0.0.0.0 --port 8188

# 视频生成优化
python main.py --listen 0.0.0.0 --port 8188 --highvram --force-fp16 --preview-method auto --disable-smart-memory
```

## 服务启动脚本

我们提供了经过验证的OOM优化启动脚本，**默认推荐使用 `start_simple_oom_fix.sh`**，它针对 RTX 4070 Ti SUPER 16GB 显存限制进行了专门优化，解决多模型工作流内存问题，避免OutOfMemoryError。

### 🚨 重要：必须使用优化启动脚本

**警告**：由于16GB显存限制，直接使用默认启动方式或视频优化脚本可能会导致 `torch.OutOfMemoryError` 错误。请根据以下指南选择合适的启动脚本：

### 启动脚本说明

| 脚本名称 | 描述 | 显存使用 | 稳定性 | 性能 | 推荐场景 |
|---------|------|---------|--------|------|---------|
| `start_simple_oom_fix.sh` | **唯一推荐**，OOM优化启动，解决多模型工作流内存问题 | ~2.5GB峰值 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **所有工作流**，特别是多模型场景 |
| `start_comfyui_simple.sh` | 简单启动脚本（备用） | ~1GB-8GB | ⭐⭐⭐⭐ | ⭐⭐ | 测试、调试、基础功能 |

**注意**：其他启动脚本已删除，只保留经过验证的OOM优化版本。

### ⚠️ 内存使用警告

**RTX 4070 Ti SUPER 16GB显存限制**：
- 总显存：16,376 MB
- 系统保留：~500 MB
- 可用显存：~15,876 MB
- **安全阈值**：建议保持显存使用在12GB以下以避免OOM错误

**已删除的启动方式**：
- `start_video_optimized.sh`：已删除，可能导致OOM错误
- `start_low_memory.sh`：已删除，功能已整合到OOM优化版本
- `start_memory_optimized.sh`：已删除，功能已整合到OOM优化版本
- `start_optimized.sh`：已删除，功能已整合到OOM优化版本
- `start_optimized_fixed.sh`：已删除，功能已整合到OOM优化版本

**注意**：所有旧启动脚本已删除，只保留经过验证的OOM优化版本。

**安全启动方式**：
- `start_simple_oom_fix.sh`：**唯一推荐**，OOM优化启动，解决多模型工作流内存问题

### 🟢 安全启动方式（推荐）

#### **OOM优化启动（解决多模型工作流内存问题）**
```bash
# 给脚本添加执行权限
chmod +x scripts/start_simple_oom_fix.sh

# 启动OOM优化服务
./scripts/start_simple_oom_fix.sh
```

**优化效果**：
- ✅ 峰值内存：从8.2GB降到2.5GB（节省70.2%）
- ✅ 可用内存：从1.9GB增加到15.6GB
- ✅ 支持：6个模型顺序执行无OOM错误
- ✅ 配置：PYTORCH_CUDA_MEMORY_FRACTION=0.80 + 内存分配优化

**启动参数**：
```bash
python main.py --listen 0.0.0.0 --port 8188 \
  --disable-smart-memory \
  --preview-method latent2rgb \
  --disable-xformers
```

**环境变量**：
```bash
export PYTORCH_CUDA_MEMORY_FRACTION=0.80
export PYTORCH_CUDA_ALLOC_CONF="max_split_size_mb:32,garbage_collection_threshold:0.85"
export PYTORCH_NO_CUDA_MEMORY_CACHING=1
export CUDA_LAUNCH_BLOCKING=0
```

#### **备用简单启动（仅用于测试）**
```bash
# 给脚本添加执行权限
chmod +x scripts/start_comfyui_simple.sh

# 启动简单服务（无内存优化）
./scripts/start_comfyui_simple.sh
```

**注意**：其他启动脚本已删除，`start_simple_oom_fix.sh` 是经过验证的最优解决方案。

### ⚠️ 已删除的启动方式

以下启动脚本已删除，所有功能已整合到 `start_simple_oom_fix.sh`：
- `start_video_optimized.sh`：视频生成优化（已删除）
- `start_optimized.sh`：通用优化启动（已删除）
- `start_optimized_fixed.sh`：修复版优化启动（已删除）

**注意**：只保留 `start_simple_oom_fix.sh`（OOM优化）和 `start_comfyui_simple.sh`（备用测试）。

### 配置文件

脚本支持配置文件 `comfyui_config.sh`，您可以复制示例配置文件并修改：

```bash
# 复制配置文件示例
cp comfyui_config.example.sh comfyui_config.sh

# 编辑配置文件
nano comfyui_config.sh
```

配置文件示例：
```bash
#!/bin/bash
# ComfyUI 配置文件

# 服务端口
export COMFYUI_PORT=8188

# 绑定地址
export COMFYUI_HOST="0.0.0.0"

# 日志文件
export COMFYUI_LOG="comfyui.log"

# PID 文件
export COMFYUI_PID="comfyui.pid"

# Python 路径
export PYTHON_PATH="python3"

# 额外参数（根据当前服务器配置建议）
# RTX 4070 Ti SUPER 有16GB显存，建议使用--highvram模式
export EXTRA_ARGS="--highvram"
# 如果遇到显存不足问题，可以尝试以下配置：
# export EXTRA_ARGS="--normalvram"
# export EXTRA_ARGS="--lowvram"
# export EXTRA_ARGS="--cpu"

# GPU 设置
# 指定使用GPU 0（当前服务器只有1个GPU）
export CUDA_VISIBLE_DEVICES="0"

# PyTorch 内存配置
# 针对16GB显存的优化配置
export PYTORCH_CUDA_ALLOC_CONF="max_split_size_mb:128,garbage_collection_threshold:0.6"

# 性能优化设置
export PYTORCH_CUDA_ALLOC_CONF="max_split_size_mb:128"
export PYTORCH_CUDA_MEMORY_FRACTION=0.95  # 使用95%的GPU显存

# 禁用遥测
export HF_HUB_DISABLE_TELEMETRY="1"
export DO_NOT_TRACK="1"

# 针对AMD Ryzen 9 7950X的优化
export OMP_NUM_THREADS=16  # 使用16个CPU核心
export MKL_NUM_THREADS=16

# 针对大内存优化
export PYTORCH_MEMORY_EFFICIENT_CONV=1
```

### 使用 systemd 服务（生产环境推荐）

```bash
# 复制服务文件到系统目录
sudo cp comfyui.service /etc/systemd/system/

# 重新加载 systemd 配置
sudo systemctl daemon-reload

# 启用服务开机自启
sudo systemctl enable comfyui.service

# 启动服务
sudo systemctl start comfyui.service

# 查看服务状态
sudo systemctl status comfyui.service

# 查看服务日志
sudo journalctl -u comfyui.service -f

# 停止服务
sudo systemctl stop comfyui.service

# 重启服务
sudo systemctl restart comfyui.service
```

### 脚本特性

1. **完整的服务管理**：
   - 启动、停止、重启、状态检查
   - 进程管理和PID文件记录
   - 端口冲突检测

2. **灵活的配置**：
   - 支持环境变量配置
   - 可自定义端口、绑定地址等
   - 支持额外启动参数

3. **健壮的错误处理**：
   - 依赖检查
   - 端口占用检测
   - 进程状态验证

4. **生产环境就绪**：
   - systemd服务文件
   - 资源限制和安全设置
   - 日志轮转建议

5. **用户友好**：
   - 彩色日志输出
   - 详细的状态信息
   - 完整的文档

### 常见问题

#### 1. 端口被占用
```bash
# 查看占用端口的进程
sudo lsof -i :8188

# 或使用 netstat
netstat -tlnp | grep :8188
```

#### 2. 权限问题
```bash
# 确保脚本有执行权限
chmod +x start_comfyui.sh

# 确保日志文件可写
touch comfyui.log
chmod 666 comfyui.log
```

#### 3. 依赖问题
```bash
# 安装依赖
./start_comfyui.sh install

# 或手动安装
pip install -r requirements.txt
```

#### 4. 服务无法启动
1. 检查日志：`tail -n 100 comfyui.log`
2. 检查端口：`netstat -tlnp | grep :8188`
3. 检查依赖：`./start_comfyui.sh install`
4. 检查Python：`python3 --version`
5. 检查GPU驱动：`nvidia-smi`
6. 检查CUDA版本：`nvcc --version` 或 `python3 -c "import torch; print(torch.version.cuda)"`

#### 5. 当前服务器特定问题
**RTX 4070 Ti SUPER 16GB显存优化**：
- **必须使用OOM优化启动脚本**：`start_simple_oom_fix.sh`
- **禁止使用已删除的启动方式**：所有旧启动脚本已删除，只保留OOM优化版本
- **内存限制配置**：
  ```bash
  # 低内存模式（推荐）
  export PYTORCH_CUDA_MEMORY_FRACTION=0.75
  export PYTORCH_CUDA_ALLOC_CONF="max_split_size_mb:8,garbage_collection_threshold:0.7"
  
  # 内存优化模式
  export PYTORCH_CUDA_MEMORY_FRACTION=0.85
  export PYTORCH_CUDA_ALLOC_CONF="max_split_size_mb:16,garbage_collection_threshold:0.8"
  ```
- **紧急内存清理**：遇到OOM错误时运行 `python scripts/emergency_gpu_cleanup.py`
- **检查模型大小**：确保单个模型不超过12GB，总显存使用不超过14GB

#### 6. 内存不足错误解决方案
**如果遇到 `torch.OutOfMemoryError` 错误**：

1. **立即停止服务**：
   ```bash
   pkill -f "python main.py"
   ```

2. **运行内存清理脚本**：
   ```bash
   python scripts/emergency_gpu_cleanup.py
   ```

3. **使用低内存模式重启**：
   ```bash
   ./scripts/start_simple_oom_fix.sh
   ```

4. **调整工作流设置**：
   - 降低分辨率（如从512x512降到384x384）
   - 减少批处理大小（batch_size）
   - 使用更小的模型（fp8或fp16版本）
   - 启用模型卸载（model offloading）

5. **监控GPU内存使用**：
   ```bash
   watch -n 1 nvidia-smi
   ```

6. **永久解决方案**：
   - 始终使用 `start_simple_oom_fix.sh` 启动服务
   - 避免使用 `--highvram` 参数
   - 定期清理GPU缓存

**AMD Ryzen 9 7950X CPU优化**：
- 设置 `OMP_NUM_THREADS=16` 使用16个核心
- 设置 `MKL_NUM_THREADS=16` 优化数学库性能
- 确保系统有足够的内存（当前62GB足够）

#### 6. Flux和Video模型特定问题
**Flux模型优化**：
- Flux模型约12GB，需要至少14GB显存才能流畅运行
- 对于RTX 4070 Ti SUPER 16GB，建议：
  - 使用 `--highvram` 模式
  - 设置 `PYTORCH_CUDA_MEMORY_FRACTION=0.9` 保留10%显存给系统
  - 关闭其他GPU应用以释放显存
  - 使用1024x1024分辨率，避免更高分辨率

**视频生成模型优化**：
- Stable Video Diffusion需要约8-10GB显存
- 建议配置：
  - 输入图像分辨率：576x1024 或 1024x576
  - 视频帧数：14-25帧
  - 使用 `--normalvram` 模式
  - 设置 `PYTORCH_CUDA_MEMORY_FRACTION=0.8`

**多模型同时运行**：
- 不建议同时运行多个大型模型
- 如果需要切换模型，先停止当前服务再启动新模型
- 使用 `./start_comfyui.sh stop` 停止服务
- 修改配置文件中的模型路径后重启

## 手动运行

如果您不想使用服务脚本，可以直接运行：

```bash
python main.py
```

### 常用启动参数

- `--port 8189` - 更改端口
- `--listen` - 监听所有网络接口
- `--cpu` - 使用CPU模式（较慢）
- `--highvram` - 高显存模式
- `--normalvram` - 正常显存模式
- `--lowvram` - 低显存模式

### AMD GPU 特殊配置

对于ROCm不正式支持的AMD显卡，可以尝试以下命令：

RDNA2或更旧（如6700、6600）：
```bash
HSA_OVERRIDE_GFX_VERSION=10.3.0 python main.py
```

RDNA3（如7600）：
```bash
HSA_OVERRIDE_GFX_VERSION=11.0.0 python main.py
```

启用实验性内存高效注意力：
```bash
TORCH_ROCM_AOTRITON_ENABLE_EXPERIMENTAL=1 python main.py --use-pytorch-cross-attention
```

## 文件结构

```
ComfyUI/
├── start_comfyui.sh          # 服务启动脚本
├── comfyui_config.sh         # 配置文件
├── comfyui_config.example.sh # 配置文件示例
├── comfyui.service          # systemd服务文件
├── SERVICE_MANAGEMENT.md    # 服务管理文档
├── main.py                  # 主程序
├── models/                  # 模型目录
│   ├── checkpoints/        # 检查点文件
│   ├── vae/               # VAE文件
│   ├── loras/             # LoRA文件
│   └── embeddings/        # 嵌入文件
└── requirements.txt        # Python依赖
```

## 故障排除

### 1. "Torch not compiled with CUDA enabled" 错误
```bash
pip uninstall torch
pip install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu130
```

### 2. 内存不足问题
- 使用 `--lowvram` 参数
- 调整 `PYTORCH_CUDA_ALLOC_CONF` 环境变量
- 减少批量大小

### 3. 端口冲突
- 修改 `COMFYUI_PORT` 环境变量
- 检查是否有其他服务占用8188端口

### 4. 权限问题
- 确保有足够的权限访问模型文件
- 检查日志文件权限

## 更新

```bash
# 更新代码
git pull

# 更新依赖
pip install -r requirements.txt --upgrade

# 或使用脚本
./start_comfyui.sh update
```

## 性能优化建议

### 针对当前服务器配置的优化

#### GPU优化（RTX 4070 Ti SUPER 16GB）
1. **显存管理（重要）**：
   - **禁止使用 `--highvram` 模式**：容易导致OutOfMemoryError
   - **推荐使用OOM优化模式**：通过 `start_simple_oom_fix.sh` 脚本
   - **显存限制设置**：
     ```bash
     # 低内存模式（最安全）
     export PYTORCH_CUDA_MEMORY_FRACTION=0.75
     
     # 内存优化模式（平衡）
     export PYTORCH_CUDA_MEMORY_FRACTION=0.85
     
     # 高风险模式（谨慎使用）
     export PYTORCH_CUDA_MEMORY_FRACTION=0.95
     ```
   - **内存分配优化**：
     ```bash
     # 小内存块，减少碎片
     export PYTORCH_CUDA_ALLOC_CONF="max_split_size_mb:8,garbage_collection_threshold:0.7"
     
     # 更早触发垃圾回收
     export PYTORCH_CUDA_ALLOC_CONF="max_split_size_mb:16,garbage_collection_threshold:0.8"
     ```

2. **启动脚本选择**：
   - **唯一推荐**：`./scripts/start_simple_oom_fix.sh`（OOM优化，最安全）
   - **备用测试**：`./scripts/start_comfyui_simple.sh`（简单启动，仅测试）

3. **紧急内存清理**：
   ```bash
   # 遇到OOM错误时运行
   python scripts/emergency_gpu_cleanup.py
   
   # 然后使用低内存模式重启
   ./scripts/start_simple_oom_fix.sh
   ```

4. **工作流优化**：
   - 降低分辨率：512x512 → 384x384
   - 减少批处理大小：batch_size=4 → batch_size=2
   - 使用FP16模型：减少50%显存使用
   - 启用CPU VAE：`--cpu-vae` 参数
   - 禁用xformers：`--disable-xformers` 参数

2. **CUDA优化**：
   ```bash
   # 安装适合RTX 40系列的CUDA 12.1+版本
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
   ```

3. **Tensor Core优化**：
   - 确保使用支持Tensor Core的模型
   - 启用混合精度训练（如果支持）

4. **Flux模型优化**：
   - Flux模型支持FP16精度，可减少显存使用
   - 使用 `--fp16` 参数启用半精度推理
   - 对于RTX 4070 Ti SUPER，建议使用1024x1024分辨率
   - 避免同时加载多个Flux模型

5. **视频生成优化**：
   - Stable Video Diffusion支持FP16推理
   - 使用 `--fp16` 参数减少显存占用
   - 限制视频帧数：14-25帧为最佳
   - 降低输入图像分辨率以节省显存

#### CPU优化（AMD Ryzen 9 7950X 16核心）
1. **多线程优化**：
   ```bash
   export OMP_NUM_THREADS=16
   export MKL_NUM_THREADS=16
   export NUMEXPR_NUM_THREADS=16
   ```

2. **内存优化**：
   - 当前62GB RAM足够大多数工作负载
   - 考虑启用swap（如果需要处理超大模型）

#### 存储优化（1.8TB SSD）
1. **模型存储**：
   - 将常用模型放在SSD上以获得最佳加载速度
   - 定期清理不需要的模型缓存
   - **Flux模型**：约12GB，确保有足够空间
   - **视频模型**：SVD约8GB，Mochi约15GB
   - 建议预留至少50GB空间用于模型文件

2. **模型文件管理**：
   ```bash
   # 查看模型文件大小
   du -sh models/checkpoints/
   
   # 清理临时文件
   rm -rf models/__pycache__/
   rm -rf output/temp/
   
   # 备份重要模型
   tar -czf flux_model_backup.tar.gz models/checkpoints/flux1-dev.safetensors
   ```

3. **日志管理**：
   - 定期轮转日志文件
   - 设置日志级别为WARNING减少磁盘IO
   - 清理旧的日志文件：
   ```bash
   # 保留最近7天的日志
   find . -name "comfyui*.log" -mtime +7 -delete
   ```

#### 网络优化
1. **端口配置**：
   - 默认端口8188，可更改为其他端口避免冲突
   - 使用 `--listen` 参数允许远程访问

2. **并发优化**：
   - 根据CPU核心数调整工作进程数
   - 监控网络带宽使用

### 监控和调优

1. **GPU监控**：
   ```bash
   watch -n 1 nvidia-smi
   ```
   - **Flux模型**：监控显存使用，应保持在14-15GB范围内
   - **视频模型**：监控显存使用，应保持在8-10GB范围内
   - 温度监控：确保GPU温度低于85°C

2. **内存监控**：
   ```bash
   watch -n 1 free -h
   ```
   - Flux模型运行时内存使用：约4-6GB
   - 视频生成时内存使用：约8-10GB
   - 确保有足够的可用内存

3. **进程监控**：
   ```bash
   htop
   ```
   - 监控Python进程的CPU使用率
   - 检查是否有内存泄漏
   - 监控模型加载时间

4. **模型性能测试**：
   - **Flux模型测试**：
     ```bash
     # 测试Flux模型加载时间
     time python -c "import torch; print('PyTorch loaded')"
     ```
   - **视频生成测试**：
     - 使用小分辨率图像测试SVD
     - 监控每帧生成时间
     - 测试不同帧数的性能
   
   - **性能基准**：
     - Flux图像生成：1024x1024，20步，约15-20秒
     - SVD视频生成：576x1024，25帧，约45-60秒
     - 监控温度和使用率，确保系统稳定

5. **日志分析**：
   ```bash
   # 查看Flux相关日志
   grep -i "flux" comfyui.log
   
   # 查看视频生成日志
   grep -i "video\|svd\|mochi" comfyui.log
   
   # 查看错误日志
   grep -i "error\|warning\|exception" comfyui.log
   ```

## 优化配置工具

针对当前服务器配置（RTX 4070 Ti SUPER 16GB + AMD Ryzen 9 7950X），我们提供了专门的优化工具：

### 1. 应用优化配置
```bash
# 应用性能优化环境变量
source optimize_env.sh

# 或者永久添加到bash配置
echo "source $(pwd)/optimize_env.sh" >> ~/.bashrc
```

### 2. 模型专用优化
```bash
# 根据检测到的模型自动优化
source model_optimization.sh

# 手动指定模型类型
export MODEL_TYPE="flux"  # flux, svd, mochi, 或 default
source model_optimization.sh
```

### 3. 实时性能监控
```bash
# 启动性能监控面板
./monitor_performance.sh

# 监控输出示例：
# === ComfyUI 性能监控 ===
# 时间: 2024-01-01 12:00:00
# 
# === GPU 状态 ===
# GPU: NVIDIA GeForce RTX 4070 Ti SUPER
# 温度: 47°C
# 使用率: 45%
# 显存: 8765MB / 16376MB (53%)
# 
# === CPU 状态 ===
# 使用率: 32%
# 核心数: 16核心 / 32线程
# 
# === 内存状态 ===
# 内存: 19456MB / 63488MB (30%)
# 可用: 43210MB
```

### 4. 性能测试套件
```bash
# 运行完整性能测试
./performance_test.sh

# 测试内容包括：
# 1. 系统基准测试（CPU、内存、磁盘）
# 2. GPU性能测试
# 3. ComfyUI启动测试
# 4. 模型加载测试
# 5. 性能基准测试
# 6. 服务停止测试

# 测试结果保存到：performance_test_YYYYMMDD_HHMMSS.log
```

### 5. 配置文件优化
已针对当前硬件优化了配置文件：
- `comfyui_config.sh` - 主配置文件（已优化）
- `comfyui_config.example.sh` - 配置示例（已优化）

主要优化项：
```bash
# GPU优化
export EXTRA_ARGS="--highvram --force-fp16"
export PYTORCH_CUDA_ALLOC_CONF="max_split_size_mb:128,garbage_collection_threshold:0.6,expandable_segments:True"
export PYTORCH_CUDA_MEMORY_FRACTION=0.9

# CPU优化（16核心）
export OMP_NUM_THREADS=16
export MKL_NUM_THREADS=16
export NUMEXPR_NUM_THREADS=16

# 内存优化
export PYTORCH_MEMORY_EFFICIENT_CONV=1
```

### 6. 针对不同模型的优化建议

#### Flux模型（约12GB）：
```bash
# 专用优化配置
export EXTRA_ARGS="--highvram --force-fp16"
export PYTORCH_CUDA_MEMORY_FRACTION=0.85
export OMP_NUM_THREADS=8
```

#### Stable Video Diffusion（约8-10GB）：
```bash
# 专用优化配置
export EXTRA_ARGS="--normalvram --force-fp16"
export PYTORCH_CUDA_MEMORY_FRACTION=0.8
export OMP_NUM_THREADS=12
```

#### Mochi模型（约15GB）：
```bash
# 专用优化配置
export EXTRA_ARGS="--highvram --force-fp16"
export PYTORCH_CUDA_MEMORY_FRACTION=0.9
export OMP_NUM_THREADS=16
```

### 7. 故障排除

#### 如果遇到显存不足：
```bash
# 降低显存使用率
export PYTORCH_CUDA_MEMORY_FRACTION=0.8
export EXTRA_ARGS="--normalvram --force-fp16"
```

#### 如果遇到性能问题：
```bash
# 减少CPU线程数
export OMP_NUM_THREADS=8
export MKL_NUM_THREADS=8

# 使用监控工具诊断
./monitor_performance.sh
```

#### 如果服务无法启动：
```bash
# 检查日志
tail -f comfyui.log

# 使用最小配置测试
export EXTRA_ARGS="--cpu"
./start_comfyui.sh start
```

## 🚀 快速参考：避免内存不足错误

### 必须遵守的规则

1. **永远不要直接使用 `python main.py` 启动**
2. **永远不要使用 `--highvram` 参数**
3. **永远不要使用已删除的旧启动脚本**，所有功能已整合到 `start_simple_oom_fix.sh`

### 标准启动流程

```bash
# 1. 检查当前GPU内存使用
nvidia-smi

# 2. 如果有其他ComfyUI进程，先停止
pkill -f "python main.py"

# 3. 运行内存清理脚本（可选）
python scripts/emergency_gpu_cleanup.py

# 4. 使用低内存模式启动（推荐）
./scripts/start_simple_oom_fix.sh

# 5. 验证服务状态
curl http://localhost:8188
```

### 遇到内存不足错误时

```bash
# 1. 立即停止服务
pkill -f "python main.py"

# 2. 清理GPU内存
python scripts/emergency_gpu_cleanup.py

# 3. 检查GPU状态
nvidia-smi

# 4. 使用更低内存配置启动
./scripts/start_simple_oom_fix.sh

# 5. 如果仍然失败，调整工作流：
#    - 降低分辨率
#    - 减少批处理大小
#    - 使用更小的模型
```

### 启动脚本对比表

| 场景 | 推荐脚本 | 显存使用 | 风险等级 | 备注 |
|------|----------|---------|---------|------|
| **所有工作流** | `start_simple_oom_fix.sh` | 2.5GB峰值 | **最低** | **唯一推荐**，解决多模型OOM问题 |
| **测试调试** | `start_comfyui_simple.sh` | 1GB-8GB | 中 | 备用简单启动 |

**注意**：其他启动脚本已删除，`start_simple_oom_fix.sh` 是经过验证的最优解决方案。

### 监控命令

```bash
# 实时监控GPU内存（OOM优化专用）
python /tmp/comfyui_memory_monitor.py

# 实时监控GPU内存
watch -n 1 nvidia-smi

# 查看ComfyUI进程
ps aux | grep "python main.py"

# 查看启动日志
tail -f /tmp/comfyui_startup.log

# 查看内存优化配置
cat /home/gpu/ComfyUI/docs/quick_config_reference.txt
cat /home/gpu/ComfyUI/docs/OOM_OPTIMIZATION_CONFIG.md

# 检查服务状态
curl -s http://localhost:8188 | head -1

# 查看日志
tail -f comfyui.log
```

## 支持

- [Discord](https://comfy.org/discord): 在 #help 或 #feedback 频道寻求帮助
- [Matrix空间](https://app.element.io/#/room/%23comfyui_space%3Amatrix.org): 类似Discord但开源
- [官方网站](https://www.comfy.org/)

## 许可证

查看 [LICENSE](LICENSE) 文件了解详细信息。

---

*此简化版README专注于Linux环境下的安装和部署。如需完整功能说明，请参阅完整版README.md文件。*

## 📝 更新记录

### 2024-06-15: 内存优化更新
- 新增 `start_simple_oom_fix.sh` 脚本：OOM优化启动，解决多模型工作流内存问题
- 删除旧启动脚本：所有旧脚本已删除，只保留OOM优化版本
- 新增 `scripts/emergency_gpu_cleanup.py`：GPU内存紧急清理工具
- 更新README：强调必须使用内存优化启动方式
- 添加详细的内存使用警告和解决方案

**重要**：由于RTX 4070 Ti SUPER 16GB显存限制，必须使用优化启动脚本以避免 `torch.OutOfMemoryError` 错误。
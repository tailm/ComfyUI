# ComfyUI 视频生成性能优化指南

## 问题描述
当前配置下，生成5秒视频需要10分钟，性能需要优化。

## 硬件配置
- **CPU**: AMD Ryzen 9 7950X (16核/32线程)
- **内存**: 62GB RAM
- **GPU**: NVIDIA GeForce RTX 4070 Ti SUPER (16GB显存)
- **存储**: 1.8TB SSD

## 优化目标
将5秒视频生成时间从10分钟优化到1-2分钟。

## 已实施的优化措施

### 1. 配置文件优化
创建了专门的视频生成优化配置文件：
- `config/model_optimization_video.yaml` - 视频生成专用配置
- `config/video_optimization_config.yaml` - 视频参数配置

### 2. 启动脚本优化
创建了视频生成专用启动脚本：
- `start_video_optimized.sh` - 视频生成优化启动脚本

### 3. 关键优化参数

#### GPU优化
```yaml
gpu_optimization:
  memory_allocation: "aggressive"
  max_concurrent_inferences: 4
  reserve_memory_mb: 2048  # 为视频编码保留2GB显存
  enable_cuda_graphs: true
  use_fp16: true
```

#### CPU优化
```yaml
cpu_optimization:
  num_threads: 24  # 使用24个线程（16核的75%）
  enable_affinity: true
  memory_allocator: "jemalloc"
```

#### 视频生成专用优化
```yaml
video_generation:
  default_width: 512   # 降低分辨率提高速度
  default_height: 512
  fps: 24
  batch_frames: 4      # 批量处理4帧
  use_gpu_encoding: true
  encoding:
    codec: "h264_nvenc"  # NVIDIA硬件编码
    preset: "fast"       # 性能优先
```

#### 模型加载优化
```yaml
model_loading:
  shard_size_mb: 512    # 更小的分片大小
  parallel_load_threads: 12
  cache_size_mb: 8192   # 8GB缓存
```

## 使用方法

### 1. 使用视频优化脚本启动
```bash
./start_video_optimized.sh
```

### 2. 手动启动（带优化参数）
```bash
python main.py --listen 0.0.0.0 --port 8188 \
  --highvram \
  --force-fp16 \
  --use-pytorch-cross-attention \
  --disable-smart-memory
```

### 3. 环境变量设置
```bash
# GPU优化
export CUDA_VISIBLE_DEVICES="0"
export PYTORCH_CUDA_ALLOC_CONF="max_split_size_mb:64,garbage_collection_threshold:0.9"
export PYTORCH_CUDA_MEMORY_FRACTION=0.90

# CPU优化
export OMP_NUM_THREADS=24
export MKL_NUM_THREADS=24
```

## 工作流优化建议

### 1. 分辨率设置
- 建议使用512x512分辨率进行测试
- 可根据需要调整到768x768或1024x1024

### 2. 帧率设置
- 标准视频：24 FPS
- 流畅动画：30 FPS
- 测试阶段：12-15 FPS（提高速度）

### 3. 批处理设置
- 启用帧批处理：4帧/批
- 启用并行处理：最大4个并发推理

### 4. 编码设置
- 使用NVIDIA NVENC硬件编码
- 编码预设：fast（速度优先）
- 质量参数：CRF 23（平衡质量与速度）

## 性能监控

### 1. 查看GPU状态
```bash
nvidia-smi
```

### 2. 监控显存使用
```bash
nvidia-smi --query-gpu=memory.used,memory.total --format=csv
```

### 3. 查看进程状态
```bash
ps aux | grep python
```

## 故障排除

### 1. 如果视频生成仍然很慢
1. 检查GPU使用率：`nvidia-smi`
2. 降低分辨率到384x384测试
3. 减少批处理大小到2
4. 关闭xformers：移除`--use-pytorch-cross-attention`

### 2. 如果出现显存不足
1. 降低分辨率
2. 减少批处理大小
3. 使用`--normalvram`代替`--highvram`
4. 启用注意力切片

### 3. 如果CPU使用率过高
1. 减少`OMP_NUM_THREADS`到16
2. 检查是否有其他进程占用CPU

## 预期性能提升

### 优化前
- 5秒视频：~10分钟
- 分辨率：可能为1024x1024或更高
- 无批处理，无硬件编码优化

### 优化后（预期）
- 5秒视频：1-2分钟（目标）
- 分辨率：512x512（可调整）
- 4帧批处理 + 硬件编码
- 24线程CPU优化 + GPU显存优化

## 测试步骤

1. **基准测试**：使用当前配置生成5秒视频，记录时间
2. **优化测试1**：使用`start_video_optimized.sh`启动，生成512x512视频
3. **优化测试2**：调整批处理大小到2，测试性能
4. **优化测试3**：调整分辨率到384x384，测试极限性能
5. **对比分析**：比较各配置下的生成时间和质量

## 注意事项

1. **质量与速度平衡**：降低分辨率会提高速度但影响质量
2. **显存管理**：视频生成需要大量显存，注意监控使用情况
3. **温度监控**：长时间视频生成可能使GPU温度升高
4. **存储空间**：视频文件较大，确保有足够存储空间

## 联系支持

如果优化后性能仍不理想，请检查：
1. 工作流复杂度
2. 使用的具体模型
3. 视频长度和参数设置
4. 系统其他资源使用情况
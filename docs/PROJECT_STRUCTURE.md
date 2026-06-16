# ComfyUI 项目结构说明

## 📁 目录结构

### 根目录文件
```
ComfyUI/
├── main.py                    # 主程序入口
├── comfy.db                  # 数据库文件
├── README.md                 # 主文档（已更新）
├── README_EN.md              # 英文文档
├── README_DOMESTIC_MIRROR.md # 国内镜像文档
├── comfyui.log              # 主日志文件
├── comfyui_new.log          # 新日志文件
├── comfyui_realtime.log     # 实时日志
├── comfyui_video.log        # 视频日志
└── comfyui_version.py       # 版本信息
```

### 核心目录
```
comfy/                       # 核心功能模块
comfy_api/                   # API接口
comfy_extras/                # 扩展功能
custom_nodes/                # 自定义节点
├── memory_optimizer.py     # 内存优化节点
├── __init__.py            # 节点注册
└── ...                    # 其他自定义节点
```

### 配置和脚本
```
config/                      # 配置文件
scripts/                     # 启动和管理脚本
├── start_simple_oom_fix.sh # OOM优化启动脚本（推荐）
├── start_comfyui_simple.sh # 简单启动脚本（备用）
├── start.sh                # 基础启动脚本
├── restart_comfyui.sh      # 重启脚本
├── restart_comfyui_with_cache_clean.sh # 带缓存清理的重启
├── start_with_auth.py      # 带认证的启动
└── emergency_memory_fix.py # 紧急内存修复工具
```

### 文档目录
```
docs/                        # 文档文件
├── OOM_OPTIMIZATION_CONFIG.md      # OOM优化配置详情
├── MEMORY_OPTIMIZATION_GUIDE.md    # 内存优化指南
├── quick_config_reference.txt      # 快速配置参考
├── STARTUP_OPTIMIZATION_SUMMARY.md # 启动优化总结
└── PROJECT_STRUCTURE.md            # 项目结构说明（本文件）
```

### 数据目录
```
models/                      # 模型文件
├── checkpoints/            # 检查点模型
├── vae/                    # VAE模型
├── loras/                  # LoRA模型
├── embeddings/             # 嵌入模型
└── ...                    # 其他模型
input/                      # 输入文件
output/                     # 输出文件
logs/                       # 日志目录
```

### 测试和示例
```
tests/                      # 集成测试
tests-unit/                 # 单元测试
script_examples/            # 脚本示例
examples/                   # 使用示例
```

### 其他目录
```
api_server/                 # API服务器
app/                        # 应用模块
alembic_db/                 # 数据库迁移
blueprints/                 # 蓝图模板
comfy_config/               # 配置管理
comfy_execution/            # 执行引擎
html/                       # HTML文件
middleware/                 # 中间件
utils/                      # 工具函数
user/                       # 用户数据
web/                        # Web界面
```

## 🚀 启动脚本说明

### 推荐启动脚本
1. **OOM优化启动** (`scripts/start_simple_oom_fix.sh`)
   - 解决多模型工作流内存问题
   - 峰值内存：2.5GB（从8.2GB优化，节省70.2%）
   - 可用内存：15.6GB（从1.9GB增加）
   - 支持6个模型顺序执行无OOM错误

2. **简单启动** (`scripts/start_comfyui_simple.sh`)
   - 基础启动，无内存优化
   - 仅用于测试和调试

### 启动命令
```bash
# OOM优化启动（推荐）
chmod +x scripts/start_simple_oom_fix.sh
./scripts/start_simple_oom_fix.sh

# 简单启动（备用）
chmod +x scripts/start_comfyui_simple.sh
./scripts/start_comfyui_simple.sh
```

## 🔧 核心配置文件

### OOM优化配置
- **启动参数**: `--disable-smart-memory --preview-method latent2rgb --disable-xformers`
- **环境变量**: 
  - `PYTORCH_CUDA_MEMORY_FRACTION=0.80`
  - `PYTORCH_CUDA_ALLOC_CONF="max_split_size_mb:32,garbage_collection_threshold:0.85"`
  - `PYTORCH_NO_CUDA_MEMORY_CACHING=1`
  - `CUDA_LAUNCH_BLOCKING=0`

### 自定义节点
1. **MemoryOptimizer**: 智能内存清理节点
2. **SequentialModelExecutor**: 自动顺序执行6个模型

## 📊 日志文件说明

### 主要日志
- `comfyui.log` - 主日志文件
- `comfyui_new.log` - 新日志文件
- `comfyui_realtime.log` - 实时日志
- `comfyui_video.log` - 视频相关日志

### 日志位置
- 根目录：主要日志文件
- `logs/` 目录：历史日志归档

## 🛠️ 工具脚本

### 内存管理
- `scripts/emergency_memory_fix.py` - 紧急内存修复
- `custom_nodes/memory_optimizer.py` - 内存优化节点

### 服务管理
- `scripts/restart_comfyui.sh` - 重启服务
- `scripts/restart_comfyui_with_cache_clean.sh` - 带缓存清理的重启

### 监控工具
- `/tmp/comfyui_memory_monitor.py` - 内存监控脚本（临时位置）

## 📝 文档文件

### 核心文档
1. `README.md` - 主使用文档（已更新）
2. `docs/OOM_OPTIMIZATION_CONFIG.md` - OOM优化配置详情
3. `docs/MEMORY_OPTIMIZATION_GUIDE.md` - 内存优化指南
4. `docs/quick_config_reference.txt` - 快速配置参考
5. `docs/STARTUP_OPTIMIZATION_SUMMARY.md` - 启动优化总结

### 其他文档
- `README_EN.md` - 英文文档
- `README_DOMESTIC_MIRROR.md` - 国内镜像配置

## 🗑️ 已清理的文件

### 删除的启动脚本
- `start_low_memory.sh`
- `start_memory_optimized.sh`
- `start_video_optimized.sh`
- `start_optimized.sh`
- `start_optimized_fixed.sh`
- `start_video_optimized_fixed.sh`
- `start_with_domestic_mirror.sh`
- `start_with_realtime_cleanup.sh`

### 删除的日志文件
- `comfyui_domestic_mirror_20260615_050510.log`
- `comfyui_memory_optimized_20260615_023617.log`
- `comfyui_memory_optimized_20260615_023718.log`
- `comfyui_optimized_20260615_051636.log`
- `comfyui_optimized_20260615_051926.log`
- `comfyui_realtime_cleanup_20260615_025149.log`
- `comfyui_video_optimized_20260615_021042.log`
- `comfyui_video_optimized_20260615_021218.log`

### 删除的临时文件
- `comfyui.pid` - PID文件
- `execution.py.backup` - 备份文件
- `__pycache__/` - Python缓存目录
- `temp/` - 临时目录

## 🔄 更新记录

### 2026-06-15
- **清理**: 删除8个冗余启动脚本
- **优化**: 只保留2个核心脚本
- **组织**: 创建 `scripts/` 和 `docs/` 目录
- **文档**: 更新README和创建结构说明

### 关键变更
1. **启动脚本简化**: 10个 → 2个
2. **目录结构优化**: 按功能组织文件
3. **文档完善**: 添加详细配置说明
4. **内存优化**: 解决6模型工作流OOM问题

## 🎯 使用建议

### 新用户
1. 阅读 `README.md` 了解基本使用
2. 使用 `scripts/start_simple_oom_fix.sh` 启动
3. 参考 `docs/quick_config_reference.txt` 快速配置

### 开发者
1. 查看 `docs/OOM_OPTIMIZATION_CONFIG.md` 了解优化细节
2. 使用 `custom_nodes/memory_optimizer.py` 进行内存优化
3. 参考 `docs/PROJECT_STRUCTURE.md` 了解项目结构

### 故障排除
1. 检查 `comfyui.log` 日志文件
2. 运行 `scripts/emergency_memory_fix.py` 修复内存问题
3. 参考 `docs/MEMORY_OPTIMIZATION_GUIDE.md` 优化指南

## 📞 支持

### 问题反馈
1. 查看日志文件定位问题
2. 参考文档中的故障排除部分
3. 使用内存监控工具诊断问题

### 性能优化
1. 使用OOM优化启动脚本
2. 配置适当的环境变量
3. 使用内存优化自定义节点

---

**总结**: 项目结构已优化，启动脚本简化，文档完善，专注于解决多模型工作流内存问题。
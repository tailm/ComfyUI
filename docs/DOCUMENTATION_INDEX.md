# ComfyUI 文档索引

## 📚 核心文档

### 快速开始
- **[README.md](../README.md)** - 主文档，快速安装和启动指南
- **[快速配置参考](quick_config_reference.txt)** - 快速配置命令参考

### 性能优化
- **[性能优化指南](PERFORMANCE_OPTIMIZATION.md)** - 完整的性能优化方案
- **[OOM优化配置](OOM_OPTIMIZATION_CONFIG.md)** - 详细的OOM优化配置
- **[内存优化指南](MEMORY_OPTIMIZATION_GUIDE.md)** - 内存优化详细指南

### 故障排除
- **[常见问题解答](FAQ_TROUBLESHOOTING.md)** - 故障排除和解决方案
- **[启动优化总结](STARTUP_OPTIMIZATION_SUMMARY.md)** - 启动脚本优化总结

### 项目结构
- **[项目结构说明](PROJECT_STRUCTURE.md)** - 项目目录结构说明
- **[清理总结](CLEANUP_SUMMARY.md)** - 项目清理和优化总结

## 🎯 使用指南

### 新手入门
1. **阅读主文档**: [README.md](../README.md)
2. **快速配置**: [quick_config_reference.txt](quick_config_reference.txt)
3. **启动服务**: 使用 `scripts/start_simple_oom_fix.sh`

### 性能优化
1. **了解问题**: [性能优化指南](PERFORMANCE_OPTIMIZATION.md)
2. **配置优化**: [OOM优化配置](OOM_OPTIMIZATION_CONFIG.md)
3. **内存管理**: [内存优化指南](MEMORY_OPTIMIZATION_GUIDE.md)

### 故障排除
1. **常见问题**: [常见问题解答](FAQ_TROUBLESHOOTING.md)
2. **启动问题**: [启动优化总结](STARTUP_OPTIMIZATION_SUMMARY.md)
3. **项目结构**: [项目结构说明](PROJECT_STRUCTURE.md)

## 🔧 工具脚本

### 启动脚本
- `scripts/start_simple_oom_fix.sh` - OOM优化启动（推荐）
- `scripts/start_comfyui_simple.sh` - 简单启动（备用）
- `scripts/restart_comfyui.sh` - 重启服务
- `scripts/restart_comfyui_with_cache_clean.sh` - 带缓存清理的重启

### 维护工具
- `scripts/emergency_memory_fix.py` - 紧急内存修复
- `scripts/clean_gpu_memory.py` - GPU内存清理
- `scripts/clean_python_cache.sh` - Python缓存清理
- `scripts/realtime_gpu_cleaner.py` - 实时GPU清理

### 监控工具
- `/tmp/comfyui_memory_monitor.py` - 内存监控脚本
- `scripts/monitor_performance.sh` - 性能监控
- `scripts/monitor_performance_optimized.sh` - 优化性能监控

## 📊 文档结构

### 按功能分类
```
docs/
├── 快速开始/
│   ├── README.md (主文档)
│   └── quick_config_reference.txt
├── 性能优化/
│   ├── PERFORMANCE_OPTIMIZATION.md
│   ├── OOM_OPTIMIZATION_CONFIG.md
│   └── MEMORY_OPTIMIZATION_GUIDE.md
├── 故障排除/
│   ├── FAQ_TROUBLESHOOTING.md
│   └── STARTUP_OPTIMIZATION_SUMMARY.md
├── 项目结构/
│   ├── PROJECT_STRUCTURE.md
│   └── CLEANUP_SUMMARY.md
└── 其他文档/
    ├── INTEGRATION_SUMMARY.md
    ├── OPTIMIZATION_SUMMARY.md
    ├── QUICK_START_GUIDE.md
    └── USER_AUTH_SYSTEM_SUMMARY.md
```

### 按优先级排序
1. **必读文档** (新手入门):
   - [README.md](../README.md)
   - [quick_config_reference.txt](quick_config_reference.txt)

2. **性能优化** (解决OOM问题):
   - [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md)
   - [OOM_OPTIMIZATION_CONFIG.md](OOM_OPTIMIZATION_CONFIG.md)

3. **故障排除** (解决问题):
   - [FAQ_TROUBLESHOOTING.md](FAQ_TROUBLESHOOTING.md)
   - [STARTUP_OPTIMIZATION_SUMMARY.md](STARTUP_OPTIMIZATION_SUMMARY.md)

4. **项目维护** (深入了解):
   - [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
   - [CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md)

## 🚀 快速导航

### 安装和启动
```bash
# 1. 克隆仓库
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI

# 2. 安装依赖
pip install -r requirements.txt
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# 3. 启动服务
chmod +x scripts/start_simple_oom_fix.sh
./scripts/start_simple_oom_fix.sh
```

### OOM问题解决
1. **阅读**: [性能优化指南](PERFORMANCE_OPTIMIZATION.md)
2. **配置**: [OOM优化配置](OOM_OPTIMIZATION_CONFIG.md)
3. **启动**: 使用 `scripts/start_simple_oom_fix.sh`
4. **监控**: 运行 `/tmp/comfyui_memory_monitor.py`

### 故障排除流程
1. **检查日志**: `tail -f comfyui.log`
2. **监控内存**: `python /tmp/comfyui_memory_monitor.py`
3. **参考文档**: [常见问题解答](FAQ_TROUBLESHOOTING.md)
4. **紧急修复**: `python scripts/emergency_memory_fix.py`

## 📝 文档更新记录

### 2026-06-15
- ✅ **文档重组**: 将详细内容移到单独页面
- ✅ **README精简**: 从1183行减少到182行
- ✅ **新增文档**: 创建性能优化和常见问题文档
- ✅ **链接完善**: 所有文档相互链接

### 关键改进
1. **主文档精简**: 只保留核心内容，快速入门
2. **详细文档分离**: 性能优化、故障排除等移到单独页面
3. **文档索引**: 创建本文档索引，方便查找
4. **链接完整**: 所有文档相互引用，形成完整体系

## 🔗 相关资源

### 官方资源
- [ComfyUI GitHub](https://github.com/comfyanonymous/ComfyUI)
- [ComfyUI Wiki](https://github.com/comfyanonymous/ComfyUI/wiki)
- [ComfyUI Examples](https://github.com/comfyanonymous/ComfyUI_examples)

### 社区支持
- [ComfyUI Discord](https://discord.gg/comfyui)
- [ComfyUI Reddit](https://www.reddit.com/r/comfyui/)
- [GitHub Discussions](https://github.com/comfyanonymous/ComfyUI/discussions)

### 工具和扩展
- [ComfyUI Manager](https://github.com/ltdrdata/ComfyUI-Manager)
- [Custom Nodes](https://github.com/comfyanonymous/ComfyUI/discussions/categories/custom-nodes)
- [Workflows](https://github.com/comfyanonymous/ComfyUI/discussions/categories/workflows)

## 📞 支持渠道

### 问题报告
1. **GitHub Issues**: [ComfyUI Issues](https://github.com/comfyanonymous/ComfyUI/issues)
2. **社区讨论**: [GitHub Discussions](https://github.com/comfyanonymous/ComfyUI/discussions)
3. **本地文档**: 参考本文档和相关文档

### 贡献指南
1. **文档贡献**: 更新和改进本文档
2. **代码贡献**: 提交Pull Request
3. **问题反馈**: 报告Bug和提出建议

---

**最后更新**: 2026-06-15  
**维护者**: ComfyUI 优化团队  
**文档状态**: 完整且最新  
**适用版本**: ComfyUI 最新版本
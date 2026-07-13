# ComfyUI 多用户版本

<div align="center">

[![版本](https://img.shields.io/badge/版本-1.1.0-blue.svg)](https://github.com/your-repo/ComfyUI)
[![Python](https://img.shields.io/badge/Python-3.13+-green.svg)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.12+-red.svg)](https://pytorch.org/)
[![许可证](https://img.shields.io/badge/许可证-MIT-yellow.svg)](LICENSE)

**基于 ComfyUI 的多用户工作流管理系统**

</div>

## 📖 项目简介

本项目是基于开源的ComfyUI，在保留原有强大功能的基础上，新增了**多用户系统**和**数据隔离**功能，适用于团队协作和多用户场景。

### ✨ 核心特性

- 🎨 **完整的 ComfyUI 功能** - 支持所有原生节点和工作流
- 👥 **多用户系统** - 支持多用户独立使用，数据完全隔离
- 🔐 **数据隔离** - 每个用户拥有独立的工作流、设置和输出目录
- 🚀 **服务管理** - 内置服务管理脚本，方便运维
- 📊 **用户管理** - 支持用户创建、切换和管理
- 💾 **数据持久化** - 用户数据自动保存和恢复

## 🚀 快速开始

### 系统要求

- Python 3.13+
- PyTorch 2.12+
- CUDA 13.0+ (推荐)
- 16GB+ RAM (推荐)
- NVIDIA GPU (推荐)

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/your-repo/ComfyUI.git
cd ComfyUI
```

2. **安装依赖**
```bash
pip install -r requirements.txt
```

3. **启动服务（无用户模式）**
```bash
python main.py --listen 0.0.0.0 --port 8188
```

4. **启动服务（多用户模式）**
```bash
python main.py --listen 0.0.0.0 --port 8188 --multi-user
```

5. **启动服务（本地前端模式）**

使用 `--front-end-local` 参数可直接从项目 `web/` 目录加载前端，无需依赖 `comfyui-frontend-package` pip 包，适合离线或独立部署场景：
```bash
python main.py --listen 0.0.0.0 --port 8188 --front-end-local
```

也可与多用户模式组合使用：
```bash
python main.py --listen 0.0.0.0 --port 8188 --multi-user --front-end-local
```

6. **访问界面**
```
http://localhost:8188
```

## 👥 多用户系统

### 功能说明

多用户系统为每个用户提供独立的工作环境：

- **独立工作流** - 每个用户的工作流互不干扰
- **独立设置** - 用户界面设置独立保存
- **独立输出** - 生成的图片和视频分别存储
- **数据隔离** - 用户之间无法访问彼此的数据

### 用户目录结构

```
user/
├── 0/                      # 用户ID 0
│   ├── comfy.settings.json # 用户设置
│   ├── workflows/          # 工作流目录
│   ├── templates/          # 模板目录
│   └── subgraphs/          # 子图目录
├── 1/                      # 用户ID 1
│   ├── comfy.settings.json
│   └── workflows/
├── default/                # 默认用户
│   └── ...
├── comfyui.db              # 用户数据库
└── users.json              # 用户配置
```

### 用户管理

#### 查看用户列表
```bash
curl http://localhost:8188/users
```

#### 切换用户
在浏览器中访问 `http://localhost:8188`，系统会自动识别用户身份。

## 🔧 服务管理

### 服务管理脚本

项目提供了便捷的服务管理脚本：

```bash
# 查看服务状态
./scripts/service_manager.sh status

# 启动服务
./scripts/service_manager.sh start

# 停止服务
./scripts/service_manager.sh stop

# 重启服务
./scripts/service_manager.sh restart

# 查看日志
./scripts/service_manager.sh logs

# 清理日志
./scripts/service_manager.sh clean
```

### 快速重启

```bash
# 快速重启服务
./scripts/check_service.sh
```

## 📁 项目结构

```
ComfyUI/
├── main.py                 # 主入口文件
├── comfy/                  # ComfyUI核心代码
├── comfy_api/              # API接口
├── comfy_extras/           # 扩展节点
├── custom_nodes/           # 自定义节点
├── web/                    # 前端静态文件（--front-end-local 模式使用）
├── models/                 # 模型文件
│   ├── diffusion_models/   # 扩散模型
│   ├── vae/                # VAE模型
│   ├── text_encoders/      # 文本编码器
│   └── loras/              # LoRA模型
├── user/                   # 用户数据目录
├── input/                  # 输入文件
├── output/                 # 输出文件
├── config/                 # 配置文件
├── scripts/                # 工具脚本
├── docs/                   # 文档
└── data/                   # 数据文件
```

## 🎯 使用指南

### 基本工作流

1. **启动服务** - 使用服务管理脚本启动
2. **访问界面** - 打开浏览器访问 `http://localhost:8188`
3. **创建工作流** - 在界面中拖拽节点创建工作流
4. **执行生成** - 点击运行按钮生成图片或视频
5. **查看结果** - 在输出目录查看生成结果

### 多用户使用

1. **启动多用户模式** - 添加 `--multi-user` 参数
2. **用户识别** - 系统自动识别用户身份
3. **独立工作** - 每个用户独立使用，互不干扰
4. **数据隔离** - 用户数据自动隔离存储

## 📚 文档

详细文档请查看 `docs/` 目录：

- [多用户系统说明](docs/MULTI_USER_SYSTEM.md)
- [数据隔离开发指南](docs/DATA_ISOLATION_DEVELOPER_GUIDE.md)
- [服务管理指南](docs/SERVICE_MANAGEMENT.md)
- [快速重启备忘单](docs/QUICK_RESTART_CHEATSHEET.md)
- [故障排除指南](docs/TROUBLESHOOTING.md)

## 🔍 故障排除

### 常见问题

**Q: 服务无法启动？**
A: 检查端口是否被占用，使用 `lsof -i :8188` 查看。

**Q: 用户数据丢失？**
A: 检查 `user/` 目录权限，确保有写入权限。

**Q: 模型加载失败？**
A: 检查 `models/` 目录中的模型文件是否完整。

**Q: GPU内存不足？**
A: 减小batch size或使用CPU模式。

更多问题请查看 [故障排除指南](docs/TROUBLESHOOTING.md)。

## 🤝 贡献指南

欢迎贡献代码！请查看 [贡献指南](CONTRIBUTING.md) 了解详情。

### 开发环境设置

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源，详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) - 强大的稳定扩散GUI
- 所有贡献者和支持者

## 📞 联系方式

- 问题反馈：[GitHub Issues](https://github.com/tailm/ComfyUI/issues)
- 功能建议：[GitHub Discussions](https://github.com/tailm/ComfyUI/discussions)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个星标！⭐**

</div>

# ComfyUI

<div align="center">

[![版本](https://img.shields.io/badge/版本-1.3.0-blue.svg)](https://github.com/your-repo/ComfyUI)
[![Python](https://img.shields.io/badge/Python-3.13+-green.svg)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.12+-red.svg)](https://pytorch.org/)
[![许可证](https://img.shields.io/badge/许可证-MIT-yellow.svg)](LICENSE)

**基于 ComfyUI 的 AI 图像/视频生成工作流管理系统**

</div>

## 项目简介

本项目基于开源 ComfyUI，内置**多用户系统**和**数据隔离**功能，前端从本地 `web/` 目录加载，无需依赖外部 pip 包，适用于团队协作和独立部署场景。

### 核心特性

- 完整的 ComfyUI 功能 - 支持所有原生节点和工作流
- 用户系统 - 支持多用户独立使用，数据完全隔离
- 数据隔离 - 每个用户拥有独立的工作流、设置和输出目录
- 本地前端 - 前端从项目 `web/` 目录加载，无需 `comfyui-frontend-package`
- 服务管理 - 内置服务管理脚本，方便运维

## 快速开始

### 系统要求

- Python 3.13+
- PyTorch 2.12+
- CUDA 13.0+ (推荐)
- Node.js 18+ (仅前端构建时需要)
- 16GB+ RAM (推荐)
- NVIDIA GPU (推荐)

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/your-repo/ComfyUI.git
cd ComfyUI
```

2. **安装 Python 依赖**
```bash
pip install -r requirements.txt
```

3. **构建前端**（首次部署或前端代码更新后执行）
```bash
cd ComfyUI_frontend
pnpm install
# 标准构建（含类型检查）
pnpm build
# 若 typecheck 报错，可跳过类型检查直接构建
# npx vite build --config vite.config.mts
```

4. **同步前端到 web 目录**
```bash
# 构建产物在 ComfyUI_frontend/dist/，需同步到 web/ 目录
cd ..
python scripts/sync_frontend.py
```

5. **启动服务**
```bash

# 启动服务

python main.py --listen 0.0.0.0 --port 8188

```

6. **访问界面**
```
http://localhost:8188
```

## 前端开发

### 目录结构

```
ComfyUI_frontend/       # 前端源码目录
├── src/                # Vue 3 + TypeScript 源码
├── dist/               # 构建输出（gitignore）
└── package.json
web/                    # 服务端加载的前端静态文件
├── index.html
├── assets/
└── ...
```

### 前端构建流程

前端代码位于 `ComfyUI_frontend/`，构建后需同步到 `web/` 目录供服务加载。

```bash
# 1. 安装前端依赖
cd ComfyUI_frontend
pnpm install

# 2. 构建（标准方式，含类型检查）
pnpm build

# 2. 构建（跳过类型检查，当 typecheck 报错时使用）
npx vite build --config vite.config.mts

# 3. 同步到 web 目录（从项目根目录执行）
cd ..
python scripts/sync_frontend.py
```

> **注意**：`pnpm build` 等同于 `pnpm typecheck && vite build`。如果 tsconfig 引用上层目录配置导致 typecheck 报错（TS6059），可直接使用 `npx vite build --config vite.config.mts` 跳过类型检查进行构建。

### 一键重建并重启

```bash
# 构建前端 + 同步到 web + 重启服务
cd ComfyUI_frontend && npx vite build --config vite.config.mts && cd .. && python scripts/sync_frontend.py && ./scripts/service_manager.sh restart
```

### 前端开发模式

开发时可使用 Vite 开发服务器热更新：

```bash
cd ComfyUI_frontend
# 连接本地后端
pnpm dev

# 连接测试云环境
pnpm dev:cloud:test
```

### 前端代码提交

前端代码在 `ComfyUI_frontend/` 目录下有独立的 git 仓库：

```bash
cd ComfyUI_frontend
git add -A
git commit -m "描述你的修改"
git push origin dev
```

## 用户系统

### 功能说明

系统为每个登录用户提供独立的工作环境：

- 独立工作流 - 每个用户的工作流互不干扰
- 独立设置 - 用户界面设置独立保存
- 独立输出 - 生成的图片和视频分别存储
- 数据隔离 - 用户之间无法访问彼此的数据

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

## 服务管理

使用 `scripts/service_manager.sh` 管理服务：

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

# 构建前端并重启
./scripts/service_manager.sh rebuild
```

### 快速检查

```bash
./scripts/check_service.sh
```

## 项目结构

```
ComfyUI/
├── main.py                 # 主入口文件
├── comfy/                  # ComfyUI核心代码
├── comfy_api/              # API接口
├── comfy_extras/           # 扩展节点
├── custom_nodes/           # 自定义节点
├── ComfyUI_frontend/       # 前端源码（独立 git 仓库）
├── web/                    # 前端静态文件（服务从此目录加载）
├── models/                 # 模型文件
│   ├── diffusion_models/   # 扩散模型
│   ├── vae/                # VAE模型
│   ├── text_encoders/      # 文本编码器
│   └── loras/              # LoRA模型
├── user/                   # 用户数据目录
├── input/                  # 输入文件
├── output/                 # 输出文件
├── scripts/                # 工具脚本
└── app/                    # 应用层代码
    ├── frontend_management.py  # 前端管理（本地 web 目录）
    └── user_manager.py         # 用户管理
```

## 故障排除

### 常见问题

**Q: 服务无法启动？**
A: 检查端口是否被占用：`lsof -i :8188`。检查前端文件是否存在：`ls web/index.html`。

**Q: 前端页面空白或报错？**
A: 需要重新构建前端并同步：`cd ComfyUI_frontend && npx vite build --config vite.config.mts && cd .. && python scripts/sync_frontend.py`

**Q: 用户数据丢失？**
A: 检查 `user/` 目录权限，确保有写入权限。

**Q: 模型加载失败？**
A: 检查 `models/` 目录中的模型文件是否完整。

**Q: GPU内存不足？**
A: 减小batch size或使用CPU模式。

## 贡献指南

欢迎贡献代码！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目基于 MIT 许可证开源，详见 [LICENSE](LICENSE) 文件。

## 致谢

- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) - 强大的稳定扩散GUI
- 所有贡献者和支持者

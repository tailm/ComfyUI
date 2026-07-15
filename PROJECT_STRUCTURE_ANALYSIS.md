# ComfyUI 项目目录结构分析报告

> 分析日期：2026-07-15  
> 项目版本：1.2.0  
> 项目性质：基于开源 ComfyUI 的多用户 AI 图像/视频生成工作流管理系统

---

## 一、核心后端模块

### 1. `main.py` — 主入口文件

| 属性 | 说明 |
|------|------|
| **功能** | ComfyUI 启动入口，负责解析命令行参数、配置 CUDA 设备和内存分配器、加载自定义路径、初始化数据库、创建 PromptServer、启动 prompt_worker 线程、启动异步 HTTP/WebSocket 服务器 |
| **是否使用** | 是，核心入口 |
| **是否可删除** | 否 |

---

### 2. `comfy/` — 核心推理引擎

| 属性 | 说明 |
|------|------|
| **功能** | ComfyUI 的核心推理库，包含所有 AI 模型架构实现（Flux, SD3, Wan, HunyuanVideo, Cosmos, LTX, Kling 等 30+ 种模型）、采样算法（Euler, DPM++, UniPC 等）、模型加载/管理、GPU/VRAM 内存管理、LoRA/ControlNet/T2I Adapter 支持、CLIP/VAE 编码器、多 GPU 支持等 |
| **关键子目录** | `ldm/`（38 个模型架构子目录）、`text_encoders/`（11 个编码器）、`k_diffusion/`、`cldm/`、`audio_encoders/`、`image_encoders/`、`background_removal/`、`comfy_types/`、`weight_adapter/` |
| **关键文件** | `model_management.py`(74KB)、`model_patcher.py`(95KB)、`model_base.py`(106KB)、`sd.py`(115KB)、`samplers.py`(62KB)、`supported_models.py`(74KB)、`ops.py`(67KB)、`cli_args.py`(18KB) |
| **是否使用** | 是，项目核心 |
| **是否可删除** | 否 |

---

### 3. `comfy_extras/` — 官方扩展节点集

| 属性 | 说明 |
|------|------|
| **功能** | ComfyUI 官方提供的扩展节点集合，涵盖图像/视频/音频/3D 处理、模型操作、高级采样、训练等。80+ 个 `nodes_*.py` 文件，每个实现一类功能节点 |
| **关键文件** | `nodes_wan.py`(79KB)、`nodes_train.py`(53KB)、`nodes_images.py`(48KB)、`nodes_post_processing.py`(40KB)、`nodes_hunyuan.py`、`nodes_sd3.py`、`nodes_audio.py`、`nodes_video.py`、`nodes_mask.py`、`nodes_model_merging.py` 等 |
| **是否使用** | 是 |
| **是否可删除** | 否（删除将丢失大量官方节点） |

---

### 4. `comfy_api/` — 版本化 API 框架

| 属性 | 说明 |
|------|------|
| **功能** | 提供版本化的 ComfyUI 节点 API 框架，允许节点开发者使用不同版本的 API 编写节点，同时保持向后兼容。包含 IO 类型系统、UI 定义、执行控制、缓存等 |
| **关键子目录** | `input/`（输入类型定义）、`input_impl/`（输入实现）、`internal/`（内部 API 基础设施）、`latest/`（最新版 API）、`v0_0_1/`/`v0_0_2/`（历史版本适配器）、`torch_helpers/`、`util/` |
| **关键文件** | `feature_flags.py`、`generate_api_stubs.py`、`version_list.py` |
| **是否使用** | 是，核心基础设施 |
| **是否可删除** | 否 |

---

### 5. `comfy_api_nodes/` — 第三方 API 集成节点

| 属性 | 说明 |
|------|------|
| **功能** | 提供与第三方 AI API 服务集成的 ComfyUI 节点，允许在 ComfyUI 工作流中调用云端 API（OpenAI, Anthropic, BFL, Kling, Luma, Gemini, Ideogram, Stability, Runway, Minimax 等 33 个服务商） |
| **关键子目录** | `apis/`（33 个第三方 API 客户端模块）、`util/`（API 节点工具库） |
| **是否使用** | 是，快速增长模块 |
| **是否可删除** | 否（如不需要云端 API 调用可考虑删除，但会影响功能） |

---

### 6. `comfy_execution/` — 工作流执行引擎

| 属性 | 说明 |
|------|------|
| **功能** | 工作流执行的核心引擎，负责图解析、节点执行顺序、输出缓存（BasicCache, LRUCache, RAMPressureCache, HierarchicalCache）、进度报告、类型验证、作业状态跟踪等 |
| **关键文件** | `graph.py`（动态图定义）、`caching.py`（缓存系统）、`cache_provider.py`（外部缓存提供者）、`user_isolated_cache.py`（多用户缓存隔离）、`jobs.py`（作业状态）、`progress.py`（进度处理）、`validation.py`（类型验证） |
| **是否使用** | 是，核心基础设施 |
| **是否可删除** | 否 |

---

### 7. `comfy_config/` — 配置解析

| 属性 | 说明 |
|------|------|
| **功能** | 解析和验证 ComfyUI 自定义节点的 `pyproject.toml` 配置文件，包括节点发布信息、模型依赖、操作系统和加速器兼容性等 |
| **关键文件** | `config_parser.py`、`types.py`（Pydantic 模型定义） |
| **是否使用** | 是 |
| **是否可删除** | 否 |

---

### 8. `comfyui_version/` — 版本信息

| 属性 | 说明 |
|------|------|
| **功能** | 存储当前 ComfyUI 版本号（`__version__ = "1.1.0"`），由构建过程自动生成 |
| **是否使用** | 是 |
| **是否可删除** | 否 |

---

### 9. `cuda_malloc/` — CUDA 内存分配器配置

| 属性 | 说明 |
|------|------|
| **功能** | 在 PyTorch 导入之前配置 CUDA 内存分配器。维护不支持 cudaMallocAsync 的 GPU 黑名单（旧版 Maxwell/Pascal 架构），自动检测并设置 `PYTORCH_CUDA_ALLOC_CONF` 环境变量 |
| **是否使用** | 是，启动时必需 |
| **是否可删除** | 否 |

---

### 10. `execution/` — 执行器主模块

| 属性 | 说明 |
|------|------|
| **功能** | 工作流执行的核心调度器。`PromptExecutor` 负责接收工作流提示、验证节点、执行图遍历、调用节点函数、管理输出缓存。`PromptQueue` 是优先级队列，管理待执行的工作流。支持多种缓存策略（Classic, LRU, RAM Pressure, None） |
| **关键文件** | `__init__.py`(72KB) — PromptExecutor 和 PromptQueue 类 |
| **是否使用** | 是，核心执行引擎 |
| **是否可删除** | 否 |

---

### 11. `nodes/` — 内置节点定义

| 属性 | 说明 |
|------|------|
| **功能** | 定义 ComfyUI 的所有内置节点，包括 CLIPTextEncode, KSampler, CheckpointLoaderSimple 等核心节点，以及自定义节点和 API 节点的初始化逻辑（`init_extra_nodes()`）。包含 `NODE_CLASS_MAPPINGS` 和 `NODE_DISPLAY_NAME_MAPPINGS` 注册表 |
| **关键文件** | `__init__.py`(105KB) |
| **是否使用** | 是，核心节点定义 |
| **是否可删除** | 否 |

---

### 12. `folder_paths/` — 文件路径管理

| 属性 | 说明 |
|------|------|
| **功能** | 管理所有文件系统路径，包括模型目录（checkpoints, loras, vae, controlnet 等）、输入/输出/临时目录、自定义节点目录等。支持动态添加路径、基础目录重配置、多用户目录隔离 |
| **关键文件** | `__init__.py`(21KB)、`user_directory.py`（用户目录管理） |
| **是否使用** | 是，核心基础设施 |
| **是否可删除** | 否 |

---

### 13. `server/` — HTTP/WebSocket 服务器

| 属性 | 说明 |
|------|------|
| **功能** | ComfyUI 的核心服务器，基于 aiohttp。`PromptServer` 负责 HTTP 路由注册、WebSocket 连接管理、工作流提交和执行控制、图像/模型文件服务、用户管理、自定义节点管理、子图管理、进度通知和预览图像推送 |
| **关键文件** | `__init__.py`(62KB) — PromptServer 类 |
| **是否使用** | 是，核心服务器 |
| **是否可删除** | 否 |

---

### 14. `node_helpers/` — 节点辅助函数

| 属性 | 说明 |
|------|------|
| **功能** | 提供节点开发中常用的辅助函数：conditioning 值修改、安全 PIL 图像加载、可配置哈希函数、字符串到 torch 数据类型转换、图像 alpha 通道修复等 |
| **是否使用** | 是 |
| **是否可删除** | 否 |

---

### 15. `protocol/` — 二进制协议定义

| 属性 | 说明 |
|------|------|
| **功能** | 定义 WebSocket 二进制消息的事件类型常量：PREVIEW_IMAGE(1)、UNENCODED_PREVIEW_IMAGE(2)、TEXT(3)、PREVIEW_IMAGE_WITH_METADATA(4) |
| **是否使用** | 是 |
| **是否可删除** | 否 |

---

### 16. `latent_preview/` — 潜空间预览

| 属性 | 说明 |
|------|------|
| **功能** | 将推理过程中的潜空间表示解码为可预览的图像。支持 TAESD、TAEHV（视频）、简单线性预览等多种预览方法 |
| **是否使用** | 是 |
| **是否可删除** | 否 |

---

### 17. `middleware/` — 服务器中间件

| 属性 | 说明 |
|------|------|
| **功能** | aiohttp 服务器中间件：`cache_middleware` 为静态资源设置缓存策略；`user_isolation_middleware` 在多用户环境下自动提取和验证用户身份，确保数据隔离 |
| **关键文件** | `cache_middleware.py`、`user_isolation_middleware.py` |
| **是否使用** | 是 |
| **是否可删除** | 否 |

---

### 18. `utils/` — 通用工具包

| 属性 | 说明 |
|------|------|
| **功能** | 提供跨模块的通用工具函数，主要是配置加载（extra_model_paths.yaml）和依赖管理/版本验证 |
| **关键文件** | `extra_config.py`、`install_util.py`、`json_util.py`、`mime_types.py`、`requirements.txt` |
| **是否使用** | 是 |
| **是否可删除** | 否 |

---

### 19. `custom_nodes/` — 自定义节点目录

| 属性 | 说明 |
|------|------|
| **功能** | 用户安装的自定义节点存放目录。ComfyUI 启动时会扫描此目录下的所有 Python 模块并加载其中的节点。当前仅包含一个内置的 WebSocket 图像保存节点和一个示例模板 |
| **是否使用** | 是，用户扩展点 |
| **是否可删除** | 否（但内部示例文件可清理） |

---

## 二、定制扩展模块（非上游代码，中文注释）

### 20. `model_manager/` — 统一模型管理器

| 属性 | 说明 |
|------|------|
| **功能** | 统一的模型调用抽象层，支持本地部署模型和第三方 API 模型的混合调用。提供模型注册、配置加载、本地/API 模型管理等功能 |
| **关键文件** | `base.py`（基础接口）、`local_manager.py`（本地模型管理器）、`api_manager.py`（API 模型管理器）、`config_manager.py`（配置管理器）、`registry.py`（模型注册表） |
| **是否使用** | 是，定制扩展 |
| **是否可删除** | 否（定制核心功能，删除将破坏统一模型调用） |

---

### 21. `model_providers/` — 模型提供商适配器

| 属性 | 说明 |
|------|------|
| **功能** | 不同 AI 模型提供商的适配器实现，与 `model_manager/` 配合使用。每个提供商封装了特定 API 的调用逻辑 |
| **关键文件** | `base_provider.py`、`local_provider.py`、`openai_provider.py`、`anthropic_provider.py`、`stability_provider.py` |
| **是否使用** | 是，定制扩展 |
| **是否可删除** | 否（与 model_manager 配套） |

---

### 22. `nodes_unified_model/` — 统一模型节点

| 属性 | 说明 |
|------|------|
| **功能** | 提供统一的模型加载和推理节点（UnifiedModelLoader, UnifiedModelInference），支持本地和 API 模型。与 `model_manager/` 和 `model_providers/` 配合使用 |
| **关键文件** | `__init__.py`(23KB) |
| **是否使用** | 是，定制扩展 |
| **是否可删除** | 否（与 model_manager 配套） |

---

### 23. `api_server/` — 扩展 API 路由层

| 属性 | 说明 |
|------|------|
| **功能** | 独立于核心 `server/` 的 API 路由层，提供更结构化的 REST API 端点。包括用户认证（登录/注册/验证码）、配置管理、3D 资产管理、终端日志、用户数据等功能 |
| **关键子目录** | `routes/`（internal_routes, login_routes, config_routes, asset_3d_routes, userdata_routes）、`services/`（terminal_service）、`utils/`（file_operations） |
| **是否使用** | 是，定制扩展 |
| **是否可删除** | 否（多用户系统核心路由） |

---

### 24. `alembic_db/` — 数据库迁移

| 属性 | 说明 |
|------|------|
| **功能** | 使用 Alembic 管理 SQLAlchemy 数据库迁移。6 个迁移脚本：初始资产表、合并到资产引用表、添加元数据和作业 ID、用户数据隔离、用户和验证码表、用户配置隔离 |
| **关键子目录** | `versions/`（6 个迁移脚本） |
| **是否使用** | 是 |
| **是否可删除** | 否（数据库迁移必需） |

---

### 25. `app/` — 应用层代码

| 属性 | 说明 |
|------|------|
| **功能** | ComfyUI 的应用层，封装了多用户系统的核心后端业务逻辑：用户管理、资产管理、数据库访问、前端管理、自定义节点管理、子图管理、节点替换管理、应用设置、执行上下文等 |
| **关键文件** | `user_manager.py`(32KB)、`model_manager.py`、`custom_node_manager.py`、`subgraph_manager.py`、`frontend_management.py`、`app_settings.py`、`logger.py`、`execution_context.py` |
| **关键子目录** | `assets/`（资产管理子系统）、`database/`（SQLAlchemy models, session 管理）、`services/`（captcha, auth, user_config, asset_3d 等业务服务）、`workflows/`（工作流 API） |
| **是否使用** | 是，多用户系统核心 |
| **是否可删除** | 否 |

---

## 三、前端相关目录

### 26. `ComfyUI_frontend/` — 主前端源码（独立 git 仓库）

| 属性 | 说明 |
|------|------|
| **功能** | 整个前端的核心开发目录，拥有独立的 `.git` 仓库。Vue 3 + TypeScript 前端，使用 pnpm monorepo 管理。构建产物通过 `scripts/sync_frontend.py` 同步到 `web/` 目录 |
| **关键子目录** | `src/`（前端源码）、`dist/`（构建输出）、`apps/`（desktop-ui, website）、`packages/`（7 个共享包）、`browser_tests/`（Playwright E2E 测试）、`docs/`（前端文档）、`scripts/`（CI/CD 脚本）、`public/`（公共资源） |
| **是否使用** | 是，前端核心 |
| **是否可删除** | 否 |

---

### 27. `web/` — 服务端加载的前端静态文件

| 属性 | 说明 |
|------|------|
| **功能** | Python 后端从此目录提供前端服务。包含编译后的 JS/CSS、核心扩展脚本、前端脚本（api.js, app.js, ui.js, widgets.js 等）、字体和光标资源 |
| **关键子目录** | `assets/`（编译后 JS/CSS）、`extensions/core/`（核心扩展）、`scripts/`（前端脚本） |
| **是否使用** | 是，运行时必需 |
| **是否可删除** | 否（但可从 ComfyUI_frontend 重新构建） |

---

### 28. `src/` — 前端核心源码（位于 ComfyUI_frontend/src/）

| 属性 | 说明 |
|------|------|
| **功能** | Vue 3 + TypeScript 前端所有业务逻辑所在 |
| **关键子目录** | `components/`（42 个 Vue 组件目录）、`composables/`（17 个组合式函数）、`stores/`（50+ 个 Pinia store）、`services/`（服务层）、`platform/`（22 个平台模块）、`renderer/`（渲染层）、`lib/litegraph/`（图形库）、`extensions/core/`（核心扩展）、`locales/`（13 种语言国际化）、`scripts/`（api.ts 47KB, app.ts 75KB） |
| **是否使用** | 是 |
| **是否可删除** | 否 |

---

### 29. `apps/` — 子应用

| 属性 | 说明 |
|------|------|
| **功能** | pnpm monorepo 子应用：`desktop-ui/`（ComfyUI 桌面版 Electron 应用）、`website/`（ComfyUI 官方网站，Nuxt/Content） |
| **是否使用** | 是 |
| **是否可删除** | 视需求（如不需要桌面端和官网可删除，但不影响核心功能） |

---

### 30. `packages/` — Monorepo 共享包

| 属性 | 说明 |
|------|------|
| **功能** | pnpm workspace 管理的共享包 |
| **包含包** | `comfyui-desktop-bridge-types`（Electron 桥接类型）、`design-system`（CSS 样式、图标）、`ingest-types`（Zod 验证模式）、`object-info-parser`（节点信息解析器）、`registry-types`（注册表类型，1.5MB 自动生成）、`shared-frontend-utils`（共享工具）、`tailwind-utils`（Tailwind CSS 工具） |
| **是否使用** | 是 |
| **是否可删除** | 否 |

---

### 31. `public/` — 公共静态资源

| 属性 | 说明 |
|------|------|
| **功能** | Vite 开发时的公共资源目录 |
| **内容** | `assets/images/`、`cursor/`（空）、`fonts/`（空） |
| **是否使用** | 是 |
| **是否可删除** | 否（但空子目录可清理） |

---

## 四、构建/CI/配置目录

### 32. `build/` — 构建配置

| 属性 | 说明 |
|------|------|
| **功能** | Vite 构建插件（comfyAPIPlugin，在 vite.config.mts 中引用） |
| **内容** | `plugins/` |
| **是否使用** | 是 |
| **是否可删除** | 否 |

---

### 33. `.ci/` — CI 配置

| 属性 | 说明 |
|------|------|
| **功能** | Windows 发布包的 CI 文件，包含不同 GPU 厂商（AMD/Intel/NVIDIA）的启动脚本和更新脚本 |
| **关键子目录** | `update_windows/`、`windows_amd_base_files/`、`windows_intel_base_files/`、`windows_nightly_base_files/`、`windows_nvidia_base_files/` |
| **是否使用** | 是（Windows 发布流程必需） |
| **是否可删除** | 视需求（如不需要 Windows 打包可删除） |

---

### 34. `.github/` — GitHub 配置

| 属性 | 说明 |
|------|------|
| **功能** | GitHub Actions 工作流（26 个 CI/CD workflow）、Issue 模板、PR 模板、CI 脚本 |
| **关键子目录** | `workflows/`（26 个 workflow 文件）、`ISSUE_TEMPLATE/`、`PULL_REQUEST_TEMPLATE/`、`scripts/` |
| **是否使用** | 是 |
| **是否可删除** | 视需求（如不使用 GitHub CI 可删除） |

---

### 35. `.husky/` — Git Hooks

| 属性 | 说明 |
|------|------|
| **功能** | 标准 Husky 安装，管理 pre-commit、pre-push 等 git hooks |
| **是否使用** | 是 |
| **是否可删除** | 视需求（删除后 git hooks 不再生效） |

---

### 36. `.storybook/`（根目录） — Storybook 配置

| 属性 | 说明 |
|------|------|
| **功能** | 根目录的 Storybook 配置（空目录） |
| **是否使用** | 否（实际 Storybook 配置在 `ComfyUI_frontend/.storybook/` 下） |
| **是否可删除** | 是，空目录，可安全删除 |

---

### 37. `.vscode/` — VSCode 配置

| 属性 | 说明 |
|------|------|
| **功能** | VSCode 项目配置，极简（仅 extensions.json 和 settings.json，内容极少） |
| **是否使用** | 是（但不影响项目运行） |
| **是否可删除** | 是，可安全删除 |

---

### 38. `config/` — 配置文件集合

| 属性 | 说明 |
|------|------|
| **功能** | 从前端项目复制/共享的配置文件集合，30+ 个配置文件 |
| **内容** | codecov.yml、.coderabbit.yaml、comfyui_config.sh、comfyui_optimized_config.sh、comfyui.service、components.json、.editorconfig、.env_example、extra_model_paths.yaml.example、.i18nrc.cjs、knip.config.ts、lint-staged.config.ts、manifest.json、model_optimization_config.yaml、playwright.config.ts、pyproject.toml、pytest.ini 等 |
| **是否使用** | 是 |
| **是否可删除** | 否（部分配置为运行时必需） |

---

## 五、AI 代理配置目录

### 39. `.agents/` — AI 代理检查规则 [已删除]

| 属性 | 说明 |
|------|------|
| **功能** | AI 代理检查规则配置。根目录仅有空 `checks/` 和一个自动生成的版本文件；实际检查规则在 `ComfyUI_frontend/.agents/checks/` 下（26 个检查文件，涵盖安全、性能、架构等） |
| **是否使用** | 已删除 |
| **是否可删除** | 已删除（2026-07-15） |

---

### 40. `.claude/` — Claude AI 配置 [已删除]

| 属性 | 说明 |
|------|------|
| **功能** | Claude AI 助手指令和技能配置。根目录有 12 个技能目录；`ComfyUI_frontend/.claude/commands/` 有 8 个命令文件 |
| **是否使用** | 已删除 |
| **是否可删除** | 已删除（2026-07-15） |

---

### 41. `.codeartsdoer/` — CodeArts 配置 [已删除]

| 属性 | 说明 |
|------|------|
| **功能** | 华为云 CodeArts 代码智能体配置。运行时自动生成，已添加到 .gitignore |
| **是否使用** | 已删除（运行时可能自动重建，已加入 .gitignore 忽略） |
| **是否可删除** | 已删除（2026-07-15），.gitignore 已添加忽略规则 |

---

## 六、测试目录

### 42. `browser_tests/` — 浏览器端到端测试

| 属性 | 说明 |
|------|------|
| **功能** | Playwright E2E 浏览器测试，37 个测试目录覆盖画布设置、调色板、复制粘贴、执行、组节点、图像比较、交互、3D 加载、蒙版编辑器、迷你地图、节点搜索、队列、侧边栏、子图、模板、顶部栏、视口等 |
| **关键子目录** | `tests/`（37 个测试目录）、`fixtures/`（测试夹具）、`assets/`（测试资产）、`types/`、`utils/` |
| **是否使用** | 是 |
| **是否可删除** | 视需求（删除不影响运行，但影响质量保障） |

---

### 43. `tests/` — 集成测试

| 属性 | 说明 |
|------|------|
| **功能** | Python 集成/推理/安全测试 |
| **关键子目录** | `execution/`、`inference/`、`integration/`、`security/`、`unit/`、`unified_model/`、`compare/` |
| **关键文件** | `conftest.py`、`start_and_test.py`、`test_asset_seeder.py`、`test_frontend_api.js`、`verify_deployment.py`、`verify_installation.py` |
| **是否使用** | 是 |
| **是否可删除** | 视需求（删除不影响运行，但影响质量保障） |

---

### 44. `tests-unit/` — 单元测试

| 属性 | 说明 |
|------|------|
| **功能** | Python 单元测试，16 个测试目录 |
| **关键子目录** | `app_test`、`assets_test`、`comfy_api_test`、`comfy_extras_test`、`comfy_quant`、`comfy_test`、`execution_test`、`folder_paths_test`、`prompt_server_test`、`server_test` 等 |
| **是否使用** | 是 |
| **是否可删除** | 视需求（删除不影响运行，但影响质量保障） |

---

## 七、文档目录

### 45. `docs/` — 项目文档

| 属性 | 说明 |
|------|------|
| **功能** | 多用户系统文档，包含文档索引、多用户系统说明、用户数据隔离总结/指南/完成报告、服务管理指南、故障排除、第三方声明、OpenAPI 规范（365KB） |
| **关键子目录** | `deployment/`、`development/`、`implementation/`、`operations/` |
| **是否使用** | 是 |
| **是否可删除** | 视需求（删除不影响运行，但影响开发参考） |

---

## 八、数据/运行时目录

### 46. `models/` — 模型文件

| 属性 | 说明 |
|------|------|
| **功能** | AI 模型存储目录，26 个子目录对应不同模型类型 |
| **子目录** | audio_encoders、background_removal、checkpoints、clip、clip_vision、configs、controlnet、detection、diffusers、diffusion_models、embeddings、frame_interpolation、geometry_estimation、gligen、hypernetworks、latent_upscale_models、loras、model_patches、optical_flow、photomaker、style_models、text_encoders、unet、upscale_models、vae、vae_approx |
| **是否使用** | 是，运行时必需 |
| **是否可删除** | 否（但空子目录可清理） |

---

### 47. `input/` — 输入文件

| 属性 | 说明 |
|------|------|
| **功能** | 用户上传的输入文件（图片、3D、音频、视频），支持多用户目录隔离 |
| **是否使用** | 是，运行时必需 |
| **是否可删除** | 否 |

---

### 48. `output/` — 输出文件

| 属性 | 说明 |
|------|------|
| **功能** | 生成的图片/视频输出，支持多用户目录隔离 |
| **是否使用** | 是，运行时必需 |
| **是否可删除** | 否（但历史输出文件可定期清理） |

---

### 49. `user/` — 用户数据

| 属性 | 说明 |
|------|------|
| **功能** | 多用户系统核心数据，包含各用户目录（设置、工作流、子图、模板）、管理器数据（批处理历史、缓存、配置、快照）、SQLite 用户数据库、资产数据库、用户配置 |
| **是否使用** | 是，运行时必需 |
| **是否可删除** | 否 |

---

### 50. `data/` — 数据文件

| 属性 | 说明 |
|------|------|
| **功能** | SQLite 数据库（comfy.db）、模板配置、进程 ID 文件、性能报告 |
| **是否使用** | 是，运行时必需 |
| **是否可删除** | 否 |

---

### 51. `cache/` — 缓存

| 属性 | 说明 |
|------|------|
| **功能** | 三级缓存系统，包含 `l3/`（空）、`level_demo/`、`simple_demo/` |
| **是否使用** | 是 |
| **是否可删除** | 部分（空子目录 `l3/` 可清理，缓存数据可定期清理） |

---

### 52. `temp/` — 临时文件

| 属性 | 说明 |
|------|------|
| **功能** | 用户临时文件目录 |
| **是否使用** | 是 |
| **是否可删除** | 内容可定期清理，目录保留 |

---

### 53. `logs/` — 日志文件

| 属性 | 说明 |
|------|------|
| **功能** | 日志文件存储，包含归档目录和服务检查/监控脚本 |
| **是否使用** | 是 |
| **是否可删除** | 内容可定期清理，目录保留 |

---

## 九、脚本/工具/示例目录

### 54. `scripts/` — 工具脚本

| 属性 | 说明 |
|------|------|
| **功能** | 运维和管理脚本集合 |
| **关键脚本** | `sync_frontend.py`（前端同步）、`service_manager.sh`（服务管理）、`check_service.sh`（状态检查）、`monitor_service.py`（服务监控）、`api_audit_report.py`（API 审计）、`cleanup_project.py`（项目清理）、`diagnose_user_data.py`/`fix_user_data.py`（用户数据诊断/修复）、`init_user_directories.py`（用户目录初始化）、多个迁移脚本、GPU 内存清理脚本、性能优化脚本、国内下载/镜像脚本 |
| **是否使用** | 是 |
| **是否可删除** | 否（运维必需） |

---

### 55. `tools/` — 工具

| 属性 | 说明 |
|------|------|
| **功能** | 完全为空 |
| **是否使用** | 否 |
| **是否可删除** | 是，空目录，可安全删除 |

---

### 56. `examples/` — 示例代码

| 属性 | 说明 |
|------|------|
| **功能** | 内存优化、缓存使用、统一模型的示例代码 |
| **内容** | `memory_optimization_example.py`、`simple_cache_example.py`、`three_level_cache_example.py`、`unified_model/` |
| **是否使用** | 是（开发参考） |
| **是否可删除** | 视需求（不影响运行） |

---

### 57. `optimization_examples/` — 优化示例

| 属性 | 说明 |
|------|------|
| **功能** | 内存池、多级缓存、智能调度器的优化示例 |
| **内容** | `memory_pool.py`、`multi_level_cache.py`、`smart_scheduler.py` |
| **是否使用** | 是（开发参考） |
| **是否可删除** | 视需求（不影响运行） |

---

### 58. `script_examples/` — 脚本示例

| 属性 | 说明 |
|------|------|
| **功能** | API 使用示例 |
| **内容** | `basic_api_example.py`、`websockets_api_example.py`、`websockets_api_example_ws_images.py` |
| **是否使用** | 是（开发参考） |
| **是否可删除** | 视需求（不影响运行） |

---

### 59. `blueprints/` — 蓝图/工作流模板

| 属性 | 说明 |
|------|------|
| **功能** | 预定义工作流模板，70+ 个 JSON 工作流文件（Text to Image、Image to Video、Image Edit、Inpainting、Outpainting、3D、Audio、Video、Segmentation、Depth Estimation 等） |
| **是否使用** | 是 |
| **是否可删除** | 视需求（删除不影响核心功能，但影响用户体验） |

---

### 60. `workflows/` — 工作流文件

| 属性 | 说明 |
|------|------|
| **功能** | Git 管理的工作流文件 |
| **内容** | `2tu_flux2.json`（Flux 2 图像生成）、`video_wan2.json`（Wan 2.2 视频生成）、`README.md` |
| **是否使用** | 是 |
| **是否可删除** | 视需求 |

---

## 十、关键配置文件

### 61. 根目录配置文件

| 文件 | 功能 | 是否使用 | 是否可删除 |
|------|------|----------|------------|
| `package.json` | 前端 npm 包配置，pnpm monorepo | 是 | 否 |
| `pnpm-lock.yaml` | pnpm 锁文件 | 是 | 否 |
| `pnpm-workspace.yaml` | pnpm 工作区配置 | 是 | 否 |
| `vite.config.mts` | Vite 构建配置（23KB） | 是 | 否 |
| `vite.electron.config.mts` | Electron 构建配置 | 是 | 否 |
| `vite.types.config.mts` | 类型构建配置 | 是 | 否 |
| `tsconfig.json` | TypeScript 配置 | 是 | 否 |
| `tsconfig.types.json` | TypeScript 类型配置 | 是 | 否 |
| `eslint.config.ts` | ESLint 扁平配置（17KB） | 是 | 否 |
| `.stylelintrc.json` | Stylelint 配置 | 是 | 否 |
| `vitest.setup.ts` | Vitest 测试配置 | 是 | 否 |
| `pytest.ini` | Python 测试配置 | 是 | 否 |
| `requirements.txt` | Python 依赖（指向 utils/requirements.txt） | 是 | 否 |
| `index.html` | 前端入口 HTML（21KB） | 是 | 否 |
| `global.d.ts` | 全局 TypeScript 类型声明 | 是 | 否 |
| `CODEOWNERS` | 代码所有者定义 | 是 | 视需求 |
| `CONTRIBUTING.md` | 贡献指南 | 是 | 视需求 |
| `LICENSE` | GPL-3.0 许可证 | 是 | 否 |
| `README.md` | 项目主文档（中文） | 是 | 否 |
| `.gitattributes` | Git 属性配置 | 是 | 否 |
| `.git-blame-ignore-revs` | Git blame 忽略修订 | 是 | 否 |
| `.gitignore` | Git 忽略规则 | 是 | 否 |

---

### 62. 运行时生成文件（可清理）

| 文件 | 功能 | 是否使用 | 是否可删除 |
|------|------|----------|------------|
| `comfyui.log` | 运行日志 | 是（运行时生成） | 是（可定期清理） |
| `.coverage` | Python 覆盖率数据 | 测试时生成 | 是 |
| `coverage_report.json` | 覆盖率报告（4.5MB） | 测试时生成 | 是 |
| `diagnostic_report.json` | 诊断报告 | 诊断时生成 | 是 |
| `fix_report_dryrun.json` | 修复报告（试运行） | 修复时生成 | 是 |
| `fix_report_live.json` | 修复报告（实际运行） | 修复时生成 | 是 |
| `validation_report.json` | 验证报告 | 验证时生成 | 是 |
| `.pytest_cache/` | pytest 缓存 | 测试时生成 | 是 |
| `node_modules/` | npm 依赖 | 是 | 否（删除后需重新安装） |

---

## 十一、可删除/可清理目录汇总

### 可安全删除的空目录

| 目录 | 原因 |
|------|------|
| `tools/` | 完全为空 |
| `.storybook/`（根目录） | 空目录，实际配置在 ComfyUI_frontend/ 下 |
| `migrations/` | 空目录，实际迁移在 alembic_db/ 下 |
| `public/cursor/` | 空目录 |
| `public/fonts/` | 空目录 |
| `cache/l3/` | 空目录 |
| `scripts/oom_fix_tool/` | 空目录 |
| `.agents/checks/`（根目录） | 空目录，实际检查在 ComfyUI_frontend/ 下 |
| `.codeartsdoer/agents/` | 空目录 |

### 可定期清理的运行时文件

| 文件/目录 | 原因 |
|-----------|------|
| `comfyui.log` | 运行日志，可定期归档/清理 |
| `output/` 中的历史文件 | 生成的图片/视频，可定期归档 |
| `logs/` 中的历史日志 | 可定期归档 |
| `temp/` 中的临时文件 | 可定期清理 |
| `.coverage`、`coverage_report.json` | 测试覆盖率数据，可清理 |
| `diagnostic_report.json`、`fix_report_*.json`、`validation_report.json` | 诊断/修复/验证报告，可清理 |
| `.pytest_cache/` | pytest 缓存，可清理 |

### 视需求可删除的目录

| 目录 | 条件 |
|------|------|
| `apps/` | 如不需要桌面端和官网 |
| `.ci/` | 如不需要 Windows 打包 |
| `.github/` | 如不使用 GitHub CI |
| `.husky/` | 如不需要 git hooks |
| `.claude/` | 如不使用 Claude AI 辅助开发 |
| `.codeartsdoer/` | 如不使用 CodeArts AI 辅助开发 |
| `.vscode/` | 如不使用 VSCode |
| `browser_tests/` | 如不需要 E2E 测试 |
| `tests/`、`tests-unit/` | 如不需要测试 |
| `docs/` | 如不需要开发文档 |
| `examples/`、`optimization_examples/`、`script_examples/` | 如不需要示例参考 |
| `blueprints/` | 如不需要预定义工作流模板 |
| `workflows/` | 如不需要内置工作流 |

---

## 十二、项目架构总结

### 核心架构层次

```
main.py (入口)
  ├── comfy/ (核心推理引擎)
  ├── comfy_execution/ (工作流执行引擎)
  ├── execution/ (执行调度器)
  ├── nodes/ (内置节点) + comfy_extras/ (扩展节点) + comfy_api_nodes/ (API节点)
  ├── comfy_api/ (版本化API框架)
  ├── server/ (HTTP/WS服务器) + api_server/ (扩展API路由) + middleware/ (中间件)
  ├── app/ (应用层: 用户/资产/数据库)
  ├── folder_paths/ (路径管理) + utils/ (工具)
  └── model_manager/ + model_providers/ + nodes_unified_model/ (统一模型管理, 定制扩展)
```

### 定制扩展 vs 上游代码

| 类别 | 目录 |
|------|------|
| **上游 ComfyUI 代码** | comfy/, comfy_extras/, comfy_api/, comfy_execution/, execution/, nodes/, server/, folder_paths/, node_helpers/, protocol/, latent_preview/, cuda_malloc/, comfy_config/, comfyui_version/, utils/, custom_nodes/, middleware/ |
| **定制扩展（中文注释）** | model_manager/, model_providers/, nodes_unified_model/, api_server/, alembic_db/, app/ |
| **前端代码** | ComfyUI_frontend/, web/, src/, apps/, packages/ |
| **构建/CI** | build/, .ci/, .github/, .husky/, config/ |
| **测试** | browser_tests/, tests/, tests-unit/ |
| **数据/运行时** | models/, input/, output/, user/, data/, cache/, temp/, logs/ |
| **文档/示例** | docs/, examples/, optimization_examples/, script_examples/, blueprints/, workflows/ |
| **AI 代理配置** | .agents/, .claude/, .codeartsdoer/ |

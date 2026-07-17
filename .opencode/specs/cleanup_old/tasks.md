# 清理旧版本遗留内容 - 编码任务规划

## 阶段1：后端文件删除

### 任务1.1：删除废弃迁移脚本
- **操作**：删除 `scripts/migrate_output_structure.py`
- **原因**：文件头部标记为 DEPRECATED，迁移路径 `output/{user_id}/` -> `output/user_{user_id}/` 已过时，当前系统使用 `user/{user_id}/output/` 结构
- **前提**：确认替代脚本 `scripts/migrate_user_asset_structure.py` 存在
- **验证**：`ls scripts/migrate_user_asset_structure.py` 确认替代脚本存在

### 任务1.2：删除冗余配置文件 - config/pytest.ini
- **操作**：删除 `config/pytest.ini`
- **原因**：与根目录 `pytest.ini` 内容完全相同，pytest 不会自动识别 config/ 下的配置
- **验证**：确认根目录 `pytest.ini` 存在且内容一致

### 任务1.3：删除冗余配置文件 - comfyui_optimized_config.sh
- **操作**：删除 `config/comfyui_optimized_config.sh`
- **原因**：硬编码特定硬件（RTX 4070 Ti SUPER），与主配置重复，未被任何脚本引用
- **验证**：无引用需要更新

### 任务1.4：删除冗余配置文件 - comfyui_config.example.sh
- **操作**：删除 `config/comfyui_config.example.sh`
- **原因**：与 `comfyui_config.sh` 内容几乎相同，无参考价值，未被任何脚本引用
- **验证**：无引用需要更新

---

## 阶段2：文档清理

### 任务2.1：删除过时文档 - USER_DATA_ISOLATION_COMPLETE.md
- **操作**：删除 `docs/USER_DATA_ISOLATION_COMPLETE.md`
- **原因**：描述过时目录结构 `output/user_0/`，当前已改为 `user/0/output/`

### 任务2.2：删除过时文档 - USER_DATA_ISOLATION_SUMMARY.md
- **操作**：删除 `docs/USER_DATA_ISOLATION_SUMMARY.md`
- **原因**：被 COMPLETE 版覆盖，目录结构过时

### 任务2.3：删除过时文档 - implementation/USER_DATA_ISOLATION_DESIGN.md
- **操作**：删除 `docs/implementation/USER_DATA_ISOLATION_DESIGN.md`
- **原因**：引用已废弃的 `args.multi_user`，标记"待实现"但已实现

### 任务2.4：删除过时文档 - implementation/USER_DATA_ISOLATION_IMPLEMENTATION_REPORT.md
- **操作**：删除 `docs/implementation/USER_DATA_ISOLATION_IMPLEMENTATION_REPORT.md`
- **原因**：引用已废弃的 `args.multi_user`，目录结构过时

### 任务2.5：删除过时文档 - deployment/user_data_isolation.md
- **操作**：删除 `docs/deployment/user_data_isolation.md`
- **原因**：引用不存在的脚本（`diagnose_user_data.py`、`fix_user_data.py` 等）

### 任务2.6：删除过时文档 - operations/user_data_isolation.md
- **操作**：删除 `docs/operations/user_data_isolation.md`
- **原因**：引用不存在的脚本和模块，联系信息使用占位符

### 任务2.7：更新 docs/implementation/README.md 索引
- **操作**：编辑 `docs/implementation/README.md`，移除对已删除文档的引用
- **原因**：删除文档后索引需同步更新，避免引用不存在的文件
- **验证**：确认 README.md 中不再引用已删除的文档

---

## 阶段3：前端 authStore 存根清理（需顺序执行）

### 任务3.1：修复 ImpactTelemetryProvider.ts - 移除 authStore 引用
- **文件**：`ComfyUI_frontend/src/platform/telemetry/providers/cloud/ImpactTelemetryProvider.ts`
- **操作**：
  1. 移除 `import { useAuthStore } from '@/stores/authStore'` 导入语句
  2. 移除 `resolveCustomerIdentity()` 方法中 `if (stores.authStore.currentUser)` 分支（第113-118行），仅保留 `apiKeyAuthStore` 逻辑
  3. 移除 `stores.authStore = useAuthStore()` 初始化（如有）
- **原因**：`authStore.currentUser` 在 stub 中不存在，运行时始终为 `undefined`，此分支为死代码
- **验证**：TypeScript 编译通过，无 authStore 导入

### 任务3.2：修复 workspaceApi.ts - 替换 authStore 调用
- **文件**：`ComfyUI_frontend/src/platform/workspace/api/workspaceApi.ts`
- **操作**：
  1. 将第552行 `const authHeader = await useAuthStore().getFirebaseAuthHeaderOrThrow()` 替换为 `const authHeader = await getAuthHeaderOrThrow()`
  2. 移除 `import { useAuthStore } from '@/stores/authStore'` 导入语句（如无其他引用）
- **原因**：`getFirebaseAuthHeaderOrThrow` 在 authStore stub 中不存在，调用将导致运行时错误。本地 `getAuthHeaderOrThrow()` 函数（第341-343行）返回空对象 `{}`，与其他 API 方法一致
- **验证**：TypeScript 编译通过，无 authStore 导入

### 任务3.3：清理测试文件中的 authStore mock（16个文件）
- **操作**：对以下每个测试文件，移除 `vi.mock('@/stores/authStore', ...)` 声明及相关的 `useAuthStore` / `AuthStoreError` 导入。如果测试用例中直接使用了 authStore 的 mock 返回值，需同步移除或替换为 userStore mock
- **涉及文件**：
  1. `ComfyUI_frontend/src/components/TopMenuSection.test.ts`
  2. `ComfyUI_frontend/src/components/WorkflowTab.test.ts`
  3. `ComfyUI_frontend/src/components/useCoreCommands.test.ts`
  4. `ComfyUI_frontend/src/components/PricingTable.test.ts`
  5. `ComfyUI_frontend/src/composables/useSubscription.test.ts`
  6. `ComfyUI_frontend/src/composables/subscriptionCheckoutUtil.test.ts`
  7. `ComfyUI_frontend/src/composables/teamSubscriptionCheckoutUtil.test.ts`
  8. `ComfyUI_frontend/src/platform/telemetry/providers/cloud/ImpactTelemetryProvider.test.ts`
  9. `ComfyUI_frontend/src/platform/workspace/api/workspaceApi.test.ts`
  10. `ComfyUI_frontend/src/platform/workspace/components/WorkspaceAuthGate.test.ts`
  11. `ComfyUI_frontend/src/platform/workspace/composables/useWorkspaceAuth.test.ts`
  12. `ComfyUI_frontend/src/platform/workspace/composables/useSubscriptionCheckout.test.ts`
  13. `ComfyUI_frontend/src/platform/workspace/composables/useRemoteWidget.test.ts`
  14. `ComfyUI_frontend/src/app.test.ts`
  15. `ComfyUI_frontend/src/stores/bootstrapStore.test.ts`
  16. `ComfyUI_frontend/src/views/GraphView.test.ts`
- **验证**：每个文件修改后确认无 authStore 相关导入

### 任务3.4：删除 authStore.ts 文件
- **操作**：删除 `ComfyUI_frontend/src/stores/authStore.ts`
- **前提**：任务3.1-3.3全部完成，确认无任何文件导入 authStore
- **验证**：搜索 `authStore` 无任何导入引用

---

## 阶段4：README.md 更新

### 任务4.1：更新 README.md 标题和描述
- **文件**：`README.md`
- **操作**：
  1. 第1行：`# ComfyUI 多用户版本` → `# ComfyUI`
  2. 第10行：`基于 ComfyUI 的多用户工作流管理系统` → `基于 ComfyUI 的 AI 图像/视频生成工作流管理系统`
  3. 第16行：`新增了**多用户系统**和**数据隔离**功能` → `内置**多用户系统**和**数据隔离**功能`
  4. 第21行：`多用户系统 - 支持多用户独立使用，数据完全隔离` → `用户系统 - 支持多用户独立使用，数据完全隔离`

### 任务4.2：更新 README.md 启动命令
- **文件**：`README.md`
- **操作**：
  1. 删除第70-72行（`# 单用户模式` 及其启动命令）
  2. 第74行：`# 多用户模式（推荐）` → `# 启动服务`
  3. 第76行：`python main.py --listen 0.0.0.0 --port 8188 --multi-user` → `python main.py --listen 0.0.0.0 --port 8188`

### 任务4.3：更新 README.md 多用户系统章节
- **文件**：`README.md`
- **操作**：
  1. 将"多用户系统"独立章节（约第153-190行）合并到快速开始章节中，作为默认功能说明
  2. 第200行：`# 启动服务（多用户模式）` → `# 启动服务`

---

## 验证任务

### 任务V1：验证后端启动正常
- **操作**：运行 `python main.py --help` 确认命令行参数解析正常
- **验证**：无导入错误，无模块缺失

### 任务V2：验证前端构建正常
- **操作**：在 `ComfyUI_frontend/` 目录下运行 `pnpm build` 确认 TypeScript 编译通过
- **验证**：无编译错误，无 authStore 相关类型错误

### 任务V3：验证无残留引用
- **操作**：
  1. 搜索项目中所有 `authStore` 引用，确认无残留
  2. 搜索项目中所有 `--multi-user` 引用（排除 cli_args.py 注释），确认无残留
  3. 搜索项目中所有 `migrate_output_structure` 引用，确认无残留
- **验证**：搜索结果为空或仅剩 cli_args.py 中的注释

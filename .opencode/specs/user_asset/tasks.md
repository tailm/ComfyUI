# 用户资产隔离重构 - 编码任务清单

## 任务依赖关系

```
Task 1 (配置层改造)
  └─→ Task 2 (StorageBackend 抽象层)
        └─→ Task 3 (folder_paths 路径生成改造)
              └─→ Task 4 (user_directory.py 改造)
                    └─→ Task 5 (server 层适配)
                          └─→ Task 6 (迁移脚本)
                                └─→ Task 7 (集成验证)
```

---

## Task 1: 配置层改造 — 支持 HTTP URL 格式的用户根目录

**目标**：修改命令行参数和启动逻辑，使 `--user-directory` 同时支持本地路径和 HTTP/HTTPS URL。

**涉及文件**：
- `comfy/cli_args.py`
- `main.py`

**具体步骤**：

1. 修改 `comfy/cli_args.py` 中 `--user-directory` 参数：
   - 将类型从 `is_valid_directory` 改为 `str`
   - 更新 help 文本，说明支持本地路径和 HTTP/HTTPS URL

2. 修改 `main.py` 中 `apply_custom_paths()` 函数：
   - 当 `args.user_directory` 以 `http://` 或 `https://` 开头时，直接赋值给 `folder_paths.set_user_directory()`，不做 `os.path.abspath()` 转换
   - 当为本地路径时，保持现有 `os.path.abspath()` 逻辑
   - 添加配置验证：本地路径必须存在且可读写，远程 URL 格式必须合法

**验收条件**：
- `--user-directory /data/users` 正常设置本地路径
- `--user-directory http://192.168.50.228:8188/user` 正常设置远程 URL
- 不指定 `--user-directory` 时默认使用 `{base_path}/user/`
- 本地路径不存在时启动报错并给出明确提示

---

## Task 2: 新建 StorageBackend 存储后端抽象层

**目标**：创建 `folder_paths/storage_backend.py`，实现存储后端抽象基类、本地存储后端、远程存储后端和工厂类。

**涉及文件**：
- `folder_paths/storage_backend.py`（新建）

**具体步骤**：

1. 创建 `StorageBackend` 抽象基类：
   - `get_user_path(user_id, dir_type) -> str`：获取用户目录路径
   - `read_file(path) -> bytes`：读取文件内容
   - `write_file(path, data) -> str`：写入文件
   - `list_files(dir_path, extensions=None) -> list[str]`：列出文件
   - `file_exists(path) -> bool`：检查文件是否存在
   - `ensure_dir(path) -> None`：确保目录存在
   - `delete_file(path) -> bool`：删除文件
   - `is_remote() -> bool`：是否远程存储

2. 创建 `LocalStorageBackend` 实现类：
   - 构造函数接收 `user_root: str` 本地路径
   - `get_user_path()` 返回 `os.path.join(user_root, user_id, dir_type)`
   - `read_file()` 使用 `open(path, 'rb')` 读取
   - `write_file()` 使用 `open(path, 'wb')` 写入
   - `list_files()` 使用 `os.listdir()` + 扩展名过滤
   - `file_exists()` 使用 `os.path.exists()`
   - `ensure_dir()` 使用 `os.makedirs(path, exist_ok=True)`
   - `delete_file()` 使用 `os.remove()`
   - `is_remote()` 返回 `False`

3. 创建 `RemoteStorageBackend` 实现类：
   - 构造函数接收 `user_root: str`（HTTP URL）和可选的 `StorageConfig`
   - `get_user_path()` 返回 URL 拼接：`{user_root}/{user_id}/{dir_type}`
   - `read_file()` 通过 HTTP GET 获取文件内容，使用 `aiohttp`，超时 30 秒，重试 3 次
   - `write_file()` 通过 HTTP PUT 上传文件，超时 30 秒，重试 3 次
   - `list_files()` 通过 HTTP GET 获取文件列表 JSON
   - `file_exists()` 通过 HTTP HEAD 检查
   - `ensure_dir()` 通过 HTTP POST 创建目录（如远程服务支持）
   - `delete_file()` 通过 HTTP DELETE 删除
   - `is_remote()` 返回 `True`
   - 内置重试机制：指数退避，最多 3 次
   - 内置安全检查：验证响应来源，防止重定向攻击

4. 创建 `StorageConfig` 数据类：
   - `user_root: str`：用户根目录路径
   - `is_remote: bool`：是否远程模式
   - `timeout: int = 30`：远程模式超时（秒）
   - `max_retries: int = 3`：远程模式最大重试次数
   - `retry_backoff: float = 1.0`：重试退避因子

5. 创建 `StorageBackendFactory` 工厂类：
   - `get_backend() -> StorageBackend`：获取当前存储后端实例（单例）
   - `_create_backend() -> StorageBackend`：根据 `folder_paths.user_directory` 判断创建本地或远程后端
   - `reset()`：重置后端实例（配置变更时调用）

**验收条件**：
- `LocalStorageBackend` 所有方法正确操作本地文件系统
- `RemoteStorageBackend` 所有方法通过 HTTP 请求操作远程存储
- `StorageBackendFactory` 根据配置自动选择正确的后端
- 远程模式支持重试和超时控制

---

## Task 3: folder_paths/__init__.py 路径生成逻辑改造

**目标**：修改 `folder_paths/__init__.py` 中的用户目录路径生成函数，将目录结构从 `output/user_{id}/` 改为 `user/{id}/output/`。

**涉及文件**：
- `folder_paths/__init__.py`

**具体步骤**：

1. 修改 `get_user_output_directory(user_id)` 函数：
   - 旧：`os.path.join(output_directory, f"user_{user_id}")`
   - 新：`os.path.join(user_directory, user_id, "output")`
   - 保留 `os.makedirs(user_output_dir, exist_ok=True)` 逻辑

2. 修改 `get_user_input_directory(user_id)` 函数：
   - 旧：`os.path.join(input_directory, f"user_{user_id}")`
   - 新：`os.path.join(user_directory, user_id, "input")`
   - 保留 `os.makedirs(user_input_dir, exist_ok=True)` 逻辑

3. 修改 `get_user_temp_directory(user_id)` 函数：
   - 旧：`os.path.join(temp_directory, f"user_{user_id}")`
   - 新：`os.path.join(user_directory, user_id, "temp")`
   - 保留 `os.makedirs(user_temp_dir, exist_ok=True)` 逻辑

4. 修改 `get_user_directory_by_type(directory_type, user_id)` 函数：
   - 内部路由逻辑不变，仅底层调用已自动变更

5. 修改 `get_system_user_directory(name)` 函数：
   - 旧：`os.path.join(get_user_directory(), f"{SYSTEM_USER_PREFIX}{name}")`
   - 新：保持不变（系统用户目录仍在 `user/` 下）

6. 修改 `get_public_user_directory(user_id)` 函数：
   - 旧：`os.path.join(get_user_directory(), user_id)`
   - 新：保持不变（公共用户目录路径不变）

7. 修改 `get_input_subfolders()` 函数：
   - 确保使用 `get_input_directory()` 获取路径（已自动适配新结构）

8. 添加旧目录结构检测与提示：
   - 在模块初始化时检查 `output/user_*` 和 `input/user_*` 目录是否存在
   - 如果存在，输出日志提示管理员运行迁移工具

**验收条件**：
- `get_user_output_directory("1")` 返回 `{user_directory}/1/output`
- `get_user_input_directory("1")` 返回 `{user_directory}/1/input`
- `get_user_temp_directory("1")` 返回 `{user_directory}/1/temp`
- `get_output_directory()` 在有执行上下文时自动路由到用户目录
- `get_input_directory()` 在有执行上下文时自动路由到用户目录
- 旧目录结构存在时输出迁移提示日志

---

## Task 4: folder_paths/user_directory.py 改造

**目标**：修改 `user_directory.py` 中的所有用户目录函数，适配新的目录结构。

**涉及文件**：
- `folder_paths/user_directory.py`

**具体步骤**：

1. 修改 `get_user_output_directory(user_id)` 函数：
   - 旧：`os.path.join(folder_paths.output_directory, f"user_{user_id}")`
   - 新：`os.path.join(folder_paths.user_directory, user_id, "output")`
   - 子目录创建：`images/`、`temp/`、`cache/` 改为在 `output/` 下创建

2. 修改 `get_user_data_directory(user_id)` 函数：
   - 旧：`os.path.join(folder_paths.user_directory, f"user_{user_id}")`
   - 新：`os.path.join(folder_paths.user_directory, user_id)`
   - 子目录 `workflows/`、`prompts/`、`custom/` 保持不变

3. 修改 `get_user_temp_directory(user_id)` 函数：
   - 旧：`os.path.join(get_user_output_directory(user_id), "temp")`
   - 新：`os.path.join(folder_paths.user_directory, user_id, "temp")`

4. 修改 `validate_user_path(file_path, user_id)` 函数：
   - 旧：检查 `output/user_{id}` 和 `user/user_{id}`
   - 新：统一检查 `user/{id}/` 下的所有子目录（output、input、temp、workflows 等）

5. 修改 `get_user_disk_usage(user_id)` 函数：
   - 旧：分别计算 `output/user_{id}` 和 `user/user_{id}` 的大小
   - 新：统一计算 `user/{id}/` 的大小

6. 修改 `get_user_disk_usage_summary(user_ids)` 函数：
   - 旧：扫描 `output_base` 和 `user_base` 下的 `user_*` 目录
   - 新：扫描 `user_directory` 下的用户目录（不再有 `user_` 前缀）

7. 修改 `ensure_user_directories(user_id)` 函数：
   - 更新目录路径以适配新结构

8. 修改 `migrate_file_to_user()` 函数：
   - 更新目标路径以适配新结构

**验收条件**：
- `get_user_output_directory("1")` 返回 `{user_directory}/1/output`
- `get_user_data_directory("1")` 返回 `{user_directory}/1`
- `get_user_temp_directory("1")` 返回 `{user_directory}/1/temp`
- `validate_user_path()` 正确验证新目录结构下的路径
- `get_user_disk_usage()` 正确计算新目录结构下的磁盘使用量

---

## Task 5: server 层和节点层适配验证

**目标**：验证 server 层和节点层代码无需修改即可正常工作，如有必要进行最小化适配。

**涉及文件**：
- `server/__init__.py`（可能需要微调）
- `nodes/__init__.py`（可能需要微调）
- `app/user_manager.py`（可能需要微调）
- `scripts/init_user_directories.py`（需要更新路径引用）

**具体步骤**：

1. 验证 `server/__init__.py` 中 `get_dir_by_type()` 函数：
   - 确认调用 `folder_paths.get_user_*_directory()` 的逻辑无需修改
   - 确认 `view_image()` 中路径解析逻辑正常工作

2. 验证 `nodes/__init__.py` 中节点逻辑：
   - 确认 `SaveImage.save_images()` 调用 `folder_paths.get_user_output_directory()` 正常
   - 确认 `LoadImage.INPUT_TYPES()` 调用 `folder_paths.get_input_directory()` 正常

3. 检查 `app/user_manager.py` 中 `get_request_user_filepath()` 函数：
   - 确认 `folder_paths.get_public_user_directory()` 返回的路径在新结构下正确
   - 确认路径遍历防护逻辑在新结构下仍然有效

4. 更新 `scripts/init_user_directories.py`：
   - 修改 `init_user_directory()` 中的 dry-run 路径引用
   - 将 `os.path.join(base_output, f"user_{user_id}")` 改为 `os.path.join(base_user, user_id, "output")`

5. 检查 `comfy_execution/jobs.py` 中 `_output_file_exists()` 函数：
   - 确认输出文件存在性检查在新目录结构下正常工作

**验收条件**：
- 图片上传 API 正常工作，文件保存到 `user/{id}/input/`
- 图片查看 API 正常工作，从 `user/{id}/output/` 读取文件
- SaveImage 节点正常保存到 `user/{id}/output/`
- LoadImage 节点正常从 `user/{id}/input/` 读取文件列表
- 路径遍历防护在新结构下仍然有效

---

## Task 6: 目录结构迁移脚本

**目标**：创建迁移脚本，支持从旧目录结构迁移到新目录结构。

**涉及文件**：
- `scripts/migrate_user_asset_structure.py`（新建）

**具体步骤**：

1. 实现迁移扫描功能：
   - 扫描 `output/` 下所有 `user_{id}/` 目录
   - 扫描 `input/` 下所有 `user_{id}/` 目录
   - 扫描 `temp/` 下所有 `user_{id}/` 目录
   - 收集所有用户 ID 和文件列表

2. 实现迁移计划生成：
   - 计算每个用户的源目录和目标目录映射
   - 旧 `output/user_{id}/` → 新 `user/{id}/output/`
   - 旧 `input/user_{id}/` → 新 `user/{id}/input/`
   - 旧 `temp/user_{id}/` → 新 `user/{id}/temp/`
   - 计算总文件数量和总大小

3. 实现 dry-run 模式：
   - `--dry-run` 参数：仅输出迁移计划，不执行实际迁移

4. 实现迁移执行：
   - `--execute` 参数：执行实际迁移
   - 创建目标目录结构
   - 移动文件（使用 `shutil.move()`）
   - 跳过已存在的目标文件（幂等性）
   - 记录迁移操作日志

5. 实现迁移回滚：
   - `--rollback` 参数：回滚最近一次迁移
   - 基于迁移日志将文件移回旧目录
   - 删除新创建的空目录

6. 实现迁移报告：
   - 输出迁移摘要（用户数、文件数、总大小）
   - 输出每个用户的迁移详情
   - 输出跳过的文件列表
   - 输出失败的文件列表

7. 实现磁盘空间检查：
   - 迁移前检查目标磁盘剩余空间
   - 空间不足时拒绝迁移并提示

**验收条件**：
- `--dry-run` 正确输出迁移计划，不执行实际操作
- `--execute` 正确迁移所有文件到新目录结构
- 重复执行 `--execute` 不导致数据丢失或重复（幂等性）
- `--rollback` 正确回滚迁移
- 迁移前后文件数量和内容一致
- 磁盘空间不足时拒绝迁移

---

## Task 7: 集成验证与旧目录兼容处理

**目标**：端到端验证整个重构后的系统功能，确保旧目录结构兼容。

**涉及文件**：
- 所有已修改的文件

**具体步骤**：

1. 本地模式集成验证：
   - 启动 ComfyUI，不指定 `--user-directory`
   - 验证默认用户根目录为 `{base_path}/user/`
   - 创建用户，验证目录结构为 `user/{id}/output/`、`user/{id}/input/`
   - 上传图片，验证保存到 `user/{id}/input/`
   - 执行工作流，验证输出保存到 `user/{id}/output/`
   - 查看输出图片，验证从 `user/{id}/output/` 正确读取

2. 本地模式自定义路径验证：
   - 启动 ComfyUI，指定 `--user-directory /tmp/test_users`
   - 验证用户目录在 `/tmp/test_users/{id}/` 下

3. 远程模式验证：
   - 启动 ComfyUI，指定 `--user-directory http://192.168.50.228:8188/user`
   - 验证系统识别为远程模式
   - 验证文件操作通过 HTTP 代理

4. 旧目录兼容验证：
   - 在 `output/` 和 `input/` 下创建 `user_1/` 等旧目录
   - 启动 ComfyUI，验证日志输出迁移提示
   - 验证新用户目录正常创建和使用（不受旧目录影响）

5. 安全性验证：
   - 验证路径遍历防护在新结构下仍然有效
   - 验证系统用户（`__` 前缀）保护仍然有效
   - 验证远程模式下的重定向攻击防护

**验收条件**：
- 本地模式所有功能正常
- 自定义本地路径正常
- 远程模式正确识别和代理
- 旧目录存在时输出迁移提示
- 安全防护机制仍然有效

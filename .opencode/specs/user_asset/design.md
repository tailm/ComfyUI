# **1. 实现模型**

## **1.1 上下文视图**

当前系统的用户资产目录结构为：
```
{base_path}/
├── output/
│   └── user_{user_id}/    # 用户输出目录
│       ├── images/
│       ├── temp/
│       └── cache/
├── input/
│   └── user_{user_id}/    # 用户输入目录
├── temp/
│   └── user_{user_id}/    # 用户临时目录
└── user/
    └── user_{user_id}/    # 用户数据目录
        ├── workflows/
        ├── prompts/
        └── custom/
```

重构后的目录结构为：
```
{user_root}/                          # 可配置：本地路径或远程HTTP地址
└── {user_id}/
    ├── output/                       # 用户输出目录
    │   ├── images/
    │   ├── temp/
    │   └── cache/
    ├── input/                        # 用户输入目录
    └── temp/                         # 用户临时目录（可选，也可复用output/temp）
```

## **1.2 服务/组件总体架构**

### 架构分层

```
┌─────────────────────────────────────────────────────┐
│                   调用层                              │
│  server/__init__.py  │  nodes/__init__.py  │  其他模块 │
└──────────────┬──────────────────────────────┬────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────────────────────────────┐
│              folder_paths（路径门面层）                 │
│  get_user_output_directory()  get_user_input_directory() │
│  get_output_directory()       get_input_directory()      │
│  get_user_directory_by_type() annotated_filepath()       │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│          StorageBackend（存储后端抽象层）               │
│  ┌─────────────────┐  ┌─────────────────────────┐   │
│  │ LocalStorageBackend │  │ RemoteStorageBackend    │   │
│  │ (本地文件系统)       │  │ (HTTP代理)              │   │
│  └─────────────────┘  └─────────────────────────┘   │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│              实际存储（文件系统 / 远程服务）             │
└─────────────────────────────────────────────────────┘
```

### 核心设计决策

1. **引入 StorageBackend 抽象层**：通过策略模式，根据用户根目录配置自动选择本地或远程后端，上层代码无需感知存储类型
2. **路径生成集中化**：所有用户资产路径由 `folder_paths` 模块统一生成，新结构为 `{user_root}/{user_id}/output|input|temp/`
3. **配置驱动**：用户根目录通过 `--user-directory` 命令行参数或配置文件指定，支持本地路径和 HTTP URL

## **1.3 实现设计文档**

### 1.3.1 StorageBackend 存储后端抽象

**文件位置**：`folder_paths/storage_backend.py`（新建）

```python
class StorageBackend(ABC):
    """存储后端抽象基类"""
    
    @abstractmethod
    def get_user_path(self, user_id: str, dir_type: str) -> str:
        """获取用户目录路径"""
        pass
    
    @abstractmethod
    def read_file(self, path: str) -> bytes:
        """读取文件内容"""
        pass
    
    @abstractmethod
    def write_file(self, path: str, data: bytes) -> str:
        """写入文件，返回文件路径"""
        pass
    
    @abstractmethod
    def list_files(self, dir_path: str, extensions: set = None) -> list[str]:
        """列出目录下的文件"""
        pass
    
    @abstractmethod
    def file_exists(self, path: str) -> bool:
        """检查文件是否存在"""
        pass
    
    @abstractmethod
    def ensure_dir(self, path: str) -> None:
        """确保目录存在"""
        pass
    
    @abstractmethod
    def is_remote(self) -> bool:
        """是否为远程存储"""
        pass
```

### 1.3.2 LocalStorageBackend 本地存储后端

**文件位置**：`folder_paths/storage_backend.py`

- 直接使用 `os.path`、`os.makedirs`、`open()` 等本地文件系统 API
- `get_user_path()` 返回本地绝对路径：`{user_root}/{user_id}/{dir_type}/`
- `ensure_dir()` 调用 `os.makedirs(path, exist_ok=True)`

### 1.3.3 RemoteStorageBackend 远程存储后端

**文件位置**：`folder_paths/storage_backend.py`

- 使用 `aiohttp` 发送 HTTP 请求到远程存储服务
- `get_user_path()` 返回远程 URL：`{user_root}/{user_id}/{dir_type}/`
- `read_file()` 通过 HTTP GET 获取文件内容
- `write_file()` 通过 HTTP PUT/POST 上传文件
- `list_files()` 通过 HTTP GET 获取文件列表（远程服务需提供列表 API）
- 内置重试机制（最多 3 次，指数退避）
- 内置超时控制（30 秒）

### 1.3.4 StorageBackendFactory 工厂

**文件位置**：`folder_paths/storage_backend.py`

```python
class StorageBackendFactory:
    """存储后端工厂"""
    
    _instance: StorageBackend = None
    
    @classmethod
    def get_backend(cls) -> StorageBackend:
        """获取当前存储后端实例"""
        if cls._instance is None:
            cls._instance = cls._create_backend()
        return cls._instance
    
    @classmethod
    def _create_backend(cls) -> StorageBackend:
        """根据配置创建存储后端"""
        user_dir = folder_paths.user_directory
        if user_dir.startswith(('http://', 'https://')):
            return RemoteStorageBackend(user_dir)
        else:
            return LocalStorageBackend(user_dir)
    
    @classmethod
    def reset(cls):
        """重置后端实例（配置变更时调用）"""
        cls._instance = None
```

### 1.3.5 folder_paths 模块改造

**文件位置**：`folder_paths/__init__.py`

核心变更点：

| 函数 | 旧逻辑 | 新逻辑 |
|------|--------|--------|
| `get_user_output_directory(user_id)` | `os.path.join(output_directory, f"user_{user_id}")` | `os.path.join(user_directory, user_id, "output")` |
| `get_user_input_directory(user_id)` | `os.path.join(input_directory, f"user_{user_id}")` | `os.path.join(user_directory, user_id, "input")` |
| `get_user_temp_directory(user_id)` | `os.path.join(temp_directory, f"user_{user_id}")` | `os.path.join(user_directory, user_id, "temp")` |
| `get_output_directory()` | 自动检测 user_id → `get_user_output_directory()` | 不变（自动路由逻辑不变，仅底层路径生成变更） |
| `get_input_directory()` | 自动检测 user_id → `get_user_input_directory()` | 不变 |
| `get_directory_by_type(type_name)` | 返回全局目录 | 不变（无 user_id 上下文时返回全局目录） |

**关键变更**：`output_directory`、`input_directory`、`temp_directory` 三个全局变量不再用于用户资产隔离，用户资产统一由 `user_directory` 派生。全局变量仅用于非用户场景（如系统级输出）。

### 1.3.6 folder_paths/user_directory.py 改造

**文件位置**：`folder_paths/user_directory.py`

核心变更点：

| 函数 | 旧逻辑 | 新逻辑 |
|------|--------|--------|
| `get_user_output_directory(user_id)` | `os.path.join(folder_paths.output_directory, f"user_{user_id}")` | `os.path.join(folder_paths.user_directory, user_id, "output")` |
| `get_user_data_directory(user_id)` | `os.path.join(folder_paths.user_directory, f"user_{user_id}")` | `os.path.join(folder_paths.user_directory, user_id)` |
| `get_user_temp_directory(user_id)` | `os.path.join(get_user_output_directory(user_id), "temp")` | `os.path.join(folder_paths.user_directory, user_id, "temp")` |
| `validate_user_path(file_path, user_id)` | 检查 `output/user_{id}` 和 `user/user_{id}` | 检查 `user/{id}/` 下的所有子目录 |
| `get_user_disk_usage_summary(user_ids)` | 扫描 `output_base` 和 `user_base` 下的 `user_*` 目录 | 扫描 `user_directory` 下的用户目录 |

### 1.3.7 server/__init__.py 改造

**文件位置**：`server/__init__.py`

核心变更点：

| 函数/方法 | 变更说明 |
|-----------|----------|
| `get_dir_by_type(dir_type, req)` | 调用 `folder_paths.get_user_*_directory()` 的逻辑不变，底层路径已由 folder_paths 自动变更 |
| `image_upload(post, ...)` | 不变，通过 `get_dir_by_type()` 获取路径 |
| `view_image(request)` | 不变，通过 `get_dir_by_type()` 获取路径 |

**结论**：server 层代码无需修改，因为所有路径获取都通过 `folder_paths` 模块间接调用。

### 1.3.8 nodes/__init__.py 改造

**文件位置**：`nodes/__init__.py`

核心变更点：

| 节点 | 变更说明 |
|------|----------|
| `SaveImage.save_images()` | 不变，调用 `folder_paths.get_user_output_directory(user_id)` |
| `LoadImage.INPUT_TYPES()` | 不变，调用 `folder_paths.get_input_directory()` |
| `PreviewImage` | 不变，继承自 `SaveImage` |

**结论**：节点层代码无需修改，路径获取已通过 `folder_paths` 模块抽象。

### 1.3.9 配置层改造

**文件位置**：`comfy/cli_args.py`、`main.py`

变更点：

1. `--user-directory` 参数：当前类型为 `is_valid_directory`（要求本地目录存在），需改为 `str` 类型以支持 HTTP URL
2. `main.py` 的 `apply_custom_paths()`：当 `--user-directory` 为 HTTP URL 时，跳过 `os.path.abspath()` 转换

### 1.3.10 迁移脚本

**文件位置**：`scripts/migrate_user_asset_structure.py`（新建）

功能：
1. 扫描旧目录结构：`output/user_{id}/`、`input/user_{id}/`、`temp/user_{id}/`
2. 迁移到新目录结构：`user/{id}/output/`、`user/{id}/input/`、`user/{id}/temp/`
3. 支持 dry-run 模式
4. 支持迁移回滚
5. 生成迁移报告

# **2. 接口设计**

## **2.1 总体设计**

本次重构的核心原则是**接口不变、底层变更**。所有对外 API 接口（HTTP 端点、节点接口）保持不变，仅变更内部路径生成逻辑。

新增的 `StorageBackend` 抽象层提供统一的文件操作接口，使上层代码无需感知本地/远程存储差异。

## **2.2 接口清单**

### 2.2.1 StorageBackend 接口（新增）

| 方法 | 签名 | 说明 |
|------|------|------|
| `get_user_path` | `(user_id: str, dir_type: str) -> str` | 获取用户目录路径 |
| `read_file` | `(path: str) -> bytes` | 读取文件内容 |
| `write_file` | `(path: str, data: bytes) -> str` | 写入文件 |
| `list_files` | `(dir_path: str, extensions: set = None) -> list[str]` | 列出文件 |
| `file_exists` | `(path: str) -> bool` | 检查文件是否存在 |
| `ensure_dir` | `(path: str) -> None` | 确保目录存在 |
| `delete_file` | `(path: str) -> bool` | 删除文件 |
| `is_remote` | `() -> bool` | 是否远程存储 |

### 2.2.2 folder_paths 公开接口（行为变更）

| 函数 | 旧返回值 | 新返回值 |
|------|----------|----------|
| `get_user_output_directory("1")` | `/path/output/user_1` | `/path/user/1/output` |
| `get_user_input_directory("1")` | `/path/input/user_1` | `/path/user/1/input` |
| `get_user_temp_directory("1")` | `/path/temp/user_1` | `/path/user/1/temp` |
| `get_public_user_directory("1")` | `/path/user/1` | `/path/user/1`（不变） |

### 2.2.3 命令行参数（行为变更）

| 参数 | 旧行为 | 新行为 |
|------|--------|--------|
| `--user-directory` | 仅接受本地目录路径 | 接受本地路径或 HTTP/HTTPS URL |

### 2.2.4 迁移工具接口（新增）

| 命令 | 说明 |
|------|------|
| `python scripts/migrate_user_asset_structure.py --dry-run` | 预览迁移计划 |
| `python scripts/migrate_user_asset_structure.py --execute` | 执行迁移 |
| `python scripts/migrate_user_asset_structure.py --rollback` | 回滚迁移 |

# **4. 数据模型**

## **4.1 设计目标**

1. 用户资产目录路径由 `user_directory` 配置统一派生，消除 `output_directory`、`input_directory`、`temp_directory` 在用户隔离场景下的使用
2. 支持本地路径和远程 HTTP URL 两种用户根目录配置
3. 目录结构扁平化：用户所有资产集中在 `{user_root}/{user_id}/` 下

## **4.2 模型实现**

### 4.2.1 目录路径模型

```
用户根目录配置 (user_directory)
│
├── 本地模式: "/data/comfyui/user"
│   └── {user_id}/
│       ├── output/
│       │   ├── images/
│       │   ├── temp/
│       │   └── cache/
│       ├── input/
│       └── temp/
│
└── 远程模式: "http://192.168.50.228:8188/user"
    └── {user_id}/
        ├── output/
        │   ├── images/
        │   ├── temp/
        │   └── cache/
        ├── input/
        └── temp/
```

### 4.2.2 配置模型

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `--user-directory` | str | `{base_path}/user` | 用户根目录，支持本地路径或 HTTP URL |
| `--output-directory` | str | `{base_path}/output` | 系统级输出目录（非用户隔离场景） |
| `--input-directory` | str | `{base_path}/input` | 系统级输入目录（非用户隔离场景） |

### 4.2.3 StorageBackend 状态模型

```python
@dataclass
class StorageConfig:
    """存储配置"""
    user_root: str              # 用户根目录路径
    is_remote: bool             # 是否远程模式
    timeout: int = 30           # 远程模式超时（秒）
    max_retries: int = 3        # 远程模式最大重试次数
    retry_backoff: float = 1.0  # 重试退避因子
```

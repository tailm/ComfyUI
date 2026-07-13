# 通用用户数据隔离方案设计

## 问题分析

### 当前问题

1. **文件保存没有用户隔离**：
   - `_get_directory_by_folder_type()`返回全局目录
   - 所有用户保存到同一个目录
   - 新模型（如音乐生成）需要手动处理

2. **缺乏通用机制**：
   - 每种文件类型需要单独处理
   - 没有统一的用户目录路由
   - 维护成本高

### 现有代码流程

```
节点执行
  ↓
AudioSaveHelper.save_audio()
  ↓
folder_paths.get_save_image_path(filename_prefix, output_dir)
  ↓
_get_directory_by_folder_type(folder_type)  # ❌ 返回全局目录
  ↓
folder_paths.get_output_directory()  # ❌ 没有用户隔离
```

## 解决方案

### 方案设计

**核心思想**：在执行上下文中注入用户ID，所有文件保存自动路由到用户目录。

### 1. 执行上下文管理

**创建文件**：`app/execution_context.py`

```python
"""
Execution context for user data isolation.

Provides thread-local storage for user_id during node execution.
"""

import threading
from typing import Optional

# Thread-local storage for execution context
_context = threading.local()

def set_execution_user(user_id: str) -> None:
    """Set the current execution user ID."""
    _context.user_id = user_id

def get_execution_user() -> Optional[str]:
    """Get the current execution user ID."""
    return getattr(_context, 'user_id', None)

def clear_execution_user() -> None:
    """Clear the current execution user ID."""
    if hasattr(_context, 'user_id'):
        delattr(_context, 'user_id')
```

### 2. 用户目录路由

**修改文件**：`folder_paths/__init__.py`

**添加函数**：
```python
def get_user_directory_by_type(directory_type: str, user_id: Optional[str] = None) -> str:
    """
    Get user-specific directory for any type.

    Args:
        directory_type: 'output', 'input', 'temp'
        user_id: User ID (if None, get from execution context)

    Returns:
        User-specific directory path
    """
    from app.execution_context import get_execution_user

    # Get user_id from context if not provided
    if user_id is None:
        user_id = get_execution_user()

    # If no user_id or not in multi-user mode, return global directory
    if user_id is None or not args.multi_user:
        if directory_type == 'output':
            return output_directory
        elif directory_type == 'input':
            return input_directory
        else:
            return temp_directory

    # Return user-specific directory
    if directory_type == 'output':
        return get_user_output_directory(user_id)
    elif directory_type == 'input':
        return get_user_input_directory(user_id)
    else:
        return get_user_temp_directory(user_id)

def get_user_input_directory(user_id: str) -> str:
    """Get input directory for a specific user."""
    user_input_dir = os.path.join(input_directory, f"user_{user_id}")
    os.makedirs(user_input_dir, exist_ok=True)
    return user_input_dir

def get_user_temp_directory(user_id: str) -> str:
    """Get temp directory for a specific user."""
    user_temp_dir = os.path.join(temp_directory, f"user_{user_id}")
    os.makedirs(user_temp_dir, exist_ok=True)
    return user_temp_dir
```

### 3. 修改目录获取函数

**修改文件**：`comfy_api/latest/_ui.py`

**修改函数**：
```python
def _get_directory_by_folder_type(folder_type: FolderType) -> str:
    """Get directory for folder type with user isolation."""
    from folder_paths import get_user_directory_by_type

    if folder_type == FolderType.input:
        return get_user_directory_by_type('input')
    if folder_type == FolderType.output:
        return get_user_directory_by_type('output')
    return get_user_directory_by_type('temp')
```

### 4. 在执行时注入用户ID

**修改文件**：`execution/__init__.py`

**在execute函数中**：
```python
async def execute(self, prompt_id, prompt, extra_data, execution_start_cb=None):
    # ... existing code ...

    # Set execution user for data isolation
    from app.execution_context import set_execution_user, clear_execution_user
    user_id = extra_data.get('user_id', '0')
    set_execution_user(user_id)

    try:
        # ... existing execution code ...
    finally:
        # Clear execution user
        clear_execution_user()
```

### 5. 自动创建用户目录结构

**修改文件**：`folder_paths/user_directory.py`

**添加函数**：
```python
def ensure_user_directory_structure(user_id: str) -> Dict[str, str]:
    """
    Ensure complete directory structure for a user.

    Creates all necessary subdirectories for different file types:
    - output/user_{user_id}/images
    - output/user_{user_id}/audio
    - output/user_{user_id}/video
    - output/user_{user_id}/3d
    - output/user_{user_id}/temp
    - output/user_{user_id}/cache
    - input/user_{user_id}/
    - temp/user_{user_id}/

    Returns:
        Dictionary of created directories
    """
    import folder_paths

    directories = {}

    # Output directory structure
    output_base = get_user_output_directory(user_id)
    for subdir in ['images', 'audio', 'video', '3d', 'temp', 'cache']:
        path = os.path.join(output_base, subdir)
        os.makedirs(path, exist_ok=True)
        directories[f'output/{subdir}'] = path

    # Input directory
    input_dir = folder_paths.get_user_input_directory(user_id)
    directories['input'] = input_dir

    # Temp directory
    temp_dir = folder_paths.get_user_temp_directory(user_id)
    directories['temp'] = temp_dir

    return directories
```

## 实现效果

### 1. 自动用户隔离

**任何文件保存操作**：
```python
# 节点代码（无需修改）
filename_prefix = "audio/ComfyUI"
AudioSaveHelper.save_audio(audio, filename_prefix, FolderType.output, cls)

# 自动路由到用户目录
# user_id=0 -> output/user_0/audio/ComfyUI_00001_.flac
# user_id=1 -> output/user_1/audio/ComfyUI_00001_.flac
```

### 2. 支持所有文件类型

**自动支持的类型**：
- 图片：`output/user_{id}/images/`
- 音频：`output/user_{id}/audio/`
- 视频：`output/user_{id}/video/`
- 3D：`output/user_{id}/3d/`
- 临时文件：`output/user_{id}/temp/`
- 缓存：`output/user_{id}/cache/`

### 3. 新模型自动支持

**添加新模型**：
```python
# 新的音乐生成节点
class SaveMusic(IO.ComfyNode):
    def execute(cls, music, filename_prefix="music/ComfyUI"):
        # 自动保存到 output/user_{id}/music/
        return AudioSaveHelper.save_audio(
            music, filename_prefix, FolderType.output, cls
        )
```

**无需任何额外配置！**

### 4. 目录结构

**自动创建的目录**：
```
output/
├── user_0/
│   ├── images/
│   ├── audio/
│   ├── video/
│   ├── 3d/
│   ├── temp/
│   └── cache/
├── user_1/
│   ├── images/
│   ├── audio/
│   ├── video/
│   ├── 3d/
│   ├── temp/
│   └── cache/
└── default/
    └── ...

input/
├── user_0/
├── user_1/
└── default/

temp/
├── user_0/
├── user_1/
└── default/
```

## 优势

### 1. 完全自动化

- ✅ 无需手动配置
- ✅ 新模型自动支持
- ✅ 所有文件类型统一处理

### 2. 透明集成

- ✅ 节点代码无需修改
- ✅ 对开发者透明
- ✅ 对用户透明

### 3. 线程安全

- ✅ 使用thread-local存储
- ✅ 支持并发执行
- ✅ 用户ID隔离

### 4. 向后兼容

- ✅ 单用户模式正常工作
- ✅ 旧代码继续工作
- ✅ 无破坏性变更

## 实现步骤

1. 创建`app/execution_context.py`
2. 修改`folder_paths/__init__.py`
3. 修改`comfy_api/latest/_ui.py`
4. 修改`execution/__init__.py`
5. 增强`folder_paths/user_directory.py`
6. 测试验证

---

**设计人员**：CodeArts Agent
**设计日期**：2026-07-10
**方案状态**：✅ 设计完成，待实现

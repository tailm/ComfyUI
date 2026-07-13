# 用户数据隔离系统 - 开发者指南

## 概述

本指南帮助开发者理解和使用ComfyUI用户数据隔离系统。该系统通过user_id绑定实现用户间数据完全隔离。

## 快速开始

### 1. 设置中间件

在应用启动时设置用户隔离中间件:

```python
from middleware.user_isolation_middleware import setup_user_isolation_middleware

# 在创建应用后
app = web.Application()
setup_user_isolation_middleware(app, user_manager)
```

### 2. 在API中使用服务

```python
from app.services.workflow_service import WorkflowService

async def get_workflow(request):
    # 从请求获取user_id(由中间件注入)
    user_id = request.get('user_id', '0')
    is_admin = request.get('is_admin', False)
    
    # 创建服务
    service = WorkflowService(
        session=request.app['db_session'],
        user_id=user_id,
        is_admin=is_admin
    )
    
    # 使用服务(自动验证权限)
    workflow = service.get_workflow(workflow_id)
    
    return web.json_response(workflow)
```

## 核心概念

### 1. 三层防护机制

```
中间件层 → 服务层 → Repository层
```

每一层都强制执行user_id验证:

- **中间件层**: 提取和验证user_id
- **服务层**: 业务逻辑和权限验证
- **Repository层**: 数据访问和自动过滤

### 2. 自动用户绑定

创建数据时,系统自动绑定user_id:

```python
# 无需手动设置user_id
workflow = service.save_workflow(
    name='my_workflow',
    workflow_json={'nodes': []}
)

# user_id自动设置为当前用户
assert workflow.user_id == current_user_id
```

### 3. 强制权限验证

所有数据访问都验证所有权:

```python
# 如果user_id不匹配,抛出PermissionError
try:
    workflow = service.get_workflow(workflow_id)
except PermissionError:
    return web.json_response({'error': 'Permission denied'}, status=403)
```

### 4. 管理员特权

管理员可以查看所有用户数据:

```python
# 管理员创建的服务
admin_service = WorkflowService(
    session=session,
    user_id='admin',
    is_admin=True
)

# 可以查看所有工作流
workflows = admin_service.list_workflows()
```

## 服务使用指南

### HistoryService

管理执行历史:

```python
from app.services.history_service import HistoryService

service = HistoryService(user_id='user_123', is_admin=False)

# 获取历史
history = service.get_history(max_items=100)

# 获取特定历史
try:
    record = service.get_history_by_prompt_id('prompt_456')
except PermissionError:
    # 无权访问
    pass

# 删除历史
service.delete_history('prompt_456')

# 获取统计
stats = service.get_user_statistics()
# {'total_executions': 100, 'successful': 95, ...}
```

### AssetService

管理资产:

```python
from app.services.asset_service import AssetService

service = AssetService(
    session=session,
    user_id='user_123',
    is_admin=False
)

# 列出资产
assets = service.list_assets(limit=50)

# 创建资产(自动绑定owner_id)
asset = service.create_asset({
    'name': 'image.png',
    'asset_id': 'asset_789'
})

# 搜索资产
results = service.search_assets('landscape')

# 获取统计
stats = service.get_user_statistics()
```

### WorkflowService

管理工作流:

```python
from app.services.workflow_service import WorkflowService

service = WorkflowService(
    session=session,
    user_id='user_123',
    is_admin=False
)

# 保存工作流
workflow = service.save_workflow(
    name='my_workflow',
    workflow_json={'nodes': [...]},
    description='My workflow',
    is_template=False
)

# 列出工作流(包括模板)
workflows = service.list_workflows(include_templates=True)

# 获取模板
templates = service.get_templates()

# 复制工作流
copy = service.duplicate_workflow(
    workflow_id='workflow_456',
    new_name='Copy of workflow'
)
```

### PromptService

管理提示词:

```python
from app.services.prompt_service import PromptService

service = PromptService(
    session=session,
    user_id='user_123',
    is_admin=False
)

# 保存提示词
prompt = service.save_prompt(
    prompt_json={'prompt': [...]},
    workflow_id='workflow_789'
)

# 增加执行计数
service.increment_execution_count('prompt_456')

# 获取最近执行
recent = service.get_recently_executed(limit=10)

# 获取最常执行
popular = service.get_most_executed(limit=10)
```

### NodeIOService

管理节点输入输出:

```python
from app.services.node_io_service import NodeIOService

service = NodeIOService(
    session=session,
    user_id='user_123',
    is_admin=False
)

# 保存节点IO
node_io = service.save_node_io(
    prompt_id='prompt_456',
    node_id='node_1',
    input_data={'input': 'value'},
    output_data={'output': 'result'},
    execution_time_ms=150
)

# 获取执行统计
stats = service.get_execution_statistics('prompt_456')

# 获取最慢节点
slowest = service.get_slowest_nodes('prompt_456', limit=5)
```

## Repository使用指南

### 创建自定义Repository

```python
from app.database.isolation_repository import DataIsolationRepository
from your_app.models import YourModel

class YourRepository(DataIsolationRepository):
    """自定义Repository"""
    
    def get_by_name(self, name: str):
        """按名称查询"""
        return self.query_with_user_filter(
            filters={'name': name},
            limit=1
        )
    
    def search(self, keyword: str):
        """搜索"""
        from sqlalchemy import select, or_
        
        query = select(self.model_class).where(
            or_(
                self.model_class.name.ilike(f'%{keyword}%'),
                self.model_class.description.ilike(f'%{keyword}%')
            )
        )
        
        # 添加用户过滤
        if not self.is_admin:
            query = query.where(
                self.model_class.user_id == self.user_id
            )
        
        result = self.session.execute(query)
        return list(result.scalars().all())
```

## 文件系统隔离

### 用户目录管理

```python
from folder_paths.user_directory import (
    get_user_output_directory,
    get_user_data_directory,
    validate_user_path,
    get_user_temp_directory,
    cleanup_user_temp_files
)

# 获取用户输出目录
output_dir = get_user_output_directory('user_123')
# 返回: /path/to/output/user_123/

# 获取用户数据目录
data_dir = get_user_data_directory('user_123')
# 返回: /path/to/user/user_123/

# 验证路径权限
if validate_user_path(file_path, 'user_123'):
    # 允许访问
    pass
else:
    # 拒绝访问
    raise PermissionError()

# 清理临时文件
deleted = cleanup_user_temp_files('user_123', max_age_hours=24)
```

### 目录结构

```
output/
  user_0/
    images/      # 用户输出图片
    temp/        # 临时文件
    cache/       # 缓存文件
  user_1/
    images/
    temp/
    cache/

user/
  user_0/
    workflows/   # 工作流文件
    prompts/     # 提示词文件
    custom/      # 自定义数据
  user_1/
    workflows/
    prompts/
    custom/
```

## 缓存隔离

### 使用用户隔离缓存

```python
from comfy_execution.user_isolated_cache import UserIsolatedCache

# 创建用户隔离缓存
user_cache = UserIsolatedCache(
    base_cache=global_cache,
    user_id='user_123'
)

# 设置缓存(自动添加user_id前缀)
user_cache.set('key', value)
# 实际存储: user:user_123:key

# 获取缓存
value = user_cache.get('key')

# 清空用户缓存
user_cache.clear_user_cache()
```

### 缓存集合管理

```python
from comfy_execution.user_isolated_cache import UserIsolatedCacheSet

# 创建缓存集合
cache_set = UserIsolatedCacheSet({
    'outputs': output_cache,
    'models': model_cache
})

# 获取用户缓存
user_cache = cache_set.get_user_cache('user_123', 'outputs')

# 清空用户所有缓存
cache_set.clear_user_caches('user_123')
```

## 数据迁移

### 执行迁移

```bash
# 1. 执行数据库迁移
alembic upgrade head

# 2. 迁移现有数据
python scripts/migrate_user_data.py /path/to/comfyui.db

# 3. 验证迁移
python scripts/validate_migration.py /path/to/comfyui.db
```

### 迁移工具选项

```bash
# 指定默认用户
python scripts/migrate_user_data.py comfyui.db --default-user "0"

# 干运行
python scripts/migrate_user_data.py comfyui.db --dry-run

# 跳过备份
python scripts/migrate_user_data.py comfyui.db --skip-backup
```

### 回滚迁移

```bash
# 列出备份
python scripts/rollback_migration.py comfyui.db --list-backups

# 回滚到最新备份
python scripts/rollback_migration.py comfyui.db

# 回滚到指定备份
python scripts/rollback_migration.py comfyui.db --backup /path/to/backup.db
```

## 测试

### 运行测试

```bash
# 运行所有测试
pytest tests/

# 运行单元测试
pytest tests/unit/

# 运行集成测试
pytest tests/integration/

# 运行安全测试
pytest tests/security/

# 生成覆盖率报告
pytest --cov=app --cov-report=html
```

### 编写测试

```python
import pytest
from app.services.history_service import HistoryService

def test_user_isolation():
    """测试用户隔离"""
    service = HistoryService(user_id='user_123', is_admin=False)
    
    # 测试只能看到自己的数据
    history = service.get_history()
    
    for prompt_id in history:
        record = service.get_history_by_prompt_id(prompt_id)
        assert record['user_id'] == 'user_123'
```

## 最佳实践

### 1. 始终使用服务层

不要直接访问数据库,始终通过服务层:

```python
# ❌ 错误
session.query(Workflow).filter_by(id=workflow_id).first()

# ✅ 正确
service = WorkflowService(session, user_id, is_admin)
workflow = service.get_workflow(workflow_id)
```

### 2. 处理权限错误

始终捕获和处理PermissionError:

```python
try:
    workflow = service.get_workflow(workflow_id)
except PermissionError:
    return web.json_response(
        {'error': 'Permission denied'},
        status=403
    )
```

### 3. 使用管理员权限谨慎

只在必要时使用管理员权限:

```python
# ❌ 滥用管理员权限
admin_service = WorkflowService(session, 'admin', is_admin=True)

# ✅ 仅在需要时使用
if needs_admin_access:
    admin_service = WorkflowService(session, 'admin', is_admin=True)
else:
    service = WorkflowService(session, user_id, is_admin=False)
```

### 4. 验证用户输入

始终验证用户输入:

```python
# 验证user_id
if not user_id or not isinstance(user_id, str):
    raise ValueError('Invalid user_id')

# 验证路径
if not validate_user_path(file_path, user_id):
    raise PermissionError('Invalid path')
```

### 5. 记录日志

记录重要的操作和错误:

```python
import logging

logger = logging.getLogger(__name__)

try:
    workflow = service.get_workflow(workflow_id)
    logger.info(f"User {user_id} accessed workflow {workflow_id}")
except PermissionError as e:
    logger.warning(f"Permission denied: {e}")
    raise
```

## 故障排查

### 常见问题

**Q: 用户看不到自己的数据?**

A: 检查user_id是否正确设置:
```python
# 检查请求中的user_id
user_id = request.get('user_id')
print(f"Current user_id: {user_id}")

# 检查数据库中的user_id
import sqlite3
conn = sqlite3.connect('comfyui.db')
cursor = conn.cursor()
cursor.execute("SELECT DISTINCT user_id FROM history")
print(cursor.fetchall())
```

**Q: PermissionError频繁出现?**

A: 检查权限验证逻辑:
```python
# 检查记录的所有权
record = session.query(Model).get(record_id)
print(f"Record owner: {record.user_id}")
print(f"Current user: {current_user_id}")
```

**Q: 数据迁移失败?**

A: 检查迁移日志:
```bash
# 查看迁移日志
python scripts/migrate_user_data.py comfyui.db --dry-run

# 验证迁移结果
python scripts/validate_migration.py comfyui.db
```

## 性能优化

### 1. 使用索引

确保相关字段有索引:
```sql
CREATE INDEX idx_history_user_id ON history(user_id);
CREATE INDEX ix_workflows_user_updated ON workflows(user_id, updated_at);
```

### 2. 批量操作

使用批量操作提高性能:
```python
# ❌ 逐个创建
for data in data_list:
    service.create(data)

# ✅ 批量创建
service.batch_create(data_list)
```

### 3. 缓存

使用缓存减少数据库查询:
```python
# 使用用户隔离缓存
user_cache = UserIsolatedCache(base_cache, user_id)

# 缓存查询结果
result = user_cache.get('key')
if result is None:
    result = service.query()
    user_cache.set('key', result)
```

## 安全考虑

### 1. SQL注入防护

系统使用参数化查询,自动防止SQL注入:
```python
# ✅ 安全 - 参数化查询
cursor.execute("SELECT * FROM history WHERE user_id = ?", (user_id,))

# ❌ 危险 - 字符串拼接(不要这样做)
cursor.execute(f"SELECT * FROM history WHERE user_id = '{user_id}'")
```

### 2. 路径遍历防护

使用validate_user_path验证路径:
```python
if not validate_user_path(file_path, user_id):
    raise PermissionError()
```

### 3. 权限验证

始终验证用户权限:
```python
# 三层验证
# 1. 中间件验证user_id
# 2. 服务层验证业务权限
# 3. Repository层验证数据所有权
```

## 相关文档

- [完整实施报告](USER_DATA_ISOLATION_COMPLETE.md)
- [实施总结](USER_DATA_ISOLATION_SUMMARY.md)
- [任务规划](../.codeartsdoer/specs/user-data-isolation/tasks.md)

---

**版本**: 1.0  
**更新时间**: 2026-07-08  
**维护者**: CodeArts Agent

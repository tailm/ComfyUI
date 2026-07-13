# ComfyUI 多用户数据隔离 - 开发指南

## 概述

本指南为开发人员提供ComfyUI多用户数据隔离系统的开发规范和最佳实践，确保新功能开发时正确实现数据隔离。

## 数据隔离原理

### 核心原则

1. **所有数据必须绑定用户**
   - 每条数据记录必须有user_id或owner_id字段
   - 不允许存在孤立数据（user_id为空）

2. **所有查询必须过滤用户**
   - 查询时必须添加user_id过滤条件
   - 管理员可以查看所有数据

3. **所有修改必须验证权限**
   - 修改数据前必须验证所有权
   - 禁止跨用户修改数据

### 架构层次

```
┌─────────────────────────────────────┐
│         API Layer (Routes)          │  ← 获取user_id，调用Service
├─────────────────────────────────────┤
│         Service Layer               │  ← 业务逻辑，调用Repository
├─────────────────────────────────────┤
│    Repository Layer (Isolation)     │  ← 自动user_id过滤
├─────────────────────────────────────┤
│         Database (ORM Models)       │  ← 数据模型，包含user_id字段
└─────────────────────────────────────┘
```

## Service层使用规范

### 1. Service类设计

所有Service类必须：
- 在构造函数中接收user_id和is_admin参数
- 所有方法必须使用user_id进行过滤
- 记录审计日志

**正确示例**：

```python
class WorkflowService:
    def __init__(self, session: Session, user_id: str, is_admin: bool = False):
        self.session = session
        self.user_id = user_id
        self.is_admin = is_admin
    
    def get_workflows(self, filters: dict = None) -> List[Workflow]:
        """获取工作流列表"""
        query = select(Workflow)
        
        # 非管理员只能看到自己的工作流
        if not self.is_admin:
            query = query.where(Workflow.user_id == self.user_id)
        
        # 添加其他过滤条件
        if filters:
            # ...
        
        result = self.session.execute(query)
        return list(result.scalars().all())
    
    def update_workflow(self, workflow_id: str, data: dict) -> Workflow:
        """更新工作流"""
        # 先获取并验证权限
        workflow = self.get_workflow_by_id(workflow_id)
        
        # 更新数据
        for key, value in data.items():
            setattr(workflow, key, value)
        
        self.session.commit()
        logger.info(f"Updated workflow {workflow_id} by user {self.user_id}")
        
        return workflow
```

**错误示例**：

```python
class WorkflowService:
    def __init__(self, session: Session):
        self.session = session
    
    def get_workflows(self) -> List[Workflow]:
        """错误：没有user_id过滤"""
        query = select(Workflow)
        result = self.session.execute(query)
        return list(result.scalars().all())
```

### 2. 权限验证

所有修改操作必须验证权限：

```python
def delete_workflow(self, workflow_id: str) -> bool:
    """删除工作流"""
    # 获取工作流
    query = select(Workflow).where(Workflow.id == workflow_id)
    result = self.session.execute(query)
    workflow = result.scalar_one_or_none()
    
    if workflow is None:
        raise ValueError(f"Workflow not found: {workflow_id}")
    
    # 验证权限（管理员跳过）
    if not self.is_admin and workflow.user_id != self.user_id:
        logger.warning(
            f"User '{self.user_id}' attempted to delete "
            f"workflow owned by '{workflow.user_id}'"
        )
        raise PermissionError("You don't have permission to delete this workflow")
    
    # 删除
    self.session.delete(workflow)
    self.session.commit()
    
    return True
```

## Repository层使用规范

### 1. 使用DataIsolationRepository

对于新的数据模型，使用DataIsolationRepository基类：

```python
from app.database.isolation_repository import DataIsolationRepository
from app.database.workflow_models import Workflow

class WorkflowRepository(DataIsolationRepository[Workflow]):
    """工作流Repository"""
    
    def __init__(self, session: Session, user_id: str, is_admin: bool = False):
        super().__init__(session, Workflow, user_id, is_admin)
    
    # 继承的方法已自动实现user_id过滤：
    # - query_with_user_filter()
    # - get_by_id_with_check()
    # - create_with_user()
    # - update_with_check()
    # - delete_with_check()
    # - batch_check_ownership()
```

### 2. 批量操作

使用批量权限检查提高性能：

```python
def batch_delete_workflows(self, workflow_ids: List[str]) -> Dict[str, bool]:
    """批量删除工作流"""
    # 批量检查权限
    ownership = self.batch_check_ownership(workflow_ids)
    
    results = {}
    for workflow_id in workflow_ids:
        if not ownership[workflow_id]:
            results[workflow_id] = False
            continue
        
        try:
            self.delete_with_check(workflow_id)
            results[workflow_id] = True
        except Exception as e:
            results[workflow_id] = False
            logger.error(f"Failed to delete {workflow_id}: {e}")
    
    return results
```

## API开发规范

### 1. 获取user_id

从请求中获取user_id：

```python
def get_user_id_from_request(request: web.Request) -> str:
    """从请求中获取user_id"""
    # 从header获取
    user_id = request.headers.get("comfy-user", None)
    
    # 从请求上下文获取
    if not user_id:
        user_id = request.get("user_id", "0")
    
    return user_id
```

### 2. API路由实现

所有API必须：
- 获取user_id和is_admin
- 使用Service层
- 处理权限错误

**正确示例**：

```python
@routes.get("/workflows")
async def get_workflows(request: web.Request) -> web.Response:
    """获取工作流列表"""
    user_id = get_user_id_from_request(request)
    is_admin = request.get("is_admin", False)
    
    try:
        with create_session() as session:
            service = WorkflowService(session, user_id, is_admin)
            workflows = service.get_workflows()
            
            return web.json_response({
                'workflows': [w.to_dict() for w in workflows]
            })
    
    except PermissionError as e:
        return web.json_response(
            {'error': str(e)},
            status=403
        )
    
    except Exception as e:
        logger.error(f"Failed to get workflows: {e}", exc_info=True)
        return web.json_response(
            {'error': str(e)},
            status=500
        )
```

**错误示例**：

```python
@routes.get("/workflows")
async def get_workflows(request: web.Request) -> web.Response:
    """错误：直接查询数据库"""
    with create_session() as session:
        query = select(Workflow)  # 没有user_id过滤！
        result = session.execute(query)
        workflows = result.scalars().all()
        
        return web.json_response({
            'workflows': [w.to_dict() for w in workflows]
        })
```

### 3. 错误处理

正确处理权限错误：

```python
try:
    # 业务操作
    pass
except PermissionError as e:
    # 权限错误 - 403
    logger.warning(f"Permission denied: {e}")
    return web.json_response(
        {'error': 'Permission denied'},
        status=403
    )
except ValueError as e:
    # 资源不存在 - 404
    return web.json_response(
        {'error': str(e)},
        status=404
    )
except Exception as e:
    # 其他错误 - 500
    logger.error(f"Unexpected error: {e}", exc_info=True)
    return web.json_response(
        {'error': 'Internal server error'},
        status=500
    )
```

## 数据库模型规范

### 1. 添加user_id字段

所有用户数据模型必须包含user_id或owner_id字段：

```python
class Workflow(Base):
    __tablename__ = "workflows"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(128), nullable=False)  # 必需！
    name: Mapped[str] = mapped_column(String(512), nullable=False)
    # ...
    
    # 创建索引
    __table_args__ = (
        Index("ix_workflows_user_id", "user_id"),
        # ...
    )
```

### 2. 创建索引

为user_id字段创建索引：

```python
__table_args__ = (
    Index("ix_workflows_user_id", "user_id"),
    Index("ix_workflows_user_updated", "user_id", "updated_at"),  # 复合索引
)
```

### 3. 外键关联

确保关联数据的一致性：

```python
class Prompt(Base):
    __tablename__ = "prompts"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(128), nullable=False)
    workflow_id: Mapped[str | None] = mapped_column(
        String(36), 
        ForeignKey("workflows.id", ondelete="SET NULL"), 
        nullable=True
    )
```

## 测试编写规范

### 1. 单元测试

测试用户隔离功能：

```python
import pytest
from app.services.workflow_service import WorkflowService
from app.database.workflow_models import Workflow

def test_user_isolation(session):
    """测试用户隔离"""
    # 创建两个用户的工作流
    workflow1 = Workflow(user_id="user1", name="workflow1", ...)
    workflow2 = Workflow(user_id="user2", name="workflow2", ...)
    session.add_all([workflow1, workflow2])
    session.commit()
    
    # user1只能看到自己的工作流
    service = WorkflowService(session, "user1", is_admin=False)
    workflows = service.get_workflows()
    
    assert len(workflows) == 1
    assert workflows[0].user_id == "user1"

def test_admin_can_see_all(session):
    """测试管理员可以看到所有数据"""
    # 创建两个用户的工作流
    workflow1 = Workflow(user_id="user1", name="workflow1", ...)
    workflow2 = Workflow(user_id="user2", name="workflow2", ...)
    session.add_all([workflow1, workflow2])
    session.commit()
    
    # 管理员可以看到所有工作流
    service = WorkflowService(session, "admin", is_admin=True)
    workflows = service.get_workflows()
    
    assert len(workflows) == 2

def test_cross_user_access_denied(session):
    """测试跨用户访问被拒绝"""
    workflow = Workflow(user_id="user1", name="workflow1", ...)
    session.add(workflow)
    session.commit()
    
    # user2尝试访问user1的工作流
    service = WorkflowService(session, "user2", is_admin=False)
    
    with pytest.raises(PermissionError):
        service.get_workflow_by_id(workflow.id)
```

### 2. 集成测试

测试API接口：

```python
import pytest
from aiohttp import web
from aiohttp.test_utils import AioHTTPTestCase

class TestWorkflowAPI(AioHTTPTestCase):
    async def test_get_workflows_isolated(self):
        """测试工作流API隔离"""
        # user1创建工作流
        resp = await self.client.post(
            "/workflows",
            headers={"comfy-user": "user1"},
            json={"name": "workflow1", ...}
        )
        assert resp.status == 200
        
        # user2看不到user1的工作流
        resp = await self.client.get(
            "/workflows",
            headers={"comfy-user": "user2"}
        )
        assert resp.status == 200
        data = await resp.json()
        assert len(data['workflows']) == 0
```

## 代码审查检查清单

在提交代码前，检查以下项目：

- [ ] 所有数据模型包含user_id/owner_id字段
- [ ] 所有查询添加user_id过滤条件
- [ ] 所有修改操作验证权限
- [ ] 使用Service层而非直接数据库访问
- [ ] API正确获取user_id和is_admin
- [ ] 正确处理PermissionError
- [ ] 添加审计日志
- [ ] 编写单元测试
- [ ] 编写集成测试
- [ ] 测试覆盖率达标

## 常见错误

### 1. 忘记user_id过滤

**错误**：
```python
query = select(Workflow)  # 缺少user_id过滤
```

**正确**：
```python
query = select(Workflow).where(Workflow.user_id == user_id)
```

### 2. 直接数据库访问

**错误**：
```python
@routes.get("/workflows")
async def get_workflows(request):
    with create_session() as session:
        query = select(Workflow)
        # ...
```

**正确**：
```python
@routes.get("/workflows")
async def get_workflows(request):
    user_id = get_user_id_from_request(request)
    with create_session() as session:
        service = WorkflowService(session, user_id)
        workflows = service.get_workflows()
        # ...
```

### 3. 未验证权限

**错误**：
```python
def delete_workflow(self, workflow_id):
    workflow = session.get(Workflow, workflow_id)
    session.delete(workflow)  # 未验证权限
```

**正确**：
```python
def delete_workflow(self, workflow_id):
    workflow = self.get_by_id_with_check(workflow_id)  # 验证权限
    self.session.delete(workflow)
```

## 最佳实践

1. **始终使用Service层**
   - 不要在API中直接访问数据库
   - Service层封装业务逻辑和权限验证

2. **使用DataIsolationRepository**
   - 继承基类获得自动user_id过滤
   - 减少重复代码

3. **记录审计日志**
   - 记录所有权限验证失败
   - 记录所有数据修改操作

4. **编写完整测试**
   - 测试用户隔离
   - 测试管理员权限
   - 测试跨用户访问拒绝

5. **定期代码审查**
   - 使用API审查工具
   - 检查新代码是否符合规范

## 相关文档

- [部署文档](../deployment/user_data_isolation.md)
- [运维手册](../operations/user_data_isolation.md)
- [API文档](../api/README.md)

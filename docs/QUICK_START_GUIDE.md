# ComfyUI 用户认证系统快速启动指南

## 概述

本指南介绍如何在 ComfyUI 中启用和使用新添加的用户认证和模板管理系统。

## 系统要求

- Python 3.8+
- ComfyUI 已安装并运行
- SQLite 数据库支持

## 安装步骤

### 1. 检查文件结构

确保以下文件已正确创建：

```
app/user_auth/
├── __init__.py
├── models.py          # 数据库模型
├── password.py        # 密码工具类
├── manager.py         # 用户认证管理器
├── template_manager.py # 模板管理器
└── routes.py          # API 路由

alembic_db/versions/
└── 0004_add_user_auth_tables.py  # 数据库迁移脚本
```

### 2. 应用数据库迁移

运行以下命令应用数据库迁移：

```bash
cd /home/gpu/ComfyUI
python -c "from app.database.db import init_db; init_db()"
```

或者重启 ComfyUI 服务器，系统会自动应用迁移。

### 3. 启动 ComfyUI

使用以下命令启动 ComfyUI：

```bash
python main.py --listen 0.0.0.0 --port 8188
```

## 默认管理员账户

系统已创建默认管理员账户：

- **用户名**: `admin`
- **密码**: `admin123`
- **邮箱**: `admin@comfyui.local`

## API 端点

### 用户认证 API

#### 用户注册
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",      // 必填，3-50字符，字母开头
  "password": "string",      // 必填，8+字符，包含大小写字母、数字、特殊字符
  "email": "string",         // 可选，邮箱格式
  "display_name": "string"   // 可选，显示名称
}
```

#### 用户登录
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",      // 用户名
  "password": "string"       // 密码
}
```

#### 获取当前用户信息
```
GET /api/auth/me
Authorization: Bearer {session_token}
```

#### 更新用户资料
```
PUT /api/auth/profile
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "display_name": "string",  // 可选
  "email": "string"          // 可选
}
```

#### 修改密码
```
POST /api/auth/change-password
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "old_password": "string",  // 旧密码
  "new_password": "string"   // 新密码
}
```

#### 刷新会话令牌
```
POST /api/auth/refresh
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "refresh_token": "string"  // 刷新令牌
}
```

#### 用户登出
```
POST /api/auth/logout
Authorization: Bearer {session_token}
```

### 模板管理 API

#### 创建模板
```
POST /api/templates
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "name": "string",          // 必填，模板名称
  "workflow_data": "string", // 必填，工作流数据（JSON字符串）
  "description": "string",   // 可选，描述
  "category": "string",      // 可选，分类
  "tags": "string",          // 可选，标签（逗号分隔）
  "is_public": boolean,      // 可选，是否公开
  "thumbnail": "string"      // 可选，缩略图（Base64）
}
```

#### 获取模板列表
```
GET /api/templates
Authorization: Bearer {session_token}
Query Parameters:
  include_public: boolean    // 是否包含公开模板
  page: integer              // 页码（默认1）
  page_size: integer         // 每页数量（默认20）
  sort_by: string            // 排序字段
  sort_order: string         // 排序顺序（asc/desc）
  category: string           // 按分类筛选
  search: string             // 搜索关键词
```

#### 获取模板详情
```
GET /api/templates/{template_id}
Authorization: Bearer {session_token}
```

#### 更新模板
```
PUT /api/templates/{template_id}
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "name": "string",          // 可选
  "description": "string",   // 可选
  "category": "string",      // 可选
  "tags": "string",          // 可选
  "is_public": boolean,      // 可选
  "thumbnail": "string"      // 可选
}
```

#### 删除模板
```
DELETE /api/templates/{template_id}
Authorization: Bearer {session_token}
```

#### 切换收藏状态
```
POST /api/templates/{template_id}/favorite
Authorization: Bearer {session_token}
```

#### 使用模板（增加使用次数）
```
POST /api/templates/{template_id}/use
Authorization: Bearer {session_token}
```

#### 获取分类列表
```
GET /api/templates/categories
Authorization: Bearer {session_token}
Query Parameters:
  include_public: boolean    // 是否包含公开模板的分类
```

#### 获取热门模板
```
GET /api/templates/popular
Query Parameters:
  limit: integer             // 返回数量（默认10）
  days: integer              // 统计天数（默认30）
```

#### 导入模板
```
POST /api/templates/import
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "name": "string",          // 模板名称
  "workflow_data": "string", // 工作流数据
  "description": "string",   // 描述
  "category": "string",      // 分类
  "tags": "string",          // 标签
  "is_public": boolean       // 是否公开
}
```

#### 导出模板
```
GET /api/templates/{template_id}/export
Authorization: Bearer {session_token}
```

## 使用示例

### 1. 使用 curl 测试 API

```bash
# 用户注册
curl -X POST http://localhost:8188/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "TestPass123!", "email": "test@example.com"}'

# 用户登录
curl -X POST http://localhost:8188/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "TestPass123!"}'

# 创建模板
curl -X POST http://localhost:8188/api/templates \
  -H "Authorization: Bearer {session_token}" \
  -H "Content-Type: application/json" \
  -d '{"name": "我的模板", "workflow_data": "{}", "is_public": false}'
```

### 2. 使用 Python 脚本测试

```bash
# 运行示例脚本
python examples/user_auth_example.py

# 运行内存数据库测试
python test_user_auth_memory.py

# 运行完整测试
python test_user_auth.py
```

### 3. 使用 Postman 测试

1. 导入 Postman 集合（如果需要）
2. 设置环境变量：
   - `base_url`: `http://localhost:8188`
   - `session_token`: 登录后获取的令牌
3. 按顺序测试 API

## 数据库结构

### users 表（用户表）
- `id`: UUID 主键
- `username`: 用户名（唯一）
- `email`: 邮箱（唯一，可选）
- `display_name`: 显示名称
- `password_hash`: 密码哈希
- `salt`: 盐值
- `is_active`: 是否激活
- `is_admin`: 是否管理员
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `last_login_at`: 最后登录时间

### user_sessions 表（用户会话表）
- `id`: UUID 主键
- `user_id`: 用户ID（外键）
- `session_token`: 会话令牌（唯一）
- `refresh_token`: 刷新令牌（唯一）
- `user_agent`: 用户代理
- `ip_address`: IP地址
- `is_active`: 是否激活
- `created_at`: 创建时间
- `expires_at`: 过期时间
- `last_used_at`: 最后使用时间

### user_templates 表（用户模板表）
- `id`: UUID 主键
- `user_id`: 用户ID（外键）
- `name`: 模板名称
- `description`: 描述
- `workflow_data`: 工作流数据（JSON）
- `thumbnail`: 缩略图
- `category`: 分类
- `tags`: 标签
- `is_public`: 是否公开
- `is_favorite`: 是否收藏
- `view_count`: 查看次数
- `use_count`: 使用次数
- `created_at`: 创建时间
- `updated_at`: 更新时间

### user_preferences 表（用户偏好设置表）
- `user_id`: 用户ID（主键，外键）
- `theme`: 主题
- `language`: 语言
- `auto_save`: 自动保存
- `auto_save_interval`: 自动保存间隔
- `show_minimap`: 显示小地图
- `show_grid`: 显示网格
- `snap_to_grid`: 对齐网格
- `show_advanced_widgets`: 显示高级控件
- `show_node_titles`: 显示节点标题
- `created_at`: 创建时间
- `updated_at`: 更新时间

## 安全特性

### 密码安全
- 使用 PBKDF2 哈希算法
- 每个密码使用唯一的盐值
- 支持密码强度验证

### 会话安全
- 使用安全的随机令牌
- 会话过期机制
- 刷新令牌支持

### 输入验证
- 用户名格式验证
- 邮箱格式验证
- 密码强度验证
- SQL 注入防护

## 故障排除

### 1. 数据库迁移失败
```
错误: index ix_users_username already exists
```
解决方案：删除数据库文件并重新初始化
```bash
rm /home/gpu/ComfyUI/user/comfyui.db
python -c "from app.database.db import init_db; init_db()"
```

### 2. 服务器无法启动
```
错误: ModuleNotFoundError: No module named 'app.user_auth'
```
解决方案：确保 `app/user_auth` 目录存在且包含 `__init__.py` 文件

### 3. API 返回 404
```
错误: 404 Not Found
```
解决方案：确保服务器已正确启动并加载了用户认证路由

### 4. 认证失败
```
错误: 401 Unauthorized
```
解决方案：检查用户名和密码是否正确，或重新注册用户

## 开发说明

### 添加新功能
1. 在 `app/user_auth/models.py` 中添加数据库模型
2. 在 `app/user_auth/manager.py` 中添加业务逻辑
3. 在 `app/user_auth/routes.py` 中添加 API 路由
4. 创建数据库迁移脚本
5. 更新测试脚本

### 扩展模板系统
- 添加模板版本控制
- 支持模板分享链接
- 添加模板评分系统
- 支持模板导入导出格式

### 性能优化
- 添加数据库索引
- 实现缓存机制
- 优化查询性能
- 添加分页支持

## 联系支持

如有问题，请检查：
1. 查看服务器日志
2. 检查数据库连接
3. 验证 API 请求格式
4. 确保所有依赖已安装

## 许可证

本用户认证系统基于 ComfyUI 的现有架构开发，遵循相同的许可证条款。
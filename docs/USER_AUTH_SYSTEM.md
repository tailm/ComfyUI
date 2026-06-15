# ComfyUI 用户认证和模板管理系统

## 概述

本系统为 ComfyUI 添加了完整的用户认证和模板管理功能，包括用户注册、登录、会话管理以及用户自定义工作流模板的创建、管理和分享。

## 功能特性

### 用户认证功能
- **用户注册**：支持用户名、密码、邮箱注册
- **用户登录**：基于会话令牌的认证
- **会话管理**：支持会话刷新和登出
- **密码安全**：使用 PBKDF2 哈希算法存储密码
- **用户资料管理**：支持修改显示名称和邮箱
- **密码修改**：支持安全修改密码

### 模板管理功能
- **模板创建**：创建自定义工作流模板
- **模板管理**：查看、更新、删除模板
- **模板分享**：支持公开/私有模板设置
- **模板收藏**：收藏喜欢的模板
- **模板搜索**：按名称、描述、标签搜索
- **模板分类**：按分类组织模板
- **模板导入/导出**：支持模板数据导入导出
- **使用统计**：记录模板查看和使用次数

### 用户偏好设置
- **界面主题**：支持亮色/暗色主题
- **语言设置**：支持多语言界面
- **自动保存**：配置自动保存间隔
- **编辑器设置**：网格显示、对齐、节点标题等

## 数据库表结构

### 1. users (用户表)
- `id`: 用户ID (UUID)
- `username`: 用户名 (唯一)
- `email`: 邮箱 (唯一，可选)
- `display_name`: 显示名称
- `password_hash`: 密码哈希
- `salt`: 密码盐值
- `is_active`: 是否激活
- `is_admin`: 是否为管理员
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `last_login_at`: 最后登录时间

### 2. user_sessions (用户会话表)
- `id`: 会话ID (UUID)
- `user_id`: 用户ID (外键)
- `session_token`: 会话令牌 (唯一)
- `refresh_token`: 刷新令牌 (唯一)
- `user_agent`: 用户代理
- `ip_address`: IP地址
- `is_active`: 是否活跃
- `created_at`: 创建时间
- `expires_at`: 过期时间
- `last_used_at`: 最后使用时间

### 3. user_templates (用户模板表)
- `id`: 模板ID (UUID)
- `user_id`: 用户ID (外键)
- `name`: 模板名称
- `description`: 模板描述
- `workflow_data`: 工作流数据 (JSON)
- `thumbnail`: 缩略图
- `category`: 分类
- `tags`: 标签 (逗号分隔)
- `is_public`: 是否公开
- `is_favorite`: 是否收藏
- `view_count`: 查看次数
- `use_count`: 使用次数
- `created_at`: 创建时间
- `updated_at`: 更新时间

### 4. user_preferences (用户偏好表)
- `user_id`: 用户ID (主键，外键)
- `theme`: 主题 (light/dark)
- `language`: 语言
- `auto_save`: 是否自动保存
- `auto_save_interval`: 自动保存间隔 (毫秒)
- `show_minimap`: 显示缩略图
- `show_grid`: 显示网格
- `snap_to_grid`: 对齐到网格
- `show_advanced_widgets`: 显示高级控件
- `show_node_titles`: 显示节点标题
- `created_at`: 创建时间
- `updated_at`: 更新时间

## API 接口

### 认证相关接口

#### 1. 用户注册
```
POST /api/auth/register
Content-Type: application/json

{
    "username": "用户名",
    "password": "密码",
    "email": "邮箱（可选）",
    "display_name": "显示名称（可选）"
}
```

#### 2. 用户登录
```
POST /api/auth/login
Content-Type: application/json

{
    "username": "用户名",
    "password": "密码"
}
```

#### 3. 获取当前用户信息
```
GET /api/auth/me
Authorization: Bearer {session_token}
```

#### 4. 刷新会话令牌
```
POST /api/auth/refresh
Content-Type: application/json

{
    "refresh_token": "刷新令牌"
}
```

#### 5. 用户登出
```
POST /api/auth/logout
Authorization: Bearer {session_token}
```

#### 6. 修改密码
```
POST /api/auth/change-password
Authorization: Bearer {session_token}
Content-Type: application/json

{
    "old_password": "旧密码",
    "new_password": "新密码"
}
```

#### 7. 更新用户资料
```
PUT /api/auth/profile
Authorization: Bearer {session_token}
Content-Type: application/json

{
    "display_name": "新显示名称（可选）",
    "email": "新邮箱（可选）"
}
```

### 模板管理接口

#### 1. 创建模板
```
POST /api/templates
Authorization: Bearer {session_token}
Content-Type: application/json

{
    "name": "模板名称",
    "workflow_data": "工作流数据（JSON字符串）",
    "description": "模板描述（可选）",
    "category": "分类（可选）",
    "tags": "标签，逗号分隔（可选）",
    "thumbnail": "缩略图base64（可选）",
    "is_public": false
}
```

#### 2. 获取模板列表
```
GET /api/templates
Authorization: Bearer {session_token}（可选）
Query Parameters:
- include_public: 是否包含公开模板（默认false）
- category: 按分类筛选
- search: 搜索关键词
- favorite_only: 是否只显示收藏的模板（默认false）
- page: 页码（默认1）
- page_size: 每页数量（默认20）
- sort_by: 排序字段（name, created_at, updated_at, view_count, use_count，默认updated_at）
- sort_order: 排序顺序（asc, desc，默认desc）
```

#### 3. 获取模板详情
```
GET /api/templates/{template_id}
Authorization: Bearer {session_token}（可选，用于获取私有模板）
```

#### 4. 更新模板
```
PUT /api/templates/{template_id}
Authorization: Bearer {session_token}
Content-Type: application/json

{
    "name": "新模板名称（可选）",
    "description": "新模板描述（可选）",
    "workflow_data": "新工作流数据（可选）",
    "category": "新分类（可选）",
    "tags": "新标签（可选）",
    "thumbnail": "新缩略图（可选）",
    "is_public": false（可选）,
    "is_favorite": false（可选）
}
```

#### 5. 删除模板
```
DELETE /api/templates/{template_id}
Authorization: Bearer {session_token}
```

#### 6. 切换模板收藏状态
```
POST /api/templates/{template_id}/favorite
Authorization: Bearer {session_token}
```

#### 7. 使用模板（增加使用次数）
```
POST /api/templates/{template_id}/use
Authorization: Bearer {session_token}（可选）
```

#### 8. 获取分类列表
```
GET /api/templates/categories
Authorization: Bearer {session_token}（可选）
Query Parameters:
- include_public: 是否包含公开模板（默认false）
```

#### 9. 获取热门模板
```
GET /api/templates/popular
Query Parameters:
- limit: 返回数量限制（默认10）
- days: 统计天数（默认30）
```

#### 10. 导入模板
```
POST /api/templates/import
Authorization: Bearer {session_token}
Content-Type: application/json

{
    "name": "模板名称",
    "workflow_data": "工作流数据（JSON字符串或对象）",
    "description": "模板描述（可选）",
    "category": "分类（可选）",
    "tags": ["标签1", "标签2"] 或 "标签1,标签2"（可选）,
    "is_public": false（可选）,
    "is_favorite": false（可选）
}
```

#### 11. 导出模板
```
GET /api/templates/{template_id}/export
Authorization: Bearer {session_token}（可选，用于导出私有模板）
```

## 安装和配置

### 1. 数据库迁移
系统已包含数据库迁移脚本，启动 ComfyUI 时会自动执行迁移。

### 2. 默认管理员账户
系统会自动创建默认管理员账户：
- 用户名: `admin`
- 密码: `admin123`
- 邮箱: `admin@comfyui.local`

### 3. 启用用户认证系统
用户认证系统已集成到 ComfyUI 主服务器中，无需额外配置即可使用。

## 密码安全

### 密码要求
- 至少8个字符
- 至少包含一个大写字母
- 至少包含一个小写字母
- 至少包含一个数字
- 至少包含一个特殊字符 (!@#$%^&*()_+-=[]{}|;:,.<>?)

### 密码存储
- 使用 PBKDF2 哈希算法
- 每个密码使用唯一的盐值
- 迭代次数: 100,000
- 密钥长度: 32字节

## 会话管理

### 会话令牌
- 有效期: 24小时
- 使用安全的随机令牌
- 支持刷新令牌机制

### 刷新令牌
- 有效期: 30天
- 用于获取新的会话令牌
- 支持设备信息记录

## 模板管理

### 模板数据格式
模板使用 JSON 格式存储工作流数据，与 ComfyUI 的工作流格式兼容。

### 模板可见性
- **私有模板**: 仅创建者可见
- **公开模板**: 所有用户可见（需要登录）

### 模板搜索
支持按以下条件搜索：
- 模板名称
- 模板描述
- 标签
- 分类

## 使用示例

### 1. 用户注册
```bash
curl -X POST http://localhost:8188/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPassword123!",
    "email": "test@example.com",
    "display_name": "Test User"
  }'
```

### 2. 用户登录
```bash
curl -X POST http://localhost:8188/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPassword123!"
  }'
```

### 3. 创建模板
```bash
curl -X POST http://localhost:8188/api/templates \
  -H "Authorization: Bearer {session_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "我的第一个模板",
    "workflow_data": "{\"nodes\": [{\"id\": 1, \"type\": \"KSampler\", \"inputs\": {\"model\": \"model.safetensors\"}}]}",
    "description": "这是一个测试模板",
    "category": "测试",
    "tags": "测试,工作流",
    "is_public": false
  }'
```

### 4. 获取模板列表
```bash
curl -X GET "http://localhost:8188/api/templates?include_public=true&page=1&page_size=10" \
  -H "Authorization: Bearer {session_token}"
```

## 测试

运行测试脚本验证系统功能：
```bash
cd /home/gpu/ComfyUI
python test_user_auth.py
```

## 注意事项

1. **数据库迁移**: 系统启动时会自动执行数据库迁移，添加用户认证相关表。
2. **默认账户**: 系统会自动创建默认管理员账户（admin/admin123），建议首次登录后修改密码。
3. **会话安全**: 会话令牌应通过 HTTPS 传输，避免中间人攻击。
4. **密码安全**: 用户密码使用强哈希算法存储，但建议在生产环境中使用 HTTPS。
5. **模板数据**: 模板中的工作流数据应确保是有效的 JSON 格式。
6. **文件上传**: 当前版本不支持文件上传，缩略图应使用 base64 编码或 URL。

## 故障排除

### 1. 数据库迁移失败
- 检查数据库文件权限
- 确保 SQLite 数据库文件可写
- 查看日志文件获取详细错误信息

### 2. 用户认证失败
- 检查用户名和密码格式
- 验证会话令牌是否有效
- 检查用户账户是否被禁用

### 3. 模板操作失败
- 检查模板数据是否为有效 JSON
- 验证用户是否有操作权限
- 检查模板名称是否重复

## 扩展开发

### 添加新的用户字段
1. 修改 `app/user_auth/models.py` 中的 `User` 模型
2. 创建新的数据库迁移脚本
3. 更新 `UserAuthManager` 中的相关方法

### 添加新的模板字段
1. 修改 `app/user_auth/models.py` 中的 `UserTemplate` 模型
2. 创建新的数据库迁移脚本
3. 更新 `UserTemplateManager` 中的相关方法

### 添加新的 API 端点
1. 在 `app/user_auth/routes.py` 中添加新的路由处理函数
2. 在 `UserAuthRoutes.add_routes()` 方法中注册路由
3. 在 `server.py` 中确保路由被正确添加

## 许可证

本用户认证系统遵循 ComfyUI 的原始许可证。
# ComfyUI 多用户系统技术文档

## 概述

ComfyUI 实现了完整的多用户数据隔离和持久化功能，支持多用户环境下的工作流管理、历史记录查看和资产管理。

## 架构设计

### 1. 用户ID设计

#### ID格式
- **纯数字格式**：使用递增的数字作为用户ID
- **默认用户**：ID为"0"，username为"default"
- **新用户**：自动分配递增ID（"1", "2", "3"...）

#### ID生成逻辑
```python
def add_user(self, name):
    # 查找最大用户ID
    max_id = 0
    for existing_id in self.users.keys():
        if existing_id.isdigit():
            max_id = max(max_id, int(existing_id))
    
    # 新用户ID = max_id + 1
    user_id = str(max_id + 1)
    return user_id
```

### 2. 数据隔离架构

#### 目录结构
```
ComfyUI/
├── user/
│   ├── 0/                    # 用户0的数据
│   │   ├── workflows/        # 工作流
│   │   │   ├── workflow1.json
│   │   │   └── workflow2.json
│   │   └── comfy.settings.json
│   ├── 1/                    # 用户1的数据
│   │   └── workflows/
│   ├── users.json            # 用户配置
│   └── comfyui.db            # 数据库
├── output/
│   ├── 0/                    # 用户0的输出
│   │   ├── image1.png
│   │   └── image2.png
│   └── 1/                    # 用户1的输出
```

#### 数据库表结构

##### 用户配置表 (users.json)
```json
{
  "0": {
    "username": "default",
    "created_at": "2026-07-06T23:47:56.616269",
    "last_login": null
  },
  "1": {
    "username": "user1",
    "created_at": "2026-07-08T01:23:45.123456",
    "last_login": "2026-07-08T02:00:00.000000"
  }
}
```

##### 历史记录表 (comfyui.db)
```sql
CREATE TABLE history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    prompt TEXT,
    outputs TEXT,
    status TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME
);

CREATE INDEX idx_history_user_id ON history(user_id);
CREATE INDEX idx_history_prompt_id ON history(prompt_id);
```

##### 资产表 (comfyui.db)
```sql
CREATE TABLE assets (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36),  -- 用户隔离字段
    hash VARCHAR(256),
    size_bytes BIGINT,
    mime_type VARCHAR(255),
    created_at DATETIME NOT NULL
);

CREATE INDEX idx_assets_user_id ON assets(user_id);
```

### 3. API设计

#### 用户管理API

##### 获取用户列表
```http
GET /api/users
```

响应：
```json
{
  "storage": "server",
  "users": [
    {
      "userId": "0",
      "username": "default"
    },
    {
      "userId": "1",
      "username": "user1"
    }
  ]
}
```

##### 创建用户
```http
POST /api/users
Content-Type: application/json

{
  "username": "newuser"
}
```

响应：
```json
{
  "user_id": "2",
  "username": "newuser",
  "has_password": false
}
```

#### 工作流API

##### 获取用户工作流
```http
GET /api/userdata?dir=workflows
Header: comfy-user: 0
```

响应：
```json
[
  {
    "path": "workflow1.json",
    "size": 12345,
    "modified": 1783471811219
  }
]
```

#### 历史记录API

##### 获取用户历史
```http
GET /history?max_items=10
Header: comfy-user: 0
```

响应：
```json
{
  "prompt_id_1": {
    "prompt": {...},
    "outputs": {...},
    "status": {...},
    "created_at": "2026-07-08T02:17:11.599945"
  }
}
```

### 4. 用户隔离实现

#### 用户ID获取
```python
def get_request_user_id(self, request):
    user = "0"  # 默认用户
    if args.multi_user and "comfy-user" in request.headers:
        user = request.headers["comfy-user"]
    
    # 检查用户是否存在
    if user not in self.users:
        # 尝试通过username查找
        for user_id, user_info in self.users.items():
            if user_info.get("username") == user:
                return user_id
    
    return user
```

#### 工作流隔离
```python
def get_request_user_filepath(self, request, file):
    user = self.get_request_user_id(request)
    user_root = os.path.join(user_directory, user)
    path = os.path.join(user_root, file)
    return path
```

#### 输出文件隔离
```python
def get_user_output_directory(user_id: str) -> str:
    user_output_dir = os.path.join(output_directory, user_id)
    os.makedirs(user_output_dir, exist_ok=True)
    return user_output_dir
```

#### 历史记录隔离
```python
def _load_history_from_db(self, user_id, max_items=None):
    cursor.execute('''
        SELECT prompt_id, prompt, outputs, status, created_at 
        FROM history 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
    ''', (user_id, max_items))
```

#### 资产隔离
```python
def build_visible_owner_clause(owner_id: str):
    if owner_id == "":
        return AssetReference.owner_id == ""
    return AssetReference.owner_id.in_(["", owner_id])
```

### 5. 缓存机制

#### IS_CHANGED方法
为CLIPTextEncode节点添加IS_CHANGED方法，确保文本改变时缓存失效：

```python
@classmethod
def IS_CHANGED(cls, text, clip):
    import hashlib
    text_hash = hashlib.sha256(text.encode('utf-8')).hexdigest()
    return text_hash
```

#### 缓存失效流程
```
1. 用户修改提示词
2. 提交工作流
3. 调用IS_CHANGED方法
4. 计算文本哈希值
5. 比较缓存签名
6. 哈希值不同 → 缓存失效
7. 重新执行节点
```

### 6. 数据持久化

#### 历史记录保存
```python
def task_done(self, item_id, history_result, status, user_id="0"):
    # 保存到内存
    self.history[prompt_id] = {...}
    
    # 保存到数据库
    self._save_history_to_db(
        prompt_id=prompt_id,
        user_id=user_id,
        prompt_data=prompt,
        outputs=outputs,
        status=status
    )
```

#### 数据库保存实现
```python
def _save_history_to_db(self, prompt_id, user_id, prompt_data, outputs, status):
    cursor.execute('''
        INSERT OR REPLACE INTO history 
        (prompt_id, user_id, prompt, outputs, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        prompt_id,
        user_id,
        json.dumps(prompt_data),
        json.dumps(outputs),
        json.dumps(status),
        datetime.now().isoformat(),
        datetime.now().isoformat()
    ))
```

### 7. 安全考虑

#### 用户验证
- 检查用户ID是否存在
- 阻止系统用户访问（以"__"开头）
- 验证用户权限

#### 路径安全
```python
# 防止路径穿越攻击
if os.path.commonpath((root_dir, user_root)) != root_dir:
    return None

if os.path.commonpath((user_root, path)) != user_root:
    return None
```

#### 数据隔离
- 每个用户只能访问自己的数据
- 系统资产对所有用户可见（owner_id为空）
- 用户资产只对所属用户可见

### 8. 性能优化

#### 数据库索引
```sql
CREATE INDEX idx_history_user_id ON history(user_id);
CREATE INDEX idx_history_prompt_id ON history(prompt_id);
CREATE INDEX idx_assets_user_id ON assets(user_id);
```

#### 缓存策略
- 节点结果缓存
- 智能缓存失效
- 三级缓存系统

#### 查询优化
- 使用索引加速查询
- 限制返回数量
- 分页查询支持

### 9. 使用示例

#### 前端集成
```javascript
// 设置用户ID
localStorage["Comfy.userId"] = "0";
localStorage["Comfy.userName"] = "default";

// API请求
fetch("/api/userdata?dir=workflows", {
  headers: {
    "Comfy-User": "0"
  }
});
```

#### 命令行测试
```bash
# 获取用户列表
curl http://localhost:8188/api/users

# 获取用户0的工作流
curl -H "comfy-user: 0" http://localhost:8188/api/userdata?dir=workflows

# 获取用户0的历史记录
curl -H "comfy-user: 0" http://localhost:8188/history

# 创建新用户
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"testuser"}' \
  http://localhost:8188/api/users
```

### 10. 故障排查

#### 常见问题

##### 问题1：用户无法访问工作流
- 检查用户ID是否正确
- 检查comfy-user头是否设置
- 检查用户目录是否存在

##### 问题2：历史记录丢失
- 检查数据库文件是否存在
- 检查数据库表结构
- 检查user_id字段是否正确

##### 问题3：输出文件未隔离
- 检查SaveImage节点是否使用用户目录
- 检查user_id是否正确传递
- 检查输出目录权限

#### 日志查看
```bash
# 查看服务日志
tail -f /home/gpu/ComfyUI/user/comfyui_8188.log

# 查看用户相关日志
tail -f /home/gpu/ComfyUI/user/comfyui_8188.log | grep "user"
```

### 11. 未来扩展

#### 计划功能
- 用户权限管理
- 用户组支持
- 数据共享功能
- 用户配额限制
- 审计日志

#### API扩展
- 用户配置API
- 用户统计API
- 数据导出API
- 批量操作API

## 总结

ComfyUI的多用户系统提供了完整的数据隔离和持久化功能，确保每个用户的数据安全和隐私。通过纯数字用户ID、目录隔离、数据库隔离等多层隔离机制，实现了可靠的多用户环境支持。

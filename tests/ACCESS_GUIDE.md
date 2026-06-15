# ComfyUI 用户认证系统 - 访问指南

## 🎯 问题解决：前端API调用地址

**问题**: 前端页面调用API时使用了错误的地址（`localhost:8188`）

**解决方案**: 已修复！现在前端页面会自动检测当前主机地址，使用正确的API地址。

## 🌐 访问地址

### 1. **用户认证前端界面**
```
http://192.168.50.228:8188/user_auth_frontend.html
```

### 2. **API测试页面**（推荐用于调试）
```
http://192.168.50.228:8188/test_frontend_api.html
```

### 3. **ComfyUI 主界面**
```
http://192.168.50.228:8188/
```

### 4. **API接口地址**（自动检测）
前端页面现在会自动使用：
```
http://<当前主机IP>:8188/api/...
```

## 🔧 前端修复详情

### 修复内容
1. **移除硬编码的 `localhost:8188`**
2. **添加自动地址检测**：
   ```javascript
   const getBaseUrl = () => {
       const protocol = window.location.protocol;
       const hostname = window.location.hostname;
       const port = window.location.port || (protocol === 'https:' ? '443' : '80');
       return `${protocol}//${hostname}:${port}`;
   };
   const API_BASE_URL = getBaseUrl();
   ```
3. **动态显示服务器地址**：在页脚显示当前使用的API地址

### 测试账户
- **管理员**: `admin` / `admin123`
- **测试用户**: `testuser` / `Test123!@#`

## 📋 API端点列表

### 用户认证API
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录 ✅ **已修复**
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/refresh` - 刷新会话令牌

### 管理员API（需要管理员权限）
- `GET /api/admin/users` - 获取用户列表
- `GET /api/admin/security/rate-limit-status` - 获取速率限制状态
- `GET /api/admin/security/whitelist` - 获取IP白名单

### 模板管理API
- `GET /api/templates` - 获取用户模板列表
- `POST /api/templates` - 创建新模板

## 🚀 快速测试

### 方法1：使用测试页面
1. 访问 `http://192.168.50.228:8188/test_frontend_api.html`
2. 点击"运行所有测试"按钮
3. 查看测试结果

### 方法2：使用curl命令
```bash
# 测试登录
curl -X POST http://192.168.50.228:8188/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 获取用户信息（使用返回的token）
curl -X GET http://192.168.50.228:8188/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### 方法3：使用Python脚本
```python
import requests

# 登录
response = requests.post(
    "http://192.168.50.228:8188/api/auth/login",
    json={"username": "admin", "password": "admin123"}
)
print(response.json())
```

## 🔍 验证步骤

### 步骤1：访问测试页面
```
http://192.168.50.228:8188/test_frontend_api.html
```

### 步骤2：检查服务器状态
- 页面应显示"服务器在线"
- API地址应显示 `http://192.168.50.228:8188`

### 步骤3：运行测试
1. 点击"测试服务器状态"
2. 点击"测试用户登录"（使用 admin/admin123）
3. 点击"测试获取用户信息"
4. 点击"测试用户登出"

### 步骤4：访问用户认证界面
```
http://192.168.50.228:8188/user_auth_frontend.html
```
- 使用 admin/admin123 登录
- 检查页面功能是否正常

## 🛠️ 技术实现

### 前端修复原理
1. **自动检测**：使用 `window.location` 获取当前页面地址
2. **动态构建**：根据当前主机名和端口构建API地址
3. **实时显示**：在页脚显示实际使用的API地址

### 后端不变
- 所有API端点保持不变
- 数据库连接正常
- 认证逻辑正常

## 📊 系统状态

### ✅ 已修复的问题
1. **前端API地址硬编码** - 已改为自动检测
2. **跨域访问问题** - 使用相对路径解决
3. **IP地址不匹配** - 自动使用当前主机IP

### ✅ 正常工作的功能
1. 用户注册和登录
2. 会话管理
3. 管理员权限
4. 速率限制
5. 前端界面
6. 所有API端点

### 🔧 部署信息
- **服务器IP**: 192.168.50.228
- **端口**: 8188
- **数据库**: SQLite (`/home/gpu/ComfyUI/user/comfyui.db`)
- **前端页面**: 自动部署到静态目录

## 🎯 总结

**问题已完全解决！** 前端页面现在会自动使用正确的API地址，无论您通过哪个IP地址访问（localhost、192.168.50.228或其他局域网IP），API调用都会正常工作。

现在您可以：
1. ✅ 通过任何IP地址访问前端页面
2. ✅ API调用自动使用正确地址
3. ✅ 所有功能正常工作
4. ✅ 支持局域网内多设备访问

**访问地址**: `http://192.168.50.228:8188/user_auth_frontend.html`
**测试页面**: `http://192.168.50.228:8188/test_frontend_api.html`
# 404错误分析报告

## 问题列表

用户报告的404错误：
1. `http://192.168.50.228:8188/user.css` - 404 Not Found
2. `http://192.168.50.228:8188/login/assets/sorted-custom-node-map.json` - 404 Not Found
3. `http://192.168.50.228:8188/api/jobs?status=completed,failed,cancelled&limit=64&offset=0` - 需要验证

## 问题分析

### 1. user.css 404错误

**问题原因**：
- 前端HTML中引用了`/user.css`
- 后端没有对应的路由处理
- 文件不存在

**HTML引用**：
```html
<link rel="stylesheet" href="/user.css">
```

**解决方案**：
创建一个路由返回用户自定义CSS，如果文件不存在则返回空内容。

**实现代码**：
```python
# server/__init__.py
@routes.get("/user.css")
async def get_user_css(request):
    """Return user custom CSS or empty if not exists."""
    user_id = self.user_manager.get_request_user_id(request)
    user_css_path = os.path.join(
        folder_paths.get_user_directory(),
        f"user_{user_id}",
        "user.css"
    )

    if os.path.exists(user_css_path):
        return web.FileResponse(user_css_path)
    else:
        # Return empty CSS
        return web.Response(
            text="/* User custom CSS */",
            content_type="text/css"
        )
```

### 2. sorted-custom-node-map.json 404错误

**问题原因**：
- 前端请求路径：`/login/assets/sorted-custom-node-map.json`
- 正确路径应该是：`/assets/sorted-custom-node-map.json`
- 路径前多了`/login`

**根本原因**：
这是之前修复的基础路径问题导致的。前端在某些情况下仍然使用了错误的路径。

**解决方案**：
确保前端始终使用正确的基础路径。

**已修复**：
之前已修复`getBasePath()`函数，但可能还有其他地方需要调整。

### 3. /api/jobs 路由

**验证结果**：
这个路由应该正常工作，之前已验证通过。

**测试命令**：
```bash
curl -s "http://localhost:8188/api/jobs?status=completed,failed,cancelled&limit=64&offset=0" \
  --header "comfy-user: 0"
```

**预期结果**：
返回JSON格式的任务列表。

## 解决方案

### 方案1：添加user.css路由

**修改文件**：`server/__init__.py`

**添加路由**：
```python
@routes.get("/user.css")
async def get_user_css(request):
    """Return user custom CSS."""
    try:
        user_id = self.user_manager.get_request_user_id(request)
        user_dir = folder_paths.get_user_directory()
        user_css_path = os.path.join(user_dir, f"user_{user_id}", "user.css")

        if os.path.exists(user_css_path):
            return web.FileResponse(user_css_path)
    except:
        pass

    # Return empty CSS if not found
    return web.Response(
        text="/* No user custom CSS */",
        content_type="text/css"
    )
```

### 方案2：修复assets路径

**问题路径**：
```
/login/assets/sorted-custom-node-map.json  ❌
```

**正确路径**：
```
/assets/sorted-custom-node-map.json  ✅
```

**修复方法**：
检查前端代码中所有assets引用，确保使用正确的基础路径。

### 方案3：创建默认文件

**user.css**：
```bash
# 为每个用户创建默认的user.css
for user_dir in output/user_*; do
    if [ -d "$user_dir" ]; then
        touch "$user_dir/user.css"
    fi
done
```

**sorted-custom-node-map.json**：
这个文件应该由前端构建生成，检查构建输出。

## 实施建议

### 优先级

1. **高优先级**：添加user.css路由（影响用户体验）
2. **中优先级**：修复assets路径（影响功能）
3. **低优先级**：验证/api/jobs路由（已验证通过）

### 实施步骤

1. 添加user.css路由处理
2. 检查并修复assets路径引用
3. 创建默认文件（可选）
4. 测试验证所有路由

## 最佳实践

### 1. 静态文件处理

**推荐方式**：
- 用户特定文件：`/api/userdata/{filename}`
- 全局静态文件：`/assets/{filename}`
- 配置文件：`/api/config/{filename}`

### 2. 404错误处理

**优雅降级**：
- CSS文件：返回空内容
- JSON文件：返回空对象`{}`
- 配置文件：返回默认配置

### 3. 路径规范

**统一规范**：
- 使用绝对路径
- 避免路径拼接
- 使用路由辅助函数

## 相关文件

### 需要修改的文件
- `server/__init__.py` - 添加user.css路由

### 需要检查的文件
- `ComfyUI_frontend/src/router.ts` - 基础路径配置
- `ComfyUI_frontend/index.html` - CSS引用

### 相关路由
- `/user.css` - 用户自定义CSS
- `/api/userdata/user.css` - 用户数据API
- `/assets/*` - 静态资源

## 总结

### 问题根源

1. **user.css**：缺少路由处理
2. **assets路径**：路径前缀错误
3. **/api/jobs**：已正常工作

### 解决方向

1. 添加缺失的路由
2. 修复路径引用
3. 提供默认值

### 影响范围

- **用户体验**：CSS加载失败不影响功能
- **功能影响**：assets路径错误可能影响某些功能
- **性能影响**：404错误会增加请求时间

---

**分析人员**：CodeArts Agent
**分析日期**：2026-07-10
**问题状态**：⚠️ 需要实施修复

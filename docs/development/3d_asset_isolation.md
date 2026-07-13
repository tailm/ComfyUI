# 3D模型用户隔离配置指南

## 概述

本文档说明如何为3D模型工作流配置用户目录隔离和资产管理。

## 功能特性

### 1. 用户目录隔离

3D模型文件将自动保存到用户专属目录：
- 输出目录：`output/user_{user_id}/3d/`
- 临时目录：`output/user_{user_id}/temp/`
- 缓存目录：`output/user_{user_id}/cache/`

### 2. 资产隔离

每个用户的3D资产完全隔离：
- 用户只能看到自己的3D资产
- 管理员可以查看所有资产
- 跨用户访问被自动拒绝

### 3. 支持的3D格式

- GLB (GL Transmission Format Binary)
- GLTF (GL Transmission Format JSON)
- OBJ (Wavefront OBJ)
- FBX (Autodesk FBX)
- STL (Stereolithography)
- USDZ (Universal Scene Description)

## 使用方法

### 1. SaveGLB节点

SaveGLB节点已自动支持用户隔离：

```python
# 在工作流中使用SaveGLB节点
# 文件将自动保存到用户目录
{
  "class_type": "SaveGLB",
  "inputs": {
    "mesh": ["mesh_node", 0],
    "filename_prefix": "3d/my_model"
  }
}
```

**输出路径**：
- 用户0：`output/user_0/3d/my_model_00001_.glb`
- 用户1：`output/user_1/3d/my_model_00001_.glb`

### 2. 3D资产API

#### 列出3D资产

```bash
GET /assets/3d?format=glb&limit=10
Headers:
  comfy-user: user_123
```

响应：
```json
{
  "assets": [
    {
      "id": "asset-uuid",
      "name": "my_model.glb",
      "format": "glb",
      "size_bytes": 1234567,
      "created_at": "2026-07-09T10:00:00",
      "file_path": "output/user_123/3d/my_model_00001_.glb"
    }
  ]
}
```

#### 获取单个资产

```bash
GET /assets/3d/{asset_id}
Headers:
  comfy-user: user_123
```

#### 删除资产

```bash
DELETE /assets/3d/{asset_id}?delete_file=true
Headers:
  comfy-user: user_123
```

#### 注册资产

```bash
POST /assets/3d
Headers:
  comfy-user: user_123
Body:
{
  "file_path": "output/user_123/3d/my_model.glb",
  "name": "My 3D Model",
  "format": "glb",
  "metadata": {
    "description": "A 3D model created with ComfyUI",
    "tags": ["character", "game"]
  }
}
```

#### 获取统计信息

```bash
GET /assets/3d/statistics
Headers:
  comfy-user: user_123
```

响应：
```json
{
  "total_assets": 10,
  "total_size_bytes": 12345678,
  "total_size_mb": 11.77,
  "formats": {
    "glb": 5,
    "obj": 3,
    "fbx": 2
  }
}
```

## 实现细节

### 1. SaveGLB节点改造

SaveGLB节点已修改为：
1. 从prompt上下文获取user_id
2. 使用用户专属输出目录
3. 在metadata中记录user_id
4. 返回结果包含user_id信息

```python
# comfy_extras/nodes_save_3d.py

@classmethod
def execute(cls, mesh, filename_prefix):
    # 获取user_id
    user_id = "0"
    if hasattr(cls.hidden, 'prompt') and cls.hidden.prompt:
        user_id = cls.hidden.prompt.get('user_id', '0')
    
    # 使用用户目录
    from folder_paths.user_directory import get_user_output_directory
    user_output_dir = get_user_output_directory(user_id)
    
    # 保存文件到用户目录
    # ...
```

### 2. Asset3DService

Asset3DService提供完整的3D资产管理：
- 自动用户隔离
- 支持多种3D格式
- 文件哈希计算
- 元数据管理
- 统计功能

### 3. 文件系统隔离

所有3D文件保存在用户专属目录：
```
output/
├── user_0/
│   ├── 3d/
│   │   ├── model1_00001_.glb
│   │   └── model2_00001_.glb
│   ├── images/
│   ├── temp/
│   └── cache/
├── user_1/
│   ├── 3d/
│   │   └── model3_00001_.glb
│   └── ...
```

## 配置选项

### 1. 禁用用户隔离

如果需要禁用用户隔离（不推荐）：

```python
# 在SaveGLB节点中
user_output_dir = folder_paths.get_output_directory()  # 使用默认目录
```

### 2. 自定义输出子目录

修改filename_prefix参数：

```python
# 保存到自定义子目录
filename_prefix = "3d/projects/project_a/model"
# 输出：output/user_123/3d/projects/project_a/model_00001_.glb
```

### 3. 元数据配置

在保存时添加自定义元数据：

```python
metadata = {
    "project": "game_assets",
    "version": "1.0",
    "author": "user_123",
    "tags": ["character", "hero"]
}
```

## 权限验证

### 1. 自动权限验证

所有API自动验证权限：
- 用户只能访问自己的资产
- 管理员可以访问所有资产
- 跨用户访问返回403错误

### 2. 权限错误处理

```python
try:
    asset = service.get_3d_asset(asset_id)
except PermissionError:
    # 返回403 Forbidden
    return web.json_response(
        {'error': 'Permission denied'},
        status=403
    )
```

## 性能优化

### 1. 文件哈希缓存

相同文件只存储一次：
- 计算文件SHA256哈希
- 相同哈希共享Asset记录
- 每个用户有独立的AssetReference

### 2. 批量操作

支持批量查询和删除：
```python
# 批量检查权限
ownership = repository.batch_check_ownership(asset_ids)

# 批量删除
for asset_id in asset_ids:
    if ownership[asset_id]:
        service.delete_3d_asset(asset_id)
```

### 3. 索引优化

数据库索引：
- `ix_asset_references_owner_id` - 按用户查询
- `ix_asset_references_created_at` - 按时间排序
- `ix_asset_references_owner_name` - 按用户和名称查询

## 故障排查

### 问题1：文件保存到错误目录

**症状**：3D文件保存到默认output目录而非用户目录

**解决方案**：
1. 检查user_id是否正确传递
2. 检查get_user_output_directory是否正常工作
3. 查看日志中的user_id值

### 问题2：无法访问自己的资产

**症状**：用户看不到自己的3D资产

**解决方案**：
1. 检查资产的owner_id是否正确
2. 检查API请求头中的comfy-user值
3. 运行数据诊断工具

### 问题3：跨用户访问

**症状**：用户A能看到用户B的资产

**解决方案**：
1. 立即停止服务
2. 检查Asset3DService实现
3. 运行API审查工具
4. 修复权限验证逻辑

## 最佳实践

1. **始终使用用户目录**
   - 不要硬编码输出路径
   - 使用get_user_output_directory获取路径

2. **记录元数据**
   - 在metadata中记录user_id
   - 添加有用的描述和标签

3. **定期清理**
   - 清理临时文件
   - 归档旧资产
   - 监控磁盘使用

4. **权限验证**
   - 所有API必须验证权限
   - 使用Asset3DService而非直接数据库访问

## 相关文档

- [用户数据隔离开发指南](../development/data_isolation_guide.md)
- [部署文档](../deployment/user_data_isolation.md)
- [运维手册](../operations/user_data_isolation.md)

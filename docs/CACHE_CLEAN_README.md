# ComfyUI 缓存清理和重启指南

## 📋 概述

为了解决Python缓存问题导致的服务重启后功能不生效的问题，我们创建了专门的缓存清理和重启脚本。

## 🛠️ 可用脚本

### 1. 清理Python缓存脚本
**文件**: `clean_python_cache.sh`
**功能**: 清理所有Python缓存文件
**用法**: 
```bash
cd /home/gpu/ComfyUI
./clean_python_cache.sh
```

**清理内容**:
- `__pycache__` 目录
- `.pyc` 文件（Python字节码）
- `.pyo` 文件（优化后的字节码）
- pip缓存
- ComfyUI自定义节点缓存
- Python编译缓存

### 2. 完整重启脚本（推荐）
**文件**: `restart_comfyui_with_cache_clean.sh`
**功能**: 停止服务 → 清理缓存 → 重启服务
**用法**:
```bash
cd /home/gpu/ComfyUI
./restart_comfyui_with_cache_clean.sh
```

**执行步骤**:
1. 停止当前运行的ComfyUI服务
2. 清理所有Python缓存文件
3. 等待缓存清理完成
4. 启动ComfyUI服务
5. 检查服务状态

### 3. 简化重启脚本
**文件**: `restart_comfyui.sh`
**功能**: 调用完整重启脚本的简化版本
**用法**:
```bash
cd /home/gpu/ComfyUI
./restart_comfyui.sh
```

## 🔧 使用场景

### 场景1: 修改了Python代码后重启
当您修改了以下文件后，需要清理缓存：
- `custom_nodes/` 目录下的Python文件
- ComfyUI核心Python文件
- 任何`.py`文件

**操作**:
```bash
cd /home/gpu/ComfyUI
./restart_comfyui_with_cache_clean.sh
```

### 场景2: 仅清理缓存（不重启服务）
当您只需要清理缓存但不想重启服务时：
```bash
cd /home/gpu/ComfyUI
./clean_python_cache.sh
```

### 场景3: 快速重启（已清理过缓存）
如果您刚刚清理过缓存，可以快速重启：
```bash
cd /home/gpu/ComfyUI
# 停止服务
ps aux | grep "python main.py" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null
sleep 2

# 启动服务
nohup python main.py --listen 0.0.0.0 --port 8188 > comfyui.log 2>&1 &
```

## 📊 脚本输出示例

### 清理缓存输出:
```
开始清理Python缓存...
清理 __pycache__ 目录...
清理 .pyc 文件...
清理 .pyo 文件...
清理 Python 字节码缓存...
清理 pip 缓存...
Files removed: 1720 (11250.9 MB)
Directories removed: 41
清理 ComfyUI 自定义节点缓存...
清理 ComfyUI 自身缓存...
清理 Python 编译缓存...
Python缓存清理完成！

清理结果：
1. __pycache__ 目录: 已清理
2. .pyc 文件: 已清理
3. .pyo 文件: 已清理
4. 字节码缓存: 已清理
5. pip 缓存: 已清理
6. 自定义节点缓存: 已清理
7. ComfyUI 缓存: 已清理
8. Python 编译缓存: 已清理

检查剩余缓存文件：
✅ 所有Python缓存已清理干净！
```

### 重启服务输出:
```
==========================================
ComfyUI 服务重启脚本（带缓存清理）
==========================================

[1/4] 停止当前ComfyUI服务...
找到ComfyUI进程: 1225710
✅ ComfyUI服务已停止

[2/4] 清理Python缓存...
...（清理过程）...

[3/4] 等待缓存清理完成...

[4/4] 启动ComfyUI服务...
启动命令: python main.py --listen 0.0.0.0 --port 8188

等待服务启动...
✅ ComfyUI服务已启动 (PID: 1318915)

检查服务状态...
✅ 服务运行正常，可通过以下地址访问：
  本地: http://localhost:8188
  网络: http://192.168.50.228:8188

日志文件: /home/gpu/ComfyUI/comfyui.log
查看日志: tail -f /home/gpu/ComfyUI/comfyui.log

==========================================
重启完成！
==========================================
```

## 🚀 快速命令参考

| 命令 | 功能 | 说明 |
|------|------|------|
| `./clean_python_cache.sh` | 清理Python缓存 | 不重启服务 |
| `./restart_comfyui_with_cache_clean.sh` | 完整重启（推荐） | 清理缓存 + 重启服务 |
| `./restart_comfyui.sh` | 简化重启 | 调用完整重启脚本 |
| `ps aux \| grep "python main.py"` | 查看服务状态 | 检查是否运行 |
| `tail -f comfyui.log` | 查看实时日志 | 监控服务输出 |
| `pkill -f "python main.py"` | 停止服务 | 强制停止 |

## 🔍 常见问题

### Q1: 为什么需要清理Python缓存？
A: Python会缓存编译后的字节码（`.pyc`文件）以加快加载速度。当您修改了Python代码后，如果缓存没有被清理，Python可能会继续使用旧的缓存文件，导致修改不生效。

### Q2: 清理缓存会影响性能吗？
A: 首次清理后重新运行会稍微慢一点，因为Python需要重新编译代码。但之后就会恢复正常。这是确保代码修改生效的必要步骤。

### Q3: 可以只清理特定目录的缓存吗？
A: 可以，修改`clean_python_cache.sh`脚本中的路径即可。默认清理整个ComfyUI目录。

### Q4: 清理缓存会删除我的数据吗？
A: 不会。脚本只删除Python缓存文件（`.pyc`, `.pyo`, `__pycache__`），不会删除您的模型、配置或工作流数据。

### Q5: 如何验证缓存已清理？
A: 运行脚本后会显示清理结果。您也可以手动检查：
```bash
find /home/gpu/ComfyUI -name "*.pyc" -o -name "__pycache__" | wc -l
```
如果返回0，表示缓存已清理干净。

## 📝 最佳实践

1. **修改代码后总是清理缓存**：确保修改生效
2. **使用完整重启脚本**：`./restart_comfyui_with_cache_clean.sh`
3. **检查服务状态**：重启后验证服务是否正常运行
4. **查看日志**：如有问题，查看`comfyui.log`文件
5. **定期清理**：如果频繁修改代码，建议每次修改后都清理缓存

## 🎯 针对用户图标扩展的特别说明

当您修改了用户图标扩展（`custom_nodes/user_quick_access/`）后：

1. **清理缓存**：确保Python重新加载修改后的代码
2. **重启服务**：使修改生效
3. **清除浏览器缓存**：按`Ctrl+Shift+R`强制刷新页面
4. **测试功能**：验证修改是否生效

**完整流程**：
```bash
cd /home/gpu/ComfyUI
./restart_comfyui_with_cache_clean.sh
# 然后在浏览器中按 Ctrl+Shift+R 刷新页面
```

## 📞 故障排除

### 问题1: 脚本没有执行权限
```bash
chmod +x clean_python_cache.sh
chmod +x restart_comfyui_with_cache_clean.sh
chmod +x restart_comfyui.sh
```

### 问题2: 服务启动失败
检查日志：
```bash
tail -50 /home/gpu/ComfyUI/comfyui.log
```

### 问题3: 端口被占用
```bash
# 查看占用8188端口的进程
lsof -i :8188
# 强制释放端口
fuser -k 8188/tcp
```

### 问题4: 缓存清理不彻底
手动清理：
```bash
# 彻底清理
find /home/gpu/ComfyUI -type d -name "__pycache__" -exec rm -rf {} +
find /home/gpu/ComfyUI -name "*.pyc" -delete
find /home/gpu/ComfyUI -name "*.pyo" -delete
```

## ✅ 验证步骤

重启后，验证用户图标功能：

1. 访问 http://localhost:8188
2. 按 `Ctrl+Shift+R` 强制刷新浏览器
3. 测试用户图标功能：
   - 鼠标悬停显示浮标
   - 单击显示菜单
   - 双击显示设置模态框
   - 菜单项功能正常

如果功能正常，说明缓存清理和重启成功！
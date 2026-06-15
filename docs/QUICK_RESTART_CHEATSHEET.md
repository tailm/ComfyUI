# ComfyUI 快速重启速查表

## 🚀 一键重启（推荐）
```bash
cd /home/gpu/ComfyUI
./restart_comfyui.sh
```
或
```bash
cd /home/gpu/ComfyUI
./restart_comfyui_with_cache_clean.sh
```

## 🔧 分步操作

### 1. 仅清理缓存（不重启）
```bash
cd /home/gpu/ComfyUI
./clean_python_cache.sh
```

### 2. 停止服务
```bash
# 方法1：使用脚本
cd /home/gpu/ComfyUI
./restart_comfyui_with_cache_clean.sh  # 会自动停止

# 方法2：手动停止
ps aux | grep "python main.py" | grep -v grep | awk '{print $2}' | xargs kill -9
```

### 3. 启动服务
```bash
cd /home/gpu/ComfyUI
nohup python main.py --listen 0.0.0.0 --port 8188 > comfyui.log 2>&1 &
```

## 📊 状态检查

### 检查服务是否运行
```bash
ps aux | grep "python main.py" | grep -v grep
```

### 检查端口占用
```bash
lsof -i :8188
```

### 查看实时日志
```bash
tail -f /home/gpu/ComfyUI/comfyui.log
```

### 查看最后N行日志
```bash
tail -50 /home/gpu/ComfyUI/comfyui.log  # 最后50行
```

## 🎯 用户图标扩展专用

### 修改扩展后重启流程
```bash
# 1. 进入ComfyUI目录
cd /home/gpu/ComfyUI

# 2. 完整重启（清理缓存+重启服务）
./restart_comfyui_with_cache_clean.sh

# 3. 等待服务启动（约5秒）
sleep 5

# 4. 检查服务状态
ps aux | grep "python main.py" | grep -v grep

# 5. 在浏览器中强制刷新
#    按 Ctrl+Shift+R (Windows/Linux)
#    或 Cmd+Shift+R (Mac)
```

### 验证用户图标功能
1. 访问 http://localhost:8188
2. 强制刷新浏览器（Ctrl+Shift+R）
3. 测试功能：
   - ✅ 鼠标悬停显示浮标
   - ✅ 单击显示菜单
   - ✅ 双击显示设置模态框
   - ✅ 菜单项功能正常

## 🔍 故障排除

### 问题：修改不生效
```bash
# 1. 清理所有缓存
./clean_python_cache.sh

# 2. 重启服务
./restart_comfyui_with_cache_clean.sh

# 3. 强制刷新浏览器
#    Ctrl+Shift+R 或 Cmd+Shift+R

# 4. 检查扩展是否加载
#    按F12打开控制台，查看是否有错误
```

### 问题：服务启动失败
```bash
# 查看错误日志
tail -100 /home/gpu/ComfyUI/comfyui.log

# 检查端口冲突
lsof -i :8188

# 释放端口
fuser -k 8188/tcp

# 重新启动
./restart_comfyui_with_cache_clean.sh
```

### 问题：浏览器缓存
```bash
# 除了强制刷新，还可以：
# 1. 打开无痕窗口测试
# 2. 清除浏览器缓存
# 3. 禁用缓存（开发者工具 → Network → Disable cache）
```

## 📝 常用命令速查

| 命令 | 功能 | 示例 |
|------|------|------|
| `./restart_comfyui.sh` | 快速重启 | 一键完成 |
| `./clean_python_cache.sh` | 清理缓存 | 修改代码后使用 |
| `ps aux \| grep python` | 查看进程 | 检查是否运行 |
| `tail -f comfyui.log` | 实时日志 | 监控启动过程 |
| `lsof -i :8188` | 检查端口 | 查看端口占用 |
| `fuser -k 8188/tcp` | 释放端口 | 解决端口冲突 |
| `curl http://localhost:8188` | 测试连接 | 检查服务可用性 |

## ⚡ 快速重启命令（复制粘贴）

```bash
# 完整重启（推荐）
cd /home/gpu/ComfyUI && ./restart_comfyui_with_cache_clean.sh

# 仅清理缓存
cd /home/gpu/ComfyUI && ./clean_python_cache.sh

# 手动重启
cd /home/gpu/ComfyUI && ps aux | grep "python main.py" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null; sleep 2; nohup python main.py --listen 0.0.0.0 --port 8188 > comfyui.log 2>&1 &
```

## ✅ 验证步骤清单

重启后，按顺序检查：

1. [ ] 服务是否运行：`ps aux | grep "python main.py"`
2. [ ] 端口是否监听：`lsof -i :8188`
3. [ ] 网页是否可访问：打开 http://localhost:8188
4. [ ] 浏览器强制刷新：Ctrl+Shift+R
5. [ ] 用户图标功能测试：
   - [ ] 鼠标悬停显示浮标
   - [ ] 单击显示菜单
   - [ ] 双击显示设置模态框
   - [ ] 菜单项功能正常

## 🆘 紧急恢复

如果出现问题，按顺序执行：

```bash
# 1. 停止所有相关进程
pkill -f "python main.py"
pkill -f "comfyui"

# 2. 清理缓存
cd /home/gpu/ComfyUI && ./clean_python_cache.sh

# 3. 检查端口
lsof -i :8188
# 如果有占用，释放：fuser -k 8188/tcp

# 4. 重新启动
cd /home/gpu/ComfyUI && nohup python main.py --listen 0.0.0.0 --port 8188 > comfyui.log 2>&1 &

# 5. 等待并检查
sleep 5
ps aux | grep "python main.py" | grep -v grep
curl -s http://localhost:8188 > /dev/null && echo "服务正常" || echo "服务异常"
```

## 📞 帮助信息

- **日志文件**: `/home/gpu/ComfyUI/comfyui.log`
- **扩展目录**: `/home/gpu/ComfyUI/custom_nodes/`
- **用户图标扩展**: `/home/gpu/ComfyUI/custom_nodes/user_quick_access/`
- **脚本目录**: `/home/gpu/ComfyUI/`

**记住**: 修改代码后 → 清理缓存 → 重启服务 → 强制刷新浏览器
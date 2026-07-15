# ComfyUI 服务管理指南

## 服务管理脚本

使用 `scripts/service_manager.sh` 管理服务：

```bash
# 查看服务状态
./scripts/service_manager.sh status

# 启动服务（多用户模式，本地前端）
./scripts/service_manager.sh start

# 停止服务
./scripts/service_manager.sh stop

# 重启服务
./scripts/service_manager.sh restart

# 构建前端并重启
./scripts/service_manager.sh rebuild

# 查看日志
./scripts/service_manager.sh logs

# 清理日志
./scripts/service_manager.sh clean
```

## 命令说明

| 命令 | 说明 |
|------|------|
| start | 启动服务（多用户模式，从本地 web/ 目录加载前端） |
| stop | 停止服务（优雅停止 -> 强制停止） |
| restart | 重启服务 |
| rebuild | 构建前端 + 同步到 web/ + 重启服务 |
| status | 查看服务状态（进程、端口、HTTP、前端文件、日志） |
| logs | 查看最近50行日志 |
| clean | 备份并清空日志文件 |

## 手动管理

### 启动服务
```bash
cd /home/gpu/ComfyUI
python main.py --listen 0.0.0.0 --port 8188 --multi-user
```

### 停止服务
```bash
pkill -f "main.py.*--port 8188"
```

### 检查状态
```bash
# 检查进程
ps aux | grep "main.py" | grep -v grep

# 检查端口
ss -tln | grep :8188

# 检查HTTP
curl -s -o /dev/null -w "%{http_code}" http://localhost:8188/
```

## 启动参数

| 参数 | 说明 |
|------|------|
| `--listen 0.0.0.0` | 监听所有网络接口 |
| `--port 8188` | 使用端口8188 |
| `--multi-user` | 启用多用户模式 |

前端默认从 `web/` 目录加载，无需额外参数。

## 日志

- **位置**: `/home/gpu/ComfyUI/comfyui.log`
- **实时查看**: `tail -f comfyui.log`
- **清理**: `./scripts/service_manager.sh clean`

## 自动启动

### systemd

参考 `config/comfyui.service` 文件：

```bash
sudo cp config/comfyui.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable comfyui
sudo systemctl start comfyui
```

## 故障排除

### 服务无法启动
```bash
# 检查端口占用
lsof -i :8188

# 检查前端文件
ls web/index.html

# 查看错误日志
tail -50 comfyui.log
```

### 前端页面空白
```bash
# 重新构建前端
./scripts/service_manager.sh rebuild
```

### 服务崩溃
```bash
# 查看崩溃日志
grep -A 10 "Traceback\|Error\|Exception" comfyui.log

# 检查系统日志
dmesg | tail -20
```

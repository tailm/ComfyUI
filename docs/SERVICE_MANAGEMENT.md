# ComfyUI 服务管理

本文档介绍如何使用提供的脚本管理 ComfyUI 服务。

## 文件说明

1. **`start_comfyui.sh`** - 主启动脚本
2. **`comfyui_config.example.sh`** - 配置文件示例
3. **`comfyui.service`** - systemd 服务文件
4. **`SERVICE_MANAGEMENT.md`** - 本文档

## 快速开始

### 1. 基本使用

```bash
# 给脚本添加执行权限
chmod +x start_comfyui.sh

# 查看帮助
./start_comfyui.sh help

# 启动服务
./start_comfyui.sh start

# 查看状态
./start_comfyui.sh status

# 查看日志
./start_comfyui.sh logs

# 停止服务
./start_comfyui.sh stop

# 重启服务
./start_comfyui.sh restart
```

### 2. 自定义配置

```bash
# 复制配置文件示例
cp comfyui_config.example.sh comfyui_config.sh

# 编辑配置文件
nano comfyui_config.sh
```

配置文件示例：
```bash
#!/bin/bash
# ComfyUI 配置文件

# 服务端口
export COMFYUI_PORT=8188

# 绑定地址
export COMFYUI_HOST="0.0.0.0"

# 日志文件
export COMFYUI_LOG="comfyui.log"

# PID 文件
export COMFYUI_PID="comfyui.pid"

# Python 路径
export PYTHON_PATH="python3"

# 额外参数
# export EXTRA_ARGS="--highvram"
```

### 3. 使用 systemd 服务（推荐用于生产环境）

```bash
# 复制服务文件到系统目录
sudo cp comfyui.service /etc/systemd/system/

# 重新加载 systemd 配置
sudo systemctl daemon-reload

# 启用服务开机自启
sudo systemctl enable comfyui.service

# 启动服务
sudo systemctl start comfyui.service

# 查看服务状态
sudo systemctl status comfyui.service

# 查看服务日志
sudo journalctl -u comfyui.service -f

# 停止服务
sudo systemctl stop comfyui.service

# 重启服务
sudo systemctl restart comfyui.service
```

## 脚本功能详解

### 启动服务 (`start`)
- 检查依赖和端口
- 在后台启动 ComfyUI
- 记录 PID 到文件
- 验证服务是否成功启动

### 停止服务 (`stop`)
- 优雅停止服务进程
- 清理 PID 文件
- 支持强制终止

### 重启服务 (`restart`)
- 先停止再启动
- 确保服务完全重启

### 查看状态 (`status`)
- 显示服务运行状态
- 显示进程信息
- 检查端口监听状态

### 查看日志 (`logs`)
- 显示最近的日志
- 支持指定行数：`./start_comfyui.sh logs 100`

### 更新代码 (`update`)
- 从 git 仓库拉取最新代码
- 检查依赖更新

### 安装依赖 (`install`)
- 安装 requirements.txt 中的依赖
- 自动检测 pip 命令

## 环境变量

可以通过配置文件或直接设置环境变量：

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `COMFYUI_PORT` | 8188 | 服务端口 |
| `COMFYUI_HOST` | 0.0.0.0 | 绑定地址 |
| `COMFYUI_LOG` | comfyui.log | 日志文件路径 |
| `COMFYUI_PID` | comfyui.pid | PID 文件路径 |
| `PYTHON_PATH` | python3 | Python 解释器路径 |
| `EXTRA_ARGS` | 空 | 额外启动参数 |

## 常见问题

### 1. 端口被占用
```bash
# 查看占用端口的进程
sudo lsof -i :8188

# 或使用 netstat
netstat -tlnp | grep :8188
```

### 2. 权限问题
```bash
# 确保脚本有执行权限
chmod +x start_comfyui.sh

# 确保日志文件可写
touch comfyui.log
chmod 666 comfyui.log
```

### 3. 依赖问题
```bash
# 安装依赖
./start_comfyui.sh install

# 或手动安装
pip install -r requirements.txt
```

### 4. Python 路径问题
```bash
# 在配置文件中指定 Python 路径
export PYTHON_PATH="/usr/bin/python3.8"
```

### 5. GPU 内存问题
```bash
# 在配置文件中添加额外参数
export EXTRA_ARGS="--lowvram"
```

## 高级配置

### 多 GPU 支持
```bash
# 在配置文件中设置
export CUDA_VISIBLE_DEVICES="0,1"  # 使用 GPU 0 和 1
```

### 内存优化
```bash
# PyTorch 内存分配配置
export PYTORCH_CUDA_ALLOC_CONF="max_split_size_mb:128"
```

### 代理设置
```bash
# 如果需要代理
export HTTP_PROXY="http://proxy.example.com:8080"
export HTTPS_PROXY="http://proxy.example.com:8080"
```

## 监控和维护

### 查看实时日志
```bash
tail -f comfyui.log
```

### 监控资源使用
```bash
# 查看进程资源使用
top -p $(cat comfyui.pid)

# 或使用 htop
htop -p $(cat comfyui.pid)
```

### 定期清理日志
```bash
# 清理旧日志（保留最近7天）
find . -name "comfyui*.log" -mtime +7 -delete
```

## 故障排除

### 服务无法启动
1. 检查日志：`tail -n 100 comfyui.log`
2. 检查端口：`netstat -tlnp | grep :8188`
3. 检查依赖：`./start_comfyui.sh install`
4. 检查 Python：`python3 --version`

### 服务启动后立即退出
1. 检查 PID 文件：`cat comfyui.pid`
2. 检查进程：`ps -p $(cat comfyui.pid)`
3. 检查内存：可能是内存不足

### Web界面无法访问
1. 检查防火墙：`sudo ufw status`
2. 检查绑定地址：确保 `COMFYUI_HOST` 正确
3. 检查端口：确保端口未被占用

## 安全建议

1. **不要使用 root 用户运行**
   ```bash
   # 创建专用用户
   sudo useradd -r -s /bin/false comfyui
   ```

2. **限制访问**
   ```bash
   # 只绑定本地地址
   export COMFYUI_HOST="127.0.0.1"
   ```

3. **使用反向代理**
   ```nginx
   # Nginx 配置示例
   location / {
       proxy_pass http://127.0.0.1:8188;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   ```

4. **定期更新**
   ```bash
   # 定期更新代码和依赖
   ./start_comfyui.sh update
   ./start_comfyui.sh install
   ```

## 联系支持

如有问题，请检查：
1. 日志文件：`comfyui.log`
2. 系统日志：`journalctl -u comfyui.service`
3. 进程状态：`./start_comfyui.sh status`

或联系系统管理员。
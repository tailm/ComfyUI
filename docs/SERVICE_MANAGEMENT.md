# ComfyUI 服务管理指南

## 服务状态

ComfyUI 服务已成功重启并正在运行：

- **服务状态**: ✅ 运行中
- **进程ID**: 3190781
- **运行时间**: 00:06
- **内存使用**: 883.6 MB
- **CPU使用**: 114%
- **监听端口**: 8188
- **HTTP状态**: 200 (正常)
- **访问地址**: http://localhost:8188
- **管理界面**: http://localhost:8188/manager

## 服务管理脚本

已创建服务管理脚本 `service_manager.sh`，提供以下功能：

### 可用命令

```bash
# 查看服务状态
./service_manager.sh status

# 启动服务
./service_manager.sh start

# 停止服务
./service_manager.sh stop

# 重启服务
./service_manager.sh restart

# 查看日志
./service_manager.sh logs

# 清理日志
./service_manager.sh clean
```

### 脚本功能说明

1. **status** - 查看服务状态
   - 检查进程是否运行
   - 检查端口监听状态
   - 检查HTTP服务响应
   - 显示资源使用情况
   - 查看最近日志

2. **start** - 启动服务
   - 检查服务是否已运行
   - 验证虚拟环境和主脚本
   - 在后台启动服务
   - 等待服务就绪
   - 保存进程ID

3. **stop** - 停止服务
   - 优雅停止（SIGTERM）
   - 等待进程正常退出
   - 必要时强制停止（SIGKILL）
   - 清理PID文件

4. **restart** - 重启服务
   - 先停止服务
   - 等待2秒
   - 再启动服务

5. **logs** - 查看日志
   - 显示最后50行日志
   - 显示日志文件信息
   - 统计错误和警告数量

6. **clean** - 清理日志
   - 备份当前日志
   - 清空日志文件
   - 保留备份文件

## 手动管理命令

### 启动服务
```bash
cd /home/gpu/ComfyUI
nohup ./.venv/bin/python main.py --listen 0.0.0.0 --port 8188 --enable-manager > comfyui.log 2>&1 &
```

### 停止服务
```bash
# 查找进程
pgrep -f "main.py --listen 0.0.0.0 --port 8188"

# 优雅停止
pkill -f "main.py --listen 0.0.0.0 --port 8188"

# 强制停止
pkill -9 -f "main.py --listen 0.0.0.0 --port 8188"
```

### 检查服务状态
```bash
# 检查进程
ps aux | grep "main.py" | grep -v grep

# 检查端口
netstat -tlnp | grep :8188

# 检查HTTP服务
curl -s -o /dev/null -w "%{http_code}" http://localhost:8188/
```

## 服务配置

### 启动参数
- `--listen 0.0.0.0` - 监听所有网络接口
- `--port 8188` - 使用端口8188
- `--enable-manager` - 启用管理界面

### 日志文件
- **位置**: `/home/gpu/ComfyUI/comfyui.log`
- **轮转**: 手动使用 `./service_manager.sh clean`
- **监控**: 使用 `tail -f comfyui.log` 实时查看

### 资源监控
```bash
# 查看CPU和内存使用
top -p $(pgrep -f "main.py --listen 0.0.0.0 --port 8188")

# 查看详细资源使用
ps -p $(pgrep -f "main.py --listen 0.0.0.0 --port 8188") -o pid,ppid,user,%cpu,%mem,rss,vsz,cmd
```

## 故障排除

### 常见问题

#### 1. 服务无法启动
```bash
# 检查虚拟环境
ls -la /home/gpu/ComfyUI/.venv/bin/python

# 检查主脚本
ls -la /home/gpu/ComfyUI/main.py

# 检查端口占用
netstat -tlnp | grep :8188

# 检查依赖
./.venv/bin/python -c "import torch; print(torch.__version__)"
```

#### 2. 服务启动但无法访问
```bash
# 检查防火墙
sudo ufw status

# 检查服务绑定
netstat -tlnp | grep :8188

# 检查本地访问
curl http://localhost:8188/

# 检查外部访问（从其他机器）
curl http://服务器IP:8188/
```

#### 3. 服务内存占用过高
```bash
# 查看内存使用
ps -p $(pgrep -f "main.py") -o pid,ppid,user,%cpu,%mem,rss,vsz,cmd

# 重启服务释放内存
./service_manager.sh restart

# 调整Python内存管理
export PYTHONMALLOC=malloc
export PYTHONUNBUFFERED=1
```

#### 4. 服务崩溃
```bash
# 查看崩溃日志
tail -100 /home/gpu/ComfyUI/comfyui.log

# 检查Python错误
grep -A 10 -B 5 "Traceback\|Error\|Exception" /home/gpu/ComfyUI/comfyui.log

# 检查系统日志
dmesg | tail -20
```

### 性能优化

#### 1. 调整Python参数
```bash
# 在启动脚本中添加
export PYTHONOPTIMIZE=1
export PYTHONHASHSEED=0
export OMP_NUM_THREADS=4
```

#### 2. 调整ComfyUI参数
```bash
# 修改启动命令
./.venv/bin/python main.py \
  --listen 0.0.0.0 \
  --port 8188 \
  --enable-manager \
  --highvram \
  --normalvram \
  --lowvram \
  --novram
```

#### 3. 监控和告警
```bash
# 创建监控脚本
cat > /home/gpu/ComfyUI/monitor.sh << 'EOF'
#!/bin/bash
while true; do
  if ! curl -s http://localhost:8188/ > /dev/null; then
    echo "$(date): ComfyUI服务异常，正在重启..."
    ./service_manager.sh restart
  fi
  sleep 60
done
EOF

chmod +x /home/gpu/ComfyUI/monitor.sh
```

## 自动启动

### 使用systemd（推荐）
```bash
# 创建systemd服务文件
sudo tee /etc/systemd/system/comfyui.service << 'EOF'
[Unit]
Description=ComfyUI Service
After=network.target

[Service]
Type=simple
User=gpu
Group=gpu
WorkingDirectory=/home/gpu/ComfyUI
Environment="PATH=/home/gpu/ComfyUI/.venv/bin"
ExecStart=/home/gpu/ComfyUI/.venv/bin/python main.py --listen 0.0.0.0 --port 8188 --enable-manager
Restart=on-failure
RestartSec=10
StandardOutput=append:/home/gpu/ComfyUI/comfyui.log
StandardError=append:/home/gpu/ComfyUI/comfyui.log

[Install]
WantedBy=multi-user.target
EOF

# 启用服务
sudo systemctl daemon-reload
sudo systemctl enable comfyui
sudo systemctl start comfyui

# 查看状态
sudo systemctl status comfyui
```

### 使用crontab
```bash
# 编辑crontab
crontab -e

# 添加开机启动
@reboot cd /home/gpu/ComfyUI && nohup ./.venv/bin/python main.py --listen 0.0.0.0 --port 8188 --enable-manager > comfyui.log 2>&1 &
```

## 备份和恢复

### 备份配置
```bash
# 备份重要文件
BACKUP_DIR="/home/gpu/ComfyUI_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# 备份配置
cp -r /home/gpu/ComfyUI/models "$BACKUP_DIR/"
cp -r /home/gpu/ComfyUI/input "$BACKUP_DIR/"
cp -r /home/gpu/ComfyUI/output "$BACKUP_DIR/"
cp -r /home/gpu/ComfyUI/config "$BACKUP_DIR/"

# 备份日志
cp /home/gpu/ComfyUI/comfyui.log "$BACKUP_DIR/"

echo "备份完成: $BACKUP_DIR"
```

### 恢复配置
```bash
# 从备份恢复
BACKUP_DIR="/home/gpu/ComfyUI_backup_20240101_120000"

# 停止服务
./service_manager.sh stop

# 恢复文件
cp -r "$BACKUP_DIR/models" /home/gpu/ComfyUI/
cp -r "$BACKUP_DIR/input" /home/gpu/ComfyUI/
cp -r "$BACKUP_DIR/output" /home/gpu/ComfyUI/
cp -r "$BACKUP_DIR/config" /home/gpu/ComfyUI/

# 启动服务
./service_manager.sh start
```

## 安全建议

### 1. 防火墙配置
```bash
# 只允许特定IP访问
sudo ufw allow from 192.168.1.0/24 to any port 8188
sudo ufw deny 8188

# 或使用反向代理
# 配置Nginx/Apache反向代理
```

### 2. 访问控制
```bash
# 使用认证（如果ComfyUI支持）
# 或使用网络层认证
```

### 3. 定期更新
```bash
# 更新ComfyUI
cd /home/gpu/ComfyUI
git pull

# 更新依赖
./.venv/bin/pip install -r requirements.txt

# 重启服务
./service_manager.sh restart
```

## 联系方式

如有问题，请参考：
1. ComfyUI官方文档
2. 服务日志：`/home/gpu/ComfyUI/comfyui.log`
3. 使用 `./service_manager.sh logs` 查看日志
4. 使用 `./service_manager.sh status` 检查状态

## 更新日志

### 2024-01-01
- 创建服务管理脚本
- 实现完整的服务管理功能
- 添加故障排除指南
- 添加自动启动配置
- 添加备份恢复方案
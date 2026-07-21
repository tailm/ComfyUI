# 积分系统源码启动指南

本文档提供积分系统的源码启动指南，包括MySQL、Redis、积分服务的源码安装和启动步骤。

## 一、环境要求

### 1.1 系统要求
- 操作系统：Linux / macOS / Windows
- Python：3.8+
- MySQL：8.0+
- Redis：5.0+

### 1.2 依赖软件
- Python 3.8+
- pip（Python包管理器）
- MySQL 8.0+
- Redis 5.0+
- git（可选，用于克隆代码）

## 二、安装MySQL

### 2.1 Ubuntu/Debian

```bash
# 更新软件包列表
sudo apt update

# 安装MySQL服务器
sudo apt install -y mysql-server

# 启动MySQL服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 检查MySQL状态
sudo systemctl status mysql
```

### 2.2 CentOS/RHEL

```bash
# 安装MySQL仓库
sudo yum install -y https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm

# 安装MySQL服务器
sudo yum install -y mysql-community-server

# 启动MySQL服务
sudo systemctl start mysqld
sudo systemctl enable mysqld

# 检查MySQL状态
sudo systemctl status mysqld
```

### 2.3 macOS

```bash
# 使用Homebrew安装
brew install mysql

# 启动MySQL服务
brew services start mysql

# 检查MySQL状态
brew services list
```

### 2.4 Windows

1. 下载MySQL安装包：https://dev.mysql.com/downloads/mysql/
2. 运行安装程序，按照提示完成安装
3. 启动MySQL服务

### 2.5 配置MySQL

```bash
# 登录MySQL
sudo mysql -u root -p

# 创建数据库
CREATE DATABASE points_service DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户（可选）
CREATE USER 'points_user'@'localhost' IDENTIFIED BY 'your_password';

# 授权
GRANT ALL PRIVILEGES ON points_service.* TO 'points_user'@'localhost';

# 刷新权限
FLUSH PRIVILEGES;

# 退出
EXIT;
```

## 三、安装Redis

### 3.1 Ubuntu/Debian

```bash
# 更新软件包列表
sudo apt update

# 安装Redis
sudo apt install -y redis-server

# 启动Redis服务
sudo systemctl start redis
sudo systemctl enable redis

# 检查Redis状态
sudo systemctl status redis

# 测试Redis连接
redis-cli ping
# 应该返回：PONG
```

### 3.2 CentOS/RHEL

```bash
# 安装EPEL仓库
sudo yum install -y epel-release

# 安装Redis
sudo yum install -y redis

# 启动Redis服务
sudo systemctl start redis
sudo systemctl enable redis

# 检查Redis状态
sudo systemctl status redis

# 测试Redis连接
redis-cli ping
```

### 3.3 macOS

```bash
# 使用Homebrew安装
brew install redis

# 启动Redis服务
brew services start redis

# 检查Redis状态
brew services list

# 测试Redis连接
redis-cli ping
```

### 3.4 Windows

1. 下载Redis for Windows：https://github.com/microsoftarchive/redis/releases
2. 解压到指定目录
3. 运行 `redis-server.exe` 启动Redis服务
4. 运行 `redis-cli.exe` 测试连接

### 3.5 配置Redis（可选）

```bash
# 编辑Redis配置文件
sudo vim /etc/redis/redis.conf

# 设置密码（可选）
# requirepass your_redis_password

# 重启Redis服务
sudo systemctl restart redis
```

## 四、安装Python依赖

### 4.1 创建虚拟环境

```bash
# 进入积分服务目录
cd points_service

# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
# Linux/macOS:
source venv/bin/activate
# Windows:
# venv\Scripts\activate
```

### 4.2 安装依赖包

```bash
# 升级pip
pip install --upgrade pip

# 安装依赖
pip install -r requirements.txt
```

### 4.3 依赖包列表

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
pymysql==1.1.0
cryptography==41.0.7
redis==5.0.1
pyyaml==6.0.1
python-dotenv==1.0.0
pydantic==2.5.0
pydantic-settings==2.1.0
alipay-sdk-python==3.7.868
wechatpy==1.8.18
prometheus-client==0.19.0
pytest==9.1.1
pytest-asyncio==1.4.0
```

## 五、配置积分服务

### 5.1 修改配置文件

编辑 `config.yaml` 文件：

```yaml
# 数据库配置
database:
  host: localhost
  port: 3306
  user: root
  password: your_mysql_password
  database: points_service
  pool_size: 10
  max_overflow: 20
  pool_timeout: 30
  pool_recycle: 3600

# Redis配置
redis:
  host: localhost
  port: 6379
  db: 0
  password: null  # 如果设置了密码，填写密码
  pool_size: 10
  socket_timeout: 5
  socket_connect_timeout: 5

# 充值比例配置
points:
  recharge_ratio: 1000  # 1人民币 = 1000积分
  initial_balance: 100  # 初始积分

# 缓存配置
cache:
  balance_ttl: 300  # 积分余额缓存过期时间（秒）

# 日志配置
logging:
  level: INFO
  format: "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
  file: logs/points_service.log
  max_bytes: 10485760  # 10MB
  backup_count: 5

# 支付配置
payment:
  alipay:
    app_id: your_alipay_app_id
    private_key: your_alipay_private_key
    public_key: your_alipay_public_key
    notify_url: http://your-domain.com/recharge-orders/callback/alipay
  wechat:
    app_id: your_wechat_app_id
    mch_id: your_wechat_mch_id
    api_key: your_wechat_api_key
    notify_url: http://your-domain.com/recharge-orders/callback/wechat

# 监控配置
monitoring:
  enabled: true
  prometheus_port: 9090
```

### 5.2 创建环境变量文件（可选）

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑.env文件，根据实际情况修改配置
vim .env
```

## 六、初始化数据库

### 6.1 执行数据库初始化脚本

```bash
# 使用MySQL命令行工具
mysql -u root -p points_service < init_db.sql

# 或者使用MySQL客户端
mysql -u root -p
```

在MySQL客户端中执行：

```sql
USE points_service;
SOURCE init_db.sql;
```

### 6.2 验证数据库表

```bash
# 登录MySQL
mysql -u root -p

# 使用数据库
USE points_service;

# 查看表
SHOW TABLES;

# 查看表结构
DESC points_account;
DESC recharge_order;
DESC points_transaction;

# 退出
EXIT;
```

## 七、启动积分服务

### 7.1 开发环境启动

```bash
# 确保虚拟环境已激活
source venv/bin/activate

# 启动服务
python main.py
```

服务将在 `http://localhost:8000` 启动。

### 7.2 生产环境启动（使用gunicorn）

```bash
# 安装gunicorn
pip install gunicorn

# 启动服务（4个worker进程）
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### 7.3 使用systemd管理服务（Linux）

创建服务文件 `/etc/systemd/system/points-service.service`：

```ini
[Unit]
Description=Points Service
After=network.target mysql.service redis.service

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/points_service
Environment="PATH=/path/to/points_service/venv/bin"
ExecStart=/path/to/points_service/venv/bin/gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
# 重新加载systemd配置
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start points-service

# 设置开机自启
sudo systemctl enable points-service

# 查看服务状态
sudo systemctl status points-service

# 查看服务日志
sudo journalctl -u points-service -f

# 停止服务
sudo systemctl stop points-service

# 重启服务
sudo systemctl restart points-service
```

### 7.4 使用supervisor管理服务（Linux/macOS）

安装supervisor：

```bash
# Ubuntu/Debian
sudo apt install -y supervisor

# CentOS/RHEL
sudo yum install -y supervisor

# macOS
brew install supervisor
```

创建配置文件 `/etc/supervisor/conf.d/points-service.conf`：

```ini
[program:points-service]
command=/path/to/points_service/venv/bin/gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
directory=/path/to/points_service
user=your-username
autostart=true
autorestart=true
startretries=3
stderr_logfile=/var/log/points-service.err.log
stdout_logfile=/var/log/points-service.out.log
```

启动服务：

```bash
# 重新加载配置
sudo supervisorctl reread
sudo supervisorctl update

# 启动服务
sudo supervisorctl start points-service

# 查看服务状态
sudo supervisorctl status

# 查看服务日志
sudo supervisorctl tail points-service

# 停止服务
sudo supervisorctl stop points-service

# 重启服务
sudo supervisorctl restart points-service
```

## 八、验证服务

### 8.1 健康检查

```bash
# 检查服务是否正常运行
curl http://localhost:8000/health

# 应该返回：
# {"status":"healthy"}
```

### 8.2 访问API文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 8.3 测试API接口

```bash
# 1. 初始化积分账户
curl -X POST http://localhost:8000/points-accounts/init \
  -H "Content-Type: application/json" \
  -d '{"userId": "test_user"}'

# 应该返回：
# {"userId":"test_user","balance":100.0,"status":"active","createTime":"2024-01-01T00:00:00","updateTime":"2024-01-01T00:00:00"}

# 2. 验证积分
curl -X POST http://localhost:8000/points-accounts/validate \
  -H "Content-Type: application/json" \
  -d '{"userId": "test_user"}'

# 应该返回：
# {"allowed":true,"balance":100.0}

# 3. 查询积分余额
curl http://localhost:8000/points-accounts/test_user

# 应该返回：
# {"userId":"test_user","balance":100.0,"status":"active","createTime":"","updateTime":""}

# 4. 扣减积分
curl -X POST http://localhost:8000/points-accounts/deduct \
  -H "Content-Type: application/json" \
  -d '{"userId": "test_user", "duration": 10}'

# 应该返回：
# {"userId":"test_user","deductedPoints":10,"balance":90.0}

# 5. 创建充值订单
curl -X POST http://localhost:8000/recharge-orders \
  -H "Content-Type: application/json" \
  -d '{"userId": "test_user", "amount": 10.0, "paymentMethod": "alipay"}'

# 应该返回：
# {"orderId":"RCH...","amount":10.0,"points":10000.0,"paymentMethod":"alipay","paymentUrl":"...","status":"pending","createTime":"2024-01-01T00:00:00"}
```

### 8.4 查看监控指标

```bash
# 访问Prometheus监控指标
curl http://localhost:9090/metrics

# 应该返回Prometheus格式的监控指标
```

## 九、查看日志

### 9.1 应用日志

```bash
# 查看日志文件
tail -f logs/points_service.log

# 查看最后100行日志
tail -n 100 logs/points_service.log

# 搜索错误日志
grep ERROR logs/points_service.log
```

### 9.2 systemd日志

```bash
# 查看服务日志
sudo journalctl -u points-service -f

# 查看最近100行日志
sudo journalctl -u points-service -n 100
```

### 9.3 supervisor日志

```bash
# 查看服务日志
sudo supervisorctl tail points-service

# 查看错误日志
sudo tail -f /var/log/points-service.err.log

# 查看输出日志
sudo tail -f /var/log/points-service.out.log
```

## 十、常见问题

### 10.1 MySQL连接失败

**问题**：`Can't connect to MySQL server on 'localhost'`

**解决方案**：
```bash
# 检查MySQL服务是否启动
sudo systemctl status mysql

# 启动MySQL服务
sudo systemctl start mysql

# 检查MySQL端口是否监听
sudo netstat -tlnp | grep 3306

# 检查MySQL用户权限
mysql -u root -p
```

### 10.2 Redis连接失败

**问题**：`Error connecting to Redis`

**解决方案**：
```bash
# 检查Redis服务是否启动
sudo systemctl status redis

# 启动Redis服务
sudo systemctl start redis

# 测试Redis连接
redis-cli ping

# 检查Redis端口是否监听
sudo netstat -tlnp | grep 6379
```

### 10.3 端口被占用

**问题**：`Address already in use`

**解决方案**：
```bash
# 查看端口占用情况
sudo lsof -i :8000
sudo lsof -i :9090

# 杀死占用端口的进程
sudo kill -9 <PID>

# 或者修改配置文件中的端口号
vim config.yaml
```

### 10.4 依赖包安装失败

**问题**：`pip install` 失败

**解决方案**：
```bash
# 升级pip
pip install --upgrade pip

# 使用国内镜像源
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

# 或者使用阿里云镜像源
pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/
```

### 10.5 数据库表不存在

**问题**：`Table 'points_service.points_account' doesn't exist`

**解决方案**：
```bash
# 重新执行数据库初始化脚本
mysql -u root -p points_service < init_db.sql

# 或者手动创建表
mysql -u root -p points_service
```

### 10.6 权限问题

**问题**：`Permission denied`

**解决方案**：
```bash
# 修改文件权限
chmod +x main.py

# 修改目录权限
chmod -R 755 /path/to/points_service

# 修改日志目录权限
chmod -R 777 logs
```

## 十一、性能优化

### 11.1 数据库优化

```sql
-- 为积分账户表的user_id字段创建唯一索引
CREATE UNIQUE INDEX uk_user_id ON points_account(user_id);

-- 为充值订单表的order_id字段创建唯一索引
CREATE UNIQUE INDEX uk_order_id ON recharge_order(order_id);

-- 为积分变动记录表的user_id字段创建索引
CREATE INDEX idx_user_id ON points_transaction(user_id);

-- 优化MySQL配置
vim /etc/mysql/mysql.conf.d/mysqld.cnf

# 添加以下配置
[mysqld]
max_connections = 200
innodb_buffer_pool_size = 1G
query_cache_size = 64M
```

### 11.2 Redis优化

```bash
# 编辑Redis配置文件
sudo vim /etc/redis/redis.conf

# 优化配置
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000

# 重启Redis服务
sudo systemctl restart redis
```

### 11.3 应用优化

```bash
# 增加gunicorn worker数量
gunicorn main:app -w 8 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000

# 使用gevent worker
pip install gevent
gunicorn main:app -w 4 -k gevent -b 0.0.0.0:8000

# 配置Nginx反向代理
sudo vim /etc/nginx/conf.d/points-service.conf
```

Nginx配置：

```nginx
upstream points_service {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://points_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

重启Nginx：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 十二、备份与恢复

### 12.1 数据库备份

```bash
# 备份数据库
mysqldump -u root -p points_service > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复数据库
mysql -u root -p points_service < backup_20240101_120000.sql
```

### 12.2 Redis备份

```bash
# 手动保存Redis数据
redis-cli BGSAVE

# 查看Redis备份文件
ls -lh /var/lib/redis/dump.rdb

# 恢复Redis数据
redis-cli --rdb /path/to/dump.rdb
```

### 12.3 自动备份脚本

创建备份脚本 `/usr/local/bin/backup_points_service.sh`：

```bash
#!/bin/bash

# 备份目录
BACKUP_DIR="/backup/points_service"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u root -pyour_password points_service > $BACKUP_DIR/points_service_$DATE.sql

# 备份Redis
redis-cli BGSAVE
cp /var/lib/redis/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.rdb" -mtime +7 -delete

echo "Backup completed: $DATE"
```

设置定时任务：

```bash
# 编辑crontab
crontab -e

# 添加定时任务（每天凌晨2点备份）
0 2 * * * /usr/local/bin/backup_points_service.sh
```

## 十三、总结

通过以上步骤，您可以成功使用源码启动积分系统：

1. ✅ 安装MySQL和Redis
2. ✅ 安装Python依赖
3. ✅ 配置积分服务
4. ✅ 初始化数据库
5. ✅ 启动积分服务
6. ✅ 验证服务正常运行
7. ✅ 配置服务管理（systemd/supervisor）
8. ✅ 配置监控和日志
9. ✅ 性能优化
10. ✅ 备份与恢复

如遇问题，请参考"常见问题"章节或查看日志文件进行排查。

🎯

# 积分服务部署文档

## 环境要求

- Python 3.8+
- MySQL 8.0+
- Redis 5.0+
- 4GB+ 内存
- 20GB+ 磁盘空间

## 部署步骤

### 1. 克隆代码

```bash
git clone <repository-url>
cd points_service
```

### 2. 创建虚拟环境

```bash
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows
```

### 3. 安装依赖

```bash
pip install -r requirements.txt
```

### 4. 配置文件

#### 4.1 修改 config.yaml

```yaml
# 数据库配置
database:
  host: your-mysql-host
  port: 3306
  user: your-mysql-user
  password: your-mysql-password
  database: points_service

# Redis配置
redis:
  host: your-redis-host
  port: 6379
  db: 0
  password: your-redis-password

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

#### 4.2 创建 .env 文件

```bash
cp .env.example .env
```

根据实际情况修改 .env 文件中的配置。

### 5. 初始化数据库

```bash
mysql -h your-mysql-host -u your-mysql-user -p < init_db.sql
```

### 6. 启动服务

#### 6.1 开发环境启动

```bash
python main.py
```

#### 6.2 生产环境启动（使用gunicorn）

```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

#### 6.3 使用systemd管理服务

创建 `/etc/systemd/system/points-service.service` 文件：

```ini
[Unit]
Description=Points Service
After=network.target mysql.service redis.service

[Service]
Type=simple
User=your-user
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
sudo systemctl daemon-reload
sudo systemctl start points-service
sudo systemctl enable points-service
```

### 7. 配置Nginx反向代理

创建 `/etc/nginx/conf.d/points-service.conf` 文件：

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

### 8. 配置Prometheus监控

在Prometheus配置文件中添加：

```yaml
scrape_configs:
  - job_name: 'points_service'
    static_configs:
      - targets: ['localhost:9090']
```

重启Prometheus：

```bash
sudo systemctl restart prometheus
```

### 9. 配置Grafana仪表板

导入积分服务的Grafana仪表板模板，监控以下指标：

- 积分扣减QPS和响应时间
- 积分充值QPS和响应时间
- 积分余额查询QPS和响应时间
- 积分账户初始化QPS
- 错误率

## Docker部署

### 1. 构建镜像

```bash
docker build -t points-service:latest .
```

### 2. 运行容器

```bash
docker run -d \
  --name points-service \
  -p 8000:8000 \
  -p 9090:9090 \
  -v /path/to/config.yaml:/app/config.yaml \
  -v /path/to/logs:/app/logs \
  points-service:latest
```

### 3. 使用Docker Compose

```bash
docker-compose up -d
```

## 健康检查

```bash
curl http://localhost:8000/health
```

返回：

```json
{
  "status": "healthy"
}
```

## 日志查看

```bash
tail -f logs/points_service.log
```

## 性能优化

### 1. 数据库优化

- 为积分账户表的user_id字段创建唯一索引
- 为充值订单表的order_id字段创建唯一索引
- 为积分变动记录表的user_id字段创建索引
- 定期清理过期的积分变动记录

### 2. Redis优化

- 设置合理的缓存过期时间
- 使用Redis集群提高可用性
- 监控Redis内存使用情况

### 3. 应用优化

- 增加gunicorn worker数量
- 使用连接池管理数据库连接
- 使用连接池管理Redis连接

## 故障排查

### 1. 服务启动失败

检查日志文件 `logs/points_service.log`，查看错误信息。

### 2. 数据库连接失败

检查数据库配置是否正确，数据库服务是否正常运行。

### 3. Redis连接失败

检查Redis配置是否正确，Redis服务是否正常运行。

### 4. 支付回调失败

检查签名验证是否通过，订单金额是否匹配。

## 备份与恢复

### 1. 数据库备份

```bash
mysqldump -h your-mysql-host -u your-mysql-user -p points_service > backup.sql
```

### 2. 数据库恢复

```bash
mysql -h your-mysql-host -u your-mysql-user -p points_service < backup.sql
```

### 3. Redis备份

```bash
redis-cli BGSAVE
```

### 4. Redis恢复

```bash
redis-cli --rdb /path/to/dump.rdb
```

## 安全建议

1. 使用HTTPS加密通信
2. 定期更新依赖包
3. 限制API访问频率
4. 使用防火墙限制访问
5. 定期备份数据
6. 监控异常行为

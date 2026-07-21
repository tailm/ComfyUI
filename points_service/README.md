# 积分服务

积分管理系统，提供积分账户管理、任务运行积分扣减、积分充值和积分余额查询功能。

## 功能特性

- ✅ 积分账户初始化：新用户注册时自动创建积分账户，初始积分为100
- ✅ 任务运行积分扣减：用户运行任务时根据运行时长扣减积分（1秒=1积分）
- ✅ 透支控制：用户积分可以为负数，但最多只能透支一次，已透支的用户不能再运行任务
- ✅ 积分充值：支持支付宝和微信支付，充值比例为1人民币=1000积分
- ✅ 积分余额查询：查询用户当前积分余额
- ✅ 缓存优化：使用Redis缓存积分余额，提高查询性能
- ✅ 审计日志：记录所有积分变动，支持审计和追溯
- ✅ 监控告警：接入Prometheus监控，支持关键指标监控

## 技术栈

- **编程语言**：Python 3.8+
- **Web框架**：FastAPI
- **数据库**：MySQL 8.0+
- **ORM**：SQLAlchemy
- **缓存**：Redis
- **支付SDK**：支付宝SDK、微信SDK
- **监控**：Prometheus

## 项目结构

```
points_service/
├── config/               # 配置模块
│   ├── __init__.py
│   └── settings.py       # 配置管理
├── controllers/          # 接口层
│   ├── __init__.py
│   ├── points_account_controller.py
│   └── recharge_order_controller.py
├── services/             # 业务逻辑层
│   ├── __init__.py
│   ├── points_account_service.py
│   ├── recharge_order_service.py
│   ├── payment_callback_service.py
│   └── cache_service.py
├── daos/                 # 数据访问层
│   ├── __init__.py
│   ├── points_account_dao.py
│   ├── recharge_order_dao.py
│   └── points_transaction_dao.py
├── models/               # 数据模型
│   ├── __init__.py
│   ├── points_account.py
│   ├── recharge_order.py
│   └── points_transaction.py
├── utils/                # 工具模块
│   ├── __init__.py
│   ├── logger.py
│   ├── database.py
│   ├── redis_client.py
│   ├── metrics.py
│   └── exceptions.py
├── tests/                # 测试模块
├── config.yaml           # 配置文件
├── init_db.sql           # 数据库初始化脚本
├── requirements.txt      # 依赖包列表
├── main.py               # 应用入口
└── README.md             # 项目文档
```

## 快速开始

### 1. 环境要求

- Python 3.8+
- MySQL 8.0+
- Redis 5.0+

### 2. 安装依赖

```bash
cd points_service
pip install -r requirements.txt
```

### 3. 配置文件

复制 `.env.example` 为 `.env`，并根据实际情况修改配置：

```bash
cp .env.example .env
```

修改 `config.yaml` 文件，配置数据库、Redis、支付等信息。

### 4. 初始化数据库

```bash
mysql -u root -p < init_db.sql
```

### 5. 启动服务

```bash
python main.py
```

服务将在 `http://localhost:8000` 启动。

### 6. 访问API文档

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API接口

### 积分账户接口

#### 1. 初始化积分账户

```http
POST /points-accounts/init
Content-Type: application/json

{
  "userId": "user123"
}
```

#### 2. 验证积分是否足够运行任务

```http
POST /points-accounts/validate
Content-Type: application/json

{
  "userId": "user123"
}
```

#### 3. 扣减积分

```http
POST /points-accounts/deduct
Content-Type: application/json

{
  "userId": "user123",
  "duration": 60
}
```

#### 4. 查询积分余额

```http
GET /points-accounts/{userId}
```

### 充值订单接口

#### 1. 创建充值订单

```http
POST /recharge-orders
Content-Type: application/json

{
  "userId": "user123",
  "amount": 10.00,
  "paymentMethod": "alipay"
}
```

#### 2. 支付回调

```http
POST /recharge-orders/callback
Content-Type: application/json

{
  "orderId": "RCH1234567890ABCDEF",
  "paymentAmount": 10.00,
  "paymentMethod": "alipay",
  "signature": "signature"
}
```

## 数据库表结构

### 积分账户表（points_account）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT | 主键ID |
| user_id | VARCHAR(64) | 用户ID，唯一索引 |
| balance | DECIMAL(10,2) | 积分余额，初始100 |
| status | VARCHAR(20) | 账户状态：active/frozen |
| version | INT | 乐观锁版本号 |
| create_time | DATETIME | 创建时间 |
| update_time | DATETIME | 更新时间 |

### 充值订单表（recharge_order）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT | 主键ID |
| order_id | VARCHAR(64) | 订单号，唯一索引 |
| user_id | VARCHAR(64) | 用户ID |
| amount | DECIMAL(10,2) | 充值金额 |
| points | DECIMAL(10,2) | 充值积分 |
| payment_method | VARCHAR(20) | 支付方式：alipay/wechat |
| payment_url | VARCHAR(512) | 支付链接 |
| status | VARCHAR(20) | 订单状态：pending/paid/cancelled/refunded |
| payment_time | DATETIME | 支付时间 |
| create_time | DATETIME | 创建时间 |
| update_time | DATETIME | 更新时间 |

### 积分变动记录表（points_transaction）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT | 主键ID |
| user_id | VARCHAR(64) | 用户ID |
| transaction_type | VARCHAR(20) | 变动类型：init/deduct/recharge |
| amount | DECIMAL(10,2) | 变动金额 |
| balance_before | DECIMAL(10,2) | 变动前余额 |
| balance_after | DECIMAL(10,2) | 变动后余额 |
| reference_id | VARCHAR(64) | 关联ID |
| remark | VARCHAR(255) | 备注 |
| create_time | DATETIME | 创建时间 |

## 监控指标

服务启动后，Prometheus监控指标将在 `http://localhost:9090` 暴露。

### 可用指标

- `points_deduct_total`: 积分扣减总数（按状态分组）
- `points_deduct_duration_seconds`: 积分扣减耗时
- `points_recharge_total`: 积分充值总数（按状态分组）
- `points_recharge_duration_seconds`: 积分充值耗时
- `points_query_balance_total`: 积分余额查询总数（按状态分组）
- `points_query_balance_duration_seconds`: 积分余额查询耗时
- `points_init_account_total`: 积分账户初始化总数（按状态分组）

## 部署

### Docker部署

```bash
# 构建镜像
docker build -t points-service .

# 运行容器
docker run -d -p 8000:8000 -p 9090:9090 points-service
```

### Docker Compose部署

```bash
docker-compose up -d
```

## 测试

```bash
# 运行所有测试
pytest tests/

# 运行单元测试
pytest tests/unit/

# 运行集成测试
pytest tests/integration/

# 运行并发测试
pytest tests/concurrent/
```

## 常见问题

### 1. 积分扣减失败

检查用户积分余额是否足够，积分余额<0时不允许扣减。

### 2. 支付回调处理失败

检查签名验证是否通过，订单金额是否匹配。

### 3. 缓存未生效

检查Redis连接是否正常，缓存键是否正确。

## 许可证

MIT License

# **1. 实现模型**

## **1.1 上下文视图**

```plantuml
@startuml
actor "普通用户" as User
component "积分服务" as Points
component "任务调度服务" as Task
component "支付服务" as Payment
component "用户服务" as UserService
database "MySQL" as DB

User -> Points: 查询积分余额
Points --> DB: 查询积分账户
Points --> User: 返回积分余额

User -> Task: 提交运行任务
Task -> Points: 验证积分是否足够
Points --> DB: 查询积分账户
Points --> Task: 返回验证结果
Task --> User: 返回任务提交结果

Task -> Points: 通知任务完成（运行时长）
Points -> Points: 计算扣减积分
Points --> DB: 更新积分余额（扣减）
Points --> Task: 返回扣减结果

User -> Points: 发起充值请求
Points -> Points: 校验充值金额
Points -> Payment: 创建充值订单
Payment --> Points: 返回订单号和支付链接
Points --> User: 返回支付链接

Payment -> Points: 支付成功回调（订单号，支付金额）
Points -> Points: 验证回调签名
Points --> DB: 查询订单信息
Points --> Points: 校验支付金额
Points -> Points: 计算充值积分
Points --> DB: 更新积分余额（增加）
Points --> DB: 更新订单状态为已支付
Points --> Payment: 返回处理成功

UserService -> Points: 新用户注册通知（用户ID）
Points --> DB: 查询积分账户
alt 账户不存在
    Points --> DB: 创建积分账户（初始100积分）
    Points --> UserService: 返回初始化成功
else 账户已存在
    Points --> UserService: 返回初始化成功（幂等）
end

@enduml
```

## **1.2 服务/组件总体架构**

积分服务采用分层架构设计，包含以下核心组件：

### **1.2.1 接口层**
- **积分账户初始化接口**：接收用户服务的新用户注册通知，创建积分账户
- **积分验证接口**：接收任务调度服务的积分验证请求，返回是否允许运行任务
- **积分扣减接口**：接收任务调度服务的积分扣减请求，根据运行时长扣减积分
- **充值订单创建接口**：接收用户的充值请求，创建充值订单并返回支付链接
- **支付回调接口**：接收支付服务的支付成功回调，处理积分到账
- **积分余额查询接口**：接收用户的积分查询请求，返回积分余额

### **1.2.2 业务逻辑层**
- **积分账户管理**：负责积分账户的创建、查询、更新
- **积分扣减管理**：负责积分扣减逻辑、透支控制、原子性保证
- **充值订单管理**：负责充值订单的创建、状态更新、幂等性处理
- **支付回调处理**：负责支付回调的签名验证、金额校验、积分到账
- **审计日志记录**：负责记录积分变动的审计日志

### **1.2.3 数据访问层**
- **积分账户DAO**：负责积分账户表的CRUD操作
- **充值订单DAO**：负责充值订单表的CRUD操作
- **积分变动记录DAO**：负责积分变动记录表的插入操作

### **1.2.4 外部依赖**
- **MySQL数据库**：存储积分账户、充值订单、积分变动记录
- **支付服务**：提供充值订单创建和支付回调通知
- **用户服务**：提供新用户注册通知
- **任务调度服务**：提供积分验证和扣减请求

## **1.3 实现设计文档**

### **1.3.1 积分账户初始化实现设计**

**实现要点**：
1. 接收用户服务的新用户注册通知，包含用户ID
2. 查询积分账户表，检查该用户是否已存在积分账户
3. 如果账户不存在，创建积分账户，设置初始积分为100
4. 如果账户已存在，直接返回成功（幂等处理）
5. 记录审计日志，包含用户ID、操作类型、初始积分

**技术实现**：
- 使用数据库唯一索引保证用户ID的唯一性
- 使用INSERT IGNORE或ON DUPLICATE KEY UPDATE实现幂等性
- 使用事务保证账户创建和日志记录的原子性

### **1.3.2 任务运行积分扣减实现设计**

**实现要点**：
1. 接收任务调度服务的积分验证请求，包含用户ID
2. 查询积分账户表，获取用户积分余额
3. 判断积分余额是否>=0，如果是，返回允许运行
4. 如果积分余额<0，返回拒绝运行
5. 接收任务调度服务的积分扣减请求，包含用户ID和运行时长
6. 计算扣减积分=运行时长
7. 使用数据库事务，更新积分余额（扣减积分），记录审计日志
8. 返回扣减成功

**技术实现**：
- 使用SELECT FOR UPDATE锁定积分账户行，防止并发问题
- 使用事务保证积分扣减和日志记录的原子性
- 使用乐观锁或悲观锁防止积分扣减的并发冲突
- 记录审计日志，包含用户ID、操作类型、扣减积分、扣减后余额

### **1.3.3 积分充值实现设计**

**实现要点**：
1. 接收用户的充值请求，包含充值金额和支付方式
2. 校验充值金额是否>0，如果不是，返回参数错误
3. 计算充值积分=充值金额*1000
4. 调用支付服务，创建充值订单，获取订单号和支付链接
5. 保存充值订单到数据库，状态为待支付
6. 返回支付链接给用户
7. 接收支付服务的支付成功回调，包含订单号和支付金额
8. 验证回调签名，防止伪造回调
9. 查询充值订单，校验订单状态和支付金额
10. 如果订单已支付，直接返回成功（幂等处理）
11. 使用数据库事务，更新积分余额（增加充值积分），更新订单状态为已支付，记录审计日志
12. 返回处理成功

**技术实现**：
- 使用配置文件存储充值比例，支持动态调整
- 使用支付服务的SDK验证回调签名
- 使用订单状态和支付金额双重校验，防止金额篡改
- 使用事务保证积分增加、订单更新、日志记录的原子性
- 记录审计日志，包含用户ID、操作类型、充值积分、充值后余额

### **1.3.4 积分余额查询实现设计**

**实现要点**：
1. 接收用户的积分查询请求，包含用户ID
2. 查询积分账户表，获取用户积分余额
3. 如果账户不存在，返回积分余额为0
4. 返回积分余额

**技术实现**：
- 使用缓存（Redis）缓存积分余额，减少数据库查询
- 设置缓存过期时间，保证数据一致性
- 使用缓存穿透保护，防止缓存击穿

# **2. 接口设计**

## **2.1 总体设计**

积分服务提供RESTful API接口，使用JSON格式进行数据交换。所有接口都需要进行身份验证，防止未授权访问。

接口命名规范：
- 使用名词复数形式，如 /points-accounts
- 使用HTTP动词表示操作，如 GET、POST、PUT、DELETE
- 使用路径参数表示资源ID，如 /points-accounts/{userId}
- 使用查询参数表示过滤条件，如 ?status=active

## **2.2 接口清单**

### **2.2.1 积分账户初始化接口**

**接口描述**：接收用户服务的新用户注册通知，创建积分账户

**请求方式**：POST

**请求路径**：/points-accounts/init

**请求头**：
- Content-Type: application/json
- Authorization: Bearer {token}

**请求参数**：
```json
{
  "userId": "string"
}
```

**响应参数**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": "string",
    "balance": 100,
    "status": "active",
    "createTime": "2024-01-01T00:00:00Z",
    "updateTime": "2024-01-01T00:00:00Z"
  }
}
```

**错误码**：
- 400: 参数错误
- 500: 服务器内部错误

### **2.2.2 积分验证接口**

**接口描述**：接收任务调度服务的积分验证请求，返回是否允许运行任务

**请求方式**：POST

**请求路径**：/points-accounts/validate

**请求头**：
- Content-Type: application/json
- Authorization: Bearer {token}

**请求参数**：
```json
{
  "userId": "string"
}
```

**响应参数**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "allowed": true,
    "balance": 100
  }
}
```

**错误码**：
- 400: 参数错误
- 500: 服务器内部错误

### **2.2.3 积分扣减接口**

**接口描述**：接收任务调度服务的积分扣减请求，根据运行时长扣减积分

**请求方式**：POST

**请求路径**：/points-accounts/deduct

**请求头**：
- Content-Type: application/json
- Authorization: Bearer {token}

**请求参数**：
```json
{
  "userId": "string",
  "duration": 60
}
```

**响应参数**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": "string",
    "deductedPoints": 60,
    "balance": 40
  }
}
```

**错误码**：
- 400: 参数错误
- 403: 积分不足
- 500: 服务器内部错误

### **2.2.4 充值订单创建接口**

**接口描述**：接收用户的充值请求，创建充值订单并返回支付链接

**请求方式**：POST

**请求路径**：/recharge-orders

**请求头**：
- Content-Type: application/json
- Authorization: Bearer {token}

**请求参数**：
```json
{
  "userId": "string",
  "amount": 10.00,
  "paymentMethod": "alipay"
}
```

**响应参数**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "orderId": "string",
    "amount": 10.00,
    "points": 10000,
    "paymentMethod": "alipay",
    "paymentUrl": "string",
    "status": "pending",
    "createTime": "2024-01-01T00:00:00Z"
  }
}
```

**错误码**：
- 400: 参数错误
- 500: 服务器内部错误

### **2.2.5 支付回调接口**

**接口描述**：接收支付服务的支付成功回调，处理积分到账

**请求方式**：POST

**请求路径**：/recharge-orders/callback

**请求头**：
- Content-Type: application/json

**请求参数**：
```json
{
  "orderId": "string",
  "paymentAmount": 10.00,
  "paymentMethod": "alipay",
  "signature": "string"
}
```

**响应参数**：
```json
{
  "code": 200,
  "message": "success"
}
```

**错误码**：
- 400: 参数错误
- 403: 签名验证失败
- 404: 订单不存在
- 409: 订单状态异常
- 500: 服务器内部错误

### **2.2.6 积分余额查询接口**

**接口描述**：接收用户的积分查询请求，返回积分余额

**请求方式**：GET

**请求路径**：/points-accounts/{userId}

**请求头**：
- Authorization: Bearer {token}

**响应参数**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": "string",
    "balance": 100,
    "status": "active",
    "createTime": "2024-01-01T00:00:00Z",
    "updateTime": "2024-01-01T00:00:00Z"
  }
}
```

**错误码**：
- 404: 用户不存在
- 500: 服务器内部错误

# **4. 数据模型**

## **4.1 设计目标**

数据模型设计遵循以下原则：
1. **规范化**：遵循数据库设计范式，减少数据冗余
2. **性能优化**：合理使用索引，提高查询性能
3. **可扩展性**：预留扩展字段，支持未来需求变更
4. **数据一致性**：使用事务和锁机制，保证数据一致性
5. **审计可追溯**：记录所有积分变动，支持审计和追溯

## **4.2 模型实现**

### **4.2.1 积分账户表（points_account）**

**表描述**：存储用户的积分账户信息

| 字段名 | 类型 | 长度 | 是否必填 | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | BIGINT | - | 是 | - | 主键ID |
| user_id | VARCHAR | 64 | 是 | - | 用户ID，唯一索引 |
| balance | DECIMAL | (10, 2) | 是 | 100.00 | 积分余额，可以为负数 |
| status | VARCHAR | 20 | 是 | active | 账户状态：active-正常，frozen-冻结 |
| version | INT | - | 是 | 0 | 乐观锁版本号 |
| create_time | DATETIME | - | 是 | CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | - | 是 | CURRENT_TIMESTAMP | 更新时间 |

**索引设计**：
- PRIMARY KEY: id
- UNIQUE KEY: uk_user_id (user_id)
- KEY: idx_status (status)

### **4.2.2 充值订单表（recharge_order）**

**表描述**：存储用户的充值订单信息

| 字段名 | 类型 | 长度 | 是否必填 | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | BIGINT | - | 是 | - | 主键ID |
| order_id | VARCHAR | 64 | 是 | - | 订单号，唯一索引 |
| user_id | VARCHAR | 64 | 是 | - | 用户ID |
| amount | DECIMAL | (10, 2) | 是 | - | 充值金额，单位：人民币 |
| points | DECIMAL | (10, 2) | 是 | - | 充值积分，=amount*1000 |
| payment_method | VARCHAR | 20 | 是 | - | 支付方式：alipay-支付宝，wechat-微信 |
| payment_url | VARCHAR | 512 | 否 | - | 支付链接 |
| status | VARCHAR | 20 | 是 | pending | 订单状态：pending-待支付，paid-已支付，cancelled-已取消，refunded-已退款 |
| payment_time | DATETIME | - | 否 | - | 支付时间 |
| create_time | DATETIME | - | 是 | CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | - | 是 | CURRENT_TIMESTAMP | 更新时间 |

**索引设计**：
- PRIMARY KEY: id
- UNIQUE KEY: uk_order_id (order_id)
- KEY: idx_user_id (user_id)
- KEY: idx_status (status)
- KEY: idx_create_time (create_time)

### **4.2.3 积分变动记录表（points_transaction）**

**表描述**：存储用户的积分变动记录，用于审计和追溯

| 字段名 | 类型 | 长度 | 是否必填 | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | BIGINT | - | 是 | - | 主键ID |
| user_id | VARCHAR | 64 | 是 | - | 用户ID |
| transaction_type | VARCHAR | 20 | 是 | - | 变动类型：init-初始化，deduct-扣减，recharge-充值 |
| amount | DECIMAL | (10, 2) | 是 | - | 变动金额，正数表示增加，负数表示扣减 |
| balance_before | DECIMAL | (10, 2) | 是 | - | 变动前余额 |
| balance_after | DECIMAL | (10, 2) | 是 | - | 变动后余额 |
| reference_id | VARCHAR | 64 | 否 | - | 关联ID，如订单号、任务ID |
| remark | VARCHAR | 255 | 否 | - | 备注 |
| create_time | DATETIME | - | 是 | CURRENT_TIMESTAMP | 创建时间 |

**索引设计**：
- PRIMARY KEY: id
- KEY: idx_user_id (user_id)
- KEY: idx_transaction_type (transaction_type)
- KEY: idx_reference_id (reference_id)
- KEY: idx_create_time (create_time)

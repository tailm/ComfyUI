# 积分系统编码任务规划

## 任务概述
本任务计划实现一个完整的积分系统，包括积分账户管理、任务运行积分扣减、积分充值和积分余额查询功能。系统采用分层架构设计，包含接口层、业务逻辑层和数据访问层。

## 技术栈
- 编程语言：Python 3.8+
- Web框架：FastAPI
- 数据库：MySQL 8.0+
- ORM：SQLAlchemy
- 缓存：Redis
- 支付SDK：支付宝SDK、微信SDK

## 任务列表

### 阶段一：项目初始化和数据库设计

#### 任务1.1：创建项目结构
- 创建积分服务项目目录结构
- 初始化Python虚拟环境
- 安装依赖包（FastAPI、SQLAlchemy、Redis客户端、支付SDK等）
- 配置日志系统
- 配置数据库连接
- 配置Redis连接
- 创建配置文件（config.yaml）

#### 任务1.2：设计数据库表结构
- 创建积分账户表（points_account）的DDL脚本
- 创建充值订单表（recharge_order）的DDL脚本
- 创建积分变动记录表（points_transaction）的DDL脚本
- 创建数据库初始化脚本（init_db.sql）
- 编写数据库迁移脚本

#### 任务1.3：创建数据模型（ORM）
- 创建PointsAccount模型类
- 创建RechargeOrder模型类
- 创建PointsTransaction模型类
- 定义模型之间的关系
- 实现模型的序列化和反序列化方法

### 阶段二：数据访问层（DAO）

#### 任务2.1：实现积分账户DAO
- 创建PointsAccountDAO类
- 实现create方法（创建积分账户）
- 实现getByUserId方法（根据用户ID查询积分账户）
- 实现updateBalance方法（更新积分余额，使用乐观锁）
- 实现updateWithLock方法（更新积分余额，使用悲观锁）
- 实现existsByUserId方法（检查用户是否存在）

#### 任务2.2：实现充值订单DAO
- 创建RechargeOrderDAO类
- 实现create方法（创建充值订单）
- 实现getByOrderId方法（根据订单号查询订单）
- 实现getByUserId方法（根据用户ID查询订单列表）
- 实现updateStatus方法（更新订单状态）
- 实现updatePaymentInfo方法（更新支付信息）

#### 任务2.3：实现积分变动记录DAO
- 创建PointsTransactionDAO类
- 实现create方法（创建积分变动记录）
- 实现getByUserId方法（根据用户ID查询变动记录）
- 实现getByReferenceId方法（根据关联ID查询变动记录）

### 阶段三：业务逻辑层（Service）

#### 任务3.1：实现积分账户管理服务
- 创建PointsAccountService类
- 实现initAccount方法（初始化积分账户，支持幂等）
- 实现getBalance方法（获取积分余额）
- 实现validatePoints方法（验证积分是否足够运行任务）
- 实现deductPoints方法（扣减积分，支持事务）
- 实现addPoints方法（增加积分，支持事务）
- 实现recordTransaction方法（记录积分变动）
- 实现透支控制逻辑（积分<0时拒绝运行）

#### 任务3.2：实现充值订单管理服务
- 创建RechargeOrderService类
- 实现createOrder方法（创建充值订单）
- 实现getOrder方法（查询订单信息）
- 实现updateOrderStatus方法（更新订单状态）
- 实现calculatePoints方法（计算充值积分，支持配置化）
- 实现幂等性处理逻辑

#### 任务3.3：实现支付回调处理服务
- 创建PaymentCallbackService类
- 实现handleCallback方法（处理支付回调）
- 实现verifySignature方法（验证回调签名）
- 实现validateAmount方法（验证支付金额）
- 实现processPaymentSuccess方法（处理支付成功逻辑）
- 实现事务回滚机制

#### 任务3.4：实现审计日志服务
- 创建AuditLogService类
- 实现logTransaction方法（记录积分变动日志）
- 实现logOperation方法（记录操作日志）
- 实现logError方法（记录错误日志）
- 配置日志格式和输出目标

### 阶段四：接口层（Controller）

#### 任务4.1：实现积分账户初始化接口
- 创建PointsAccountController类
- 实现POST /points-accounts/init接口
- 实现参数验证（userId必填）
- 实现业务逻辑调用
- 实现响应格式化
- 实现错误处理

#### 任务4.2：实现积分验证接口
- 实现POST /points-accounts/validate接口
- 实现参数验证（userId必填）
- 实现业务逻辑调用
- 实现响应格式化（返回allowed和balance）
- 实现错误处理

#### 任务4.3：实现积分扣减接口
- 实现POST /points-accounts/deduct接口
- 实现参数验证（userId和duration必填，duration>0）
- 实现业务逻辑调用
- 实现响应格式化（返回deductedPoints和balance）
- 实现错误处理（积分不足返回403）

#### 任务4.4：实现充值订单创建接口
- 创建RechargeOrderController类
- 实现POST /recharge-orders接口
- 实现参数验证（userId、amount、paymentMethod必填，amount>0）
- 实现业务逻辑调用
- 实现响应格式化（返回orderId、paymentUrl等）
- 实现错误处理

#### 任务4.5：实现支付回调接口
- 实现POST /recharge-orders/callback接口
- 实现参数验证（orderId、paymentAmount、paymentMethod、signature必填）
- 实现签名验证
- 实现业务逻辑调用
- 实现响应格式化
- 实现错误处理（签名验证失败返回403，订单不存在返回404）

#### 任务4.6：实现积分余额查询接口
- 实现GET /points-accounts/{userId}接口
- 实现路径参数验证
- 实现业务逻辑调用
- 实现响应格式化（返回balance、status等）
- 实现错误处理（用户不存在返回404）

### 阶段五：缓存优化

#### 任务5.1：实现积分余额缓存
- 创建PointsCacheService类
- 实现getBalanceFromCache方法（从缓存获取积分余额）
- 实现setBalanceToCache方法（设置积分余额到缓存）
- 实现invalidateBalanceCache方法（使积分余额缓存失效）
- 配置缓存过期时间（5分钟）
- 实现缓存穿透保护（使用空值缓存）

#### 任务5.2：集成缓存到积分查询接口
- 修改PointsAccountService的getBalance方法
- 先从缓存查询，缓存未命中再查询数据库
- 查询数据库后更新缓存
- 实现缓存更新策略（写入时更新）

### 阶段六：配置管理

#### 任务6.1：实现配置管理
- 创建Config类
- 读取配置文件（config.yaml）
- 定义数据库配置
- 定义Redis配置
- 定义充值比例配置（默认1000）
- 定义透支规则配置

#### 任务6.2：实现充值比例动态调整
- 修改RechargeOrderService的calculatePoints方法
- 从配置文件读取充值比例
- 支持运行时动态调整充值比例

### 阶段七：测试

#### 任务7.1：编写单元测试
- 编写PointsAccountDAO的单元测试
- 编写RechargeOrderDAO的单元测试
- 编写PointsTransactionDAO的单元测试
- 编写PointsAccountService的单元测试
- 编写RechargeOrderService的单元测试
- 编写PaymentCallbackService的单元测试

#### 任务7.2：编写集成测试
- 编写积分账户初始化接口的集成测试
- 编写积分验证接口的集成测试
- 编写积分扣减接口的集成测试
- 编写充值订单创建接口的集成测试
- 编写支付回调接口的集成测试
- 编写积分余额查询接口的集成测试

#### 任务7.3：编写并发测试
- 编写积分扣减并发测试（验证乐观锁/悲观锁）
- 编写支付回调并发测试（验证幂等性）
- 编写积分账户初始化并发测试（验证幂等性）

### 阶段八：部署和监控

#### 任务8.1：编写部署文档
- 编写环境依赖说明
- 编写数据库初始化步骤
- 编写配置文件说明
- 编写启动命令
- 编写健康检查接口

#### 任务8.2：配置监控告警
- 接入Prometheus监控
- 配置积分扣减接口的监控指标（响应时间、错误率）
- 配置充值接口的监控指标（响应时间、错误率）
- 配置数据库连接池监控
- 配置Redis连接监控
- 配置告警规则（响应时间超过阈值、错误率超过阈值）

#### 任务8.3：配置日志收集
- 配置日志输出到文件
- 配置日志轮转策略
- 接入ELK日志收集系统
- 配置日志格式（包含用户ID、操作类型、变动金额等）

## 任务依赖关系

```
阶段一（项目初始化和数据库设计）
  └─> 阶段二（数据访问层DAO）
        └─> 阶段三（业务逻辑层Service）
              └─> 阶段四（接口层Controller）
                    └─> 阶段五（缓存优化）
                          └─> 阶段六（配置管理）
                                └─> 阶段七（测试）
                                      └─> 阶段八（部署和监控）
```

## 验收标准

### 功能验收
1. 新用户注册时自动创建积分账户，初始积分为100
2. 用户积分>=0时可以运行任务，积分<0时不能运行任务
3. 任务运行完成后，根据运行时长扣减对应积分（1秒=1积分）
4. 用户可以发起充值请求，支持支付宝和微信支付
5. 支付成功后，积分立即到账（1人民币=1000积分）
6. 支付回调处理支持幂等性，重复回调不会重复增加积分
7. 用户可以查询积分余额

### 性能验收
1. 积分扣减接口响应时间不超过100ms
2. 积分查询接口响应时间不超过50ms
3. 充值订单创建接口响应时间不超过200ms

### 可靠性验收
1. 积分扣减操作保证原子性，不会出现积分扣减失败但任务已执行的情况
2. 支付回调处理保证幂等性，重复回调不会重复增加积分
3. 并发扣减积分时，使用乐观锁或悲观锁防止数据不一致

### 安全性验收
1. 积分扣减接口验证调用方身份，防止恶意调用
2. 充值金额进行参数校验，防止负数或异常金额
3. 支付回调验证签名，防止伪造回调

### 可维护性验收
1. 积分变动记录审计日志，包含变动原因、变动金额、变动后余额
2. 关键接口（扣减、充值）接入监控告警
3. 日志包含用户ID、操作类型、变动金额等关键信息

### 兼容性验收
1. 充值比例支持配置化，1人民币=1000积分为默认值
2. 透支规则支持配置化

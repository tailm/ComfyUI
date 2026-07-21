-- 积分账户表
CREATE TABLE IF NOT EXISTS points_account (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(64) NOT NULL UNIQUE,
    balance DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    version INTEGER NOT NULL DEFAULT 0,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 充值订单表
CREATE TABLE IF NOT EXISTS recharge_order (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id VARCHAR(64) NOT NULL UNIQUE,
    user_id VARCHAR(64) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    points DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    payment_url VARCHAR(512),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_time DATETIME,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 积分变动记录表
CREATE TABLE IF NOT EXISTS points_transaction (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(64) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    balance_before DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(10, 2) NOT NULL,
    reference_id VARCHAR(64),
    remark VARCHAR(255),
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_points_account_status ON points_account(status);
CREATE INDEX IF NOT EXISTS idx_recharge_order_user_id ON recharge_order(user_id);
CREATE INDEX IF NOT EXISTS idx_recharge_order_status ON recharge_order(status);
CREATE INDEX IF NOT EXISTS idx_recharge_order_create_time ON recharge_order(create_time);
CREATE INDEX IF NOT EXISTS idx_points_transaction_user_id ON points_transaction(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transaction_type ON points_transaction(transaction_type);
CREATE INDEX IF NOT EXISTS idx_points_transaction_reference_id ON points_transaction(reference_id);
CREATE INDEX IF NOT EXISTS idx_points_transaction_create_time ON points_transaction(create_time);

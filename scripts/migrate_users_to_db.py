#!/usr/bin/env python3
"""
将用户信息从users.json迁移到数据库
"""

import json
import sqlite3
import os
from datetime import datetime

def migrate_users_to_db():
    """将users.json迁移到数据库"""
    
    db_path = "/home/gpu/ComfyUI/user/comfyui.db"
    users_json_path = "/home/gpu/ComfyUI/user/users.json"
    
    # 读取users.json
    if not os.path.exists(users_json_path):
        print("❌ users.json不存在")
        return False
    
    with open(users_json_path, 'r') as f:
        users = json.load(f)
    
    print(f"📋 从users.json读取到 {len(users)} 个用户")
    
    # 连接数据库
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 创建users表
    print("\n🔨 创建users表...")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id VARCHAR(128) PRIMARY KEY,
            username VARCHAR(256) NOT NULL,
            password_hash TEXT,
            password_salt TEXT,
            algorithm VARCHAR(32),
            iterations INTEGER,
            created_at DATETIME NOT NULL,
            last_login DATETIME,
            is_admin BOOLEAN DEFAULT 0
        )
    ''')
    
    # 创建索引
    cursor.execute('CREATE INDEX IF NOT EXISTS ix_users_username ON users(username)')
    
    print("✅ users表创建成功")
    
    # 插入用户数据
    print("\n📝 迁移用户数据...")
    migrated_count = 0
    
    for user_id, user_info in users.items():
        try:
            # 检查用户是否已存在
            cursor.execute('SELECT user_id FROM users WHERE user_id = ?', (user_id,))
            if cursor.fetchone():
                print(f"  ⚠️  用户 {user_id} 已存在,跳过")
                continue
            
            # 插入用户
            cursor.execute('''
                INSERT INTO users (
                    user_id, username, password_hash, password_salt,
                    algorithm, iterations, created_at, last_login, is_admin
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_id,
                user_info.get('username', user_id),
                user_info.get('password_hash', ''),
                user_info.get('password_salt', ''),
                user_info.get('algorithm', 'none'),
                user_info.get('iterations', 0),
                user_info.get('created_at', datetime.now().isoformat()),
                user_info.get('last_login'),
                1 if user_id == '0' else 0  # user_id=0 设为管理员
            ))
            
            migrated_count += 1
            print(f"  ✅ 迁移用户: {user_id} ({user_info.get('username', user_id)})")
            
        except Exception as e:
            print(f"  ❌ 迁移用户 {user_id} 失败: {e}")
    
    # 提交更改
    conn.commit()
    
    # 验证迁移
    print("\n🔍 验证迁移结果...")
    cursor.execute('SELECT COUNT(*) FROM users')
    db_count = cursor.fetchone()[0]
    
    print(f"✅ 数据库中共有 {db_count} 个用户")
    
    # 显示所有用户
    print("\n📋 用户列表:")
    cursor.execute('SELECT user_id, username, is_admin, created_at FROM users')
    for row in cursor.fetchall():
        admin_str = " [管理员]" if row[2] else ""
        print(f"  - user_id: {row[0]}, username: {row[1]}{admin_str}")
        print(f"    创建时间: {row[3]}")
    
    conn.close()
    
    print(f"\n✅ 迁移完成! 共迁移 {migrated_count} 个用户")
    
    # 备份users.json
    backup_path = users_json_path + ".migrated"
    os.rename(users_json_path, backup_path)
    print(f"📦 users.json已备份到: {backup_path}")
    
    return True

if __name__ == "__main__":
    migrate_users_to_db()

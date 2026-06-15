#!/usr/bin/env python3
"""
将用户设置为管理员
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# 导入数据库和模型
from app.user_auth.database import Base, engine, SessionLocal
from app.user_auth.models import User

def set_user_as_admin(username):
    """将用户设置为管理员"""
    print(f"将用户 '{username}' 设置为管理员...")
    
    try:
        # 创建数据库会话
        session = SessionLocal()
        
        # 查找用户
        from sqlalchemy import select
        stmt = select(User).where(User.username == username)
        user = session.execute(stmt).scalar_one_or_none()
        
        if not user:
            print(f"错误: 用户 '{username}' 不存在")
            return False
        
        # 设置为管理员
        user.is_admin = True
        session.commit()
        
        print(f"✓ 用户 '{username}' 已成功设置为管理员")
        print(f"用户ID: {user.id}")
        print(f"用户名: {user.username}")
        print(f"邮箱: {user.email}")
        print(f"显示名称: {user.display_name}")
        print(f"是否管理员: {user.is_admin}")
        print(f"创建时间: {user.created_at}")
        
        return True
        
    except Exception as e:
        print(f"错误: {e}")
        return False
    finally:
        session.close()

def list_all_users():
    """列出所有用户"""
    print("\n" + "="*60)
    print("所有用户列表")
    print("="*60)
    
    try:
        # 创建数据库会话
        session = SessionLocal()
        
        # 获取所有用户
        from sqlalchemy import select
        stmt = select(User).order_by(User.created_at.desc())
        users = session.execute(stmt).scalars().all()
        
        if not users:
            print("没有找到用户")
            return
        
        print(f"找到 {len(users)} 个用户:")
        print("-"*60)
        
        for i, user in enumerate(users, 1):
            print(f"{i}. {user.username} ({user.email})")
            print(f"   ID: {user.id}")
            print(f"   显示名称: {user.display_name}")
            print(f"   是否管理员: {'是' if user.is_admin else '否'}")
            print(f"   是否激活: {'是' if user.is_active else '否'}")
            print(f"   创建时间: {user.created_at}")
            if user.last_login_at:
                print(f"   最后登录: {user.last_login_at}")
            print()
        
    except Exception as e:
        print(f"错误: {e}")
    finally:
        session.close()

def main():
    """主函数"""
    print("ComfyUI 用户认证系统 - 管理员设置工具")
    print("="*60)
    
    # 列出所有用户
    list_all_users()
    
    # 设置特定用户为管理员
    print("\n" + "="*60)
    print("设置用户为管理员")
    print("="*60)
    
    # 从命令行参数获取用户名，如果没有则使用默认值
    if len(sys.argv) > 1:
        username = sys.argv[1]
    else:
        # 使用最近创建的用户
        username = "admin_1780987876"
    
    print(f"尝试将用户 '{username}' 设置为管理员...")
    
    if set_user_as_admin(username):
        print("\n✓ 操作成功完成")
        print("\n💡 现在可以使用此用户测试管理员功能:")
        print(f"用户名: {username}")
        print("密码: Admin123!@#")
        print("\n管理员功能包括:")
        print("1. 查看所有用户列表 (/api/admin/users)")
        print("2. 管理用户权限 (/api/admin/users/{user_id})")
        print("3. 查看速率限制状态 (/api/admin/security/rate-limit-status)")
        print("4. 管理IP白名单 (/api/admin/security/whitelist)")
        print("5. 管理IP黑名单 (/api/admin/security/blacklist)")
    else:
        print("\n❌ 操作失败")
        print("\n💡 请检查:")
        print("1. 用户名是否正确")
        print("2. 数据库是否可访问")
        print("3. 用户是否存在")

if __name__ == "__main__":
    main()
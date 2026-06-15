#!/usr/bin/env python3
"""
启动带有用户认证系统的 ComfyUI
这是一个示例脚本，展示如何启动集成了用户认证系统的 ComfyUI
"""

import os
import sys
import logging

# 添加当前目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# 设置日志级别
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    """主函数"""
    print("=" * 60)
    print("ComfyUI 用户认证系统集成演示")
    print("=" * 60)
    print()
    print("已成功集成以下功能：")
    print()
    print("1. 用户认证系统")
    print("   - 用户注册 (/api/auth/register)")
    print("   - 用户登录 (/api/auth/login)")
    print("   - 会话管理 (/api/auth/refresh, /api/auth/logout)")
    print("   - 用户资料管理 (/api/auth/me, /api/auth/profile)")
    print("   - 密码修改 (/api/auth/change-password)")
    print()
    print("2. 用户模板管理系统")
    print("   - 模板创建 (/api/templates)")
    print("   - 模板列表 (/api/templates)")
    print("   - 模板详情 (/api/templates/{id})")
    print("   - 模板更新 (/api/templates/{id})")
    print("   - 模板删除 (/api/templates/{id})")
    print("   - 模板收藏 (/api/templates/{id}/favorite)")
    print("   - 模板使用统计 (/api/templates/{id}/use)")
    print("   - 模板分类 (/api/templates/categories)")
    print("   - 热门模板 (/api/templates/popular)")
    print("   - 模板导入导出 (/api/templates/import, /api/templates/{id}/export)")
    print()
    print("3. 数据库表结构")
    print("   - users: 用户表")
    print("   - user_sessions: 用户会话表")
    print("   - user_templates: 用户模板表")
    print("   - user_preferences: 用户偏好设置表")
    print()
    print("4. 默认管理员账户")
    print("   - 用户名: admin")
    print("   - 密码: admin123")
    print("   - 邮箱: admin@comfyui.local")
    print()
    print("5. 安全特性")
    print("   - 密码使用 PBKDF2 哈希算法存储")
    print("   - 每个密码使用唯一的盐值")
    print("   - 会话令牌和刷新令牌机制")
    print("   - 输入验证和清理")
    print()
    print("6. 使用方法")
    print("   - 启动 ComfyUI: python main.py")
    print("   - 访问 API 文档: http://localhost:8188")
    print("   - 使用 curl 或 Postman 测试 API")
    print()
    print("7. 示例 API 调用")
    print("   # 用户注册")
    print("   curl -X POST http://localhost:8188/api/auth/register \\")
    print("     -H \"Content-Type: application/json\" \\")
    print("     -d '{\"username\": \"testuser\", \"password\": \"TestPass123!\", \"email\": \"test@example.com\"}'")
    print()
    print("   # 用户登录")
    print("   curl -X POST http://localhost:8188/api/auth/login \\")
    print("     -H \"Content-Type: application/json\" \\")
    print("     -d '{\"username\": \"testuser\", \"password\": \"TestPass123!\"}'")
    print()
    print("   # 创建模板")
    print("   curl -X POST http://localhost:8188/api/templates \\")
    print("     -H \"Authorization: Bearer {session_token}\" \\")
    print("     -H \"Content-Type: application/json\" \\")
    print("     -d '{\"name\": \"我的模板\", \"workflow_data\": \"{}\", \"is_public\": false}'")
    print()
    print("=" * 60)
    print("要启动 ComfyUI，请运行: python main.py")
    print("=" * 60)
    
    # 检查数据库迁移
    print("\n检查数据库迁移状态...")
    try:
        from app.database.db import init_db
        init_db()
        print("✓ 数据库迁移成功")
    except Exception as e:
        print(f"✗ 数据库迁移失败: {e}")
        print("请确保没有其他 ComfyUI 进程正在运行")
    
    print("\n启动 ComfyUI 命令:")
    print("python main.py --listen 0.0.0.0 --port 8188")
    print("\n或者使用以下参数启用更多功能:")
    print("python main.py --listen 0.0.0.0 --port 8188 --enable-cors-header")

if __name__ == "__main__":
    main()
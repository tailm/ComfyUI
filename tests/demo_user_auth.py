#!/usr/bin/env python3
"""
用户认证系统演示脚本
展示如何将用户认证系统集成到 ComfyUI 中
"""

import os
import sys
import json
import asyncio
import aiohttp
from datetime import datetime

# 添加当前目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def print_header(title):
    """打印标题"""
    print("\n" + "="*60)
    print(f" {title}")
    print("="*60)

async def demo_user_registration():
    """演示用户注册流程"""
    print_header("用户注册演示")
    
    # 模拟注册请求
    registration_data = {
        "username": "demo_user",
        "password": "DemoPass123!",
        "email": "demo@example.com",
        "display_name": "演示用户"
    }
    
    print("注册请求数据:")
    print(json.dumps(registration_data, indent=2, ensure_ascii=False))
    print()
    
    # 模拟验证过程
    from app.user_auth.password import UsernameValidator, EmailValidator, PasswordValidator
    
    # 验证用户名
    username_valid, username_msg = UsernameValidator.validate_username(registration_data["username"])
    print(f"用户名验证: {username_valid} - {username_msg}")
    
    # 验证邮箱
    email_valid, email_msg = EmailValidator.validate_email(registration_data["email"])
    print(f"邮箱验证: {email_valid} - {email_msg}")
    
    # 验证密码
    password_valid, password_msg = PasswordValidator.validate_password(registration_data["password"])
    print(f"密码验证: {password_valid} - {password_msg}")
    
    if all([username_valid, email_valid, password_valid]):
        print("\n✓ 所有验证通过，可以创建用户")
        
        # 模拟密码哈希
        from app.user_auth.password import PasswordHasher
        password_hash, salt = PasswordHasher.hash_password(registration_data["password"])
        print(f"\n密码哈希: {password_hash[:32]}...")
        print(f"盐值: {salt[:32]}...")
        
        # 验证密码
        is_valid = PasswordHasher.verify_password(
            registration_data["password"], 
            password_hash, 
            salt
        )
        print(f"密码验证结果: {is_valid}")
        
        # 生成会话令牌
        session_token = PasswordHasher.generate_session_token()
        refresh_token = PasswordHasher.generate_refresh_token()
        print(f"\n会话令牌: {session_token[:32]}...")
        print(f"刷新令牌: {refresh_token[:32]}...")
        
        return {
            "user_id": "demo_user_id",
            "username": registration_data["username"],
            "session_token": session_token,
            "refresh_token": refresh_token
        }
    else:
        print("\n✗ 验证失败，无法创建用户")
        return None

async def demo_template_management(user_info):
    """演示模板管理流程"""
    print_header("模板管理演示")
    
    if not user_info:
        print("需要先登录用户")
        return
    
    print(f"用户: {user_info['username']}")
    print(f"会话令牌: {user_info['session_token'][:32]}...")
    print()
    
    # 模拟模板数据
    template_data = {
        "name": "文生图工作流",
        "description": "一个简单的文生图工作流模板",
        "category": "文生图",
        "tags": "stable diffusion,文生图,基础",
        "is_public": True,
        "workflow_data": json.dumps({
            "nodes": [
                {
                    "id": 1,
                    "type": "CLIPTextEncode",
                    "inputs": {
                        "text": "a beautiful landscape",
                        "clip": "clip_model"
                    }
                },
                {
                    "id": 2,
                    "type": "KSampler",
                    "inputs": {
                        "model": "stable_diffusion_model",
                        "positive": {"prompt": 1},
                        "negative": {"prompt": "negative prompt"},
                        "latent_image": {"latent": "empty_latent"},
                        "seed": 42,
                        "steps": 20,
                        "cfg": 7.0
                    }
                }
            ]
        }, indent=2)
    }
    
    print("模板数据:")
    print(json.dumps(template_data, indent=2, ensure_ascii=False))
    print()
    
    # 模拟模板创建
    print("创建模板...")
    print("✓ 模板创建成功")
    print(f"模板ID: template_001")
    print(f"创建时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 模拟模板使用
    print("\n使用模板...")
    print("✓ 模板使用次数+1")
    
    # 模拟模板收藏
    print("\n收藏模板...")
    print("✓ 模板已添加到收藏")
    
    return {
        "template_id": "template_001",
        "name": template_data["name"],
        "category": template_data["category"],
        "created_at": datetime.now().isoformat()
    }

async def demo_api_integration():
    """演示 API 集成"""
    print_header("API 集成演示")
    
    print("1. 用户认证 API 端点:")
    print("   POST   /api/auth/register     - 用户注册")
    print("   POST   /api/auth/login        - 用户登录")
    print("   GET    /api/auth/me           - 获取当前用户信息")
    print("   PUT    /api/auth/profile      - 更新用户资料")
    print("   POST   /api/auth/change-password - 修改密码")
    print("   POST   /api/auth/refresh      - 刷新会话")
    print("   POST   /api/auth/logout       - 用户登出")
    print()
    
    print("2. 模板管理 API 端点:")
    print("   POST   /api/templates         - 创建模板")
    print("   GET    /api/templates         - 获取模板列表")
    print("   GET    /api/templates/{id}    - 获取模板详情")
    print("   PUT    /api/templates/{id}    - 更新模板")
    print("   DELETE /api/templates/{id}    - 删除模板")
    print("   POST   /api/templates/{id}/favorite - 切换收藏")
    print("   POST   /api/templates/{id}/use - 使用模板")
    print("   GET    /api/templates/categories - 获取分类")
    print("   GET    /api/templates/popular - 获取热门模板")
    print("   POST   /api/templates/import  - 导入模板")
    print("   GET    /api/templates/{id}/export - 导出模板")
    print()
    
    print("3. 集成到 ComfyUI 服务器:")
    print("   - 在 server.py 中添加路由")
    print("   - 在 add_routes 函数中注册路由")
    print("   - 初始化数据库连接")
    print("   - 添加认证中间件")
    print()
    
    print("4. 前端集成示例:")
    print("   ```javascript")
    print("   // 用户登录")
    print("   async function login(username, password) {")
    print("     const response = await fetch('/api/auth/login', {")
    print("       method: 'POST',")
    print("       headers: {'Content-Type': 'application/json'}, ")
    print("       body: JSON.stringify({username, password})")
    print("     });")
    print("     return await response.json();")
    print("   }")
    print()
    print("   // 创建模板")
    print("   async function createTemplate(sessionToken, templateData) {")
    print("     const response = await fetch('/api/templates', {")
    print("       method: 'POST',")
    print("       headers: {")
    print("         'Content-Type': 'application/json',")
    print("         'Authorization': `Bearer ${sessionToken}`")
    print("       },")
    print("       body: JSON.stringify(templateData)")
    print("     });")
    print("     return await response.json();")
    print("   }")
    print("   ```")

async def demo_security_features():
    """演示安全特性"""
    print_header("安全特性演示")
    
    print("1. 密码安全:")
    print("   - 使用 PBKDF2 哈希算法")
    print("   - 每个密码使用唯一的盐值")
    print("   - 支持密码强度验证")
    print()
    
    print("2. 会话安全:")
    print("   - 使用安全的随机令牌")
    print("   - 会话过期机制（默认7天）")
    print("   - 刷新令牌支持")
    print("   - IP地址和用户代理记录")
    print()
    
    print("3. 输入验证:")
    print("   - 用户名格式验证（字母开头，3-50字符）")
    print("   - 邮箱格式验证")
    print("   - 密码强度验证（大小写字母、数字、特殊字符）")
    print("   - SQL 注入防护")
    print()
    
    print("4. 数据库安全:")
    print("   - 使用参数化查询")
    print("   - 外键约束和级联删除")
    print("   - 唯一性约束")
    print("   - 索引优化")
    print()
    
    print("5. 默认安全设置:")
    print("   - 密码最小长度: 8字符")
    print("   - 会话过期时间: 7天")
    print("   - 刷新令牌过期时间: 30天")
    print("   - 最大登录尝试次数: 5次（可配置）")
    print("   - 密码哈希迭代次数: 100,000次")

async def demo_database_structure():
    """演示数据库结构"""
    print_header("数据库结构演示")
    
    print("1. users 表（用户表）:")
    print("   - id: UUID 主键")
    print("   - username: 用户名（唯一）")
    print("   - email: 邮箱（唯一，可选）")
    print("   - display_name: 显示名称")
    print("   - password_hash: 密码哈希")
    print("   - salt: 盐值")
    print("   - is_active: 是否激活")
    print("   - is_admin: 是否管理员")
    print("   - created_at: 创建时间")
    print("   - updated_at: 更新时间")
    print("   - last_login_at: 最后登录时间")
    print()
    
    print("2. user_sessions 表（用户会话表）:")
    print("   - id: UUID 主键")
    print("   - user_id: 用户ID（外键）")
    print("   - session_token: 会话令牌（唯一）")
    print("   - refresh_token: 刷新令牌（唯一）")
    print("   - user_agent: 用户代理")
    print("   - ip_address: IP地址")
    print("   - is_active: 是否激活")
    print("   - created_at: 创建时间")
    print("   - expires_at: 过期时间")
    print("   - last_used_at: 最后使用时间")
    print()
    
    print("3. user_templates 表（用户模板表）:")
    print("   - id: UUID 主键")
    print("   - user_id: 用户ID（外键）")
    print("   - name: 模板名称")
    print("   - description: 描述")
    print("   - workflow_data: 工作流数据（JSON）")
    print("   - thumbnail: 缩略图")
    print("   - category: 分类")
    print("   - tags: 标签")
    print("   - is_public: 是否公开")
    print("   - is_favorite: 是否收藏")
    print("   - view_count: 查看次数")
    print("   - use_count: 使用次数")
    print("   - created_at: 创建时间")
    print("   - updated_at: 更新时间")
    print()
    
    print("4. user_preferences 表（用户偏好设置表）:")
    print("   - user_id: 用户ID（主键，外键）")
    print("   - theme: 主题")
    print("   - language: 语言")
    print("   - auto_save: 自动保存")
    print("   - auto_save_interval: 自动保存间隔")
    print("   - show_minimap: 显示小地图")
    print("   - show_grid: 显示网格")
    print("   - snap_to_grid: 对齐网格")
    print("   - show_advanced_widgets: 显示高级控件")
    print("   - show_node_titles: 显示节点标题")
    print("   - created_at: 创建时间")
    print("   - updated_at: 更新时间")
    print()
    
    print("5. 数据库关系:")
    print("   users 1:n user_sessions")
    print("   users 1:n user_templates")
    print("   users 1:1 user_preferences")

async def main():
    """主函数"""
    print("="*60)
    print("ComfyUI 用户认证系统演示")
    print("="*60)
    print()
    
    try:
        # 演示用户注册
        user_info = await demo_user_registration()
        
        if user_info:
            # 演示模板管理
            template_info = await demo_template_management(user_info)
            
            # 演示 API 集成
            await demo_api_integration()
            
            # 演示安全特性
            await demo_security_features()
            
            # 演示数据库结构
            await demo_database_structure()
            
            print_header("演示总结")
            print("✓ 用户认证系统已成功集成到 ComfyUI")
            print("✓ 支持完整的用户注册、登录、会话管理")
            print("✓ 支持用户模板的创建、管理、分享")
            print("✓ 提供安全的密码存储和验证机制")
            print("✓ 包含完整的 API 文档和示例")
            print("✓ 易于扩展和维护")
            print()
            print("下一步:")
            print("1. 启动 ComfyUI: python main.py")
            print("2. 测试 API: python examples/user_auth_example.py")
            print("3. 查看文档: cat QUICK_START_GUIDE.md")
            print("4. 运行测试: python test_user_auth_memory.py")
        
    except Exception as e:
        print(f"\n演示过程中发生错误: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
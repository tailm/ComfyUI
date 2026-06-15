#!/usr/bin/env python3
"""
验证用户认证系统安装
检查所有组件是否正确安装和配置
"""

import os
import sys
import importlib.util

def check_file_exists(filepath, description):
    """检查文件是否存在"""
    if os.path.exists(filepath):
        print(f"✓ {description}: {filepath}")
        return True
    else:
        print(f"✗ {description}: {filepath} (文件不存在)")
        return False

def check_module_import(module_name, description):
    """检查模块是否能导入"""
    try:
        __import__(module_name)
        print(f"✓ {description}: {module_name}")
        return True
    except ImportError as e:
        print(f"✗ {description}: {module_name} (导入失败: {e})")
        return False

def check_class_exists(module_path, class_name, description):
    """检查类是否存在"""
    try:
        # 对于所有文件，我们检查文件是否存在和内容包含类定义
        if os.path.exists(module_path):
            with open(module_path, 'r') as f:
                content = f.read()
                # 检查类定义
                if f"class {class_name}" in content:
                    print(f"✓ {description}: {class_name}")
                    return True
                # 检查导入语句
                elif f"from ." in content and class_name in content:
                    print(f"✓ {description}: {class_name} (通过导入语句找到)")
                    return True
                else:
                    print(f"✗ {description}: {class_name} (类定义未找到)")
                    return False
        else:
            print(f"✗ {description}: {class_name} (文件不存在: {module_path})")
            return False
    except Exception as e:
        print(f"✗ {description}: {class_name} (检查失败: {str(e)[:100]}...)")
        return False

def check_database_migration():
    """检查数据库迁移脚本"""
    migration_file = "alembic_db/versions/0004_add_user_auth_tables.py"
    if check_file_exists(migration_file, "数据库迁移脚本"):
        try:
            with open(migration_file, 'r') as f:
                content = f.read()
                if "def upgrade()" in content and "def downgrade()" in content:
                    print("✓ 迁移脚本包含升级和降级函数")
                    return True
                else:
                    print("✗ 迁移脚本缺少必要函数")
                    return False
        except Exception as e:
            print(f"✗ 读取迁移脚本失败: {e}")
            return False
    return False

def check_server_integration():
    """检查服务器集成"""
    server_file = "server.py"
    if check_file_exists(server_file, "服务器文件"):
        try:
            with open(server_file, 'r') as f:
                content = f.read()
                checks = [
                    ("from app.user_auth import init_user_auth_system", "用户认证系统导入"),
                    ("init_user_auth_system", "用户认证系统初始化"),
                    ("self.auth_routes", "用户认证路由属性"),
                    ("self.auth_routes.add_routes", "用户认证路由注册"),
                ]
                
                all_passed = True
                for check_str, description in checks:
                    if check_str in content:
                        print(f"✓ {description}: 找到 '{check_str}'")
                    else:
                        print(f"✗ {description}: 未找到 '{check_str}'")
                        all_passed = False
                
                return all_passed
        except Exception as e:
            print(f"✗ 读取服务器文件失败: {e}")
            return False
    return False

def check_database_models():
    """检查数据库模型"""
    models_file = "app/database/db.py"
    if check_file_exists(models_file, "数据库初始化文件"):
        try:
            with open(models_file, 'r') as f:
                content = f.read()
                if "import app.user_auth.models" in content or "from app.user_auth import models" in content:
                    print("✓ 数据库模型已导入")
                    return True
                else:
                    print("✗ 数据库模型未导入")
                    return False
        except Exception as e:
            print(f"✗ 读取数据库文件失败: {e}")
            return False
    return False

def main():
    """主函数"""
    print("="*60)
    print("ComfyUI 用户认证系统安装验证")
    print("="*60)
    print()
    
    # 添加当前目录到 Python 路径
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    
    # 检查文件结构
    print("1. 检查文件结构:")
    print("-"*40)
    
    files_to_check = [
        ("app/user_auth/__init__.py", "用户认证模块初始化文件"),
        ("app/user_auth/models.py", "数据库模型文件"),
        ("app/user_auth/password.py", "密码工具文件"),
        ("app/user_auth/manager.py", "用户认证管理器"),
        ("app/user_auth/template_manager.py", "模板管理器"),
        ("app/user_auth/routes.py", "API路由文件"),
        ("alembic_db/versions/0004_add_user_auth_tables.py", "数据库迁移脚本"),
        ("test_user_auth.py", "测试脚本"),
        ("test_user_auth_memory.py", "内存数据库测试脚本"),
        ("examples/user_auth_example.py", "API使用示例"),
        ("demo_user_auth.py", "演示脚本"),
        ("start_with_auth.py", "启动指南"),
        ("QUICK_START_GUIDE.md", "快速开始指南"),
        ("USER_AUTH_SYSTEM_SUMMARY.md", "系统总结文档"),
    ]
    
    file_checks = []
    for filepath, description in files_to_check:
        file_checks.append(check_file_exists(filepath, description))
    
    print()
    
    # 检查模块导入
    print("2. 检查模块导入:")
    print("-"*40)
    
    modules_to_check = [
        ("app.user_auth", "用户认证模块"),
        ("app.user_auth.models", "数据库模型"),
        ("app.user_auth.password", "密码工具"),
        ("app.user_auth.manager", "用户认证管理器"),
        ("app.user_auth.template_manager", "模板管理器"),
        ("app.user_auth.routes", "API路由"),
    ]
    
    module_checks = []
    for module_name, description in modules_to_check:
        module_checks.append(check_module_import(module_name, description))
    
    print()
    
    # 检查类定义
    print("3. 检查类定义:")
    print("-"*40)
    
    classes_to_check = [
        ("app/user_auth/models.py", "User", "用户模型类"),
        ("app/user_auth/models.py", "UserSession", "用户会话类"),
        ("app/user_auth/models.py", "UserTemplate", "用户模板类"),
        ("app/user_auth/models.py", "UserPreference", "用户偏好类"),
        ("app/user_auth/password.py", "PasswordHasher", "密码哈希器"),
        ("app/user_auth/password.py", "PasswordValidator", "密码验证器"),
        ("app/user_auth/password.py", "UsernameValidator", "用户名验证器"),
        ("app/user_auth/password.py", "EmailValidator", "邮箱验证器"),
        ("app/user_auth/manager.py", "UserAuthManager", "用户认证管理器类"),
        ("app/user_auth/template_manager.py", "UserTemplateManager", "模板管理器类"),
        ("app/user_auth/routes.py", "UserAuthRoutes", "用户认证路由类"),
    ]
    
    class_checks = []
    for filepath, class_name, description in classes_to_check:
        class_checks.append(check_class_exists(filepath, class_name, description))
    
    print()
    
    # 检查数据库迁移
    print("4. 检查数据库迁移:")
    print("-"*40)
    migration_check = check_database_migration()
    
    print()
    
    # 检查服务器集成
    print("5. 检查服务器集成:")
    print("-"*40)
    server_check = check_server_integration()
    
    print()
    
    # 检查数据库模型导入
    print("6. 检查数据库模型导入:")
    print("-"*40)
    db_check = check_database_models()
    
    print()
    print("="*60)
    print("验证结果汇总:")
    print("="*60)
    
    total_checks = len(file_checks) + len(module_checks) + len(class_checks) + 3
    passed_checks = (
        sum(file_checks) + 
        sum(module_checks) + 
        sum(class_checks) + 
        migration_check + 
        server_check + 
        db_check
    )
    
    print(f"总检查项: {total_checks}")
    print(f"通过项: {passed_checks}")
    print(f"失败项: {total_checks - passed_checks}")
    print()
    
    if passed_checks == total_checks:
        print("✅ 所有检查通过！用户认证系统已正确安装。")
        print()
        print("下一步:")
        print("1. 启动 ComfyUI: python main.py")
        print("2. 测试 API: python examples/user_auth_example.py")
        print("3. 查看文档: cat QUICK_START_GUIDE.md")
    else:
        print("❌ 部分检查失败，请修复上述问题。")
        print()
        print("常见问题:")
        print("1. 确保所有文件已正确创建")
        print("2. 检查 Python 导入路径")
        print("3. 验证数据库迁移脚本语法")
        print("4. 确认服务器文件已正确修改")
    
    print()
    print("="*60)

if __name__ == "__main__":
    main()
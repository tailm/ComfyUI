#!/usr/bin/env python3
"""
通过API注册管理员用户
"""

import requests
import json

def register_admin():
    """通过API注册管理员用户"""
    print("通过API注册管理员用户...")
    
    # 注册数据
    register_data = {
        "username": "admin_user",
        "password": "Admin123!@#",
        "email": "admin_user@example.com",
        "display_name": "管理员用户"
    }
    
    try:
        response = requests.post(
            "http://localhost:8188/api/auth/register",
            json=register_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            if result["success"]:
                print("✓ 管理员用户注册成功")
                print(f"  用户ID: {result['data']['user_id']}")
                print(f"  用户名: {result['data']['username']}")
                print(f"  显示名称: {result['data']['display_name']}")
                print(f"  邮箱: {result['data']['email']}")
                return result['data']['user_id']
            else:
                print(f"✗ 注册失败: {result['message']}")
        else:
            print(f"✗ HTTP错误: {response.status_code}")
            print(f"  响应: {response.text}")
            
    except Exception as e:
        print(f"✗ 请求异常: {e}")
    
    return None

def login_admin():
    """登录管理员用户"""
    print("\n登录管理员用户...")
    
    login_data = {
        "username": "admin_user",
        "password": "Admin123!@#"
    }
    
    try:
        response = requests.post(
            "http://localhost:8188/api/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            if result["success"]:
                print("✓ 管理员登录成功")
                print(f"  用户ID: {result['data']['user_id']}")
                print(f"  会话令牌: {result['data']['session_token'][:20]}...")
                print(f"  是否管理员: {result['data']['is_admin']}")
                return result['data']['session_token']
            else:
                print(f"✗ 登录失败: {result['message']}")
        else:
            print(f"✗ HTTP错误: {response.status_code}")
            print(f"  响应: {response.text}")
            
    except Exception as e:
        print(f"✗ 请求异常: {e}")
    
    return None

def test_admin_functions(session_token):
    """测试管理员功能"""
    print("\n测试管理员功能...")
    
    if not session_token:
        print("✗ 无会话令牌，跳过测试")
        return
    
    # 测试获取用户列表
    try:
        response = requests.get(
            "http://localhost:8188/api/admin/users",
            headers={
                "Authorization": f"Bearer {session_token}",
                "Content-Type": "application/json"
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            if result["success"]:
                print("✓ 获取用户列表成功")
                print(f"  总用户数: {result['data']['total_count']}")
                if result["data"]["users"]:
                    print(f"  用户示例: {result['data']['users'][0]['username']} (ID: {result['data']['users'][0]['id']})")
            else:
                print(f"✗ 获取用户列表失败: {result['message']}")
        elif response.status_code == 403:
            print("✗ 权限不足（需要管理员权限）")
            print("  注意：新注册的用户默认不是管理员，需要手动设置为管理员")
        else:
            print(f"✗ HTTP错误: {response.status_code}")
            
    except Exception as e:
        print(f"✗ 请求异常: {e}")
    
    # 测试安全API
    print("\n测试安全API...")
    
    # 获取白名单
    try:
        response = requests.get(
            "http://localhost:8188/api/admin/security/whitelist",
            headers={
                "Authorization": f"Bearer {session_token}",
                "Content-Type": "application/json"
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            if result["success"]:
                print("✓ 获取白名单成功")
                print(f"  IP数量: {len(result['data']['ips'])}")
                print(f"  CIDR数量: {len(result['data']['cidrs'])}")
            else:
                print(f"✗ 获取白名单失败: {result['message']}")
        elif response.status_code == 403:
            print("✗ 权限不足（需要管理员权限）")
        else:
            print(f"✗ HTTP错误: {response.status_code}")
            
    except Exception as e:
        print(f"✗ 请求异常: {e}")
    
    # 获取速率限制状态
    try:
        response = requests.get(
            "http://localhost:8188/api/admin/security/rate-limit-status",
            headers={
                "Authorization": f"Bearer {session_token}",
                "Content-Type": "application/json"
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            if result["success"]:
                print("✓ 获取速率限制状态成功")
                status = result["data"]
                print(f"  登录剩余: {status['login']['remaining']}/{status['login']['limit']}")
                print(f"  注册剩余: {status['register']['remaining']}/{status['register']['limit']}")
                print(f"  API剩余: {status['api']['remaining']}/{status['api']['limit']}")
            else:
                print(f"✗ 获取速率限制状态失败: {result['message']}")
        elif response.status_code == 403:
            print("✗ 权限不足（需要管理员权限）")
        else:
            print(f"✗ HTTP错误: {response.status_code}")
            
    except Exception as e:
        print(f"✗ 请求异常: {e}")

def main():
    """主函数"""
    print("="*60)
    print("通过API注册和测试管理员用户")
    print("="*60)
    
    # 注册管理员用户
    user_id = register_admin()
    
    if not user_id:
        print("✗ 注册管理员用户失败")
        return
    
    # 登录管理员用户
    session_token = login_admin()
    
    if session_token:
        # 测试管理员功能
        test_admin_functions(session_token)
    
    print("\n" + "="*60)
    print("管理员用户测试完成！")
    print("="*60)
    print("\n注意：新注册的用户默认不是管理员。")
    print("要将用户设置为管理员，需要：")
    print("1. 使用现有的管理员账户登录")
    print("2. 通过用户管理API将用户权限更新为管理员")
    print("\n或者，您可以通过数据库直接设置is_admin字段为True。")

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
ComfyUI 用户认证系统集成测试脚本
测试设置页面和用户认证功能的集成
"""

import requests
import json
import sys
import time

def test_api_endpoints(base_url):
    """测试API端点是否正常工作"""
    print("🔍 测试API端点...")
    
    endpoints = [
        ("GET", "/", "服务器状态"),
        ("POST", "/api/auth/login", "用户登录"),
        ("GET", "/api/auth/me", "获取用户信息（需要认证）"),
        ("GET", "/api/admin/users", "获取用户列表（需要管理员权限）"),
    ]
    
    for method, endpoint, description in endpoints:
        url = f"{base_url}{endpoint}"
        try:
            if method == "GET":
                response = requests.get(url, timeout=5)
            elif method == "POST":
                response = requests.post(url, json={}, timeout=5)
            
            print(f"  {description} ({method} {endpoint}): ", end="")
            if response.status_code < 400:
                print(f"✅ 状态码: {response.status_code}")
            else:
                print(f"❌ 状态码: {response.status_code}")
                
        except Exception as e:
            print(f"  {description} ({method} {endpoint}): ❌ 错误: {e}")
    
    print()

def test_user_login(base_url):
    """测试用户登录功能"""
    print("🔑 测试用户登录...")
    
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/auth/login",
            json=login_data,
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                print(f"  ✅ 登录成功")
                print(f"    用户: {result['data']['username']}")
                print(f"    是否管理员: {result['data']['is_admin']}")
                print(f"    会话令牌: {result['data']['session_token'][:20]}...")
                return result['data']['session_token']
            else:
                print(f"  ❌ 登录失败: {result.get('message', '未知错误')}")
        else:
            print(f"  ❌ HTTP错误: {response.status_code}")
            
    except Exception as e:
        print(f"  ❌ 请求失败: {e}")
    
    print()
    return None

def test_user_info(base_url, token):
    """测试获取用户信息"""
    if not token:
        print("⚠️  跳过用户信息测试（无令牌）")
        return
    
    print("👤 测试获取用户信息...")
    
    try:
        response = requests.get(
            f"{base_url}/api/auth/me",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                print(f"  ✅ 获取用户信息成功")
                print(f"    用户名: {result['data']['username']}")
                print(f"    邮箱: {result['data'].get('email', '未设置')}")
                print(f"    显示名称: {result['data'].get('display_name', '未设置')}")
            else:
                print(f"  ❌ 获取用户信息失败: {result.get('message', '未知错误')}")
        else:
            print(f"  ❌ HTTP错误: {response.status_code}")
            
    except Exception as e:
        print(f"  ❌ 请求失败: {e}")
    
    print()

def test_admin_users(base_url, token):
    """测试管理员用户列表"""
    if not token:
        print("⚠️  跳过管理员用户列表测试（无令牌）")
        return
    
    print("👥 测试管理员用户列表...")
    
    try:
        response = requests.get(
            f"{base_url}/api/admin/users",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                users = result['data'].get('users', [])
                print(f"  ✅ 获取用户列表成功")
                print(f"    用户数量: {len(users)}")
                for user in users[:3]:  # 显示前3个用户
                    print(f"    - {user['username']} ({'管理员' if user['is_admin'] else '普通用户'})")
                if len(users) > 3:
                    print(f"    ... 还有 {len(users) - 3} 个用户")
            else:
                print(f"  ❌ 获取用户列表失败: {result.get('message', '未知错误')}")
        else:
            print(f"  ❌ HTTP错误: {response.status_code}")
            
    except Exception as e:
        print(f"  ❌ 请求失败: {e}")
    
    print()

def test_frontend_pages(base_url):
    """测试前端页面可访问性"""
    print("🌐 测试前端页面...")
    
    pages = [
        ("/", "ComfyUI主界面"),
        ("/user_auth_frontend.html", "用户认证前端界面"),
        ("/user_auth_settings.html", "用户认证设置页面"),
        ("/test_frontend_api.html", "API测试页面"),
    ]
    
    for page, description in pages:
        url = f"{base_url}{page}"
        try:
            response = requests.get(url, timeout=5)
            print(f"  {description}: ", end="")
            if response.status_code == 200:
                print(f"✅ 可访问")
            else:
                print(f"❌ 状态码: {response.status_code}")
                
        except Exception as e:
            print(f"  {description}: ❌ 错误: {e}")
    
    print()

def main():
    """主测试函数"""
    print("=" * 60)
    print("ComfyUI 用户认证系统集成测试")
    print("=" * 60)
    print()
    
    # 获取基础URL
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = "http://192.168.50.228:8188"
    
    print(f"📡 测试服务器: {base_url}")
    print()
    
    # 测试API端点
    test_api_endpoints(base_url)
    
    # 测试用户登录
    token = test_user_login(base_url)
    
    # 测试用户信息
    test_user_info(base_url, token)
    
    # 测试管理员功能
    test_admin_users(base_url, token)
    
    # 测试前端页面
    test_frontend_pages(base_url)
    
    print("=" * 60)
    print("测试完成！")
    print("=" * 60)
    print()
    print("📋 访问链接:")
    print(f"  用户认证界面: {base_url}/user_auth_frontend.html")
    print(f"  用户认证设置: {base_url}/user_auth_settings.html")
    print(f"  API测试页面: {base_url}/test_frontend_api.html")
    print(f"  ComfyUI主界面: {base_url}/")
    print()
    print("🔑 测试账户:")
    print("  用户名: admin")
    print("  密码: admin123")
    print()

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
用户认证系统 API 使用示例
展示如何使用新添加的用户认证和模板管理 API
"""

import requests
import json
import sys

# ComfyUI 服务器地址
BASE_URL = "http://localhost:8188"

def print_response(response, description):
    """打印 API 响应"""
    print(f"\n{'='*60}")
    print(f"{description}")
    print(f"{'='*60}")
    print(f"状态码: {response.status_code}")
    print(f"响应头: {dict(response.headers)}")
    try:
        data = response.json()
        print(f"响应体: {json.dumps(data, indent=2, ensure_ascii=False)}")
    except:
        print(f"响应体: {response.text}")
    print()

def test_user_registration():
    """测试用户注册"""
    print("1. 测试用户注册")
    
    # 注册新用户
    payload = {
        "username": "demo_user",
        "password": "DemoPass123!",
        "email": "demo@example.com",
        "display_name": "演示用户"
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
    print_response(response, "用户注册")
    
    if response.status_code == 201 or response.status_code == 200:
        return response.json().get("data", {}).get("user_id")
    return None

def test_user_login():
    """测试用户登录"""
    print("2. 测试用户登录")
    
    # 用户登录
    payload = {
        "username": "demo_user",
        "password": "DemoPass123!"
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
    print_response(response, "用户登录")
    
    if response.status_code == 200:
        data = response.json().get("data", {})
        return data.get("session_token"), data.get("user_id")
    return None, None

def test_get_current_user(session_token):
    """测试获取当前用户信息"""
    print("3. 测试获取当前用户信息")
    
    headers = {"Authorization": f"Bearer {session_token}"}
    response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    print_response(response, "获取当前用户信息")
    
    return response.status_code == 200

def test_create_template(session_token, user_id):
    """测试创建模板"""
    print("4. 测试创建模板")
    
    # 创建一个简单的工作流模板
    workflow_data = {
        "nodes": [
            {
                "id": 1,
                "type": "KSampler",
                "inputs": {
                    "model": "model.safetensors",
                    "positive": "positive prompt",
                    "negative": "negative prompt",
                    "latent_image": {"latent": "latent_image"},
                    "seed": 42,
                    "steps": 20,
                    "cfg": 7.0,
                    "sampler_name": "euler",
                    "scheduler": "normal",
                    "denoise": 1.0
                }
            },
            {
                "id": 2,
                "type": "VAEDecode",
                "inputs": {
                    "samples": {"samples": 1},
                    "vae": "vae.safetensors"
                }
            }
        ]
    }
    
    payload = {
        "name": "我的第一个模板",
        "workflow_data": json.dumps(workflow_data),
        "description": "这是一个演示模板，包含 KSampler 和 VAEDecode 节点",
        "category": "文生图",
        "tags": "stable diffusion,文生图,演示",
        "is_public": True
    }
    
    headers = {"Authorization": f"Bearer {session_token}", "Content-Type": "application/json"}
    response = requests.post(f"{BASE_URL}/api/templates", headers=headers, json=payload)
    print_response(response, "创建模板")
    
    if response.status_code == 201:
        return response.json().get("data", {}).get("template_id")
    return None

def test_list_templates(session_token):
    """测试获取模板列表"""
    print("5. 测试获取模板列表")
    
    headers = {"Authorization": f"Bearer {session_token}"}
    params = {
        "include_public": "true",
        "page": 1,
        "page_size": 10,
        "sort_by": "created_at",
        "sort_order": "desc"
    }
    
    response = requests.get(f"{BASE_URL}/api/templates", headers=headers, params=params)
    print_response(response, "获取模板列表")
    
    if response.status_code == 200:
        data = response.json().get("data", {})
        templates = data.get("templates", [])
        print(f"找到 {len(templates)} 个模板")
        for template in templates[:3]:  # 只显示前3个
            print(f"  - {template.get('name')} (ID: {template.get('template_id')})")
        return templates
    return []

def test_get_template(session_token, template_id):
    """测试获取模板详情"""
    print("6. 测试获取模板详情")
    
    headers = {"Authorization": f"Bearer {session_token}"}
    response = requests.get(f"{BASE_URL}/api/templates/{template_id}", headers=headers)
    print_response(response, "获取模板详情")
    
    return response.status_code == 200

def test_update_template(session_token, template_id):
    """测试更新模板"""
    print("7. 测试更新模板")
    
    payload = {
        "name": "更新后的模板名称",
        "description": "更新后的模板描述",
        "is_favorite": True
    }
    
    headers = {"Authorization": f"Bearer {session_token}", "Content-Type": "application/json"}
    response = requests.put(f"{BASE_URL}/api/templates/{template_id}", headers=headers, json=payload)
    print_response(response, "更新模板")
    
    return response.status_code == 200

def test_toggle_favorite(session_token, template_id):
    """测试切换收藏状态"""
    print("8. 测试切换收藏状态")
    
    headers = {"Authorization": f"Bearer {session_token}"}
    response = requests.post(f"{BASE_URL}/api/templates/{template_id}/favorite", headers=headers)
    print_response(response, "切换收藏状态")
    
    return response.status_code == 200

def test_use_template(session_token, template_id):
    """测试使用模板"""
    print("9. 测试使用模板")
    
    headers = {"Authorization": f"Bearer {session_token}"}
    response = requests.post(f"{BASE_URL}/api/templates/{template_id}/use", headers=headers)
    print_response(response, "使用模板")
    
    return response.status_code == 200

def test_get_categories(session_token):
    """测试获取分类列表"""
    print("10. 测试获取分类列表")
    
    headers = {"Authorization": f"Bearer {session_token}"}
    params = {"include_public": "true"}
    
    response = requests.get(f"{BASE_URL}/api/templates/categories", headers=headers, params=params)
    print_response(response, "获取分类列表")
    
    if response.status_code == 200:
        data = response.json().get("data", {})
        categories = data.get("categories", [])
        print(f"找到 {len(categories)} 个分类: {categories}")
        return categories
    return []

def test_get_popular_templates():
    """测试获取热门模板"""
    print("11. 测试获取热门模板")
    
    params = {"limit": 5, "days": 30}
    response = requests.get(f"{BASE_URL}/api/templates/popular", params=params)
    print_response(response, "获取热门模板")
    
    if response.status_code == 200:
        data = response.json().get("data", {})
        templates = data.get("templates", [])
        print(f"找到 {len(templates)} 个热门模板")
        for template in templates[:3]:  # 只显示前3个
            print(f"  - {template.get('name')} (查看: {template.get('view_count')}, 使用: {template.get('use_count')})")
        return templates
    return []

def test_user_logout(session_token):
    """测试用户登出"""
    print("12. 测试用户登出")
    
    headers = {"Authorization": f"Bearer {session_token}"}
    response = requests.post(f"{BASE_URL}/api/auth/logout", headers=headers)
    print_response(response, "用户登出")
    
    return response.status_code == 200

def test_update_profile(session_token):
    """测试更新用户资料"""
    print("13. 测试更新用户资料")
    
    payload = {
        "display_name": "更新后的显示名称",
        "email": "updated@example.com"
    }
    
    headers = {"Authorization": f"Bearer {session_token}", "Content-Type": "application/json"}
    response = requests.put(f"{BASE_URL}/api/auth/profile", headers=headers, json=payload)
    print_response(response, "更新用户资料")
    
    return response.status_code == 200

def test_change_password(session_token):
    """测试修改密码"""
    print("14. 测试修改密码")
    
    payload = {
        "old_password": "DemoPass123!",
        "new_password": "NewDemoPass456!"
    }
    
    headers = {"Authorization": f"Bearer {session_token}", "Content-Type": "application/json"}
    response = requests.post(f"{BASE_URL}/api/auth/change-password", headers=headers, json=payload)
    print_response(response, "修改密码")
    
    return response.status_code == 200

def main():
    """主函数"""
    print("=" * 60)
    print("ComfyUI 用户认证系统 API 使用示例")
    print("=" * 60)
    print(f"服务器地址: {BASE_URL}")
    print()
    
    try:
        # 测试服务器连接
        print("测试服务器连接...")
        try:
            response = requests.get(f"{BASE_URL}/", timeout=5)
            if response.status_code == 200:
                print("✓ 服务器连接成功")
            else:
                print(f"✗ 服务器返回状态码: {response.status_code}")
                print("请确保 ComfyUI 正在运行: python main.py --listen 0.0.0.0 --port 8188")
                return
        except requests.exceptions.ConnectionError:
            print("✗ 无法连接到服务器")
            print("请确保 ComfyUI 正在运行: python main.py --listen 0.0.0.0 --port 8188")
            return
        
        # 执行测试
        user_id = test_user_registration()
        
        if user_id:
            session_token, _ = test_user_login()
            
            if session_token:
                # 测试用户相关功能
                test_get_current_user(session_token)
                test_update_profile(session_token)
                
                # 测试模板相关功能
                template_id = test_create_template(session_token, user_id)
                
                if template_id:
                    test_list_templates(session_token)
                    test_get_template(session_token, template_id)
                    test_update_template(session_token, template_id)
                    test_toggle_favorite(session_token, template_id)
                    test_use_template(session_token, template_id)
                    test_get_categories(session_token)
                
                test_get_popular_templates()
                test_change_password(session_token)
                test_user_logout(session_token)
        
        print("=" * 60)
        print("API 测试完成")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n测试过程中发生错误: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
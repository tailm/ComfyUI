#!/usr/bin/env python3
"""
ComfyUI 基础集成测试脚本
测试服务器基本功能
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
    ]
    
    for method, endpoint, description in endpoints:
        url = f"{base_url}{endpoint}"
        try:
            if method == "GET":
                response = requests.get(url, timeout=5)
            
            print(f"  {description} ({method} {endpoint}): ", end="")
            if response.status_code < 400:
                print(f"✅ 状态码: {response.status_code}")
            else:
                print(f"❌ 状态码: {response.status_code}")
                
        except Exception as e:
            print(f"  {description} ({method} {endpoint}): ❌ 错误: {e}")
    
    print()

def test_frontend_pages(base_url):
    """测试前端页面可访问性"""
    print("🌐 测试前端页面...")
    
    pages = [
        ("/", "ComfyUI主界面"),
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
    print("ComfyUI 基础集成测试")
    print("=" * 60)
    print()
    
    # 获取基础URL
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = "http://localhost:8188"
    
    print(f"📡 测试服务器: {base_url}")
    print()
    
    # 测试API端点
    test_api_endpoints(base_url)
    
    # 测试前端页面
    test_frontend_pages(base_url)
    
    print("=" * 60)
    print("测试完成！")
    print("=" * 60)
    print()
    print("📋 访问链接:")
    print(f"  ComfyUI主界面: {base_url}/")
    print()

if __name__ == "__main__":
    main()
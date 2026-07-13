#!/usr/bin/env python3
"""
验证ComfyUI安装
检查基础组件是否正确安装和配置
"""

import os
import sys

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

def main():
    """主函数"""
    print("="*60)
    print("ComfyUI 安装验证 - 基础版本")
    print("="*60)
    print()
    
    # 添加当前目录到 Python 路径
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    
    # 检查文件结构
    print("1. 检查文件结构:")
    print("-"*40)
    
    files_to_check = [
        ("main.py", "主程序文件"),
        ("server/__init__.py", "服务器文件"),
        ("app/__init__.py", "应用模块"),
        ("requirements.txt", "依赖文件"),
        ("README.md", "说明文档"),
    ]
    
    file_checks = []
    for filepath, description in files_to_check:
        file_checks.append(check_file_exists(filepath, description))
    
    print()
    
    # 检查模块导入
    print("2. 检查模块导入:")
    print("-"*40)
    
    modules_to_check = [
        ("server", "服务器模块"),
        ("app", "应用模块"),
    ]
    
    module_checks = []
    for module_name, description in modules_to_check:
        module_checks.append(check_module_import(module_name, description))
    
    print()
    print("="*60)
    print("验证结果汇总:")
    print("="*60)
    
    total_checks = len(file_checks) + len(module_checks)
    passed_checks = sum(file_checks) + sum(module_checks)
    
    print(f"总检查项: {total_checks}")
    print(f"通过项: {passed_checks}")
    print(f"失败项: {total_checks - passed_checks}")
    print()
    
    if passed_checks == total_checks:
        print("✅ 所有检查通过！ComfyUI已正确安装。")
        print()
        print("下一步:")
        print("1. 启动 ComfyUI: python main.py")
        print("2. 访问 http://localhost:8188")
    else:
        print("❌ 部分检查失败，请修复上述问题。")
        print()
        print("常见问题:")
        print("1. 确保所有文件已正确创建")
        print("2. 检查 Python 导入路径")
        print("3. 安装依赖: pip install -r requirements.txt")
    
    print()
    print("="*60)

if __name__ == "__main__":
    main()
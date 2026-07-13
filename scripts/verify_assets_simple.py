#!/usr/bin/env python3
"""
简单验证资产管理系统是否启用
"""

import sys
import os
sys.path.insert(0, '.')

from comfy.cli_args import args

print("🔍 验证资产管理系统配置")
print("=" * 50)

# 检查命令行参数
print("1. 命令行参数检查:")
print(f"   • enable_assets: {args.enable_assets}")
print(f"   • database_url: {args.database_url}")
print(f"   • multi_user: {args.multi_user}")

# 检查数据库文件
db_path = "user/comfyui.db"
print(f"\n2. 数据库文件检查:")
if os.path.exists(db_path):
    print(f"   ✅ 数据库文件存在: {db_path}")
    print(f"   文件大小: {os.path.getsize(db_path)} 字节")
    
    import sqlite3
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 检查表
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = cursor.fetchall()
    print(f"   数据库表数量: {len(tables)}")
    
    # 检查数据
    for table in ['assets', 'asset_references', 'tags']:
        if table in [t[0] for t in tables]:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"   • {table}: {count} 行")
    
    conn.close()
else:
    print(f"   ❌ 数据库文件不存在: {db_path}")

# 检查资产扫描结果
print(f"\n3. 资产扫描目录检查:")
scan_dirs = ['models', 'input', 'output']
for dir_name in scan_dirs:
    dir_path = os.path.join('.', dir_name)
    if os.path.exists(dir_path):
        file_count = len([f for f in os.listdir(dir_path) if os.path.isfile(os.path.join(dir_path, f))])
        print(f"   • {dir_name}: {file_count} 个文件")
    else:
        print(f"   • {dir_name}: 目录不存在")

print("\n" + "=" * 50)
print("📋 验证结果总结:")

if args.enable_assets:
    print("✅ 资产管理系统已通过 --enable-assets 参数启用")
else:
    print("❌ 资产管理系统未启用，请使用 --enable-assets 参数启动")

if os.path.exists(db_path):
    print("✅ 数据库文件已创建")
else:
    print("❌ 数据库文件未创建")

print(f"\n🔧 建议启动命令:")
print("python main.py --enable-assets")
print("\n或者使用文件数据库:")
print("python main.py --enable-assets --database-url sqlite:///user/comfyui_assets.db")

print(f"\n🌐 访问地址:")
print("http://localhost:8188")
print("\n📁 资产API路径:")
print("/api/assets/ - 资产列表")
print("/api/assets/{id} - 资产详情")
print("/api/assets/tags - 标签列表")
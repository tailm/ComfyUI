#!/usr/bin/env python3
"""
用户目录初始化工具

用于为用户创建目录结构。
"""

import argparse
import json
import logging
import os
import sys
from datetime import datetime
from typing import Any, Dict, List

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def init_user_directory(user_id: str, dry_run: bool = False) -> Dict[str, Any]:
    """
    为单个用户初始化目录结构
    
    Args:
        user_id: 用户ID
        dry_run: 是否只检测不创建
        
    Returns:
        初始化结果字典
    """
    import folder_paths
    from folder_paths.user_directory import ensure_user_directories
    
    result = {
        'user_id': user_id,
        'dry_run': dry_run,
        'directories': {},
        'success': True,
        'errors': []
    }
    
    try:
        if dry_run:
            # 只列出将要创建的目录
            base_output = folder_paths.output_directory
            base_user = folder_paths.user_directory
            
            result['directories'] = {
                'output': os.path.join(base_output, f"user_{user_id}"),
                'data': os.path.join(base_user, f"user_{user_id}"),
            }
            logger.info(f"[DRY RUN] Would create directories for user {user_id}")
        else:
            # 实际创建目录
            directories = ensure_user_directories(user_id)
            result['directories'] = directories
            logger.info(f"Created directories for user {user_id}")
            
    except Exception as e:
        result['success'] = False
        result['errors'].append(str(e))
        logger.error(f"Failed to initialize directories for user {user_id}: {e}")
    
    return result


def init_all_user_directories(dry_run: bool = False) -> Dict[str, Any]:
    """
    为所有用户初始化目录结构
    
    Args:
        dry_run: 是否只检测不创建
        
    Returns:
        初始化结果字典
    """
    import folder_paths
    from app.database.db import create_session
    from app.database.user_models import User
    from sqlalchemy import select
    
    result = {
        'dry_run': dry_run,
        'users': [],
        'total_users': 0,
        'successful': 0,
        'failed': 0,
        'errors': []
    }
    
    try:
        # 从数据库获取所有用户
        with create_session() as session:
            stmt = select(User)
            users = session.execute(stmt).scalars().all()
            
            result['total_users'] = len(users)
            logger.info(f"Found {len(users)} users in database")
            
            for user in users:
                user_result = init_user_directory(user.id, dry_run)
                result['users'].append(user_result)
                
                if user_result['success']:
                    result['successful'] += 1
                else:
                    result['failed'] += 1
                    result['errors'].extend(user_result['errors'])
        
    except Exception as e:
        result['errors'].append(str(e))
        logger.error(f"Failed to initialize user directories: {e}")
    
    return result


def set_directory_permissions(user_id: str, mode: int = 0o755) -> Dict[str, Any]:
    """
    设置用户目录权限
    
    Args:
        user_id: 用户ID
        mode: 权限模式（八进制）
        
    Returns:
        结果字典
    """
    import folder_paths
    from folder_paths.user_directory import (
        get_user_output_directory,
        get_user_data_directory
    )
    
    result = {
        'user_id': user_id,
        'mode': oct(mode),
        'directories': [],
        'success': True,
        'errors': []
    }
    
    try:
        # 获取用户目录
        user_output = get_user_output_directory(user_id)
        user_data = get_user_data_directory(user_id)
        
        # 设置权限
        for root, dirs, files in os.walk(user_output):
            os.chmod(root, mode)
            for d in dirs:
                os.chmod(os.path.join(root, d), mode)
            for f in files:
                os.chmod(os.path.join(root, f), mode)
        
        for root, dirs, files in os.walk(user_data):
            os.chmod(root, mode)
            for d in dirs:
                os.chmod(os.path.join(root, d), mode)
            for f in files:
                os.chmod(os.path.join(root, f), mode)
        
        result['directories'] = [user_output, user_data]
        logger.info(f"Set permissions {oct(mode)} for user {user_id}")
        
    except Exception as e:
        result['success'] = False
        result['errors'].append(str(e))
        logger.error(f"Failed to set permissions for user {user_id}: {e}")
    
    return result


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description='初始化ComfyUI用户目录结构'
    )
    parser.add_argument(
        '--user-id',
        type=str,
        default=None,
        help='指定用户ID（不指定则为所有用户创建）'
    )
    parser.add_argument(
        '--all-users',
        action='store_true',
        help='为所有用户创建目录'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='只检测不创建（dry-run模式）'
    )
    parser.add_argument(
        '--set-permissions',
        type=str,
        default=None,
        help='设置目录权限（八进制，如755）'
    )
    parser.add_argument(
        '--output',
        type=str,
        default=None,
        help='报告输出路径（JSON格式）'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='显示详细输出'
    )
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    try:
        # 执行初始化
        if args.all_users or args.user_id is None:
            result = init_all_user_directories(args.dry_run)
        else:
            result = init_user_directory(args.user_id, args.dry_run)
        
        # 设置权限
        if args.set_permissions and not args.dry_run:
            mode = int(args.set_permissions, 8)
            if args.all_users or args.user_id is None:
                # 为所有用户设置权限
                for user_result in result.get('users', []):
                    if user_result['success']:
                        perm_result = set_directory_permissions(
                            user_result['user_id'], mode
                        )
                        user_result['permissions'] = perm_result
            else:
                perm_result = set_directory_permissions(args.user_id, mode)
                result['permissions'] = perm_result
        
        # 打印摘要
        print("\n" + "="*60)
        print("用户目录初始化报告")
        print("="*60)
        
        if args.dry_run:
            print("模式: DRY RUN (只检测不创建)")
        
        if 'users' in result:
            print(f"总用户数: {result['total_users']}")
            print(f"成功: {result['successful']}")
            print(f"失败: {result['failed']}")
            print("\n用户详情:")
            print("-"*60)
            for user_result in result['users']:
                status = "✓" if user_result['success'] else "✗"
                print(f"{status} 用户: {user_result['user_id']}")
                if user_result['directories']:
                    for name, path in user_result['directories'].items():
                        print(f"  - {name}: {path}")
        else:
            status = "✓" if result['success'] else "✗"
            print(f"{status} 用户: {result['user_id']}")
            if result['directories']:
                print("目录:")
                for name, path in result['directories'].items():
                    print(f"  - {name}: {path}")
        
        print("="*60 + "\n")
        
        # 保存报告
        if args.output:
            with open(args.output, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            logger.info(f"Report saved to: {args.output}")
        else:
            # 默认保存到当前目录
            default_output = f"init_user_dirs_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(default_output, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            logger.info(f"Report saved to: {default_output}")
        
        # 返回状态码
        if result.get('failed', 0) > 0 or not result.get('success', True):
            sys.exit(1)
        else:
            sys.exit(0)
            
    except Exception as e:
        logger.error(f"Initialization failed: {e}", exc_info=args.verbose)
        sys.exit(2)


if __name__ == '__main__':
    main()

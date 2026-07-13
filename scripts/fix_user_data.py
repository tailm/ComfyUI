#!/usr/bin/env python3
"""
数据修复脚本

用于修复数据库中未正确绑定user_id/owner_id的记录。
"""

import argparse
import json
import logging
import os
import sqlite3
import sys
from datetime import datetime
from typing import Any, Dict, List

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class DataFixer:
    """数据修复工具"""
    
    def __init__(self, db_path: str, default_user_id: str, dry_run: bool = True):
        """
        初始化修复工具
        
        Args:
            db_path: 数据库文件路径
            default_user_id: 默认用户ID（用于修复空记录）
            dry_run: 是否只检测不修复
        """
        self.db_path = db_path
        self.default_user_id = default_user_id
        self.dry_run = dry_run
        self.results: Dict[str, Any] = {
            'fix_time': datetime.utcnow().isoformat(),
            'database_path': db_path,
            'default_user_id': default_user_id,
            'dry_run': dry_run,
            'tables': {},
            'summary': {
                'total_fixed': 0,
                'total_failed': 0,
                'tables_fixed': 0
            }
        }
    
    def _connect(self) -> sqlite3.Connection:
        """连接数据库"""
        if not os.path.exists(self.db_path):
            raise FileNotFoundError(f"Database not found: {self.db_path}")
        
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def fix_history_table(self) -> Dict[str, Any]:
        """
        修复history表的user_id字段
        
        Returns:
            修复结果字典
        """
        logger.info("Fixing history table...")
        conn = self._connect()
        cursor = conn.cursor()
        
        try:
            # 检查表是否存在
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='history'
            """)
            if not cursor.fetchone():
                return {
                    'exists': False,
                    'message': 'history table does not exist'
                }
            
            # 查找需要修复的记录
            cursor.execute("""
                SELECT prompt_id, user_id, created_at
                FROM history
                WHERE user_id IS NULL OR user_id = '' OR user_id = 'NULL'
            """)
            
            problem_records = cursor.fetchall()
            fixed_records = []
            failed_records = []
            
            if not self.dry_run and problem_records:
                # 批量修复
                for record in problem_records:
                    try:
                        cursor.execute("""
                            UPDATE history 
                            SET user_id = ? 
                            WHERE prompt_id = ?
                        """, (self.default_user_id, record['prompt_id']))
                        
                        fixed_records.append({
                            'prompt_id': record['prompt_id'],
                            'old_user_id': record['user_id'],
                            'new_user_id': self.default_user_id,
                            'created_at': record['created_at']
                        })
                        
                    except Exception as e:
                        failed_records.append({
                            'prompt_id': record['prompt_id'],
                            'error': str(e)
                        })
                
                conn.commit()
                logger.info(f"Fixed {len(fixed_records)} records in history table")
            
            return {
                'exists': True,
                'problem_count': len(problem_records),
                'fixed_count': len(fixed_records),
                'failed_count': len(failed_records),
                'fixed_records': fixed_records,
                'failed_records': failed_records
            }
            
        finally:
            conn.close()
    
    def fix_asset_references_table(self) -> Dict[str, Any]:
        """
        修复asset_references表的owner_id字段
        
        Returns:
            修复结果字典
        """
        logger.info("Fixing asset_references table...")
        conn = self._connect()
        cursor = conn.cursor()
        
        try:
            # 检查表是否存在
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='asset_references'
            """)
            if not cursor.fetchone():
                return {
                    'exists': False,
                    'message': 'asset_references table does not exist'
                }
            
            # 查找需要修复的记录
            cursor.execute("""
                SELECT id, owner_id, name, created_at
                FROM asset_references
                WHERE owner_id IS NULL OR owner_id = '' OR owner_id = 'NULL'
            """)
            
            problem_records = cursor.fetchall()
            fixed_records = []
            failed_records = []
            
            if not self.dry_run and problem_records:
                # 批量修复
                for record in problem_records:
                    try:
                        cursor.execute("""
                            UPDATE asset_references 
                            SET owner_id = ? 
                            WHERE id = ?
                        """, (self.default_user_id, record['id']))
                        
                        fixed_records.append({
                            'id': record['id'],
                            'old_owner_id': record['owner_id'],
                            'new_owner_id': self.default_user_id,
                            'name': record['name'],
                            'created_at': record['created_at']
                        })
                        
                    except Exception as e:
                        failed_records.append({
                            'id': record['id'],
                            'error': str(e)
                        })
                
                conn.commit()
                logger.info(f"Fixed {len(fixed_records)} records in asset_references table")
            
            return {
                'exists': True,
                'problem_count': len(problem_records),
                'fixed_count': len(fixed_records),
                'failed_count': len(failed_records),
                'fixed_records': fixed_records,
                'failed_records': failed_records
            }
            
        finally:
            conn.close()
    
    def fix_workflows_table(self) -> Dict[str, Any]:
        """
        修复workflows表的user_id字段
        
        Returns:
            修复结果字典
        """
        logger.info("Fixing workflows table...")
        conn = self._connect()
        cursor = conn.cursor()
        
        try:
            # 检查表是否存在
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='workflows'
            """)
            if not cursor.fetchone():
                return {
                    'exists': False,
                    'message': 'workflows table does not exist'
                }
            
            # 查找需要修复的记录
            cursor.execute("""
                SELECT id, user_id, name, created_at
                FROM workflows
                WHERE user_id IS NULL OR user_id = '' OR user_id = 'NULL'
            """)
            
            problem_records = cursor.fetchall()
            fixed_records = []
            failed_records = []
            
            if not self.dry_run and problem_records:
                # 批量修复
                for record in problem_records:
                    try:
                        cursor.execute("""
                            UPDATE workflows 
                            SET user_id = ? 
                            WHERE id = ?
                        """, (self.default_user_id, record['id']))
                        
                        fixed_records.append({
                            'id': record['id'],
                            'old_user_id': record['user_id'],
                            'new_user_id': self.default_user_id,
                            'name': record['name'],
                            'created_at': record['created_at']
                        })
                        
                    except Exception as e:
                        failed_records.append({
                            'id': record['id'],
                            'error': str(e)
                        })
                
                conn.commit()
                logger.info(f"Fixed {len(fixed_records)} records in workflows table")
            
            return {
                'exists': True,
                'problem_count': len(problem_records),
                'fixed_count': len(fixed_records),
                'failed_count': len(failed_records),
                'fixed_records': fixed_records,
                'failed_records': failed_records
            }
            
        finally:
            conn.close()
    
    def fix_prompts_table(self) -> Dict[str, Any]:
        """
        修复prompts表的user_id字段
        
        Returns:
            修复结果字典
        """
        logger.info("Fixing prompts table...")
        conn = self._connect()
        cursor = conn.cursor()
        
        try:
            # 检查表是否存在
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='prompts'
            """)
            if not cursor.fetchone():
                return {
                    'exists': False,
                    'message': 'prompts table does not exist'
                }
            
            # 查找需要修复的记录
            cursor.execute("""
                SELECT id, user_id, workflow_id, created_at
                FROM prompts
                WHERE user_id IS NULL OR user_id = '' OR user_id = 'NULL'
            """)
            
            problem_records = cursor.fetchall()
            fixed_records = []
            failed_records = []
            
            if not self.dry_run and problem_records:
                # 批量修复
                for record in problem_records:
                    try:
                        cursor.execute("""
                            UPDATE prompts 
                            SET user_id = ? 
                            WHERE id = ?
                        """, (self.default_user_id, record['id']))
                        
                        fixed_records.append({
                            'id': record['id'],
                            'old_user_id': record['user_id'],
                            'new_user_id': self.default_user_id,
                            'workflow_id': record['workflow_id'],
                            'created_at': record['created_at']
                        })
                        
                    except Exception as e:
                        failed_records.append({
                            'id': record['id'],
                            'error': str(e)
                        })
                
                conn.commit()
                logger.info(f"Fixed {len(fixed_records)} records in prompts table")
            
            return {
                'exists': True,
                'problem_count': len(problem_records),
                'fixed_count': len(fixed_records),
                'failed_count': len(failed_records),
                'fixed_records': fixed_records,
                'failed_records': failed_records
            }
            
        finally:
            conn.close()
    
    def fix_node_io_table(self) -> Dict[str, Any]:
        """
        修复node_io表的user_id字段
        
        Returns:
            修复结果字典
        """
        logger.info("Fixing node_io table...")
        conn = self._connect()
        cursor = conn.cursor()
        
        try:
            # 检查表是否存在
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='node_io'
            """)
            if not cursor.fetchone():
                return {
                    'exists': False,
                    'message': 'node_io table does not exist'
                }
            
            # 查找需要修复的记录
            cursor.execute("""
                SELECT id, user_id, prompt_id, node_id, created_at
                FROM node_io
                WHERE user_id IS NULL OR user_id = '' OR user_id = 'NULL'
            """)
            
            problem_records = cursor.fetchall()
            fixed_records = []
            failed_records = []
            
            if not self.dry_run and problem_records:
                # 批量修复
                for record in problem_records:
                    try:
                        cursor.execute("""
                            UPDATE node_io 
                            SET user_id = ? 
                            WHERE id = ?
                        """, (self.default_user_id, record['id']))
                        
                        fixed_records.append({
                            'id': record['id'],
                            'old_user_id': record['user_id'],
                            'new_user_id': self.default_user_id,
                            'prompt_id': record['prompt_id'],
                            'node_id': record['node_id'],
                            'created_at': record['created_at']
                        })
                        
                    except Exception as e:
                        failed_records.append({
                            'id': record['id'],
                            'error': str(e)
                        })
                
                conn.commit()
                logger.info(f"Fixed {len(fixed_records)} records in node_io table")
            
            return {
                'exists': True,
                'problem_count': len(problem_records),
                'fixed_count': len(fixed_records),
                'failed_count': len(failed_records),
                'fixed_records': fixed_records,
                'failed_records': failed_records
            }
            
        finally:
            conn.close()
    
    def run_fix(self) -> Dict[str, Any]:
        """
        运行完整修复
        
        Returns:
            完整修复结果
        """
        mode = "DRY RUN" if self.dry_run else "LIVE"
        logger.info(f"Starting data fix ({mode}) for: {self.db_path}")
        logger.info(f"Default user ID: {self.default_user_id}")
        
        # 修复各个表
        self.results['tables']['history'] = self.fix_history_table()
        self.results['tables']['asset_references'] = self.fix_asset_references_table()
        self.results['tables']['workflows'] = self.fix_workflows_table()
        self.results['tables']['prompts'] = self.fix_prompts_table()
        self.results['tables']['node_io'] = self.fix_node_io_table()
        
        # 计算汇总统计
        total_fixed = 0
        total_failed = 0
        tables_fixed = 0
        
        for table_name, table_result in self.results['tables'].items():
            if table_result.get('exists', False):
                fixed_count = table_result.get('fixed_count', 0)
                failed_count = table_result.get('failed_count', 0)
                total_fixed += fixed_count
                total_failed += failed_count
                if fixed_count > 0:
                    tables_fixed += 1
        
        self.results['summary']['total_fixed'] = total_fixed
        self.results['summary']['total_failed'] = total_failed
        self.results['summary']['tables_fixed'] = tables_fixed
        
        logger.info(f"Fix complete. Fixed {total_fixed} records, failed {total_failed} records.")
        
        return self.results
    
    def save_report(self, output_path: str) -> None:
        """
        保存修复报告到文件
        
        Args:
            output_path: 输出文件路径
        """
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        logger.info(f"Report saved to: {output_path}")
    
    def print_summary(self) -> None:
        """打印修复摘要"""
        mode = "DRY RUN" if self.dry_run else "LIVE"
        print("\n" + "="*60)
        print(f"数据修复报告摘要 ({mode})")
        print("="*60)
        print(f"修复时间: {self.results['fix_time']}")
        print(f"数据库路径: {self.results['database_path']}")
        print(f"默认用户ID: {self.results['default_user_id']}")
        print(f"\n总修复数: {self.results['summary']['total_fixed']}")
        print(f"总失败数: {self.results['summary']['total_failed']}")
        print(f"修复的表数: {self.results['summary']['tables_fixed']}")
        print("\n各表详情:")
        print("-"*60)
        
        for table_name, table_result in self.results['tables'].items():
            if not table_result.get('exists', False):
                print(f"{table_name}: 表不存在")
                continue
            
            problems = table_result.get('problem_count', 0)
            fixed = table_result.get('fixed_count', 0)
            failed = table_result.get('failed_count', 0)
            
            if problems == 0:
                print(f"{table_name}: ✓ 无需修复")
            else:
                status = "✓" if failed == 0 else "✗"
                print(f"{table_name}: {status} 问题数: {problems}, 修复: {fixed}, 失败: {failed}")
        
        print("="*60 + "\n")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description='修复ComfyUI数据库中的用户数据隔离问题'
    )
    parser.add_argument(
        '--db-path',
        type=str,
        required=True,
        help='数据库文件路径'
    )
    parser.add_argument(
        '--default-user-id',
        type=str,
        required=True,
        help='默认用户ID（用于修复空记录）'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='只检测不修复（dry-run模式）'
    )
    parser.add_argument(
        '--output',
        type=str,
        default=None,
        help='修复报告输出路径（JSON格式）'
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
        # 运行修复
        fixer = DataFixer(
            args.db_path,
            args.default_user_id,
            dry_run=args.dry_run
        )
        results = fixer.run_fix()
        
        # 打印摘要
        fixer.print_summary()
        
        # 保存报告
        if args.output:
            fixer.save_report(args.output)
        else:
            # 默认保存到当前目录
            mode = "dryrun" if args.dry_run else "live"
            default_output = f"fix_report_{mode}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            fixer.save_report(default_output)
        
        # 返回状态码
        if results['summary']['total_failed'] > 0:
            sys.exit(1)  # 有失败
        else:
            sys.exit(0)  # 全部成功
            
    except Exception as e:
        logger.error(f"Fix failed: {e}", exc_info=args.verbose)
        sys.exit(2)


if __name__ == '__main__':
    main()

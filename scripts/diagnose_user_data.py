#!/usr/bin/env python3
"""
数据诊断脚本

用于检测数据库中未正确绑定user_id/owner_id的记录，生成诊断报告。
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


class DataDiagnostic:
    """数据诊断工具"""
    
    def __init__(self, db_path: str):
        """
        初始化诊断工具
        
        Args:
            db_path: 数据库文件路径
        """
        self.db_path = db_path
        self.results: Dict[str, Any] = {
            'diagnostic_time': datetime.utcnow().isoformat(),
            'database_path': db_path,
            'tables': {},
            'summary': {
                'total_issues': 0,
                'tables_with_issues': 0
            }
        }
    
    def _connect(self) -> sqlite3.Connection:
        """连接数据库"""
        if not os.path.exists(self.db_path):
            raise FileNotFoundError(f"Database not found: {self.db_path}")
        
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def check_history_table(self) -> Dict[str, Any]:
        """
        检查history表的user_id字段
        
        Returns:
            检查结果字典
        """
        logger.info("Checking history table...")
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
            
            # 检查user_id为空或NULL的记录
            cursor.execute("""
                SELECT prompt_id, user_id, prompt, created_at
                FROM history
                WHERE user_id IS NULL OR user_id = '' OR user_id = 'NULL'
                ORDER BY created_at DESC
            """)
            
            problem_records = []
            for row in cursor.fetchall():
                problem_records.append({
                    'prompt_id': row['prompt_id'],
                    'user_id': row['user_id'],
                    'created_at': row['created_at'],
                    'prompt_preview': str(row['prompt'])[:100] if row['prompt'] else None
                })
            
            # 统计总数
            cursor.execute("SELECT COUNT(*) as count FROM history")
            total_count = cursor.fetchone()['count']
            
            return {
                'exists': True,
                'total_records': total_count,
                'problem_count': len(problem_records),
                'problem_records': problem_records
            }
            
        finally:
            conn.close()
    
    def check_asset_references_table(self) -> Dict[str, Any]:
        """
        检查asset_references表的owner_id字段
        
        Returns:
            检查结果字典
        """
        logger.info("Checking asset_references table...")
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
            
            # 检查owner_id为空或NULL的记录
            cursor.execute("""
                SELECT id, owner_id, name, created_at
                FROM asset_references
                WHERE owner_id IS NULL OR owner_id = '' OR owner_id = 'NULL'
                ORDER BY created_at DESC
            """)
            
            problem_records = []
            for row in cursor.fetchall():
                problem_records.append({
                    'id': row['id'],
                    'owner_id': row['owner_id'],
                    'name': row['name'],
                    'created_at': row['created_at']
                })
            
            # 统计总数
            cursor.execute("SELECT COUNT(*) as count FROM asset_references")
            total_count = cursor.fetchone()['count']
            
            return {
                'exists': True,
                'total_records': total_count,
                'problem_count': len(problem_records),
                'problem_records': problem_records
            }
            
        finally:
            conn.close()
    
    def check_workflows_table(self) -> Dict[str, Any]:
        """
        检查workflows表的user_id字段
        
        Returns:
            检查结果字典
        """
        logger.info("Checking workflows table...")
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
            
            # 检查user_id为空或NULL的记录
            cursor.execute("""
                SELECT id, user_id, name, created_at
                FROM workflows
                WHERE user_id IS NULL OR user_id = '' OR user_id = 'NULL'
                ORDER BY created_at DESC
            """)
            
            problem_records = []
            for row in cursor.fetchall():
                problem_records.append({
                    'id': row['id'],
                    'user_id': row['user_id'],
                    'name': row['name'],
                    'created_at': row['created_at']
                })
            
            # 统计总数
            cursor.execute("SELECT COUNT(*) as count FROM workflows")
            total_count = cursor.fetchone()['count']
            
            return {
                'exists': True,
                'total_records': total_count,
                'problem_count': len(problem_records),
                'problem_records': problem_records
            }
            
        finally:
            conn.close()
    
    def check_prompts_table(self) -> Dict[str, Any]:
        """
        检查prompts表的user_id字段
        
        Returns:
            检查结果字典
        """
        logger.info("Checking prompts table...")
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
            
            # 检查user_id为空或NULL的记录
            cursor.execute("""
                SELECT id, user_id, workflow_id, created_at
                FROM prompts
                WHERE user_id IS NULL OR user_id = '' OR user_id = 'NULL'
                ORDER BY created_at DESC
            """)
            
            problem_records = []
            for row in cursor.fetchall():
                problem_records.append({
                    'id': row['id'],
                    'user_id': row['user_id'],
                    'workflow_id': row['workflow_id'],
                    'created_at': row['created_at']
                })
            
            # 统计总数
            cursor.execute("SELECT COUNT(*) as count FROM prompts")
            total_count = cursor.fetchone()['count']
            
            return {
                'exists': True,
                'total_records': total_count,
                'problem_count': len(problem_records),
                'problem_records': problem_records
            }
            
        finally:
            conn.close()
    
    def check_node_io_table(self) -> Dict[str, Any]:
        """
        检查node_io表的user_id字段
        
        Returns:
            检查结果字典
        """
        logger.info("Checking node_io table...")
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
            
            # 检查user_id为空或NULL的记录
            cursor.execute("""
                SELECT id, user_id, prompt_id, node_id, created_at
                FROM node_io
                WHERE user_id IS NULL OR user_id = '' OR user_id = 'NULL'
                ORDER BY created_at DESC
            """)
            
            problem_records = []
            for row in cursor.fetchall():
                problem_records.append({
                    'id': row['id'],
                    'user_id': row['user_id'],
                    'prompt_id': row['prompt_id'],
                    'node_id': row['node_id'],
                    'created_at': row['created_at']
                })
            
            # 统计总数
            cursor.execute("SELECT COUNT(*) as count FROM node_io")
            total_count = cursor.fetchone()['count']
            
            return {
                'exists': True,
                'total_records': total_count,
                'problem_count': len(problem_records),
                'problem_records': problem_records
            }
            
        finally:
            conn.close()
    
    def run_diagnostic(self) -> Dict[str, Any]:
        """
        运行完整诊断
        
        Returns:
            完整诊断结果
        """
        logger.info(f"Starting data diagnostic for: {self.db_path}")
        
        # 检查各个表
        self.results['tables']['history'] = self.check_history_table()
        self.results['tables']['asset_references'] = self.check_asset_references_table()
        self.results['tables']['workflows'] = self.check_workflows_table()
        self.results['tables']['prompts'] = self.check_prompts_table()
        self.results['tables']['node_io'] = self.check_node_io_table()
        
        # 计算汇总统计
        total_issues = 0
        tables_with_issues = 0
        
        for table_name, table_result in self.results['tables'].items():
            if table_result.get('exists', False):
                problem_count = table_result.get('problem_count', 0)
                total_issues += problem_count
                if problem_count > 0:
                    tables_with_issues += 1
        
        self.results['summary']['total_issues'] = total_issues
        self.results['summary']['tables_with_issues'] = tables_with_issues
        
        logger.info(f"Diagnostic complete. Found {total_issues} issues in {tables_with_issues} tables.")
        
        return self.results
    
    def save_report(self, output_path: str) -> None:
        """
        保存诊断报告到文件
        
        Args:
            output_path: 输出文件路径
        """
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        logger.info(f"Report saved to: {output_path}")
    
    def print_summary(self) -> None:
        """打印诊断摘要"""
        print("\n" + "="*60)
        print("数据诊断报告摘要")
        print("="*60)
        print(f"诊断时间: {self.results['diagnostic_time']}")
        print(f"数据库路径: {self.results['database_path']}")
        print(f"\n总问题数: {self.results['summary']['total_issues']}")
        print(f"有问题的表数: {self.results['summary']['tables_with_issues']}")
        print("\n各表详情:")
        print("-"*60)
        
        for table_name, table_result in self.results['tables'].items():
            if not table_result.get('exists', False):
                print(f"{table_name}: 表不存在")
                continue
            
            total = table_result.get('total_records', 0)
            problems = table_result.get('problem_count', 0)
            
            if problems == 0:
                print(f"{table_name}: ✓ 正常 (总记录数: {total})")
            else:
                print(f"{table_name}: ✗ 发现问题 (总记录数: {total}, 问题数: {problems})")
        
        print("="*60 + "\n")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description='诊断ComfyUI数据库中的用户数据隔离问题'
    )
    parser.add_argument(
        '--db-path',
        type=str,
        required=True,
        help='数据库文件路径'
    )
    parser.add_argument(
        '--output',
        type=str,
        default=None,
        help='诊断报告输出路径（JSON格式）'
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
        # 运行诊断
        diagnostic = DataDiagnostic(args.db_path)
        results = diagnostic.run_diagnostic()
        
        # 打印摘要
        diagnostic.print_summary()
        
        # 保存报告
        if args.output:
            diagnostic.save_report(args.output)
        else:
            # 默认保存到当前目录
            default_output = f"diagnostic_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            diagnostic.save_report(default_output)
        
        # 返回状态码
        if results['summary']['total_issues'] > 0:
            sys.exit(1)  # 发现问题
        else:
            sys.exit(0)  # 无问题
            
    except Exception as e:
        logger.error(f"Diagnostic failed: {e}", exc_info=args.verbose)
        sys.exit(2)


if __name__ == '__main__':
    main()

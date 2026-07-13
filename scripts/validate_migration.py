#!/usr/bin/env python3
"""
数据验证脚本

用于验证数据迁移后的完整性和正确性。
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


class MigrationValidator:
    """数据迁移验证工具"""
    
    def __init__(self, db_path: str):
        """
        初始化验证工具
        
        Args:
            db_path: 数据库文件路径
        """
        self.db_path = db_path
        self.results: Dict[str, Any] = {
            'validation_time': datetime.utcnow().isoformat(),
            'database_path': db_path,
            'checks': {},
            'summary': {
                'total_checks': 0,
                'passed_checks': 0,
                'failed_checks': 0,
                'warnings': 0
            }
        }
    
    def _connect(self) -> sqlite3.Connection:
        """连接数据库"""
        if not os.path.exists(self.db_path):
            raise FileNotFoundError(f"Database not found: {self.db_path}")
        
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def check_user_id_completeness(self) -> Dict[str, Any]:
        """
        检查所有表的user_id/owner_id字段无空值
        
        Returns:
            检查结果字典
        """
        logger.info("Checking user_id/owner_id completeness...")
        conn = self._connect()
        cursor = conn.cursor()
        
        try:
            issues = []
            
            # 检查history表
            cursor.execute("""
                SELECT COUNT(*) as count FROM history
                WHERE user_id IS NULL OR user_id = '' OR user_id = 'NULL'
            """)
            count = cursor.fetchone()['count']
            if count > 0:
                issues.append(f"history表有{count}条记录user_id为空")
            
            # 检查asset_references表
            cursor.execute("""
                SELECT COUNT(*) as count FROM asset_references
                WHERE owner_id IS NULL OR owner_id = '' OR owner_id = 'NULL'
            """)
            count = cursor.fetchone()['count']
            if count > 0:
                issues.append(f"asset_references表有{count}条记录owner_id为空")
            
            # 检查workflows表
            cursor.execute("""
                SELECT COUNT(*) as count FROM workflows
                WHERE user_id IS NULL OR user_id = '' OR user_id = 'NULL'
            """)
            count = cursor.fetchone()['count']
            if count > 0:
                issues.append(f"workflows表有{count}条记录user_id为空")
            
            # 检查prompts表
            cursor.execute("""
                SELECT COUNT(*) as count FROM prompts
                WHERE user_id IS NULL OR user_id = '' OR user_id = 'NULL'
            """)
            count = cursor.fetchone()['count']
            if count > 0:
                issues.append(f"prompts表有{count}条记录user_id为空")
            
            # 检查node_io表
            cursor.execute("""
                SELECT COUNT(*) as count FROM node_io
                WHERE user_id IS NULL OR user_id = '' OR user_id = 'NULL'
            """)
            count = cursor.fetchone()['count']
            if count > 0:
                issues.append(f"node_io表有{count}条记录user_id为空")
            
            passed = len(issues) == 0
            
            return {
                'name': 'user_id_completeness',
                'passed': passed,
                'issues': issues,
                'message': '所有表的user_id/owner_id字段完整' if passed else f'发现{len(issues)}个问题'
            }
            
        finally:
            conn.close()
    
    def check_foreign_key_integrity(self) -> Dict[str, Any]:
        """
        检查外键关联完整性
        
        Returns:
            检查结果字典
        """
        logger.info("Checking foreign key integrity...")
        conn = self._connect()
        cursor = conn.cursor()
        
        try:
            issues = []
            
            # 检查prompts表的workflow_id外键
            cursor.execute("""
                SELECT COUNT(*) as count FROM prompts p
                WHERE p.workflow_id IS NOT NULL 
                AND NOT EXISTS (
                    SELECT 1 FROM workflows w WHERE w.id = p.workflow_id
                )
            """)
            count = cursor.fetchone()['count']
            if count > 0:
                issues.append(f"prompts表有{count}条记录的workflow_id指向不存在的工作流")
            
            # 检查node_io表的prompt_id外键
            cursor.execute("""
                SELECT COUNT(*) as count FROM node_io n
                WHERE NOT EXISTS (
                    SELECT 1 FROM prompts p WHERE p.id = n.prompt_id
                )
            """)
            count = cursor.fetchone()['count']
            if count > 0:
                issues.append(f"node_io表有{count}条记录的prompt_id指向不存在的提示")
            
            # 检查asset_references表的asset_id外键
            cursor.execute("""
                SELECT COUNT(*) as count FROM asset_references ar
                WHERE NOT EXISTS (
                    SELECT 1 FROM assets a WHERE a.id = ar.asset_id
                )
            """)
            count = cursor.fetchone()['count']
            if count > 0:
                issues.append(f"asset_references表有{count}条记录的asset_id指向不存在的资产")
            
            passed = len(issues) == 0
            
            return {
                'name': 'foreign_key_integrity',
                'passed': passed,
                'issues': issues,
                'message': '外键关联完整' if passed else f'发现{len(issues)}个问题'
            }
            
        finally:
            conn.close()
    
    def check_indexes_created(self) -> Dict[str, Any]:
        """
        检查索引创建成功
        
        Returns:
            检查结果字典
        """
        logger.info("Checking indexes...")
        conn = self._connect()
        cursor = conn.cursor()
        
        try:
            issues = []
            warnings = []
            
            # 获取所有索引
            cursor.execute("""
                SELECT name, tbl_name FROM sqlite_master 
                WHERE type='index' AND sql IS NOT NULL
            """)
            indexes = {row['name']: row['tbl_name'] for row in cursor.fetchall()}
            
            # 检查关键索引是否存在
            required_indexes = {
                'ix_workflows_user_id': 'workflows',
                'ix_prompts_user_id': 'prompts',
                'ix_node_io_user_id': 'node_io',
                'ix_asset_references_owner_id': 'asset_references',
            }
            
            for index_name, table_name in required_indexes.items():
                if index_name not in indexes:
                    issues.append(f"缺少索引: {index_name} (表: {table_name})")
                elif indexes[index_name] != table_name:
                    warnings.append(f"索引{index_name}不在预期的表{table_name}上")
            
            passed = len(issues) == 0
            
            return {
                'name': 'indexes_created',
                'passed': passed,
                'issues': issues,
                'warnings': warnings,
                'message': '所有关键索引已创建' if passed else f'发现{len(issues)}个问题'
            }
            
        finally:
            conn.close()
    
    def check_user_data_consistency(self) -> Dict[str, Any]:
        """
        检查用户数据一致性
        
        Returns:
            检查结果字典
        """
        logger.info("Checking user data consistency...")
        conn = self._connect()
        cursor = conn.cursor()
        
        try:
            issues = []
            warnings = []
            
            # 检查prompts和workflows的user_id一致性
            cursor.execute("""
                SELECT COUNT(*) as count FROM prompts p
                JOIN workflows w ON p.workflow_id = w.id
                WHERE p.user_id != w.user_id
            """)
            count = cursor.fetchone()['count']
            if count > 0:
                issues.append(f"有{count}条prompt记录的user_id与其关联的workflow不一致")
            
            # 检查node_io和prompts的user_id一致性
            cursor.execute("""
                SELECT COUNT(*) as count FROM node_io n
                JOIN prompts p ON n.prompt_id = p.id
                WHERE n.user_id != p.user_id
            """)
            count = cursor.fetchone()['count']
            if count > 0:
                issues.append(f"有{count}条node_io记录的user_id与其关联的prompt不一致")
            
            # 检查是否存在孤立数据（user_id不存在于users表）
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='users'
            """)
            if cursor.fetchone():
                # 检查history表
                cursor.execute("""
                    SELECT COUNT(*) as count FROM history h
                    WHERE NOT EXISTS (
                        SELECT 1 FROM users u WHERE u.user_id = h.user_id
                    )
                """)
                count = cursor.fetchone()['count']
                if count > 0:
                    warnings.append(f"history表有{count}条记录的user_id不存在于users表")
                
                # 检查workflows表
                cursor.execute("""
                    SELECT COUNT(*) as count FROM workflows w
                    WHERE NOT EXISTS (
                        SELECT 1 FROM users u WHERE u.user_id = w.user_id
                    )
                """)
                count = cursor.fetchone()['count']
                if count > 0:
                    warnings.append(f"workflows表有{count}条记录的user_id不存在于users表")
            
            passed = len(issues) == 0
            
            return {
                'name': 'user_data_consistency',
                'passed': passed,
                'issues': issues,
                'warnings': warnings,
                'message': '用户数据一致' if passed else f'发现{len(issues)}个问题'
            }
            
        finally:
            conn.close()
    
    def check_data_statistics(self) -> Dict[str, Any]:
        """
        检查数据统计信息
        
        Returns:
            检查结果字典
        """
        logger.info("Checking data statistics...")
        conn = self._connect()
        cursor = conn.cursor()
        
        try:
            stats = {}
            
            # 统计各表记录数
            tables = ['history', 'workflows', 'prompts', 'node_io', 'asset_references', 'assets']
            for table in tables:
                cursor.execute(f"SELECT COUNT(*) as count FROM {table}")
                stats[f"{table}_count"] = cursor.fetchone()['count']
            
            # 统计用户数
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='users'
            """)
            if cursor.fetchone():
                cursor.execute("SELECT COUNT(*) as count FROM users")
                stats['users_count'] = cursor.fetchone()['count']
            
            # 统计每个用户的记录数
            cursor.execute("""
                SELECT user_id, COUNT(*) as count 
                FROM workflows 
                GROUP BY user_id
                ORDER BY count DESC
                LIMIT 10
            """)
            stats['top_users_by_workflows'] = [
                {'user_id': row['user_id'], 'count': row['count']}
                for row in cursor.fetchall()
            ]
            
            return {
                'name': 'data_statistics',
                'passed': True,
                'statistics': stats,
                'message': '数据统计信息已收集'
            }
            
        finally:
            conn.close()
    
    def run_validation(self) -> Dict[str, Any]:
        """
        运行完整验证
        
        Returns:
            完整验证结果
        """
        logger.info(f"Starting validation for: {self.db_path}")
        
        # 运行各项检查
        self.results['checks']['user_id_completeness'] = self.check_user_id_completeness()
        self.results['checks']['foreign_key_integrity'] = self.check_foreign_key_integrity()
        self.results['checks']['indexes_created'] = self.check_indexes_created()
        self.results['checks']['user_data_consistency'] = self.check_user_data_consistency()
        self.results['checks']['data_statistics'] = self.check_data_statistics()
        
        # 计算汇总统计
        total_checks = len(self.results['checks'])
        passed_checks = sum(1 for c in self.results['checks'].values() if c.get('passed', False))
        failed_checks = total_checks - passed_checks
        warnings = sum(len(c.get('warnings', [])) for c in self.results['checks'].values())
        
        self.results['summary']['total_checks'] = total_checks
        self.results['summary']['passed_checks'] = passed_checks
        self.results['summary']['failed_checks'] = failed_checks
        self.results['summary']['warnings'] = warnings
        
        logger.info(f"Validation complete. Passed: {passed_checks}/{total_checks}, Warnings: {warnings}")
        
        return self.results
    
    def save_report(self, output_path: str) -> None:
        """
        保存验证报告到文件
        
        Args:
            output_path: 输出文件路径
        """
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        logger.info(f"Report saved to: {output_path}")
    
    def print_summary(self) -> None:
        """打印验证摘要"""
        print("\n" + "="*60)
        print("数据迁移验证报告")
        print("="*60)
        print(f"验证时间: {self.results['validation_time']}")
        print(f"数据库路径: {self.results['database_path']}")
        print(f"\n总检查项: {self.results['summary']['total_checks']}")
        print(f"通过: {self.results['summary']['passed_checks']}")
        print(f"失败: {self.results['summary']['failed_checks']}")
        print(f"警告: {self.results['summary']['warnings']}")
        print("\n检查详情:")
        print("-"*60)
        
        for check_name, check_result in self.results['checks'].items():
            status = "✓" if check_result.get('passed', False) else "✗"
            print(f"{status} {check_result['name']}: {check_result['message']}")
            
            # 显示问题
            if check_result.get('issues'):
                for issue in check_result['issues']:
                    print(f"  - {issue}")
            
            # 显示警告
            if check_result.get('warnings'):
                for warning in check_result['warnings']:
                    print(f"  ⚠ {warning}")
        
        # 显示统计信息
        if 'data_statistics' in self.results['checks']:
            stats = self.results['checks']['data_statistics'].get('statistics', {})
            print("\n数据统计:")
            print("-"*60)
            for key, value in stats.items():
                if key != 'top_users_by_workflows':
                    print(f"{key}: {value}")
        
        print("="*60 + "\n")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description='验证ComfyUI数据迁移的完整性和正确性'
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
        help='验证报告输出路径（JSON格式）'
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
        # 运行验证
        validator = MigrationValidator(args.db_path)
        results = validator.run_validation()
        
        # 打印摘要
        validator.print_summary()
        
        # 保存报告
        if args.output:
            validator.save_report(args.output)
        else:
            # 默认保存到当前目录
            default_output = f"validation_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            validator.save_report(default_output)
        
        # 返回状态码
        if results['summary']['failed_checks'] > 0:
            sys.exit(1)  # 有失败
        else:
            sys.exit(0)  # 全部通过
            
    except Exception as e:
        logger.error(f"Validation failed: {e}", exc_info=args.verbose)
        sys.exit(2)


if __name__ == '__main__':
    main()

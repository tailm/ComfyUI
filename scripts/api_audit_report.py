#!/usr/bin/env python3
"""
API接口审查工具

用于审查所有API接口，检查是否正确实现了用户数据隔离。
"""

import argparse
import json
import logging
import os
import re
import sys
from datetime import datetime
from typing import Any, Dict, List

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class APIAuditor:
    """API接口审查工具"""
    
    def __init__(self):
        self.results = {
            'audit_time': datetime.utcnow().isoformat(),
            'files_scanned': 0,
            'apis_found': 0,
            'issues': [],
            'summary': {
                'total_apis': 0,
                'apis_with_user_check': 0,
                'apis_without_user_check': 0,
                'apis_using_service': 0,
                'apis_direct_db_access': 0,
            }
        }
    
    def scan_file(self, file_path: str) -> Dict[str, Any]:
        """
        扫描单个文件中的API定义
        
        Args:
            file_path: 文件路径
            
        Returns:
            扫描结果字典
        """
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        result = {
            'file_path': file_path,
            'apis': [],
            'issues': []
        }
        
        # 查找路由定义
        # 匹配 @routes.get, @routes.post, @routes.put, @routes.delete 等
        route_pattern = r'@(routes|app)\.(get|post|put|delete|patch)\(["\']([^"\']+)["\']\)'
        
        for match in re.finditer(route_pattern, content):
            route_type = match.group(2)
            route_path = match.group(3)
            
            # 获取路由函数名
            # 查找下一个 async def 或 def
            func_start = match.end()
            func_match = re.search(
                r'(async\s+)?def\s+(\w+)\s*\(',
                content[func_start:func_start+200]
            )
            
            if func_match:
                func_name = func_match.group(2)
            else:
                func_name = 'unknown'
            
            api_info = {
                'type': route_type,
                'path': route_path,
                'function': func_name,
                'line': content[:match.start()].count('\n') + 1,
                'has_user_check': False,
                'uses_service': False,
                'direct_db_access': False,
            }
            
            # 检查函数体
            # 获取函数体内容（简化处理，取接下来的1000个字符）
            func_body_start = match.start()
            func_body = content[func_body_start:func_body_start+2000]
            
            # 检查是否有user_id获取
            user_check_patterns = [
                r'request\.headers\.get\(["\']comfy-user["\']',
                r'request\.get\(["\']user_id["\']',
                r'user_id\s*=',
            ]
            
            for pattern in user_check_patterns:
                if re.search(pattern, func_body):
                    api_info['has_user_check'] = True
                    break
            
            # 检查是否使用Service层
            service_patterns = [
                r'Service\(',
                r'service\s*=',
                r'\.get_.*_service\(',
            ]
            
            for pattern in service_patterns:
                if re.search(pattern, func_body):
                    api_info['uses_service'] = True
                    break
            
            # 检查是否有直接数据库访问
            db_patterns = [
                r'session\.execute\(',
                r'session\.query\(',
                r'select\(',
                r'\.filter\(',
            ]
            
            for pattern in db_patterns:
                if re.search(pattern, func_body):
                    api_info['direct_db_access'] = True
                    break
            
            result['apis'].append(api_info)
            
            # 记录问题
            if not api_info['has_user_check']:
                result['issues'].append({
                    'type': 'missing_user_check',
                    'api': f"{route_type} {route_path}",
                    'function': func_name,
                    'line': api_info['line'],
                    'message': 'API未检查user_id'
                })
            
            if api_info['direct_db_access'] and not api_info['uses_service']:
                result['issues'].append({
                    'type': 'direct_db_access',
                    'api': f"{route_type} {route_path}",
                    'function': func_name,
                    'line': api_info['line'],
                    'message': 'API直接访问数据库，未使用Service层'
                })
        
        return result
    
    def scan_directory(self, directory: str) -> None:
        """
        扫描目录中的所有Python文件
        
        Args:
            directory: 目录路径
        """
        for root, dirs, files in os.walk(directory):
            # 跳过虚拟环境和缓存目录
            if '.venv' in root or '__pycache__' in root or '.git' in root:
                continue
            
            for file in files:
                if file.endswith('.py'):
                    file_path = os.path.join(root, file)
                    
                    try:
                        result = self.scan_file(file_path)
                        
                        if result['apis']:
                            self.results['files_scanned'] += 1
                            self.results['apis_found'] += len(result['apis'])
                            
                            # 更新统计
                            for api in result['apis']:
                                self.results['summary']['total_apis'] += 1
                                
                                if api['has_user_check']:
                                    self.results['summary']['apis_with_user_check'] += 1
                                else:
                                    self.results['summary']['apis_without_user_check'] += 1
                                
                                if api['uses_service']:
                                    self.results['summary']['apis_using_service'] += 1
                                
                                if api['direct_db_access']:
                                    self.results['summary']['apis_direct_db_access'] += 1
                            
                            # 记录问题
                            if result['issues']:
                                self.results['issues'].extend(result['issues'])
                        
                    except Exception as e:
                        logger.warning(f"Failed to scan {file_path}: {e}")
    
    def save_report(self, output_path: str) -> None:
        """
        保存审查报告
        
        Args:
            output_path: 输出文件路径
        """
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        logger.info(f"Report saved to: {output_path}")
    
    def print_summary(self) -> None:
        """打印审查摘要"""
        print("\n" + "="*60)
        print("API接口审查报告")
        print("="*60)
        print(f"审查时间: {self.results['audit_time']}")
        print(f"扫描文件数: {self.results['files_scanned']}")
        print(f"发现API数: {self.results['apis_found']}")
        print("\n统计信息:")
        print("-"*60)
        print(f"总API数: {self.results['summary']['total_apis']}")
        print(f"有user_id检查: {self.results['summary']['apis_with_user_check']}")
        print(f"无user_id检查: {self.results['summary']['apis_without_user_check']}")
        print(f"使用Service层: {self.results['summary']['apis_using_service']}")
        print(f"直接数据库访问: {self.results['summary']['apis_direct_db_access']}")
        
        if self.results['issues']:
            print("\n发现的问题:")
            print("-"*60)
            for issue in self.results['issues']:
                print(f"✗ [{issue['type']}] {issue['api']}")
                print(f"  函数: {issue['function']} (行 {issue['line']})")
                print(f"  问题: {issue['message']}")
        else:
            print("\n✓ 未发现问题")
        
        print("="*60 + "\n")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description='审查ComfyUI API接口的用户数据隔离实现'
    )
    parser.add_argument(
        '--directory',
        type=str,
        default='.',
        help='要扫描的目录（默认为当前目录）'
    )
    parser.add_argument(
        '--output',
        type=str,
        default=None,
        help='审查报告输出路径（JSON格式）'
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
        # 运行审查
        auditor = APIAuditor()
        auditor.scan_directory(args.directory)
        
        # 打印摘要
        auditor.print_summary()
        
        # 保存报告
        if args.output:
            auditor.save_report(args.output)
        else:
            # 默认保存到当前目录
            default_output = f"api_audit_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            auditor.save_report(default_output)
        
        # 返回状态码
        if auditor.results['issues']:
            sys.exit(1)  # 发现问题
        else:
            sys.exit(0)  # 无问题
            
    except Exception as e:
        logger.error(f"Audit failed: {e}", exc_info=args.verbose)
        sys.exit(2)


if __name__ == '__main__':
    main()

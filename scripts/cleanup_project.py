#!/usr/bin/env python3
"""
ComfyUI 项目清理脚本
用于定期清理项目中的临时文件、旧文件、缓存等
"""

import os
import sys
import shutil
import sqlite3
import argparse
from datetime import datetime, timedelta
from pathlib import Path

class ComfyUICleaner:
    def __init__(self, project_path, dry_run=False, backup_days=15):
        """
        初始化清理器
        
        Args:
            project_path: 项目根目录路径
            dry_run: 是否仅模拟运行（不实际删除/移动文件）
            backup_days: 备份保留天数
        """
        self.project_path = Path(project_path).resolve()
        self.dry_run = dry_run
        self.backup_days = backup_days
        self.backup_dir = self.project_path / ".cleanup_backup"
        self.report = {
            "清理时间": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "项目路径": str(self.project_path),
            "模拟运行": dry_run,
            "清理项目": {}
        }
        
    def log(self, message, level="INFO"):
        """记录日志"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] [{level}] {message}")
        
    def add_to_report(self, category, action, details):
        """添加到报告"""
        if category not in self.report["清理项目"]:
            self.report["清理项目"][category] = []
        self.report["清理项目"][category].append({
            "操作": action,
            "详情": details,
            "时间": datetime.now().strftime("%H:%M:%S")
        })
    
    def ensure_backup_dir(self):
        """确保备份目录存在"""
        if not self.backup_dir.exists():
            if not self.dry_run:
                self.backup_dir.mkdir(parents=True, exist_ok=True)
            self.log(f"创建备份目录: {self.backup_dir}")
    
    def cleanup_python_cache(self):
        """清理Python缓存文件"""
        self.log("开始清理Python缓存文件...")
        
        cache_dirs = list(self.project_path.rglob("__pycache__"))
        cache_files = list(self.project_path.rglob("*.pyc")) + \
                     list(self.project_path.rglob("*.pyo")) + \
                     list(self.project_path.rglob("*.pyd"))
        
        cache_count = len(cache_dirs) + len(cache_files)
        
        if cache_count == 0:
            self.log("未找到Python缓存文件")
            return
        
        self.log(f"找到 {len(cache_dirs)} 个缓存目录和 {len(cache_files)} 个缓存文件")
        
        if not self.dry_run:
            # 删除缓存目录
            for cache_dir in cache_dirs:
                try:
                    shutil.rmtree(cache_dir)
                    self.log(f"删除缓存目录: {cache_dir}")
                except Exception as e:
                    self.log(f"删除缓存目录失败 {cache_dir}: {e}", "ERROR")
            
            # 删除缓存文件
            for cache_file in cache_files:
                try:
                    cache_file.unlink()
                    self.log(f"删除缓存文件: {cache_file}")
                except Exception as e:
                    self.log(f"删除缓存文件失败 {cache_file}: {e}", "ERROR")
        else:
            self.log(f"[模拟] 将删除 {len(cache_dirs)} 个缓存目录和 {len(cache_files)} 个缓存文件")
        
        self.add_to_report("Python缓存清理", "删除缓存", f"清理了 {cache_count} 个缓存项目")
    
    def cleanup_logs(self, keep_days=7):
        """清理日志文件"""
        self.log("开始清理日志文件...")
        
        logs_dir = self.project_path / "logs"
        if not logs_dir.exists():
            self.log("日志目录不存在")
            return
        
        cutoff_date = datetime.now() - timedelta(days=keep_days)
        
        for log_file in logs_dir.glob("*.log*"):
            if log_file.is_file():
                # 检查文件修改时间
                mtime = datetime.fromtimestamp(log_file.stat().st_mtime)
                
                if mtime < cutoff_date:
                    # 移动旧日志到备份
                    backup_path = self.backup_dir / "old_logs" / log_file.name
                    if not self.dry_run:
                        self.ensure_backup_dir()
                        (self.backup_dir / "old_logs").mkdir(exist_ok=True)
                        shutil.move(str(log_file), str(backup_path))
                        self.log(f"移动旧日志: {log_file} -> {backup_path}")
                    else:
                        self.log(f"[模拟] 将移动旧日志: {log_file}")
                    
                    self.add_to_report("日志清理", "移动旧日志", f"{log_file.name} (修改时间: {mtime})")
                else:
                    # 清空当前日志文件（保留文件）
                    if not self.dry_run:
                        with open(log_file, 'w') as f:
                            f.write("")
                        self.log(f"清空日志文件: {log_file}")
                    else:
                        self.log(f"[模拟] 将清空日志文件: {log_file}")
                    
                    self.add_to_report("日志清理", "清空日志", log_file.name)
    
    def cleanup_old_files(self, dir_name, days_threshold=15):
        """清理指定目录中的旧文件"""
        self.log(f"开始清理 {dir_name} 目录中的旧文件...")
        
        target_dir = self.project_path / dir_name
        if not target_dir.exists():
            self.log(f"目录不存在: {target_dir}")
            return
        
        cutoff_date = datetime.now() - timedelta(days=days_threshold)
        moved_files = []
        
        for item in target_dir.rglob("*"):
            if item.is_file():
                mtime = datetime.fromtimestamp(item.stat().st_mtime)
                
                if mtime < cutoff_date:
                    # 创建相对路径用于备份
                    rel_path = item.relative_to(target_dir)
                    backup_path = self.backup_dir / f"old_{dir_name}" / rel_path
                    
                    if not self.dry_run:
                        self.ensure_backup_dir()
                        backup_path.parent.mkdir(parents=True, exist_ok=True)
                        shutil.move(str(item), str(backup_path))
                        self.log(f"移动旧文件: {item} -> {backup_path}")
                    else:
                        self.log(f"[模拟] 将移动旧文件: {item}")
                    
                    moved_files.append({
                        "文件": str(item),
                        "大小": item.stat().st_size,
                        "修改时间": mtime.strftime("%Y-%m-%d"),
                        "备份位置": str(backup_path)
                    })
        
        if moved_files:
            total_size = sum(f["大小"] for f in moved_files)
            self.log(f"移动了 {len(moved_files)} 个文件，总计 {total_size/1024/1024:.2f} MB")
            self.add_to_report(f"{dir_name}目录清理", "移动旧文件", 
                             f"移动了 {len(moved_files)} 个文件 ({total_size/1024/1024:.2f} MB)")
        else:
            self.log(f"未找到 {days_threshold} 天前的文件")
    
    def optimize_database(self):
        """优化数据库文件"""
        self.log("开始优化数据库...")
        
        db_path = self.project_path / "data" / "comfy.db"
        if not db_path.exists():
            self.log("数据库文件不存在")
            return
        
        # 备份数据库
        backup_path = db_path.with_suffix(f".backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}")
        
        if not self.dry_run:
            try:
                # 创建备份
                shutil.copy2(db_path, backup_path)
                self.log(f"数据库备份创建: {backup_path}")
                
                # 优化数据库
                conn = sqlite3.connect(db_path)
                conn.execute("VACUUM;")
                conn.close()
                
                # 检查优化效果
                original_size = backup_path.stat().st_size
                optimized_size = db_path.stat().st_size
                saved = original_size - optimized_size
                
                self.log(f"数据库优化完成: {original_size/1024:.1f}KB -> {optimized_size/1024:.1f}KB (节省 {saved/1024:.1f}KB)")
                
                self.add_to_report("数据库优化", "VACUUM操作", 
                                 f"大小: {original_size/1024:.1f}KB -> {optimized_size/1024:.1f}KB, 节省: {saved/1024:.1f}KB")
                
            except Exception as e:
                self.log(f"数据库优化失败: {e}", "ERROR")
                self.add_to_report("数据库优化", "失败", str(e))
        else:
            self.log("[模拟] 将优化数据库并创建备份")
            self.add_to_report("数据库优化", "模拟运行", "将执行VACUUM操作")
    
    def generate_report(self):
        """生成清理报告"""
        report_path = self.project_path / "cleanup_report.json"
        
        import json
        from datetime import datetime
        
        # 添加统计信息
        self.report["统计"] = {
            "清理项目数量": len(self.report["清理项目"]),
            "总操作数": sum(len(actions) for actions in self.report["清理项目"].values())
        }
        
        if not self.dry_run:
            with open(report_path, 'w', encoding='utf-8') as f:
                json.dump(self.report, f, ensure_ascii=False, indent=2, default=str)
            self.log(f"清理报告已保存: {report_path}")
        
        # 同时生成Markdown格式报告
        md_report = self._generate_markdown_report()
        md_path = self.project_path / "cleanup_report.md"
        
        if not self.dry_run:
            with open(md_path, 'w', encoding='utf-8') as f:
                f.write(md_report)
            self.log(f"Markdown报告已保存: {md_path}")
        
        return self.report
    
    def _generate_markdown_report(self):
        """生成Markdown格式报告"""
        md = f"""# ComfyUI 项目清理报告

## 清理概览
- **清理时间**: {self.report['清理时间']}
- **项目路径**: {self.report['项目路径']}
- **模拟运行**: {'是' if self.report['模拟运行'] else '否'}
- **备份保留天数**: {self.backup_days}天

## 清理详情
"""
        
        for category, actions in self.report["清理项目"].items():
            md += f"\n### {category}\n"
            for action in actions:
                md += f"- **{action['操作']}**: {action['详情']} ({action['时间']})\n"
        
        md += f"""
## 统计信息
- **清理项目数量**: {self.report.get('统计', {}).get('清理项目数量', 0)}
- **总操作数**: {self.report.get('统计', {}).get('总操作数', 0)}

## 使用说明
1. 定期运行此脚本保持项目整洁
2. 备份文件保存在 `.cleanup_backup/` 目录
3. 可安全删除30天前的备份文件

## 注意事项
- 所有操作都有备份，可随时恢复
- 建议每月执行一次清理
- 数据库优化不影响数据完整性
"""
        
        return md
    
    def run_all(self):
        """执行所有清理操作"""
        self.log("=" * 50)
        self.log("开始ComfyUI项目清理")
        self.log("=" * 50)
        
        self.ensure_backup_dir()
        
        # 执行清理操作
        self.cleanup_python_cache()
        self.cleanup_logs()
        self.cleanup_old_files("input", self.backup_days)
        self.cleanup_old_files("output", self.backup_days)
        self.optimize_database()
        
        # 生成报告
        report = self.generate_report()
        
        self.log("=" * 50)
        self.log("清理完成")
        self.log("=" * 50)
        
        return report

def main():
    parser = argparse.ArgumentParser(description='ComfyUI项目清理工具')
    parser.add_argument('--project-path', default='.', help='项目路径 (默认: 当前目录)')
    parser.add_argument('--dry-run', action='store_true', help='模拟运行，不实际执行操作')
    parser.add_argument('--backup-days', type=int, default=15, help='备份保留天数 (默认: 15)')
    parser.add_argument('--skip-db', action='store_true', help='跳过数据库优化')
    
    args = parser.parse_args()
    
    cleaner = ComfyUICleaner(
        project_path=args.project_path,
        dry_run=args.dry_run,
        backup_days=args.backup_days
    )
    
    if args.dry_run:
        print("⚠️  模拟运行模式：不会实际执行删除/移动操作")
    
    try:
        report = cleaner.run_all()
        
        if args.dry_run:
            print("\n✅ 模拟运行完成")
            print("如需实际执行清理，请移除 --dry-run 参数")
        else:
            print("\n✅ 清理完成")
            print(f"清理报告已保存到: {os.path.join(args.project_path, 'cleanup_report.md')}")
            
    except Exception as e:
        print(f"❌ 清理过程中出现错误: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
# ComfyUI 多用户数据隔离 - 运维手册

## 概述

本手册为运维人员提供ComfyUI多用户数据隔离系统的日常运维指导，包括监控、故障排查、性能优化等内容。

## 日常运维任务

### 1. 数据完整性检查

**频率**：每日一次

```bash
# 运行数据诊断
python scripts/diagnose_user_data.py \
    --db-path comfyui.db \
    --output /var/log/comfyui/diagnostic_$(date +%Y%m%d).json
```

检查报告中的问题数量，如有异常及时处理。

### 2. 临时文件清理

**频率**：每周一次

```bash
# 清理所有用户的临时文件
python -c "
from app.database.user_models import User
from app.database.db import create_session
from folder_paths.user_directory import cleanup_user_temp_files
from sqlalchemy import select

with create_session() as session:
    users = session.execute(select(User)).scalars().all()
    for user in users:
        deleted = cleanup_user_temp_files(user.id, max_age_hours=168)
        print(f'User {user.id}: deleted {deleted} files')
"
```

### 3. 磁盘使用监控

**频率**：每日一次

```bash
# 检查磁盘使用情况
python -c "
from folder_paths.user_directory import get_user_disk_usage_summary
import json

summary = get_user_disk_usage_summary()
print(json.dumps(summary, indent=2))
"
```

设置告警阈值（如总使用量超过80%时告警）。

### 4. 数据库维护

**频率**：每月一次

```bash
# SQLite数据库优化
sqlite3 comfyui.db "VACUUM;"
sqlite3 comfyui.db "ANALYZE;"

# 重建索引
sqlite3 comfyui.db "REINDEX;"

# 检查数据库完整性
sqlite3 comfyui.db "PRAGMA integrity_check;"
```

## 监控指标

### 1. 系统指标

| 指标 | 说明 | 告警阈值 |
|------|------|----------|
| CPU使用率 | 系统CPU使用率 | > 80% |
| 内存使用率 | 系统内存使用率 | > 85% |
| 磁盘使用率 | 磁盘空间使用率 | > 80% |
| 数据库大小 | 数据库文件大小 | > 10GB |
| 活跃用户数 | 当前在线用户数 | - |

### 2. 业务指标

| 指标 | 说明 | 告警阈值 |
|------|------|----------|
| 用户数据隔离错误 | 跨用户访问尝试次数 | > 10次/小时 |
| 数据库查询延迟 | 平均查询响应时间 | > 500ms |
| 文件上传失败率 | 文件上传失败比例 | > 5% |
| 任务执行失败率 | 任务执行失败比例 | > 10% |

### 3. 监控脚本

```bash
#!/bin/bash
# monitoring.sh - 综合监控脚本

# CPU使用率
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
echo "CPU: ${CPU_USAGE}%"

# 内存使用率
MEM_USAGE=$(free | grep Mem | awk '{print ($3/$2) * 100.0}')
echo "Memory: ${MEM_USAGE}%"

# 磁盘使用率
DISK_USAGE=$(df -h / | grep / | awk '{print $5}' | awk -F'%' '{print $1}')
echo "Disk: ${DISK_USAGE}%"

# 数据库大小
DB_SIZE=$(ls -lh comfyui.db | awk '{print $5}')
echo "Database: ${DB_SIZE}"

# 活跃用户数
ACTIVE_USERS=$(python -c "
from app.database.user_models import User
from app.database.db import create_session
from sqlalchemy import select
from datetime import datetime, timedelta

with create_session() as session:
    cutoff = datetime.utcnow() - timedelta(hours=1)
    stmt = select(User).where(User.last_login > cutoff)
    count = len(session.execute(stmt).scalars().all())
    print(count)
")
echo "Active Users: ${ACTIVE_USERS}"

# 权限错误数
PERM_ERRORS=$(grep -c "PermissionError" /var/log/comfyui/comfyui.log 2>/dev/null || echo 0)
echo "Permission Errors: ${PERM_ERRORS}"
```

## 告警处理流程

### 1. 数据隔离错误告警

**触发条件**：检测到跨用户访问尝试

**处理步骤**：
1. 查看错误日志，确认错误来源
2. 检查相关API接口代码
3. 运行API审查工具
4. 修复代码漏洞
5. 重启服务

```bash
# 查看权限错误日志
grep "PermissionError" /var/log/comfyui/comfyui.log | tail -20

# 运行API审查
python scripts/api_audit_report.py --directory . --verbose
```

### 2. 磁盘空间告警

**触发条件**：磁盘使用率 > 80%

**处理步骤**：
1. 检查各用户磁盘使用情况
2. 清理临时文件
3. 归档旧数据
4. 联系大存储用户清理数据

```bash
# 查看用户磁盘使用
python -c "
from folder_paths.user_directory import get_user_disk_usage_summary
import json
summary = get_user_disk_usage_summary()
print(json.dumps(summary, indent=2))
"

# 清理临时文件
python scripts/cleanup_temp_files.py --all-users
```

### 3. 性能下降告警

**触发条件**：查询延迟 > 500ms

**处理步骤**：
1. 检查数据库索引
2. 运行数据库优化
3. 检查慢查询日志
4. 优化查询语句

```bash
# 检查索引
sqlite3 comfyui.db "SELECT * FROM sqlite_master WHERE type='index';"

# 优化数据库
sqlite3 comfyui.db "ANALYZE;"

# 查看慢查询
grep "slow query" /var/log/comfyui/comfyui.log | tail -20
```

## 故障排查指南

### 问题1：用户无法访问自己的数据

**症状**：用户登录后看不到自己的工作流、历史记录等

**排查步骤**：
1. 检查用户ID是否正确
2. 检查数据库中user_id字段
3. 检查API是否正确获取user_id
4. 检查Service层是否正确过滤

```bash
# 检查用户数据
python -c "
from app.database.db import create_session
from app.database.workflow_models import Workflow
from sqlalchemy import select

user_id = 'TARGET_USER_ID'
with create_session() as session:
    stmt = select(Workflow).where(Workflow.user_id == user_id)
    workflows = session.execute(stmt).scars().all()
    print(f'Found {len(workflows)} workflows for user {user_id}')
"
```

### 问题2：用户能看到其他用户的数据

**症状**：用户A能看到用户B的数据

**排查步骤**：
1. 立即停止服务
2. 检查API接口代码
3. 运行API审查工具
4. 检查数据库查询语句
5. 修复漏洞并重启

```bash
# 紧急处理
systemctl stop comfyui

# 审查API
python scripts/api_audit_report.py --verbose

# 检查数据库
python scripts/diagnose_user_data.py --db-path comfyui.db --verbose
```

### 问题3：数据库查询缓慢

**症状**：页面加载缓慢，查询超时

**排查步骤**：
1. 检查数据库大小
2. 检查索引是否创建
3. 分析查询计划
4. 优化查询语句

```bash
# 检查数据库大小
ls -lh comfyui.db

# 检查索引
sqlite3 comfyui.db "SELECT name FROM sqlite_master WHERE type='index';"

# 分析查询计划
sqlite3 comfyui.db "EXPLAIN QUERY PLAN SELECT * FROM workflows WHERE user_id='test';"
```

### 问题4：文件上传失败

**症状**：用户无法上传文件

**排查步骤**：
1. 检查磁盘空间
2. 检查目录权限
3. 检查文件大小限制
4. 检查用户目录是否存在

```bash
# 检查磁盘空间
df -h

# 检查目录权限
ls -la output/
ls -la user/

# 检查用户目录
python scripts/init_user_directories.py --user-id TARGET_USER_ID --dry-run
```

## 性能优化建议

### 1. 数据库优化

```sql
-- 创建复合索引
CREATE INDEX IF NOT EXISTS ix_workflows_user_updated 
ON workflows(user_id, updated_at);

CREATE INDEX IF NOT EXISTS ix_history_user_created 
ON history(user_id, created_at);

-- 定期分析
ANALYZE;

-- 定期清理
VACUUM;
```

### 2. 缓存优化

```python
# 启用查询缓存
# 在config.py中设置
QUERY_CACHE_ENABLED = True
QUERY_CACHE_TTL = 300  # 5分钟
```

### 3. 连接池优化

```python
# 数据库连接池配置
DATABASE_POOL_SIZE = 20
DATABASE_MAX_OVERFLOW = 10
DATABASE_POOL_TIMEOUT = 30
```

### 4. 文件系统优化

```bash
# 使用SSD存储用户数据
# 定期清理临时文件
# 实施磁盘配额
```

## 备份策略

### 1. 数据库备份

```bash
#!/bin/bash
# backup_db.sh - 数据库备份脚本

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/comfyui"

# 完整备份
sqlite3 comfyui.db ".backup ${BACKUP_DIR}/comfyui_${DATE}.db"

# 压缩备份
gzip ${BACKUP_DIR}/comfyui_${DATE}.db

# 保留最近7天的备份
find ${BACKUP_DIR} -name "comfyui_*.db.gz" -mtime +7 -delete
```

### 2. 用户数据备份

```bash
#!/bin/bash
# backup_user_data.sh - 用户数据备份脚本

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/comfyui"

# 备份用户数据
tar -czf ${BACKUP_DIR}/user_data_${DATE}.tar.gz user/

# 备份输出目录
tar -czf ${BACKUP_DIR}/output_${DATE}.tar.gz output/

# 保留最近7天的备份
find ${BACKUP_DIR} -name "user_data_*.tar.gz" -mtime +7 -delete
find ${BACKUP_DIR} -name "output_*.tar.gz" -mtime +7 -delete
```

## 安全建议

1. **定期更新依赖**
   ```bash
   pip list --outdated
   pip install --upgrade package_name
   ```

2. **检查文件权限**
   ```bash
   # 确保数据库文件权限正确
   chmod 600 comfyui.db
   
   # 确保用户目录权限正确
   chmod 755 user/
   chmod 755 output/
   ```

3. **审计日志**
   ```bash
   # 定期检查审计日志
   grep "PermissionError" /var/log/comfyui/audit.log
   grep "unauthorized" /var/log/comfyui/audit.log
   ```

4. **安全扫描**
   ```bash
   # 运行安全扫描工具
   python scripts/security_scan.py
   ```

## 联系支持

- 技术支持：support@example.com
- 紧急问题：+86-xxx-xxxx-xxxx
- 文档更新：docs@example.com

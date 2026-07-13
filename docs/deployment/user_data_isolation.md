# ComfyUI 多用户数据隔离 - 部署文档

## 概述

本文档描述了ComfyUI多用户数据完全隔离功能的部署步骤，包括数据备份、迁移、验证和回滚方案。

## 部署前准备

### 1. 系统要求

- Python 3.8+
- SQLite 3.25+ 或 PostgreSQL 12+
- 足够的磁盘空间（建议至少预留当前数据量的2倍空间）

### 2. 依赖检查

```bash
# 检查Python版本
python --version

# 检查SQLite版本
sqlite3 --version

# 检查依赖包
pip list | grep -E "sqlalchemy|alembic|aiohttp"
```

### 3. 数据备份

**重要：部署前必须进行完整备份！**

```bash
# 1. 备份数据库
cp comfyui.db comfyui.db.backup.$(date +%Y%m%d_%H%M%S)

# 2. 备份用户数据目录
tar -czf user_data_backup_$(date +%Y%m%d_%H%M%S).tar.gz user/

# 3. 备份输出目录
tar -czf output_backup_$(date +%Y%m%d_%H%M%S).tar.gz output/

# 4. 备份配置文件
cp -r custom_configs/ custom_configs.backup.$(date +%Y%m%d_%H%M%S)/
```

## 部署步骤

### 步骤1：数据诊断

在部署前，先运行数据诊断工具检查现有数据：

```bash
# 运行诊断
python scripts/diagnose_user_data.py \
    --db-path comfyui.db \
    --output diagnostic_report.json \
    --verbose
```

检查诊断报告，确认需要修复的数据量。

### 步骤2：数据修复（Dry Run）

先进行dry-run测试，不实际修改数据：

```bash
# Dry run测试
python scripts/fix_user_data.py \
    --db-path comfyui.db \
    --default-user-id "default_user" \
    --dry-run \
    --output fix_report_dryrun.json \
    --verbose
```

检查dry-run报告，确认修复操作正确。

### 步骤3：数据修复（实际执行）

确认无误后，执行实际修复：

```bash
# 实际修复
python scripts/fix_user_data.py \
    --db-path comfyui.db \
    --default-user-id "default_user" \
    --output fix_report_live.json \
    --verbose
```

### 步骤4：数据库迁移

运行Alembic迁移脚本：

```bash
# 检查当前迁移状态
alembic current

# 执行迁移
alembic upgrade head

# 确认迁移成功
alembic current
```

### 步骤5：数据验证

运行验证脚本确认迁移成功：

```bash
# 验证数据完整性
python scripts/validate_migration.py \
    --db-path comfyui.db \
    --output validation_report.json \
    --verbose
```

检查验证报告，确保所有检查项通过。

### 步骤6：用户目录初始化

为所有用户创建隔离目录：

```bash
# Dry run测试
python scripts/init_user_directories.py \
    --all-users \
    --dry-run \
    --verbose

# 实际创建
python scripts/init_user_directories.py \
    --all-users \
    --set-permissions 755 \
    --verbose
```

### 步骤7：API审查

审查所有API接口：

```bash
# 运行API审查
python scripts/api_audit_report.py \
    --directory . \
    --output api_audit_report.json \
    --verbose
```

检查审查报告，确保所有API都正确实现了用户隔离。

### 步骤8：服务重启

重启ComfyUI服务：

```bash
# 停止服务
systemctl stop comfyui
# 或
pkill -f "python main.py"

# 启动服务
systemctl start comfyui
# 或
python main.py &
```

### 步骤9：功能验证

验证核心功能：

1. **用户登录验证**
   - 测试不同用户登录
   - 验证用户隔离生效

2. **工作流隔离验证**
   - 创建工作流，验证只能看到自己的工作流
   - 尝试访问其他用户的工作流，验证被拒绝

3. **历史记录隔离验证**
   - 执行任务，验证历史记录隔离
   - 验证统计功能按用户分组

4. **资产隔离验证**
   - 上传资产，验证资产隔离
   - 验证资产访问权限

5. **配置隔离验证**
   - 设置用户配置，验证配置隔离
   - 测试配置继承机制

## 回滚方案

如果部署失败或发现问题，按以下步骤回滚：

### 1. 停止服务

```bash
systemctl stop comfyui
# 或
pkill -f "python main.py"
```

### 2. 回滚数据库

```bash
# 恢复数据库备份
cp comfyui.db.backup.YYYYMMDD_HHMMSS comfyui.db

# 回滚Alembic迁移
alembic downgrade -1
# 或回滚到特定版本
alembic downgrade 0005_add_users_and_captcha_tables
```

### 3. 恢复数据目录

```bash
# 恢复用户数据
rm -rf user/
tar -xzf user_data_backup_YYYYMMDD_HHMMSS.tar.gz

# 恢复输出目录
rm -rf output/
tar -xzf output_backup_YYYYMMDD_HHMMSS.tar.gz
```

### 4. 恢复配置

```bash
rm -rf custom_configs/
cp -r custom_configs.backup.YYYYMMDD_HHMMSS/ custom_configs/
```

### 5. 重启服务

```bash
systemctl start comfyui
# 或
python main.py &
```

## 常见问题

### Q1: 数据迁移失败

**症状**：Alembic迁移报错

**解决方案**：
1. 检查数据库连接
2. 确认数据库版本兼容
3. 查看Alembic日志：`alembic history`
4. 手动修复迁移脚本

### Q2: 用户数据泄露

**症状**：用户A能看到用户B的数据

**解决方案**：
1. 立即停止服务
2. 运行诊断工具检查
3. 检查API审查报告
4. 修复相关代码
5. 重新部署

### Q3: 性能下降

**症状**：查询速度变慢

**解决方案**：
1. 检查索引是否创建成功
2. 运行`ANALYZE`优化查询计划
3. 检查数据库连接池配置
4. 考虑增加缓存层

### Q4: 磁盘空间不足

**症状**：无法创建用户目录

**解决方案**：
1. 清理临时文件
2. 归档旧数据
3. 扩展磁盘空间
4. 实施磁盘配额管理

## 部署检查清单

- [ ] 完成数据备份
- [ ] 运行数据诊断
- [ ] 执行数据修复
- [ ] 完成数据库迁移
- [ ] 验证数据完整性
- [ ] 初始化用户目录
- [ ] 审查API接口
- [ ] 重启服务
- [ ] 完成功能验证
- [ ] 准备回滚方案

## 部署后监控

### 1. 性能监控

```bash
# 监控数据库大小
watch -n 60 'ls -lh comfyui.db'

# 监控用户目录大小
watch -n 300 'du -sh user/*'
```

### 2. 日志监控

```bash
# 监控错误日志
tail -f logs/comfyui.log | grep ERROR

# 监控权限错误
tail -f logs/comfyui.log | grep PermissionError
```

### 3. 用户活动监控

```bash
# 查看用户活动统计
python -c "
from app.services.history_service import HistoryService
# ... 统计代码
"
```

## 联系支持

如遇到问题，请联系：
- 技术支持：support@example.com
- 紧急问题：+86-xxx-xxxx-xxxx

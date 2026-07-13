# ComfyUI 文档索引

## 项目概述
- [README.md](../README.md) - 项目主文档，包含快速开始指南
- [CONTRIBUTING.md](../CONTRIBUTING.md) - 贡献指南

## 多用户系统文档

### 核心文档
1. **系统概述**
   - [MULTI_USER_SYSTEM.md](MULTI_USER_SYSTEM.md) - 多用户系统完整说明
   - [USER_DATA_ISOLATION_SUMMARY.md](USER_DATA_ISOLATION_SUMMARY.md) - 用户数据隔离总结

2. **开发指南**
   - [DATA_ISOLATION_DEVELOPER_GUIDE.md](DATA_ISOLATION_DEVELOPER_GUIDE.md) - 数据隔离开发者指南
   - [USER_DATA_ISOLATION_COMPLETE.md](USER_DATA_ISOLATION_COMPLETE.md) - 用户数据隔离完成报告

## 服务管理文档

### 运维指南
- [SERVICE_MANAGEMENT.md](SERVICE_MANAGEMENT.md) - 服务管理指南
- [QUICK_RESTART_CHEATSHEET.md](QUICK_RESTART_CHEATSHEET.md) - 快速重启备忘单

## 故障排除
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - 常见问题排查指南

## 快速导航

### 新用户入门
1. 阅读 [README.md](../README.md) 了解项目概况
2. 查看 [MULTI_USER_SYSTEM.md](MULTI_USER_SYSTEM.md) 了解多用户功能

### 开发者指南
1. 阅读 [DATA_ISOLATION_DEVELOPER_GUIDE.md](DATA_ISOLATION_DEVELOPER_GUIDE.md) 了解数据隔离架构
2. 查看 [USER_DATA_ISOLATION_COMPLETE.md](USER_DATA_ISOLATION_COMPLETE.md) 了解实现细节

### 运维管理
1. 使用 [SERVICE_MANAGEMENT.md](SERVICE_MANAGEMENT.md) 管理服务
2. 参考 [QUICK_RESTART_CHEATSHEET.md](QUICK_RESTART_CHEATSHEET.md) 快速重启服务

## 文档分类

### 按用途分类
- **入门指南**: README.md
- **多用户系统**: MULTI_USER_SYSTEM.md, USER_DATA_ISOLATION_*
- **运维管理**: SERVICE_MANAGEMENT.md, QUICK_RESTART_CHEATSHEET.md
- **故障排除**: TROUBLESHOOTING.md

### 按技术分类
- **用户系统**: MULTI_USER_SYSTEM.md, DATA_ISOLATION_DEVELOPER_GUIDE.md
- **数据隔离**: USER_DATA_ISOLATION_*
- **服务管理**: SERVICE_MANAGEMENT.md, QUICK_RESTART_CHEATSHEET.md

## 相关资源

### 工具脚本
- `scripts/service_manager.sh` - 服务管理脚本
- `scripts/check_service.sh` - 服务状态检查脚本

### 配置文件
- `config/comfyui_config.sh` - 服务配置文件
- `user/users.json` - 用户配置文件

## 获取帮助

### 常见问题
1. **服务问题**: 参考 [SERVICE_MANAGEMENT.md](SERVICE_MANAGEMENT.md)
2. **用户数据问题**: 参考 [DATA_ISOLATION_DEVELOPER_GUIDE.md](DATA_ISOLATION_DEVELOPER_GUIDE.md)
3. **故障排除**: 参考 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### 联系支持
- 查看日志文件: `comfyui.log`
- 检查服务状态: `./scripts/check_service.sh`

---

*最后更新: 2026-07-09*  
*文档版本: 3.0*  
*对应代码版本: v1.0.0*
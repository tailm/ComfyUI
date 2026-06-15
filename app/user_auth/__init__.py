"""
用户认证和模板管理系统

这个模块提供了完整的用户认证系统和用户模板管理功能。
包括用户注册、登录、会话管理以及用户自定义模板的CRUD操作。
"""

from .models import User, UserSession, UserTemplate, UserPreference
from .password import PasswordHasher, PasswordValidator, UsernameValidator, EmailValidator
from .manager import UserAuthManager
from .template_manager import UserTemplateManager
from .routes import UserAuthRoutes
from .security import RateLimiter, IPWhitelist, SecurityManager, security_manager


__all__ = [
    # 模型
    "User",
    "UserSession", 
    "UserTemplate",
    "UserPreference",
    
    # 工具类
    "PasswordHasher",
    "PasswordValidator",
    "UsernameValidator",
    "EmailValidator",
    
    # 管理器
    "UserAuthManager",
    "UserTemplateManager",
    
    # 路由
    "UserAuthRoutes",
    
    # 安全模块
    "RateLimiter",
    "IPWhitelist",
    "SecurityManager",
    "security_manager",
]


def init_user_auth_system(db_session_factory):
    """
    初始化用户认证系统
    
    Args:
        db_session_factory: SQLAlchemy会话工厂
        
    Returns:
        Tuple[UserAuthManager, UserTemplateManager, UserAuthRoutes]: 用户认证管理器、模板管理器和路由处理器
    """
    # 创建管理器
    user_auth_manager = UserAuthManager(db_session_factory)
    template_manager = UserTemplateManager(db_session_factory)
    
    # 创建路由处理器
    auth_routes = UserAuthRoutes(user_auth_manager, template_manager)
    
    return user_auth_manager, template_manager, auth_routes
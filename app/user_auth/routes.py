import logging
import json
from datetime import datetime
from typing import Dict, Any, Optional, Callable
from aiohttp import web

from .manager import UserAuthManager
from .template_manager import UserTemplateManager
from .password import PasswordValidator, UsernameValidator, EmailValidator
from .security import security_manager


class UserAuthRoutes:
    """用户认证API路由"""
    
    def __init__(self, user_auth_manager: UserAuthManager, template_manager: UserTemplateManager):
        """
        初始化用户认证路由
        
        Args:
            user_auth_manager: 用户认证管理器
            template_manager: 模板管理器
        """
        self.user_auth_manager = user_auth_manager
        self.template_manager = template_manager
    
    def _get_client_ip(self, request: web.Request) -> str:
        """获取客户端IP地址"""
        # 尝试从X-Forwarded-For头部获取真实IP
        forwarded_for = request.headers.get('X-Forwarded-For')
        if forwarded_for:
            # 取第一个IP（客户端真实IP）
            return forwarded_for.split(',')[0].strip()
        
        # 尝试从X-Real-IP头部获取
        real_ip = request.headers.get('X-Real-IP')
        if real_ip:
            return real_ip
        
        # 使用连接远程地址
        return request.remote
    
    async def _rate_limit_middleware(self, request: web.Request, handler: Callable, 
                                     rate_limit_type: str = "api", user_id: str = None) -> web.Response:
        """
        速率限制中间件
        
        Args:
            request: 请求对象
            handler: 处理函数
            rate_limit_type: 速率限制类型 ("login", "register", "api")
            user_id: 用户ID（可选）
            
        Returns:
            web.Response: 响应对象
        """
        # 获取客户端IP
        client_ip = self._get_client_ip(request)
        
        # 检查IP白名单
        if not security_manager.is_ip_allowed(client_ip):
            return web.json_response({
                "success": False,
                "message": "IP地址不在白名单中"
            }, status=403)
        
        # 检查IP黑名单
        if security_manager.is_ip_blocked(client_ip):
            return web.json_response({
                "success": False,
                "message": "IP地址已被阻止"
            }, status=403)
        
        # 检查速率限制
        if rate_limit_type == "login":
            allowed, remaining, reset_in = security_manager.check_login_rate_limit(client_ip)
        elif rate_limit_type == "register":
            allowed, remaining, reset_in = security_manager.check_register_rate_limit(client_ip)
        elif rate_limit_type == "api":
            if user_id is None:
                # 从请求中获取用户ID（如果存在）
                user = request.get("user")
                if user:
                    user_id = user.get("id")
            allowed, remaining, reset_in = security_manager.check_api_rate_limit(user_id, client_ip)
        else:
            # 默认使用API速率限制
            allowed, remaining, reset_in = security_manager.check_api_rate_limit(user_id, client_ip)
        
        if not allowed:
            return web.json_response({
                "success": False,
                "message": "请求过于频繁，请稍后再试",
                "data": {
                    "remaining": 0,
                    "reset_in": reset_in
                }
            }, status=429)
        
        # 调用处理函数
        response = await handler(request)
        
        # 添加速率限制头部
        if rate_limit_type == "login":
            limit = security_manager.login_limiter.max_requests
        elif rate_limit_type == "register":
            limit = security_manager.register_limiter.max_requests
        else:  # api
            limit = security_manager.api_limiter.max_requests
        
        response.headers['X-RateLimit-Limit'] = str(limit)
        response.headers['X-RateLimit-Remaining'] = str(remaining)
        response.headers['X-RateLimit-Reset'] = str(reset_in)
        
        return response
    
    async def _auth_middleware(self, request: web.Request, handler: Callable) -> web.Response:
        """
        认证中间件
        
        Args:
            request: 请求对象
            handler: 处理函数
            
        Returns:
            web.Response: 响应对象
        """
        # 获取客户端IP
        client_ip = self._get_client_ip(request)
        
        # 检查IP白名单
        if not security_manager.is_ip_allowed(client_ip):
            return web.json_response({
                "success": False,
                "message": "IP地址不在白名单中"
            }, status=403)
        
        # 检查IP黑名单
        if security_manager.is_ip_blocked(client_ip):
            return web.json_response({
                "success": False,
                "message": "IP地址已被阻止"
            }, status=403)
        
        # 获取会话令牌
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return web.json_response({
                "success": False,
                "message": "缺少认证令牌"
            }, status=401)
        
        session_token = auth_header[7:]  # 移除 "Bearer " 前缀
        
        # 验证会话并获取用户
        success, message, user = self.user_auth_manager.verify_session(session_token)
        
        if not success:
            return web.json_response({
                "success": False,
                "message": message
            }, status=401)
        
        # 检查API速率限制
        allowed, remaining, reset_in = security_manager.check_api_rate_limit(user["id"], client_ip)
        
        if not allowed:
            return web.json_response({
                "success": False,
                "message": "请求过于频繁，请稍后再试",
                "data": {
                    "remaining": 0,
                    "reset_in": reset_in
                }
            }, status=429)
        
        # 将用户信息添加到请求中
        request["user"] = user
        
        # 调用处理函数
        response = await handler(request)
        
        # 添加速率限制头部
        response.headers['X-RateLimit-Limit'] = '100'
        response.headers['X-RateLimit-Remaining'] = str(remaining)
        response.headers['X-RateLimit-Reset'] = str(reset_in)
        
        return response
    
    def add_routes(self, routes):
        """添加路由到应用"""
        
        # 注册路由
        @routes.post("/api/auth/register")
        async def register_user(request):
            """用户注册"""
            # 应用速率限制中间件
            return await self._rate_limit_middleware(request, self._handle_register, rate_limit_type="register")
        
        # 登录路由
        @routes.post("/api/auth/login")
        async def login_user(request):
            """用户登录"""
            # 应用速率限制中间件
            return await self._rate_limit_middleware(request, self._handle_login, rate_limit_type="login")
        
        # 登出路由
        @routes.post("/api/auth/logout")
        async def logout_user(request):
            """用户登出"""
            # 应用认证中间件
            return await self._auth_middleware(request, self._handle_logout)
        
        # 获取当前用户信息路由
        @routes.get("/api/auth/me")
        async def get_current_user(request):
            """获取当前用户信息"""
            # 应用认证中间件
            return await self._auth_middleware(request, self._handle_get_current_user)
        
        # 用户列表路由（管理员）
        @routes.get("/api/admin/users")
        async def list_users(request):
            """获取用户列表（管理员功能）"""
            # 应用认证中间件
            return await self._auth_middleware(request, self._handle_list_users)
        
        # 白名单管理路由（管理员）
        @routes.get("/api/admin/security/whitelist")
        async def get_whitelist(request):
            """获取IP白名单（管理员功能）"""
            # 应用认证中间件
            return await self._auth_middleware(request, self._handle_get_whitelist)
        
        # 速率限制状态路由（管理员）
        @routes.get("/api/admin/security/rate-limit-status")
        async def get_rate_limit_status(request):
            """获取速率限制状态（管理员功能）"""
            # 应用认证中间件
            return await self._auth_middleware(request, self._handle_get_rate_limit_status)
    
    async def _handle_register(self, request):
        """处理用户注册"""
        try:
            data = await request.json()
        except json.JSONDecodeError:
            return web.json_response({
                "success": False,
                "message": "无效的JSON数据"
            }, status=400)
        
        # 验证必需字段
        required_fields = ["username", "password"]
        for field in required_fields:
            if field not in data:
                return web.json_response({
                    "success": False,
                    "message": f"缺少必需字段: {field}"
                }, status=400)
        
        username = data.get("username", "").strip()
        password = data.get("password", "")
        email = data.get("email", "").strip() or None
        display_name = data.get("display_name", "").strip() or None
        
        # 注册用户
        success, message, user = self.user_auth_manager.register_user(
            username=username,
            password=password,
            email=email,
            display_name=display_name
        )
        
        if not success:
            return web.json_response({
                "success": False,
                "message": message
            }, status=400)
        
        return web.json_response({
            "success": True,
            "message": message,
            "data": {
                "user_id": user.id,
                "username": user.username,
                "display_name": user.display_name,
                "email": user.email,
                "created_at": user.created_at.isoformat()
            }
        })
    
    async def _handle_login(self, request):
        """处理用户登录"""
        try:
            data = await request.json()
        except json.JSONDecodeError:
            return web.json_response({
                "success": False,
                "message": "无效的JSON数据"
            }, status=400)
        
        # 验证必需字段
        required_fields = ["username", "password"]
        for field in required_fields:
            if field not in data:
                return web.json_response({
                    "success": False,
                    "message": f"缺少必需字段: {field}"
                }, status=400)
        
        username = data.get("username", "").strip()
        password = data.get("password", "")
        
        # 获取用户代理和IP地址
        user_agent = request.headers.get("User-Agent")
        ip_address = self._get_client_ip(request)
        
        # 用户登录
        success, message, session_info = self.user_auth_manager.login_user(
            username=username,
            password=password,
            user_agent=user_agent,
            ip_address=ip_address
        )
        
        if not success:
            return web.json_response({
                "success": False,
                "message": message
            }, status=401)
        
        return web.json_response({
            "success": True,
            "message": message,
            "data": {
                "user_id": session_info["user_id"],
                "username": session_info["username"],
                "display_name": session_info["display_name"],
                "email": session_info["email"],
                "is_admin": session_info["is_admin"],
                "session_token": session_info["session_token"],
                "refresh_token": session_info["refresh_token"],
                "expires_at": session_info["expires_at"],
                "refresh_expires_at": session_info["refresh_expires_at"]
            }
        })
    
    async def _handle_logout(self, request):
        """处理用户登出"""
        # 获取会话令牌
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return web.json_response({
                "success": False,
                "message": "缺少认证令牌"
            }, status=401)
        
        session_token = auth_header[7:]  # 移除 "Bearer " 前缀
        
        # 用户登出
        success, message = self.user_auth_manager.logout_user(session_token)
        
        if not success:
            return web.json_response({
                "success": False,
                "message": message
            }, status=400)
        
        return web.json_response({
            "success": True,
            "message": message
        })
    
    async def _handle_get_current_user(self, request):
        """处理获取当前用户信息"""
        user_data = request["user"]
        
        # 格式化日期时间
        formatted_user_data = {
            "user_id": user_data["id"],
            "username": user_data["username"],
            "display_name": user_data["display_name"],
            "email": user_data["email"],
            "is_admin": user_data["is_admin"],
            "created_at": user_data["created_at"].isoformat() if user_data["created_at"] else None,
            "last_login_at": user_data["last_login_at"].isoformat() if user_data["last_login_at"] else None
        }
        
        return web.json_response({
            "success": True,
            "data": formatted_user_data
        })
    
    async def _handle_list_users(self, request):
        """处理获取用户列表"""
        user_data = request["user"]
        
        # 检查是否为管理员
        if not user_data.get("is_admin"):
            return web.json_response({
                "success": False,
                "message": "需要管理员权限"
            }, status=403)
        
        # 获取查询参数
        query = request.rel_url.query
        page = int(query.get("page", 1))
        per_page = min(int(query.get("per_page", 20)), 100)
        search = query.get("search")
        is_admin = query.get("is_admin")
        
        # 转换is_admin参数
        is_admin_bool = None
        if is_admin is not None:
            is_admin_bool = is_admin.lower() == "true"
        
        # 获取用户列表
        users, total_count = self.user_auth_manager.list_users(
            page=page,
            per_page=per_page,
            search=search,
            is_admin=is_admin_bool
        )
        
        # 格式化用户数据
        formatted_users = []
        for user in users:
            formatted_users.append({
                "id": user["id"],
                "username": user["username"],
                "display_name": user["display_name"],
                "email": user["email"],
                "is_admin": user["is_admin"],
                "created_at": user["created_at"].isoformat() if user["created_at"] else None,
                "last_login_at": user["last_login_at"].isoformat() if user["last_login_at"] else None
            })
        
        total_pages = (total_count + per_page - 1) // per_page
        
        return web.json_response({
            "success": True,
            "data": {
                "users": formatted_users,
                "total_count": total_count,
                "page": page,
                "per_page": per_page,
                "total_pages": total_pages
            }
        })
    
    async def _handle_get_whitelist(self, request):
        """处理获取白名单"""
        user_data = request["user"]
        
        # 检查是否为管理员
        if not user_data.get("is_admin"):
            return web.json_response({
                "success": False,
                "message": "需要管理员权限"
            }, status=403)
        
        whitelist = security_manager.get_whitelist()
        
        return web.json_response({
            "success": True,
            "data": whitelist
        })
    
    async def _handle_get_rate_limit_status(self, request):
        """处理获取速率限制状态"""
        user_data = request["user"]
        
        # 检查是否为管理员
        if not user_data.get("is_admin"):
            return web.json_response({
                "success": False,
                "message": "需要管理员权限"
            }, status=403)
        
        # 获取查询参数
        query = request.rel_url.query
        ip = query.get("ip", self._get_client_ip(request))
        user_id = query.get("user_id")
        
        # 获取速率限制状态
        status = security_manager.get_rate_limit_status(ip, user_id)
        
        return web.json_response({
            "success": True,
            "data": status
        })
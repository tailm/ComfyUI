import logging
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple, List
from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete, or_, func
from aiohttp import web
import threading
import hashlib
import json

from .models import User, UserSession, UserTemplate, UserPreference
from .password import PasswordHasher, PasswordValidator, UsernameValidator, EmailValidator


class UserAuthManager:
    """用户认证管理器"""
    
    def __init__(self, db_session_factory):
        """
        初始化用户认证管理器
        
        Args:
            db_session_factory: SQLAlchemy会话工厂
        """
        self.db_session_factory = db_session_factory
        self.session_expiry_hours = 24  # 会话过期时间（小时）
        self.refresh_token_expiry_days = 30  # 刷新令牌过期时间（天）
        
        # 缓存配置
        self.cache_enabled = True
        self.cache_ttl = 300  # 缓存过期时间（秒）
        self.cache_lock = threading.RLock()
        self._cache = {}  # 内存缓存
        self._cache_timestamps = {}  # 缓存时间戳
        
    def _get_db_session(self) -> Session:
        """获取数据库会话"""
        return self.db_session_factory()
    
    def _get_cache_key(self, prefix: str, *args, **kwargs) -> str:
        """生成缓存键"""
        key_parts = [prefix]
        
        # 添加位置参数
        for arg in args:
            if isinstance(arg, (str, int, float, bool, type(None))):
                key_parts.append(str(arg))
            elif isinstance(arg, (list, tuple, dict)):
                key_parts.append(json.dumps(arg, sort_keys=True))
        
        # 添加关键字参数
        for key, value in sorted(kwargs.items()):
            if isinstance(value, (str, int, float, bool, type(None))):
                key_parts.append(f"{key}:{value}")
            elif isinstance(value, (list, tuple, dict)):
                key_parts.append(f"{key}:{json.dumps(value, sort_keys=True)}")
        
        # 生成哈希键
        key_str = "|".join(key_parts)
        return hashlib.md5(key_str.encode()).hexdigest()
    
    def _get_from_cache(self, key: str) -> Any:
        """从缓存获取数据"""
        if not self.cache_enabled:
            return None
        
        with self.cache_lock:
            if key in self._cache:
                timestamp = self._cache_timestamps.get(key, 0)
                if time.time() - timestamp < self.cache_ttl:
                    return self._cache[key]
                else:
                    # 缓存过期，删除
                    del self._cache[key]
                    del self._cache_timestamps[key]
            return None
    
    def _set_to_cache(self, key: str, value: Any) -> None:
        """设置缓存数据"""
        if not self.cache_enabled:
            return
        
        with self.cache_lock:
            self._cache[key] = value
            self._cache_timestamps[key] = time.time()
    
    def _invalidate_cache(self, prefix: str = None) -> None:
        """使缓存失效"""
        with self.cache_lock:
            if prefix:
                # 删除指定前缀的缓存
                keys_to_delete = [k for k in self._cache.keys() if k.startswith(prefix)]
                for key in keys_to_delete:
                    del self._cache[key]
                    del self._cache_timestamps[key]
            else:
                # 清空所有缓存
                self._cache.clear()
                self._cache_timestamps.clear()
    
    def _invalidate_user_cache(self, user_id: str = None) -> None:
        """使用户相关缓存失效"""
        if user_id:
            # 删除特定用户的缓存
            self._invalidate_cache(f"user:{user_id}")
            self._invalidate_cache(f"session:user:{user_id}")
        else:
            # 删除所有用户相关缓存
            self._invalidate_cache("user:")
            self._invalidate_cache("session:")
    
    def register_user(self, username: str, password: str, email: str = None, 
                     display_name: str = None) -> Tuple[bool, str, Optional[User]]:
        """
        注册新用户
        
        Args:
            username: 用户名
            password: 密码
            email: 邮箱（可选）
            display_name: 显示名称（可选）
            
        Returns:
            Tuple[是否成功, 错误信息, 用户对象]
        """
        # 验证用户名
        is_valid, error_msg = UsernameValidator.validate_username(username)
        if not is_valid:
            return False, error_msg, None
        
        # 验证密码
        is_valid, error_msg = PasswordValidator.validate_password(password)
        if not is_valid:
            return False, error_msg, None
        
        # 验证邮箱
        if email:
            is_valid, error_msg = EmailValidator.validate_email(email)
            if not is_valid:
                return False, error_msg, None
        
        with self._get_db_session() as session:
            # 检查用户名是否已存在
            stmt = select(User).where(User.username == username)
            existing_user = session.execute(stmt).scalar_one_or_none()
            if existing_user:
                return False, "用户名已存在", None
            
            # 检查邮箱是否已存在
            if email:
                stmt = select(User).where(User.email == email)
                existing_email = session.execute(stmt).scalar_one_or_none()
                if existing_email:
                    return False, "邮箱已注册", None
            
            # 哈希密码
            password_hash, salt = PasswordHasher.hash_password(password)
            
            # 创建用户
            user = User(
                username=username,
                email=email,
                display_name=display_name or username,
                password_hash=password_hash,
                salt=salt,
                is_active=True,
                is_admin=False,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            session.add(user)
            session.flush()  # 获取用户ID
            
            # 创建用户偏好设置
            preference = UserPreference(
                user_id=user.id,
                theme="light",
                language="en",
                auto_save=True,
                auto_save_interval=30000,
                show_minimap=False,
                show_grid=True,
                snap_to_grid=True,
                show_advanced_widgets=False,
                show_node_titles=True,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            session.add(preference)
            
            session.commit()
            
            logging.info(f"用户注册成功: {username} (ID: {user.id})")
            return True, "注册成功", user
    
    def login_user(self, username: str, password: str, 
                  user_agent: str = None, ip_address: str = None) -> Tuple[bool, str, Optional[Dict]]:
        """
        用户登录
        
        Args:
            username: 用户名
            password: 密码
            user_agent: 用户代理（可选）
            ip_address: IP地址（可选）
            
        Returns:
            Tuple[是否成功, 错误信息, 会话信息]
        """
        with self._get_db_session() as session:
            # 查找用户
            stmt = select(User).where(User.username == username)
            user = session.execute(stmt).scalar_one_or_none()
            
            if not user:
                return False, "用户名或密码错误", None
            
            if not user.is_active:
                return False, "用户账户已被禁用", None
            
            # 验证密码
            if not PasswordHasher.verify_password(password, user.password_hash, user.salt):
                return False, "用户名或密码错误", None
            
            # 更新最后登录时间
            user.last_login_at = datetime.now()
            
            # 创建会话
            session_token = PasswordHasher.generate_session_token()
            refresh_token = PasswordHasher.generate_refresh_token()
            
            expires_at = datetime.now() + timedelta(hours=self.session_expiry_hours)
            refresh_expires_at = datetime.now() + timedelta(days=self.refresh_token_expiry_days)
            
            user_session = UserSession(
                user_id=user.id,
                session_token=session_token,
                refresh_token=refresh_token,
                user_agent=user_agent,
                ip_address=ip_address,
                is_active=True,
                created_at=datetime.now(),
                expires_at=expires_at,
                last_used_at=datetime.now()
            )
            
            session.add(user_session)
            session.commit()
            
            # 准备返回数据
            session_info = {
                "user_id": user.id,
                "username": user.username,
                "display_name": user.display_name,
                "email": user.email,
                "is_admin": user.is_admin,
                "session_token": session_token,
                "refresh_token": refresh_token,
                "expires_at": expires_at.isoformat(),
                "refresh_expires_at": refresh_expires_at.isoformat()
            }
            
            logging.info(f"用户登录成功: {username} (ID: {user.id})")
            return True, "登录成功", session_info
    
    def verify_session(self, session_token: str) -> Tuple[bool, str, Optional[Dict]]:
        """
        验证会话令牌
        
        Args:
            session_token: 会话令牌
            
        Returns:
            Tuple[是否有效, 错误信息, 用户数据字典]
        """
        # 尝试从缓存获取
        cache_key = self._get_cache_key("session", session_token)
        cached_result = self._get_from_cache(cache_key)
        
        if cached_result:
            # 检查缓存是否过期（基于会话过期时间）
            user_data = cached_result.get("user_data")
            expires_at = cached_result.get("expires_at")
            
            if expires_at and datetime.now() < expires_at:
                # 更新最后使用时间（异步）
                self._update_session_last_used(session_token)
                return True, "会话有效（缓存）", user_data
        
        with self._get_db_session() as session:
            # 查找会话
            stmt = select(UserSession).where(
                UserSession.session_token == session_token,
                UserSession.is_active == True,
                UserSession.expires_at > datetime.now()
            )
            user_session = session.execute(stmt).scalar_one_or_none()
            
            if not user_session:
                return False, "会话无效或已过期", None
            
            # 更新最后使用时间
            user_session.last_used_at = datetime.now()
            
            # 查找用户
            stmt = select(User).where(
                User.id == user_session.user_id,
                User.is_active == True
            )
            user = session.execute(stmt).scalar_one_or_none()
            
            if not user:
                return False, "用户不存在或已被禁用", None
            
            # 在会话关闭前获取用户数据
            user_data = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "display_name": user.display_name,
                "is_admin": user.is_admin,
                "created_at": user.created_at,
                "last_login_at": user.last_login_at
            }
            
            # 缓存结果
            cache_data = {
                "user_data": user_data,
                "expires_at": user_session.expires_at
            }
            self._set_to_cache(cache_key, cache_data)
            
            # 缓存用户信息
            user_cache_key = self._get_cache_key("user", user.id)
            self._set_to_cache(user_cache_key, user_data)
            
            session.commit()
            
            return True, "会话有效", user_data
    
    def _update_session_last_used(self, session_token: str) -> None:
        """异步更新会话最后使用时间"""
        def update_in_background():
            try:
                with self._get_db_session() as session:
                    stmt = update(UserSession).where(
                        UserSession.session_token == session_token,
                        UserSession.is_active == True
                    ).values(last_used_at=datetime.now())
                    session.execute(stmt)
                    session.commit()
            except Exception as e:
                logging.warning(f"更新会话最后使用时间失败: {e}")
        
        # 在后台线程中执行更新
        import threading
        thread = threading.Thread(target=update_in_background)
        thread.daemon = True
        thread.start()
    
    def is_admin(self, user_id: str) -> bool:
        """
        检查用户是否为管理员
        
        Args:
            user_id: 用户ID
            
        Returns:
            bool: 是否为管理员
        """
        with self._get_db_session() as session:
            stmt = select(User).where(
                User.id == user_id,
                User.is_active == True
            )
            user = session.execute(stmt).scalar_one_or_none()
            
            return user.is_admin if user else False
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """
        根据用户ID获取用户信息（仅管理员可用）
        
        Args:
            user_id: 用户ID
            
        Returns:
            Dict: 用户信息字典，如果用户不存在则返回None
        """
        # 尝试从缓存获取
        cache_key = self._get_cache_key("user", user_id)
        cached_user = self._get_from_cache(cache_key)
        
        if cached_user:
            return cached_user
        
        with self._get_db_session() as session:
            stmt = select(User).where(User.id == user_id)
            user = session.execute(stmt).scalar_one_or_none()
            
            if not user:
                return None
            
            user_data = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "display_name": user.display_name,
                "is_admin": user.is_admin,
                "is_active": user.is_active,
                "created_at": user.created_at,
                "updated_at": user.updated_at,
                "last_login_at": user.last_login_at
            }
            
            # 缓存用户信息
            self._set_to_cache(cache_key, user_data)
            
            return user_data
    
    def list_users(self, page: int = 1, page_size: int = 20, 
                   search: str = None, is_active: bool = None, 
                   is_admin: bool = None) -> Tuple[List[Dict], int]:
        """
        获取用户列表（仅管理员可用）
        
        Args:
            page: 页码
            page_size: 每页数量
            search: 搜索关键词（用户名或邮箱）
            is_active: 是否激活
            is_admin: 是否管理员
            
        Returns:
            Tuple[用户列表, 总数量]
        """
        with self._get_db_session() as session:
            # 构建查询
            stmt = select(User)
            
            # 添加过滤条件
            if search:
                stmt = stmt.where(
                    or_(
                        User.username.ilike(f"%{search}%"),
                        User.email.ilike(f"%{search}%"),
                        User.display_name.ilike(f"%{search}%")
                    )
                )
            
            if is_active is not None:
                stmt = stmt.where(User.is_active == is_active)
            
            if is_admin is not None:
                stmt = stmt.where(User.is_admin == is_admin)
            
            # 计算总数
            count_stmt = select(func.count()).select_from(stmt.subquery())
            total_count = session.execute(count_stmt).scalar()
            
            # 分页
            offset = (page - 1) * page_size
            stmt = stmt.order_by(User.created_at.desc()).offset(offset).limit(page_size)
            
            # 执行查询
            users = session.execute(stmt).scalars().all()
            
            # 转换为字典列表
            user_list = []
            for user in users:
                user_list.append({
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "display_name": user.display_name,
                    "is_admin": user.is_admin,
                    "is_active": user.is_active,
                    "created_at": user.created_at,
                    "updated_at": user.updated_at,
                    "last_login_at": user.last_login_at
                })
            
            return user_list, total_count
    
    def update_user(self, user_id: str, **kwargs) -> Tuple[bool, str, Optional[Dict]]:
        """
        更新用户信息（仅管理员可用）
        
        Args:
            user_id: 用户ID
            **kwargs: 要更新的字段
            
        Returns:
            Tuple[是否成功, 错误信息, 更新后的用户信息]
        """
        with self._get_db_session() as session:
            # 查找用户
            stmt = select(User).where(User.id == user_id)
            user = session.execute(stmt).scalar_one_or_none()
            
            if not user:
                return False, "用户不存在", None
            
            # 更新字段
            allowed_fields = ["username", "email", "display_name", "is_active", "is_admin"]
            updated_fields = []
            
            for field, value in kwargs.items():
                if field in allowed_fields and hasattr(user, field):
                    # 验证用户名唯一性
                    if field == "username" and value != user.username:
                        existing_user = session.execute(
                            select(User).where(User.username == value)
                        ).scalar_one_or_none()
                        if existing_user:
                            return False, "用户名已存在", None
                    
                    # 验证邮箱唯一性
                    if field == "email" and value and value != user.email:
                        existing_user = session.execute(
                            select(User).where(User.email == value)
                        ).scalar_one_or_none()
                        if existing_user:
                            return False, "邮箱已存在", None
                    
                    setattr(user, field, value)
                    updated_fields.append(field)
            
            if not updated_fields:
                return False, "没有需要更新的字段", None
            
            # 更新更新时间
            user.updated_at = datetime.now()
            
            session.commit()
            
            # 使缓存失效
            self._invalidate_user_cache(user_id)
            
            # 返回更新后的用户信息
            updated_user = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "display_name": user.display_name,
                "is_admin": user.is_admin,
                "is_active": user.is_active,
                "created_at": user.created_at,
                "updated_at": user.updated_at,
                "last_login_at": user.last_login_at
            }
            
            return True, "用户信息更新成功", updated_user
    
    def delete_user(self, user_id: str, current_user_id: str) -> Tuple[bool, str]:
        """
        删除用户（仅管理员可用，不能删除自己）
        
        Args:
            user_id: 要删除的用户ID
            current_user_id: 当前管理员用户ID
            
        Returns:
            Tuple[是否成功, 错误信息]
        """
        if user_id == current_user_id:
            return False, "不能删除自己的账户"
        
        with self._get_db_session() as session:
            # 查找用户
            stmt = select(User).where(User.id == user_id)
            user = session.execute(stmt).scalar_one_or_none()
            
            if not user:
                return False, "用户不存在"
            
            # 删除用户相关的会话
            session.execute(
                delete(UserSession).where(UserSession.user_id == user_id)
            )
            
            # 删除用户相关的模板
            session.execute(
                delete(UserTemplate).where(UserTemplate.user_id == user_id)
            )
            
            # 删除用户相关的偏好设置
            session.execute(
                delete(UserPreference).where(UserPreference.user_id == user_id)
            )
            
            # 删除用户
            session.delete(user)
            session.commit()
            
            # 使缓存失效
            self._invalidate_user_cache(user_id)
            
            return True, "用户删除成功"
    
    def refresh_session(self, refresh_token: str, 
                       user_agent: str = None, ip_address: str = None) -> Tuple[bool, str, Optional[Dict]]:
        """
        刷新会话令牌
        
        Args:
            refresh_token: 刷新令牌
            user_agent: 用户代理（可选）
            ip_address: IP地址（可选）
            
        Returns:
            Tuple[是否成功, 错误信息, 新会话信息]
        """
        with self._get_db_session() as session:
            # 查找会话
            stmt = select(UserSession).where(
                UserSession.refresh_token == refresh_token,
                UserSession.is_active == True
            )
            user_session = session.execute(stmt).scalar_one_or_none()
            
            if not user_session:
                return False, "刷新令牌无效", None
            
            # 检查刷新令牌是否过期
            if user_session.expires_at < datetime.now():
                # 标记旧会话为无效
                user_session.is_active = False
                session.commit()
                return False, "刷新令牌已过期", None
            
            # 查找用户
            stmt = select(User).where(
                User.id == user_session.user_id,
                User.is_active == True
            )
            user = session.execute(stmt).scalar_one_or_none()
            
            if not user:
                return False, "用户不存在或已被禁用", None
            
            # 标记旧会话为无效
            user_session.is_active = False
            
            # 创建新会话
            new_session_token = PasswordHasher.generate_session_token()
            new_refresh_token = PasswordHasher.generate_refresh_token()
            
            expires_at = datetime.now() + timedelta(hours=self.session_expiry_hours)
            refresh_expires_at = datetime.now() + timedelta(days=self.refresh_token_expiry_days)
            
            new_session = UserSession(
                user_id=user.id,
                session_token=new_session_token,
                refresh_token=new_refresh_token,
                user_agent=user_agent or user_session.user_agent,
                ip_address=ip_address or user_session.ip_address,
                is_active=True,
                created_at=datetime.now(),
                expires_at=expires_at,
                last_used_at=datetime.now()
            )
            
            session.add(new_session)
            session.commit()
            
            # 准备返回数据
            session_info = {
                "user_id": user.id,
                "username": user.username,
                "display_name": user.display_name,
                "email": user.email,
                "is_admin": user.is_admin,
                "session_token": new_session_token,
                "refresh_token": new_refresh_token,
                "expires_at": expires_at.isoformat(),
                "refresh_expires_at": refresh_expires_at.isoformat()
            }
            
            logging.info(f"会话刷新成功: {user.username} (ID: {user.id})")
            return True, "会话刷新成功", session_info
    
    def logout_user(self, session_token: str) -> Tuple[bool, str]:
        """
        用户登出
        
        Args:
            session_token: 会话令牌
            
        Returns:
            Tuple[是否成功, 错误信息]
        """
        with self._get_db_session() as session:
            # 查找会话
            stmt = select(UserSession).where(
                UserSession.session_token == session_token,
                UserSession.is_active == True
            )
            user_session = session.execute(stmt).scalar_one_or_none()
            
            if not user_session:
                return False, "会话无效"
            
            # 标记会话为无效
            user_session.is_active = False
            session.commit()
            
            logging.info(f"用户登出成功: 会话 {session_token}")
            return True, "登出成功"
    
    def logout_all_sessions(self, user_id: str) -> Tuple[bool, str]:
        """
        登出用户的所有会话
        
        Args:
            user_id: 用户ID
            
        Returns:
            Tuple[是否成功, 错误信息]
        """
        with self._get_db_session() as session:
            # 更新所有活跃会话
            stmt = update(UserSession).where(
                UserSession.user_id == user_id,
                UserSession.is_active == True
            ).values(is_active=False)
            
            result = session.execute(stmt)
            session.commit()
            
            logging.info(f"用户所有会话已登出: 用户ID {user_id}, 登出会话数: {result.rowcount}")
            return True, f"已登出 {result.rowcount} 个会话"
    
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """
        根据ID获取用户
        
        Args:
            user_id: 用户ID
            
        Returns:
            用户对象或None
        """
        with self._get_db_session() as session:
            stmt = select(User).where(User.id == user_id, User.is_active == True)
            return session.execute(stmt).scalar_one_or_none()
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """
        根据用户名获取用户
        
        Args:
            username: 用户名
            
        Returns:
            用户对象或None
        """
        with self._get_db_session() as session:
            stmt = select(User).where(User.username == username, User.is_active == True)
            return session.execute(stmt).scalar_one_or_none()
    
    def update_user_profile(self, user_id: str, **kwargs) -> Tuple[bool, str, Optional[User]]:
        """
        更新用户资料
        
        Args:
            user_id: 用户ID
            **kwargs: 要更新的字段
            
        Returns:
            Tuple[是否成功, 错误信息, 更新后的用户对象]
        """
        allowed_fields = {"display_name", "email"}
        update_fields = {k: v for k, v in kwargs.items() if k in allowed_fields}
        
        if not update_fields:
            return False, "没有有效的更新字段", None
        
        # 验证邮箱
        if "email" in update_fields and update_fields["email"]:
            is_valid, error_msg = EmailValidator.validate_email(update_fields["email"])
            if not is_valid:
                return False, error_msg, None
        
        with self._get_db_session() as session:
            # 检查邮箱是否已被其他用户使用
            if "email" in update_fields and update_fields["email"]:
                stmt = select(User).where(
                    User.email == update_fields["email"],
                    User.id != user_id
                )
                existing_user = session.execute(stmt).scalar_one_or_none()
                if existing_user:
                    return False, "邮箱已被其他用户使用", None
            
            # 更新用户
            stmt = update(User).where(
                User.id == user_id,
                User.is_active == True
            ).values(
                **update_fields,
                updated_at=datetime.now()
            ).returning(User)
            
            result = session.execute(stmt)
            user = result.scalar_one_or_none()
            
            if not user:
                return False, "用户不存在或已被禁用", None
            
            session.commit()
            
            logging.info(f"用户资料更新成功: 用户ID {user_id}")
            return True, "资料更新成功", user
    
    def change_password(self, user_id: str, old_password: str, new_password: str) -> Tuple[bool, str]:
        """
        修改密码
        
        Args:
            user_id: 用户ID
            old_password: 旧密码
            new_password: 新密码
            
        Returns:
            Tuple[是否成功, 错误信息]
        """
        # 验证新密码
        is_valid, error_msg = PasswordValidator.validate_password(new_password)
        if not is_valid:
            return False, error_msg
        
        with self._get_db_session() as session:
            # 获取用户
            stmt = select(User).where(User.id == user_id, User.is_active == True)
            user = session.execute(stmt).scalar_one_or_none()
            
            if not user:
                return False, "用户不存在或已被禁用"
            
            # 验证旧密码
            if not PasswordHasher.verify_password(old_password, user.password_hash, user.salt):
                return False, "旧密码错误"
            
            # 哈希新密码
            new_password_hash, new_salt = PasswordHasher.hash_password(new_password)
            
            # 更新密码
            user.password_hash = new_password_hash
            user.salt = new_salt
            user.updated_at = datetime.now()
            
            # 登出所有会话
            logout_stmt = update(UserSession).where(
                UserSession.user_id == user_id,
                UserSession.is_active == True
            ).values(is_active=False)
            
            session.execute(logout_stmt)
            session.commit()
            
            logging.info(f"密码修改成功: 用户ID {user_id}")
            return True, "密码修改成功，所有会话已登出"
    
    def cleanup_expired_sessions(self) -> int:
        """
        清理过期会话
        
        Returns:
            清理的会话数量
        """
        with self._get_db_session() as session:
            # 标记过期会话为无效
            stmt = update(UserSession).where(
                UserSession.expires_at < datetime.now(),
                UserSession.is_active == True
            ).values(is_active=False)
            
            result = session.execute(stmt)
            cleaned_count = result.rowcount
            
            # 删除过期的刷新令牌会话（超过刷新令牌过期时间30天）
            cutoff_date = datetime.now() - timedelta(days=self.refresh_token_expiry_days + 30)
            delete_stmt = delete(UserSession).where(
                UserSession.expires_at < cutoff_date,
                UserSession.is_active == False
            )
            
            delete_result = session.execute(delete_stmt)
            deleted_count = delete_result.rowcount
            
            session.commit()
            
            if cleaned_count > 0 or deleted_count > 0:
                logging.info(f"清理会话: 标记 {cleaned_count} 个过期会话为无效，删除 {deleted_count} 个旧会话")
            
            return cleaned_count + deleted_count
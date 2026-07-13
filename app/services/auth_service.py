import re
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.user_models import User
from app.user_manager import hash_password, verify_password


class AuthService:
    """用户认证服务类"""
    
    # 认证配置
    MAX_LOGIN_FAIL_COUNT = 5  # 最大登录失败次数
    ACCOUNT_LOCK_MINUTES = 15  # 账户锁定时间（分钟）
    USERNAME_MIN_LENGTH = 3  # 用户名最小长度
    USERNAME_MAX_LENGTH = 20  # 用户名最大长度
    PASSWORD_MIN_LENGTH = 6  # 密码最小长度
    
    def __init__(self, session: Session):
        self.session = session
    
    def _validate_username(self, username: str) -> tuple[bool, str]:
        """验证用户名格式
        
        Args:
            username: 用户名
            
        Returns:
            tuple[bool, str]: (是否有效, 错误消息)
        """
        if not username:
            return False, "用户名不能为空"
        
        if len(username) < self.USERNAME_MIN_LENGTH:
            return False, f"用户名长度不能少于{self.USERNAME_MIN_LENGTH}位"
        
        if len(username) > self.USERNAME_MAX_LENGTH:
            return False, f"用户名长度不能超过{self.USERNAME_MAX_LENGTH}位"
        
        # 只允许字母、数字、下划线
        if not re.match(r'^[a-zA-Z0-9_]+$', username):
            return False, "用户名只能包含字母、数字和下划线"
        
        return True, ""
    
    def _validate_password(self, password: str) -> tuple[bool, str]:
        """验证密码格式
        
        Args:
            password: 密码
            
        Returns:
            tuple[bool, str]: (是否有效, 错误消息)
        """
        if not password:
            return False, "密码不能为空"
        
        if len(password) < self.PASSWORD_MIN_LENGTH:
            return False, f"密码长度不能少于{self.PASSWORD_MIN_LENGTH}位"
        
        return True, ""
    
    def _create_new_user(self, username: str, password: str) -> tuple[bool, str, Optional[User]]:
        """创建新用户
        
        Args:
            username: 用户名
            password: 密码
            
        Returns:
            tuple[bool, str, Optional[User]]: (是否成功, 消息, 用户对象)
        """
        # 验证用户名
        valid, msg = self._validate_username(username)
        if not valid:
            return False, msg, None
        
        # 验证密码
        valid, msg = self._validate_password(password)
        if not valid:
            return False, msg, None
        
        # 检查用户名是否已存在
        stmt = select(User).where(User.username == username)
        result = self.session.execute(stmt)
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            return False, "用户名已存在", None
        
        # 加密密码
        password_data = hash_password(password)
        
        # 创建用户
        user = User(
            username=username,
            password_hash=password_data['hash'],
            password_salt=password_data['salt'],
            algorithm=password_data['algorithm'],
            iterations=password_data['iterations'],
            level=1,  # 默认为普通用户
            is_active=True,
            created_at=datetime.utcnow(),
            login_fail_count=0
        )
        
        # 保存到数据库
        self.session.add(user)
        self.session.commit()
        
        return True, "用户创建成功", user
    
    def authenticate(self, username: str, password: str) -> tuple[bool, str, Optional[User]]:
        """用户认证
        
        Args:
            username: 用户名
            password: 密码
            
        Returns:
            tuple[bool, str, Optional[User]]: (是否成功, 消息, 用户对象)
        """
        # 查询用户
        stmt = select(User).where(User.username == username)
        result = self.session.execute(stmt)
        user = result.scalar_one_or_none()
        
        # 如果用户不存在，自动创建新用户
        if not user:
            return self._create_new_user(username, password)
        
        # 检查账户是否锁定
        if user.locked_until and datetime.utcnow() < user.locked_until:
            remaining_minutes = int((user.locked_until - datetime.utcnow()).total_seconds() / 60) + 1
            return False, f"账户已锁定，请{remaining_minutes}分钟后再试", None
        
        # 检查账户是否可用
        if not user.is_active:
            return False, "账户已被禁用", None
        
        # 验证密码
        try:
            password_valid = verify_password(
                password,
                user.password_hash,
                user.password_salt,
                user.algorithm,
                user.iterations
            )
        except Exception as e:
            return False, f"密码验证失败: {str(e)}", None
        
        if not password_valid:
            # 密码错误，增加失败计数
            user.login_fail_count += 1
            
            # 检查是否达到最大失败次数
            if user.login_fail_count >= self.MAX_LOGIN_FAIL_COUNT:
                user.locked_until = datetime.utcnow() + timedelta(minutes=self.ACCOUNT_LOCK_MINUTES)
                self.session.commit()
                return False, f"密码错误次数过多，账户已锁定{self.ACCOUNT_LOCK_MINUTES}分钟", None
            
            self.session.commit()
            remaining_attempts = self.MAX_LOGIN_FAIL_COUNT - user.login_fail_count
            return False, f"密码错误，还剩{remaining_attempts}次尝试机会", None
        
        # 密码正确，重置失败计数和锁定时间
        user.login_fail_count = 0
        user.locked_until = None
        user.last_login = datetime.utcnow()
        self.session.commit()
        
        return True, "登录成功", user
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """根据ID获取用户
        
        Args:
            user_id: 用户ID
            
        Returns:
            Optional[User]: 用户对象或None
        """
        stmt = select(User).where(User.id == user_id)
        result = self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """根据用户名获取用户
        
        Args:
            username: 用户名
            
        Returns:
            Optional[User]: 用户对象或None
        """
        stmt = select(User).where(User.username == username)
        result = self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    def update_user_level(self, user_id: int, level: int) -> tuple[bool, str]:
        """更新用户等级
        
        Args:
            user_id: 用户ID
            level: 新等级
            
        Returns:
            tuple[bool, str]: (是否成功, 消息)
        """
        user = self.get_user_by_id(user_id)
        if not user:
            return False, "用户不存在"
        
        if level < 1 or level > 3:
            return False, "等级必须在1-3之间"
        
        user.level = level
        self.session.commit()
        
        return True, "等级更新成功"
    
    def update_user_status(self, user_id: int, is_active: bool) -> tuple[bool, str]:
        """更新用户状态
        
        Args:
            user_id: 用户ID
            is_active: 是否可用
            
        Returns:
            tuple[bool, str]: (是否成功, 消息)
        """
        user = self.get_user_by_id(user_id)
        if not user:
            return False, "用户不存在"
        
        user.is_active = is_active
        self.session.commit()
        
        return True, "状态更新成功"
    
    def unlock_user(self, user_id: int) -> tuple[bool, str]:
        """解锁用户账户
        
        Args:
            user_id: 用户ID
            
        Returns:
            tuple[bool, str]: (是否成功, 消息)
        """
        user = self.get_user_by_id(user_id)
        if not user:
            return False, "用户不存在"
        
        user.login_fail_count = 0
        user.locked_until = None
        self.session.commit()
        
        return True, "账户已解锁"
    
    def change_password(self, user_id: int, old_password: str, new_password: str) -> tuple[bool, str]:
        """修改密码
        
        Args:
            user_id: 用户ID
            old_password: 旧密码
            new_password: 新密码
            
        Returns:
            tuple[bool, str]: (是否成功, 消息)
        """
        user = self.get_user_by_id(user_id)
        if not user:
            return False, "用户不存在"
        
        # 验证旧密码
        try:
            password_valid = verify_password(
                old_password,
                user.password_hash,
                user.password_salt,
                user.algorithm,
                user.iterations
            )
        except Exception as e:
            return False, f"密码验证失败: {str(e)}"
        
        if not password_valid:
            return False, "旧密码错误"
        
        # 验证新密码
        valid, msg = self._validate_password(new_password)
        if not valid:
            return False, msg
        
        # 加密新密码
        password_data = hash_password(new_password)
        
        # 更新密码
        user.password_hash = password_data['hash']
        user.password_salt = password_data['salt']
        user.algorithm = password_data['algorithm']
        user.iterations = password_data['iterations']
        self.session.commit()
        
        return True, "密码修改成功"

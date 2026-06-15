import hashlib
import hmac
import os
import base64
import secrets
from typing import Tuple


class PasswordHasher:
    """密码哈希工具类"""
    
    # 使用PBKDF2进行密码哈希
    HASH_ALGORITHM = "sha256"
    ITERATIONS = 100000
    SALT_SIZE = 32
    KEY_SIZE = 32
    
    @classmethod
    def generate_salt(cls) -> str:
        """生成随机盐值"""
        return secrets.token_hex(cls.SALT_SIZE)
    
    @classmethod
    def hash_password(cls, password: str, salt: str = None) -> Tuple[str, str]:
        """
        哈希密码
        
        Args:
            password: 明文密码
            salt: 盐值，如果为None则生成新盐值
            
        Returns:
            Tuple[哈希密码, 盐值]
        """
        if salt is None:
            salt = cls.generate_salt()
        
        # 将盐值从hex转换为bytes
        salt_bytes = bytes.fromhex(salt)
        
        # 使用PBKDF2进行哈希
        password_bytes = password.encode('utf-8')
        hashed = hashlib.pbkdf2_hmac(
            cls.HASH_ALGORITHM,
            password_bytes,
            salt_bytes,
            cls.ITERATIONS,
            dklen=cls.KEY_SIZE
        )
        
        # 将哈希结果转换为hex
        hashed_hex = hashed.hex()
        
        return hashed_hex, salt
    
    @classmethod
    def verify_password(cls, password: str, hashed_password: str, salt: str) -> bool:
        """
        验证密码
        
        Args:
            password: 待验证的明文密码
            hashed_password: 存储的哈希密码
            salt: 存储的盐值
            
        Returns:
            bool: 密码是否匹配
        """
        # 计算输入密码的哈希
        test_hash, _ = cls.hash_password(password, salt)
        
        # 使用恒定时间比较防止时序攻击
        return hmac.compare_digest(test_hash, hashed_password)
    
    @classmethod
    def generate_session_token(cls) -> str:
        """生成会话令牌"""
        return secrets.token_urlsafe(32)
    
    @classmethod
    def generate_refresh_token(cls) -> str:
        """生成刷新令牌"""
        return secrets.token_urlsafe(64)


class PasswordValidator:
    """密码验证器"""
    
    MIN_LENGTH = 8
    MAX_LENGTH = 128
    
    @classmethod
    def validate_password(cls, password: str) -> Tuple[bool, str]:
        """
        验证密码强度
        
        Args:
            password: 待验证的密码
            
        Returns:
            Tuple[是否有效, 错误信息]
        """
        if not password:
            return False, "密码不能为空"
        
        if len(password) < cls.MIN_LENGTH:
            return False, f"密码长度至少需要{cls.MIN_LENGTH}个字符"
        
        if len(password) > cls.MAX_LENGTH:
            return False, f"密码长度不能超过{cls.MAX_LENGTH}个字符"
        
        # 检查是否包含至少一个数字
        if not any(char.isdigit() for char in password):
            return False, "密码必须包含至少一个数字"
        
        # 检查是否包含至少一个小写字母
        if not any(char.islower() for char in password):
            return False, "密码必须包含至少一个小写字母"
        
        # 检查是否包含至少一个大写字母
        if not any(char.isupper() for char in password):
            return False, "密码必须包含至少一个大写字母"
        
        # 检查是否包含至少一个特殊字符
        special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
        if not any(char in special_chars for char in password):
            return False, "密码必须包含至少一个特殊字符 (!@#$%^&*()_+-=[]{}|;:,.<>?)"
        
        return True, "密码有效"


class UsernameValidator:
    """用户名验证器"""
    
    MIN_LENGTH = 3
    MAX_LENGTH = 50
    ALLOWED_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-."
    
    @classmethod
    def validate_username(cls, username: str) -> Tuple[bool, str]:
        """
        验证用户名
        
        Args:
            username: 待验证的用户名
            
        Returns:
            Tuple[是否有效, 错误信息]
        """
        if not username:
            return False, "用户名不能为空"
        
        if len(username) < cls.MIN_LENGTH:
            return False, f"用户名长度至少需要{cls.MIN_LENGTH}个字符"
        
        if len(username) > cls.MAX_LENGTH:
            return False, f"用户名长度不能超过{cls.MAX_LENGTH}个字符"
        
        # 检查是否只包含允许的字符
        for char in username:
            if char not in cls.ALLOWED_CHARS:
                return False, f"用户名只能包含字母、数字、下划线(_)、连字符(-)和点(.)"
        
        # 检查是否以字母开头
        if not username[0].isalpha():
            return False, "用户名必须以字母开头"
        
        # 检查是否以字母或数字结尾
        if not username[-1].isalnum():
            return False, "用户名必须以字母或数字结尾"
        
        # 检查不能连续出现两个点
        if ".." in username:
            return False, "用户名不能包含连续的点"
        
        # 检查不能以点开头或结尾
        if username.startswith(".") or username.endswith("."):
            return False, "用户名不能以点开头或结尾"
        
        return True, "用户名有效"


class EmailValidator:
    """邮箱验证器"""
    
    @classmethod
    def validate_email(cls, email: str) -> Tuple[bool, str]:
        """
        验证邮箱格式
        
        Args:
            email: 待验证的邮箱
            
        Returns:
            Tuple[是否有效, 错误信息]
        """
        if not email:
            return True, ""  # 邮箱可以为空
        
        # 基本格式检查
        if "@" not in email:
            return False, "邮箱格式无效"
        
        parts = email.split("@")
        if len(parts) != 2:
            return False, "邮箱格式无效"
        
        local_part, domain_part = parts
        
        # 检查本地部分
        if not local_part:
            return False, "邮箱本地部分不能为空"
        
        # 检查域名部分
        if not domain_part:
            return False, "邮箱域名部分不能为空"
        
        if "." not in domain_part:
            return False, "邮箱域名格式无效"
        
        # 检查域名后缀
        domain_parts = domain_part.split(".")
        if len(domain_parts) < 2:
            return False, "邮箱域名格式无效"
        
        for part in domain_parts:
            if not part:
                return False, "邮箱域名部分不能为空"
        
        return True, "邮箱格式有效"
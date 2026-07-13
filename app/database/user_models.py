from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.database.models import Base, to_dict


class User(Base):
    """用户表模型"""
    __tablename__ = 'users'

    id = Column('user_id', String(128), primary_key=True)  # 映射user_id到id属性
    username = Column(String(256), nullable=True, index=True)
    password_hash = Column(String(256), nullable=False)
    password_salt = Column(String(64), nullable=False)
    algorithm = Column(String(32), nullable=False, default='pbkdf2_sha256')
    iterations = Column(Integer, nullable=False, default=100000)
    created_at = Column(DateTime, nullable=True, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)  # 最后登录时间
    is_admin = Column(Boolean, nullable=True, default=False)  # 是否为管理员
    level = Column(Integer, nullable=True, default=1)  # 用户等级：1=普通用户, 2=高级用户, 3=管理员
    is_active = Column(Boolean, nullable=True, default=True, index=True)  # 账户是否可用
    login_fail_count = Column(Integer, nullable=True, default=0)  # 登录失败次数
    locked_until = Column(DateTime, nullable=True)  # 账户锁定截止时间

    def to_dict(self, include_none: bool = False) -> dict:
        """将用户对象转换为字典（不包含敏感信息）"""
        result = {
            'id': self.id,
            'username': self.username,
            'level': self.level,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
        }
        if include_none:
            result['login_fail_count'] = self.login_fail_count
            result['locked_until'] = self.locked_until.isoformat() if self.locked_until else None
        return result

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', level={self.level}, is_active={self.is_active})>"


class CaptchaSession(Base):
    """验证码会话表模型"""
    __tablename__ = 'captcha_sessions'

    id = Column(String(64), primary_key=True)  # UUID作为主键
    captcha_text = Column(String(10), nullable=False)  # 验证码文本
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)  # 过期时间
    is_used = Column(Boolean, nullable=False, default=False)  # 是否已使用

    def to_dict(self, include_none: bool = False) -> dict:
        """将验证码会话对象转换为字典"""
        return {
            'id': self.id,
            'captcha_text': self.captcha_text,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'is_used': self.is_used,
        }

    def __repr__(self):
        return f"<CaptchaSession(id='{self.id}', captcha_text='{self.captcha_text}', is_used={self.is_used})>"

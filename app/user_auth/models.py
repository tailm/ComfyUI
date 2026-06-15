from __future__ import annotations

import uuid
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy import (
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    LargeBinary,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.models import Base


class User(Base):
    """用户表，存储用户认证信息"""
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    username: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True, index=True)
    display_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # 密码哈希存储
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    salt: Mapped[str] = mapped_column(String(64), nullable=False)
    
    # 用户状态
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    
    # 时间戳
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False), nullable=False, default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False), nullable=False, default=func.now(), onupdate=func.now()
    )
    last_login_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=False), nullable=True
    )
    
    # 关系
    sessions: Mapped[list[UserSession]] = relationship(
        "UserSession",
        back_populates="user",
        cascade="all,delete-orphan",
        passive_deletes=True,
    )
    user_templates: Mapped[list[UserTemplate]] = relationship(
        "UserTemplate",
        back_populates="user",
        cascade="all,delete-orphan",
        passive_deletes=True,
    )
    
    __table_args__ = (
        Index("ix_users_username", "username"),
        Index("ix_users_email", "email"),
        Index("ix_users_created_at", "created_at"),
    )
    
    def __repr__(self) -> str:
        return f"<User id={self.id} username={self.username}>"


class UserSession(Base):
    """用户会话表，存储登录会话"""
    __tablename__ = "user_sessions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    
    # 会话令牌
    session_token: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    refresh_token: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True, index=True)
    
    # 设备信息
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)  # IPv6支持
    
    # 会话状态
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    
    # 时间戳
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False), nullable=False, default=func.now()
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False), nullable=False
    )
    last_used_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False), nullable=False, default=func.now()
    )
    
    # 关系
    user: Mapped[User] = relationship(
        "User",
        back_populates="sessions",
        foreign_keys=[user_id],
    )
    
    __table_args__ = (
        Index("ix_user_sessions_session_token", "session_token"),
        Index("ix_user_sessions_refresh_token", "refresh_token"),
        Index("ix_user_sessions_expires_at", "expires_at"),
        Index("ix_user_sessions_user_id_is_active", "user_id", "is_active"),
    )
    
    def __repr__(self) -> str:
        return f"<UserSession id={self.id} user_id={self.user_id}>"


class UserTemplate(Base):
    """用户模板表，存储用户自定义的工作流模板"""
    __tablename__ = "user_templates"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    
    # 模板信息
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # 模板内容
    workflow_data: Mapped[str] = mapped_column(Text, nullable=False)  # JSON格式的工作流数据
    thumbnail: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # 缩略图base64或路径
    
    # 模板元数据
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    tags: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # 逗号分隔的标签
    
    # 可见性设置
    is_public: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_favorite: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    
    # 统计信息
    view_count: Mapped[int] = mapped_column(default=0, nullable=False)
    use_count: Mapped[int] = mapped_column(default=0, nullable=False)
    
    # 时间戳
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False), nullable=False, default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False), nullable=False, default=func.now(), onupdate=func.now()
    )
    
    # 关系
    user: Mapped[User] = relationship(
        "User",
        back_populates="user_templates",
        foreign_keys=[user_id],
    )
    
    __table_args__ = (
        Index("ix_user_templates_user_id", "user_id"),
        Index("ix_user_templates_name", "name"),
        Index("ix_user_templates_category", "category"),
        Index("ix_user_templates_is_public", "is_public"),
        Index("ix_user_templates_is_favorite", "is_favorite"),
        Index("ix_user_templates_created_at", "created_at"),
        Index("ix_user_templates_user_id_name", "user_id", "name", unique=True),
    )
    
    def __repr__(self) -> str:
        return f"<UserTemplate id={self.id} name={self.name} user_id={self.user_id}>"


class UserPreference(Base):
    """用户偏好设置表"""
    __tablename__ = "user_preferences"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    
    # UI设置
    theme: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, default="light")
    language: Mapped[Optional[str]] = mapped_column(String(10), nullable=True, default="en")
    
    # 工作流设置
    auto_save: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    auto_save_interval: Mapped[int] = mapped_column(default=30000, nullable=False)  # 毫秒
    
    # 编辑器设置
    show_minimap: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    show_grid: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    snap_to_grid: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    
    # 节点设置
    show_advanced_widgets: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    show_node_titles: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    
    # 时间戳
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False), nullable=False, default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False), nullable=False, default=func.now(), onupdate=func.now()
    )
    
    # 关系
    user: Mapped[User] = relationship(
        "User",
        foreign_keys=[user_id],
    )
    
    def __repr__(self) -> str:
        return f"<UserPreference user_id={self.user_id}>"
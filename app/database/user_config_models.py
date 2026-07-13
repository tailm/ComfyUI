"""
User Configuration Models

Defines ORM models for user-level configuration storage.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import (
    Boolean,
    DateTime,
    Index,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.assets.helpers import get_utc_now
from app.database.models import Base


class UserConfig(Base):
    """
    User configuration storage model.
    
    Stores user-specific configuration settings with support for:
    - Multiple configuration types (json, string, number, boolean)
    - Encrypted values for sensitive data
    - System configuration inheritance
    """
    
    __tablename__ = "user_configs"
    
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(String(128), nullable=False)
    config_key: Mapped[str] = mapped_column(String(512), nullable=False)
    config_value: Mapped[str] = mapped_column(Text, nullable=False)
    config_type: Mapped[str] = mapped_column(
        String(32), nullable=False, default="string"
    )  # json, string, number, boolean
    is_encrypted: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False), nullable=False, default=get_utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False), nullable=False, default=get_utc_now
    )
    
    __table_args__ = (
        UniqueConstraint(
            "user_id", "config_key", 
            name="uq_user_configs_user_id_config_key"
        ),
        Index("ix_user_configs_user_id", "user_id"),
        Index("ix_user_configs_config_key", "config_key"),
        Index("ix_user_configs_user_key", "user_id", "config_key"),
        Index("ix_user_configs_updated_at", "updated_at"),
    )
    
    def to_dict(self, include_none: bool = False) -> dict[str, Any]:
        """
        Convert the model to a dictionary.
        
        Args:
            include_none: Whether to include None values
            
        Returns:
            Dictionary representation
        """
        result = {
            'id': self.id,
            'user_id': self.user_id,
            'config_key': self.config_key,
            'config_value': self.config_value,
            'config_type': self.config_type,
            'is_encrypted': self.is_encrypted,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        return result
    
    def __repr__(self) -> str:
        return f"<UserConfig id={self.id} user={self.user_id} key={self.config_key!r}>"

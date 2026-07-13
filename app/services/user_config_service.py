"""
User Configuration Service

Provides user-isolated access to user configuration settings.
"""

import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import select, and_
from sqlalchemy.orm import Session

from app.database.user_config_models import UserConfig
from app.assets.helpers import get_utc_now

logger = logging.getLogger(__name__)


class UserConfigService:
    """
    Service for managing user configuration with user isolation.
    
    All methods enforce user_id filtering to ensure data isolation.
    Supports configuration inheritance from system defaults.
    """
    
    # System default configurations
    SYSTEM_DEFAULTS = {
        'ui.theme': 'dark',
        'ui.language': 'en',
        'ui.sidebar_collapsed': 'false',
        'execution.auto_save': 'true',
        'execution.max_history': '100',
        'notification.enabled': 'true',
        'notification.sound': 'true',
    }
    
    def __init__(self, session: Session, user_id: str):
        """
        Initialize the user configuration service.
        
        Args:
            session: Database session
            user_id: Current user's ID
        """
        self.session = session
        self.user_id = user_id
    
    def get_config(
        self,
        config_key: str,
        include_system: bool = True
    ) -> Optional[Dict[str, Any]]:
        """
        Get a configuration value.
        
        Args:
            config_key: Configuration key
            include_system: Whether to fall back to system default
            
        Returns:
            Configuration dictionary or None
        """
        # Try to get user config
        stmt = select(UserConfig).where(
            and_(
                UserConfig.user_id == self.user_id,
                UserConfig.config_key == config_key
            )
        )
        result = self.session.execute(stmt)
        config = result.scalar_one_or_none()
        
        if config:
            return self._deserialize_value(config.config_value, config.config_type)
        
        # Fall back to system default
        if include_system and config_key in self.SYSTEM_DEFAULTS:
            default_value = self.SYSTEM_DEFAULTS[config_key]
            return self._deserialize_value(default_value, self._infer_type(default_value))
        
        return None
    
    def set_config(
        self,
        config_key: str,
        config_value: Any,
        config_type: Optional[str] = None,
        is_encrypted: bool = False
    ) -> UserConfig:
        """
        Set a configuration value.
        
        Args:
            config_key: Configuration key
            config_value: Configuration value
            config_type: Configuration type (auto-detected if not specified)
            is_encrypted: Whether the value should be encrypted
            
        Returns:
            Created or updated UserConfig object
        """
        # Auto-detect type if not specified
        if config_type is None:
            config_type = self._infer_type(config_value)
        
        # Serialize value
        serialized_value = self._serialize_value(config_value, config_type)
        
        # Check if config already exists
        stmt = select(UserConfig).where(
            and_(
                UserConfig.user_id == self.user_id,
                UserConfig.config_key == config_key
            )
        )
        result = self.session.execute(stmt)
        config = result.scalar_one_or_none()
        
        if config:
            # Update existing config
            config.config_value = serialized_value
            config.config_type = config_type
            config.is_encrypted = is_encrypted
            config.updated_at = get_utc_now()
        else:
            # Create new config
            config = UserConfig(
                user_id=self.user_id,
                config_key=config_key,
                config_value=serialized_value,
                config_type=config_type,
                is_encrypted=is_encrypted
            )
            self.session.add(config)
        
        self.session.commit()
        logger.info(f"Set config '{config_key}' for user '{self.user_id}'")
        
        return config
    
    def delete_config(self, config_key: str) -> bool:
        """
        Delete a configuration value.
        
        Args:
            config_key: Configuration key
            
        Returns:
            True if deleted, False if not found
        """
        stmt = select(UserConfig).where(
            and_(
                UserConfig.user_id == self.user_id,
                UserConfig.config_key == config_key
            )
        )
        result = self.session.execute(stmt)
        config = result.scalar_one_or_none()
        
        if not config:
            return False
        
        self.session.delete(config)
        self.session.commit()
        logger.info(f"Deleted config '{config_key}' for user '{self.user_id}'")
        
        return True
    
    def list_configs(
        self,
        prefix: Optional[str] = None,
        include_system: bool = False
    ) -> Dict[str, Any]:
        """
        List all configurations for the user.
        
        Args:
            prefix: Optional key prefix filter
            include_system: Whether to include system defaults
            
        Returns:
            Dictionary of configuration key-value pairs
        """
        # Build query
        stmt = select(UserConfig).where(UserConfig.user_id == self.user_id)
        
        if prefix:
            stmt = stmt.where(UserConfig.config_key.like(f"{prefix}%"))
        
        stmt = stmt.order_by(UserConfig.config_key)
        
        result = self.session.execute(stmt)
        configs = result.scalars().all()
        
        # Build result dictionary
        config_dict = {}
        for config in configs:
            config_dict[config.config_key] = self._deserialize_value(
                config.config_value, config.config_type
            )
        
        # Include system defaults if requested
        if include_system:
            for key, value in self.SYSTEM_DEFAULTS.items():
                if prefix and not key.startswith(prefix):
                    continue
                if key not in config_dict:
                    config_dict[key] = self._deserialize_value(
                        value, self._infer_type(value)
                    )
        
        return config_dict
    
    def _infer_type(self, value: Any) -> str:
        """
        Infer configuration type from value.
        
        Args:
            value: Configuration value
            
        Returns:
            Configuration type string
        """
        if isinstance(value, bool):
            return "boolean"
        elif isinstance(value, (int, float)):
            return "number"
        elif isinstance(value, (dict, list)):
            return "json"
        else:
            return "string"
    
    def _serialize_value(self, value: Any, config_type: str) -> str:
        """
        Serialize configuration value to string.
        
        Args:
            value: Configuration value
            config_type: Configuration type
            
        Returns:
            Serialized string value
        """
        if config_type == "json":
            return json.dumps(value)
        elif config_type == "boolean":
            return "true" if value else "false"
        elif config_type == "number":
            return str(value)
        else:
            return str(value)
    
    def _deserialize_value(self, value: str, config_type: str) -> Any:
        """
        Deserialize configuration value from string.
        
        Args:
            value: Serialized string value
            config_type: Configuration type
            
        Returns:
            Deserialized value
        """
        if config_type == "json":
            return json.loads(value)
        elif config_type == "boolean":
            return value.lower() == "true"
        elif config_type == "number":
            try:
                if '.' in value:
                    return float(value)
                else:
                    return int(value)
            except ValueError:
                return 0
        else:
            return value

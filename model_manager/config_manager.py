"""
ComfyUI配置管理器

管理模型配置的存储、加载和验证，支持安全存储API密钥。
"""

import os
import json
import logging
import hashlib
import base64
import getpass
from typing import Dict, List, Optional, Any, Union
from dataclasses import asdict
from datetime import datetime
import threading
from pathlib import Path

from .base import ModelConfig, RateLimitConfig, ConfigurationError

logger = logging.getLogger(__name__)


class ConfigManager:
    """配置管理器"""
    
    def __init__(self, config_dir: str = None, encrypt_keys: bool = True):
        """初始化配置管理器
        
        Args:
            config_dir: 配置目录路径，如果为None则使用默认路径
            encrypt_keys: 是否加密API密钥
        """
        if config_dir is None:
            # 默认配置目录：~/.comfyui/model_configs/
            home_dir = os.path.expanduser("~")
            config_dir = os.path.join(home_dir, ".comfyui", "model_configs")
        
        self.config_dir = Path(config_dir)
        self.encrypt_keys = encrypt_keys
        self.configs: Dict[str, ModelConfig] = {}
        self._lock = threading.RLock()
        
        # 创建配置目录
        self.config_dir.mkdir(parents=True, exist_ok=True)
        
        # 配置文件路径
        self.config_file = self.config_dir / "model_configs.json"
        self.encryption_key_file = self.config_dir / ".encryption_key"
        
        # 初始化加密密钥
        self._encryption_key = None
        if self.encrypt_keys:
            self._init_encryption_key()
        
        # 加载现有配置
        self._load_configs()
    
    def _init_encryption_key(self):
        """初始化加密密钥"""
        if self.encryption_key_file.exists():
            # 加载现有密钥
            try:
                with open(self.encryption_key_file, 'rb') as f:
                    encrypted_key = f.read()
                # 这里应该使用更安全的密钥管理
                # 简化实现：使用环境变量或用户输入
                self._encryption_key = self._derive_key_from_env()
            except Exception as e:
                logger.warning(f"Failed to load encryption key: {str(e)}")
                self._encryption_key = self._generate_encryption_key()
        else:
            # 生成新密钥
            self._encryption_key = self._generate_encryption_key()
            self._save_encryption_key()
    
    def _generate_encryption_key(self) -> bytes:
        """生成加密密钥"""
        # 使用随机字节生成密钥
        import secrets
        key = secrets.token_bytes(32)
        return key
    
    def _derive_key_from_env(self) -> bytes:
        """从环境变量派生密钥"""
        # 简化实现：使用固定密钥
        # 生产环境应该使用更安全的密钥管理
        env_key = os.environ.get("COMFYUI_MODEL_CONFIG_KEY", "default_encryption_key")
        return hashlib.sha256(env_key.encode()).digest()
    
    def _save_encryption_key(self):
        """保存加密密钥"""
        if not self._encryption_key:
            return
        
        try:
            # 简化实现：直接保存
            # 生产环境应该使用密钥管理系统
            with open(self.encryption_key_file, 'wb') as f:
                f.write(self._encryption_key)
            # 设置文件权限
            self.encryption_key_file.chmod(0o600)
        except Exception as e:
            logger.error(f"Failed to save encryption key: {str(e)}")
    
    def _encrypt_value(self, value: str) -> str:
        """加密值
        
        Args:
            value: 要加密的值
            
        Returns:
            str: 加密后的值（base64编码）
        """
        if not value or not self._encryption_key:
            return value
        
        try:
            # 简化实现：使用XOR加密（仅用于演示）
            # 生产环境应该使用AES等强加密算法
            import secrets
            from cryptography.fernet import Fernet
            
            # 生成Fernet密钥
            fernet_key = base64.urlsafe_b64encode(self._encryption_key[:32])
            cipher = Fernet(fernet_key)
            
            encrypted = cipher.encrypt(value.encode())
            return base64.b64encode(encrypted).decode()
        except Exception as e:
            logger.warning(f"Failed to encrypt value: {str(e)}")
            return value
    
    def _decrypt_value(self, encrypted_value: str) -> str:
        """解密值
        
        Args:
            encrypted_value: 加密的值（base64编码）
            
        Returns:
            str: 解密后的值
        """
        if not encrypted_value or not self._encryption_key:
            return encrypted_value
        
        try:
            # 简化实现：使用XOR解密（仅用于演示）
            # 生产环境应该使用AES等强加密算法
            from cryptography.fernet import Fernet
            
            # 生成Fernet密钥
            fernet_key = base64.urlsafe_b64encode(self._encryption_key[:32])
            cipher = Fernet(fernet_key)
            
            encrypted = base64.b64decode(encrypted_value.encode())
            decrypted = cipher.decrypt(encrypted)
            return decrypted.decode()
        except Exception as e:
            logger.warning(f"Failed to decrypt value: {str(e)}")
            return encrypted_value
    
    def _load_configs(self):
        """从文件加载配置"""
        if not self.config_file.exists():
            logger.info(f"Config file not found: {self.config_file}, starting with empty config")
            return
        
        try:
            with open(self.config_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            with self._lock:
                self.configs.clear()
                for config_data in data:
                    try:
                        # 解密API密钥
                        if self.encrypt_keys and 'api_key' in config_data and config_data['api_key']:
                            config_data['api_key'] = self._decrypt_value(config_data['api_key'])
                        
                        # 处理速率限制配置
                        if 'rate_limit' in config_data and config_data['rate_limit']:
                            rate_limit_data = config_data['rate_limit']
                            config_data['rate_limit'] = RateLimitConfig(**rate_limit_data)
                        
                        # 处理时间戳
                        if 'created_at' in config_data and config_data['created_at']:
                            config_data['created_at'] = datetime.fromisoformat(config_data['created_at'])
                        if 'updated_at' in config_data and config_data['updated_at']:
                            config_data['updated_at'] = datetime.fromisoformat(config_data['updated_at'])
                        
                        config = ModelConfig(**config_data)
                        self.configs[config.model_id] = config
                        
                    except Exception as e:
                        logger.error(f"Failed to load config: {str(e)}")
                        continue
            
            logger.info(f"Loaded {len(self.configs)} model configurations from {self.config_file}")
            
        except Exception as e:
            logger.error(f"Failed to load config file {self.config_file}: {str(e)}")
            # 创建空配置文件
            self._save_configs()
    
    def _save_configs(self):
        """保存配置到文件"""
        try:
            configs_to_save = []
            
            with self._lock:
                for config in self.configs.values():
                    config_dict = config.to_dict()
                    
                    # 加密API密钥
                    if self.encrypt_keys and config_dict.get('api_key'):
                        config_dict['api_key'] = self._encrypt_value(config_dict['api_key'])
                    
                    configs_to_save.append(config_dict)
            
            # 创建备份
            if self.config_file.exists():
                backup_file = self.config_file.with_suffix('.json.bak')
                import shutil
                shutil.copy2(self.config_file, backup_file)
            
            # 保存配置
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(configs_to_save, f, indent=2, ensure_ascii=False, default=str)
            
            # 设置文件权限
            self.config_file.chmod(0o600)
            
            logger.info(f"Saved {len(configs_to_save)} model configurations to {self.config_file}")
            
        except Exception as e:
            logger.error(f"Failed to save config file {self.config_file}: {str(e)}")
            raise ConfigurationError(f"Failed to save configurations: {str(e)}") from e
    
    def save_config(self, config: ModelConfig) -> bool:
        """保存模型配置
        
        Args:
            config: 模型配置
            
        Returns:
            bool: 是否保存成功
            
        Raises:
            ConfigurationError: 配置保存失败
        """
        try:
            # 验证配置
            if not config.model_id:
                raise ValueError("Model ID is required")
            
            if not config.model_type:
                raise ValueError("Model type is required")
            
            if not config.provider:
                raise ValueError("Provider is required")
            
            # 更新时间戳
            now = datetime.now()
            if not config.created_at:
                config.created_at = now
            config.updated_at = now
            
            with self._lock:
                self.configs[config.model_id] = config
            
            # 保存到文件
            self._save_configs()
            
            logger.info(f"Saved configuration for model: {config.model_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to save configuration for model {config.model_id}: {str(e)}")
            raise ConfigurationError(f"Failed to save configuration: {str(e)}") from e
    
    def load_config(self, model_id: str) -> Optional[ModelConfig]:
        """加载模型配置
        
        Args:
            model_id: 模型ID
            
        Returns:
            Optional[ModelConfig]: 模型配置，如果不存在则返回None
        """
        with self._lock:
            return self.configs.get(model_id)
    
    def delete_config(self, model_id: str) -> bool:
        """删除模型配置
        
        Args:
            model_id: 模型ID
            
        Returns:
            bool: 是否删除成功
        """
        try:
            with self._lock:
                if model_id in self.configs:
                    del self.configs[model_id]
                    self._save_configs()
                    logger.info(f"Deleted configuration for model: {model_id}")
                    return True
                else:
                    logger.warning(f"Configuration not found for model: {model_id}")
                    return False
                    
        except Exception as e:
            logger.error(f"Failed to delete configuration for model {model_id}: {str(e)}")
            return False
    
    def list_configs(self, filter_type: Optional[str] = None, 
                    filter_provider: Optional[str] = None) -> List[ModelConfig]:
        """列出模型配置
        
        Args:
            filter_type: 过滤类型（local/api）
            filter_provider: 过滤提供商
            
        Returns:
            List[ModelConfig]: 模型配置列表
        """
        with self._lock:
            result = []
            for config in self.configs.values():
                if filter_type and config.model_type != filter_type:
                    continue
                if filter_provider and config.provider != filter_provider:
                    continue
                result.append(config)
            return result
    
    def search_configs(self, search_term: str, search_fields: List[str] = None) -> List[ModelConfig]:
        """搜索模型配置
        
        Args:
            search_term: 搜索词
            search_fields: 搜索字段列表，如果为None则搜索所有字段
            
        Returns:
            List[ModelConfig]: 匹配的模型配置列表
        """
        if search_fields is None:
            search_fields = ['model_id', 'name', 'description', 'provider', 'model_type']
        
        search_term_lower = search_term.lower()
        results = []
        
        with self._lock:
            for config in self.configs.values():
                for field in search_fields:
                    value = getattr(config, field, None)
                    if value and search_term_lower in str(value).lower():
                        results.append(config)
                        break
        
        return results
    
    def import_config(self, config_data: Dict[str, Any], overwrite: bool = False) -> bool:
        """导入模型配置
        
        Args:
            config_data: 配置数据
            overwrite: 是否覆盖现有配置
            
        Returns:
            bool: 是否导入成功
        """
        try:
            # 验证必要字段
            required_fields = ['model_id', 'model_type', 'provider']
            for field in required_fields:
                if field not in config_data:
                    raise ValueError(f"Missing required field: {field}")
            
            model_id = config_data['model_id']
            
            # 检查是否已存在
            if not overwrite and model_id in self.configs:
                raise ValueError(f"Configuration already exists for model: {model_id}")
            
            # 创建配置对象
            config = ModelConfig.from_dict(config_data)
            
            # 保存配置
            return self.save_config(config)
            
        except Exception as e:
            logger.error(f"Failed to import configuration: {str(e)}")
            raise ConfigurationError(f"Failed to import configuration: {str(e)}") from e
    
    def export_config(self, model_id: str, include_sensitive: bool = False) -> Dict[str, Any]:
        """导出模型配置
        
        Args:
            model_id: 模型ID
            include_sensitive: 是否包含敏感信息（如API密钥）
            
        Returns:
            Dict[str, Any]: 配置数据
        """
        config = self.load_config(model_id)
        if not config:
            raise ValueError(f"Configuration not found for model: {model_id}")
        
        config_dict = config.to_dict()
        
        # 如果不包含敏感信息，移除API密钥
        if not include_sensitive and 'api_key' in config_dict:
            config_dict['api_key'] = '***REDACTED***'
        
        return config_dict
    
    def export_all_configs(self, include_sensitive: bool = False) -> List[Dict[str, Any]]:
        """导出所有模型配置
        
        Args:
            include_sensitive: 是否包含敏感信息
            
        Returns:
            List[Dict[str, Any]]: 所有配置数据
        """
        configs = self.list_configs()
        return [self.export_config(config.model_id, include_sensitive) for config in configs]
    
    def backup_configs(self, backup_path: str = None) -> str:
        """备份配置
        
        Args:
            backup_path: 备份路径，如果为None则使用默认路径
            
        Returns:
            str: 备份文件路径
        """
        if backup_path is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = self.config_dir / f"model_configs_backup_{timestamp}.json"
        else:
            backup_path = Path(backup_path)
        
        try:
            # 导出所有配置（不包含敏感信息）
            configs_data = self.export_all_configs(include_sensitive=False)
            
            # 保存备份
            with open(backup_path, 'w', encoding='utf-8') as f:
                json.dump(configs_data, f, indent=2, ensure_ascii=False, default=str)
            
            logger.info(f"Backup created at: {backup_path}")
            return str(backup_path)
            
        except Exception as e:
            logger.error(f"Failed to create backup: {str(e)}")
            raise ConfigurationError(f"Failed to create backup: {str(e)}") from e
    
    def restore_configs(self, backup_path: str, overwrite: bool = False) -> bool:
        """恢复配置
        
        Args:
            backup_path: 备份文件路径
            overwrite: 是否覆盖现有配置
            
        Returns:
            bool: 是否恢复成功
        """
        backup_path = Path(backup_path)
        if not backup_path.exists():
            raise FileNotFoundError(f"Backup file not found: {backup_path}")
        
        try:
            # 加载备份数据
            with open(backup_path, 'r', encoding='utf-8') as f:
                configs_data = json.load(f)
            
            restored_count = 0
            errors = []
            
            for config_data in configs_data:
                try:
                    # 跳过已存在且不覆盖的配置
                    model_id = config_data.get('model_id')
                    if not overwrite and model_id in self.configs:
                        continue
                    
                    # 导入配置
                    self.import_config(config_data, overwrite=True)
                    restored_count += 1
                    
                except Exception as e:
                    errors.append(f"Failed to restore config {config_data.get('model_id', 'unknown')}: {str(e)}")
            
            if errors:
                logger.warning(f"Restored {restored_count} configurations with {len(errors)} errors")
                for error in errors:
                    logger.warning(f"  - {error}")
            else:
                logger.info(f"Successfully restored {restored_count} configurations")
            
            return restored_count > 0
            
        except Exception as e:
            logger.error(f"Failed to restore configurations: {str(e)}")
            raise ConfigurationError(f"Failed to restore configurations: {str(e)}") from e
    
    def validate_config(self, config: ModelConfig) -> List[str]:
        """验证配置并返回错误列表
        
        Args:
            config: 模型配置
            
        Returns:
            List[str]: 错误消息列表，如果验证通过则返回空列表
        """
        errors = []
        
        # 检查必要字段
        if not config.model_id:
            errors.append("Model ID is required")
        
        if not config.model_type:
            errors.append("Model type is required")
        elif config.model_type not in ['local', 'api']:
            errors.append(f"Invalid model type: {config.model_type}")
        
        if not config.provider:
            errors.append("Provider is required")
        
        # 检查配置字段
        if not config.config:
            errors.append("Config dictionary is required")
        
        # 根据模型类型进行特定验证
        if config.model_type == 'api':
            if not config.api_key and config.provider not in ['custom']:
                errors.append(f"API key is required for provider: {config.provider}")
            
            if config.timeout <= 0:
                errors.append("Timeout must be positive")
            
            if config.max_retries < 0:
                errors.append("Max retries cannot be negative")
        
        elif config.model_type == 'local':
            model_type = config.config.get('model_type', 'checkpoint')
            if model_type not in ['checkpoint', 'lora', 'controlnet', 'vae', 'clip']:
                errors.append(f"Invalid local model type: {model_type}")
        
        # 检查速率限制配置
        if config.rate_limit:
            if config.rate_limit.requests_per_minute < 0:
                errors.append("Requests per minute cannot be negative")
            if config.rate_limit.requests_per_hour < 0:
                errors.append("Requests per hour cannot be negative")
            if config.rate_limit.burst_limit < 0:
                errors.append("Burst limit cannot be negative")
        
        return errors
    
    def get_config_stats(self) -> Dict[str, Any]:
        """获取配置统计信息
        
        Returns:
            Dict[str, Any]: 统计信息
        """
        with self._lock:
            total = len(self.configs)
            local_count = len([c for c in self.configs.values() if c.model_type == 'local'])
            api_count = total - local_count
            
            providers = {}
            for config in self.configs.values():
                provider = config.provider
                providers[provider] = providers.get(provider, 0) + 1
            
            return {
                'total_configs': total,
                'local_configs': local_count,
                'api_configs': api_count,
                'providers': providers,
                'config_file': str(self.config_file),
                'config_dir': str(self.config_dir),
                'encryption_enabled': self.encrypt_keys
            }
    
    def migrate_configs(self, old_configs: List[Dict[str, Any]]) -> int:
        """迁移旧配置格式
        
        Args:
            old_configs: 旧配置列表
            
        Returns:
            int: 成功迁移的配置数量
        """
        migrated_count = 0
        
        for old_config in old_configs:
            try:
                # 转换旧配置格式到新格式
                new_config = self._convert_old_config(old_config)
                
                # 保存新配置
                if self.save_config(new_config):
                    migrated_count += 1
                    
            except Exception as e:
                logger.warning(f"Failed to migrate config: {str(e)}")
                continue
        
        logger.info(f"Migrated {migrated_count} configurations")
        return migrated_count
    
    def _convert_old_config(self, old_config: Dict[str, Any]) -> ModelConfig:
        """转换旧配置格式到新格式
        
        Args:
            old_config: 旧配置
            
        Returns:
            ModelConfig: 新配置
        """
        # 这里实现旧配置到新配置的转换逻辑
        # 根据实际旧格式进行调整
        
        # 示例转换逻辑
        model_id = old_config.get('id', old_config.get('name', 'unknown'))
        model_type = old_config.get('type', 'api')
        provider = old_config.get('provider', 'custom')
        
        # 构建新配置
        config_dict = {
            'model_id': model_id,
            'model_type': model_type,
            'provider': provider,
            'config': old_config.get('config', {}),
            'api_key': old_config.get('api_key'),
            'endpoint': old_config.get('endpoint'),
            'base_url': old_config.get('base_url'),
            'timeout': old_config.get('timeout', 30),
            'max_retries': old_config.get('max_retries', 3),
            'name': old_config.get('name'),
            'description': old_config.get('description'),
            'tags': old_config.get('tags', [])
        }
        
        # 处理速率限制
        if 'rate_limit' in old_config:
            config_dict['rate_limit'] = RateLimitConfig(**old_config['rate_limit'])
        
        return ModelConfig.from_dict(config_dict)
    
    def cleanup_old_backups(self, keep_last_n: int = 10):
        """清理旧的备份文件
        
        Args:
            keep_last_n: 保留最近多少个备份
        """
        try:
            backup_files = list(self.config_dir.glob("model_configs_backup_*.json"))
            backup_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
            
            # 删除旧的备份文件
            for backup_file in backup_files[keep_last_n:]:
                try:
                    backup_file.unlink()
                    logger.info(f"Deleted old backup: {backup_file}")
                except Exception as e:
                    logger.warning(f"Failed to delete backup {backup_file}: {str(e)}")
            
            logger.info(f"Kept {min(len(backup_files), keep_last_n)} backup files")
            
        except Exception as e:
            logger.error(f"Failed to cleanup old backups: {str(e)}")
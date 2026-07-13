"""
ComfyUI统一模型调用基础接口和数据类型定义

定义统一的模型调用接口、配置数据模型和异常类。
"""

import json
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass, field, asdict
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any, Union, Literal
from typing_extensions import TypedDict


class ModelType(str, Enum):
    """模型类型枚举"""
    LOCAL = "local"
    API = "api"


class ProviderType(str, Enum):
    """提供商类型枚举"""
    LOCAL = "local"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    STABILITY = "stability"
    MIDJOURNEY = "midjourney"
    CUSTOM = "custom"


@dataclass
class RateLimitConfig:
    """速率限制配置"""
    requests_per_minute: int = 60
    requests_per_hour: int = 1000
    burst_limit: int = 10
    enabled: bool = True
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'RateLimitConfig':
        return cls(**data)


@dataclass
class ModelConfig:
    """模型配置数据类"""
    model_id: str
    model_type: Literal["local", "api"]
    provider: str
    config: Dict[str, Any]
    
    # API相关配置
    api_key: Optional[str] = None
    endpoint: Optional[str] = None
    base_url: Optional[str] = None
    
    # 性能配置
    timeout: int = 30
    max_retries: int = 3
    retry_delay: float = 1.0
    
    # 速率限制
    rate_limit: Optional[RateLimitConfig] = None
    
    # 元数据
    name: Optional[str] = None
    description: Optional[str] = None
    version: Optional[str] = None
    tags: List[str] = field(default_factory=list)
    
    # 时间戳
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        data = asdict(self)
        # 处理特殊字段
        if self.rate_limit:
            data['rate_limit'] = self.rate_limit.to_dict()
        data['created_at'] = self.created_at.isoformat()
        data['updated_at'] = self.updated_at.isoformat()
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ModelConfig':
        """从字典创建"""
        # 处理特殊字段
        rate_limit_data = data.pop('rate_limit', None)
        if rate_limit_data:
            data['rate_limit'] = RateLimitConfig.from_dict(rate_limit_data)
        
        # 处理时间戳
        if 'created_at' in data and isinstance(data['created_at'], str):
            data['created_at'] = datetime.fromisoformat(data['created_at'])
        if 'updated_at' in data and isinstance(data['updated_at'], str):
            data['updated_at'] = datetime.fromisoformat(data['updated_at'])
        
        return cls(**data)


@dataclass
class ModelRequest:
    """模型调用请求"""
    model_id: str
    inputs: Dict[str, Any]
    config_overrides: Optional[Dict[str, Any]] = None
    request_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data


@dataclass
class ModelResponse:
    """模型调用响应"""
    request_id: str
    outputs: Dict[str, Any]
    metadata: Dict[str, Any]
    success: bool = True
    error: Optional[str] = None
    duration_ms: Optional[float] = None
    model_id: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class ModelHandle:
    """模型句柄基类"""
    
    def __init__(self, config: ModelConfig):
        self.config = config
        self.loaded_at = datetime.now()
        self.last_used_at = datetime.now()
        self.use_count = 0
    
    def mark_used(self):
        """标记使用"""
        self.last_used_at = datetime.now()
        self.use_count += 1
    
    def get_info(self) -> Dict[str, Any]:
        """获取模型信息"""
        return {
            'model_id': self.config.model_id,
            'model_type': self.config.model_type,
            'provider': self.config.provider,
            'loaded_at': self.loaded_at.isoformat(),
            'last_used_at': self.last_used_at.isoformat(),
            'use_count': self.use_count
        }


class ModelInterface(ABC):
    """模型调用统一接口"""
    
    @abstractmethod
    async def load_model(self, model_config: ModelConfig) -> ModelHandle:
        """加载模型
        
        Args:
            model_config: 模型配置
            
        Returns:
            ModelHandle: 模型句柄
            
        Raises:
            ModelLoadError: 模型加载失败
        """
        pass
    
    @abstractmethod
    async def unload_model(self, model_handle: ModelHandle):
        """卸载模型
        
        Args:
            model_handle: 模型句柄
            
        Raises:
            ModelError: 卸载失败
        """
        pass
    
    @abstractmethod
    async def inference(self, model_handle: ModelHandle, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """执行推理
        
        Args:
            model_handle: 模型句柄
            inputs: 输入数据
            
        Returns:
            Dict[str, Any]: 推理结果
            
        Raises:
            ModelInferenceError: 推理失败
        """
        pass
    
    @abstractmethod
    async def validate_config(self, model_config: ModelConfig) -> bool:
        """验证配置
        
        Args:
            model_config: 模型配置
            
        Returns:
            bool: 配置是否有效
            
        Raises:
            ValueError: 配置验证失败
        """
        pass
    
    @abstractmethod
    def get_supported_models(self) -> List[str]:
        """获取支持的模型列表
        
        Returns:
            List[str]: 支持的模型ID列表
        """
        pass


# 异常类定义
class ModelError(Exception):
    """模型错误基类"""
    pass


class ModelLoadError(ModelError):
    """模型加载错误"""
    pass


class ModelInferenceError(ModelError):
    """模型推理错误"""
    pass


class APIConnectionError(ModelError):
    """API连接错误"""
    pass


class RateLimitError(ModelError):
    """速率限制错误"""
    pass


class AuthenticationError(ModelError):
    """认证错误"""
    pass


class ConfigurationError(ModelError):
    """配置错误"""
    pass


class UnsupportedProviderError(ModelError):
    """不支持的提供商错误"""
    pass


class UnsupportedModelError(ModelError):
    """不支持的模型错误"""
    pass


# 配置接口
class IConfigManager(ABC):
    """配置管理接口"""
    
    @abstractmethod
    def save_config(self, config: ModelConfig) -> bool:
        """保存配置"""
        pass
    
    @abstractmethod
    def load_config(self, model_id: str) -> Optional[ModelConfig]:
        """加载配置"""
        pass
    
    @abstractmethod
    def delete_config(self, model_id: str) -> bool:
        """删除配置"""
        pass
    
    @abstractmethod
    def list_configs(self, filter_type: Optional[str] = None) -> List[ModelConfig]:
        """列出配置"""
        pass


# 模型调用接口
class IModelCaller(ABC):
    """模型调用接口"""
    
    @abstractmethod
    async def call_model(self, 
                        model_id: str, 
                        inputs: Dict[str, Any], 
                        config_overrides: Optional[Dict[str, Any]] = None) -> ModelResponse:
        """调用模型"""
        pass
    
    @abstractmethod
    async def call_model_batch(self, 
                              model_id: str, 
                              inputs_list: List[Dict[str, Any]],
                              config_overrides: Optional[Dict[str, Any]] = None) -> List[ModelResponse]:
        """批量调用模型"""
        pass
    
    @abstractmethod
    def get_model_info(self, model_id: str) -> Dict[str, Any]:
        """获取模型信息"""
        pass


# 错误处理接口
class IErrorHandler(ABC):
    """错误处理接口"""
    
    @abstractmethod
    def should_retry(self, error: Exception, attempt: int) -> bool:
        """判断是否应该重试"""
        pass
    
    @abstractmethod
    def get_retry_delay(self, error: Exception, attempt: int) -> float:
        """获取重试延迟"""
        pass
    
    @abstractmethod
    def handle_error(self, error: Exception, context: Dict[str, Any]) -> Dict[str, Any]:
        """处理错误"""
        pass


# 重试策略
class RetryStrategy:
    """重试策略"""
    
    def __init__(self, max_retries: int = 3, base_delay: float = 1.0):
        self.max_retries = max_retries
        self.base_delay = base_delay
    
    def should_retry(self, error: Exception, attempt: int) -> bool:
        """判断是否应该重试"""
        if attempt >= self.max_retries:
            return False
        
        # 可重试的错误类型
        retryable_errors = (
            APIConnectionError,
            RateLimitError,
            TimeoutError,
            ConnectionError,
            ConnectionRefusedError,
            ConnectionResetError
        )
        
        return isinstance(error, retryable_errors)
    
    def get_delay(self, error: Exception, attempt: int) -> float:
        """获取重试延迟"""
        if isinstance(error, RateLimitError):
            # 速率限制错误使用指数退避
            return self.base_delay * (2 ** attempt)
        else:
            # 其他错误使用固定延迟
            return self.base_delay
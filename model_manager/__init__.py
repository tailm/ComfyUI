"""
ComfyUI统一模型管理器模块

提供统一的模型调用抽象层，支持本地部署模型和第三方API模型的混合调用。
"""

from .base import (
    ModelInterface,
    ModelConfig,
    ModelHandle,
    ModelRequest,
    ModelResponse,
    ModelError,
    ModelLoadError,
    ModelInferenceError,
    APIConnectionError,
    RateLimitError,
    AuthenticationError
)

from .local_manager import LocalModelManager
from .api_manager import APIModelManager
from .config_manager import ConfigManager
from .registry import ModelRegistry

__all__ = [
    # 基础接口
    'ModelInterface',
    'ModelConfig',
    'ModelHandle',
    'ModelRequest',
    'ModelResponse',
    
    # 异常类
    'ModelError',
    'ModelLoadError',
    'ModelInferenceError',
    'APIConnectionError',
    'RateLimitError',
    'AuthenticationError',
    
    # 管理器类
    'LocalModelManager',
    'APIModelManager',
    'ConfigManager',
    'ModelRegistry',
]
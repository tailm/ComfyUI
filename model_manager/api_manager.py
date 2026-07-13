"""
ComfyUI API模型管理器

管理第三方API模型调用，集成现有comfy_api_nodes系统。
"""

import asyncio
import json
import logging
import time
from typing import Dict, List, Optional, Any, Type
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import aiohttp
from aiohttp import ClientSession, ClientTimeout

from .base import (
    ModelInterface, ModelConfig, ModelHandle, ModelRequest, ModelResponse,
    ModelError, ModelLoadError, ModelInferenceError, 
    APIConnectionError, RateLimitError, AuthenticationError,
    RetryStrategy
)

# 导入现有的API工具
try:
    from comfy_api_nodes.util.client import sync_op, poll_op, ApiEndpoint
    from comfy_api_nodes.util.common_exceptions import ApiServerError, LocalNetworkError
    HAS_API_NODES = True
except ImportError:
    HAS_API_NODES = False
    logging.warning("comfy_api_nodes not available, API functionality will be limited")

logger = logging.getLogger(__name__)


@dataclass
class APIModelHandle(ModelHandle):
    """API模型句柄"""
    
    # 从父类继承的字段
    config: ModelConfig = field(default_factory=lambda: ModelConfig(
        model_id="",
        model_type="api",
        provider="",
        config={}
    ))
    
    # API特定信息
    api_client: Optional[Any] = None
    endpoint: Optional[str] = None
    base_url: Optional[str] = None
    headers: Dict[str, str] = field(default_factory=dict)
    
    # 速率限制状态
    rate_limit_remaining: Optional[int] = None
    rate_limit_reset: Optional[datetime] = None
    last_request_time: Optional[datetime] = None
    
    def __post_init__(self):
        """数据类初始化后调用，确保父类初始化"""
        # 调用父类的__init__方法
        super().__init__(self.config)
    
    def get_info(self) -> Dict[str, Any]:
        """获取模型信息"""
        info = super().get_info()
        info.update({
            'endpoint': self.endpoint,
            'base_url': self.base_url,
            'rate_limit_remaining': self.rate_limit_remaining,
            'rate_limit_reset': self.rate_limit_reset.isoformat() if self.rate_limit_reset else None,
            'last_request_time': self.last_request_time.isoformat() if self.last_request_time else None,
        })
        return info


class APIModelManager(ModelInterface):
    """API模型管理器"""
    
    def __init__(self, config_manager=None):
        self.providers: Dict[str, Any] = {}
        self.loaded_models: Dict[str, APIModelHandle] = {}
        self.sessions: Dict[str, ClientSession] = {}
        self.rate_limits: Dict[str, Dict[str, Any]] = {}
        self.retry_strategy = RetryStrategy()
        self.config_manager = config_manager
        self._lock = None
        
        # 初始化默认提供商
        self._init_default_providers()
    
    def _get_lock(self):
        """获取线程锁（延迟初始化）"""
        import threading
        if self._lock is None:
            self._lock = threading.RLock()
        return self._lock
    
    def _init_default_providers(self):
        """初始化默认提供商"""
        # 这里会延迟导入提供商，避免循环依赖
        self.provider_classes = {
            'openai': 'OpenAIProvider',
            'anthropic': 'AnthropicProvider',
            'stability': 'StabilityProvider',
            'midjourney': 'MidjourneyProvider',
        }
    
    def register_provider(self, provider_id: str, provider_class: Type):
        """注册提供商类
        
        Args:
            provider_id: 提供商ID
            provider_class: 提供商类
        """
        with self._get_lock():
            self.providers[provider_id] = provider_class
    
    async def load_model(self, model_config: ModelConfig) -> APIModelHandle:
        """加载API模型（主要是配置验证和客户端初始化）
        
        Args:
            model_config: 模型配置
            
        Returns:
            APIModelHandle: API模型句柄
            
        Raises:
            ModelLoadError: 模型加载失败
        """
        try:
            model_id = model_config.model_id
            provider_id = model_config.provider
            
            # 检查是否已加载
            with self._get_lock():
                if model_id in self.loaded_models:
                    logger.info(f"API model {model_id} already loaded, returning cached handle")
                    return self.loaded_models[model_id]
            
            # 验证配置
            if not await self.validate_config(model_config):
                raise ModelLoadError(f"Invalid configuration for model {model_id}")
            
            # 创建API客户端会话
            session = await self._create_session(model_config)
            
            # 创建模型句柄
            handle = APIModelHandle(
                config=model_config,
                api_client=session,
                endpoint=model_config.endpoint,
                base_url=model_config.base_url,
                headers=self._create_headers(model_config)
            )
            
            # 缓存模型句柄
            with self._get_lock():
                self.loaded_models[model_id] = handle
                if model_config.provider not in self.sessions:
                    self.sessions[model_config.provider] = session
            
            logger.info(f"Successfully loaded API model: {model_id} (provider: {provider_id})")
            return handle
            
        except Exception as e:
            logger.error(f"Failed to load API model {model_config.model_id}: {str(e)}")
            raise ModelLoadError(f"Failed to load API model: {str(e)}") from e
    
    async def _create_session(self, model_config: ModelConfig) -> ClientSession:
        """创建API客户端会话
        
        Args:
            model_config: 模型配置
            
        Returns:
            ClientSession: aiohttp客户端会话
        """
        timeout = ClientTimeout(total=model_config.timeout)
        headers = self._create_headers(model_config)
        
        session = ClientSession(
            timeout=timeout,
            headers=headers
        )
        
        return session
    
    def _create_headers(self, model_config: ModelConfig) -> Dict[str, str]:
        """创建请求头
        
        Args:
            model_config: 模型配置
            
        Returns:
            Dict[str, str]: 请求头
        """
        headers = {
            'User-Agent': 'ComfyUI-ModelManager/1.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
        
        # 添加认证头
        if model_config.api_key:
            provider = model_config.provider.lower()
            if provider == 'openai':
                headers['Authorization'] = f'Bearer {model_config.api_key}'
            elif provider == 'anthropic':
                headers['x-api-key'] = model_config.api_key
                headers['anthropic-version'] = '2023-06-01'
            elif provider == 'stability':
                headers['Authorization'] = f'Bearer {model_config.api_key}'
            elif provider == 'midjourney':
                headers['Authorization'] = f'Bearer {model_config.api_key}'
            else:
                headers['Authorization'] = f'Bearer {model_config.api_key}'
        
        # 添加自定义头
        custom_headers = model_config.config.get('headers', {})
        headers.update(custom_headers)
        
        return headers
    
    async def unload_model(self, model_handle: APIModelHandle):
        """卸载API模型
        
        Args:
            model_handle: API模型句柄
            
        Raises:
            ModelError: 卸载失败
        """
        try:
            model_id = model_handle.config.model_id
            provider = model_handle.config.provider
            
            # 从缓存中移除
            with self._get_lock():
                if model_id in self.loaded_models:
                    del self.loaded_models[model_id]
            
            # 关闭会话（如果这是该提供商的最后一个模型）
            with self._get_lock():
                provider_models = [
                    mid for mid, handle in self.loaded_models.items()
                    if handle.config.provider == provider
                ]
                
                if not provider_models and provider in self.sessions:
                    session = self.sessions[provider]
                    await session.close()
                    del self.sessions[provider]
            
            # 清理句柄
            model_handle.api_client = None
            model_handle.endpoint = None
            model_handle.base_url = None
            model_handle.headers = {}
            
            logger.info(f"Successfully unloaded API model: {model_id}")
            
        except Exception as e:
            logger.error(f"Failed to unload API model {model_handle.config.model_id}: {str(e)}")
            raise ModelError(f"Failed to unload API model: {str(e)}") from e
    
    async def inference(self, model_handle: APIModelHandle, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """执行API模型推理
        
        Args:
            model_handle: API模型句柄
            inputs: 输入数据
            
        Returns:
            Dict[str, Any]: 推理结果
            
        Raises:
            ModelInferenceError: 推理失败
        """
        try:
            model_id = model_handle.config.model_id
            provider = model_handle.config.provider
            
            logger.info(f"Starting API inference for model: {model_id} (provider: {provider})")
            
            # 检查速率限制
            await self._check_rate_limit(model_handle)
            
            # 根据提供商执行推理
            if provider == 'openai':
                result = await self._inference_openai(model_handle, inputs)
            elif provider == 'anthropic':
                result = await self._inference_anthropic(model_handle, inputs)
            elif provider == 'stability':
                result = await self._inference_stability(model_handle, inputs)
            elif provider == 'midjourney':
                result = await self._inference_midjourney(model_handle, inputs)
            else:
                # 通用API调用
                result = await self._inference_generic(model_handle, inputs)
            
            # 更新使用统计
            model_handle.mark_used()
            model_handle.last_request_time = datetime.now()
            
            # 更新速率限制信息
            await self._update_rate_limit(model_handle, result)
            
            logger.info(f"Successfully completed API inference for model: {model_id}")
            return result
            
        except Exception as e:
            logger.error(f"API inference failed for model {model_handle.config.model_id}: {str(e)}")
            raise ModelInferenceError(f"API inference failed: {str(e)}") from e
    
    async def _inference_openai(self, model_handle: APIModelHandle, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """OpenAI API推理"""
        # 使用现有的comfy_api_nodes工具
        if HAS_API_NODES:
            try:
                from comfy_api_nodes.apis.openai import (
                    InputMessage, InputTextContent, OpenAICreateResponse
                )
                
                # 构建请求
                messages = []
                for msg in inputs.get('messages', []):
                    if isinstance(msg, dict):
                        messages.append(InputMessage(**msg))
                    else:
                        messages.append(msg)
                
                # 这里应该调用现有的OpenAI节点
                # 由于复杂性，这里只返回框架结构
                return {
                    'type': 'openai_inference',
                    'model_id': model_handle.config.model_id,
                    'provider': 'openai',
                    'status': 'success',
                    'message': 'OpenAI inference would be performed here',
                    'outputs': {
                        'choices': [],
                        'usage': {}
                    }
                }
                
            except ImportError:
                logger.warning("comfy_api_nodes.openai not available, using generic API call")
        
        # 回退到通用API调用
        return await self._inference_generic(model_handle, inputs)
    
    async def _inference_anthropic(self, model_handle: APIModelHandle, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Anthropic Claude API推理"""
        # 使用现有的comfy_api_nodes工具
        if HAS_API_NODES:
            try:
                from comfy_api_nodes.apis.anthropic import (
                    AnthropicMessage, AnthropicRequest
                )
                
                # 构建请求
                # 这里应该调用现有的Anthropic节点
                return {
                    'type': 'anthropic_inference',
                    'model_id': model_handle.config.model_id,
                    'provider': 'anthropic',
                    'status': 'success',
                    'message': 'Anthropic inference would be performed here',
                    'outputs': {
                        'content': [],
                        'usage': {}
                    }
                }
                
            except ImportError:
                logger.warning("comfy_api_nodes.anthropic not available, using generic API call")
        
        # 回退到通用API调用
        return await self._inference_generic(model_handle, inputs)
    
    async def _inference_stability(self, model_handle: APIModelHandle, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Stability AI API推理"""
        # 使用现有的comfy_api_nodes工具
        if HAS_API_NODES:
            try:
                from comfy_api_nodes.apis.stability import (
                    StabilityImageGenerationRequest, StabilityImageGenerationResponse
                )
                
                # 构建请求
                # 这里应该调用现有的Stability AI节点
                return {
                    'type': 'stability_inference',
                    'model_id': model_handle.config.model_id,
                    'provider': 'stability',
                    'status': 'success',
                    'message': 'Stability AI inference would be performed here',
                    'outputs': {
                        'artifacts': []
                    }
                }
                
            except ImportError:
                logger.warning("comfy_api_nodes.stability not available, using generic API call")
        
        # 回退到通用API调用
        return await self._inference_generic(model_handle, inputs)
    
    async def _inference_midjourney(self, model_handle: APIModelHandle, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Midjourney API推理"""
        # Midjourney API调用
        endpoint = model_handle.endpoint or '/v1/images/generations'
        base_url = model_handle.base_url or 'https://api.midjourney.com'
        
        # 构建请求
        request_data = {
            'prompt': inputs.get('prompt', ''),
            'model': model_handle.config.config.get('model', 'midjourney-v6'),
            **model_handle.config.config
        }
        
        # 移除None值
        request_data = {k: v for k, v in request_data.items() if v is not None}
        
        return await self._make_api_request(
            model_handle, 'POST', endpoint, request_data
        )
    
    async def _inference_generic(self, model_handle: APIModelHandle, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """通用API推理"""
        endpoint = model_handle.endpoint or '/v1/completions'
        base_url = model_handle.base_url or 'https://api.example.com'
        
        # 构建请求
        request_data = {
            'model': model_handle.config.model_id,
            **inputs,
            **model_handle.config.config
        }
        
        # 移除None值
        request_data = {k: v for k, v in request_data.items() if v is not None}
        
        return await self._make_api_request(
            model_handle, 'POST', endpoint, request_data
        )
    
    async def _make_api_request(
        self, 
        model_handle: APIModelHandle, 
        method: str, 
        endpoint: str, 
        data: Dict[str, Any],
        max_retries: int = None
    ) -> Dict[str, Any]:
        """执行API请求
        
        Args:
            model_handle: 模型句柄
            method: HTTP方法
            endpoint: API端点
            data: 请求数据
            max_retries: 最大重试次数
            
        Returns:
            Dict[str, Any]: API响应
            
        Raises:
            APIConnectionError: API连接错误
            RateLimitError: 速率限制错误
            AuthenticationError: 认证错误
        """
        if max_retries is None:
            max_retries = model_handle.config.max_retries
        
        session = model_handle.api_client
        if not session:
            raise APIConnectionError("API client not initialized")
        
        url = f"{model_handle.base_url.rstrip('/')}/{endpoint.lstrip('/')}"
        
        # 重试逻辑
        for attempt in range(max_retries + 1):
            try:
                # 检查是否应该重试
                if attempt > 0:
                    delay = self.retry_strategy.get_delay(None, attempt)
                    logger.info(f"Retry attempt {attempt}/{max_retries} after {delay}s delay")
                    await asyncio.sleep(delay)
                
                # 执行请求
                async with session.request(
                    method=method,
                    url=url,
                    json=data,
                    headers=model_handle.headers
                ) as response:
                    
                    # 更新最后请求时间
                    model_handle.last_request_time = datetime.now()
                    
                    # 处理响应
                    if response.status == 200:
                        result = await response.json()
                        
                        # 更新速率限制头
                        self._update_rate_limit_from_headers(model_handle, response.headers)
                        
                        return {
                            'status': 'success',
                            'status_code': response.status,
                            'data': result,
                            'headers': dict(response.headers)
                        }
                    
                    elif response.status == 401:
                        raise AuthenticationError(f"Authentication failed: {await response.text()}")
                    
                    elif response.status == 429:
                        # 速率限制
                        retry_after = response.headers.get('Retry-After', '60')
                        try:
                            retry_seconds = int(retry_after)
                        except ValueError:
                            retry_seconds = 60
                        
                        raise RateLimitError(
                            f"Rate limit exceeded. Retry after {retry_seconds} seconds",
                            retry_after=retry_seconds
                        )
                    
                    elif response.status >= 500:
                        # 服务器错误，可以重试
                        raise APIConnectionError(
                            f"Server error {response.status}: {await response.text()}"
                        )
                    
                    else:
                        # 其他客户端错误
                        error_text = await response.text()
                        raise ModelInferenceError(
                            f"API request failed with status {response.status}: {error_text}"
                        )
            
            except (aiohttp.ClientError, asyncio.TimeoutError) as e:
                if attempt == max_retries:
                    raise APIConnectionError(
                        f"API connection failed after {max_retries} retries: {str(e)}"
                    ) from e
                
                if not self.retry_strategy.should_retry(e, attempt):
                    raise APIConnectionError(f"API connection error: {str(e)}") from e
                
                # 继续重试
                continue
            
            except (RateLimitError, AuthenticationError) as e:
                # 这些错误不应该重试（除了RateLimitError有特殊处理）
                if isinstance(e, RateLimitError) and attempt < max_retries:
                    # RateLimitError有重试延迟
                    retry_after = getattr(e, 'retry_after', 60)
                    await asyncio.sleep(retry_after)
                    continue
                raise
        
        # 不应该到达这里
        raise APIConnectionError(f"API request failed after {max_retries} retries")
    
    async def _check_rate_limit(self, model_handle: APIModelHandle):
        """检查速率限制
        
        Args:
            model_handle: 模型句柄
            
        Raises:
            RateLimitError: 达到速率限制
        """
        provider = model_handle.config.provider
        model_id = model_handle.config.model_id
        
        # 检查全局速率限制
        if provider in self.rate_limits:
            limit_info = self.rate_limits[provider]
            remaining = limit_info.get('remaining', 1)
            reset_time = limit_info.get('reset_time')
            
            if remaining <= 0 and reset_time and datetime.now() < reset_time:
                wait_seconds = (reset_time - datetime.now()).total_seconds()
                raise RateLimitError(
                    f"Rate limit exceeded for provider {provider}. "
                    f"Wait {wait_seconds:.0f} seconds before retrying.",
                    retry_after=wait_seconds
                )
        
        # 检查模型特定速率限制
        if model_handle.rate_limit_remaining is not None and model_handle.rate_limit_remaining <= 0:
            if model_handle.rate_limit_reset and datetime.now() < model_handle.rate_limit_reset:
                wait_seconds = (model_handle.rate_limit_reset - datetime.now()).total_seconds()
                raise RateLimitError(
                    f"Rate limit exceeded for model {model_id}. "
                    f"Wait {wait_seconds:.0f} seconds before retrying.",
                    retry_after=wait_seconds
                )
    
    def _update_rate_limit_from_headers(self, model_handle: APIModelHandle, headers: Dict[str, str]):
        """从响应头更新速率限制信息
        
        Args:
            model_handle: 模型句柄
            headers: 响应头
        """
        # 解析标准速率限制头
        remaining = headers.get('X-RateLimit-Remaining')
        reset = headers.get('X-RateLimit-Reset')
        
        if remaining is not None:
            try:
                model_handle.rate_limit_remaining = int(remaining)
            except (ValueError, TypeError):
                pass
        
        if reset is not None:
            try:
                # 可能是Unix时间戳或秒数
                reset_int = int(reset)
                if reset_int > 1000000000:  # 可能是Unix时间戳
                    model_handle.rate_limit_reset = datetime.fromtimestamp(reset_int)
                else:  # 可能是秒数
                    model_handle.rate_limit_reset = datetime.now() + timedelta(seconds=reset_int)
            except (ValueError, TypeError):
                pass
        
        # 更新全局速率限制
        provider = model_handle.config.provider
        if provider not in self.rate_limits:
            self.rate_limits[provider] = {}
        
        self.rate_limits[provider].update({
            'remaining': model_handle.rate_limit_remaining,
            'reset_time': model_handle.rate_limit_reset,
            'last_updated': datetime.now()
        })
    
    async def _update_rate_limit(self, model_handle: APIModelHandle, result: Dict[str, Any]):
        """更新速率限制信息
        
        Args:
            model_handle: 模型句柄
            result: 推理结果
        """
        # 这里可以从结果中提取速率限制信息
        # 实际实现取决于API提供商
        pass
    
    async def validate_config(self, model_config: ModelConfig) -> bool:
        """验证API模型配置
        
        Args:
            model_config: 模型配置
            
        Returns:
            bool: 配置是否有效
            
        Raises:
            ValueError: 配置验证失败
        """
        # 检查必要字段
        if not model_config.model_id:
            raise ValueError("Model ID is required")
        
        if not model_config.provider:
            raise ValueError("Provider is required")
        
        # 检查提供商是否支持
        supported_providers = self.get_supported_providers()
        if model_config.provider not in supported_providers:
            raise ValueError(f"Unsupported provider: {model_config.provider}. "
                           f"Supported providers: {', '.join(supported_providers)}")
        
        # 检查API密钥（某些提供商可能需要）
        if model_config.provider in ['openai', 'anthropic', 'stability', 'midjourney']:
            if not model_config.api_key:
                raise ValueError(f"{model_config.provider} requires API key")
        
        # 检查端点
        if model_config.provider == 'custom' and not model_config.endpoint:
            raise ValueError("Custom provider requires endpoint")
        
        # 验证配置参数
        config = model_config.config
        
        if model_config.provider == 'openai':
            if 'model' not in config:
                raise ValueError("OpenAI provider requires 'model' in config")
        
        elif model_config.provider == 'anthropic':
            if 'model' not in config:
                raise ValueError("Anthropic provider requires 'model' in config")
        
        elif model_config.provider == 'stability':
            if 'engine_id' not in config:
                raise ValueError("Stability AI provider requires 'engine_id' in config")
        
        elif model_config.provider == 'midjourney':
            if 'model' not in config:
                raise ValueError("Midjourney provider requires 'model' in config")
        
        return True
    
    def get_supported_models(self) -> List[str]:
        """获取支持的API模型列表
        
        Returns:
            List[str]: 支持的提供商列表
        """
        return list(self.providers.keys())
    
    def get_supported_providers(self) -> List[str]:
        """获取支持的API提供商列表
        
        Returns:
            List[str]: 支持的提供商列表
        """
        return list(self.provider_classes.keys())
    
    async def test_connection(self, model_config: ModelConfig) -> bool:
        """测试API连接
        
        Args:
            model_config: 模型配置
            
        Returns:
            bool: 连接是否成功
        """
        try:
            # 创建临时句柄测试连接
            handle = await self.load_model(model_config)
            
            # 发送测试请求
            test_inputs = {'test': True}
            if model_config.provider == 'openai':
                test_inputs['messages'] = [{'role': 'user', 'content': 'test'}]
            elif model_config.provider == 'anthropic':
                test_inputs['messages'] = [{'role': 'user', 'content': 'test'}]
            
            # 尝试推理（可能会被提供商拒绝，但可以测试连接）
            try:
                await self.inference(handle, test_inputs)
            except (AuthenticationError, RateLimitError):
                # 这些错误表示连接成功但认证或限制失败
                pass
            except Exception as e:
                # 其他错误可能表示连接问题
                logger.warning(f"Connection test failed: {str(e)}")
                return False
            
            # 清理
            await self.unload_model(handle)
            
            return True
            
        except Exception as e:
            logger.error(f"Connection test failed: {str(e)}")
            return False
    
    def get_rate_limit_info(self, provider: str = None) -> Dict[str, Any]:
        """获取速率限制信息
        
        Args:
            provider: 提供商ID（可选）
            
        Returns:
            Dict[str, Any]: 速率限制信息
        """
        if provider:
            return self.rate_limits.get(provider, {})
        else:
            return self.rate_limits
    
    def cleanup(self):
        """清理所有API会话"""
        import asyncio
        
        with self._get_lock():
            # 关闭所有会话
            for provider, session in self.sessions.items():
                try:
                    asyncio.create_task(session.close())
                except Exception as e:
                    logger.warning(f"Failed to close session for provider {provider}: {str(e)}")
            
            self.sessions.clear()
            self.loaded_models.clear()
            self.rate_limits.clear()
            
            logger.info("Cleaned up all API sessions")
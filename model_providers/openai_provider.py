"""
ComfyUI OpenAI提供商

实现OpenAI API提供商的适配器。
"""

import logging
import json
from typing import Dict, List, Any, Optional
import aiohttp

from .base_provider import BaseProvider
from model_manager.base import ModelConfig, ModelError, ModelInferenceError, APIConnectionError, RateLimitError, AuthenticationError

logger = logging.getLogger(__name__)


class OpenAIProvider(BaseProvider):
    """OpenAI API提供商"""
    
    def __init__(self, api_manager=None):
        """初始化OpenAI提供商
        
        Args:
            api_manager: API模型管理器实例
        """
        super().__init__("openai", "OpenAI API Provider")
        
        self.api_manager = api_manager
        self.supported_models = [
            "gpt-4o", "gpt-4o-mini", "gpt RR-4-turbo", "gpt-4", "gpt-3.5-turbo",
            "dall-e-2", "dall-e-3", "tts-1", "tts-1-hd", "whisper-1"
        ]
        self.default_params = {
            "temperature": 0.7,
            "max_tokens": 1000,
            "top_p": 1.0,
            "frequency_penalty": 0.0,
            "presence_penalty": 0.0
        }
        self.base_url = "https://api.openai.com/v1"
    
    async def _initialize(self):
        """初始化OpenAI提供商"""
        logger.info("Initializing OpenAI Provider")
        # OpenAI提供商不需要特殊初始化
        pass
    
    async def validate_config(self, config: ModelConfig) -> bool:
        """验证OpenAI配置
        
        Args:
            config: 模型配置
            
        Returns:
            bool: 配置是否有效
            
        Raises:
            ValueError: 配置验证失败
        """
        if config.model_type != "api":
            raise ValueError(f"Invalid model type for OpenAI provider: {config.model_type}")
        
        if config.provider != "openai":
            raise ValueError(f"Invalid provider for OpenAI provider: {config.provider}")
        
        if not config.api_key:
            raise ValueError("OpenAI provider requires API key")
        
        # 检查模型是否支持
        model = config.config.get("model", "gpt-3.5-turbo")
        if model not in self.supported_models:
            logger.warning(f"Model {model} not in supported models list, but will attempt to use it")
        
        return True
    
    async def inference(self, config: ModelConfig, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """执行OpenAI API推理
        
        Args:
            config: 模型配置
            inputs: 输入数据
            
        Returns:
            Dict[str, Any]: 推理结果
            
        Raises:
            ModelInferenceError: 推理失败
        """
        try:
            # 验证配置
            if not await self.validate_config(config):
                raise ModelInferenceError("Invalid configuration")
            
            # 确定端点
            endpoint = self._get_endpoint(config, inputs)
            
            # 构建请求
            request_data = self._build_request(config, inputs)
            
            # 执行请求
            result = await self._make_request(config, endpoint, request_data)
            
            # 格式化输出
            formatted_result = self.format_outputs(result, config)
            
            return formatted_result
            
        except (APIConnectionError, RateLimitError, AuthenticationError) as e:
            # 重新抛出已知错误
            raise
        except Exception as e:
            raise ModelInferenceError(f"OpenAI inference failed: {str(e)}") from e
    
    def _get_endpoint(self, config: ModelConfig, inputs: Dict[str, Any]) -> str:
        """获取API端点
        
        Args:
            config: 模型配置
            inputs: 输入数据
            
        Returns:
            str: API端点路径
        """
        model = config.config.get("model", "gpt-3.5-turbo")
        
        if model.startswith("gpt-"):
            return "/chat/completions"
        elif model.startswith("dall-e-"):
            if "image" in inputs and "mask" in inputs:
                return "/images/edits"
            elif "image" in inputs:
                return "/images/variations"
            else:
                return "/images/generations"
        elif model.startswith("tts-"):
            return "/audio/speech"
        elif model.startswith("whisper-"):
            return "/audio/transcriptions"
        else:
            # 默认使用聊天完成端点
            return "/chat/completions"
    
    def _build_request(self, config: ModelConfig, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """构建请求数据
        
        Args:
            config: 模型配置
            inputs: 输入数据
            
        Returns:
            Dict[str, Any]: 请求数据
        """
        model = config.config.get("model", "gpt-3.5-turbo")
        endpoint = self._get_endpoint(config, inputs)
        
        # 基础请求
        request_data = {
            "model": model,
            **self.default_params
        }
        
        # 应用配置参数
        for key, value in config.config.items():
            if key not in ["model", "api_key", "endpoint", "base_url"]:
                request_data[key] = value
        
        # 应用输入参数
        for key, value in inputs.items():
            if key not in ["model", "api_key", "endpoint", "base_url"]:
                request_data[key] = value
        
        # 特定端点处理
        if endpoint == "/chat/completions":
            # 确保有messages字段
            if "messages" not in request_data:
                if "prompt" in request_data:
                    request_data["messages"] = [
                        {"role": "user", "content": request_data.pop("prompt")}
                    ]
                else:
                    request_data["messages"] = [{"role": "user", "content": ""}]
        
        elif endpoint.startswith("/images/"):
            # 图像生成请求
            if "prompt" not in request_data:
                request_data["prompt"] = ""
            if "size" not in request_data:
                request_data["size"] = "1024x1024"
            if "n" not in request_data:
                request_data["n"] = 1
        
        elif endpoint == "/audio/speech":
            # TTS请求
            if "input" not in request_data and "text" in request_data:
                request_data["input"] = request_data.pop("text")
            if "voice" not in request_data:
                request_data["voice"] = "alloy"
        
        elif endpoint == "/audio/transcriptions":
            # 语音转文字请求
            if "file" not in request_data:
                request_data["file"] = ""
            if "language" not in request_data:
                request_data["language"] = "en"
        
        return request_data
    
    async def _make_request(self, config: ModelConfig, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """执行API请求
        
        Args:
            config: 模型配置
            endpoint: API端点
            data: 请求数据
            
        Returns:
            Dict[str, Any]: API响应
            
        Raises:
            APIConnectionError: API连接错误
            RateLimitError: 速率限制错误
            AuthenticationError: 认证错误
        """
        # 使用API管理器或直接请求
        if self.api_manager:
            # 创建临时模型句柄
            from model_manager.api_manager import APIModelManager
            from model_manager.base import APIModelHandle
            
            # 创建临时配置
            temp_config = ModelConfig(
                model_id=config.model_id,
                model_type="api",
                provider="openai",
                config=config.config,
                api_key=config.api_key,
                endpoint=endpoint,
                base_url=self.base_url,
                timeout=config.timeout,
                max_retries=config.max_retries
            )
            
            # 创建临时句柄
            handle = APIModelHandle(
                config=temp_config,
                endpoint=endpoint,
                base_url=self.base_url,
                headers=self._create_headers(config)
            )
            
            # 使用API管理器执行请求
            return await self.api_manager._make_api_request(
                handle, "POST", endpoint, data, config.max_retries
            )
        else:
            # 直接请求
            return await self._direct_request(config, endpoint, data)
    
    async def _direct_request(self, config: ModelConfig, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """直接API请求
        
        Args:
            config: 模型配置
            endpoint: API端点
            data: 请求数据
            
        Returns:
            Dict[str, Any]: API响应
        """
        import aiohttp
        
        url = f"{self.base_url}{endpoint}"
        headers = self._create_headers(config)
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=data, headers=headers) as response:
                if response.status == 200:
                    return await response.json()
                elif response.status == 401:
                    raise AuthenticationError(f"OpenAI authentication failed: {await response.text()}")
                elif response.status == 429:
                    retry_after = response.headers.get('Retry-After', '60')
                    raise RateLimitError(
                        f"OpenAI rate limit exceeded. Retry after {retry_after} seconds",
                        retry_after=int(retry_after)
                    )
                else:
                    error_text = await response.text()
                    raise APIConnectionError(
                        f"OpenAI API error {response.status}: {error_text}"
                    )
    
    def _create_headers(self, config: ModelConfig) -> Dict[str, str]:
        """创建请求头
        
        Args:
            config: 模型配置
            
        Returns:
            Dict[str, str]: 请求头
        """
        headers = {
            "Authorization": f"Bearer {config.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "ComfyUI-ModelManager/1.0"
        }
        
        # 添加OpenAI特定头
        headers["OpenAI-Beta"] = "assistants=v2"
        
        return headers
    
    def get_supported_models(self) -> List[str]:
        """获取支持的模型列表
        
        Returns:
            List[str]: 支持的模型ID列表
        """
        return self.supported_models.copy()
    
    def get_default_params(self) -> Dict[str, Any]:
        """获取默认参数
        
        Returns:
            Dict[str, Any]: 默认参数
        """
        return self.default_params.copy()
    
    def format_inputs(self, inputs: Dict[str, Any], config: ModelConfig) -> Dict[str, Any]:
        """格式化输入数据（OpenAI特定）
        
        Args:
            inputs: 原始输入数据
            config: 模型配置
            
        Returns:
            Dict[str, Any]: 格式化后的输入数据
        """
        formatted = super().format_inputs(inputs, config)
        
        model = config.config.get("model", "gpt-3.5-turbo")
        
        # 根据模型类型添加默认值
        if model.startswith("gpt-"):
            # GPT模型默认参数
            defaults = {
                "messages": [],
                "temperature": 0.7,
                "max_tokens": 1000,
                "top_p": 1.0,
                "frequency_penalty": 0.0,
                "presence_penalty": 0.0,
                "stream": False
            }
            for key, value in defaults.items():
                if key not in formatted:
                    formatted[key] = value
            
            # 确保messages是列表
            if not isinstance(formatted.get("messages"), list):
                formatted["messages"] = []
        
        elif model.startswith("dall-e-"):
            # DALL-E模型默认参数
            defaults = {
                "prompt": "",
                "n": 1,
                "size": "1024x1024",
                "quality": "standard",
                "style": "vivid"
            }
            for key, value in defaults.items():
                if key not in formatted:
                    formatted[key] = value
        
        elif model.startswith("tts-"):
            # TTS模型默认参数
            defaults = {
                "input": "",
                "voice": "alloy",
                "speed": 1.0,
                "response_format": "mp3"
            }
            for key, value in defaults.items():
                if key not in formatted:
                    formatted[key] = value
        
        elif model.startswith("whisper-"):
            # Whisper模型默认参数
            defaults = {
                "file": "",
                "model": "whisper-1",
                "language": "en",
                "prompt": "",
                "response_format": "json",
                "temperature": 0.0
            }
            for key, value in defaults.items():
                if key not in formatted:
                    formatted[key] = value
        
        return formatted
    
    def format_outputs(self, raw_outputs: Dict[str, Any], config: ModelConfig) -> Dict[str, Any]:
        """格式化输出数据（OpenAI特定）
        
        Args:
            raw_outputs: 原始输出数据
            config: 模型配置
            
        Returns:
            Dict[str, Any]: 格式化后的输出数据
        """
        formatted = super().format_outputs(raw_outputs, config)
        
        model = config.config.get("model", "gpt-3.5-turbo")
        
        # 提取OpenAI特定字段
        if "choices" in raw_outputs:
            formatted["choices"] = raw_outputs["choices"]
            formatted["choice_count"] = len(raw_outputs["choices"])
        
        if "data" in raw_outputs:
            formatted["data"] = raw_outputs["data"]
            if isinstance(raw_outputs["data"], list):
                formatted["item_count"] = len(raw_outputs["data"])
        
        if "usage" in raw_outputs:
            formatted["usage"] = raw_outputs["usage"]
        
        if "created" in raw_outputs:
            formatted["created"] = raw_outputs["created"]
        
        if "id" in raw_outputs:
            formatted["request_id"] = raw_outputs["id"]
        
        # 根据模型类型添加特定字段
        if model.startswith("gpt-"):
            formatted["model_type"] = "chat"
            if "choices" in raw_outputs and raw_outputs["choices"]:
                first_choice = raw_outputs["choices"][0]
                if "message" in first_choice:
                    formatted["message"] = first_choice["message"]
                if "text" in first_choice:
                    formatted["text"] = first_choice["text"]
        
        elif model.startswith("dall-e-"):
            formatted["model_type"] = "image_generation"
            if "data" in raw_outputs and raw_outputs["data"]:
                formatted["images"] = [
                    item.get("url") or item.get("b64_json")
                    for item in raw_outputs["data"]
                    if "url" in item or "b64_json" in item
                ]
        
        elif model.startswith("tts-"):
            formatted["model_type"] = "text_to_speech"
            if "data" in raw_outputs:
                formatted["audio_data"] = raw_outputs["data"]
        
        elif model.startswith("whisper-"):
            formatted["model_type"] = "speech_to_text"
            if "text" in raw_outputs:
                formatted["text"] = raw_outputs["text"]
        
        return formatted
    
    async def _test_connection(self, config: ModelConfig) -> bool:
        """测试OpenAI连接
        
        Args:
            config: 模型配置
            
        Returns:
            bool: 连接是否成功
        """
        try:
            # 发送简单的测试请求
            test_data = {
                "model": "gpt-3.5-turbo",
                "messages": [{"role": "user", "content": "Hello"}],
                "max_tokens": 5
            }
            
            result = await self._direct_request(config, "/chat/completions", test_data)
            
            # 检查响应
            if "choices" in result and len(result["choices"]) > 0:
                return True
            else:
                logger.warning(f"OpenAI test connection returned unexpected response: {result}")
                return False
                
        except AuthenticationError:
            # 认证错误表示连接成功但密钥无效
            return True
        except Exception as e:
            logger.error(f"OpenAI test connection failed: {str(e)}")
            return False
    
    def get_usage_stats(self) -> Dict[str, Any]:
        """获取使用统计
        
        Returns:
            Dict[str, Any]: 使用统计
        """
        stats = super().get_usage_stats()
        
        # 添加OpenAI特定统计
        stats.update({
            'provider': 'openai',
            'base_url': self.base_url,
            'supported_models_count': len(self.supported_models)
        })
        
        return stats
"""
ComfyUI Stability AI提供商

实现Stability AI API提供商的适配器。
"""

import logging
from typing import Dict, List, Any

from .base_provider import BaseProvider
from model_manager.base import ModelConfig, ModelError, ModelInferenceError, APIConnectionError, RateLimitError, AuthenticationError

logger = logging.getLogger(__name__)


class StabilityProvider(BaseProvider):
    """Stability AI API提供商"""
    
    def __init__(self, api_manager=None):
        """初始化Stability AI提供商
        
        Args:
            api_manager: API模型管理器实例
        """
        super().__init__("stability", "Stability AI API Provider")
        
        self.api_manager = api_manager
        self.supported_models = [
            "stable-diffusion-xl-1024-v1-0",
            "stable-diffusion-xl-1024-v0-9",
            "stable-diffusion-512-v2-1",
            "stable-diffusion-768-v2-1",
            "stable-diffusion-xl-beta-v2-2-2",
            "stable-diffusion-v1-6",
            "stable-diffusion-v1-5",
            "stable-diffusion-v1-4",
            "esrgan-v1-x2plus",
            "stable-inpainting-512-v2-0"
        ]
        self.default_params = {
            "height": 512,
            "width": 512,
            "steps": 30,
            "cfg_scale": 7.0,
            "samples": 1,
            "sampler": "K_DPMPP_2M"
        }
        self.base_url = "https://api.stability.ai/v1"
    
    async def _initialize(self):
        """初始化Stability AI提供商"""
        logger.info("Initializing Stability AI Provider")
        # Stability AI提供商不需要特殊初始化
        pass
    
    async def validate_config(self, config: ModelConfig) -> bool:
        """验证Stability AI配置
        
        Args:
            config: 模型配置
            
        Returns:
            bool: 配置是否有效
            
        Raises:
            ValueError: 配置验证失败
        """
        if config.model_type != "api":
            raise ValueError(f"Invalid model type for Stability AI provider: {config.model_type}")
        
        if config.provider != "stability":
            raise ValueError(f"Invalid provider for Stability AI provider: {config.provider}")
        
        if not config.api_key:
            raise ValueError("Stability AI provider requires API key")
        
        # 检查模型是否支持
        model = config.config.get("model", "stable-diffusion-xl-1024-v1-0")
        if model not in self.supported_models:
            logger.warning(f"Model {model} not in supported models list, but will attempt to use it")
        
        # 检查必要参数
        if "engine_id" not in config.config:
            raise ValueError("Stability AI provider requires 'engine_id' in config")
        
        return True
    
    async def inference(self, config: ModelConfig, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """执行Stability AI API推理
        
        Args:
            config: 模型配置
            inputs: 输入数据
            
        Returns:
            Dict[str, Any]: 推理结果
            
        Raises:
            ModelInferenceError: 推理失败
        """
        # 这是一个占位符实现
        # 实际实现应该调用Stability AI API
        logger.warning("Stability AI provider inference not fully implemented yet")
        
        # 模拟响应
        return {
            "provider": "stability",
            "model_id": config.model_id,
            "model": config.config.get("model", "stable-diffusion-xl-1024-v1-0"),
            "engine_id": config.config.get("engine_id", "stable-diffusion-xl-1024-v1-0"),
            "artifacts": [
                {
                    "base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
                    "seed": 1234567890,
                    "finishReason": "SUCCESS"
                }
            ],
            "timestamp": "2024-01-01T00:00:00Z"
        }
    
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
        """格式化输入数据（Stability AI特定）
        
        Args:
            inputs: 原始输入数据
            config: 模型配置
            
        Returns:
            Dict[str, Any]: 格式化后的输入数据
        """
        formatted = super().format_inputs(inputs, config)
        
        # Stability AI特定格式化
        if "text_prompts" not in formatted:
            if "prompt" in formatted:
                formatted["text_prompts"] = [
                    {"text": formatted.pop("prompt"), "weight": 1.0}
                ]
            else:
                formatted["text_prompts"] = [{"text": "", "weight": 1.0}]
        
        # 确保有engine_id
        if "engine_id" not in formatted:
            formatted["engine_id"] = config.config.get("engine_id", "stable-diffusion-xl-1024-v1-0")
        
        # 添加默认参数
        defaults = {
            "height": 512,
            "width": 512,
            "steps": 30,
            "cfg_scale": 7.0,
            "samples": 1,
            "sampler": "K_DPMPP_2M",
            "style_preset": "enhance",
            "clip_guidance_preset": "FAST_BLUE"
        }
        
        for key, value in defaults.items():
            if key not in formatted:
                formatted[key] = value
        
        return formatted
    
    def format_outputs(self, raw_outputs: Dict[str, Any], config: ModelConfig) -> Dict[str, Any]:
        """格式化输出数据（Stability AI特定）
        
        Args:
            raw_outputs: 原始输出数据
            config: 模型配置
            
        Returns:
            Dict[str, Any]: 格式化后的输出数据
        """
        formatted = super().format_outputs(raw_outputs, config)
        
        # 添加Stability AI特定字段
        formatted["provider"] = "stability"
        formatted["model_type"] = "image_generation"
        
        # 提取artifacts
        if "artifacts" in raw_outputs:
            formatted["artifacts"] = raw_outputs["artifacts"]
            formatted["artifact_count"] = len(raw_outputs["artifacts"])
            
            # 提取第一个artifact的信息
            if raw_outputs["artifacts"]:
                first_artifact = raw_outputs["artifacts"][0]
                formatted["seed"] = first_artifact.get("seed")
                formatted["finish_reason"] = first_artifact.get("finishReason")
        
        return formatted
    
    async def _test_connection(self, config: ModelConfig) -> bool:
        """测试Stability AI连接
        
        Args:
            config: 模型配置
            
        Returns:
            bool: 连接是否成功
        """
        # 这是一个占位符实现
        # 实际实现应该测试与Stability AI API的连接
        logger.warning("Stability AI connection test not implemented yet")
        return True
    
    def get_usage_stats(self) -> Dict[str, Any]:
        """获取使用统计
        
        Returns:
            Dict[str, Any]: 使用统计
        """
        stats = super().get_usage_stats()
        
        # 添加Stability AI特定统计
        stats.update({
            'provider': 'stability',
            'base_url': self.base_url,
            'supported_models_count': len(self.supported_models)
        })
        
        return stats
"""
ComfyUI本地模型提供商

实现本地模型提供商的适配器。
"""

import logging
from typing import Dict, List, Any, Optional
import asyncio

from .base_provider import BaseProvider
from model_manager.base import ModelConfig, ModelError, ModelLoadError, ModelInferenceError
from model_manager.local_manager import LocalModelManager

logger = logging.getLogger(__name__)


class LocalProvider(BaseProvider):
    """本地模型提供商"""
    
    def __init__(self, local_manager: LocalModelManager = None):
        """初始化本地模型提供商
        
        Args:
            local_manager: 本地模型管理器实例
        """
        super().__init__("local", "Local Model Provider")
        
        self.local_manager = local_manager or LocalModelManager()
        self.supported_models = ["checkpoint", "lora", "controlnet", "vae", "clip"]
        self.default_params = {
            "device": "auto",
            "dtype": "auto",
            "low_vram": False,
            "vram_limit": None
        }
    
    async def _initialize(self):
        """初始化本地提供商"""
        logger.info("Initializing Local Provider")
        # 本地提供商不需要特殊初始化
        pass
    
    async def validate_config(self, config: ModelConfig) -> bool:
        """验证本地模型配置
        
        Args:
            config: 模型配置
            
        Returns:
            bool: 配置是否有效
            
        Raises:
            ValueError: 配置验证失败
        """
        if config.model_type != "local":
            raise ValueError(f"Invalid model type for local provider: {config.model_type}")
        
        model_type = config.config.get("model_type", "checkpoint")
        
        if model_type not in self.supported_models:
            raise ValueError(f"Unsupported local model type: {model_type}. "
                           f"Supported types: {', '.join(self.supported_models)}")
        
        # 验证必要参数
        if model_type == "checkpoint":
            if "ckpt_name" not in config.config:
                raise ValueError("Checkpoint model requires 'ckpt_name' in config")
        
        elif model_type == "lora":
            if "lora_name" not in config.config:
                raise ValueError("LoRA model requires 'lora_name' in config")
            if "model" not in config.config or "clip" not in config.config:
                raise ValueError("LoRA model requires 'model' and 'clip' in config")
        
        elif model_type == "controlnet":
            if "control_net_name" not in config.config:
                raise ValueError("ControlNet model requires 'control_net_name' in config")
        
        elif model_type == "vae":
            if "vae_name" not in config.config:
                raise ValueError("VAE model requires 'vae_name' in config")
        
        elif model_type == "clip":
            if "clip_name" not in config.config:
                raise ValueError("CLIP model requires 'clip_name' in config")
        
        return True
    
    async def inference(self, config: ModelConfig, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """执行本地模型推理
        
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
            
            # 加载模型
            model_handle = await self.local_manager.load_model(config)
            
            # 执行推理
            result = await self.local_manager.inference(model_handle, inputs)
            
            # 格式化输出
            formatted_result = self.format_outputs(result, config)
            
            return formatted_result
            
        except ModelLoadError as e:
            raise ModelInferenceError(f"Failed to load model: {str(e)}") from e
        except Exception as e:
            raise ModelInferenceError(f"Inference failed: {str(e)}") from e
    
    def get_supported_models(self) -> List[str]:
        """获取支持的模型列表
        
        Returns:
            List[str]: 支持的模型类型列表
        """
        return self.supported_models.copy()
    
    def get_default_params(self) -> Dict[str, Any]:
        """获取默认参数
        
        Returns:
            Dict[str, Any]: 默认参数
        """
        return self.default_params.copy()
    
    def format_inputs(self, inputs: Dict[str, Any], config: ModelConfig) -> Dict[str, Any]:
        """格式化输入数据（本地模型特定）
        
        Args:
            inputs: 原始输入数据
            config: 模型配置
            
        Returns:
            Dict[str, Any]: 格式化后的输入数据
        """
        formatted = super().format_inputs(inputs, config)
        
        model_type = config.config.get("model_type", "checkpoint")
        
        # 根据模型类型添加默认值
        if model_type == "checkpoint":
            # 检查点模型默认参数
            defaults = {
                "prompt": "",
                "negative_prompt": "",
                "steps": 20,
                "cfg": 7.0,
                "sampler_name": "euler",
                "scheduler": "normal",
                "width": 512,
                "height": 512,
                "seed": -1,
                "batch_size": 1
            }
            for key, value in defaults.items():
                if key not in formatted:
                    formatted[key] = value
        
        elif model_type == "lora":
            # LoRA模型默认参数
            defaults = {
                "strength_model": 1.0,
                "strength_clip": 1.0
            }
            for key, value in defaults.items():
                if key not in formatted:
                    formatted[key] = value
        
        elif model_type == "controlnet":
            # ControlNet模型默认参数
            defaults = {
                "control_image": None,
                "conditioning": None,
                "strength": 1.0,
                "start_percent": 0.0,
                "end_percent": 1.0
            }
            for key, value in defaults.items():
                if key not in formatted:
                    formatted[key] = value
        
        elif model_type == "vae":
            # VAE模型默认参数
            defaults = {
                "operation": "decode",  # encode or decode
                "latent": None,
                "image": None
            }
            for key, value in defaults.items():
                if key not in formatted:
                    formatted[key] = value
        
        elif model_type == "clip":
            # CLIP模型默认参数
            defaults = {
                "text": "",
                "tokenize": True,
                "return_pooled": True
            }
            for key, value in defaults.items():
                if key not in formatted:
                    formatted[key] = value
        
        return formatted
    
    def format_outputs(self, raw_outputs: Dict[str, Any], config: ModelConfig) -> Dict[str, Any]:
        """格式化输出数据（本地模型特定）
        
        Args:
            raw_outputs: 原始输出数据
            config: 模型配置
            
        Returns:
            Dict[str, Any]: 格式化后的输出数据
        """
        formatted = super().format_outputs(raw_outputs, config)
        
        model_type = config.config.get("model_type", "checkpoint")
        
        # 根据模型类型添加特定字段
        if model_type == "checkpoint":
            formatted['model_type'] = 'checkpoint'
            if 'outputs' in raw_outputs and 'images' in raw_outputs['outputs']:
                formatted['image_count'] = len(raw_outputs['outputs']['images'])
        
        elif model_type == "lora":
            formatted['model_type'] = 'lora'
            formatted['strength_model'] = config.config.get('strength_model', 1.0)
            formatted['strength_clip'] = config.config.get('strength_clip', 1.0)
        
        elif model_type == "controlnet":
            formatted['model_type'] = 'controlnet'
            formatted['strength'] = config.config.get('strength', 1.0)
        
        elif model_type == "vae":
            formatted['model_type'] = 'vae'
            formatted['operation'] = config.config.get('operation', 'decode')
        
        elif model_type == "clip":
            formatted['model_type'] = 'clip'
            formatted['token_count'] = len(config.config.get('text', '').split())
        
        return formatted
    
    def list_available_models(self, model_type: str = None) -> List[str]:
        """列出可用的本地模型
        
        Args:
            model_type: 模型类型（可选）
            
        Returns:
            List[str]: 可用模型名称列表
        """
        return self.local_manager.list_available_models(model_type)
    
    def get_model_info(self, model_id: str) -> Optional[Dict[str, Any]]:
        """获取模型信息
        
        Args:
            model_id: 模型ID
            
        Returns:
            Optional[Dict[str, Any]]: 模型信息，如果未加载则返回None
        """
        return self.local_manager.get_model_info(model_id)
    
    async def cleanup(self):
        """清理资源"""
        self.local_manager.cleanup()
        await super().cleanup()
    
    def get_usage_stats(self) -> Dict[str, Any]:
        """获取使用统计
        
        Returns:
            Dict[str, Any]: 使用统计
        """
        stats = super().get_usage_stats()
        
        # 添加本地特定统计
        cache_info = self.local_manager.get_cache_info() if hasattr(self.local_manager, 'get_cache_info') else {}
        stats.update({
            'loaded_models_count': len(self.local_manager.loaded_models) if hasattr(self.local_manager, 'loaded_models') else 0,
            'cache_info': cache_info
        })
        
        return stats
"""
ComfyUI统一模型节点

提供统一的模型加载和推理节点，支持本地和API模型。
"""

import json
import logging
import asyncio
from typing import Dict, List, Any, Tuple, Optional
from datetime import datetime

from model_manager.base import ModelConfig, ModelError, ModelLoadError, ModelInferenceError
from model_manager.registry import ModelRegistry
from model_manager.local_manager import LocalModelManager
from model_manager.api_manager import APIModelManager
from model_manager.config_manager import ConfigManager

# 导入提供商
try:
    from model_providers.local_provider import LocalProvider
    from model_providers.openai_provider import OpenAIProvider
    from model_providers.anthropic_provider import AnthropicProvider
    from model_providers.stability_provider import StabilityProvider
except ImportError as e:
    logging.warning(f"Failed to import some providers: {str(e)}")

logger = logging.getLogger(__name__)


class UnifiedModelLoader:
    """统一模型加载器节点"""
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "model_id": ("STRING", {
                    "default": "",
                    "multiline": False,
                    "tooltip": "Model identifier from configuration"
                }),
                "model_type": (["local", "api"], {
                    "default": "local",
                    "tooltip": "Select local for locally deployed models, api for third-party API models"
                }),
                "provider": (["local", "openai", "anthropic", "stability", "midjourney", "custom"], {
                    "default": "local",
                    "tooltip": "Select the model provider"
                }),
            },
            "optional": {
                "config_name": ("STRING", {
                    "default": "",
                    "multiline": False,
                    "tooltip": "Optional configuration name, uses model_id if not specified"
                }),
                "use_cached": ("BOOLEAN", {
                    "default": True,
                    "tooltip": "If enabled, uses cached model instance when available"
                }),
                "timeout": ("INT", {
                    "default": 30,
                    "min": 1,
                    "max": 300,
                    "step": 1,
                    "tooltip": "Timeout for model loading operation in seconds"
                }),
            }
        }
    
    RETURN_TYPES = ("MODEL_HANDLE", "STRING", "BOOLEAN")
    RETURN_NAMES = ("model_handle", "model_info", "success")
    OUTPUT_TOOLTIPS = (
        "The loaded model handle that can be passed to UnifiedModelInference",
        "JSON string containing model metadata and configuration",
        "True if model was loaded successfully, False otherwise"
    )
    
    FUNCTION = "load_model"
    CATEGORY = "model/loaders"
    DESCRIPTION = "Loads models from local or API sources with unified interface"
    SEARCH_ALIASES = ["unified loader", "model loader", "load model", "api loader", "local loader"]
    
    def __init__(self):
        """初始化统一模型加载器"""
        self.config_manager = ConfigManager()
        self.registry = ModelRegistry.get_instance()
        
        # 初始化提供商
        try:
            # 注册本地提供商
            local_manager = LocalModelManager()
            self.registry.register_provider("local", LocalProvider(local_manager))
            
            # 注册API提供商
            api_manager = APIModelManager(self.config_manager)
            self.registry.register_provider("openai", OpenAIProvider(api_manager))
            self.registry.register_provider("anthropic", AnthropicProvider(api_manager))
            self.registry.register_provider("stability", StabilityProvider(api_manager))
            
            logger.info("Initialized model providers")
            
        except ImportError as e:
            logger.warning(f"Failed to import some providers: {str(e)}")
        except Exception as e:
            logger.error(f"Failed to initialize providers: {str(e)}")
    
    def load_model(
        self,
        model_id: str,
        model_type: str,
        provider: str,
        config_name: str = "",
        use_cached: bool = True,
        timeout: int = 30
    ) -> Tuple[Any, str, bool]:
        """加载模型
        
        Args:
            model_id: 模型ID
            model_type: 模型类型 (local/api)
            provider: 提供商
            config_name: 配置名称
            use_cached: 是否使用缓存
            timeout: 超时时间
            
        Returns:
            Tuple[Any, str, bool]: 模型句柄、模型信息JSON、是否成功
        """
        try:
            # 使用配置名称或模型ID
            config_id = config_name if config_name else model_id
            
            # 获取或创建模型配置
            model_config = self.config_manager.load_config(config_id)
            if not model_config:
                # 创建新配置
                model_config = ModelConfig(
                    model_id=model_id,
                    model_type=model_type,
                    provider=provider,
                    config={},
                    timeout=timeout
                )
                self.config_manager.save_config(model_config)
            
            # 加载模型
            model_handle = self.registry.load_model(
                model_config=model_config,
                use_cached=use_cached,
                timeout=timeout
            )
            
            # 获取模型信息
            model_info = {
                "model_id": model_id,
                "model_type": model_type,
                "provider": provider,
                "config_name": config_name,
                "config_id": config_id,
                "loaded_at": datetime.now().isoformat(),
                "handle_id": str(id(model_handle))
            }
            
            return model_handle, json.dumps(model_info, indent=2), True
            
        except ModelLoadError as e:
            logger.error(f"Model load error: {str(e)}")
            error_info = {
                "error": "ModelLoadError",
                "message": str(e),
                "model_id": model_id,
                "model_type": model_type,
                "provider": provider
            }
            return None, json.dumps(error_info), False
        except Exception as e:
            logger.error(f"Unexpected error loading model: {str(e)}")
            error_info = {
                "error": "UnexpectedError",
                "message": str(e),
                "model_id": model_id,
                "model_type": model_type,
                "provider": provider
            }
            return None, json.dumps(error_info), False


class UnifiedModelInference:
    """统一模型推理器节点"""
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "model_handle": ("MODEL_HANDLE", {
                    "tooltip": "Model handle from UnifiedModelLoader node"
                }),
                "inputs": ("DICT", {
                    "default": {},
                    "tooltip": "Input data for model inference"
                }),
            },
            "optional": {
                "timeout": ("INT", {
                    "default": 30,
                    "min": 1,
                    "max": 300,
                    "step": 1,
                    "tooltip": "Timeout for inference operation in seconds"
                }),
                "max_retries": ("INT", {
                    "default": 3,
                    "min": 0,
                    "max": 10,
                    "step": 1,
                    "tooltip": "Number of retries for failed inference attempts"
                }),
                "verbose": ("BOOLEAN", {
                    "default": False,
                    "tooltip": "Enable detailed logging for debugging"
                }),
            }
        }
    
    RETURN_TYPES = ("ANY", "STRING", "FLOAT", "BOOLEAN")
    RETURN_NAMES = ("output", "output_json", "inference_time", "success")
    OUTPUT_TOOLTIPS = (
        "The raw model output (type depends on model)",
        "Model output formatted as JSON string",
        "Time taken for inference in seconds",
        "True if inference was successful, False otherwise"
    )
    
    FUNCTION = "inference"
    CATEGORY = "model/inference"
    DESCRIPTION = "Run inference using loaded model from UnifiedModelLoader"
    SEARCH_ALIASES = ["unified inference", "model inference", "run model", "api inference", "local inference"]
    
    def __init__(self):
        self.registry = ModelRegistry.get_instance()
    
    def inference(
        self,
        model_handle: Any,
        inputs: Dict[str, Any],
        timeout: int = 30,
        max_retries: int = 3,
        verbose: bool = False
    ) -> Tuple[Any, str, float, bool]:
        """执行模型推理
        
        Args:
            model_handle: 模型句柄
            inputs: 输入数据
            timeout: 超时时间
            max_retries: 最大重试次数
            verbose: 详细日志
            
        Returns:
            Tuple[Any, str, float, bool]: 输出、JSON输出、推理时间、是否成功
        """
        start_time = datetime.now()
        
        try:
            # 执行推理
            result = self.registry.inference(
                model_handle=model_handle,
                inputs=inputs,
                timeout=timeout,
                max_retries=max_retries,
                verbose=verbose
            )
            
            # 计算推理时间
            inference_time = (datetime.now() - start_time).total_seconds()
            
            # 格式化输出
            output_json = json.dumps(result, indent=2, default=str)
            
            return result, output_json, inference_time, True
            
        except ModelInferenceError as e:
            logger.error(f"Model inference error: {str(e)}")
            inference_time = (datetime.now() - start_time).total_seconds()
            error_info = {
                "error": "ModelInferenceError",
                "message": str(e),
                "inference_time": inference_time
            }
            return None, json.dumps(error_info), inference_time, False
        except Exception as e:
            logger.error(f"Unexpected error during inference: {str(e)}")
            inference_time = (datetime.now() - start_time).total_seconds()
            error_info = {
                "error": "UnexpectedError",
                "message": str(e),
                "inference_time": inference_time
            }
            return None, json.dumps(error_info), inference_time, False


class ModelConfigManagerNode:
    """模型配置管理器节点"""
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "action": (["list", "save", "load", "delete", "export", "import"], {
                    "default": "list",
                    "tooltip": "Action to perform on model configurations"
                }),
            },
            "optional": {
                "model_id": ("STRING", {
                    "default": "",
                    "multiline": False,
                    "tooltip": "Model identifier for save/load/delete actions"
                }),
                "model_type": (["local", "api"], {
                    "default": "local",
                    "tooltip": "Model type for save action"
                }),
                "provider": ("STRING", {
                    "default": "local",
                    "tooltip": "Provider for save action"
                }),
                "config_json": ("STRING", {
                    "default": "{}",
                    "multiline": True,
                    "tooltip": "Configuration JSON for save/import actions"
                }),
                "config_name": ("STRING", {
                    "default": "",
                    "multiline": False,
                    "tooltip": "Configuration name for load/delete actions"
                }),
            }
        }
    
    RETURN_TYPES = ("STRING", "STRING", "BOOLEAN")
    RETURN_NAMES = ("result", "message", "success")
    OUTPUT_TOOLTIPS = (
        "Action result as JSON string",
        "Human readable message",
        "True if action was successful, False otherwise"
    )
    
    FUNCTION = "manage_config"
    CATEGORY = "model/config"
    DESCRIPTION = "Manage model configurations for unified model system"
    SEARCH_ALIASES = ["config manager", "model config", "save config", "load config"]
    
    def __init__(self):
        self.config_manager = ConfigManager()
    
    def manage_config(
        self,
        action: str,
        model_id: str = "",
        model_type: str = "local",
        provider: str = "local",
        config_json: str = "{}",
        config_name: str = ""
    ) -> Tuple[str, str, bool]:
        """管理模型配置
        
        Args:
            action: 操作类型
            model_id: 模型ID
            model_type: 模型类型
            provider: 提供商
            config_json: 配置JSON
            config_name: 配置名称
            
        Returns:
            Tuple[str, str, bool]: 结果JSON、消息、是否成功
        """
        try:
            if action == "list":
                # 列出所有配置
                configs = self.config_manager.list_configs()
                result = {
                    "action": "list",
                    "configs": configs,
                    "count": len(configs)
                }
                return json.dumps(result, indent=2), f"Found {len(configs)} configurations", True
                
            elif action == "save":
                # 保存配置
                if not model_id:
                    return json.dumps({"error": "Missing model_id"}), "Error: model_id is required", False
                
                try:
                    config_data = json.loads(config_json)
                except json.JSONDecodeError:
                    return json.dumps({"error": "Invalid JSON"}), "Error: Invalid JSON in config_json", False
                
                config = ModelConfig(
                    model_id=model_id,
                    model_type=model_type,
                    provider=provider,
                    config=config_data
                )
                
                config_id = config_name if config_name else model_id
                self.config_manager.save_config(config, config_id)
                
                result = {
                    "action": "save",
                    "config_id": config_id,
                    "model_id": model_id,
                    "model_type": model_type,
                    "provider": provider
                }
                return json.dumps(result, indent=2), f"Saved configuration '{config_id}'", True
                
            elif action == "load":
                # 加载配置
                config_id = config_name if config_name else model_id
                if not config_id:
                    return json.dumps({"error": "Missing config_id"}), "Error: config_id is required", False
                
                config = self.config_manager.load_config(config_id)
                if not config:
                    return json.dumps({"error": "Config not found"}), f"Error: Configuration '{config_id}' not found", False
                
                result = {
                    "action": "load",
                    "config_id": config_id,
                    "config": config.to_dict()
                }
                return json.dumps(result, indent=2), f"Loaded configuration '{config_id}'", True
                
            elif action == "delete":
                # 删除配置
                config_id = config_name if config_name else model_id
                if not config_id:
                    return json.dumps({"error": "Missing config_id"}), "Error: config_id is required", False
                
                success = self.config_manager.delete_config(config_id)
                if not success:
                    return json.dumps({"error": "Config not found"}), f"Error: Configuration '{config_id}' not found", False
                
                result = {
                    "action": "delete",
                    "config_id": config_id,
                    "success": True
                }
                return json.dumps(result, indent=2), f"Deleted configuration '{config_id}'", True
                
            elif action == "export":
                # 导出配置
                configs = self.config_manager.list_configs()
                export_data = {
                    "exported_at": datetime.now().isoformat(),
                    "config_count": len(configs),
                    "configs": configs
                }
                return json.dumps(export_data, indent=2), f"Exported {len(configs)} configurations", True
                
            elif action == "import":
                # 导入配置
                try:
                    import_data = json.loads(config_json)
                except json.JSONDecodeError:
                    return json.dumps({"error": "Invalid JSON"}), "Error: Invalid JSON in config_json", False
                
                # 这里应该实现导入逻辑
                # 目前只返回成功消息
                result = {
                    "action": "import",
                    "message": "Import functionality not yet implemented"
                }
                return json.dumps(result, indent=2), "Import functionality not yet implemented", True
                
            else:
                return json.dumps({"error": "Unknown action"}), f"Error: Unknown action '{action}'", False
                
        except Exception as e:
            logger.error(f"Error in config management: {str(e)}")
            error_info = {
                "error": "ConfigManagementError",
                "message": str(e),
                "action": action
            }
            return json.dumps(error_info), f"Error: {str(e)}", False


class ModelRegistryViewer:
    """模型注册表查看器节点"""
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "action": (["list_models", "list_providers", "get_stats"], {
                    "default": "list_models",
                    "tooltip": "Action to perform on model registry"
                }),
            },
            "optional": {
                "provider_filter": ("STRING", {
                    "default": "",
                    "multiline": False,
                    "tooltip": "Filter by provider name"
                }),
                "model_type_filter": (["all", "local", "api"], {
                    "default": "all",
                    "tooltip": "Filter by model type"
                }),
            }
        }
    
    RETURN_TYPES = ("STRING", "STRING", "BOOLEAN")
    RETURN_NAMES = ("result", "message", "success")
    OUTPUT_TOOLTIPS = (
        "Registry information as JSON string",
        "Human readable message",
        "True if action was successful, False otherwise"
    )
    
    FUNCTION = "view_registry"
    CATEGORY = "model/info"
    DESCRIPTION = "View loaded models and providers in the registry"
    SEARCH_ALIASES = ["registry viewer", "model registry", "list models", "list providers"]
    
    def __init__(self):
        self.registry = ModelRegistry.get_instance()
    
    def view_registry(
        self,
        action: str,
        provider_filter: str = "",
        model_type_filter: str = "all"
    ) -> Tuple[str, str, bool]:
        """查看注册表信息
        
        Args:
            action: 操作类型
            provider_filter: 提供商过滤器
            model_type_filter: 模型类型过滤器
            
        Returns:
            Tuple[str, str, bool]: 结果JSON、消息、是否成功
        """
        try:
            if action == "list_models":
                # 列出所有模型
                models = self.registry.list_models()
                
                # 应用过滤器
                filtered_models = []
                for model in models:
                    if provider_filter and model.get("provider") != provider_filter:
                        continue
                    if model_type_filter != "all" and model.get("model_type") != model_type_filter:
                        continue
                    filtered_models.append(model)
                
                result = {
                    "action": "list_models",
                    "models": filtered_models,
                    "count": len(filtered_models),
                    "total_count": len(models)
                }
                return json.dumps(result, indent=2), f"Found {len(filtered_models)} models (out of {len(models)} total)", True
                
            elif action == "list_providers":
                # 列出所有提供商
                providers = self.registry.list_providers()
                
                # 应用过滤器
                filtered_providers = []
                for provider in providers:
                    if provider_filter and provider.get("name") != provider_filter:
                        continue
                    filtered_providers.append(provider)
                
                result = {
                    "action": "list_providers",
                    "providers": filtered_providers,
                    "count": len(filtered_providers),
                    "total_count": len(providers)
                }
                return json.dumps(result, indent=2), f"Found {len(filtered_providers)} providers (out of {len(providers)} total)", True
                
            elif action == "get_stats":
                # 获取统计信息
                stats = self.registry.get_stats()
                result = {
                    "action": "get_stats",
                    "stats": stats
                }
                return json.dumps(result, indent=2), "Registry statistics retrieved", True
                
            else:
                return json.dumps({"error": "Unknown action"}), f"Error: Unknown action '{action}'", False
                
        except Exception as e:
            logger.error(f"Error viewing registry: {str(e)}")
            error_info = {
                "error": "RegistryViewError",
                "message": str(e),
                "action": action
            }
            return json.dumps(error_info), f"Error: {str(e)}", False


# 节点映射
NODE_CLASS_MAPPINGS = {
    "UnifiedModelLoader": UnifiedModelLoader,
    "UnifiedModelInference": UnifiedModelInference,
    "ModelConfigManager": ModelConfigManagerNode,
    "ModelRegistryViewer": ModelRegistryViewer,
}

# 节点显示名称映射
NODE_DISPLAY_NAME_MAPPINGS = {
    "UnifiedModelLoader": "Unified Model Loader",
    "UnifiedModelInference": "Unified Model Inference",
    "ModelConfigManager": "Model Config Manager",
    "ModelRegistryViewer": "Model Registry Viewer",
}
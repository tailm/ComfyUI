"""
ComfyUI本地模型管理器

管理本地部署的模型加载、卸载和推理。
"""

import os
import torch
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from datetime import datetime

from .base import (
    ModelInterface, ModelConfig, ModelHandle, 
    ModelError, ModelLoadError, ModelInferenceError
)

# 导入ComfyUI核心模块
import comfy.sd
import comfy.controlnet
import comfy.lora
import comfy.model_patcher
import comfy.model_management
import folder_paths

logger = logging.getLogger(__name__)


@dataclass
class LocalModelHandle(ModelHandle):
    """本地模型句柄"""
    
    # 模型组件
    model: Optional[Any] = None
    clip: Optional[Any] = None
    vae: Optional[Any] = None
    controlnet: Optional[Any] = None
    lora: Optional[Any] = None
    
    # 模型类型特定信息
    model_type: str = "checkpoint"  # checkpoint, lora, controlnet, vae, clip
    file_path: Optional[str] = None
    model_options: Dict[str, Any] = field(default_factory=dict)
    
    def get_info(self) -> Dict[str, Any]:
        """获取模型信息"""
        info = super().get_info()
        info.update({
            'model_type': self.model_type,
            'file_path': self.file_path,
            'has_model': self.model is not None,
            'has_clip': self.clip is not None,
            'has_vae': self.vae is not None,
            'has_controlnet': self.controlnet is not None,
            'has_lora': self.lora is not None,
        })
        return info


class LocalModelManager(ModelInterface):
    """本地模型管理器"""
    
    def __init__(self):
        self.loaded_models: Dict[str, LocalModelHandle] = {}
        self.model_cache: Dict[str, Any] = {}
        self._lock = None  # 将在需要时初始化
        
    def _get_lock(self):
        """获取线程锁（延迟初始化）"""
        import threading
        if self._lock is None:
            self._lock = threading.RLock()
        return self._lock
    
    async def load_model(self, model_config: ModelConfig) -> LocalModelHandle:
        """加载本地模型
        
        Args:
            model_config: 模型配置
            
        Returns:
            LocalModelHandle: 本地模型句柄
            
        Raises:
            ModelLoadError: 模型加载失败
        """
        try:
            model_type = model_config.config.get('model_type', 'checkpoint')
            model_id = model_config.model_id
            
            # 检查是否已加载
            with self._get_lock():
                if model_id in self.loaded_models:
                    logger.info(f"Model {model_id} already loaded, returning cached handle")
                    return self.loaded_models[model_id]
            
            # 根据模型类型加载
            if model_type == 'checkpoint':
                handle = await self._load_checkpoint(model_config)
            elif model_type == 'lora':
                handle = await self._load_lora(model_config)
            elif model_type == 'controlnet':
                handle = await self._load_controlnet(model_config)
            elif model_type == 'vae':
                handle = await self._load_vae(model_config)
            elif model_type == 'clip':
                handle = await self._load_clip(model_config)
            else:
                raise ModelLoadError(f"Unsupported local model type: {model_type}")
            
            # 缓存模型句柄
            with self._get_lock():
                self.loaded_models[model_id] = handle
            
            logger.info(f"Successfully loaded local model: {model_id} (type: {model_type})")
            return handle
            
        except Exception as e:
            logger.error(f"Failed to load local model {model_config.model_id}: {str(e)}")
            raise ModelLoadError(f"Failed to load local model: {str(e)}") from e
    
    async def _load_checkpoint(self, model_config: ModelConfig) -> LocalModelHandle:
        """加载检查点模型"""
        model_id = model_config.model_id
        config = model_config.config
        
        # 获取模型路径
        ckpt_name = config.get('ckpt_name')
        if not ckpt_name:
            raise ModelLoadError("Checkpoint name not specified in config")
        
        ckpt_path = folder_paths.get_full_path_or_raise("checkpoints", ckpt_name)
        
        # 加载选项
        output_vae = config.get('output_vae', True)
        output_clip = config.get('output_clip', True)
        embedding_directory = config.get('embedding_directory')
        if embedding_directory is None:
            embedding_directory = folder_paths.get_folder_paths("embeddings")
        
        # 加载检查点
        logger.info(f"Loading checkpoint: {ckpt_path}")
        result = comfy.sd.load_checkpoint_guess_config(
            ckpt_path,
            output_vae=output_vae,
            output_clip=output_clip,
            embedding_directory=embedding_directory
        )
        
        # 创建模型句柄
        handle = LocalModelHandle(
            config=model_config,
            model_type='checkpoint',
            file_path=ckpt_path,
            model_options=config
        )
        
        # 设置模型组件
        if len(result) >= 1:
            handle.model = result[0]
        if len(result) >= 2:
            handle.clip = result[1]
        if len(result) >= 3:
            handle.vae = result[2]
        
        return handle
    
    async def _load_lora(self, model_config: ModelConfig) -> LocalModelHandle:
        """加载LoRA模型"""
        model_id = model_config.model_id
        config = model_config.config
        
        # 获取LoRA路径
        lora_name = config.get('lora_name')
        if not lora_name:
            raise ModelLoadError("LoRA name not specified in config")
        
        lora_path = folder_paths.get_full_path_or_raise("loras", lora_name)
        
        # 获取基础模型
        base_model = config.get('model')
        base_clip = config.get('clip')
        if not base_model or not base_clip:
            raise ModelLoadError("Base model and clip required for LoRA loading")
        
        # 加载强度
        strength_model = config.get('strength_model', 1.0)
        strength_clip = config.get('strength_clip', 1.0)
        
        # 加载LoRA
        logger.info(f"Loading LoRA: {lora_path}")
        lora = comfy.utils.load_torch_file(lora_path, safe_load=True)
        
        # 应用LoRA到模型
        model_lora, clip_lora = comfy.sd.load_lora_for_models(
            base_model, base_clip, lora, strength_model, strength_clip
        )
        
        # 创建模型句柄
        handle = LocalModelHandle(
            config=model_config,
            model_type='lora',
            file_path=lora_path,
            model_options=config
        )
        
        handle.model = model_lora
        handle.clip = clip_lora
        handle.lora = lora
        
        return handle
    
    async def _load_controlnet(self, model_config: ModelConfig) -> LocalModelHandle:
        """加载ControlNet模型"""
        model_id = model_config.model_id
        config = model_config.config
        
        # 获取ControlNet路径
        controlnet_name = config.get('control_net_name')
        if not controlnet_name:
            raise ModelLoadError("ControlNet name not specified in config")
        
        controlnet_path = folder_paths.get_full_path_or_raise("controlnet", controlnet_name)
        
        # 获取基础模型（可选）
        model = config.get('model')
        model_options = config.get('model_options', {})
        
        # 加载ControlNet
        logger.info(f"Loading ControlNet: {controlnet_path}")
        controlnet = comfy.controlnet.load_controlnet(controlnet_path, model=model, model_options=model_options)
        
        # 创建模型句柄
        handle = LocalModelHandle(
            config=model_config,
            model_type='controlnet',
            file_path=controlnet_path,
            model_options=config
        )
        
        handle.controlnet = controlnet
        if model:
            handle.model = model
        
        return handle
    
    async def _load_vae(self, model_config: ModelConfig) -> LocalModelHandle:
        """加载VAE模型"""
        model_id = model_config.model_id
        config = model_config.config
        
        # 获取VAE路径
        vae_name = config.get('vae_name')
        if not vae_name:
            raise ModelLoadError("VAE name not specified in config")
        
        vae_path = folder_paths.get_full_path_or_raise("vae", vae_name)
        
        # 加载VAE
        logger.info(f"Loading VAE: {vae_path}")
        vae = comfy.sd.load_vae(vae_path)
        
        # 创建模型句柄
        handle = LocalModelHandle(
            config=model_config,
            model_type='vae',
            file_path=vae_path,
            model_options=config
        )
        
        handle.vae = vae
        
        return handle
    
    async def _load_clip(self, model_config: ModelConfig) -> LocalModelHandle:
        """加载CLIP模型"""
        model_id = model_config.model_id
        config = model_config.config
        
        # 获取CLIP路径
        clip_name = config.get('clip_name')
        if not clip_name:
            raise ModelLoadError("CLIP name not specified in config")
        
        # 注意：CLIP通常作为检查点的一部分加载
        # 这里我们假设用户提供了完整的检查点路径
        ckpt_path = folder_paths.get_full_path_or_raise("checkpoints", clip_name)
        
        # 加载CLIP（通过检查点）
        logger.info(f"Loading CLIP from checkpoint: {ckpt_path}")
        result = comfy.sd.load_checkpoint_guess_config(
            ckpt_path,
            output_vae=False,
            output_clip=True,
            embedding_directory=folder_paths.get_folder_paths("embeddings")
        )
        
        # 创建模型句柄
        handle = LocalModelHandle(
            config=model_config,
            model_type='clip',
            file_path=ckpt_path,
            model_options=config
        )
        
        if len(result) >= 2:
            handle.clip = result[1]
        
        return handle
    
    async def unload_model(self, model_handle: LocalModelHandle):
        """卸载本地模型
        
        Args:
            model_handle: 本地模型句柄
            
        Raises:
            ModelError: 卸载失败
        """
        try:
            model_id = model_handle.config.model_id
            
            # 从缓存中移除
            with self._get_lock():
                if model_id in self.loaded_models:
                    del self.loaded_models[model_id]
            
            # 清理模型组件（让Python GC处理）
            model_handle.model = None
            model_handle.clip = None
            model_handle.vae = None
            model_handle.controlnet = None
            model_handle.lora = None
            
            # 清理GPU缓存
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                torch.cuda.synchronize()
            
            logger.info(f"Successfully unloaded local model: {model_id}")
            
        except Exception as e:
            logger.error(f"Failed to unload local model {model_handle.config.model_id}: {str(e)}")
            raise ModelError(f"Failed to unload local model: {str(e)}") from e
    
    async def inference(self, model_handle: LocalModelHandle, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """执行本地模型推理
        
        Args:
            model_handle: 本地模型句柄
            inputs: 输入数据
            
        Returns:
            Dict[str, Any]: 推理结果
            
        Raises:
            ModelInferenceError: 推理失败
        """
        try:
            model_type = model_handle.model_type
            model_id = model_handle.config.model_id
            
            logger.info(f"Starting inference for local model: {model_id} (type: {model_type})")
            
            # 根据模型类型执行推理
            if model_type == 'checkpoint':
                result = await self._inference_checkpoint(model_handle, inputs)
            elif model_type == 'lora':
                result = await self._inference_lora(model_handle, inputs)
            elif model_type == 'controlnet':
                result = await self._inference_controlnet(model_handle, inputs)
            elif model_type == 'vae':
                result = await self._inference_vae(model_handle, inputs)
            elif model_type == 'clip':
                result = await self._inference_clip(model_handle, inputs)
            else:
                raise ModelInferenceError(f"Unsupported model type for inference: {model_type}")
            
            # 更新使用统计
            model_handle.mark_used()
            
            logger.info(f"Successfully completed inference for local model: {model_id}")
            return result
            
        except Exception as e:
            logger.error(f"Inference failed for local model {model_handle.config.model_id}: {str(e)}")
            raise ModelInferenceError(f"Inference failed: {str(e)}") from e
    
    async def _inference_checkpoint(self, model_handle: LocalModelHandle, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """检查点模型推理"""
        # 这里需要根据具体的推理逻辑实现
        # 由于ComfyUI的推理逻辑复杂，这里提供一个框架
        model = model_handle.model
        clip = model_handle.clip
        vae = model_handle.vae
        
        if not model:
            raise ModelInferenceError("Model not loaded")
        
        # 提取输入参数
        prompt = inputs.get('prompt', '')
        negative_prompt = inputs.get('negative_prompt', '')
        steps = inputs.get('steps', 20)
        cfg = inputs.get('cfg', 7.0)
        sampler_name = inputs.get('sampler_name', 'euler')
        scheduler = inputs.get('scheduler', 'normal')
        width = inputs.get('width', 512)
        height = inputs.get('height', 512)
        seed = inputs.get('seed', -1)
        
        # 这里应该调用ComfyUI的采样器
        # 由于复杂性，这里只返回框架结构
        return {
            'type': 'checkpoint_inference',
            'model_id': model_handle.config.model_id,
            'inputs': inputs,
            'status': 'success',
            'message': 'Checkpoint inference would be performed here',
            'outputs': {
                'latent': None,  # 实际应该是latent tensor
                'images': []     # 实际应该是生成的图像列表
            }
        }
    
    async def _inference_lora(self, model_handle: LocalModelHandle, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """LoRA模型推理"""
        # LoRA通常与基础模型一起使用
        # 这里调用检查点推理，因为LoRA已经应用到模型上
        return await self._inference_checkpoint(model_handle, inputs)
    
    async def _inference_controlnet(self, model_handle: LocalModelHandle, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """ControlNet模型推理"""
        controlnet = model_handle.controlnet
        if not controlnet:
            raise ModelInferenceError("ControlNet not loaded")
        
        # ControlNet需要控制图像和条件
        control_image = inputs.get('control_image')
        conditioning = inputs.get('conditioning')
        
        if control_image is None or conditioning is None:
            raise ModelInferenceError("ControlNet requires control_image and conditioning inputs")
        
        # 这里应该应用ControlNet到条件
        # 由于复杂性，这里只返回框架结构
        return {
            'type': 'controlnet_inference',
            'model_id': model_handle.config.model_id,
            'inputs': inputs,
            'status': 'success',
            'message': 'ControlNet conditioning would be applied here',
            'outputs': {
                'conditioning': conditioning  # 实际应该是应用了ControlNet的条件
            }
        }
    
    async def _inference_vae(self, model_handle: LocalModelHandle, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """VAE模型推理"""
        vae = model_handle.vae
        if not vae:
            raise ModelInferenceError("VAE not loaded")
        
        # VAE可以编码或解码
        operation = inputs.get('operation', 'decode')
        latent = inputs.get('latent')
        image = inputs.get('image')
        
        if operation == 'decode' and latent is None:
            raise ModelInferenceError("VAE decode requires latent input")
        elif operation == 'encode' and image is None:
            raise ModelInferenceError("VAE encode requires image input")
        
        # 这里应该调用VAE的编码或解码
        return {
            'type': 'vae_inference',
            'model_id': model_handle.config.model_id,
            'operation': operation,
            'status': 'success',
            'message': f'VAE {operation} would be performed here',
            'outputs': {
                'result': None  # 实际应该是编码的latent或解码的图像
            }
        }
    
    async def _inference_clip(self, model_handle: LocalModelHandle, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """CLIP模型推理"""
        clip = model_handle.clip
        if not clip:
            raise ModelInferenceError("CLIP not loaded")
        
        # CLIP用于文本编码
        text = inputs.get('text', '')
        if not text:
            raise ModelInferenceError("CLIP requires text input")
        
        # 这里应该调用CLIP的文本编码
        return {
            'type': 'clip_inference',
            'model_id': model_handle.config.model_id,
            'inputs': inputs,
            'status': 'success',
            'message': 'CLIP text encoding would be performed here',
            'outputs': {
                'embeddings': None  # 实际应该是文本嵌入
            }
        }
    
    async def validate_config(self, model_config: ModelConfig) -> bool:
        """验证本地模型配置
        
        Args:
            model_config: 模型配置
            
        Returns:
            bool: 配置是否有效
            
        Raises:
            ValueError: 配置验证失败
        """
        model_type = model_config.config.get('model_type', 'checkpoint')
        
        if model_type not in ['checkpoint', 'lora', 'controlnet', 'vae', 'clip']:
            raise ValueError(f"Invalid local model type: {model_type}")
        
        # 验证必要参数
        if model_type == 'checkpoint':
            if 'ckpt_name' not in model_config.config:
                raise ValueError("Checkpoint model requires 'ckpt_name' in config")
                
            ckpt_name = model_config.config['ckpt_name']
            if not folder_paths.get_full_path("checkpoints", ckpt_name):
                raise ValueError(f"Checkpoint not found: {ckpt_name}")
        
        elif model_type == 'lora':
            if 'lora_name' not in model_config.config:
                raise ValueError("LoRA model requires 'lora_name' in config")
            
            lora_name = model_config.config['lora_name']
            if not folder_paths.get_full_path("loras", lora_name):
                raise ValueError(f"LoRA not found: {lora_name}")
            
            if 'model' not in model_config.config or 'clip' not in model_config.config:
                raise ValueError("LoRA model requires 'model' and 'clip' in config")
        
        elif model_type == 'controlnet':
            if 'control_net_name' not in model_config.config:
                raise ValueError("ControlNet model requires 'control_net_name' in config")
            
            controlnet_name = model_config.config['control_net_name']
            if not folder_paths.get_full_path("controlnet", controlnet_name):
                raise ValueError(f"ControlNet not found: {controlnet_name}")
        
        elif model_type == 'vae':
            if 'vae_name' not in model_config.config:
                raise ValueError("VAE model requires 'vae_name' in config")
            
            vae_name = model_config.config['vae_name']
            if not folder_paths.get_full_path("vae", vae_name):
                raise ValueError(f"VAE not found: {vae_name}")
        
        elif model_type == 'clip':
            if 'clip_name' not in model_config.config:
                raise ValueError("CLIP model requires 'clip_name' in config")
            
            clip_name = model_config.config['clip_name']
            if not folder_paths.get_full_path("checkpoints", clip_name):
                raise ValueError(f"CLIP checkpoint not found: {clip_name}")
        
        return True
    
    def get_supported_models(self) -> List[str]:
        """获取支持的本地模型列表
        
        Returns:
            List[str]: 支持的模型类型列表
        """
        return ['checkpoint', 'lora', 'controlnet', 'vae', 'clip']
    
    def list_available_models(self, model_type: str = None) -> List[str]:
        """列出可用的本地模型
        
        Args:
            model_type: 模型类型（可选）
            
        Returns:
            List[str]: 可用模型名称列表
        """
        if model_type == 'checkpoint' or model_type is None:
            return folder_paths.get_filename_list("checkpoints")
        elif model_type == 'lora':
            return folder_paths.get_filename_list("loras")
        elif model_type == 'controlnet':
            return folder_paths.get_filename_list("controlnet")
        elif model_type == 'vae':
            return folder_paths.get_filename_list("vae")
        elif model_type == 'clip':
            # CLIP通常从检查点加载
            return folder_paths.get_filename_list("checkpoints")
        else:
            return []
    
    def get_model_info(self, model_id: str) -> Optional[Dict[str, Any]]:
        """获取模型信息
        
        Args:
            model_id: 模型ID
            
        Returns:
            Optional[Dict[str, Any]]: 模型信息，如果未加载则返回None
        """
        with self._get_lock():
            if model_id in self.loaded_models:
                handle = self.loaded_models[model_id]
                return handle.get_info()
        return None
    
    def cleanup(self):
        """清理所有加载的模型"""
        with self._get_lock():
            model_ids = list(self.loaded_models.keys())
            for model_id in model_ids:
                try:
                    handle = self.loaded_models[model_id]
                    # 清理模型组件
                    handle.model = None
                    handle.clip = None
                    handle.vae = None
                    handle.controlnet = None
                    handle.lora = None
                except Exception as e:
                    logger.warning(f"Failed to cleanup model {model_id}: {str(e)}")
            
            self.loaded_models.clear()
            
            # 清理GPU缓存
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                torch.cuda.synchronize()
            
            logger.info("Cleaned up all local models")
"""
ComfyUI模型注册表

管理所有注册的模型，提供模型查找、注册和生命周期管理功能。
"""

import threading
import time
from typing import Dict, List, Optional, Any, Set
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from .base import ModelConfig, ModelHandle, ModelInterface, ModelError


@dataclass
class ModelCacheEntry:
    """模型缓存条目"""
    model_handle: ModelHandle
    last_access: datetime
    access_count: int = 0
    size_bytes: Optional[int] = None
    
    def update_access(self):
        """更新访问时间"""
        self.last_access = datetime.now()
        self.access_count += 1


class ModelRegistry:
    """模型注册表"""
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        """单例模式"""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        """初始化注册表"""
        if getattr(self, '_initialized', False):
            return
            
        self._models: Dict[str, ModelConfig] = {}
        self._loaded_models: Dict[str, ModelCacheEntry] = {}
        self._providers: Dict[str, ModelInterface] = {}
        self._lock = threading.RLock()
        self._initialized = True
        
        # 缓存配置
        self.max_cache_size = 10  # 最大缓存模型数
        self.cache_ttl = timedelta(hours=1)  # 缓存TTL
        self.cleanup_interval = timedelta(minutes=5)  # 清理间隔
        self.last_cleanup = datetime.now()
    
    def register_provider(self, provider_id: str, provider: ModelInterface):
        """注册提供商
        
        Args:
            provider_id: 提供商ID
            provider: 提供商实例
        """
        with self._lock:
            self._providers[provider_id] = provider
    
    def unregister_provider(self, provider_id: str):
        """注销提供商
        
        Args:
            provider_id: 提供商ID
        """
        with self._lock:
            if provider_id in self._providers:
                del self._providers[provider_id]
    
    def get_provider(self, provider_id: str) -> Optional[ModelInterface]:
        """获取提供商
        
        Args:
            provider_id: 提供商ID
            
        Returns:
            Optional[ModelInterface]: 提供商实例，如果不存在则返回None
        """
        with self._lock:
            return self._providers.get(provider_id)
    
    def list_providers(self) -> List[str]:
        """列出所有提供商ID
        
        Returns:
            List[str]: 提供商ID列表
        """
        with self._lock:
            return list(self._providers.keys())
    
    def register_model(self, model_config: ModelConfig):
        """注册模型配置
        
        Args:
            model_config: 模型配置
            
        Raises:
            ValueError: 模型ID已存在
        """
        with self._lock:
            if model_config.model_id in self._models:
                raise ValueError(f"Model with ID '{model_config.model_id}' already exists")
            self._models[model_config.model_id] = model_config
    
    def update_model(self, model_config: ModelConfig):
        """更新模型配置
        
        Args:
            model_config: 模型配置
        """
        with self._lock:
            self._models[model_config.model_id] = model_config
    
    def delete_model(self, model_id: str):
        """删除模型配置
        
        Args:
            model_id: 模型ID
        """
        with self._lock:
            if model_id in self._models:
                del self._models[model_id]
            # 同时从缓存中移除
            if model_id in self._loaded_models:
                del self._loaded_models[model_id]
    
    def get_model_config(self, model_id: str) -> Optional[ModelConfig]:
        """获取模型配置
        
        Args:
            model_id: 模型ID
            
        Returns:
            Optional[ModelConfig]: 模型配置，如果不存在则返回None
        """
        with self._lock:
            return self._models.get(model_id)
    
    def list_models(self, filter_type: Optional[str] = None, 
                   filter_provider: Optional[str] = None) -> List[str]:
        """列出模型ID
        
        Args:
            filter_type: 过滤类型（local/api）
            filter_provider: 过滤提供商
            
        Returns:
            List[str]: 模型ID列表
        """
        with self._lock:
            result = []
            for model_id, config in self._models.items():
                if filter_type and config.model_type != filter_type:
                    continue
                if filter_provider and config.provider != filter_provider:
                    continue
                result.append(model_id)
            return result
    
    async def load_model(self, model_id: str) -> ModelHandle:
        """加载模型
        
        Args:
            model_id: 模型ID
            
        Returns:
            ModelHandle: 模型句柄
            
        Raises:
            KeyError: 模型配置不存在
            ModelError: 模型加载失败
        """
        # 检查缓存
        cached = self._get_cached_model(model_id)
        if cached:
            cached.update_access()
            return cached.model_handle
        
        # 获取模型配置
        model_config = self.get_model_config(model_id)
        if not model_config:
            raise KeyError(f"Model configuration not found: {model_id}")
        
        # 获取提供商
        provider = self.get_provider(model_config.provider)
        if not provider:
            raise ModelError(f"Provider not found: {model_config.provider}")
        
        # 验证配置
        if not await provider.validate_config(model_config):
            raise ModelError(f"Invalid model configuration: {model_id}")
        
        # 加载模型
        model_handle = await provider.load_model(model_config)
        
        # 缓存模型
        self._cache_model(model_id, model_handle)
        
        # 清理过期缓存
        self._cleanup_cache()
        
        return model_handle
    
    def get_loaded_model(self, model_id: str) -> Optional[ModelHandle]:
        """获取已加载的模型
        
        Args:
            model_id: 模型ID
            
        Returns:
            Optional[ModelHandle]: 模型句柄，如果未加载则返回None
        """
        cached = self._get_cached_model(model_id)
        if cached:
            cached.update_access()
            return cached.model_handle
        return None
    
    async def unload_model(self, model_id: str):
        """卸载模型
        
        Args:
            model_id: 模型ID
            
        Raises:
            KeyError: 模型未加载
        """
        with self._lock:
            if model_id not in self._loaded_models:
                raise KeyError(f"Model not loaded: {model_id}")
            
            cache_entry = self._loaded_models[model_id]
            model_handle = cache_entry.model_handle
            
            # 获取提供商并卸载模型
            provider = self.get_provider(model_handle.config.provider)
            if provider:
                await provider.unload_model(model_handle)
            
            # 从缓存中移除
            del self._loaded_models[model_id]
    
    async def inference(self, model_id: str, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """执行推理
        
        Args:
            model_id: 模型ID
            inputs: 输入数据
            
        Returns:
            Dict[str, Any]: 推理结果
            
        Raises:
            KeyError: 模型未加载
            ModelError: 推理失败
        """
        # 获取或加载模型
        model_handle = self.get_loaded_model(model_id)
        if not model_handle:
            model_handle = await self.load_model(model_id)
        
        # 获取提供商
        provider = self.get_provider(model_handle.config.provider)
        if not provider:
            raise ModelError(f"Provider not found: {model_handle.config.provider}")
        
        # 执行推理
        try:
            result = await provider.inference(model_handle, inputs)
            return result
        except Exception as e:
            # 重新抛出为ModelError
            raise ModelError(f"Inference failed for model {model_id}: {str(e)}") from e
    
    def _get_cached_model(self, model_id: str) -> Optional[ModelCacheEntry]:
        """获取缓存的模型
        
        Args:
            model_id: 模型ID
            
        Returns:
            Optional[ModelCacheEntry]: 缓存条目，如果未缓存则返回None
        """
        with self._lock:
            if model_id not in self._loaded_models:
                return None
            
            cache_entry = self._loaded_models[model_id]
            
            # 检查是否过期
            if datetime.now() - cache_entry.last_access > self.cache_ttl:
                del self._loaded_models[model_id]
                return None
            
            return cache_entry
    
    def _cache_model(self, model_id: str, model_handle: ModelHandle):
        """缓存模型
        
        Args:
            model_id: 模型ID
            model_handle: 模型句柄
        """
        with self._lock:
            # 如果缓存已满，移除最久未使用的
            if len(self._loaded_models) >= self.max_cache_size:
                self._remove_least_recently_used()
            
            cache_entry = ModelCacheEntry(
                model_handle=model_handle,
                last_access=datetime.now(),
                access_count=1
            )
            self._loaded_models[model_id] = cache_entry
    
    def _remove_least_recently_used(self):
        """移除最久未使用的模型"""
        if not self._loaded_models:
            return
        
        # 找到最久未访问的模型
        lru_model_id = min(
            self._loaded_models.items(),
            key=lambda x: x[1].last_access
        )[0]
        
        # 从缓存中移除
        del self._loaded_models[lru_model_id]
    
    def _cleanup_cache(self):
        """清理过期缓存"""
        now = datetime.now()
        if now - self.last_cleanup < self.cleanup_interval:
            return
        
        with self._lock:
            expired_models = []
            for model_id, cache_entry in self._loaded_models.items():
                if now - cache_entry.last_access > self.cache_ttl:
                    expired_models.append(model_id)
            
            for model_id in expired_models:
                del self._loaded_models[model_id]
            
            self.last_cleanup = now
    
    def get_cache_info(self) -> Dict[str, Any]:
        """获取缓存信息
        
        Returns:
            Dict[str, Any]: 缓存统计信息
        """
        with self._lock:
            total_size = 0
            for cache_entry in self._loaded_models.values():
                if cache_entry.size_bytes:
                    total_size += cache_entry.size_bytes
            
            return {
                'total_models': len(self._models),
                'loaded_models': len(self._loaded_models),
                'cache_size_bytes': total_size,
                'max_cache_size': self.max_cache_size,
                'cache_ttl_seconds': self.cache_ttl.total_seconds(),
                'providers': list(self._providers.keys())
            }
    
    def clear_cache(self):
        """清空缓存"""
        with self._lock:
            self._loaded_models.clear()
    
    def get_instance():
        """获取注册表实例（单例）"""
        return ModelRegistry()
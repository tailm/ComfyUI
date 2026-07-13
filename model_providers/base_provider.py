"""
ComfyUI模型提供商基础类

定义所有模型提供商的统一接口。
"""

import logging
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from datetime import datetime

from typing import Dict, List, Optional, Any
from datetime import datetime

from model_manager.base import (
    ModelConfig,
    ModelError,
    ModelLoadError,
    ModelInferenceError,
    APIConnectionError,
    RateLimitError,
    AuthenticationError
)

logger = logging.getLogger(__name__)


class BaseProvider:
    """提供商基础类"""
    
    def __init__(self, provider_id: str, provider_name: str):
        """初始化提供商
        
        Args:
            provider_id: 提供商ID
            provider_name: 提供商名称
        """
        self.provider_id = provider_id
        self.provider_name = provider_name
        self.supported_models: List[str] = []
        self.default_params: Dict[str, Any] = {}
        self.initialized = False
    
    async def initialize(self):
        """初始化提供商"""
        if not self.initialized:
            await self._initialize()
            self.initialized = True
    
    async def _initialize(self):
        """提供商特定初始化"""
        raise NotImplementedError("Subclasses must implement _initialize")
    
    async def validate_config(self, config: ModelConfig) -> bool:
        """验证配置
        
        Args:
            config: 模型配置
            
        Returns:
            bool: 配置是否有效
            
        Raises:
            ValueError: 配置验证失败
        """
        raise NotImplementedError("Subclasses must implement validate_config")
    
    async def inference(self, config: ModelConfig, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """执行推理
        
        Args:
            config: 模型配置
            inputs: 输入数据
            
        Returns:
            Dict[str, Any]: 推理结果
            
        Raises:
            ModelInferenceError: 推理失败
        """
        raise NotImplementedError("Subclasses must implement inference")
    
    def get_supported_models(self) -> List[str]:
        """获取支持的模型列表
        
        Returns:
            List[str]: 支持的模型ID列表
        """
        raise NotImplementedError("Subclasses must implement get_supported_models")
    
    def get_default_params(self) -> Dict[str, Any]:
        """获取默认参数
        
        Returns:
            Dict[str, Any]: 默认参数
        """
        raise NotImplementedError("Subclasses must implement get_default_params")
    
    def get_provider_info(self) -> Dict[str, Any]:
        """获取提供商信息
        
        Returns:
            Dict[str, Any]: 提供商信息
        """
        return {
            'provider_id': self.provider_id,
            'provider_name': self.provider_name,
            'supported_models': self.supported_models,
            'default_params': self.default_params,
            'initialized': self.initialized
        }
    
    async def test_connection(self, config: ModelConfig) -> bool:
        """测试连接
        
        Args:
            config: 模型配置
            
        Returns:
            bool: 连接是否成功
        """
        try:
            # 验证配置
            if not await self.validate_config(config):
                return False
            
            # 尝试简单的连接测试
            # 具体实现由子类提供
            return await self._test_connection(config)
            
        except Exception as e:
            logger.error(f"Connection test failed for provider {self.provider_id}: {str(e)}")
            return False
    
    async def _test_connection(self, config: ModelConfig) -> bool:
        """提供商特定的连接测试
        
        Args:
            config: 模型配置
            
        Returns:
            bool: 连接是否成功
        """
        # 默认实现返回True，子类可以重写
        return True
    
    def format_inputs(self, inputs: Dict[str, Any], config: ModelConfig) -> Dict[str, Any]:
        """格式化输入数据
        
        Args:
            inputs: 原始输入数据
            config: 模型配置
            
        Returns:
            Dict[str, Any]: 格式化后的输入数据
        """
        # 默认实现，子类可以重写
        formatted = inputs.copy()
        
        # 应用默认参数
        for key, value in self.default_params.items():
            if key not in formatted:
                formatted[key] = value
        
        # 应用配置参数
        for key, value in config.config.items():
            if key not in formatted or formatted[key] is None:
                formatted[key] = value
        
        return formatted
    
    def format_outputs(self, raw_outputs: Dict[str, Any], config: ModelConfig) -> Dict[str, Any]:
        """格式化输出数据
        
        Args:
            raw_outputs: 原始输出数据
            config: 模型配置
            
        Returns:
            Dict[str, Any]: 格式化后的输出数据
        """
        # 默认实现，子类可以重写
        formatted = {
            'provider': self.provider_id,
            'model_id': config.model_id,
            'timestamp': datetime.now().isoformat(),
            'raw_outputs': raw_outputs
        }
        
        # 提取常见字段
        if 'choices' in raw_outputs:
            formatted['choices'] = raw_outputs['choices']
        if 'data' in raw_outputs:
            formatted['data'] = raw_outputs['data']
        if 'output' in raw_outputs:
            formatted['output'] = raw_outputs['output']
        if 'result' in raw_outputs:
            formatted['result'] = raw_outputs['result']
        
        return formatted
    
    async def batch_inference(
        self, 
        config: ModelConfig, 
        inputs_list: List[Dict[str, Any]],
        max_concurrent: int = 5
    ) -> List[Dict[str, Any]]:
        """批量推理
        
        Args:
            config: 模型配置
            inputs_list: 输入数据列表
            max_concurrent: 最大并发数
            
        Returns:
            List[Dict[str, Any]]: 推理结果列表
            
        Raises:
            ModelInferenceError: 推理失败
        """
        import asyncio
        
        results = []
        errors = []
        
        # 创建信号量限制并发数
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def process_input(inputs: Dict[str, Any]):
            async with semaphore:
                try:
                    result = await self.inference(config, inputs)
                    return result, None
                except Exception as e:
                    return None, str(e)
        
        # 创建所有任务
        tasks = [process_input(inputs) for inputs in inputs_list]
        
        # 等待所有任务完成
        task_results = await asyncio.gather(*tasks, return_exceptions=False)
        
        # 处理结果
        for result, error in task_results:
            if error:
                errors.append(error)
                results.append({
                    'error': error,
                    'success': False
                })
            else:
                results.append({
                    **result,
                    'success': True
                })
        
        # 如果有错误，记录但不抛出（让调用者决定如何处理）
        if errors:
            logger.warning(f"Batch inference completed with {len(errors)} errors out of {len(inputs_list)} requests")
        
        return results
    
    def get_usage_stats(self) -> Dict[str, Any]:
        """获取使用统计
        
        Returns:
            Dict[str, Any]: 使用统计
        """
        # 默认实现，子类可以重写
        return {
            'provider_id': self.provider_id,
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'average_latency_ms': 0.0
        }
    
    async def cleanup(self):
        """清理资源"""
        # 默认实现，子类可以重写
        self.initialized = False
    
    def __str__(self):
        return f"{self.provider_name} ({self.provider_id})"
    
    def __repr__(self):
        return f"<BaseProvider {self.provider_id}>"
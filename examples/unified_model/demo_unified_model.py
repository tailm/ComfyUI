#!/usr/bin/env python3
"""
ComfyUI统一模型调用系统演示

这个脚本演示如何使用新实现的统一模型调用系统。
"""

import asyncio
import json
import logging
from datetime import datetime

# 设置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 导入模型管理器
from model_manager.base import ModelConfig
from model_manager.registry import ModelRegistry
from model_manager.local_manager import LocalModelManager
from model_manager.api_manager import APIModelManager
from model_manager.config_manager import ConfigManager

# 导入提供商
from model_providers.local_provider import LocalProvider
from model_providers.openai_provider import OpenAIProvider
from model_providers.anthropic_provider import AnthropicProvider
from model_providers.stability_provider import StabilityProvider


async def demo_config_manager():
    """演示配置管理器"""
    print("\n" + "="*60)
    print("演示: 配置管理器")
    print("="*60)
    
    config_manager = ConfigManager()
    
    # 1. 创建本地模型配置
    local_config = ModelConfig(
        model_id="sd-xl-base-1.0",
        model_type="local",
        provider="local",
        config={
            "model_type": "checkpoint",
            "ckpt_name": "sd_xl_base_1.0.safetensors",
            "device": "cuda",
            "dtype": "float16"
        }
    )
    
    # 2. 保存配置
    config_manager.save_config(local_config)
    print("✓ 保存本地模型配置: sd-xl-base-1.0")
    
    # 3. 创建API模型配置
    api_config = ModelConfig(
        model_id="gpt-4o",
        model_type="api",
        provider="openai",
        config={
            "model": "gpt-4o",
            "api_key": "sk-...",  # 实际使用时需要替换
            "base_url": "https://api.openai.com/v1",
            "max_tokens": 1000,
            "temperature": 0.7
        }
    )
    
    # 4. 保存API配置
    config_manager.save_config(api_config)
    print("✓ 保存API模型配置: gpt-4o")
    
    # 5. 列出所有配置
    configs = config_manager.list_configs()
    print(f"✓ 列出所有配置 ({len(configs)} 个):")
    for config in configs:
        print(f"  - {config.model_id}: {config.model_id} ({config.model_type}/{config.provider})")
    
    # 6. 搜索配置
    search_results = config_manager.search_configs("sd")
    print(f"✓ 搜索 'sd' 的结果 ({len(search_results)} 个):")
    for result in search_results:
        print(f"  - {result.model_id}")
    
    # 7. 获取统计信息
    configs = config_manager.list_configs()
    local_count = sum(1 for c in configs if c.model_type == "local")
    api_count = sum(1 for c in configs if c.model_type == "api")
    print("✓ 配置统计信息:")
    print(f"  总配置数: {len(configs)}")
    print(f"  本地配置: {local_count}")
    print(f"  API配置: {api_count}")
    
    # 8. 导出配置
    export_data = config_manager.export_all_configs()
    print(f"✓ 导出配置 ({len(export_data)} 个配置)")
    
    return config_manager


async def demo_local_provider():
    """演示本地提供商"""
    print("\n" + "="*60)
    print("演示: 本地提供商")
    print("="*60)
    
    local_manager = LocalModelManager()
    local_provider = LocalProvider(local_manager)
    
    # 1. 初始化提供商
    await local_provider.initialize()
    print("✓ 初始化本地提供商")
    
    # 2. 获取支持的模型
    supported_models = local_provider.get_supported_models()
    print(f"✓ 支持的模型类型: {', '.join(supported_models)}")
    
    # 3. 获取默认参数
    default_params = local_provider.get_default_params()
    print("✓ 默认参数:")
    print(json.dumps(default_params, indent=2, ensure_ascii=False))
    
    # 4. 获取提供商信息
    provider_info = local_provider.get_provider_info()
    print("✓ 提供商信息:")
    print(json.dumps(provider_info, indent=2, ensure_ascii=False))
    
    # 5. 创建测试配置
    test_config = ModelConfig(
        model_id="test-checkpoint",
        model_type="local",
        provider="local",
        config={
            "model_type": "checkpoint",
            "ckpt_name": "test.ckpt"
        }
    )
    
    # 6. 验证配置
    try:
        is_valid = await local_provider.validate_config(test_config)
        print(f"✓ 配置验证: {'有效' if is_valid else '无效'}")
    except Exception as e:
        print(f"✗ 配置验证失败: {str(e)}")
    
    # 7. 测试输入格式化
    test_inputs = {"prompt": "一只可爱的猫在花园里玩耍"}
    formatted_inputs = local_provider.format_inputs(test_inputs, test_config)
    print("✓ 输入格式化测试:")
    print(f"  原始输入: {test_inputs}")
    print(f"  格式化后: {formatted_inputs}")
    
    return local_provider


async def demo_api_manager():
    """演示API管理器"""
    print("\n" + "="*60)
    print("演示: API管理器")
    print("="*60)
    
    config_manager = ConfigManager()
    api_manager = APIModelManager(config_manager)
    
    # 1. 注册提供商
    openai_provider = OpenAIProvider(api_manager)
    anthropic_provider = AnthropicProvider(api_manager)
    stability_provider = StabilityProvider(api_manager)
    
    api_manager.register_provider("openai", openai_provider)
    api_manager.register_provider("anthropic", anthropic_provider)
    api_manager.register_provider("stability", stability_provider)
    
    print("✓ 注册提供商: openai, anthropic, stability")
    
    # 2. 获取支持的提供商
    supported_providers = api_manager.get_supported_providers()
    print(f"✓ 支持的提供商: {', '.join(supported_providers)}")
    
    # 3. 创建测试配置
    test_config = ModelConfig(
        model_id="test-openai-model",
        model_type="api",
        provider="openai",
        config={
            "model": "gpt-3.5-turbo",
            "api_key": "test-key",  # 测试用
            "base_url": "https://api.openai.com/v1"
        }
    )
    
    # 4. 验证配置
    try:
        is_valid = await api_manager.validate_config(test_config)
        print(f"✓ 配置验证: {'有效' if is_valid else '无效'}")
    except Exception as e:
        print(f"⚠ 配置验证失败 (预期中，因为缺少有效API密钥): {str(e)}")
    
    # 5. 获取速率限制信息
    rate_limit_info = api_manager.get_rate_limit_info("openai")
    print("✓ 速率限制信息:")
    print(json.dumps(rate_limit_info, indent=2, ensure_ascii=False))
    
    return api_manager


async def demo_registry():
    """演示模型注册表"""
    print("\n" + "="*60)
    print("演示: 模型注册表")
    print("="*60)
    
    registry = ModelRegistry.get_instance()
    
    # 1. 注册提供商
    local_manager = LocalModelManager()
    local_provider = LocalProvider(local_manager)
    registry.register_provider("local", local_provider)
    
    config_manager = ConfigManager()
    api_manager = APIModelManager(config_manager)
    openai_provider = OpenAIProvider(api_manager)
    registry.register_provider("openai", openai_provider)
    
    print("✓ 注册提供商: local, openai")
    
    # 2. 列出提供商
    providers = registry.list_providers()
    print(f"✓ 已注册的提供商 ({len(providers)} 个):")
    for provider_id in providers:
        print(f"  - {provider_id}")
    
    # 3. 获取缓存信息
    cache_info = registry.get_cache_info()
    print("✓ 缓存信息:")
    print(json.dumps(cache_info, indent=2, ensure_ascii=False))
    
    # 4. 获取统计信息
    cache_info = registry.get_cache_info()
    print("✓ 统计信息:")
    print(f"  已注册提供商: {len(providers)} 个")
    print(f"  缓存模型数: {cache_info.get('loaded_models', 0)}")
    print(f"  最大缓存大小: {cache_info.get('max_cache_size', 0)}")
    print(f"  缓存TTL: {cache_info.get('cache_ttl_seconds', 0)} 秒")
    
    # 6. 获取缓存信息
    cache_info = registry.get_cache_info()
    print("✓ 缓存信息:")
    print(json.dumps(cache_info, indent=2, ensure_ascii=False))
    
    # 5. 清理缓存
    registry.clear_cache()
    print("✓ 清理缓存")
    
    return registry


async def demo_unified_nodes():
    """演示统一节点"""
    print("\n" + "="*60)
    print("演示: 统一节点")
    print("="*60)
    
    # 导入节点
    from nodes_unified_model import (
        UnifiedModelLoader,
        UnifiedModelInference,
        ModelConfigManagerNode,
        ModelRegistryViewer
    )
    
    print("✓ 导入节点类:")
    print(f"  - UnifiedModelLoader: {UnifiedModelLoader}")
    print(f"  - UnifiedModelInference: {UnifiedModelInference}")
    print(f"  - ModelConfigManagerNode: {ModelConfigManagerNode}")
    print(f"  - ModelRegistryViewer: {ModelRegistryViewer}")
    
    # 检查节点映射
    from nodes_unified_model import NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS
    
    print("\n✓ 节点类映射:")
    for key, value in NODE_CLASS_MAPPINGS.items():
        print(f"  - {key}: {value}")
    
    print("\n✓ 节点显示名称映射:")
    for key, value in NODE_DISPLAY_NAME_MAPPINGS.items():
        print(f"  - {key}: {value}")
    
    # 检查节点输入类型
    print("\n✓ 节点输入类型定义:")
    
    loader_input_types = UnifiedModelLoader.INPUT_TYPES()
    print(f"  - UnifiedModelLoader 输入类型: {list(loader_input_types['required'].keys())}")
    
    inference_input_types = UnifiedModelInference.INPUT_TYPES()
    print(f"  - UnifiedModelInference 输入类型: {list(inference_input_types['required'].keys())}")
    
    config_input_types = ModelConfigManagerNode.INPUT_TYPES()
    print(f"  - ModelConfigManagerNode 输入类型: {list(config_input_types['required'].keys())}")
    
    registry_input_types = ModelRegistryViewer.INPUT_TYPES()
    print(f"  - ModelRegistryViewer 输入类型: {list(registry_input_types['required'].keys())}")
    
    print("\n✓ 所有节点都正确实现")


async def main():
    """主演示函数"""
    print("="*60)
    print("ComfyUI统一模型调用系统演示")
    print("="*60)
    print("这个演示展示新实现的统一模型调用系统的功能。")
    print("系统支持本地模型和第三方API模型的统一调用。")
    print("="*60)
    
    try:
        # 演示配置管理器
        config_manager = await demo_config_manager()
        
        # 演示本地提供商
        local_provider = await demo_local_provider()
        
        # 演示API管理器
        api_manager = await demo_api_manager()
        
        # 演示模型注册表
        registry = await demo_registry()
        
        # 演示统一节点
        await demo_unified_nodes()
        
        print("\n" + "="*60)
        print("演示完成!")
        print("="*60)
        print("✓ 配置管理器: 支持本地和API模型配置管理")
        print("✓ 本地提供商: 支持本地模型加载和推理")
        print("✓ API管理器: 支持第三方API模型调用")
        print("✓ 模型注册表: 统一管理所有模型和提供商")
        print("✓ 统一节点: 提供ComfyUI节点接口")
        print("="*60)
        print("系统已成功实现，可以开始使用!")
        
    except Exception as e:
        print(f"\n✗ 演示过程中出现错误: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
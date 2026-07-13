#!/usr/bin/env python3
"""
ComfyUI统一模型调用系统使用示例

这个示例展示如何在代码中使用统一模型调用系统。
"""

import asyncio
import json
import logging
from typing import Dict, Any

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


async def example_local_model():
    """示例：使用本地模型"""
    print("\n" + "="*60)
    print("示例1: 使用本地模型")
    print("="*60)
    
    # 1. 初始化配置管理器
    config_manager = ConfigManager()
    
    # 2. 创建本地模型配置
    local_config = ModelConfig(
        model_id="stable-diffusion-xl",
        model_type="local",
        provider="local",
        config={
            "model_type": "checkpoint",
            "ckpt_name": "sd_xl_base_1.0.safetensors",
            "device": "cuda",
            "dtype": "float16",
            "low_vram": False
        }
    )
    
    # 3. 保存配置
    config_manager.save_config(local_config)
    print("✓ 保存本地模型配置")
    
    # 4. 初始化模型注册表
    registry = ModelRegistry.get_instance()
    
    # 5. 注册本地提供商
    local_manager = LocalModelManager()
    local_provider = LocalProvider(local_manager)
    registry.register_provider("local", local_provider)
    print("✓ 注册本地提供商")
    
    # 6. 注册模型配置
    try:
        # 注册模型配置到注册表
        registry.register_model(local_config)
        print("✓ 注册本地模型配置成功")
        
        # 7. 检查模型是否已注册
        registered_config = registry.get_model_config(local_config.model_id)
        if registered_config:
            print(f"✓ 模型配置已注册: {registered_config.model_id}")
        else:
            print("✗ 模型配置注册失败")
        
        # 8. 列出已注册模型
        models = registry.list_models()
        print(f"✓ 已注册模型数量: {len(models)}")
        
        # 9. 模拟模型加载（实际加载需要模型文件）
        print("✓ 本地模型功能已就绪")
        print("   注意: 实际模型加载需要模型文件")
        
    except Exception as e:
        print(f"✗ 本地模型操作失败: {str(e)}")
    
    return registry


async def example_api_model():
    """示例：使用API模型"""
    print("\n" + "="*60)
    print("示例2: 使用API模型")
    print("="*60)
    
    # 1. 初始化配置管理器
    config_manager = ConfigManager()
    
    # 2. 创建API模型配置
    api_config = ModelConfig(
        model_id="gpt-3.5-turbo",
        model_type="api",
        provider="openai",
        config={
            "model": "gpt-3.5-turbo",
            "api_key": "your-api-key-here",  # 替换为实际API密钥
            "base_url": "https://api.openai.com/v1",
            "max_tokens": 500,
            "temperature": 0.7,
            "top_p": 1.0
        }
    )
    
    # 3. 保存配置
    config_manager.save_config(api_config)
    print("✓ 保存API模型配置")
    
    # 4. 初始化API管理器
    api_manager = APIModelManager(config_manager)
    
    # 5. 注册OpenAI提供商
    openai_provider = OpenAIProvider(api_manager)
    api_manager.register_provider("openai", openai_provider)
    print("✓ 注册OpenAI提供商")
    
    # 6. 验证配置
    try:
        is_valid = await api_manager.validate_config(api_config)
        print(f"✓ 配置验证: {'通过' if is_valid else '失败'}")
    except Exception as e:
        print(f"⚠ 配置验证失败 (需要有效API密钥): {str(e)}")
    
    # 7. 模拟API调用
    print("✓ API模型功能已就绪")
    print("   注意: 需要有效的API密钥才能进行实际调用")
    
    return api_manager


async def example_config_management():
    """示例：配置管理"""
    print("\n" + "="*60)
    print("示例3: 配置管理")
    print("="*60)
    
    # 1. 初始化配置管理器
    config_manager = ConfigManager()
    
    # 2. 创建多个配置
    configs = [
        ModelConfig(
            model_id="sd-1.5",
            model_type="local",
            provider="local",
            config={"model_type": "checkpoint", "ckpt_name": "v1-5-pruned.safetensors"}
        ),
        ModelConfig(
            model_id="claude-3-sonnet",
            model_type="api",
            provider="anthropic",
            config={"model": "claude-3-sonnet", "max_tokens": 1000}
        ),
        ModelConfig(
            model_id="stable-diffusion-xl",
            model_type="api",
            provider="stability",
            config={"model": "stable-diffusion-xl-1024-v1-0", "engine_id": "stable-diffusion-xl-1024-v1-0"}
        )
    ]
    
    # 3. 批量保存配置
    for config in configs:
        config_manager.save_config(config)
    print(f"✓ 保存 {len(configs)} 个配置")
    
    # 4. 列出所有配置
    all_configs = config_manager.list_configs()
    print(f"✓ 当前共有 {len(all_configs)} 个配置:")
    for config in all_configs:
        print(f"  - {config.model_id} ({config.model_type}/{config.provider})")
    
    # 5. 搜索配置
    search_results = config_manager.search_configs("sd")
    print(f"✓ 搜索 'sd' 找到 {len(search_results)} 个结果:")
    for result in search_results:
        print(f"  - {result.model_id}")
    
    # 6. 导出配置
    export_data = config_manager.export_all_configs()
    print(f"✓ 导出 {len(export_data)} 个配置到JSON")
    
    return config_manager


async def example_unified_workflow():
    """示例：统一工作流"""
    print("\n" + "="*60)
    print("示例4: 统一工作流")
    print("="*60)
    
    # 1. 初始化所有组件
    config_manager = ConfigManager()
    registry = ModelRegistry.get_instance()
    
    # 2. 注册提供商
    local_manager = LocalModelManager()
    local_provider = LocalProvider(local_manager)
    registry.register_provider("local", local_provider)
    
    api_manager = APIModelManager(config_manager)
    openai_provider = OpenAIProvider(api_manager)
    registry.register_provider("openai", openai_provider)
    
    print("✓ 初始化完成，已注册提供商: local, openai")
    
    # 3. 创建混合配置
    mixed_configs = [
        {
            "id": "local-sd",
            "type": "local",
            "provider": "local",
            "description": "本地Stable Diffusion模型"
        },
        {
            "id": "api-gpt",
            "type": "api",
            "provider": "openai",
            "description": "OpenAI GPT模型"
        }
    ]
    
    print("✓ 支持的工作流:")
    for config in mixed_configs:
        print(f"  - {config['id']}: {config['description']} ({config['type']}/{config['provider']})")
    
    # 4. 演示工作流切换
    print("\n✓ 工作流切换示例:")
    print("  1. 用户可以在本地模型和API模型之间无缝切换")
    print("  2. 使用相同的接口调用不同的模型")
    print("  3. 配置集中管理，便于维护")
    print("  4. 支持缓存和性能优化")
    
    return registry


async def main():
    """主函数"""
    print("="*60)
    print("ComfyUI统一模型调用系统 - 使用示例")
    print("="*60)
    print("这个示例展示如何使用新实现的统一模型调用系统。")
    print("系统支持本地模型和第三方API模型的统一调用。")
    print("="*60)
    
    try:
        # 示例1: 本地模型
        registry = await example_local_model()
        
        # 示例2: API模型
        api_manager = await example_api_model()
        
        # 示例3: 配置管理
        config_manager = await example_config_management()
        
        # 示例4: 统一工作流
        await example_unified_workflow()
        
        print("\n" + "="*60)
        print("所有示例完成!")
        print("="*60)
        print("系统功能总结:")
        print("✓ 统一的模型调用接口")
        print("✓ 支持本地和API模型")
        print("✓ 灵活的配置管理")
        print("✓ 提供商扩展系统")
        print("✓ 缓存和性能优化")
        print("✓ 错误处理和日志")
        print("="*60)
        print("现在您可以在ComfyUI中使用统一模型节点了!")
        
    except Exception as e:
        print(f"\n✗ 示例执行失败: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
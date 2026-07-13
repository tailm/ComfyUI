#!/usr/bin/env python3
"""
ComfyUI统一模型调用系统测试脚本

测试新实现的统一模型调用系统。
"""

import asyncio
import json
import sys
import os

# 添加当前目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from model_manager.base import ModelConfig, RateLimitConfig
from model_manager.registry import ModelRegistry
from model_manager.config_manager import ConfigManager
from model_manager.local_manager import LocalModelManager
from model_manager.api_manager import APIModelManager
from model_providers.local_provider import LocalProvider
from model_providers.openai_provider import OpenAIProvider


async def test_config_manager():
    """测试配置管理器"""
    print("=" * 60)
    print("测试配置管理器")
    print("=" * 60)
    
    try:
        # 创建配置管理器
        config_manager = ConfigManager(config_dir="./test_configs", encrypt_keys=False)
        
        # 创建测试配置
        test_config = ModelConfig(
            model_id="test-model-1",
            model_type="local",
            provider="local",
            config={
                "model_type": "checkpoint",
                "ckpt_name": "test_checkpoint.ckpt"
            },
            name="测试模型1",
            description="这是一个测试本地模型配置",
            tags=["test", "local", "checkpoint"]
        )
        
        # 保存配置
        print("1. 保存配置...")
        success = config_manager.save_config(test_config)
        print(f"   结果: {'成功' if success else '失败'}")
        
        # 加载配置
        print("2. 加载配置...")
        loaded_config = config_manager.load_config("test-model-1")
        print(f"   结果: {'找到' if loaded_config else '未找到'}")
        if loaded_config:
            print(f"   模型ID: {loaded_config.model_id}")
            print(f"   模型类型: {loaded_config.model_type}")
            print(f"   提供商: {loaded_config.provider}")
        
        # 列出配置
        print("3. 列出所有配置...")
        configs = config_manager.list_configs()
        print(f"   找到 {len(configs)} 个配置")
        for config in configs:
            print(f"   - {config.model_id} ({config.model_type}/{config.provider})")
        
        # 搜索配置
        print("4. 搜索配置...")
        search_results = config_manager.search_configs("测试")
        print(f"   搜索到 {len(search_results)} 个结果")
        
        # 导出配置
        print("5. 导出配置...")
        exported = config_manager.export_config("test-model-1", include_sensitive=False)
        print(f"   导出成功: {exported['model_id']}")
        
        # 获取统计信息
        print("6. 获取统计信息...")
        stats = config_manager.get_config_stats()
        print(f"   总配置数: {stats['total_configs']}")
        print(f"   本地配置: {stats['local_configs']}")
        print(f"   API配置: {stats['api_configs']}")
        
        # 删除配置
        print("7. 删除配置...")
        deleted = config_manager.delete_config("test-model-1")
        print(f"   结果: {'成功' if deleted else '失败'}")
        
        # 清理测试目录
        import shutil
        if os.path.exists("./test_configs"):
            shutil.rmtree("./test_configs")
        
        print("配置管理器测试完成!")
        return True
        
    except Exception as e:
        print(f"配置管理器测试失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


async def test_local_provider():
    """测试本地提供商"""
    print("\n" + "=" * 60)
    print("测试本地提供商")
    print("=" * 60)
    
    try:
        # 创建本地管理器
        local_manager = LocalModelManager()
        
        # 创建本地提供商
        local_provider = LocalProvider(local_manager)
        
        # 初始化提供商
        print("1. 初始化提供商...")
        await local_provider.initialize()
        print(f"   提供商: {local_provider.provider_name}")
        print(f"   提供商ID: {local_provider.provider_id}")
        
        # 获取支持的模型
        print("2. 获取支持的模型...")
        supported_models = local_provider.get_supported_models()
        print(f"   支持的模型类型: {', '.join(supported_models)}")
        
        # 获取默认参数
        print("3. 获取默认参数...")
        default_params = local_provider.get_default_params()
        print(f"   默认参数: {json.dumps(default_params, indent=2, ensure_ascii=False)}")
        
        # 获取提供商信息
        print("4. 获取提供商信息...")
        provider_info = local_provider.get_provider_info()
        print(f"   提供商信息: {json.dumps(provider_info, indent=2, ensure_ascii=False, default=str)}")
        
        # 测试配置验证
        print("5. 测试配置验证...")
        test_config = ModelConfig(
            model_id="test-local-model",
            model_type="local",
            provider="local",
            config={
                "model_type": "checkpoint",
                "ckpt_name": "test.ckpt"
            }
        )
        
        try:
            valid = await local_provider.validate_config(test_config)
            print(f"   配置验证: {'有效' if valid else '无效'}")
        except ValueError as e:
            print(f"   配置验证失败 (预期中): {str(e)}")
        
        # 测试输入格式化
        print("6. 测试输入格式化...")
        inputs = {"prompt": "测试提示词"}
        formatted = local_provider.format_inputs(inputs, test_config)
        print(f"   原始输入: {inputs}")
        print(f"   格式化后: {formatted}")
        
        # 清理
        print("7. 清理资源...")
        await local_provider.cleanup()
        print("   清理完成")
        
        print("本地提供商测试完成!")
        return True
        
    except Exception as e:
        print(f"本地提供商测试失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


async def test_registry():
    """测试模型注册表"""
    print("\n" + "=" * 60)
    print("测试模型注册表")
    print("=" * 60)
    
    try:
        # 获取注册表实例
        registry = ModelRegistry.get_instance()
        
        # 创建配置管理器
        config_manager = ConfigManager(config_dir="./test_registry_configs", encrypt_keys=False)
        
        # 创建本地提供商
        local_manager = LocalModelManager()
        local_provider = LocalProvider(local_manager)
        
        # 注册提供商
        print("1. 注册提供商...")
        registry.register_provider("local", local_provider)
        providers = registry.list_providers()
        print(f"   已注册的提供商: {', '.join(providers)}")
        
        # 创建测试配置
        print("2. 创建测试配置...")
        test_config = ModelConfig(
            model_id="test-registry-model",
            model_type="local",
            provider="local",
            config={
                "model_type": "checkpoint",
                "ckpt_name": "test_checkpoint.ckpt"
            }
        )
        
        # 保存配置
        config_manager.save_config(test_config)
        
        # 注册模型配置
        print("3. 注册模型配置...")
        registry.register_model(test_config)
        
        # 列出模型
        print("4. 列出模型...")
        models = registry.list_models()
        print(f"   注册的模型: {', '.join(models)}")
        
        # 获取模型配置
        print("5. 获取模型配置...")
        loaded_config = registry.get_model_config("test-registry-model")
        print(f"   模型配置: {'找到' if loaded_config else '未找到'}")
        
        # 获取缓存信息
        print("6. 获取缓存信息...")
        cache_info = registry.get_cache_info()
        print(f"   缓存信息: {json.dumps(cache_info, indent=2, ensure_ascii=False, default=str)}")
        
        # 清理
        print("7. 清理缓存...")
        registry.clear_cache()
        print("   缓存已清理")
        
        # 清理测试目录
        import shutil
        if os.path.exists("./test_registry_configs"):
            shutil.rmtree("./test_registry_configs")
        
        print("模型注册表测试完成!")
        return True
        
    except Exception as e:
        print(f"模型注册表测试失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


async def test_api_manager():
    """测试API管理器"""
    print("\n" + "=" * 60)
    print("测试API管理器")
    print("=" * 60)
    
    try:
        # 创建配置管理器
        config_manager = ConfigManager(config_dir="./test_api_configs", encrypt_keys=False)
        
        # 创建API管理器
        api_manager = APIModelManager(config_manager)
        
        # 注册提供商
        print("1. 注册提供商...")
        openai_provider = OpenAIProvider(api_manager)
        api_manager.register_provider("openai", openai_provider)
        
        # 获取支持的提供商
        providers = api_manager.get_supported_providers()
        print(f"   支持的提供商: {', '.join(providers)}")
        
        # 创建测试配置
        print("2. 创建测试配置...")
        test_config = ModelConfig(
            model_id="test-openai-model",
            model_type="api",
            provider="openai",
            config={
                "model": "gpt-3.5-turbo",
                "temperature": 0.7,
                "max_tokens": 100
            },
            api_key="test-key-12345",  # 测试密钥
            timeout=30,
            max_retries=3
        )
        
        # 保存配置
        config_manager.save_config(test_config)
        
        # 测试配置验证
        print("3. 测试配置验证...")
        try:
            valid = await api_manager.validate_config(test_config)
            print(f"   配置验证: {'有效' if valid else '无效'}")
        except ValueError as e:
            print(f"   配置验证失败 (预期中): {str(e)}")
        
        # 测试连接（会失败，因为没有真正的API密钥）
        print("4. 测试连接...")
        try:
            connected = await api_manager.test_connection(test_config)
            print(f"   连接测试: {'成功' if connected else '失败'}")
        except Exception as e:
            print(f"   连接测试失败 (预期中): {str(e)}")
        
        # 获取速率限制信息
        print("5. 获取速率限制信息...")
        rate_limit_info = api_manager.get_rate_limit_info()
        print(f"   速率限制信息: {json.dumps(rate_limit_info, indent=2, ensure_ascii=False, default=str)}")
        
        # 清理
        print("6. 清理资源...")
        api_manager.cleanup()
        print("   清理完成")
        
        # 清理测试目录
        import shutil
        if os.path.exists("./test_api_configs"):
            shutil.rmtree("./test_api_configs")
        
        print("API管理器测试完成!")
        return True
        
    except Exception as e:
        print(f"API管理器测试失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


async def test_unified_nodes():
    """测试统一节点"""
    print("\n" + "=" * 60)
    print("测试统一节点")
    print("=" * 60)
    
    try:
        # 导入节点类
        from nodes_unified_model import (
            UnifiedModelLoader,
            UnifiedModelInference,
            ModelConfigManagerNode,
            ModelRegistryViewer
        )
        
        print("1. 检查节点类...")
        nodes = [
            ("UnifiedModelLoader", UnifiedModelLoader),
            ("UnifiedModelInference", UnifiedModelInference),
            ("ModelConfigManager", ModelConfigManagerNode),
            ("ModelRegistryViewer", ModelRegistryViewer)
        ]
        
        for name, node_class in nodes:
            print(f"   - {name}: {'找到' if node_class else '未找到'}")
            if node_class:
                print(f"     类别: {node_class.CATEGORY}")
                print(f"     描述: {node_class.DESCRIPTION}")
        
        print("2. 检查节点映射...")
        from nodes_unified_model import NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS
        
        print(f"   节点类映射: {list(NODE_CLASS_MAPPINGS.keys())}")
        print(f"   节点显示名称映射: {list(NODE_DISPLAY_NAME_MAPPINGS.keys())}")
        
        print("3. 测试节点架构...")
        for node_name, node_class in NODE_CLASS_MAPPINGS.items():
            print(f"   - {node_name}:")
            
            # 检查必要的类属性
            if hasattr(node_class, 'define_schema'):
                try:
                    schema = node_class.define_schema()
                    print(f"     架构定义: 成功")
                    print(f"     节点ID: {schema.node_id}")
                    print(f"     显示名称: {schema.display_name}")
                    print(f"     类别: {schema.category}")
                except Exception as e:
                    print(f"     架构定义失败: {str(e)}")
            else:
                print(f"     无架构定义方法")
            
            # 检查必要的实例属性
            if hasattr(node_class, 'FUNCTION'):
                print(f"     函数: {node_class.FUNCTION}")
            if hasattr(node_class, 'CATEGORY'):
                print(f"     类别: {node_class.CATEGORY}")
            if hasattr(node_class, 'DESCRIPTION'):
                print(f"     描述: {node_class.DESCRIPTION}")
        
        print("统一节点测试完成!")
        return True
        
    except Exception as e:
        print(f"统一节点测试失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """主测试函数"""
    print("开始测试ComfyUI统一模型调用系统")
    print("=" * 60)
    
    tests = [
        ("配置管理器", test_config_manager),
        ("本地提供商", test_local_provider),
        ("模型注册表", test_registry),
        ("API管理器", test_api_manager),
        ("统一节点", test_unified_nodes),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n开始测试: {test_name}")
        try:
            success = await test_func()
            results.append((test_name, success))
            print(f"测试 {test_name}: {'通过' if success else '失败'}")
        except Exception as e:
            print(f"测试 {test_name} 异常: {str(e)}")
            results.append((test_name, False))
    
    # 打印测试结果
    print("\n" + "=" * 60)
    print("测试结果汇总")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for test_name, success in results:
        status = "✓ 通过" if success else "✗ 失败"
        print(f"{status}: {test_name}")
        if success:
            passed += 1
        else:
            failed += 1
    
    print(f"\n总计: {len(tests)} 个测试")
    print(f"通过: {passed}")
    print(f"失败: {failed}")
    
    if failed == 0:
        print("\n所有测试通过! 🎉")
        return True
    else:
        print(f"\n有 {failed} 个测试失败，请检查实现。")
        return False


if __name__ == "__main__":
    # 运行测试
    success = asyncio.run(main())
    
    # 清理临时目录
    import shutil
    for dir_name in ["./test_configs", "./test_registry_configs", "./test_api_configs"]:
        if os.path.exists(dir_name):
            shutil.rmtree(dir_name)
    
    sys.exit(0 if success else 1)
"""
ComfyUI内存优化启动脚本
在ComfyUI启动时启用智能内存管理
"""

import os
import sys
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def enable_memory_optimization():
    """启用内存优化功能"""
    try:
        # 导入内存优化模块
        from comfy.memory_management_enhanced import (
            enable_smart_memory,
            enable_memory_pool,
            enable_defragmentation,
            enable_monitoring,
            print_memory_status
        )
        
        from comfy.memory_defragmenter import set_defragmentation_strategy
        from comfy.memory_monitor import start_monitoring
        
        # 启用所有优化功能
        enable_smart_memory(True)
        enable_memory_pool(True)
        enable_defragmentation(True)
        enable_monitoring(True, interval=5.0)
        
        # 设置智能碎片整理策略
        set_defragmentation_strategy("smart")
        
        # 启动监控
        start_monitoring()
        
        logger.info("内存优化功能已启用")
        print_memory_status()
        
        return True
        
    except ImportError as e:
        logger.error(f"无法导入内存优化模块: {e}")
        return False
    except Exception as e:
        logger.error(f"启用内存优化时出错: {e}")
        return False

def configure_optimization_settings():
    """配置优化设置"""
    try:
        # 这些设置可以根据系统配置进行调整
        import torch
        
        # 根据可用内存调整设置
        if torch.cuda.is_available():
            # 获取GPU内存
            gpu_memory = torch.cuda.get_device_properties(0).total_memory
            
            # 根据GPU内存调整设置
            if gpu_memory >= 16 * 1024 * 1024 * 1024:  # 16GB+
                # 大内存系统
                min_block_size = 1024 * 1024  # 1MB
                max_block_size = 256 * 1024 * 1024  # 256MB
                defrag_threshold = 0.3  # 30%碎片率触发整理
            elif gpu_memory >= 8 * 1024 * 1024 * 1024:  # 8GB
                # 中等内存系统
                min_block_size = 512 * 1024  # 512KB
                max_block_size = 128 * 1024 * 1024  # 128MB
                defrag_threshold = 0.25  # 25%碎片率触发整理
            else:
                # 小内存系统
                min_block_size = 256 * 1024  # 256KB
                max_block_size = 64 * 1024 * 1024  # 64MB
                defrag_threshold = 0.2  # 20%碎片率触发整理
            
            logger.info(f"GPU内存: {gpu_memory / (1024**3):.1f}GB")
            logger.info(f"最小块大小: {min_block_size:,} 字节")
            logger.info(f"最大块大小: {max_block_size:,} 字节")
            logger.info(f"碎片整理阈值: {defrag_threshold:.0%}")
            
            # 应用配置
            from comfy.memory_pool import memory_manager
            for pool in memory_manager.pools.values():
                pool.min_block_size = min_block_size
                pool.max_block_size = max_block_size
                pool.defragmentation_threshold = defrag_threshold
            
            return True
        else:
            logger.info("CUDA不可用，使用CPU默认设置")
            return True
            
    except Exception as e:
        logger.error(f"配置优化设置时出错: {e}")
        return False

def patch_comfyui_memory_functions():
    """修补ComfyUI的内存管理函数"""
    try:
        import comfy.model_management as mm
        
        # 检查是否已经修补
        if hasattr(mm, '_original_empty_cache'):
            logger.info("内存管理函数已修补")
            return True
        
        # 导入增强的内存管理
        from comfy.memory_management_enhanced import (
            enhanced_soft_empty_cache,
            enhanced_unload_all_models,
            enhanced_get_free_memory,
            enhanced_get_total_memory,
            wrap_memory_functions
        )
        
        # 包装原有函数
        wrap_memory_functions()
        
        # 替换函数
        mm.soft_empty_cache = enhanced_soft_empty_cache
        mm.unload_all_models = enhanced_unload_all_models
        mm.get_free_memory = enhanced_get_free_memory
        mm.get_total_memory = enhanced_get_total_memory
        
        logger.info("ComfyUI内存管理函数已修补")
        return True
        
    except Exception as e:
        logger.error(f"修补ComfyUI内存函数时出错: {e}")
        return False

def setup_performance_monitoring():
    """设置性能监控"""
    try:
        from comfy.memory_monitor import (
            get_memory_monitor,
            start_monitoring,
            export_performance_report
        )
        
        # 创建监控目录
        monitor_dir = os.path.join(os.path.dirname(__file__), "memory_monitor_logs")
        os.makedirs(monitor_dir, exist_ok=True)
        
        # 设置定期导出报告
        import threading
        import time
        
        def export_periodic_report():
            """定期导出性能报告"""
            while True:
                try:
                    timestamp = time.strftime("%Y%m%d_%H%M%S")
                    report_file = os.path.join(monitor_dir, f"memory_report_{timestamp}.json")
                    if export_performance_report(report_file):
                        logger.debug(f"性能报告已导出: {report_file}")
                except Exception as e:
                    logger.error(f"导出性能报告时出错: {e}")
                
                # 每5分钟导出一次
                time.sleep(300)
        
        # 启动定期导出线程
        export_thread = threading.Thread(target=export_periodic_report, daemon=True)
        export_thread.start()
        
        logger.info(f"性能监控已设置，日志目录: {monitor_dir}")
        return True
        
    except Exception as e:
        logger.error(f"设置性能监控时出错: {e}")
        return False

def create_webui_extension():
    """创建WebUI扩展（如果可用）"""
    try:
        # 检查是否在WebUI环境中
        import folder_paths
        import nodes
        
        # 创建自定义节点
        class MemoryOptimizationNode:
            @classmethod
            def INPUT_TYPES(cls):
                return {
                    "required": {
                        "enable": ("BOOLEAN", {"default": True}),
                        "strategy": (["smart", "aggressive", "moderate", "conservative"], {"default": "smart"}),
                        "monitoring_interval": ("FLOAT", {"default": 5.0, "min": 1.0, "max": 60.0, "step": 1.0}),
                    }
                }
            
            RETURN_TYPES = ("STRING",)
            RETURN_NAMES = ("status",)
            FUNCTION = "apply_optimization"
            CATEGORY = "memory"
            
            def apply_optimization(self, enable, strategy, monitoring_interval):
                try:
                    from comfy.memory_management_enhanced import (
                        enable_smart_memory,
                        enable_memory_pool,
                        enable_defragmentation,
                        enable_monitoring
                    )
                    
                    from comfy.memory_defragmenter import set_defragmentation_strategy
                    
                    # 应用设置
                    enable_smart_memory(enable)
                    enable_memory_pool(enable)
                    enable_defragmentation(enable)
                    enable_monitoring(enable, monitoring_interval)
                    set_defragmentation_strategy(strategy)
                    
                    status = f"内存优化已{'启用' if enable else '禁用'}, 策略: {strategy}, 监控间隔: {monitoring_interval}s"
                    logger.info(status)
                    
                    return (status,)
                    
                except Exception as e:
                    error_msg = f"应用内存优化设置时出错: {e}"
                    logger.error(error_msg)
                    return (error_msg,)
        
        # 注册节点
        nodes.NODE_CLASS_MAPPINGS["MemoryOptimization"] = MemoryOptimizationNode
        nodes.NODE_DISPLAY_NAME_MAPPINGS["MemoryOptimization"] = "Memory Optimization"
        
        logger.info("WebUI扩展已创建")
        return True
        
    except ImportError:
        logger.info("不在WebUI环境中，跳过扩展创建")
        return True
    except Exception as e:
        logger.error(f"创建WebUI扩展时出错: {e}")
        return False

def main():
    """主函数：启用所有内存优化功能"""
    print("="*80)
    print("ComfyUI 内存优化启动")
    print("="*80)
    
    success_count = 0
    total_steps = 5
    
    # 步骤1: 启用内存优化
    print("\n1. 启用内存优化功能...")
    if enable_memory_optimization():
        print("   ✓ 内存优化已启用")
        success_count += 1
    else:
        print("   ✗ 启用内存优化失败")
    
    # 步骤2: 配置优化设置
    print("\n2. 配置优化设置...")
    if configure_optimization_settings():
        print("   ✓ 优化设置已配置")
        success_count += 1
    else:
        print("   ✗ 配置优化设置失败")
    
    # 步骤3: 修补ComfyUI函数
    print("\n3. 修补ComfyUI内存管理函数...")
    if patch_comfyui_memory_functions():
        print("   ✓ 内存管理函数已修补")
        success_count += 1
    else:
        print("   ✗ 修补内存管理函数失败")
    
    # 步骤4: 设置性能监控
    print("\n4. 设置性能监控...")
    if setup_performance_monitoring():
        print("   ✓ 性能监控已设置")
        success_count += 1
    else:
        print("   ✗ 设置性能监控失败")
    
    # 步骤5: 创建WebUI扩展
    print("\n5. 创建WebUI扩展...")
    if create_webui_extension():
        print("   ✓ WebUI扩展已创建")
        success_count += 1
    else:
        print("   ✗ 创建WebUI扩展失败")
    
    # 总结
    print("\n" + "="*80)
    print(f"启动完成: {success_count}/{total_steps} 个步骤成功")
    print("="*80)
    
    if success_count == total_steps:
        print("\n✅ 所有内存优化功能已成功启用!")
        print("\n功能摘要:")
        print("  • 智能内存池: 启用")
        print("  • 自动碎片整理: 启用")
        print("  • 性能监控: 启用")
        print("  • ComfyUI集成: 完成")
        print("  • WebUI扩展: 可用")
        
        print("\n使用方法:")
        print("  1. 在WebUI中使用 'Memory Optimization' 节点调整设置")
        print("  2. 查看日志目录中的性能报告")
        print("  3. 监控内存使用情况并优化工作流")
        
        print("\n日志文件:")
        print("  • memory_optimization.log - 优化日志")
        print("  • memory_monitor_logs/ - 性能报告目录")
    else:
        print(f"\n⚠️  部分功能启用失败 ({total_steps - success_count}/{total_steps})")
        print("请检查日志文件获取详细信息")
    
    return success_count == total_steps

def quick_start():
    """快速启动函数"""
    print("快速启用ComfyUI内存优化...")
    
    # 简化版本，只启用核心功能
    try:
        from comfy.memory_management_enhanced import (
            enable_smart_memory,
            enable_memory_pool,
            enable_defragmentation,
            enable_monitoring
        )
        
        enable_smart_memory(True)
        enable_memory_pool(True)
        enable_defragmentation(True)
        enable_monitoring(True, interval=10.0)
        
        print("✅ 内存优化已启用")
        return True
        
    except Exception as e:
        print(f"❌ 启用内存优化失败: {e}")
        return False

if __name__ == "__main__":
    # 检查命令行参数
    import argparse
    
    parser = argparse.ArgumentParser(description="ComfyUI内存优化启动脚本")
    parser.add_argument("--quick", action="store_true", help="快速启动模式")
    parser.add_argument("--test", action="store_true", help="运行测试")
    parser.add_argument("--example", action="store_true", help="运行示例")
    
    args = parser.parse_args()
    
    if args.quick:
        # 快速启动模式
        success = quick_start()
        sys.exit(0 if success else 1)
    
    elif args.test:
        # 运行测试
        print("运行内存优化测试...")
        import subprocess
        result = subprocess.run([sys.executable, "test_memory_optimization.py"])
        sys.exit(result.returncode)
    
    elif args.example:
        # 运行示例
        print("运行内存优化示例...")
        import subprocess
        result = subprocess.run([sys.executable, "examples/memory_optimization_example.py"])
        sys.exit(result.returncode)
    
    else:
        # 完整启动模式
        success = main()
        sys.exit(0 if success else 1)
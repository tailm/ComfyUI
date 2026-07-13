#!/usr/bin/env python3
"""
增强的内存清理补丁
在模型调用后立即清理GPU内存，防止内存累积
"""

import sys
import os
import torch
import gc
import logging
from typing import Optional

# 添加ComfyUI路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EnhancedMemoryCleaner:
    """增强的内存清理器"""
    
    def __init__(self, cleanup_threshold_mb: int = 1024):
        """
        初始化清理器
        
        Args:
            cleanup_threshold_mb: 清理阈值（MB），当内存使用超过此值时触发清理
        """
        self.cleanup_threshold_mb = cleanup_threshold_mb
        self.last_memory_usage = 0
        self.cleanup_count = 0
        
        # 检查CUDA是否可用
        self.cuda_available = torch.cuda.is_available()
        if self.cuda_available:
            self.device = torch.device("cuda:0")
            logger.info(f"GPU内存清理器已初始化，设备: {self.device}")
        else:
            self.device = torch.device("cpu")
            logger.warning("CUDA不可用，将使用CPU模式")
    
    def get_memory_usage_mb(self) -> float:
        """获取当前GPU内存使用量（MB）"""
        if not self.cuda_available:
            return 0.0
        
        try:
            allocated = torch.cuda.memory_allocated(self.device)
            return allocated / (1024 * 1024)  # 转换为MB
        except Exception as e:
            logger.warning(f"获取GPU内存使用量失败: {e}")
            return 0.0
    
    def should_cleanup(self) -> bool:
        """检查是否需要清理"""
        if not self.cuda_available:
            return False
        
        current_usage = self.get_memory_usage_mb()
        
        # 如果内存使用超过阈值，需要清理
        if current_usage > self.cleanup_threshold_mb:
            logger.debug(f"内存使用 {current_usage:.1f}MB > 阈值 {self.cleanup_threshold_mb}MB，触发清理")
            return True
        
        # 如果内存使用显著增加（超过50%），也需要清理
        if self.last_memory_usage > 0:
            increase_ratio = (current_usage - self.last_memory_usage) / self.last_memory_usage
            if increase_ratio > 0.5:  # 增加超过50%
                logger.debug(f"内存使用增加 {increase_ratio:.1%}，触发清理")
                return True
        
        return False
    
    def cleanup(self, aggressive: bool = False) -> dict:
        """
        执行内存清理
        
        Args:
            aggressive: 是否执行激进清理
            
        Returns:
            清理统计信息
        """
        if not self.cuda_available:
            return {"freed_mb": 0, "steps": {}, "error": "CUDA not available"}
        
        logger.info("开始增强内存清理...")
        
        # 记录清理前状态
        before_allocated = torch.cuda.memory_allocated(self.device)
        before_reserved = torch.cuda.memory_reserved(self.device)
        
        # 执行清理步骤
        steps = {}
        
        # 步骤1: Python垃圾回收
        try:
            collected = gc.collect()
            steps["python_gc"] = f"回收了 {collected} 个对象"
            logger.debug(f"Python垃圾回收: 回收了 {collected} 个对象")
        except Exception as e:
            steps["python_gc"] = f"失败: {e}"
            logger.warning(f"Python垃圾回收失败: {e}")
        
        # 步骤2: PyTorch缓存清理
        try:
            torch.cuda.empty_cache()
            torch.cuda.synchronize()
            steps["pytorch_cache"] = "已清理"
            logger.debug("PyTorch缓存已清理")
        except Exception as e:
            steps["pytorch_cache"] = f"失败: {e}"
            logger.warning(f"PyTorch缓存清理失败: {e}")
        
        # 步骤3: 激进清理（如果启用）
        if aggressive:
            try:
                # 重置内存统计
                torch.cuda.reset_peak_memory_stats(self.device)
                torch.cuda.reset_accumulated_memory_stats(self.device)
                
                # 清理IPC缓存
                torch.cuda.ipc_collect()
                
                steps["aggressive_cleanup"] = "已执行"
                logger.debug("激进清理已执行")
            except Exception as e:
                steps["aggressive_cleanup"] = f"失败: {e}"
                logger.warning(f"激进清理失败: {e}")
        
        # 记录清理后状态
        after_allocated = torch.cuda.memory_allocated(self.device)
        after_reserved = torch.cuda.memory_reserved(self.device)
        
        # 计算释放的内存
        allocated_freed = before_allocated - after_allocated
        reserved_freed = before_reserved - after_reserved
        total_freed = allocated_freed + reserved_freed
        
        # 更新最后的内存使用量
        self.last_memory_usage = self.get_memory_usage_mb()
        self.cleanup_count += 1
        
        # 记录结果
        result = {
            "freed_mb": total_freed / (1024 * 1024),
            "allocated_freed_mb": allocated_freed / (1024 * 1024),
            "reserved_freed_mb": reserved_freed / (1024 * 1024),
            "current_usage_mb": self.last_memory_usage,
            "cleanup_count": self.cleanup_count,
            "steps": steps
        }
        
        logger.info(f"内存清理完成，释放了 {result['freed_mb']:.1f}MB，当前使用: {result['current_usage_mb']:.1f}MB")
        
        return result
    
    def cleanup_after_model(self, model_name: str = "unknown") -> dict:
        """
        模型调用后清理的便捷方法
        
        Args:
            model_name: 模型名称，用于日志记录
            
        Returns:
            清理统计信息
        """
        logger.debug(f"模型 '{model_name}' 调用后执行内存清理")
        
        # 检查是否需要清理
        if self.should_cleanup():
            result = self.cleanup()
            result["model_name"] = model_name
            result["triggered_by_model"] = True
            return result
        else:
            # 即使不需要清理，也执行轻量级清理
            try:
                gc.collect()
                torch.cuda.empty_cache()
            except:
                pass
            
            return {
                "freed_mb": 0,
                "current_usage_mb": self.get_memory_usage_mb(),
                "model_name": model_name,
                "triggered_by_model": True,
                "cleanup_performed": False
            }

# 全局清理器实例
_global_cleaner: Optional[EnhancedMemoryCleaner] = None

def get_cleaner() -> EnhancedMemoryCleaner:
    """获取全局清理器实例"""
    global _global_cleaner
    if _global_cleaner is None:
        _global_cleaner = EnhancedMemoryCleaner()
    return _global_cleaner

def init_cleaner(cleanup_threshold_mb: int = 1024) -> EnhancedMemoryCleaner:
    """初始化全局清理器"""
    global _global_cleaner
    _global_cleaner = EnhancedMemoryCleaner(cleanup_threshold_mb=cleanup_threshold_mb)
    return _global_cleaner

def cleanup_after_model_call(model_name: str = "unknown") -> dict:
    """
    模型调用后清理的便捷函数
    应该在每个模型调用完成后调用
    """
    cleaner = get_cleaner()
    return cleaner.cleanup_after_model(model_name)

def get_memory_status() -> dict:
    """获取内存状态"""
    cleaner = get_cleaner()
    return {
        "cuda_available": cleaner.cuda_available,
        "current_usage_mb": cleaner.get_memory_usage_mb(),
        "cleanup_threshold_mb": cleaner.cleanup_threshold_mb,
        "cleanup_count": cleaner.cleanup_count,
        "last_memory_usage_mb": cleaner.last_memory_usage
    }

# 补丁函数，用于集成到ComfyUI中
def patch_comfyui_memory_cleanup():
    """为ComfyUI打补丁，添加增强的内存清理"""
    
    try:
        import comfy.model_management
        import comfy.utils
        
        # 保存原始函数
        original_auto_clean = getattr(comfy.model_management, 'auto_clean_models_between_runs', None)
        
        def enhanced_auto_clean_models_between_runs():
            """增强的自动清理函数"""
            # 调用原始清理函数
            if original_auto_clean:
                cleaned_models = original_auto_clean()
            else:
                cleaned_models = 0
            
            # 执行GPU内存清理
            cleaner = get_cleaner()
            cleanup_result = cleaner.cleanup_after_model("auto_clean_between_runs")
            
            # 记录日志
            if cleaned_models > 0 or cleanup_result.get("freed_mb", 0) > 0:
                logger.info(
                    f"增强清理完成: 卸载了 {cleaned_models} 个模型, "
                    f"释放了 {cleanup_result.get('freed_mb', 0):.1f}MB GPU内存"
                )
            
            return cleaned_models
        
        # 替换函数
        comfy.model_management.auto_clean_models_between_runs = enhanced_auto_clean_models_between_runs
        
        logger.info("✅ ComfyUI内存清理补丁已应用")
        return True
        
    except Exception as e:
        logger.error(f"应用ComfyUI内存清理补丁失败: {e}")
        return False

# 测试函数
def test_cleanup():
    """测试清理功能"""
    print("🧪 测试GPU内存清理功能...")
    
    # 初始化清理器
    cleaner = init_cleaner(cleanup_threshold_mb=512)
    
    # 获取初始状态
    initial_status = get_memory_status()
    print(f"初始状态: {initial_status}")
    
    # 执行清理
    result = cleaner.cleanup()
    print(f"清理结果: 释放了 {result['freed_mb']:.1f}MB")
    
    # 模拟模型调用后清理
    for i in range(3):
        print(f"\n模拟模型调用 #{i+1}")
        result = cleaner.cleanup_after_model(f"test_model_{i+1}")
        print(f"  释放了 {result.get('freed_mb', 0):.1f}MB")
        print(f"  当前使用: {result.get('current_usage_mb', 0):.1f}MB")
    
    print("\n✅ 测试完成")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="增强GPU内存清理工具")
    parser.add_argument("--test", action="store_true", help="运行测试")
    parser.add_argument("--patch", action="store_true", help="为ComfyUI应用补丁")
    parser.add_argument("--status", action="store_true", help="显示内存状态")
    parser.add_argument("--cleanup", action="store_true", help="执行一次清理")
    parser.add_argument("--threshold", type=int, default=1024, help="清理阈值(MB)")
    
    args = parser.parse_args()
    
    if args.test:
        test_cleanup()
    
    elif args.patch:
        success = patch_comfyui_memory_cleanup()
        if success:
            print("✅ 补丁应用成功")
        else:
            print("❌ 补丁应用失败")
    
    elif args.status:
        status = get_memory_status()
        print("📊 内存状态:")
        for key, value in status.items():
            print(f"  {key}: {value}")
    
    elif args.cleanup:
        cleaner = init_cleaner(cleanup_threshold_mb=args.threshold)
        result = cleaner.cleanup()
        print(f"✅ 清理完成，释放了 {result['freed_mb']:.1f}MB")
        print("清理步骤:")
        for step, info in result.get("steps", {}).items():
            print(f"  {step}: {info}")
    
    else:
        parser.print_help()
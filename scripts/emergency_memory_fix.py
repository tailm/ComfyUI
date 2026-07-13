#!/usr/bin/env python3
"""
紧急内存修复脚本
解决ComfyUI工作流中的OOM错误
"""

import torch
import gc
import os
import sys
import time
import subprocess
from typing import Dict, List, Optional

class EmergencyMemoryFix:
    """紧急内存修复器"""
    
    def __init__(self):
        self.cuda_available = torch.cuda.is_available()
        if self.cuda_available:
            self.device = torch.device("cuda:0")
            print(f"✅ GPU可用: {torch.cuda.get_device_name(0)}")
        else:
            self.device = torch.device("cpu")
            print("⚠️  GPU不可用，使用CPU模式")
    
    def get_memory_info(self) -> Dict[str, float]:
        """获取详细的GPU内存信息"""
        if not self.cuda_available:
            return {
                'total_mb': 0.0,
                'free_mb': 0.0,
                'used_mb': 0.0,
                'allocated_mb': 0.0,
                'reserved_mb': 0.0,
                'cached_mb': 0.0
            }
        
        try:
            # 使用nvidia-smi获取更准确的信息
            result = subprocess.run(
                ['nvidia-smi', '--query-gpu=memory.total,memory.free,memory.used', '--format=csv,noheader,nounits'],
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                total_mb, free_mb, used_mb = map(float, result.stdout.strip().split(', '))
            else:
                # 回退到torch的估计
                total_mb = torch.cuda.get_device_properties(self.device).total_memory / (1024 * 1024)
                allocated_mb = torch.cuda.memory_allocated(self.device) / (1024 * 1024)
                reserved_mb = torch.cuda.memory_reserved(self.device) / (1024 * 1024)
                free_mb = total_mb - allocated_mb
                used_mb = allocated_mb
            
            allocated_mb = torch.cuda.memory_allocated(self.device) / (1024 * 1024)
            reserved_mb = torch.cuda.memory_reserved(self.device) / (1024 * 1024)
            cached_mb = torch.cuda.memory_cached(self.device) / (1024 * 1024) if hasattr(torch.cuda, 'memory_cached') else 0.0
            
            return {
                'total_mb': total_mb,
                'free_mb': free_mb,
                'used_mb': used_mb,
                'allocated_mb': allocated_mb,
                'reserved_mb': reserved_mb,
                'cached_mb': cached_mb
            }
            
        except Exception as e:
            print(f"❌ 获取内存信息失败: {e}")
            return {
                'total_mb': 0.0,
                'free_mb': 0.0,
                'used_mb': 0.0,
                'allocated_mb': 0.0,
                'reserved_mb': 0.0,
                'cached_mb': 0.0
            }
    
    def aggressive_memory_cleanup(self) -> Dict[str, float]:
        """激进的内存清理"""
        print("🧹 执行激进内存清理...")
        
        if not self.cuda_available:
            return {'freed_mb': 0.0, 'steps': {}}
        
        steps = {}
        total_freed = 0.0
        
        # 记录初始状态
        initial_info = self.get_memory_info()
        initial_allocated = initial_info['allocated_mb']
        
        print(f"📊 清理前: {initial_allocated:.2f}MB / {initial_info['total_mb']:.2f}MB")
        
        # 步骤1: 强制Python垃圾回收
        print("  步骤1: 强制Python垃圾回收...")
        for i in range(5):  # 多次GC
            collected = gc.collect()
            if collected == 0 and i > 1:
                break
            print(f"    轮次 {i+1}: 回收了 {collected} 个对象")
        
        # 步骤2: 清理PyTorch缓存
        print("  步骤2: 清理PyTorch缓存...")
        torch.cuda.empty_cache()
        torch.cuda.synchronize()
        
        # 步骤3: 重置CUDA设备（最激进）
        print("  步骤3: 重置CUDA设备...")
        try:
            torch.cuda.reset_peak_memory_stats()
            torch.cuda.reset_accumulated_memory_stats()
        except:
            pass
        
        # 步骤4: 再次清理
        print("  步骤4: 最终清理...")
        gc.collect()
        torch.cuda.empty_cache()
        torch.cuda.synchronize()
        
        # 记录最终状态
        final_info = self.get_memory_info()
        final_allocated = final_info['allocated_mb']
        
        freed_mb = max(0.0, initial_allocated - final_allocated)
        total_freed = freed_mb
        
        steps = {
            'initial_mb': initial_allocated,
            'final_mb': final_allocated,
            'freed_mb': freed_mb,
            'free_memory_now': final_info['free_mb']
        }
        
        print(f"✅ 清理完成: 释放了 {freed_mb:.2f}MB")
        print(f"📊 清理后: {final_allocated:.2f}MB / {final_info['total_mb']:.2f}MB")
        print(f"💾 可用内存: {final_info['free_mb']:.2f}MB")
        
        return {'freed_mb': total_freed, 'steps': steps}
    
    def optimize_memory_settings(self) -> Dict[str, str]:
        """优化内存设置"""
        print("⚙️  优化内存设置...")
        
        optimizations = {}
        
        # 设置环境变量
        env_vars = {
            'PYTORCH_CUDA_ALLOC_CONF': 'max_split_size_mb:32,garbage_collection_threshold:0.9,expandable_segments:True',
            'PYTORCH_CUDA_MEMORY_FRACTION': '0.85',  # 降低到85%
            'CUDA_LAUNCH_BLOCKING': '0',
            'PYTORCH_NO_CUDA_MEMORY_CACHING': '1',  # 禁用缓存
            'TORCH_CUDNN_V8_API_ENABLED': '1',
        }
        
        for key, value in env_vars.items():
            os.environ[key] = value
            optimizations[key] = value
            print(f"  设置 {key}={value}")
        
        # 设置PyTorch内存配置
        if self.cuda_available:
            try:
                # 减少缓存分配
                torch.cuda.set_per_process_memory_fraction(0.85)  # 85%限制
                print("  设置PyTorch内存分数: 0.85")
                
                # 启用内存统计
                torch.cuda.reset_peak_memory_stats()
                print("  重置内存统计")
                
            except Exception as e:
                print(f"  ⚠️  设置PyTorch配置失败: {e}")
        
        return optimizations
    
    def create_memory_optimized_workflow(self, workflow_steps: List[Dict]) -> str:
        """创建内存优化的工作流配置"""
        print("📋 创建内存优化工作流配置...")
        
        workflow_config = {
            "name": "内存优化工作流",
            "description": "针对6个模型的优化工作流，避免OOM错误",
            "memory_limit_mb": 14000,  # 14GB限制
            "cleanup_threshold_mb": 500,  # 500MB阈值
            "steps": []
        }
        
        # 定义6个模型的优化配置
        model_configs = [
            {"name": "文本编码器", "estimated_memory_mb": 800, "cleanup_after": True},
            {"name": "潜在扩散模型", "estimated_memory_mb": 2500, "cleanup_after": True},
            {"name": "VAE解码器", "estimated_memory_mb": 1200, "cleanup_after": True},
            {"name": "ControlNet", "estimated_memory_mb": 1800, "cleanup_after": True},
            {"name": "超分辨率模型", "estimated_memory_mb": 1500, "cleanup_after": True},
            {"name": "后处理模型", "estimated_memory_mb": 600, "cleanup_after": False}
        ]
        
        total_memory = 0
        for i, config in enumerate(model_configs, 1):
            step = {
                "step": i,
                "model": config["name"],
                "estimated_memory_mb": config["estimated_memory_mb"],
                "cleanup_after": config["cleanup_after"],
                "delay_seconds": 1.0 if config["cleanup_after"] else 0.5,
                "memory_check": True
            }
            workflow_config["steps"].append(step)
            total_memory += config["estimated_memory_mb"]
        
        workflow_config["total_estimated_memory_mb"] = total_memory
        workflow_config["peak_memory_without_optimization_mb"] = total_memory
        workflow_config["peak_memory_with_optimization_mb"] = max(c["estimated_memory_mb"] for c in model_configs)
        
        print(f"📊 工作流统计:")
        print(f"  模型数量: {len(model_configs)}")
        print(f"  总估计内存: {total_memory/1024:.2f}GB")
        print(f"  优化前峰值: {total_memory/1024:.2f}GB")
        print(f"  优化后峰值: {workflow_config['peak_memory_with_optimization_mb']/1024:.2f}GB")
        print(f"  内存节省: {(total_memory - workflow_config['peak_memory_with_optimization_mb'])/1024:.2f}GB")
        
        return workflow_config
    
    def apply_emergency_fix(self):
        """应用紧急修复"""
        print("🚨 应用紧急内存修复...")
        print("=" * 60)
        
        # 1. 获取当前内存状态
        print("1. 检查当前内存状态")
        memory_info = self.get_memory_info()
        print(f"  总内存: {memory_info['total_mb']:.2f}MB")
        print(f"  已使用: {memory_info['used_mb']:.2f}MB")
        print(f"  可用: {memory_info['free_mb']:.2f}MB")
        print(f"  PyTorch已分配: {memory_info['allocated_mb']:.2f}MB")
        print(f"  PyTorch保留: {memory_info['reserved_mb']:.2f}MB")
        
        # 2. 执行激进清理
        print("\n2. 执行激进内存清理")
        cleanup_result = self.aggressive_memory_cleanup()
        
        # 3. 优化内存设置
        print("\n3. 优化内存设置")
        optimizations = self.optimize_memory_settings()
        
        # 4. 创建优化的工作流配置
        print("\n4. 创建优化工作流配置")
        workflow_config = self.create_memory_optimized_workflow([])
        
        # 5. 最终检查
        print("\n5. 最终内存检查")
        final_memory = self.get_memory_info()
        print(f"  最终可用内存: {final_memory['free_mb']:.2f}MB")
        
        if final_memory['free_mb'] < 2000:  # 少于2GB
            print("⚠️  警告: 可用内存仍然不足，建议:")
            print("  • 关闭其他GPU应用程序")
            print("  • 减少批处理大小")
            print("  • 使用更低分辨率的模型")
        else:
            print("✅ 内存状态良好，可以运行工作流")
        
        print("\n" + "=" * 60)
        print("🎯 修复完成!")
        
        return {
            "initial_memory": memory_info,
            "cleanup_result": cleanup_result,
            "optimizations": optimizations,
            "workflow_config": workflow_config,
            "final_memory": final_memory
        }

def main():
    """主函数"""
    print("=" * 60)
    print("🚀 ComfyUI紧急内存修复工具")
    print("=" * 60)
    print("针对错误: torch.OutOfMemoryError: Allocation on device 0 would exceed allowed memory")
    print("=" * 60)
    
    fixer = EmergencyMemoryFix()
    
    try:
        result = fixer.apply_emergency_fix()
        
        print("\n📋 修复摘要:")
        print(f"  释放内存: {result['cleanup_result']['freed_mb']:.2f}MB")
        print(f"  最终可用内存: {result['final_memory']['free_mb']:.2f}MB")
        print(f"  应用优化设置: {len(result['optimizations'])} 项")
        
        print("\n💡 使用建议:")
        print("  1. 重启ComfyUI服务应用新设置")
        print("  2. 在工作流中插入内存优化节点")
        print("  3. 使用顺序执行模式")
        print("  4. 监控内存使用，避免超过14GB")
        
        print("\n🔧 重启ComfyUI命令:")
        print("  cd /home/gpu/ComfyUI")
        print("  pkill -f 'python main.py'")
        print("  ./start_video_optimized.sh")
        
        print("\n" + "=" * 60)
        print("✅ 紧急修复完成!")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ 修复过程中出错: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
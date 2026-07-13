#!/usr/bin/env python3
"""
ComfyUI内存优化启动脚本
自动启用所有内存优化功能并启动ComfyUI
"""

import os
import sys
import argparse
import logging
import subprocess
import time

def setup_logging():
    """设置日志"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler('memory_optimization_startup.log')
        ]
    )
    return logging.getLogger(__name__)

def enable_memory_optimization(config=None):
    """启用内存优化"""
    logger = logging.getLogger(__name__)
    
    try:
        # 添加当前目录到Python路径
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        
        # 导入内存优化模块
        from comfy.memory_management_enhanced import (
            enable_smart_memory,
            enable_memory_pool,
            enable_defragmentation,
            enable_monitoring,
            set_defragmentation_strategy,
            print_memory_status
        )
        
        # 启用智能内存管理
        logger.info("启用智能内存管理...")
        enable_smart_memory(True)
        
        # 启用内存池
        logger.info("启用内存池...")
        enable_memory_pool(True)
        
        # 启用碎片整理
        logger.info("启用内存碎片整理...")
        enable_defragmentation(True)
        
        # 设置碎片整理策略
        strategy = config.get('defragmentation_strategy', 'smart') if config else 'smart'
        logger.info(f"设置碎片整理策略: {strategy}")
        set_defragmentation_strategy(strategy)
        
        # 启用监控
        interval = config.get('monitoring_interval', 5.0) if config else 5.0
        logger.info(f"启用性能监控，间隔: {interval}秒")
        enable_monitoring(True, interval=interval)
        
        # 打印初始状态
        logger.info("内存优化已启用")
        print_memory_status()
        
        return True
        
    except Exception as e:
        logger.error(f"启用内存优化失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def load_config(config_file=None):
    """加载配置文件"""
    if not config_file or not os.path.exists(config_file):
        return None
    
    try:
        import json
        with open(config_file, 'r') as f:
            return json.load(f)
    except Exception as e:
        logging.getLogger(__name__).warning(f"无法加载配置文件 {config_file}: {e}")
        return None

def start_comfyui(args):
    """启动ComfyUI"""
    logger = logging.getLogger(__name__)
    
    # 构建启动命令
    cmd = [sys.executable, "main.py"]
    
    # 添加参数
    if args.port:
        cmd.extend(["--port", str(args.port)])
    if args.listen:
        cmd.extend(["--listen", args.listen])
    if args.force_fp16:
        cmd.append("--force-fp16")
    if args.force_fp32:
        cmd.append("--force-fp32")
    if args.fp16_vae:
        cmd.append("--fp16-vae")
    if args.bf16_vae:
        cmd.append("--bf16-vae")
    if args.cpu:
        cmd.append("--cpu")
    if args.dont_upcast_attention:
        cmd.append("--dont-upcast-attention")
    if args.highvram:
        cmd.append("--highvram")
    if args.normalvram:
        cmd.append("--normalvram")
    if args.lowvram:
        cmd.append("--lowvram")
    if args.novram:
        cmd.append("--novram")
    if args.auto_launch:
        cmd.append("--auto-launch")
    
    logger.info(f"启动ComfyUI: {' '.join(cmd)}")
    
    try:
        # 启动ComfyUI进程
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        
        # 实时输出日志
        logger.info("ComfyUI进程已启动，开始输出日志...")
        print("\n" + "="*80)
        print("ComfyUI输出日志:")
        print("="*80)
        
        for line in process.stdout:
            print(line, end='')
            sys.stdout.flush()
        
        # 等待进程结束
        process.wait()
        return process.returncode
        
    except KeyboardInterrupt:
        logger.info("收到中断信号，停止ComfyUI...")
        if process:
            process.terminate()
            process.wait()
        return 0
    except Exception as e:
        logger.error(f"启动ComfyUI失败: {e}")
        return 1

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='ComfyUI内存优化启动脚本')
    
    # 内存优化参数
    parser.add_argument('--config', type=str, help='配置文件路径')
    parser.add_argument('--strategy', type=str, choices=['conservative', 'moderate', 'aggressive', 'smart'],
                       default='smart', help='碎片整理策略')
    parser.add_argument('--monitoring-interval', type=float, default=5.0,
                       help='监控间隔（秒）')
    parser.add_argument('--no-optimization', action='store_true',
                       help='禁用内存优化')
    
    # ComfyUI参数
    parser.add_argument('--port', type=int, help='服务器端口')
    parser.add_argument('--listen', type=str, help='监听地址')
    parser.add_argument('--force-fp16', action='store_true', help='强制使用FP16')
    parser.add_argument('--force-fp32', action='store_true', help='强制使用FP32')
    parser.add_argument('--fp16-vae', action='store_true', help='VAE使用FP16')
    parser.add_argument('--bf16-vae', action='store_true', help='VAE使用BF16')
    parser.add_argument('--cpu', action='store_true', help='使用CPU')
    parser.add_argument('--dont-upcast-attention', action='store_true',
                       help='不提升注意力精度')
    parser.add_argument('--highvram', action='store_true', help='高VRAM模式')
    parser.add_argument('--normalvram', action='store_true', help='正常VRAM模式')
    parser.add_argument('--lowvram', action='store_true', help='低VRAM模式')
    parser.add_argument('--novram', action='store_true', help='无VRAM模式')
    parser.add_argument('--auto-launch', action='store_true', help='自动启动浏览器')
    
    args = parser.parse_args()
    
    # 设置日志
    logger = setup_logging()
    
    print("="*80)
    print("ComfyUI内存优化启动器")
    print("="*80)
    
    # 检查ComfyUI主文件
    if not os.path.exists("main.py"):
        logger.error("未找到main.py文件，请确保在ComfyUI目录中运行此脚本")
        return 1
    
    # 加载配置
    config = None
    if args.config:
        config = load_config(args.config)
        if config:
            logger.info(f"已加载配置文件: {args.config}")
    
    # 启用内存优化
    if not args.no_optimization:
        logger.info("启用内存优化功能...")
        
        # 构建配置
        optimization_config = {
            'defragmentation_strategy': args.strategy,
            'monitoring_interval': args.monitoring_interval
        }
        
        if config:
            optimization_config.update(config)
        
        # 启用优化
        if not enable_memory_optimization(optimization_config):
            logger.warning("内存优化启用失败，继续启动ComfyUI...")
        else:
            logger.info("内存优化已成功启用")
    else:
        logger.info("跳过内存优化（用户选择禁用）")
    
    # 启动ComfyUI
    logger.info("启动ComfyUI...")
    return start_comfyui(args)

def quick_start():
    """快速启动函数（无参数）"""
    print("快速启动ComfyUI并启用内存优化...")
    
    # 启用内存优化
    try:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from comfy.memory_management_enhanced import (
            enable_smart_memory,
            enable_memory_pool,
            enable_defragmentation,
            enable_monitoring,
            set_defragmentation_strategy
        )
        
        enable_smart_memory(True)
        enable_memory_pool(True)
        enable_defragmentation(True)
        set_defragmentation_strategy('smart')
        enable_monitoring(True, interval=5.0)
        
        print("✅ 内存优化已启用")
        
    except Exception as e:
        print(f"⚠️  内存优化启用失败: {e}")
    
    # 启动ComfyUI
    try:
        import subprocess
        cmd = [sys.executable, "main.py", "--listen", "0.0.0.0", "--port", "8188"]
        print(f"启动ComfyUI: {' '.join(cmd)}")
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\nComfyUI已停止")
    except Exception as e:
        print(f"启动ComfyUI失败: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    # 如果没有参数，使用快速启动
    if len(sys.argv) == 1:
        sys.exit(quick_start())
    else:
        sys.exit(main())
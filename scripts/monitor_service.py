#!/usr/bin/env python3
"""
监控ComfyUI服务状态
"""
import subprocess
import time
import sys
import os
import signal
import psutil
from datetime import datetime

def start_comfyui():
    """启动ComfyUI服务"""
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 启动ComfyUI服务...")
    
    cmd = [
        'python', 'main.py',
        '--enable-assets',
        '--listen', '0.0.0.0',
        '--port', '8188'
    ]
    
    # 启动进程
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        universal_newlines=True
    )
    
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 进程PID: {proc.pid}")
    return proc

def monitor_process(proc, duration_seconds=300):
    """监控进程状态"""
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 开始监控，持续时间: {duration_seconds}秒")
    
    start_time = time.time()
    last_output_time = time.time()
    output_lines = []
    
    try:
        # 监控进程输出
        while time.time() - start_time < duration_seconds:
            # 检查进程状态
            if proc.poll() is not None:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] 进程已退出，返回码: {proc.returncode}")
                # 读取剩余输出
                remaining = proc.stdout.read()
                if remaining:
                    output_lines.append(f"[退出时输出] {remaining}")
                break
            
            # 读取输出
            line = proc.stdout.readline()
            if line:
                line = line.rstrip()
                output_lines.append(f"[{datetime.now().strftime('%H:%M:%S')}] {line}")
                last_output_time = time.time()
                
                # 每10行输出一次
                if len(output_lines) % 10 == 0:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] 已收集{len(output_lines)}行输出")
            
            # 检查资源使用
            if time.time() - last_output_time > 30:  # 30秒无输出
                try:
                    p = psutil.Process(proc.pid)
                    mem_info = p.memory_info()
                    cpu_percent = p.cpu_percent(interval=1)
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] 资源使用 - CPU: {cpu_percent:.1f}%, 内存: {mem_info.rss/1024/1024:.1f}MB")
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            time.sleep(0.1)
        
        # 检查是否超时
        if proc.poll() is None:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] 监控时间结束，进程仍在运行")
            return True, output_lines
        else:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] 进程在监控期间退出")
            return False, output_lines
            
    except KeyboardInterrupt:
        print(f"\n[{datetime.now().strftime('%H:%M:%S')}] 监控被中断")
        return None, output_lines

def save_logs(output_lines, filename="comfyui_monitor.log"):
    """保存日志到文件"""
    with open(filename, 'w', encoding='utf-8') as f:
        f.write("\n".join(output_lines))
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 日志已保存到: {filename}")

def main():
    """主函数"""
    print("=" * 60)
    print("ComfyUI服务监控脚本")
    print("=" * 60)
    
    # 切换到ComfyUI目录
    os.chdir('/home/gpu/ComfyUI')
    
    # 启动服务
    proc = start_comfyui()
    
    # 监控5分钟（300秒）
    success, logs = monitor_process(proc, duration_seconds=300)
    
    # 保存日志
    if logs:
        save_logs(logs)
    
    # 清理进程
    if proc.poll() is None:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] 停止进程...")
        proc.terminate()
        try:
            proc.wait(timeout=10)
            print(f"[{datetime.now().strftime('%H:%M:%S')}] 进程已停止")
        except subprocess.TimeoutExpired:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] 进程未响应，强制终止...")
            proc.kill()
            proc.wait()
    
    # 输出结果
    print("\n" + "=" * 60)
    if success is True:
        print("✅ 监控完成：服务在5分钟内保持运行")
    elif success is False:
        print("❌ 监控完成：服务在5分钟内崩溃")
    else:
        print("⚠️  监控被中断")
    print(f"日志行数: {len(logs)}")
    print("=" * 60)

if __name__ == "__main__":
    main()
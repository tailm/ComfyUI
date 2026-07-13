#!/usr/bin/env python3
"""
ComfyUI启动和测试脚本
"""

import subprocess
import time
import sys
import os
import signal
import urllib.request
import urllib.error

def start_comfyui():
    """启动ComfyUI服务"""
    print("🚀 启动ComfyUI服务...")
    
    # 停止现有服务
    print("停止现有服务...")
    subprocess.run(["pkill", "-f", "python main.py"], 
                   stdout=subprocess.DEVNULL, 
                   stderr=subprocess.DEVNULL)
    time.sleep(2)
    
    # 清理缓存
    print("清理缓存...")
    subprocess.run(["find", ".", "-type", "d", "-name", "__pycache__", "-exec", "rm", "-rf", "{}", "+"], 
                   stdout=subprocess.DEVNULL, 
                   stderr=subprocess.DEVNULL)
    subprocess.run(["find", ".", "-type", "f", "-name", "*.pyc", "-delete"], 
                   stdout=subprocess.DEVNULL, 
                   stderr=subprocess.DEVNULL)
    
    # 启动服务
    print("启动服务进程...")
    cmd = ["python", "main.py", "--listen", "0.0.0.0", "--port", "8188"]
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        universal_newlines=True
    )
    
    print(f"服务PID: {process.pid}")
    return process

def check_service(process, max_wait=120):
    """检查服务状态"""
    print(f"\n⏳ 等待服务启动 (最多{max_wait}秒)...")
    
    start_time = time.time()
    server_started = False
    output_lines = []
    
    # 读取输出并检查状态
    while time.time() - start_time < max_wait:
        if process.poll() is not None:
            # 进程已退出
            output = process.communicate()[0]
            print("❌ 服务进程已退出")
            print("最后输出:")
            for line in output.split('\n')[-20:]:
                print(f"  {line}")
            return False
        
        # 尝试读取输出
        try:
            line = process.stdout.readline()
            if line:
                output_lines.append(line.strip())
                print(f"  {line.strip()}")
                
                # 检查服务启动成功的标志
                if "To see the GUI go to:" in line or "Server started" in line or "Running on" in line:
                    server_started = True
                    print("✅ 服务启动成功！")
                    break
        except:
            pass
        
        # 尝试访问服务
        if time.time() - start_time > 10:  # 等待10秒后开始检查
            try:
                response = urllib.request.urlopen('http://localhost:8188', timeout=2)
                if response.getcode() in [200, 302, 301]:
                    print("✅ 服务可访问 (HTTP 200)")
                    server_started = True
                    break
            except:
                pass
        
        time.sleep(1)
    
    if server_started:
        print("\n🎉 ComfyUI服务启动成功！")
        print("访问地址: http://localhost:8188")
        print("网络地址: http://192.168.50.228:8188")
        print(f"进程PID: {process.pid}")
        return True
    else:
        print("\n❌ 服务启动失败")
        print("最后输出:")
        for line in output_lines[-20:]:
            print(f"  {line}")
        return False

def test_user_icon():
    """测试用户图标功能"""
    print("\n🔍 测试用户图标功能...")
    
    try:
        # 检查扩展文件
        print("检查用户图标扩展...")
        req = urllib.request.Request('http://localhost:8188/extensions/user_quick_access/user_quick_access.js')
        response = urllib.request.urlopen(req, timeout=5)
        if response.getcode() == 200:
            print("✅ 用户图标扩展文件可访问")
        else:
            print(f"⚠️  扩展文件状态码: {response.getcode()}")
    except urllib.error.HTTPError as e:
        print(f"⚠️  扩展文件HTTP错误: {e.code}")
    except Exception as e:
        print(f"⚠️  扩展文件检查失败: {e}")
    
    print("\n📋 手动测试步骤:")
    print("1. 打开浏览器访问: http://localhost:8188")
    print("2. 按 Ctrl+Shift+R 强制刷新缓存")
    print("3. 在左侧菜单栏查找用户图标 👤")
    print("4. 测试功能:")
    print("   - 鼠标悬停: 显示浮标")
    print("   - 单击图标: 显示/隐藏菜单")
    print("   - 菜单选项: 个人资料、设置、退出登录")
    print("   - 点击外部: 关闭菜单")

def main():
    """主函数"""
    print("=" * 50)
    print("ComfyUI 启动和测试脚本")
    print("=" * 50)
    
    # 切换到ComfyUI目录
    os.chdir("/home/gpu/ComfyUI")
    
    # 启动服务
    process = start_comfyui()
    
    # 检查服务状态
    if check_service(process):
        # 测试用户图标功能
        test_user_icon()
        
        print("\n" + "=" * 50)
        print("✅ 启动完成！")
        print("=" * 50)
        print("\n服务正在运行，按 Ctrl+C 停止服务")
        
        # 保持进程运行
        try:
            process.wait()
        except KeyboardInterrupt:
            print("\n\n🛑 停止服务...")
            process.terminate()
            process.wait()
            print("服务已停止")
    else:
        print("\n" + "=" * 50)
        print("❌ 启动失败")
        print("=" * 50)
        sys.exit(1)

if __name__ == "__main__":
    main()
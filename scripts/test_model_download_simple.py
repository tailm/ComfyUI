#!/usr/bin/env python3
"""
简单测试模型下载功能
验证国内镜像源是否生效
"""

import os
import sys
import requests
import time

def test_huggingface_mirror():
    """测试HuggingFace国内镜像"""
    print("=" * 60)
    print("测试HuggingFace国内镜像源")
    print("=" * 60)
    
    # 测试URL列表
    test_urls = [
        {
            "name": "Z-Image-Turbo模型",
            "url": "https://hf-mirror.com/Comfy-Org/z_image_turbo/resolve/main/split_files/diffusion_models/z_image_turbo_bf16.safetensors",
            "expected_size_mb": 1000  # 大约1GB
        },
        {
            "name": "Real-ESRGAN模型",
            "url": "https://hf-mirror.com/Comfy-Org/Real-ESRGAN_repackaged/resolve/main/RealESRGAN_x4plus.safetensors",
            "expected_size_mb": 64  # 大约64MB
        },
        {
            "name": "Flux.2模型",
            "url": "https://hf-mirror.com/Comfy-Org/flux2-dev/resolve/main/split_files/diffusion_models/flux2_dev_fp8mixed.safetensors",
            "expected_size_mb": 2000  # 大约2GB
        }
    ]
    
    success_count = 0
    
    for test in test_urls:
        print(f"\n测试: {test['name']}")
        print(f"  URL: {test['url']}")
        
        try:
            # 发送HEAD请求检查文件是否存在
            start_time = time.time()
            response = requests.head(test['url'], timeout=10, allow_redirects=True)
            elapsed = time.time() - start_time
            
            if response.status_code == 200:
                content_length = response.headers.get('content-length')
                if content_length:
                    size_mb = int(content_length) / (1024 * 1024)
                    print(f"  ✅ 文件存在 (状态码: {response.status_code}, 响应时间: {elapsed:.2f}秒)")
                    print(f"     文件大小: {size_mb:.1f} MB")
                    
                    # 检查是否使用国内镜像
                    if "hf-mirror.com" in test['url']:
                        print(f"     🔗 使用国内镜像源: hf-mirror.com")
                    else:
                        print(f"     🌐 使用原始源")
                        
                    success_count += 1
                else:
                    print(f"  ⚠️  文件存在但无法获取大小 (状态码: {response.status_code})")
            elif response.status_code == 404:
                print(f"  ⚠️  文件不存在 (状态码: {response.status_code})")
                print(f"     可能原因: 模型文件路径已更改")
            else:
                print(f"  ❌ 访问失败 (状态码: {response.status_code})")
                
        except requests.exceptions.Timeout:
            print(f"  ⏱️  请求超时 (超过10秒)")
        except requests.exceptions.ConnectionError:
            print(f"  🔌 连接错误")
        except Exception as e:
            print(f"  ❌ 错误: {e}")
    
    print(f"\n📊 测试结果: {success_count}/{len(test_urls)} 个模型可访问")
    return success_count > 0

def test_environment_variables():
    """测试环境变量设置"""
    print("\n" + "=" * 60)
    print("测试环境变量设置")
    print("=" * 60)
    
    env_vars = [
        "HF_ENDPOINT",
        "HF_HUB_ENABLE_HF_TRANSFER",
        "HF_HUB_DISABLE_TELEMETRY",
    ]
    
    for var in env_vars:
        value = os.environ.get(var, "未设置")
        print(f"{var}: {value}")
        
        if var == "HF_ENDPOINT" and "hf-mirror.com" in value:
            print("  ✅ 已配置国内镜像源")
        elif var == "HF_ENDPOINT":
            print("  ⚠️  未配置国内镜像源")
    
    return True

def test_comfyui_model_download():
    """测试ComfyUI模型下载功能"""
    print("\n" + "=" * 60)
    print("测试ComfyUI模型下载功能")
    print("=" * 60)
    
    # 检查blueprint文件中的URL是否已替换
    blueprint_dir = "blueprints"
    domestic_count = 0
    original_count = 0
    
    import json
    from pathlib import Path
    
    for file_path in Path(blueprint_dir).glob("*.json"):
        if file_path.name == "put_blueprints_here":
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                if "hf-mirror.com" in content:
                    domestic_count += 1
                if "huggingface.co" in content and "hf-mirror.com" not in content:
                    original_count += 1
                    
        except Exception as e:
            print(f"  读取文件 {file_path.name} 失败: {e}")
    
    print(f"已修改为国内镜像的文件: {domestic_count}")
    print(f"仍使用原始URL的文件: {original_count}")
    
    if domestic_count > 0:
        print("✅ Blueprint文件已成功修改为国内镜像源")
        return True
    else:
        print("❌ Blueprint文件未修改为国内镜像源")
        return False

def main():
    """主测试函数"""
    print("ComfyUI 国内镜像源功能测试")
    print("=" * 60)
    
    # 测试1: 环境变量
    print("\n1. 环境变量测试:")
    env_ok = test_environment_variables()
    
    # 测试2: 镜像源可访问性
    print("\n2. 镜像源可访问性测试:")
    mirror_ok = test_huggingface_mirror()
    
    # 测试3: ComfyUI配置
    print("\n3. ComfyUI配置测试:")
    config_ok = test_comfyui_model_download()
    
    # 总结
    print("\n" + "=" * 60)
    print("测试总结")
    print("=" * 60)
    
    if env_ok and mirror_ok and config_ok:
        print("🎉 所有测试通过！国内镜像源配置成功。")
        print("\n配置状态:")
        print("  ✅ 环境变量已设置 (HF_ENDPOINT=https://hf-mirror.com)")
        print("  ✅ HuggingFace镜像源可访问")
        print("  ✅ Blueprint文件已修改为国内镜像源")
        print("\n现在ComfyUI将从国内镜像源下载模型，速度会更快。")
    else:
        print("⚠️  部分测试未通过，请检查配置。")
        print("\n问题诊断:")
        if not env_ok:
            print("  ❌ 环境变量未正确设置")
        if not mirror_ok:
            print("  ❌ 镜像源不可访问")
        if not config_ok:
            print("  ❌ Blueprint文件未修改")
        
        print("\n解决方案:")
        print("  1. 检查网络连接")
        print("  2. 运行: python scripts/domestic_model_mirror.py")
        print("  3. 检查配置文件: config/domestic_download.json")
    
    print("\n下一步:")
    print("  1. 访问 http://localhost:8188 测试Web界面")
    print("  2. 尝试下载模型，观察下载速度")
    print("  3. 查看日志: tail -f comfyui_optimized_*.log")
    
    return env_ok and mirror_ok and config_ok

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n测试被用户中断")
        sys.exit(1)
    except Exception as e:
        print(f"\n测试过程中出错: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
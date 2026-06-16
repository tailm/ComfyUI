#!/usr/bin/env python3
"""
测试国内镜像源可用性
"""

import requests
import time
import json
from pathlib import Path

def test_mirror_url(url, timeout=10):
    """测试镜像URL是否可用"""
    try:
        print(f"测试URL: {url}")
        start_time = time.time()
        
        # 发送HEAD请求检查可用性
        response = requests.head(url, timeout=timeout, allow_redirects=True)
        
        elapsed_time = time.time() - start_time
        
        if response.status_code == 200:
            print(f"  ✅ 可用 (状态码: {response.status_code}, 响应时间: {elapsed_time:.2f}秒)")
            return True
        elif response.status_code == 404:
            print(f"  ⚠️  文件不存在 (状态码: {response.status_code})")
            return False
        else:
            print(f"  ❌ 不可用 (状态码: {response.status_code})")
            return False
            
    except requests.exceptions.Timeout:
        print(f"  ⏱️  请求超时 (超过{timeout}秒)")
        return False
    except requests.exceptions.ConnectionError:
        print(f"  🔌 连接错误")
        return False
    except Exception as e:
        print(f"  ❌ 错误: {e}")
        return False

def test_hf_mirror():
    """测试HuggingFace镜像"""
    print("=" * 60)
    print("测试HuggingFace国内镜像 (hf-mirror.com)")
    print("=" * 60)
    
    # 测试几个常见的模型文件
    test_urls = [
        # Comfy-Org 组织的模型
        "https://hf-mirror.com/Comfy-Org/z_image_turbo/resolve/main/split_files/diffusion_models/z_image_turbo_bf16.safetensors",
        "https://hf-mirror.com/Comfy-Org/Real-ESRGAN_repackaged/resolve/main/RealESRGAN_x4plus.safetensors",
        
        # 其他常用模型
        "https://hf-mirror.com/stabilityai/stable-diffusion-2-1/resolve/main/v2-1_768-ema-pruned.safetensors",
        "https://hf-mirror.com/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned.safetensors",
        
        # 测试小文件
        "https://hf-mirror.com/Comfy-Org/z_image_turbo/raw/main/README.md",
    ]
    
    success_count = 0
    for url in test_urls:
        if test_mirror_url(url):
            success_count += 1
        print()
    
    print(f"测试完成: {success_count}/{len(test_urls)} 个URL可用")
    return success_count > 0

def test_github_mirror():
    """测试GitHub镜像"""
    print("\n" + "=" * 60)
    print("测试GitHub国内镜像")
    print("=" * 60)
    
    test_urls = [
        "https://raw.nuaa.cf/comfyanonymous/ComfyUI/master/README.md",
        "https://hub.nuaa.cf/comfyanonymous/ComfyUI",
    ]
    
    success_count = 0
    for url in test_urls:
        if test_mirror_url(url):
            success_count += 1
        print()
    
    print(f"测试完成: {success_count}/{len(test_urls)} 个URL可用")
    return success_count > 0

def test_original_vs_mirror():
    """测试原始URL和镜像URL的对比"""
    print("\n" + "=" * 60)
    print("测试原始URL vs 镜像URL响应时间")
    print("=" * 60)
    
    test_pairs = [
        {
            "original": "https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/diffusion_models/z_image_turbo_bf16.safetensors",
            "mirror": "https://hf-mirror.com/Comfy-Org/z_image_turbo/resolve/main/split_files/diffusion_models/z_image_turbo_bf16.safetensors"
        },
        {
            "original": "https://huggingface.co/stabilityai/stable-diffusion-2-1/resolve/main/v2-1_768-ema-pruned.safetensors",
            "mirror": "https://hf-mirror.com/stabilityai/stable-diffusion-2-1/resolve/main/v2-1_768-ema-pruned.safetensors"
        }
    ]
    
    for pair in test_pairs:
        print(f"\n测试: {pair['original'].split('/')[3]}")
        print("-" * 40)
        
        # 测试原始URL
        print("原始URL:")
        original_ok = test_mirror_url(pair['original'])
        
        # 测试镜像URL
        print("镜像URL:")
        mirror_ok = test_mirror_url(pair['mirror'])
        
        if original_ok and mirror_ok:
            print("✅ 两者都可用")
        elif mirror_ok and not original_ok:
            print("✅ 镜像可用，原始不可用")
        elif original_ok and not mirror_ok:
            print("⚠️  原始可用，镜像不可用")
        else:
            print("❌ 两者都不可用")

def check_blueprint_modifications():
    """检查blueprint文件的修改情况"""
    print("\n" + "=" * 60)
    print("检查blueprint文件修改情况")
    print("=" * 60)
    
    blueprints_dir = Path("blueprints")
    modified_files = []
    total_files = 0
    
    for file_path in blueprints_dir.glob("*.json"):
        if file_path.name == "put_blueprints_here":
            continue
            
        total_files += 1
        backup_path = file_path.with_suffix(file_path.suffix + ".backup")
        
        if backup_path.exists():
            modified_files.append(file_path.name)
    
    print(f"总blueprint文件数: {total_files}")
    print(f"已修改的文件数: {len(modified_files)}")
    
    if modified_files:
        print("\n已修改的文件:")
        for i, filename in enumerate(modified_files[:10], 1):  # 只显示前10个
            print(f"  {i}. {filename}")
        
        if len(modified_files) > 10:
            print(f"  ... 还有 {len(modified_files) - 10} 个文件")
    
    return len(modified_files)

def create_mirror_status_report():
    """创建镜像状态报告"""
    print("\n" + "=" * 60)
    print("国内镜像源状态报告")
    print("=" * 60)
    
    # 加载配置
    config_path = Path("config") / "domestic_download.json"
    if config_path.exists():
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        print("\n配置的镜像源:")
        for original, mirror in config["mirrors"].items():
            print(f"  {original} -> {mirror}")
        
        print("\n配置的模型镜像:")
        for original, mirror in config["model_mirrors"].items():
            print(f"  {original[:50]}... -> {mirror[:50]}...")
    
    # 检查修改的文件
    modified_count = check_blueprint_modifications()
    
    # 测试镜像可用性
    hf_ok = test_hf_mirror()
    github_ok = test_github_mirror()
    
    print("\n" + "=" * 60)
    print("总结")
    print("=" * 60)
    
    print(f"✅ Blueprint文件修改: {modified_count} 个文件已更新")
    print(f"✅ HuggingFace镜像: {'可用' if hf_ok else '不可用'}")
    print(f"✅ GitHub镜像: {'可用' if github_ok else '不可用'}")
    
    if hf_ok and modified_count > 0:
        print("\n🎉 国内镜像源配置成功！")
        print("现在ComfyUI将从国内镜像源下载模型，速度会更快。")
    else:
        print("\n⚠️  部分配置可能有问题，请检查网络连接。")
    
    print("\n下一步:")
    print("1. 启动ComfyUI服务测试模型下载")
    print("2. 如果下载失败，可以修改配置文件回退到原始URL")
    print("3. 使用下载助手脚本手动下载模型: python scripts/domestic_download_helper.py <URL> <保存路径>")

def main():
    """主函数"""
    try:
        create_mirror_status_report()
    except Exception as e:
        print(f"测试过程中出错: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
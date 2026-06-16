#!/usr/bin/env python3
"""
国内模型镜像源配置
将HuggingFace等国外模型源替换为国内镜像源
"""

import json
import os
import re
from pathlib import Path

# 国内镜像源映射
DOMESTIC_MIRRORS = {
    # HuggingFace 镜像
    "huggingface.co": "hf-mirror.com",  # 国内HuggingFace镜像
    "huggingface.co/": "hf-mirror.com/",  # 另一种格式
    
    # GitHub 镜像
    "github.com": "hub.nuaa.cf",  # GitHub镜像
    "raw.githubusercontent.com": "raw.nuaa.cf",  # GitHub Raw镜像
    
    # Google Drive 镜像
    "drive.google.com": "gd.mirror.com",  # Google Drive镜像
    
    # CivitAI 镜像（如果需要）
    "civitai.com": "civitai.cn",  # CivitAI国内镜像
}

# 特定模型的国内镜像URL
MODEL_MIRROR_URLS = {
    # Comfy-Org 组织的模型
    "https://huggingface.co/Comfy-Org/": "https://hf-mirror.com/Comfy-Org/",
    "https://huggingface.co/black-forest-labs/": "https://hf-mirror.com/black-forest-labs/",
    "https://huggingface.co/ByteZSzn/": "https://hf-mirror.com/ByteZSzn/",
    "https://huggingface.co/FireRedTeam/": "https://hf-mirror.com/FireRedTeam/",
    "https://huggingface.co/tencent/": "https://hf-mirror.com/tencent/",
    "https://huggingface.co/xinsir/": "https://hf-mirror.com/xinsir/",
    
    # 其他常用模型
    "https://huggingface.co/stabilityai/": "https://hf-mirror.com/stabilityai/",
    "https://huggingface.co/runwayml/": "https://hf-mirror.com/runwayml/",
    "https://huggingface.co/lllyasviel/": "https://hf-mirror.com/lllyasviel/",
    "https://huggingface.co/latent-consistency/": "https://hf-mirror.com/latent-consistency/",
}

def replace_url_with_mirror(url):
    """
    将URL替换为国内镜像源
    """
    if not url or not isinstance(url, str):
        return url
    
    # 首先检查特定模型映射
    for original, mirror in MODEL_MIRROR_URLS.items():
        if url.startswith(original):
            return url.replace(original, mirror)
    
    # 通用域名替换
    for original_domain, mirror_domain in DOMESTIC_MIRRORS.items():
        if original_domain in url:
            return url.replace(original_domain, mirror_domain)
    
    return url

def process_blueprint_file(file_path):
    """
    处理单个blueprint文件，替换模型下载URL
    """
    print(f"处理文件: {file_path}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        modified = False
        
        # 递归遍历JSON数据，查找并替换URL
        def traverse_and_replace(obj):
            nonlocal modified
            if isinstance(obj, dict):
                for key, value in obj.items():
                    if key == "url" and isinstance(value, str):
                        new_url = replace_url_with_mirror(value)
                        if new_url != value:
                            obj[key] = new_url
                            modified = True
                            print(f"  替换URL: {value[:80]}... -> {new_url[:80]}...")
                    elif key == "models" and isinstance(value, list):
                        # 处理models数组
                        for model in value:
                            if isinstance(model, dict) and "url" in model:
                                old_url = model["url"]
                                new_url = replace_url_with_mirror(old_url)
                                if new_url != old_url:
                                    model["url"] = new_url
                                    modified = True
                                    print(f"  替换模型URL: {old_url[:80]}... -> {new_url[:80]}...")
                    else:
                        traverse_and_replace(value)
            elif isinstance(obj, list):
                for item in obj:
                    traverse_and_replace(item)
        
        traverse_and_replace(data)
        
        if modified:
            # 备份原文件
            backup_path = str(file_path) + ".backup"
            if not os.path.exists(backup_path):
                os.rename(str(file_path), backup_path)
                print(f"  已备份原文件到: {backup_path}")
            
            # 保存修改后的文件
            with open(str(file_path), 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"  ✅ 文件已更新")
            return True
        else:
            print(f"  ⏭️  无需修改")
            return False
            
    except Exception as e:
        print(f"  ❌ 处理文件时出错: {e}")
        return False

def process_all_blueprints(blueprints_dir="blueprints"):
    """
    处理所有blueprint文件
    """
    blueprints_dir = Path(blueprints_dir)
    if not blueprints_dir.exists():
        print(f"目录不存在: {blueprints_dir}")
        return
    
    blueprint_files = list(blueprints_dir.glob("*.json"))
    print(f"找到 {len(blueprint_files)} 个blueprint文件")
    
    modified_count = 0
    for file_path in blueprint_files:
        if file_path.name == "put_blueprints_here":
            continue
        
        if process_blueprint_file(file_path):
            modified_count += 1
    
    print(f"\n处理完成: 修改了 {modified_count}/{len(blueprint_files)} 个文件")

def create_domestic_download_config():
    """
    创建国内下载配置文件
    """
    config = {
        "name": "ComfyUI 国内模型下载配置",
        "version": "1.0.0",
        "description": "将HuggingFace等国外模型源替换为国内镜像源，加速模型下载",
        "mirrors": DOMESTIC_MIRRORS,
        "model_mirrors": MODEL_MIRROR_URLS,
        "settings": {
            "enable_domestic_mirror": True,
            "fallback_to_original": True,  # 如果镜像失败，回退到原始URL
            "timeout": 30,  # 下载超时时间（秒）
            "retry_count": 3,  # 重试次数
        },
        "custom_mirrors": {
            # 可以在这里添加自定义镜像
        }
    }
    
    config_path = Path("config") / "domestic_download.json"
    config_path.parent.mkdir(exist_ok=True)
    
    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    
    print(f"配置文件已创建: {config_path}")
    return config_path

def create_model_download_helper():
    """
    创建模型下载助手脚本
    """
    helper_content = '''#!/usr/bin/env python3
"""
ComfyUI 国内模型下载助手
使用国内镜像源加速模型下载
"""

import os
import sys
import json
import requests
import hashlib
from pathlib import Path
from urllib.parse import urlparse

# 添加ComfyUI路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class DomesticModelDownloader:
    def __init__(self, config_path=None):
        self.config = self.load_config(config_path)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def load_config(self, config_path):
        """加载配置"""
        default_config = {
            "mirrors": {
                "huggingface.co": "hf-mirror.com",
                "github.com": "hub.nuaa.cf",
            },
            "model_mirrors": {
                "https://huggingface.co/Comfy-Org/": "https://hf-mirror.com/Comfy-Org/",
                "https://huggingface.co/black-forest-labs/": "https://hf-mirror.com/black-forest-labs/",
            },
            "settings": {
                "enable_domestic_mirror": True,
                "fallback_to_original": True,
                "timeout": 30,
                "retry_count": 3,
            }
        }
        
        if config_path and os.path.exists(config_path):
            try:
                with open(config_path, 'r', encoding='utf-8') as f:
                    user_config = json.load(f)
                # 合并配置
                default_config.update(user_config)
            except Exception as e:
                print(f"加载配置文件失败: {e}")
        
        return default_config
    
    def get_mirror_url(self, original_url):
        """获取镜像URL"""
        if not self.config["settings"]["enable_domestic_mirror"]:
            return original_url
        
        # 检查特定模型映射
        for original, mirror in self.config["model_mirrors"].items():
            if original_url.startswith(original):
                return original_url.replace(original, mirror)
        
        # 通用域名替换
        for original_domain, mirror_domain in self.config["mirrors"].items():
            if original_domain in original_url:
                return original_url.replace(original_domain, mirror_domain)
        
        return original_url
    
    def download_model(self, url, save_path, chunk_size=8192):
        """下载模型文件"""
        mirror_url = self.get_mirror_url(url)
        
        print(f"原始URL: {url}")
        print(f"镜像URL: {mirror_url}")
        
        # 尝试从镜像下载
        if mirror_url != url:
            print(f"尝试从镜像下载...")
            success = self._download_file(mirror_url, save_path, chunk_size)
            if success:
                return True
        
        # 如果镜像失败且启用了回退，尝试原始URL
        if self.config["settings"]["fallback_to_original"] and mirror_url != url:
            print(f"镜像下载失败，尝试原始URL...")
            return self._download_file(url, save_path, chunk_size)
        
        return False
    
    def _download_file(self, url, save_path, chunk_size):
        """下载文件"""
        retry_count = self.config["settings"]["retry_count"]
        timeout = self.config["settings"]["timeout"]
        
        for attempt in range(retry_count):
            try:
                print(f"下载尝试 {attempt + 1}/{retry_count}...")
                
                response = self.session.get(url, stream=True, timeout=timeout)
                response.raise_for_status()
                
                total_size = int(response.headers.get('content-length', 0))
                downloaded = 0
                
                # 确保保存目录存在
                os.makedirs(os.path.dirname(save_path), exist_ok=True)
                
                with open(save_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=chunk_size):
                        if chunk:
                            f.write(chunk)
                            downloaded += len(chunk)
                            
                            # 显示进度
                            if total_size > 0:
                                percent = (downloaded / total_size) * 100
                                print(f"进度: {percent:.1f}% ({downloaded}/{total_size} bytes)", end='\r')
                
                print(f"\n✅ 下载完成: {save_path}")
                
                # 验证文件完整性
                if self._verify_file(save_path, url):
                    return True
                else:
                    print("文件验证失败，重新下载...")
                    os.remove(save_path)
                    
            except Exception as e:
                print(f"下载失败: {e}")
                if os.path.exists(save_path):
                    os.remove(save_path)
        
        return False
    
    def _verify_file(self, file_path, url):
        """验证文件完整性（简单的大小检查）"""
        if not os.path.exists(file_path):
            return False
        
        # 这里可以添加更复杂的验证，如MD5校验
        file_size = os.path.getsize(file_path)
        print(f"文件大小: {file_size} 字节")
        
        # 简单的文件大小检查
        if file_size > 0:
            return True
        
        return False

def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='ComfyUI 国内模型下载助手')
    parser.add_argument('url', help='模型下载URL')
    parser.add_argument('save_path', help='保存路径')
    parser.add_argument('--config', help='配置文件路径', default=None)
    
    args = parser.parse_args()
    
    downloader = DomesticModelDownloader(args.config)
    success = downloader.download_model(args.url, args.save_path)
    
    if success:
        print("✅ 下载成功")
        sys.exit(0)
    else:
        print("❌ 下载失败")
        sys.exit(1)

if __name__ == "__main__":
    main()
'''
    
    helper_path = Path("scripts") / "domestic_download_helper.py"
    with open(helper_path, 'w', encoding='utf-8') as f:
        f.write(helper_content)
    
    # 添加执行权限
    os.chmod(helper_path, 0o755)
    
    print(f"下载助手脚本已创建: {helper_path}")
    return helper_path

def main():
    """主函数"""
    print("=" * 60)
    print("ComfyUI 国内模型镜像源配置工具")
    print("=" * 60)
    
    # 1. 创建配置文件
    print("\n1. 创建配置文件...")
    config_path = create_domestic_download_config()
    
    # 2. 创建下载助手脚本
    print("\n2. 创建下载助手脚本...")
    helper_path = create_model_download_helper()
    
    # 3. 处理blueprint文件
    print("\n3. 处理blueprint文件...")
    process_all_blueprints()
    
    print("\n" + "=" * 60)
    print("配置完成！")
    print("=" * 60)
    print("\n使用方法:")
    print("1. 手动下载模型:")
    print(f"   python {helper_path} <模型URL> <保存路径>")
    print("\n2. 自动替换blueprint中的URL:")
    print("   已自动处理所有blueprint文件")
    print("\n3. 配置文件位置:")
    print(f"   {config_path}")
    print("\n4. 支持的镜像源:")
    for original, mirror in DOMESTIC_MIRRORS.items():
        print(f"   {original} -> {mirror}")
    
    print("\n注意:")
    print("• 国内镜像源可能会有所延迟，建议测试下载速度")
    print("• 如果镜像源不可用，可以修改配置文件回退到原始URL")
    print("• 某些模型可能没有国内镜像，需要手动下载")

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
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

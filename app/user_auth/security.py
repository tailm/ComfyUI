"""
用户认证安全模块
提供速率限制和IP白名单功能
"""

import time
import ipaddress
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict
import threading
import logging


class RateLimiter:
    """速率限制器"""
    
    def __init__(self, max_requests: int = 100, window_seconds: int = 60):
        """
        初始化速率限制器
        
        Args:
            max_requests: 时间窗口内最大请求数
            window_seconds: 时间窗口大小（秒）
        """
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)
        self.lock = threading.RLock()
        self.logger = logging.getLogger(__name__)
    
    def is_allowed(self, key: str) -> Tuple[bool, int, int]:
        """
        检查是否允许请求
        
        Args:
            key: 限制键（如IP地址或用户ID）
            
        Returns:
            Tuple[是否允许, 剩余请求数, 重置时间（秒）]
        """
        current_time = time.time()
        
        with self.lock:
            # 清理过期请求
            self._cleanup_old_requests(key, current_time)
            
            # 获取当前请求列表
            request_times = self.requests[key]
            
            # 检查是否超过限制
            if len(request_times) >= self.max_requests:
                # 计算重置时间
                oldest_request = min(request_times)
                reset_time = int(oldest_request + self.window_seconds - current_time)
                return False, 0, max(0, reset_time)
            
            # 添加当前请求
            request_times.append(current_time)
            
            # 计算剩余请求数
            remaining = self.max_requests - len(request_times)
            
            return True, remaining, 0
    
    def _cleanup_old_requests(self, key: str, current_time: float) -> None:
        """清理过期的请求记录"""
        cutoff_time = current_time - self.window_seconds
        request_times = self.requests[key]
        
        # 移除过期的请求时间
        self.requests[key] = [t for t in request_times if t > cutoff_time]
        
        # 如果列表为空，删除该键
        if not self.requests[key]:
            del self.requests[key]
    
    def get_remaining_requests(self, key: str) -> Tuple[int, int]:
        """
        获取剩余请求数和重置时间
        
        Args:
            key: 限制键
            
        Returns:
            Tuple[剩余请求数, 重置时间（秒）]
        """
        current_time = time.time()
        
        with self.lock:
            # 清理过期请求
            self._cleanup_old_requests(key, current_time)
            
            # 获取当前请求列表
            request_times = self.requests.get(key, [])
            
            # 计算剩余请求数
            remaining = self.max_requests - len(request_times)
            
            # 计算重置时间
            reset_time = 0
            if request_times:
                oldest_request = min(request_times)
                reset_time = int(oldest_request + self.window_seconds - current_time)
                reset_time = max(0, reset_time)
            
            return remaining, reset_time
    
    def clear(self, key: str = None) -> None:
        """
        清除请求记录
        
        Args:
            key: 要清除的键，如果为None则清除所有
        """
        with self.lock:
            if key:
                if key in self.requests:
                    del self.requests[key]
            else:
                self.requests.clear()


class IPWhitelist:
    """IP白名单管理器"""
    
    def __init__(self):
        """初始化IP白名单管理器"""
        self.allowed_ips = set()
        self.allowed_cidrs = set()
        self.lock = threading.RLock()
        self.logger = logging.getLogger(__name__)
    
    def add_ip(self, ip: str) -> bool:
        """
        添加单个IP地址到白名单
        
        Args:
            ip: IP地址（IPv4或IPv6）
            
        Returns:
            bool: 是否成功添加
        """
        try:
            ip_obj = ipaddress.ip_address(ip)
            with self.lock:
                self.allowed_ips.add(str(ip_obj))
            self.logger.info(f"添加IP到白名单: {ip}")
            return True
        except ValueError as e:
            self.logger.error(f"无效的IP地址 {ip}: {e}")
            return False
    
    def add_cidr(self, cidr: str) -> bool:
        """
        添加CIDR范围到白名单
        
        Args:
            cidr: CIDR表示法（如 192.168.1.0/24）
            
        Returns:
            bool: 是否成功添加
        """
        try:
            network = ipaddress.ip_network(cidr, strict=False)
            with self.lock:
                self.allowed_cidrs.add(str(network))
            self.logger.info(f"添加CIDR到白名单: {cidr}")
            return True
        except ValueError as e:
            self.logger.error(f"无效的CIDR {cidr}: {e}")
            return False
    
    def remove_ip(self, ip: str) -> bool:
        """
        从白名单移除IP地址
        
        Args:
            ip: IP地址
            
        Returns:
            bool: 是否成功移除
        """
        with self.lock:
            if ip in self.allowed_ips:
                self.allowed_ips.remove(ip)
                self.logger.info(f"从白名单移除IP: {ip}")
                return True
        return False
    
    def remove_cidr(self, cidr: str) -> bool:
        """
        从白名单移除CIDR范围
        
        Args:
            cidr: CIDR表示法
            
        Returns:
            bool: 是否成功移除
        """
        with self.lock:
            if cidr in self.allowed_cidrs:
                self.allowed_cidrs.remove(cidr)
                self.logger.info(f"从白名单移除CIDR: {cidr}")
                return True
        return False
    
    def is_allowed(self, ip: str) -> bool:
        """
        检查IP地址是否在白名单中
        
        Args:
            ip: 要检查的IP地址
            
        Returns:
            bool: 是否允许访问
        """
        try:
            ip_obj = ipaddress.ip_address(ip)
            
            with self.lock:
                # 检查精确IP匹配
                if str(ip_obj) in self.allowed_ips:
                    return True
                
                # 检查CIDR范围匹配
                for cidr_str in self.allowed_cidrs:
                    network = ipaddress.ip_network(cidr_str)
                    if ip_obj in network:
                        return True
            
            return False
        except ValueError as e:
            self.logger.error(f"无效的IP地址 {ip}: {e}")
            return False
    
    def get_allowed_ips(self) -> List[str]:
        """获取所有允许的IP地址"""
        with self.lock:
            return sorted(list(self.allowed_ips))
    
    def get_allowed_cidrs(self) -> List[str]:
        """获取所有允许的CIDR范围"""
        with self.lock:
            return sorted(list(self.allowed_cidrs))
    
    def clear(self) -> None:
        """清空白名单"""
        with self.lock:
            self.allowed_ips.clear()
            self.allowed_cidrs.clear()
        self.logger.info("已清空白名单")


class SecurityManager:
    """安全管理器"""
    
    def __init__(self):
        """初始化安全管理器"""
        # 登录速率限制：每分钟10次
        self.login_limiter = RateLimiter(max_requests=10, window_seconds=60)
        
        # 注册速率限制：每小时5次
        self.register_limiter = RateLimiter(max_requests=5, window_seconds=3600)
        
        # API速率限制：每分钟100次
        self.api_limiter = RateLimiter(max_requests=100, window_seconds=60)
        
        # IP白名单
        self.ip_whitelist = IPWhitelist()
        
        # 黑名单（暂时禁用）
        self.blacklist = set()
        
        self.logger = logging.getLogger(__name__)
    
    def check_login_rate_limit(self, ip: str) -> Tuple[bool, int, int]:
        """
        检查登录速率限制
        
        Args:
            ip: 客户端IP地址
            
        Returns:
            Tuple[是否允许, 剩余请求数, 重置时间（秒）]
        """
        return self.login_limiter.is_allowed(f"login:{ip}")
    
    def check_register_rate_limit(self, ip: str) -> Tuple[bool, int, int]:
        """
        检查注册速率限制
        
        Args:
            ip: 客户端IP地址
            
        Returns:
            Tuple[是否允许, 剩余请求数, 重置时间（秒）]
        """
        return self.register_limiter.is_allowed(f"register:{ip}")
    
    def check_api_rate_limit(self, user_id: str = None, ip: str = None) -> Tuple[bool, int, int]:
        """
        检查API速率限制
        
        Args:
            user_id: 用户ID（可选）
            ip: 客户端IP地址（可选）
            
        Returns:
            Tuple[是否允许, 剩余请求数, 重置时间（秒）]
        """
        if user_id:
            key = f"api:user:{user_id}"
        elif ip:
            key = f"api:ip:{ip}"
        else:
            # 如果没有提供标识符，使用默认键
            key = "api:anonymous"
        
        return self.api_limiter.is_allowed(key)
    
    def is_ip_allowed(self, ip: str) -> bool:
        """
        检查IP是否在白名单中
        
        Args:
            ip: 客户端IP地址
            
        Returns:
            bool: 是否允许访问
        """
        # 如果白名单为空，允许所有IP
        if not self.ip_whitelist.get_allowed_ips() and not self.ip_whitelist.get_allowed_cidrs():
            return True
        
        return self.ip_whitelist.is_allowed(ip)
    
    def add_to_whitelist(self, ip_or_cidr: str) -> bool:
        """
        添加到白名单
        
        Args:
            ip_or_cidr: IP地址或CIDR范围
            
        Returns:
            bool: 是否成功添加
        """
        # 尝试作为CIDR添加
        if '/' in ip_or_cidr:
            return self.ip_whitelist.add_cidr(ip_or_cidr)
        else:
            return self.ip_whitelist.add_ip(ip_or_cidr)
    
    def remove_from_whitelist(self, ip_or_cidr: str) -> bool:
        """
        从白名单移除
        
        Args:
            ip_or_cidr: IP地址或CIDR范围
            
        Returns:
            bool: 是否成功移除
        """
        # 尝试作为CIDR移除
        if '/' in ip_or_cidr:
            return self.ip_whitelist.remove_cidr(ip_or_cidr)
        else:
            return self.ip_whitelist.remove_ip(ip_or_cidr)
    
    def get_whitelist(self) -> Dict[str, List[str]]:
        """
        获取白名单
        
        Returns:
            Dict: 包含IP列表和CIDR列表的字典
        """
        return {
            "ips": self.ip_whitelist.get_allowed_ips(),
            "cidrs": self.ip_whitelist.get_allowed_cidrs()
        }
    
    def clear_whitelist(self) -> None:
        """清空白名单"""
        self.ip_whitelist.clear()
    
    def add_to_blacklist(self, ip: str) -> None:
        """
        添加到黑名单
        
        Args:
            ip: IP地址
        """
        try:
            ip_obj = ipaddress.ip_address(ip)
            self.blacklist.add(str(ip_obj))
            self.logger.warning(f"添加IP到黑名单: {ip}")
        except ValueError as e:
            self.logger.error(f"无效的IP地址 {ip}: {e}")
    
    def remove_from_blacklist(self, ip: str) -> bool:
        """
        从黑名单移除
        
        Args:
            ip: IP地址
            
        Returns:
            bool: 是否成功移除
        """
        if ip in self.blacklist:
            self.blacklist.remove(ip)
            self.logger.info(f"从黑名单移除IP: {ip}")
            return True
        return False
    
    def is_ip_blocked(self, ip: str) -> bool:
        """
        检查IP是否在黑名单中
        
        Args:
            ip: IP地址
            
        Returns:
            bool: 是否被阻止
        """
        try:
            ip_obj = ipaddress.ip_address(ip)
            return str(ip_obj) in self.blacklist
        except ValueError:
            return False
    
    def get_blacklist(self) -> List[str]:
        """获取黑名单"""
        return sorted(list(self.blacklist))
    
    def clear_blacklist(self) -> None:
        """清空黑名单"""
        self.blacklist.clear()
        self.logger.info("已清空黑名单")
    
    def get_rate_limit_status(self, ip: str, user_id: str = None) -> Dict:
        """
        获取速率限制状态
        
        Args:
            ip: 客户端IP地址
            user_id: 用户ID（可选）
            
        Returns:
            Dict: 速率限制状态
        """
        login_remaining, login_reset = self.login_limiter.get_remaining_requests(f"login:{ip}")
        register_remaining, register_reset = self.register_limiter.get_remaining_requests(f"register:{ip}")
        
        api_key = f"api:user:{user_id}" if user_id else f"api:ip:{ip}"
        api_remaining, api_reset = self.api_limiter.get_remaining_requests(api_key)
        
        return {
            "login": {
                "remaining": login_remaining,
                "reset_in": login_reset,
                "limit": self.login_limiter.max_requests,
                "window": self.login_limiter.window_seconds
            },
            "register": {
                "remaining": register_remaining,
                "reset_in": register_reset,
                "limit": self.register_limiter.max_requests,
                "window": self.register_limiter.window_seconds
            },
            "api": {
                "remaining": api_remaining,
                "reset_in": api_reset,
                "limit": self.api_limiter.max_requests,
                "window": self.api_limiter.window_seconds
            },
            "ip_allowed": self.is_ip_allowed(ip),
            "ip_blocked": self.is_ip_blocked(ip)
        }


# 全局安全管理器实例
security_manager = SecurityManager()
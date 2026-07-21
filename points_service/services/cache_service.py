from decimal import Decimal
from typing import Optional

import redis
from redis import Redis

from config import settings
from utils.logger import logger


class PointsCacheService:
    def __init__(self, redis_client: Redis):
        self.redis = redis_client

    def get_balance_from_cache(self, user_id: str) -> Optional[Decimal]:
        """从缓存获取积分余额"""
        try:
            cache_key = f"points:balance:{user_id}"
            cached_value = self.redis.get(cache_key)
            if cached_value is None:
                return None
            if cached_value == "NULL":
                return Decimal("0.00")
            return Decimal(cached_value)
        except Exception as e:
            logger.error(f"从缓存获取用户{user_id}的积分余额失败：{e}")
            return None

    def set_balance_to_cache(self, user_id: str, balance: Decimal) -> bool:
        """设置积分余额到缓存"""
        try:
            cache_key = f"points:balance:{user_id}"
            self.redis.setex(
                cache_key, settings.cache.balance_ttl, str(balance)
            )
            return True
        except Exception as e:
            logger.error(f"设置用户{user_id}的积分余额到缓存失败：{e}")
            return False

    def invalidate_balance_cache(self, user_id: str) -> bool:
        """使积分余额缓存失效"""
        try:
            cache_key = f"points:balance:{user_id}"
            self.redis.delete(cache_key)
            return True
        except Exception as e:
            logger.error(f"使用户{user_id}的积分余额缓存失效失败：{e}")
            return False

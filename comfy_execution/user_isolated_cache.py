"""
User Isolated Cache

Provides cache isolation for multi-user environments.
Each user's cache is isolated using a user-specific prefix.
"""

import logging
from typing import Any, Optional, List

logger = logging.getLogger(__name__)


class UserIsolatedCache:
    """
    Cache wrapper that provides user-level isolation.
    
    All cache keys are prefixed with the user_id to prevent
    cross-user cache access.
    """
    
    def __init__(
        self,
        base_cache: Any,
        user_id: str,
        user_cache_prefix: str = "user:{user_id}:"
    ):
        """
        Initialize user-isolated cache.
        
        Args:
            base_cache: Base cache instance (must have get/set/delete methods)
            user_id: User ID for isolation
            user_cache_prefix: Prefix template for user cache keys
        """
        self.base_cache = base_cache
        self.user_id = user_id
        self.prefix = user_cache_prefix.format(user_id=user_id)
    
    def _get_user_key(self, key: str) -> str:
        """
        Generate user-specific cache key.
        
        Args:
            key: Original cache key
            
        Returns:
            User-prefixed cache key
        """
        return f"{self.prefix}{key}"
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get a value from the cache.
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None
        """
        user_key = self._get_user_key(key)
        return self.base_cache.get(user_key)
    
    def set(self, key: str, value: Any) -> None:
        """
        Set a value in the cache.
        
        Args:
            key: Cache key
            value: Value to cache
        """
        user_key = self._get_user_key(key)
        self.base_cache.set(user_key, value)
    
    def delete(self, key: str) -> None:
        """
        Delete a value from the cache.
        
        Args:
            key: Cache key
        """
        user_key = self._get_user_key(key)
        self.base_cache.delete(user_key)
    
    def clear_user_cache(self) -> None:
        """
        Clear all cache entries for the current user.
        
        This requires the base cache to support pattern-based deletion.
        """
        # Check if base cache supports delete_pattern
        if hasattr(self.base_cache, 'delete_pattern'):
            pattern = f"{self.prefix}*"
            self.base_cache.delete_pattern(pattern)
            logger.info(f"Cleared cache for user {self.user_id}")
        else:
            logger.warning(
                "Base cache does not support pattern deletion. "
                "Cannot clear user cache."
            )
    
    def has(self, key: str) -> bool:
        """
        Check if a key exists in the cache.
        
        Args:
            key: Cache key
            
        Returns:
            True if key exists
        """
        user_key = self._get_user_key(key)
        if hasattr(self.base_cache, 'has'):
            return self.base_cache.has(user_key)
        else:
            return self.base_cache.get(user_key) is not None
    
    def get_many(self, keys: List[str]) -> dict:
        """
        Get multiple values from the cache.
        
        Args:
            keys: List of cache keys
            
        Returns:
            Dictionary of key-value pairs
        """
        result = {}
        for key in keys:
            value = self.get(key)
            if value is not None:
                result[key] = value
        return result
    
    def set_many(self, items: dict) -> None:
        """
        Set multiple values in the cache.
        
        Args:
            items: Dictionary of key-value pairs
        """
        for key, value in items.items():
            self.set(key, value)
    
    def delete_many(self, keys: List[str]) -> None:
        """
        Delete multiple values from the cache.
        
        Args:
            keys: List of cache keys
        """
        for key in keys:
            self.delete(key)


class UserIsolatedCacheSet:
    """
    Manages a set of user-isolated caches.
    
    Provides a convenient way to create and manage user-specific
    cache instances for different cache types.
    """
    
    def __init__(self, base_caches: dict):
        """
        Initialize cache set.
        
        Args:
            base_caches: Dictionary of base cache instances
                        e.g., {'outputs': BasicCache(), 'models': LRUCache()}
        """
        self.base_caches = base_caches
        self.user_caches = {}
    
    def get_user_cache(
        self,
        user_id: str,
        cache_name: str
    ) -> UserIsolatedCache:
        """
        Get a user-isolated cache instance.
        
        Args:
            user_id: User ID
            cache_name: Name of the base cache
            
        Returns:
            User-isolated cache instance
        """
        cache_key = f"{user_id}:{cache_name}"
        
        if cache_key not in self.user_caches:
            base_cache = self.base_caches.get(cache_name)
            if base_cache is None:
                raise ValueError(f"Unknown cache: {cache_name}")
            
            self.user_caches[cache_key] = UserIsolatedCache(
                base_cache=base_cache,
                user_id=user_id
            )
        
        return self.user_caches[cache_key]
    
    def clear_user_caches(self, user_id: str) -> None:
        """
        Clear all caches for a user.
        
        Args:
            user_id: User ID
        """
        for cache_name in self.base_caches.keys():
            cache_key = f"{user_id}:{cache_name}"
            if cache_key in self.user_caches:
                self.user_caches[cache_key].clear_user_cache()
        
        logger.info(f"Cleared all caches for user {user_id}")
    
    def get_cache_stats(self, user_id: str) -> dict:
        """
        Get cache statistics for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            Dictionary with cache statistics
        """
        stats = {}
        
        for cache_name in self.base_caches.keys():
            cache_key = f"{user_id}:{cache_name}"
            if cache_key in self.user_caches:
                cache = self.user_caches[cache_key]
                
                # Try to get stats from base cache
                if hasattr(cache.base_cache, 'get_stats'):
                    cache_stats = cache.base_cache.get_stats()
                    stats[cache_name] = cache_stats
                else:
                    stats[cache_name] = {'available': True}
        
        return stats


def create_user_isolated_cache(
    base_cache: Any,
    user_id: str
) -> UserIsolatedCache:
    """
    Factory function to create a user-isolated cache.
    
    Args:
        base_cache: Base cache instance
        user_id: User ID
        
    Returns:
        User-isolated cache instance
    """
    return UserIsolatedCache(
        base_cache=base_cache,
        user_id=user_id
    )

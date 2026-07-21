from typing import Generator

import redis
from redis import ConnectionPool

from config import settings

pool = ConnectionPool(
    host=settings.redis.host,
    port=settings.redis.port,
    db=settings.redis.db,
    password=settings.redis.password,
    max_connections=settings.redis.pool_size,
    socket_timeout=settings.redis.socket_timeout,
    socket_connect_timeout=settings.redis.socket_connect_timeout,
    decode_responses=True,
)


def get_redis() -> Generator[redis.Redis, None, None]:
    r = redis.Redis(connection_pool=pool)
    try:
        yield r
    finally:
        r.close()

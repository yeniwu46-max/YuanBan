import time
from functools import lru_cache
from typing import Protocol

import redis

from app.core.config import get_settings


class CacheClient(Protocol):
    def set(self, key: str, value: str, nx: bool = False, ex: int | None = None) -> bool | None: ...


class MemoryCache:
    def __init__(self) -> None:
        self._store: dict[str, tuple[str, float | None]] = {}

    def set(self, key: str, value: str, nx: bool = False, ex: int | None = None) -> bool | None:
        now = time.time()
        if key in self._store:
            _, expires = self._store[key]
            if expires is not None and expires <= now:
                del self._store[key]
            elif nx:
                return None
        expiry = now + ex if ex else None
        self._store[key] = (value, expiry)
        return True


@lru_cache
def get_redis() -> CacheClient:
    settings = get_settings()
    if not settings.redis_enabled:
        return MemoryCache()
    try:
        client = redis.from_url(settings.redis_url, decode_responses=True)
        client.ping()
        return client
    except Exception:
        return MemoryCache()

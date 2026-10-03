import redis
import json
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class RedisService:
    def __init__(self):
        try:
            self.client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
            # Ping to check connection at startup
            self.client.ping()
            self._is_healthy = True
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.client = None
            self._is_healthy = False

    def get(self, key: str):
        if not self._is_healthy or not self.client:
            return None
        try:
            val = self.client.get(key)
            if val:
                try:
                    return json.loads(val)
                except json.JSONDecodeError:
                    return val
            return None
        except Exception as e:
            logger.warning(f"Redis GET failed for {key}: {e}")
            return None

    def set(self, key: str, value: any, ttl_seconds: int = 3600):
        if not self._is_healthy or not self.client:
            return False
        try:
            if isinstance(value, (dict, list)):
                value = json.dumps(value)
            return self.client.set(name=key, value=value, ex=ttl_seconds)
        except Exception as e:
            logger.warning(f"Redis SET failed for {key}: {e}")
            return False

    def delete(self, key: str):
        if not self._is_healthy or not self.client:
            return False
        try:
            return self.client.delete(key) > 0
        except Exception as e:
            logger.warning(f"Redis DELETE failed for {key}: {e}")
            return False

    def exists(self, key: str):
        if not self._is_healthy or not self.client:
            return False
        try:
            return self.client.exists(key) > 0
        except Exception as e:
            logger.warning(f"Redis EXISTS failed for {key}: {e}")
            return False

    def check_health(self):
        if not self.client:
            return False
        try:
            return self.client.ping()
        except Exception:
            return False

# Singleton instance
redis_client = RedisService()

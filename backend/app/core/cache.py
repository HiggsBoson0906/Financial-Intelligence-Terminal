"""
Cache key conventions for Redis.
Redis is used strictly as a cache/temporary-state layer. 
PostgreSQL remains the source of truth.

Example keys:
- market:{symbol} (e.g. market:XOM)
- weather:{location} (e.g. weather:US-NY)
- news:{event_id} (e.g. news:evt_123)
- analysis:{run_id} (e.g. analysis:run_456)
"""

class CacheKeys:
    @staticmethod
    def market_data(symbol: str) -> str:
        return f"market:{symbol.upper()}"

    @staticmethod
    def weather_data(location: str) -> str:
        return f"weather:{location}"

    @staticmethod
    def news(event_id: str) -> str:
        return f"news:{event_id}"

    @staticmethod
    def analysis_run(run_id: str) -> str:
        return f"analysis:{run_id}"

    # Default TTLs (in seconds)
    TTL_MARKET = 300       # 5 mins
    TTL_WEATHER = 3600     # 1 hour
    TTL_NEWS = 86400       # 24 hours
    TTL_ANALYSIS = 7200    # 2 hours

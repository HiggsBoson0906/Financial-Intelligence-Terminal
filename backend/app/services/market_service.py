"""
Market Data Service — Phase 4
=============================
Implements MarketDataProvider using a mock/fallback approach
since live provider credentials (e.g. AlphaVantage) are deferred or unavailable.
"""

from datetime import datetime, timezone
import json
from typing import Dict, Any

from app.services.providers import MarketDataProvider, MarketRecord
from app.services.redis_service import redis_client

# Dummy fallback prices for known assets
FALLBACK_PRICES = {
    "XOM": {"price": 105.50, "change": -1.2, "change_pct": -1.12},
    "CVX": {"price": 150.25, "change": -0.8, "change_pct": -0.53},
    "COP": {"price": 112.40, "change": -2.1, "change_pct": -1.83},
    "OXY": {"price": 58.75, "change": 0.4, "change_pct": 0.69},
    "XLE": {"price": 85.30, "change": -0.9, "change_pct": -1.04},
    "SPY": {"price": 435.10, "change": 2.5, "change_pct": 0.58},
}

class FallbackMarketDataProvider(MarketDataProvider):
    
    def health_check(self) -> bool:
        return True
        
    def get_latest_price(self, symbol: str) -> MarketRecord:
        """
        Returns fallback data for the symbol.
        In a real scenario, this would call an API, caching the result in Redis.
        """
        symbol = symbol.upper()
        cache_key = f"market:price:{symbol}"
        
        # Try Cache
        cached = None
        try:
            cached_data = redis_client.get(cache_key)
            if cached_data:
                cached = json.loads(cached_data)
        except Exception:
            pass
            
        if cached:
            return MarketRecord(
                symbol=symbol,
                price=cached["price"],
                volume=None,
                timestamp=datetime.fromisoformat(cached["timestamp"]),
                source="Redis Cache (Fallback)",
                status="fallback",
                retrieved_at=datetime.fromisoformat(cached["retrieved_at"]),
                raw_data=cached.get("raw_data")
            )
            
        # If not cached, get fallback
        data = FALLBACK_PRICES.get(symbol, {"price": 0.0, "change": 0.0, "change_pct": 0.0})
        status = "fallback" if symbol in FALLBACK_PRICES else "missing"
        
        now = datetime.now(timezone.utc)
        record = MarketRecord(
            symbol=symbol,
            price=data["price"],
            volume=None,
            timestamp=now,
            source="MockFallbackProvider",
            status=status,
            retrieved_at=now,
            raw_data={"change": data["change"], "change_pct": data["change_pct"]}
        )
        
        # Cache it
        try:
            cache_val = {
                "price": record.price,
                "timestamp": record.timestamp.isoformat(),
                "retrieved_at": record.retrieved_at.isoformat(),
                "raw_data": record.raw_data
            }
            redis_client.set(cache_key, json.dumps(cache_val), ttl_seconds=60)
        except Exception:
            pass
            
        return record

market_provider = FallbackMarketDataProvider()

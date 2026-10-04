import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any

import yfinance as yf

from app.services.providers import MarketDataProvider, MarketRecord
from app.services.redis_service import redis_client

logger = logging.getLogger(__name__)

class YFinanceMarketProvider(MarketDataProvider):
    
    def health_check(self) -> bool:
        return True
        
    def get_latest_price(self, symbol: str) -> MarketRecord:
        """
        Returns real data for the symbol using yfinance.
        Caches the result in Redis for 60 seconds.
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
                volume=cached.get("volume"),
                timestamp=datetime.fromisoformat(cached["timestamp"]),
                source="yfinance (cached)",
                status="cached",
                retrieved_at=datetime.fromisoformat(cached["retrieved_at"]),
                raw_data=cached.get("raw_data")
            )
            
        # If not cached, get from yfinance
        now = datetime.now(timezone.utc)
        
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.fast_info
            
            # fast_info gives lastPrice, previousClose, etc.
            price = info.get("lastPrice")
            prev_close = info.get("previousClose")
            
            if price is None:
                # Fallback to history if fast_info fails
                hist = ticker.history(period="1d")
                if hist.empty:
                    raise Exception(f"No price data found for {symbol}")
                price = float(hist["Close"].iloc[-1])
                prev_close = float(ticker.history(period="5d")["Close"].iloc[-2]) if len(ticker.history(period="5d")) > 1 else price
            
            change = price - prev_close if prev_close else 0.0
            change_pct = (change / prev_close * 100) if prev_close else 0.0
            
            record = MarketRecord(
                symbol=symbol,
                price=price,
                volume=info.get("lastVolume"),
                timestamp=now,
                source="yfinance",
                status="live",
                retrieved_at=now,
                raw_data={"change": change, "change_pct": change_pct, "provider_url": f"https://finance.yahoo.com/quote/{symbol}"}
            )
            
            # Cache it
            try:
                cache_val = {
                    "price": record.price,
                    "volume": record.volume,
                    "timestamp": record.timestamp.isoformat(),
                    "retrieved_at": record.retrieved_at.isoformat(),
                    "raw_data": record.raw_data
                }
                redis_client.set(cache_key, json.dumps(cache_val), ttl_seconds=60)
            except Exception:
                pass
                
            return record
            
        except Exception as e:
            logger.warning(f"yfinance failed for {symbol}: {e}")
            
            # Return unavailable
            return MarketRecord(
                symbol=symbol,
                price=0.0,
                volume=None,
                timestamp=now,
                source="yfinance",
                status="unavailable",
                retrieved_at=now,
                raw_data={"error": str(e)}
            )

market_provider = YFinanceMarketProvider()

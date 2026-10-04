import os
import requests
import time
import json
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import redis

from app.core.config import settings

logger = logging.getLogger(__name__)

class FREDService:
    def __init__(self):
        self.api_key = settings.FRED_API_KEY
        self.base_api_url = "https://api.stlouisfed.org/fred/series/observations"
        
        # Redis setup
        self.redis_client = None
        if settings.REDIS_URL:
            try:
                self.redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
                # Test connection
                self.redis_client.ping()
            except Exception as e:
                logger.warning(f"Failed to connect to Redis for FRED caching: {e}")
                self.redis_client = None

    def get_series_latest_structured(self, series_id: str) -> Dict[str, Any]:
        """
        Returns structured FRED data with proper caching and error handling.
        """
        cache_key = f"fred:latest:{series_id}"
        
        # 1. Try Cache
        if self.redis_client:
            try:
                cached = self.redis_client.get(cache_key)
                if cached:
                    data = json.loads(cached)
                    data["status"] = "cached"
                    return data
            except Exception as e:
                logger.warning(f"Redis cache read failed: {e}")

        # 2. Base error response
        error_resp = {
            "series_id": series_id,
            "status": "unavailable",
            "source": "FRED",
            "source_url": f"https://fred.stlouisfed.org/series/{series_id}",
            "retrieved_at": datetime.utcnow().isoformat() + "Z"
        }

        if not self.api_key:
            error_resp["error"] = "FRED API key not configured"
            return error_resp

        # 3. Fetch from API
        end_date = datetime.now()
        start_date = end_date - timedelta(days=400) # Ensure we get at least one observation
        
        try:
            logger.info(f"Fetching live FRED series {series_id} using API...")
            params = {
                "series_id": series_id,
                "api_key": self.api_key,
                "file_type": "json",
                "observation_start": start_date.strftime("%Y-%m-%d"),
                "observation_end": end_date.strftime("%Y-%m-%d"),
                "sort_order": "desc",
                "limit": 1
            }
            
            res = requests.get(self.base_api_url, params=params, timeout=10)
            
            if res.status_code != 200:
                if res.status_code == 400:
                    error_resp["error"] = f"Bad Request (400) - check series_id {series_id}"
                elif res.status_code == 403:
                    error_resp["error"] = "Forbidden (403) - check API key"
                elif res.status_code == 429:
                    error_resp["error"] = "Rate Limit Exceeded (429)"
                else:
                    error_resp["error"] = f"HTTP Error {res.status_code}"
                return error_resp
                
            data = res.json()
            obs = data.get("observations", [])
            
            if not obs:
                error_resp["error"] = "No observations returned in date range"
                return error_resp
                
            latest = obs[0]
            val_str = latest.get("value")
            
            try:
                num_val = float(val_str) if val_str != "." else None
            except ValueError:
                num_val = None
                
            if num_val is None:
                error_resp["error"] = f"Invalid numeric value received: {val_str}"
                return error_resp
                
            success_resp = {
                "series_id": series_id,
                "value": num_val,
                "observation_date": latest.get("date"),
                "status": "live",
                "source": "FRED",
                "source_url": f"https://fred.stlouisfed.org/series/{series_id}",
                "retrieved_at": datetime.utcnow().isoformat() + "Z"
            }
            
            # 4. Save to Cache
            if self.redis_client:
                try:
                    self.redis_client.setex(cache_key, 3600, json.dumps(success_resp))
                except Exception as e:
                    logger.warning(f"Redis cache write failed: {e}")
                    
            return success_resp
            
        except requests.exceptions.Timeout:
            error_resp["error"] = "Connection Timeout"
        except requests.exceptions.ConnectionError:
            error_resp["error"] = "Connection Failure / DNS"
        except Exception as e:
            error_resp["error"] = f"Unexpected Exception: {str(e)}"
            
        return error_resp

    def get_series_latest(self, series_id: str) -> dict:
        result = self.get_series_latest_structured(series_id)
        if result.get("status") in ["live", "cached"]:
            return {"value": result["value"], "status": result["status"]}
        return {"value": None, "status": "unavailable"}

fred_service = FREDService()

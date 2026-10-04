import logging
import requests
import time
import json
from datetime import datetime
from typing import Dict, Any

from app.core.config import settings
import redis

logger = logging.getLogger(__name__)

class WeatherService:
    def __init__(self):
        self.headers = {
            "User-Agent": "Financial-Intelligence-Terminal/1.0 (contact@example.com)",
            "Accept": "application/geo+json"
        }
        
        self.redis_client = None
        if settings.REDIS_URL:
            try:
                self.redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
            except Exception:
                pass

        # Deterministic region to coordinate mapping for major regions
        self.region_mapping = {
            "us gulf coast": {"lat": 29.3013, "lon": -94.7977, "name": "Galveston, TX (Representative for US Gulf Coast)"}, # Galveston TX
            "gulf coast": {"lat": 29.3013, "lon": -94.7977, "name": "Galveston, TX (Representative for US Gulf Coast)"},
            "florida": {"lat": 27.9944, "lon": -82.4452, "name": "Tampa, FL (Representative for Florida)"},
            "texas": {"lat": 29.7604, "lon": -95.3698, "name": "Houston, TX (Representative for Texas)"},
        }

    def get_weather_for_region(self, region: str) -> Dict[str, Any]:
        """
        Fetches live weather data from NWS for a given region.
        """
        if not region:
            return {"status": "unavailable", "error": "No region specified"}
            
        region_lower = region.lower().strip()
        location_info = self.region_mapping.get(region_lower)
        
        if not location_info:
            # Check for partial matches
            for k, v in self.region_mapping.items():
                if region_lower in k:
                    location_info = v
                    break
                    
        if not location_info:
            return {
                "provider": "NWS",
                "status": "unavailable",
                "error": f"Weather location unavailable: No deterministic coordinate mapping for '{region}'",
                "location_type": "REGIONAL WEATHER CONTEXT"
            }
            
        lat, lon = location_info["lat"], location_info["lon"]
        cache_key = f"weather:latest:{lat}:{lon}"
        
        # 1. Try cache
        if self.redis_client:
            try:
                cached = self.redis_client.get(cache_key)
                if cached:
                    data = json.loads(cached)
                    data["status"] = "cached"
                    return data
            except Exception:
                pass

        # Base error response
        error_resp = {
            "provider": "NWS",
            "status": "unavailable",
            "location_type": "REGIONAL WEATHER CONTEXT",
            "location_name": location_info["name"]
        }

        try:
            logger.info(f"Fetching live NWS weather for {lat},{lon}...")
            # Step 1: Get point metadata
            points_url = f"https://api.weather.gov/points/{lat},{lon}"
            res1 = requests.get(points_url, headers=self.headers, timeout=10)
            
            if res1.status_code != 200:
                error_resp["error"] = f"NWS points API failed: HTTP {res1.status_code}"
                return error_resp
                
            points_data = res1.json()
            props = points_data.get("properties", {})
            forecast_url = props.get("forecast")
            zone_id = props.get("forecastZone", "").split("/")[-1]
            
            if not forecast_url:
                error_resp["error"] = "No forecast URL returned by NWS"
                return error_resp

            # Step 2: Get Forecast
            res2 = requests.get(forecast_url, headers=self.headers, timeout=10)
            if res2.status_code != 200:
                error_resp["error"] = f"NWS forecast API failed: HTTP {res2.status_code}"
                return error_resp
                
            forecast_data = res2.json()
            periods = forecast_data.get("properties", {}).get("periods", [])
            
            # Step 3: Get Alerts (Active)
            alerts_url = f"https://api.weather.gov/alerts/active?zone={zone_id}"
            alerts = []
            if zone_id:
                try:
                    res3 = requests.get(alerts_url, headers=self.headers, timeout=5)
                    if res3.status_code == 200:
                        alerts_features = res3.json().get("features", [])
                        for feature in alerts_features:
                            alerts.append({
                                "event": feature.get("properties", {}).get("event"),
                                "severity": feature.get("properties", {}).get("severity"),
                                "headline": feature.get("properties", {}).get("headline")
                            })
                except Exception as e:
                    logger.warning(f"Failed to fetch alerts: {e}")
            
            if not periods:
                error_resp["error"] = "No forecast periods available"
                return error_resp
                
            current = periods[0]
            
            extracted_forecast = {
                "period": current.get("name", "Current"),
                "temperature": f"{current.get('temperature')} {current.get('temperatureUnit')}",
                "windSpeed": current.get("windSpeed"),
                "windDirection": current.get("windDirection"),
                "shortForecast": current.get("shortForecast"),
                "detailedForecast": current.get("detailedForecast")
            }
            
            success_resp = {
                "provider": "NWS",
                "status": "live",
                "location": {
                    "lat": lat, 
                    "lon": lon, 
                    "name": location_info["name"],
                    "note": "REGIONAL WEATHER CONTEXT: Representative forecast point"
                },
                "forecast": extracted_forecast,
                "alerts": alerts if alerts else [{"event": "No active weather alert"}],
                "source_url": points_url,
                "retrieved_at": datetime.utcnow().isoformat() + "Z"
            }
            
            # Cache for 30 minutes
            if self.redis_client:
                try:
                    self.redis_client.setex(cache_key, 1800, json.dumps(success_resp))
                except Exception:
                    pass
                    
            return success_resp
            
        except requests.exceptions.Timeout:
            error_resp["error"] = "Connection Timeout"
        except requests.exceptions.ConnectionError:
            error_resp["error"] = "Connection Failure / DNS"
        except Exception as e:
            error_resp["error"] = f"Unexpected Exception: {str(e)}"
            
        return error_resp

weather_service = WeatherService()

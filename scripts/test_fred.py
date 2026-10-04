import sys
import os
import json
import time
from datetime import datetime

# Add backend dir to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))

from app.core.config import settings
from app.services.fred_service import fred_service

def run():
    print("FRED API Diagnostic")
    print("=" * 50)
    
    # 1. Check API Key
    has_key = bool(settings.FRED_API_KEY)
    print(f"FRED_API_KEY present: {has_key}")
    if not has_key:
        print("ERROR: FRED_API_KEY is missing from environment.")
    
    # 2. Make Request
    series = "CPIAUCSL"
    print(f"\nRequesting {series}...")
    start_time = time.time()
    
    # Call the new method
    if hasattr(fred_service, "get_series_latest_structured"):
        result = fred_service.get_series_latest_structured(series)
    else:
        print("Waiting for get_series_latest_structured to be implemented...")
        result = fred_service.get_series_latest(series)
        
    latency = time.time() - start_time
    print(f"Latency: {latency:.2f} seconds")
    
    print("\nResult:")
    print(json.dumps(result, indent=2))
    print("=" * 50)

if __name__ == "__main__":
    run()

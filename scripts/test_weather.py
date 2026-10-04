import sys
import os
import json
import time

# Add backend dir to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))

from app.services.weather_service import weather_service

def run():
    print("NWS Weather API Diagnostic")
    print("=" * 50)
    
    region = "US Gulf Coast"
    print(f"\nRequesting weather for region: {region}...")
    start_time = time.time()
    
    result = weather_service.get_weather_for_region(region)
        
    latency = time.time() - start_time
    print(f"Latency: {latency:.2f} seconds")
    
    print("\nResult:")
    print(json.dumps(result, indent=2))
    print("=" * 50)

if __name__ == "__main__":
    run()

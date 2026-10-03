"""
Demo Script for Phase 4 Multi-Agent Engine
"""

import sys
import os
import json
from datetime import datetime

# Adjust Python path to load backend app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.agents.orchestrator import run_analysis

def run_demo():
    query = "How could a Gulf Coast hurricane affect my energy portfolio?"
    print("-" * 50)
    print("FINANCIAL INTELLIGENCE TERMINAL")
    print("-" * 50)
    print(f"\nQUERY: {query}\n")
    
    print("Executing Analysis...\n")
    result = run_analysis(query)
    
    print("MARKET CONTEXT")
    for sym, data in result.get("market_context", {}).items():
        print(f"  {sym}: ${data.get('price')} (Status: {data.get('status')})")
        
    print("\nWEATHER / MACRO")
    weather = result.get("macro_weather", {}).get("weather", {})
    macro = result.get("macro_weather", {}).get("macro", {})
    print(f"  Weather: {weather.get('severity')} @ {weather.get('region')} ({weather.get('status')})")
    print(f"  Macro: CPI={macro.get('CPI', {}).get('value')} ({macro.get('status')})")
    
    print("\nNEWS SENTIMENT")
    sent = result.get("sentiment", {})
    print(f"  Overall: {sent.get('overall_sentiment')} (Articles: {sent.get('article_count')})")
    
    print("\nHISTORICAL ANALOGUES")
    matches = result.get("historical_matches", {}).get("matches", [])
    if matches:
        for m in matches[:2]:
            print(f"  - {m.get('event_name')} ({m.get('event_year')}) | Sim: {m.get('similarity')}")
    else:
        print("  None")
        
    print("\nRISK ASSESSMENT")
    risk = result.get("risk", {})
    print(f"  Volatility: {risk.get('volatility')}")
    print(f"  VaR 95%: {risk.get('var_95')}")
    print(f"  Stress Impact: {risk.get('stress_impact')}")
    
    print("\nSCENARIO")
    scen = result.get("scenario", {})
    print(f"  Name: {scen.get('scenario_name')}")
    print(f"  Desc: {scen.get('shock_description')}")
    print(f"  Impacts: {scen.get('estimated_impacts')}")
    
    print("\nSIMULATED HEDGE RECOMMENDATIONS")
    for r in result.get("recommendations", []):
        print(f"  [SIMULATION] {r['action'].upper()} {r['asset']}: {r['reason']}")
        
    print("\nAGENT EXECUTION TRACE")
    for t in result.get("agent_trace", []):
        print(f"  {t['node']} ({t['status']}) - {t['latency_ms']}ms")
        
    print("\nEVIDENCE / SOURCES")
    for e in result.get("evidence", [])[:5]: # Show first 5
        print(f"  - {e['type']}: {e['source']} ({e['description']})")
    if len(result.get("evidence", [])) > 5:
        print(f"  ... and {len(result.get('evidence', [])) - 5} more evidence items.")
        
    print("\nDATA QUALITY")
    for k, v in result.get("data_quality", {}).items():
        print(f"  {k}: {v}")
        
    print("\nLATENCY")
    for k, v in result.get("latency", {}).items():
        print(f"  {k}: {v}ms")
        
    print("-" * 50)

if __name__ == "__main__":
    run_demo()

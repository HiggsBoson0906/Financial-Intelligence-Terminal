"""
Weather + Macro Agent — Phase 4
===============================
Retrieves live/fallback macro data (using existing fred_service)
and weather data. Integrates them into the orchestrator state.
"""

import time
from datetime import datetime, timezone
import json

from app.schemas.orchestration import AnalysisState, AgentTrace, EvidenceItem
from app.services.fred_service import fred_service
from app.services.weather_service import weather_service
from app.services.redis_service import redis_client


def node_weather_macro_agent(state: AnalysisState) -> AnalysisState:
    if state.status == "error":
        return state
        
    start_time = time.time()
    
    macro_data = {}
    weather_data = {}
    
    # 1. Macro
    try:
        # Use existing FRED service for CPI, FedFunds, WTI (which defaults to fallback)
        cpi = fred_service.get_series_latest("CPIAUCSL")
        fedfunds = fred_service.get_series_latest("DFF")
        wti = fred_service.get_series_latest("DCOILWTICO")
        
        macro_data = {
            "CPI": cpi,
            "FedFunds": fedfunds,
            "WTI": wti,
            "status": cpi.get("status", "fallback")
        }
    except Exception as e:
        state.warnings.append(f"Macro fetch failed: {e}")
        macro_data = {"status": "unavailable"}

    # 2. Weather
    try:
        weather_data = weather_service.get_weather_for_region(
            state.user_intent.get("region")
        )
    except Exception as e:
        state.warnings.append(f"Weather fetch failed: {e}")
        weather_data = {"status": "unavailable"}
        
    state.macro_weather = {
        "macro": macro_data,
        "weather": weather_data,
        "status": "completed" if macro_data.get("status") != "unavailable" else "partial"
    }
    
    # Generate Evidence
    if weather_data.get("status") not in ("missing", "unavailable"):
        state.evidence.append(
            EvidenceItem(
                id=f"weather_{int(time.time())}",
                type="weather",
                data_status=weather_data.get("status", "fallback"),
                source="NWS",
                timestamp=datetime.now(timezone.utc),
                description=f"Current weather condition for {weather_data.get('location', {}).get('name', 'Region')}",
                data_reference=weather_data,
                status=weather_data.get("status")
            )
        )
        
    if macro_data.get("status") not in ("missing", "unavailable"):
        state.evidence.append(
            EvidenceItem(
                id=f"macro_{int(time.time())}",
                type="macro",
                data_status=macro_data.get("status", "fallback"),
                source="FRED",
                timestamp=datetime.now(timezone.utc),
                description="Current macroeconomic conditions",
                data_reference=macro_data,
                status=macro_data.get("status")
            )
        )
        
    state.agent_trace.append(
        AgentTrace(
            node="weather_macro_agent",
            agent="weather_macro",
            status="completed",
            started_at=datetime.fromtimestamp(start_time, tz=timezone.utc),
            completed_at=datetime.now(timezone.utc),
            latency_ms=round((time.time() - start_time) * 1000, 2),
            inputs_used=["region", "event_type"],
            outputs_generated=["weather", "macro"],
            sources=["FRED", "NWS"]
        )
    )
    
    return state

import pytest
from app.schemas.orchestration import AnalysisState
from app.agents.weather_macro_agent import node_weather_macro_agent

def test_weather_macro_agent_valid():
    state = AnalysisState(query="", user_intent={"region": "gulf coast", "event_type": "hurricane"})
    result = node_weather_macro_agent(state)
    
    assert "macro" in result.macro_weather
    assert "weather" in result.macro_weather
    
    # Mock data is fallback
    assert result.macro_weather["weather"]["status"] == "fallback"
    assert result.macro_weather["weather"]["max_wind_kt"] == 110.0
    
    assert any(e.type == "weather" for e in result.evidence)
    assert any(e.type == "macro" for e in result.evidence)

def test_weather_macro_agent_missing():
    state = AnalysisState(query="", user_intent={})
    result = node_weather_macro_agent(state)
    
    assert result.macro_weather["weather"]["status"] == "missing"

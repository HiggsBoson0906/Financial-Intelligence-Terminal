import pytest
from app.agents.orchestrator import run_analysis

def test_full_orchestration_golden_scenario():
    query = "Hurricane approaching the Gulf Coast. Analyze the impact on my energy holdings and propose simulated hedges."
    result = run_analysis(query)
    
    # 1. State / Status
    assert result["status"] in ("completed", "completed_with_warnings")
    assert result["run_id"].startswith("run_")
    
    # 2. Query Parsing
    assert "hurricane" in result["user_intent"]["event_type"]
    assert "gulf" in result["user_intent"]["region"]
    
    # 3. Market Context
    assert "market_context" in result
    
    # 4. Sentiment
    assert "overall_sentiment" in result["sentiment"]
    assert result["sentiment"]["article_count"] >= 0
    
    # 5. Weather/Macro
    assert "weather" in result["macro_weather"]
    assert "macro" in result["macro_weather"]
    
    # 6. Historical RAG
    assert "matches" in result["historical_matches"]
    
    # 7. Risk
    assert "volatility" in result["risk"]
    assert "var_95" in result["risk"]
    
    # 8. Scenario
    assert "scenario_name" in result["scenario"]
    
    # 9. Hedging Recommendations
    assert isinstance(result["recommendations"], list)
    for rec in result["recommendations"]:
        assert rec["simulation"] is True
        
    # 10. Evidence & Trace
    assert len(result["evidence"]) > 0
    assert len(result["agent_trace"]) > 0
    
    # 11. Data Quality
    assert "data_quality" in result
    assert "market" in result["data_quality"]

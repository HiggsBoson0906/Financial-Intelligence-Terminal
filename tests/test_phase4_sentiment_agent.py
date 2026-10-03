import pytest
from app.schemas.orchestration import AnalysisState
from app.agents.sentiment_agent import node_sentiment_agent

def test_sentiment_agent_valid_query():
    state = AnalysisState(query="hurricane hitting oil refineries", user_intent={"event_type": "hurricane"})
    result = node_sentiment_agent(state)
    
    assert result.status != "error"
    assert result.sentiment["status"] in ("fallback", "missing")
    if result.sentiment["status"] == "fallback":
        assert "overall_sentiment" in result.sentiment
        assert result.sentiment["article_count"] > 0
        assert any(e.type == "sentiment" for e in result.evidence)

def test_sentiment_agent_empty_query():
    state = AnalysisState(query="")
    result = node_sentiment_agent(state)
    
    assert result.sentiment["status"] == "missing"
    assert result.sentiment["overall_sentiment"] == "neutral"

import pytest
from app.schemas.orchestration import AnalysisState
from app.agents.risk_agent import node_risk_agent

def test_risk_agent():
    state = AnalysisState(query="", portfolio_context={})
    result = node_risk_agent(state)
    
    assert result.risk["status"] == "calculated", result.warnings
    assert "volatility" in result.risk
    assert "var_95" in result.risk
    assert "stress_impact" in result.risk
    
    assert result.portfolio_context["status"] == "demo"
    assert any(e.type == "risk_calculation" for e in result.evidence)

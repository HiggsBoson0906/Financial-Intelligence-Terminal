import pytest
from app.schemas.orchestration import AnalysisState
from app.agents.hedging_agent import node_hedging_agent

def test_hedging_agent():
    state = AnalysisState(
        query="",
        scenario={"estimated_impacts": {"XOM": -0.05, "CVX": 0.02}},
        portfolio_context={"weights": {"XOM": 0.5, "CVX": 0.5}}
    )
    result = node_hedging_agent(state)
    
    assert len(result.recommendations) == 2
    
    xom_rec = next(r for r in result.recommendations if r["asset"] == "XOM")
    assert xom_rec["action"] == "reduce_exposure"
    assert xom_rec["simulation"] is True
    
    cvx_rec = next(r for r in result.recommendations if r["asset"] == "CVX")
    assert cvx_rec["action"] == "hold"
    
    assert any(e.type == "recommendation" for e in result.evidence)

import pytest
from app.agents.orchestrator import run_analysis
from app.schemas.orchestration import AnalysisState

def test_orchestrator_empty_query():
    state = run_analysis("   ")
    assert state["status"] == "error"
    assert len(state["errors"]) > 0
    assert "Empty query" in state["errors"][0]


def test_orchestrator_valid_query():
    state = run_analysis("Hurricane hitting oil refineries")
    assert state["query"] == "Hurricane hitting oil refineries"
    assert state["status"] in ("completed", "completed_with_warnings")
    
    # Check trace
    nodes_executed = [t["node"] for t in state["agent_trace"]]
    assert "validate_input" in nodes_executed
    assert "historical_rag" in nodes_executed
    
    # Check evidence
    assert len(state["evidence"]) > 0
    assert state["evidence"][0]["type"] in ("sentiment", "weather", "historical_event")
    
    # Check RAG match state
    assert "matches" in state["historical_matches"]
    assert len(state["historical_matches"]["matches"]) > 0

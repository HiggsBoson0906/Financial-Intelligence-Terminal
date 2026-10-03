import pytest
from unittest.mock import patch, MagicMock
from app.api.query import submit_query
from app.schemas.query import QueryRequest
from app.services.gemini_service import GeminiService
from app.agents.orchestrator import run_analysis
from app.services.confidence_service import confidence_service

def test_deterministic_values_preserved():
    # 1. Run raw orchestration once to get a baseline
    query = "What is the impact of a Category 4 hurricane in the Gulf Coast on my energy portfolio?"
    state_dict = run_analysis(query)
    
    from app.schemas.orchestration import AnalysisState
    state = AnalysisState.model_validate(state_dict)
    confidence_service.link_evidence(state)
    
    # Capture deterministic values from the baseline state
    orig_risk = state.risk
    orig_scenario = state.scenario
    orig_recs = [r.model_dump() for r in state.recommendations]
    orig_evidence = [e.model_dump() for e in state.evidence]
    orig_cross_asset = state.cross_asset_context

    # 2. Mock orchestrate to return the exact same baseline state dict, and Mock Gemini
    with patch("app.api.query.orchestrate") as mock_orchestrate, \
         patch("app.services.gemini_service.gemini_service.synthesize_analysis") as mock_gemini:
        
        mock_orchestrate.return_value = state_dict
        
        from app.schemas.gemini import GeminiSynthesis
        fake_synthesis = GeminiSynthesis(
            summary="Gemini test summary.",
            details=["detail"],
            key_insights=["insight"]
        )
        mock_gemini.return_value = (fake_synthesis, 100.0, "success", {"model_used": "gemini-3.1-flash-lite", "attempts": 1, "fallback_used": False})
        
        req = QueryRequest(query=query)
        response = submit_query(req)
        
        # 3. Assert equality
        assert response.risk.get("metrics") == orig_risk.get("metrics"), "Risk metrics mutated"
        assert response.scenario.get("estimated_impacts") == orig_scenario.get("estimated_impacts"), "Scenario impact mutated"
        assert response.scenario.get("asset_impacts") == orig_scenario.get("asset_impacts"), "Asset impact mutated"
        assert response.cross_asset_context == ([orig_cross_asset] if orig_cross_asset else []), "Cross asset mutated"
        
        for orig_rec, resp_rec in zip(orig_recs, response.recommendations):
            assert orig_rec["confidence"] == resp_rec.confidence, "Recommendation confidence mutated"
            assert orig_rec["allocation_change"] == resp_rec.allocation_change, "Allocation mutated"
            assert orig_rec["portfolio_action"]["mode"] == resp_rec.portfolio_action.mode
            assert orig_rec["portfolio_action"]["execution_enabled"] == resp_rec.portfolio_action.execution_enabled
            assert orig_rec["execution"]["mode"] == resp_rec.execution.mode
            assert orig_rec["execution"]["executed"] == resp_rec.execution.executed
            
        assert len(orig_evidence) == len(response.evidence), "Evidence count mutated"

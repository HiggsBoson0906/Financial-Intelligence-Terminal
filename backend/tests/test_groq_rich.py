import pytest
from unittest.mock import patch, MagicMock
from app.api.query import submit_query
from app.schemas.query import QueryRequest
from app.schemas.llm import IntelligenceSynthesis, RecommendationExplanation

def test_query_groq_rich_validation():
    # 1. Run raw orchestration to get a baseline
    from app.agents.orchestrator import run_analysis
    query = "What is the impact of a Category 4 hurricane in the Gulf Coast on my energy portfolio?"
    state_dict = run_analysis(query)
    
    # Manually ensure some valid IDs exist
    if not state_dict["recommendations"]:
        state_dict["recommendations"] = [{"id": "rec_1", "action": "buy", "asset": "XOM", "confidence": 0.8, "reason": "Test"}]
    if not state_dict["evidence"]:
        state_dict["evidence"] = [{"id": "ev_1", "type": "test", "data_status": "fresh"}]
        
    valid_rec_id = state_dict["recommendations"][0]["id"]
    valid_ev_id = state_dict["evidence"][0]["id"]

    # 2. Mock orchestrate to return the exact same baseline state dict, and Mock LLM
    with patch("app.api.query.orchestrate") as mock_orchestrate, \
         patch("app.services.groq_service.groq_service.synthesize_analysis") as mock_llm:
        
        mock_orchestrate.return_value = state_dict
        
        # Inject some invalid IDs to verify they are filtered out
        invalid_rec_id = "rec_invalid_999"
        invalid_ev_id = "ev_invalid_999"
        
        fake_synthesis = IntelligenceSynthesis(
            summary="Groq test summary.",
            executive_assessment="Test assessment.",
            key_findings=["Finding 1"],
            recommendation_explanations=[
                # Valid recommendation with mixed evidence
                RecommendationExplanation(
                    recommendation_id=valid_rec_id,
                    explanation="Valid explanation",
                    why_it_matters="Matters",
                    expected_effect="Effect",
                    confidence_interpretation="Confidence",
                    supporting_evidence=[valid_ev_id, invalid_ev_id]
                ),
                # Invalid recommendation
                RecommendationExplanation(
                    recommendation_id=invalid_rec_id,
                    explanation="Invalid explanation",
                    why_it_matters="Matters",
                    expected_effect="Effect",
                    confidence_interpretation="Confidence",
                    supporting_evidence=[valid_ev_id]
                )
            ]
        )
        mock_llm.return_value = (fake_synthesis, 100.0, "success", {"model_used": "openai/gpt-oss-120b", "attempts": 1, "fallback_used": False, "status": "success", "provider": "groq"})
        
        req = QueryRequest(query=query)
        response = submit_query(req)
        
        # 3. Verify validation
        assert response.answer.summary == "Groq test summary."
        assert response.answer.executive_assessment == "Test assessment."
        
        # Only the valid recommendation explanation should remain
        assert len(response.answer.recommendation_explanations) == 1
        valid_expl = response.answer.recommendation_explanations[0]
        
        assert valid_expl["recommendation_id"] == valid_rec_id
        
        # The invalid evidence ID should be stripped
        assert len(valid_expl["supporting_evidence"]) == 1
        assert valid_expl["supporting_evidence"][0] == valid_ev_id

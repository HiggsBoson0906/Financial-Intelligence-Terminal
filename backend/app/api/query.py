from fastapi import APIRouter, HTTPException
import time
import json
from app.schemas.query import QueryRequest, QueryResponse, AnswerResponse, DataQualityResponse, LatencyResponse
from app.schemas.common import ErrorResponse
from app.agents.orchestrator import run_analysis as orchestrate
from app.services.gemini_service import gemini_service
from app.services.confidence_service import confidence_service
from app.db.session import SessionLocal
from app.models.core import AnalysisRun

router = APIRouter(prefix="/api/v1/query", tags=["Query"])

@router.post("", response_model=QueryResponse, responses={500: {"model": ErrorResponse}}, summary="Natural Language Query")
def submit_query(request: QueryRequest):
    """
    Submit a natural language query for the multi-agent system to answer.
    """
    total_start = time.monotonic()
    
    try:
        parent_state_dict = None
        if request.parent_run_id:
            try:
                with SessionLocal() as db:
                    parent_run = db.query(AnalysisRun).filter(AnalysisRun.run_id == request.parent_run_id).first()
                    if parent_run and parent_run.results:
                        pr = parent_run.results
                        parent_state_dict = {
                            "user_intent": pr.get("user_intent", {}),
                            "portfolio_context": pr.get("portfolio_context", {}),
                            "market_context": pr.get("market_context", {}),
                            "event_context": pr.get("event", {}),
                            "sentiment": pr.get("sentiment", {}),
                            "macro_weather": pr.get("macro_weather", {}),
                            "historical_matches": {"matches": pr.get("historical_matches", [])},
                            "cross_asset_context": pr.get("cross_asset_context", [{}])[0] if pr.get("cross_asset_context") else {},
                            "risk": pr.get("risk", {}),
                            "scenario": pr.get("scenario", {}),
                            "recommendations": pr.get("recommendations", []),
                            "evidence": pr.get("evidence", []),
                            "agent_trace": pr.get("agent_trace", [])
                        }
            except Exception as db_e:
                print(f"Failed to load parent run: {db_e}")
                
        # 1. Run LangGraph Orchestration
        agent_start = time.monotonic()
        state_dict = orchestrate(request.query, parent_state=parent_state_dict)
        agents_ms = (time.monotonic() - agent_start) * 1000
        
        from app.schemas.orchestration import AnalysisState
        state = AnalysisState.model_validate(state_dict)
        
        # 2. Evidence Linkage
        confidence_service.link_evidence(state)
        
        # 3. Confidence Calculation
        conf_result = confidence_service.calculate_system_confidence(state)
        
        # 4. Prepare Gemini Input Payload
        synthesis_input = {
            "market_context": state.market_context,
            "event": state.event_context,
            "sentiment": state.sentiment,
            "macro_weather": state.macro_weather,
            "historical_matches": state.historical_matches.get("matches", []),
            "cross_asset_context": state.cross_asset_context,
            "risk": state.risk,
            "scenario": state.scenario,
            "recommendations": state.recommendations,
            "confidence": conf_result
        }
        
        # 5. Call Gemini Service
        gemini_result, gemini_ms, gemini_status, gemini_meta_dict = gemini_service.synthesize_analysis(
            user_query=request.query,
            analysis_payload=synthesis_input
        )
        
        # 6. Build Answer Response
        if gemini_result:
            # Validate IDs to prevent hallucinations
            valid_rec_ids = {r.get("id") if isinstance(r, dict) else getattr(r, "id", None) for r in state.recommendations}
            valid_evidence_ids = {e.get("id") if isinstance(e, dict) else getattr(e, "id", None) for e in state.evidence}
            
            validated_explanations = []
            for expl in gemini_result.recommendation_explanations:
                if expl.recommendation_id in valid_rec_ids:
                    # Filter evidence to only valid ones
                    valid_ev = [ev_id for ev_id in expl.supporting_evidence if ev_id in valid_evidence_ids]
                    expl.supporting_evidence = valid_ev
                    validated_explanations.append(expl.model_dump())
                    
            answer = AnswerResponse(
                summary=gemini_result.summary,
                executive_assessment=gemini_result.executive_assessment,
                key_findings=gemini_result.key_findings,
                risk_explanation=gemini_result.risk_explanation,
                historical_context=gemini_result.historical_context,
                recommendation_explanations=validated_explanations,
                next_steps=gemini_result.next_steps,
                what_to_watch=gemini_result.what_to_watch,
                limitations=gemini_result.limitations,
                details=gemini_result.details,
                key_insights=gemini_result.key_insights,
                confidence=conf_result["score"]
            )
        else:
            # Fallback behavior
            answer = AnswerResponse(
                summary="Gemini synthesis unavailable; displaying structured agent analysis.",
                details=[gemini_status],
                key_insights=[],
                confidence=conf_result["score"]
            )
            state.warnings.append(gemini_status)
            
        # 7. Construct Final Response
        total_ms = (time.monotonic() - total_start) * 1000
        
        # Extract RAG and Risk ms from agent trace if possible
        rag_ms = sum(t.latency_ms for t in state.agent_trace if t.node == "historical_rag")
        risk_ms = sum(t.latency_ms for t in state.agent_trace if t.node == "risk_agent")
        
        latency = LatencyResponse(
            total_ms=round(total_ms, 2),
            agents_ms=round(agents_ms, 2),
            rag_ms=round(rag_ms, 2),
            risk_ms=round(risk_ms, 2),
            gemini_ms=round(gemini_ms, 2)
        )
        
        data_quality = DataQualityResponse(
            overall_status=conf_result["label"],
            warnings=conf_result["warnings"]
        )
        
        from app.schemas.query import GeminiMetadata
        gemini_metadata = GeminiMetadata(**gemini_meta_dict)
        
        response = QueryResponse(
            run_id=state.run_id,
            status=state.status,
            query=state.query,
            answer=answer,
            market_context=state.market_context,
            event=state.event_context,
            sentiment=state.sentiment,
            macro_weather=state.macro_weather,
            historical_matches=state.historical_matches.get("matches", []),
            cross_asset_context=[state.cross_asset_context] if state.cross_asset_context else [],
            risk=state.risk,
            scenario=state.scenario,
            recommendations=state.recommendations,
            agent_trace=[t.model_dump(mode='python') for t in state.agent_trace],
            evidence=[e.model_dump(mode='python') for e in state.evidence],
            data_quality=data_quality,
            latency=latency,
            gemini=gemini_metadata
        )
        
        # 8. Update DB with Gemini Result (the orchestrator already saved the basic run)
        # We need to update the results JSON
        try:
            with SessionLocal() as db:
                run_record = db.query(AnalysisRun).filter(AnalysisRun.run_id == state.run_id).first()
                if run_record:
                    # Update results with final JSON but keep original AnalysisState fields
                    results_raw = response.model_dump(mode='python')
                    
                    # Safe JSON dump with Numpy conversion
                    class NpEncoder(json.JSONEncoder):
                        def default(self, obj):
                            import numpy as np
                            if isinstance(obj, np.integer):
                                return int(obj)
                            if isinstance(obj, np.floating):
                                return float(obj)
                            if isinstance(obj, np.ndarray):
                                return obj.tolist()
                            from datetime import datetime
                            if isinstance(obj, datetime):
                                return obj.isoformat()
                            return str(obj)
                            
                    results_json_str = json.dumps(results_raw, cls=NpEncoder)
                    results_dict = json.loads(results_json_str)
                    
                    # Keep user_intent and portfolio_context if they exist in the original run
                    original_results = run_record.results or {}
                    if "user_intent" in original_results:
                        results_dict["user_intent"] = original_results["user_intent"]
                    if "portfolio_context" in original_results:
                        results_dict["portfolio_context"] = original_results["portfolio_context"]
                    
                    run_record.results = results_dict
                    db.commit()
        except Exception as db_e:
            print(f"Failed to update AnalysisRun with query response: {db_e}")
            
        return response
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

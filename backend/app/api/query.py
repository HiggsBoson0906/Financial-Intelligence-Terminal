from fastapi import APIRouter, HTTPException
import time
import json
from pydantic import BaseModel
from app.schemas.query import QueryRequest, QueryResponse, AnswerResponse, DataQualityResponse, LatencyResponse
from app.schemas.common import ErrorResponse
from app.agents.orchestrator import run_analysis as orchestrate
from app.services.groq_service import groq_service
from app.services.confidence_service import confidence_service
from app.db.session import SessionLocal
from app.models.core import AnalysisRun

router = APIRouter(prefix="/api/v1/query", tags=["Query"])

class FollowUpRequest(BaseModel):
    query: str
    parent_run_id: str

@router.post("/follow-up")
def submit_followup(request: FollowUpRequest):
    """
    Submit a follow-up question to Groq using the parent run's context.
    """
    try:
        with SessionLocal() as db:
            parent_run = db.query(AnalysisRun).filter(AnalysisRun.run_id == request.parent_run_id).first()
            if not parent_run or not parent_run.results:
                raise HTTPException(status_code=404, detail="Parent run not found or has no results.")
                
            pr = parent_run.results
            context_summary = pr.get("answer", {}).get("summary", "")
            key_findings = pr.get("answer", {}).get("key_findings", [])
            
            parent_analysis_context = {
                "Summary": context_summary,
                "Key Findings": key_findings
            }
            
            answer = groq_service.generate_follow_up(request.query, parent_analysis_context)
            return {"answer": answer}
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

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
        
        # 4. Prepare LLM Input Payload
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
        
        # 5. Call Groq Service
        llm_result, llm_ms, llm_status, llm_meta_dict = groq_service.synthesize_analysis(
            user_query=request.query,
            analysis_payload=synthesis_input
        )
        
        # 6. Build Answer Response
        if llm_result:
            # Validate IDs to prevent hallucinations
            valid_rec_ids = {r.get("id") if isinstance(r, dict) else getattr(r, "id", None) for r in state.recommendations}
            valid_evidence_ids = {e.get("id") if isinstance(e, dict) else getattr(e, "id", None) for e in state.evidence}
            
            validated_explanations = []
            for expl in llm_result.recommendation_explanations:
                if expl.recommendation_id in valid_rec_ids:
                    # Filter evidence to only valid ones
                    valid_ev = [ev_id for ev_id in expl.supporting_evidence if ev_id in valid_evidence_ids]
                    expl.supporting_evidence = valid_ev
                    validated_explanations.append(expl.model_dump())
                    
            answer = AnswerResponse(
                summary=llm_result.summary,
                executive_assessment=llm_result.executive_assessment,
                key_findings=llm_result.key_findings,
                risk_explanation=llm_result.risk_explanation,
                historical_context=llm_result.historical_context,
                recommendation_explanations=validated_explanations,
                next_steps=llm_result.next_steps,
                what_to_watch=llm_result.what_to_watch,
                limitations=llm_result.limitations,
                details=llm_result.details,
                key_insights=llm_result.key_insights,
                confidence=conf_result["score"]
            )
        else:
            # Fallback behavior
            answer = AnswerResponse(
                summary="Groq synthesis unavailable; displaying structured agent analysis.",
                details=[llm_status],
                key_insights=[],
                confidence=conf_result["score"]
            )
            state.warnings.append(llm_status)
            
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
            llm_ms=round(llm_ms, 2)
        )
        
        # Determine actual data quality status (good, degraded, unavailable)
        dq_status = "good"
        if state.warnings or any(s.status in ("fallback", "unavailable") for s in data_sources):
            dq_status = "degraded"
        if not state.market_context or all(v.get("status") == "unavailable" for v in state.market_context.values()):
            dq_status = "unavailable"

        data_quality = DataQualityResponse(
            overall_status=dq_status,
            warnings=conf_result["warnings"]
        )
        
        from app.schemas.query import LLMMetadata, SourceLink
        llm_metadata = LLMMetadata(**llm_meta_dict)
        
        # Build SourceLink array for data_sources
        data_sources = []
        
        # NOAA IBTrACS / HURDAT2
        ibtracs_status = "used"
        if any("Event RAG" in w or "NOAA" in w for w in state.warnings):
            ibtracs_status = "fallback" if "fallback" in " ".join(state.warnings).lower() else "unavailable"
            
        data_sources.append(SourceLink(
            id="ds_noaa",
            name="NOAA IBTrACS",
            category="dataset",
            url="https://www.ncdc.noaa.gov/ibtracs/",
            description="Historical tropical cyclone dataset",
            status=ibtracs_status,
            provider="NOAA"
        ))
        
        # FRED Macro
        fred_status = "used"
        if any("FRED" in w for w in state.warnings):
            fred_status = "fallback" if "fallback" in " ".join(state.warnings).lower() else "unavailable"
            
        data_sources.append(SourceLink(
            id="ds_fred",
            name="FRED",
            category="api",
            url="https://fred.stlouisfed.org/",
            description="Macro-economic indicators",
            status=fred_status,
            provider="Federal Reserve Bank of St. Louis"
        ))
        
        # Market Data
        market_status = "used"
        if not state.market_context or any(v.get("status") != "live" for v in state.market_context.values()):
            market_status = "unavailable"
            
        data_sources.append(SourceLink(
            id="ds_market",
            name="Market Data Provider",
            category="api",
            url="https://finance.yahoo.com",
            description="Financial data and market prices",
            status=market_status,
            provider="yfinance"
        ))

        # GDELT News
        news_status = "used"
        if state.sentiment.get("status") in ["missing", "unavailable"]:
            news_status = "unavailable"
            
        data_sources.append(SourceLink(
            id="ds_gdelt",
            name="GDELT Project",
            category="api",
            url="https://www.gdeltproject.org/",
            description="Global database of events, language, and tone",
            status=news_status,
            provider="GDELT"
        ))

        # FinBERT
        finbert_status = "used"
        if state.sentiment.get("article_count", 0) == 0 or state.sentiment.get("status") in ["missing", "unavailable"]:
            finbert_status = "unavailable"
            
        data_sources.append(SourceLink(
            id="ds_finbert",
            name="FinBERT",
            category="dataset",
            url="https://huggingface.co/ProsusAI/finbert",
            description="Financial sentiment analysis",
            status=finbert_status,
            provider="ProsusAI"
        ))
        
        # NWS Weather
        weather_status = "used"
        if state.macro_weather.get("weather", {}).get("status") in ["missing", "unavailable", "fallback"]:
            weather_status = state.macro_weather.get("weather", {}).get("status")
            if weather_status == "missing":
                weather_status = "unavailable"
                
        data_sources.append(SourceLink(
            id="ds_nws",
            name="National Weather Service",
            category="api",
            url="https://www.weather.gov/",
            description="Live severe weather alerts",
            status=weather_status,
            provider="NWS"
        ))
        
        web_sources_dicts = llm_meta_dict.get("web_sources", [])
        web_sources = [SourceLink(**ws) for ws in web_sources_dicts]
        
        response = QueryResponse(
            run_id=state.run_id,
            status=state.status,
            query=state.query,
            answer=answer,
            portfolio_context=state.portfolio_context,
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
            llm=llm_metadata,
            data_sources=data_sources,
            web_sources=web_sources
        )
        
        # 8. Update DB with LLM Result (the orchestrator already saved the basic run)
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

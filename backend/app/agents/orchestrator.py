"""
LangGraph Orchestrator — Phase 4
================================
Implements the multi-agent orchestration graph:
validate -> parse -> load_context -> [sentiment, weather_macro] -> historical_rag
-> cross_asset -> risk -> scenario -> hedging -> finalize

Persists Analysis Runs and simulated Recommendations.
"""

import time
import uuid
from datetime import datetime, timezone

from langgraph.graph import StateGraph, START, END

from app.schemas.orchestration import AnalysisState, AgentTrace, EvidenceItem
from app.services.historical_rag_service import retrieve_similar_events
from app.services.query_parser import parse_query
from app.services.market_service import market_provider

# Import the specialist agent nodes
from app.agents.sentiment_agent import node_sentiment_agent
from app.agents.weather_macro_agent import node_weather_macro_agent
from app.agents.risk_agent import node_risk_agent
from app.agents.scenario_agent import node_scenario_agent
from app.agents.hedging_agent import node_hedging_agent


def node_validate_input(state: AnalysisState) -> AnalysisState:
    start = time.time()
    
    if not state.run_id:
        state.run_id = f"run_{uuid.uuid4().hex[:8]}"
        
    if not state.query or not state.query.strip():
        state.status = "error"
        state.errors.append("Empty query provided.")
        
    state.agent_trace.append(
        AgentTrace(
            node="validate_input",
            agent="system",
            status="completed" if state.status != "error" else "error",
            started_at=datetime.fromtimestamp(start, tz=timezone.utc),
            completed_at=datetime.now(timezone.utc),
            latency_ms=round((time.time() - start) * 1000, 2),
            inputs_used=["query"],
            outputs_generated=["run_id"]
        )
    )
    return state


def node_parse_query(state: AnalysisState) -> AnalysisState:
    start = time.time()
    
    intent = parse_query(state.query)
    state.user_intent = intent
    state.symbols = intent.get("symbols", [])
    
    state.agent_trace.append(
        AgentTrace(
            node="parse_query",
            agent="system",
            status="completed",
            started_at=datetime.fromtimestamp(start, tz=timezone.utc),
            completed_at=datetime.now(timezone.utc),
            latency_ms=round((time.time() - start) * 1000, 2),
            inputs_used=["query"],
            outputs_generated=["user_intent", "symbols"]
        )
    )
    return state


def node_load_context(state: AnalysisState) -> AnalysisState:
    """Loads portfolio and live market data context"""
    start = time.time()
    
    # Portfolio is mocked in risk agent, but we can set up the struct here
    state.portfolio_context = state.portfolio_context or {}
    
    # Fetch Market Data
    market_data = {}
    for sym in state.symbols:
        try:
            record = market_provider.get_latest_price(sym)
            market_data[sym] = {
                "price": record.price,
                "change": record.raw_data.get("change"),
                "change_pct": record.raw_data.get("change_pct"),
                "status": record.status,
                "source": record.source
            }
            state.evidence.append(
                EvidenceItem(
                    id=f"market_{sym}_{int(time.time())}",
                    type="market",
                    data_status="live",
                    source=record.source,
                    timestamp=datetime.now(timezone.utc),
                    description=f"Market data for {sym}",
                    data_reference=market_data[sym],
                    status=record.status
                )
            )
        except Exception as e:
            state.warnings.append(f"Failed to fetch market data for {sym}: {e}")
            market_data[sym] = {"status": "unavailable"}
            
    state.market_context = market_data
    
    state.agent_trace.append(
        AgentTrace(
            node="load_context",
            agent="system",
            status="completed",
            started_at=datetime.fromtimestamp(start, tz=timezone.utc),
            completed_at=datetime.now(timezone.utc),
            latency_ms=round((time.time() - start) * 1000, 2),
            inputs_used=["symbols"],
            outputs_generated=["market_context"]
        )
    )
    return state


def node_historical_rag(state: AnalysisState) -> AnalysisState:
    start = time.time()
    
    try:
        rag_response = retrieve_similar_events(state.query, top_k=3)
        state.historical_matches = rag_response
        
        # Populate event context for easy access
        if rag_response.get("matches"):
            top_match = rag_response["matches"][0]
            state.event_context = top_match.get("event_context", {})
            
        # Add evidence
        state.evidence.append(
            EvidenceItem(
                id=f"rag_{int(time.time())}",
                type="historical_event",
                data_status="historical",
                source="pgvector",
                timestamp=datetime.now(timezone.utc),
                description=f"Retrieved {len(rag_response.get('matches', []))} historical events.",
                data_reference={"top_k": rag_response.get("retrieval_metadata", {}).get("top_k")}
            )
        )
        status = "completed"
    except Exception as e:
        state.warnings.append(f"RAG failed: {e}")
        state.historical_matches = {"status": "unavailable"}
        status = "error"
        
    state.agent_trace.append(
        AgentTrace(
            node="historical_rag",
            agent="rag",
            status=status,
            started_at=datetime.fromtimestamp(start, tz=timezone.utc),
            completed_at=datetime.now(timezone.utc),
            latency_ms=round((time.time() - start) * 1000, 2),
            inputs_used=["query"],
            outputs_generated=["historical_matches", "event_context"],
            sources=["pgvector"]
        )
    )
    return state


def node_cross_asset_context(state: AnalysisState) -> AnalysisState:
    start = time.time()
    
    # Extract cross-asset from RAG matches
    matches = state.historical_matches.get("matches", [])
    if matches and matches[0].get("cross_asset_relationships"):
        state.cross_asset_context = {
            "relationships": matches[0]["cross_asset_relationships"],
            "status": "available"
        }
        
        state.evidence.append(
            EvidenceItem(
                id=f"corr_{int(time.time())}",
                type="correlation",
                data_status="historical",
                source="Historical DB",
                timestamp=datetime.now(timezone.utc),
                description=f"Cross-asset correlations from {len(matches)} analogues.",
                data_reference={"count": len(state.cross_asset_context["relationships"])}
            )
        )
    else:
        state.cross_asset_context = {"status": "unavailable"}
        
    state.agent_trace.append(
        AgentTrace(
            node="cross_asset_context",
            agent="system",
            status="completed",
            started_at=datetime.fromtimestamp(start, tz=timezone.utc),
            completed_at=datetime.now(timezone.utc),
            latency_ms=round((time.time() - start) * 1000, 2),
            inputs_used=["historical_matches"],
            outputs_generated=["cross_asset_context"]
        )
    )
    return state


def node_evidence_finalize(state: AnalysisState) -> AnalysisState:
    start = time.time()
    
    # Calculate Data Quality Summary
    dq = {}
    if not state.market_context:
        dq["market"] = "missing"
    else:
        dq["market"] = "available"
        
    dq["news"] = state.sentiment.get("status", "missing")
    dq["weather"] = state.macro_weather.get("weather", {}).get("status", "missing")
    dq["macro"] = state.macro_weather.get("macro", {}).get("status", "missing")
    dq["historical"] = "available" if state.historical_matches.get("matches") else "missing"
    dq["risk_inputs"] = state.risk.get("status", "missing")
    
    state.data_quality = dq
    
    state.status = "completed"
    if state.errors:
        state.status = "error"
    elif state.warnings:
        state.status = "completed_with_warnings"
        
    state.completed_at = datetime.now(timezone.utc)
    
    if state.started_at and state.completed_at:
        state.latency["total_ms"] = round((state.completed_at - state.started_at).total_seconds() * 1000, 2)
        
    state.agent_trace.append(
        AgentTrace(
            node="evidence_finalize",
            agent="system",
            status="completed",
            started_at=datetime.fromtimestamp(start, tz=timezone.utc),
            completed_at=datetime.now(timezone.utc),
            latency_ms=round((time.time() - start) * 1000, 2),
            inputs_used=["*"],
            outputs_generated=["data_quality", "latency"]
        )
    )
    
    return state


# Build Graph
builder = StateGraph(AnalysisState)

builder.add_node("validate_input", node_validate_input)
builder.add_node("parse_query", node_parse_query)
builder.add_node("load_context", node_load_context)
builder.add_node("sentiment", node_sentiment_agent)
builder.add_node("weather_macro", node_weather_macro_agent)
builder.add_node("historical_rag", node_historical_rag)
builder.add_node("cross_asset_context", node_cross_asset_context)
builder.add_node("risk", node_risk_agent)
builder.add_node("scenario", node_scenario_agent)
builder.add_node("hedging", node_hedging_agent)
builder.add_node("evidence_finalize", node_evidence_finalize)

builder.add_edge(START, "validate_input")
builder.add_edge("validate_input", "parse_query")
builder.add_edge("parse_query", "load_context")
builder.add_edge("load_context", "sentiment")
builder.add_edge("sentiment", "weather_macro")
builder.add_edge("weather_macro", "historical_rag")
builder.add_edge("historical_rag", "cross_asset_context")
builder.add_edge("cross_asset_context", "risk")
builder.add_edge("risk", "scenario")
builder.add_edge("scenario", "hedging")
builder.add_edge("hedging", "evidence_finalize")
builder.add_edge("evidence_finalize", END)

orchestrator_graph = builder.compile()

def run_analysis(query: str) -> dict:
    """Entry point for the API."""
    initial_state = AnalysisState(query=query)
    final_state = orchestrator_graph.invoke(initial_state)
    # Validate the dictionary returned by LangGraph back into our Pydantic model
    final_state_obj = AnalysisState.model_validate(final_state)
    
    # Analysis Persistence
    from app.db.session import SessionLocal
    from app.models.core import AnalysisRun, Recommendation as DBRecommendation
    import json
    
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
            
    results_raw = final_state_obj.model_dump(mode='python')
    results_json_str = json.dumps(results_raw, cls=NpEncoder)
    results_dict = json.loads(results_json_str)
    
    try:
        with SessionLocal() as db:
            run_record = AnalysisRun(
                run_id=final_state_obj.run_id,
                status=final_state_obj.status,
                results=results_dict
            )
            db.add(run_record)
            
            # Recommendation Persistence
            for rec in results_dict.get("recommendations", []):
                db_rec = DBRecommendation(
                    analysis_run_id=final_state_obj.run_id,
                    action=rec.get("action"),
                    symbol=rec.get("asset"),
                    confidence=rec.get("confidence"),
                    reasoning=rec.get("reason")
                )
                db.add(db_rec)
                
            db.commit()
    except Exception as e:
        print(f"Failed to persist analysis run: {e}")
        
    return results_dict

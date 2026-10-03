"""
LangGraph Orchestrator — Phase 3C
=================================
Initial orchestration pipeline using LangGraph.
Currently implements: Input Validation -> Historical RAG Retrieval -> Evidence/Audit.

Extension points are defined for Phase 4 specialist agents:
  - sentiment_agent
  - weather_macro_agent
  - risk_agent
  - hedging_agent
"""

import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any

from langgraph.graph import StateGraph, START, END

from app.schemas.orchestration import AnalysisState, AgentTrace, EvidenceItem
from app.services.historical_rag_service import retrieve_similar_events


def init_state(query: str) -> AnalysisState:
    return AnalysisState(query=query)


def node_validate_input(state: AnalysisState) -> AnalysisState:
    """Validates the incoming query and normalizes basic state."""
    start_time = time.time()
    
    if not state.query or not state.query.strip():
        state.errors.append("Empty query provided")
        state.status = "error"
    else:
        state.status = "validating"
        
    latency = round((time.time() - start_time) * 1000, 2)
    state.agent_trace.append(
        AgentTrace(
            node="validate_input",
            status="completed" if not state.errors else "error",
            started_at=datetime.fromtimestamp(start_time, tz=timezone.utc),
            completed_at=datetime.now(timezone.utc),
            latency_ms=latency,
            input_summary=f"Query len: {len(state.query)}"
        )
    )
    return state


def node_historical_rag(state: AnalysisState) -> AnalysisState:
    """Retrieves historical parallels using pgvector + Redis cache."""
    if state.status == "error":
        return state
        
    state.status = "retrieving_history"
    start_time = time.time()
    
    try:
        rag_result = retrieve_similar_events(state.query, top_k=5)
        state.historical_matches = rag_result
        
        # Populate Evidence for each match
        for idx, match in enumerate(rag_result.get("matches", [])):
            evidence = EvidenceItem(
                id=f"hist_{match['event_id']}_{uuid.uuid4().hex[:6]}",
                type="historical_event",
                source=match["provenance"]["source"],
                timestamp=datetime.now(timezone.utc),
                description=f"Retrieved historical analogue: {match['event_name']} ({match['event_year']})",
                data_reference={"similarity": match["similarity"], "event_id": match["event_id"]},
                model_reference=match["provenance"]["embedding_model"]
            )
            state.evidence.append(evidence)
            
        latency = round((time.time() - start_time) * 1000, 2)
        state.agent_trace.append(
            AgentTrace(
                node="historical_rag",
                status="completed",
                started_at=datetime.fromtimestamp(start_time, tz=timezone.utc),
                completed_at=datetime.now(timezone.utc),
                latency_ms=latency,
                input_summary=state.query[:50] + "...",
                retrieval_count=len(rag_result.get("matches", [])),
                sources=["pgvector", "redis"],
                cache_hit=rag_result.get("retrieval_metadata", {}).get("cache_hit", False)
            )
        )
        
    except Exception as e:
        state.errors.append(f"RAG retrieval failed: {e}")
        state.status = "error"
        state.agent_trace.append(
            AgentTrace(
                node="historical_rag",
                status="error",
                started_at=datetime.fromtimestamp(start_time, tz=timezone.utc),
                completed_at=datetime.now(timezone.utc),
                latency_ms=round((time.time() - start_time) * 1000, 2),
                input_summary=state.query[:50] + "..."
            )
        )
        
    return state


# ── EXTENSION POINTS (Phase 4) ───────────────────────────────────────────────

def node_sentiment_agent(state: AnalysisState) -> AnalysisState:
    # Deferred to Phase 4
    return state

def node_weather_macro_agent(state: AnalysisState) -> AnalysisState:
    # Deferred to Phase 4
    return state

def node_risk_agent(state: AnalysisState) -> AnalysisState:
    # Deferred to Phase 4
    return state

def node_hedging_agent(state: AnalysisState) -> AnalysisState:
    # Deferred to Phase 4
    return state

def node_finalize(state: AnalysisState) -> AnalysisState:
    if state.status != "error":
        state.status = "completed"
    state.updated_at = datetime.utcnow()
    return state


# ── BUILD GRAPH ──────────────────────────────────────────────────────────────

def build_graph() -> StateGraph:
    workflow = StateGraph(AnalysisState)
    
    workflow.add_node("validate_input", node_validate_input)
    workflow.add_node("historical_rag", node_historical_rag)
    
    # Extension nodes for later
    workflow.add_node("sentiment_agent", node_sentiment_agent)
    workflow.add_node("weather_macro_agent", node_weather_macro_agent)
    workflow.add_node("risk_agent", node_risk_agent)
    workflow.add_node("hedging_agent", node_hedging_agent)
    
    workflow.add_node("finalize", node_finalize)
    
    workflow.add_edge(START, "validate_input")
    workflow.add_edge("validate_input", "historical_rag")
    
    # Direct routing to finalize for Phase 3
    workflow.add_edge("historical_rag", "finalize")
    
    # In Phase 4, edges will route to the agent nodes.
    workflow.add_edge("sentiment_agent", "finalize")
    workflow.add_edge("weather_macro_agent", "finalize")
    workflow.add_edge("risk_agent", "finalize")
    workflow.add_edge("hedging_agent", "finalize")
    
    workflow.add_edge("finalize", END)
    
    return workflow.compile()


_graph = build_graph()


def run_analysis(query: str) -> AnalysisState:
    """
    Main entry point for the orchestrator.
    Executes the LangGraph workflow and returns the structured state.
    """
    initial_state = init_state(query)
    # LangGraph returns dict if using dict state, but we are passing pydantic model in our StateGraph definition.
    # Note: StateGraph with Pydantic often returns dict depending on langgraph version, so we handle both.
    
    result = _graph.invoke(initial_state)
    
    if isinstance(result, dict):
        return AnalysisState(**result)
    return result

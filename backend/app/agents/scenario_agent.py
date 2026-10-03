"""
Scenario Agent — Phase 4
========================
Combines event/weather context, sentiment, and historical matches
to produce a structured scenario object.
"""

import time
from datetime import datetime, timezone

from app.schemas.orchestration import AnalysisState, AgentTrace, EvidenceItem


def node_scenario_agent(state: AnalysisState) -> AnalysisState:
    if state.status == "error":
        return state
        
    start_time = time.time()
    
    # Check if we have historical matches
    matches = state.historical_matches.get("matches", [])
    if not matches:
        state.scenario = {"status": "unavailable", "reason": "No historical analogues found."}
        state.agent_trace.append(
            AgentTrace(
                node="scenario_agent",
                agent="scenario",
                status="skipped",
                started_at=datetime.fromtimestamp(start_time, tz=timezone.utc),
                completed_at=datetime.now(timezone.utc),
                latency_ms=round((time.time() - start_time) * 1000, 2),
                warnings=["Skipped due to no historical matches"]
            )
        )
        return state
        
    top_match = matches[0]
    
    # Construct scenario
    scenario_name = f"{(state.user_intent.get('event_type') or 'Event').capitalize()} Shock Scenario"
    
    # Calculate estimated impacts from historical reactions
    estimated_impacts = {}
    asset_reactions = top_match.get("asset_reactions", {}).get("assets", {})
    for sym, reaction in asset_reactions.items():
        if reaction.get("status") == "available":
            estimated_impacts[sym] = reaction.get("future_5d_return")
            
    state.scenario = {
        "scenario_name": scenario_name,
        "shock_description": f"Simulated impact based on {top_match.get('event_name')} ({top_match.get('event_year')}).",
        "affected_assets": list(estimated_impacts.keys()),
        "historical_context": top_match.get("event_name"),
        "assumptions": ["Assumes current market conditions react similarly to the historical analogue."],
        "estimated_impacts": estimated_impacts,
        "confidence": round(top_match.get("similarity", 0.0), 4),
        "status": "modeled"
    }
    
    state.evidence.append(
        EvidenceItem(
            id=f"scen_{int(time.time())}",
            type="scenario",
            data_status="simulated",
            source="ScenarioEngine",
            timestamp=datetime.now(timezone.utc),
            description=f"Generated scenario: {scenario_name}",
            data_reference=state.scenario
        )
    )
    
    state.agent_trace.append(
        AgentTrace(
            node="scenario_agent",
            agent="scenario",
            status="completed",
            started_at=datetime.fromtimestamp(start_time, tz=timezone.utc),
            completed_at=datetime.now(timezone.utc),
            latency_ms=round((time.time() - start_time) * 1000, 2),
            inputs_used=["historical_matches", "user_intent"],
            outputs_generated=["scenario"],
            sources=["HistoricalRAG"]
        )
    )
    
    return state

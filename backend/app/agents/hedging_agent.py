"""
Hedging Agent — Phase 4
=======================
Consumes portfolio exposure, risk metrics, scenario information,
and generates simulated hedge/reallocation proposals.
"""

import time
import uuid
from datetime import datetime, timezone

from app.schemas.orchestration import AnalysisState, AgentTrace, EvidenceItem


def node_hedging_agent(state: AnalysisState) -> AnalysisState:
    if state.status == "error":
        return state
        
    start_time = time.time()
    
    recs = []
    
    # Needs scenario impacts to generate hedges
    impacts = state.scenario.get("estimated_impacts", {})
    portfolio = state.portfolio_context.get("weights", {})
    
    if not impacts:
        state.warnings.append("Hedging agent skipped: missing scenario impacts.")
        state.agent_trace.append(
            AgentTrace(
                node="hedging_agent",
                agent="hedging",
                status="skipped",
                started_at=datetime.fromtimestamp(start_time, tz=timezone.utc),
                completed_at=datetime.now(timezone.utc),
                latency_ms=round((time.time() - start_time) * 1000, 2),
                warnings=["Missing scenario impacts"]
            )
        )
        return state
        
    if not portfolio:
        # Generate asset-level review recommendations based on impacts
        for sym, impact in impacts.items():
            if impact < -0.01:
                recs.append({
                    "id": str(uuid.uuid4()),
                    "asset": sym,
                    "action": "review_exposure",
                    "target_weight": None,
                    "allocation_change": None,
                    "reason": f"Estimated impact is negative ({round(impact * 100, 2)}%) based on scenario. Review holding.",
                    "risk_target": "volatility_reduction",
                    "expected_effect": {
                        "portfolio_risk_change": 0.0,
                        "stress_loss_change": 0.0,
                        "description": "Asset-level review only. Portfolio missing."
                    },
                    "assumptions": ["Scenario impact materializes linearly."],
                    "simulation": True,
                    "confidence": state.scenario.get("confidence"),
                    "status": "simulated"
                })
        
        if not recs:
            recs.append({
                "id": str(uuid.uuid4()),
                "asset": "Portfolio",
                "action": "hold",
                "target_weight": None,
                "allocation_change": None,
                "reason": "No hedge triggered under current scenario assumptions.",
                "risk_target": "maintain_exposure",
                "expected_effect": {
                    "portfolio_risk_change": 0.0,
                    "stress_loss_change": 0.0,
                    "description": "No significant negative impacts projected."
                },
                "assumptions": [],
                "simulation": True,
                "confidence": 0.0,
                "status": "simulated"
            })
    else:
        # Portfolio exists
        for sym, weight in portfolio.items():
            impact = impacts.get(sym, 0.0)
            if impact < -0.01:
                recs.append({
                    "id": str(uuid.uuid4()),
                    "asset": sym,
                    "action": "reduce_exposure",
                    "target_weight": round(weight * 0.5, 4), # Recommend halving
                    "allocation_change": -round(weight * 0.5, 4),
                    "reason": f"Estimated impact is negative ({round(impact * 100, 2)}%) based on scenario.",
                    "risk_target": "volatility_reduction",
                    "expected_effect": {
                        "portfolio_risk_change": -0.015,
                        "stress_loss_change": 0.012,
                        "description": f"Reduces portfolio VAR by avoiding {sym} downside."
                    },
                    "assumptions": ["Scenario impact materializes linearly."],
                    "simulation": True,
                    "confidence": state.scenario.get("confidence"),
                    "status": "simulated"
                })
            else:
                recs.append({
                    "id": str(uuid.uuid4()),
                    "asset": sym,
                    "action": "hold",
                    "target_weight": weight,
                    "allocation_change": 0.0,
                    "reason": f"Estimated impact is neutral/positive ({round(impact * 100, 2)}%).",
                    "risk_target": "maintain_exposure",
                    "expected_effect": {
                        "portfolio_risk_change": 0.0,
                        "stress_loss_change": 0.0,
                        "description": "No change."
                    },
                    "assumptions": ["Scenario impact materializes linearly."],
                    "simulation": True,
                    "confidence": state.scenario.get("confidence"),
                    "status": "simulated"
                })
            
    state.recommendations = recs
    
    # Generate Evidence
    for rec in recs:
        state.evidence.append(
            EvidenceItem(
                id=f"rec_{rec['id']}",
                type="recommendation",
                data_status="simulated",
                source="HedgingAgent",
                timestamp=datetime.now(timezone.utc),
                description=f"Recommendation: {rec['action']} {rec['asset']}",
                data_reference=rec
            )
        )
        
    state.agent_trace.append(
        AgentTrace(
            node="hedging_agent",
            agent="hedging",
            status="completed",
            started_at=datetime.fromtimestamp(start_time, tz=timezone.utc),
            completed_at=datetime.now(timezone.utc),
            latency_ms=round((time.time() - start_time) * 1000, 2),
            inputs_used=["portfolio_context", "scenario"],
            outputs_generated=["recommendations"],
            sources=["Internal Logic"]
        )
    )
    
    return state

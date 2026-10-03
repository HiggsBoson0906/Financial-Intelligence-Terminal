"""
Risk Agent — Phase 4
====================
Calculates real-time portfolio volatility, historical VaR, and stress scenarios
using the deterministic RiskEngine from Phase 2.
"""

import time
from datetime import datetime, timezone
import pandas as pd

from app.schemas.orchestration import AnalysisState, AgentTrace, EvidenceItem
from risk.engine import RiskEngine

# Initialize the Phase 2 RiskEngine
risk_engine = RiskEngine()


def _get_mock_portfolio():
    """Returns a mock portfolio. In a real system, this would come from a DB."""
    return {
        "XOM": 0.30,
        "CVX": 0.20,
        "COP": 0.20,
        "OXY": 0.10,
        "XLE": 0.10,
        "SPY": 0.10
    }


def node_risk_agent(state: AnalysisState) -> AnalysisState:
    if state.status == "error":
        return state
        
    start_time = time.time()
    
    portfolio_weights = state.portfolio_context.get("weights", _get_mock_portfolio())
    state.portfolio_context["weights"] = portfolio_weights
    state.portfolio_context["status"] = "demo" # Explicitly mark as mock/demo
    
    try:
        # Phase 2 RiskEngine requires specific types
        import numpy as np
        
        weights_arr = np.array(list(portfolio_weights.values()))
        # Create a mock covariance matrix (diagonal for simplicity)
        cov_matrix = pd.DataFrame(
            np.diag([0.04] * len(portfolio_weights)), 
            index=list(portfolio_weights.keys()), 
            columns=list(portfolio_weights.keys())
        )
        
        # Calculate Volatility
        volatility = risk_engine.calculate_portfolio_volatility(weights_arr, cov_matrix)
        
        # Calculate Historical VaR (95%) using a mock historical return series
        # In a real app this would come from market data
        np.random.seed(42)
        mock_returns = pd.Series(np.random.normal(0, 0.02, 100))
        var_95 = risk_engine.calculate_historical_var(mock_returns)
        cvar = risk_engine.calculate_expected_shortfall(mock_returns)
        
        # Run a generic stress test (e.g. 2008 Financial Crisis)
        mock_shock = {sym: -0.10 for sym in portfolio_weights.keys()}
        stress_result = risk_engine.run_stress_scenario(
            current_portfolio_value=10000.0,
            asset_weights=portfolio_weights,
            scenario_shocks=mock_shock
        )
        stress_impact = stress_result.get("shocked_value", 0.0) - stress_result.get("original_value", 0.0)
        
        state.risk = {
            "volatility": round(float(volatility), 4),
            "var_95": round(float(var_95), 4),
            "cvar": round(float(cvar), 4),
            "stress_impact": round(float(stress_impact), 4),
            "concentration": risk_engine.calculate_concentration(portfolio_weights),
            "status": "calculated"
        }
        
        # Generate Evidence
        state.evidence.append(
            EvidenceItem(
                id=f"risk_{int(time.time())}",
                type="risk_calculation",
                data_status="simulated",
                source="RiskEngine",
                timestamp=datetime.now(timezone.utc),
                description="Deterministic portfolio risk calculation",
                data_reference=state.risk,
                model_reference="Phase2_RiskEngine"
            )
        )
        
    except Exception as e:
        state.warnings.append(f"Risk calculation failed: {e}")
        state.risk = {"status": "unavailable"}
        
    state.agent_trace.append(
        AgentTrace(
            node="risk_agent",
            agent="risk",
            status="completed" if state.risk.get("status") != "unavailable" else "error",
            started_at=datetime.fromtimestamp(start_time, tz=timezone.utc),
            completed_at=datetime.now(timezone.utc),
            latency_ms=round((time.time() - start_time) * 1000, 2),
            inputs_used=["portfolio_weights", "market_data"],
            outputs_generated=["volatility", "var", "stress"],
            sources=["RiskEngine"]
        )
    )
    
    return state

from fastapi import APIRouter
from pydantic import BaseModel
import pandas as pd
import numpy as np
from app.agents.risk_agent import risk_engine

router = APIRouter(prefix="/api/v1/scenario", tags=["Scenario"])

class ScenarioRequest(BaseModel):
    event_intensity: int
    energy_exposure: float
    hedge_size: float
    portfolio_value: float = 10000000.0
    base_var: float = 0.0

@router.post("/simulate")
def simulate_scenario(request: ScenarioRequest):
    # Construct shock mapping based on event intensity (1-5) and energy exposure
    intensity_scalar = request.event_intensity / 3.0
    
    weights = {
        "XOM": (request.energy_exposure / 100) * 0.4,
        "CVX": (request.energy_exposure / 100) * 0.4,
        "COP": (request.energy_exposure / 100) * 0.2,
        "SPY": 1.0 - (request.energy_exposure / 100)
    }
    
    # Scenario shocks: Energy stocks drop heavily based on intensity
    shock = -0.05 * intensity_scalar
    shocks = {
        "XOM": shock * 1.2,
        "CVX": shock * 1.1,
        "COP": shock * 1.3,
        "SPY": -0.01 * intensity_scalar
    }
    
    stress_result = risk_engine.run_stress_scenario(
        current_portfolio_value=request.portfolio_value,
        asset_weights=weights,
        scenario_shocks=shocks
    )
    
    # Hedge size reduces the shock on energy assets
    hedge_reduction = request.hedge_size / 100.0  # 0 to 0.50
    hedged_shocks = {k: v * (1.0 - hedge_reduction) if k != "SPY" else v for k, v in shocks.items()}
    
    hedged_stress_result = risk_engine.run_stress_scenario(
        current_portfolio_value=request.portfolio_value,
        asset_weights=weights,
        scenario_shocks=hedged_shocks
    )
    
    stressed_loss = request.portfolio_value - stress_result.get("shocked_value", request.portfolio_value)
    hedged_loss = request.portfolio_value - hedged_stress_result.get("shocked_value", request.portfolio_value)
    
    # Calculate VaR via mock returns scaled by intensity
    np.random.seed(int(request.event_intensity * 42)) # stable random per intensity
    mock_returns = pd.Series(np.random.normal(0, 0.02 * intensity_scalar, 100))
    var_95 = risk_engine.calculate_historical_var(mock_returns) * request.portfolio_value
    es = risk_engine.calculate_expected_shortfall(mock_returns) * request.portfolio_value
    
    # Hedged VaR
    np.random.seed(int(request.event_intensity * 42))
    hedged_returns = pd.Series(np.random.normal(0, 0.02 * intensity_scalar * (1 - hedge_reduction*0.5), 100))
    hedged_var_95 = risk_engine.calculate_historical_var(hedged_returns) * request.portfolio_value
    hedged_es = risk_engine.calculate_expected_shortfall(hedged_returns) * request.portfolio_value
    
    # Base VaR baseline risk change calculation
    risk_change = (abs(var_95) - request.base_var) / request.base_var * 100 if request.base_var else 15.0 * intensity_scalar
    sim_risk_change = (abs(hedged_var_95) - request.base_var) / request.base_var * 100 if request.base_var else 15.0 * intensity_scalar * (1 - hedge_reduction)
    
    hedge_cost = request.portfolio_value * (request.hedge_size / 100.0) * 0.005 # 50bps of hedged amount
    
    return {
        "stressed_var_95": abs(hedged_var_95),
        "stressed_expected_shortfall": abs(hedged_es),
        "risk_change_percent": sim_risk_change,
        "base_risk_change_percent": risk_change,
        "expected_loss_reduction": stressed_loss - hedged_loss,
        "risk_reduction_percent": (1 - abs(hedged_var_95)/abs(var_95)) * 100 if var_95 else 0,
        "hedge_cost": hedge_cost
    }

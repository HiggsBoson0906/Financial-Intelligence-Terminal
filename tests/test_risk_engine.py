import pytest
import pandas as pd
import numpy as np
from risk.engine import RiskEngine

def test_portfolio_volatility():
    re = RiskEngine()
    weights = np.array([0.5, 0.5])
    
    # Perfectly correlated mock covariance (variance = 0.04)
    cov = pd.DataFrame([[0.04, 0.04], [0.04, 0.04]])
    
    vol = re.calculate_portfolio_volatility(weights, cov)
    # daily var = 0.5*0.5*0.04 * 4 = 0.04 -> vol = sqrt(0.04 * 252) = 3.1749
    expected_vol = np.sqrt(0.04 * 252)
    assert np.isclose(vol, expected_vol)

def test_historical_var():
    re = RiskEngine(confidence_level=0.95)
    returns = pd.Series([-0.05, -0.01, 0.0, 0.02, 0.05] * 20) # 100 days
    
    var = re.calculate_historical_var(returns)
    cvar = re.calculate_expected_shortfall(returns)
    
    assert var > 0
    assert cvar >= var # Expected shortfall should be worse or equal to VaR

def test_stress_scenario():
    re = RiskEngine()
    weights = {"A": 0.5, "B": 0.5}
    shocks = {"A": -0.10, "B": -0.20} # 10% loss on A, 20% loss on B
    
    res = re.run_stress_scenario(
        current_portfolio_value=1000, 
        asset_weights=weights, 
        scenario_shocks=shocks,
        scenario_type="ml_predicted_event"
    )
    
    assert np.isclose(res["portfolio_shock_pct"], -0.15)
    assert np.isclose(res["expected_loss_value"], -150)
    assert np.isclose(res["post_shock_value"], 850)
    assert res["metadata"]["is_forecast"] is True
    assert res["metadata"]["scenario_type"] == "ml_predicted_event"

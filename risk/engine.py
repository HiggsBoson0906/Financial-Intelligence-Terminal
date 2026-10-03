import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Any

class RiskEngine:
    """
    Deterministic Quantitative Risk Service.
    Computes Value at Risk (VaR), Portfolio Volatility, and runs Stress Scenarios.
    """
    def __init__(self, confidence_level: float = 0.95):
        self.confidence_level = confidence_level

    def calculate_portfolio_volatility(self, weights: np.ndarray, cov_matrix: pd.DataFrame) -> float:
        daily_var = weights.T @ cov_matrix.values @ weights
        annual_vol = np.sqrt(daily_var * 252)
        return float(annual_vol)

    def calculate_historical_var(self, portfolio_returns: pd.Series) -> float:
        percentile = (1 - self.confidence_level) * 100
        var = np.percentile(portfolio_returns, percentile)
        return float(abs(var)) 
        
    def calculate_expected_shortfall(self, portfolio_returns: pd.Series) -> float:
        """Calculates CVaR (Expected Shortfall)."""
        percentile = (1 - self.confidence_level) * 100
        var = np.percentile(portfolio_returns, percentile)
        cvar = portfolio_returns[portfolio_returns <= var].mean()
        return float(abs(cvar)) if not np.isnan(cvar) else float(abs(var))
        
    def calculate_max_drawdown(self, portfolio_values: pd.Series) -> float:
        """Calculates Maximum Drawdown of the portfolio."""
        rolling_max = portfolio_values.cummax()
        drawdowns = (portfolio_values - rolling_max) / rolling_max
        return float(abs(drawdowns.min()))
        
    def calculate_concentration(self, weights: Dict[str, float]) -> Dict[str, Any]:
        """Calculates asset concentration (HHI and max weight)."""
        w_arr = np.array(list(weights.values()))
        hhi = np.sum(w_arr ** 2)
        max_asset = max(weights, key=weights.get)
        return {"hhi": float(hhi), "max_weight_asset": max_asset, "max_weight": float(weights[max_asset])}

    def run_stress_scenario(
        self, 
        current_portfolio_value: float, 
        asset_weights: Dict[str, float],
        scenario_shocks: Dict[str, float],
        scenario_type: str = "user_defined",
        scenario_name: str = "Custom Shock"
    ) -> Dict[str, Any]:
        """
        Calculates the impact of a specific stress scenario.
        scenario_type must be one of: 'historical_event', 'ml_predicted_event', 'user_defined'.
        """
        valid_types = ['historical_event', 'ml_predicted_event', 'user_defined']
        if scenario_type not in valid_types:
            raise ValueError(f"scenario_type must be one of {valid_types}")
            
        portfolio_shock = 0.0
        for asset, weight in asset_weights.items():
            if asset in scenario_shocks:
                portfolio_shock += weight * scenario_shocks[asset]
                
        expected_loss = current_portfolio_value * portfolio_shock
        post_shock_value = current_portfolio_value + expected_loss 
        
        return {
            "metadata": {
                "scenario_name": scenario_name,
                "scenario_type": scenario_type,
                "is_forecast": False if scenario_type == "user_defined" else (scenario_type == "ml_predicted_event")
            },
            "portfolio_shock_pct": portfolio_shock,
            "expected_loss_value": expected_loss,
            "post_shock_value": post_shock_value
        }

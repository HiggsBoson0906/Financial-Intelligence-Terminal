import pytest
import numpy as np
import pandas as pd
from risk.engine import RiskEngine
from app.agents.risk_agent import node_risk_agent, load_historical_market_returns
from app.agents.scenario_agent import node_scenario_agent
from app.agents.orchestrator import run_analysis
from app.schemas.orchestration import AnalysisState

def test_risk_engine_deterministic_historical_returns():
    """1. RiskEngine with deterministic historical returns."""
    returns_df = load_historical_market_returns()
    assert not returns_df.empty
    for sym in ["XOM", "CVX", "COP", "OXY", "XLE", "SPY"]:
        assert sym in returns_df.columns
        
    weights = {"XOM": 0.3, "CVX": 0.2, "COP": 0.2, "OXY": 0.1, "XLE": 0.1, "SPY": 0.1}
    portfolio_val = 10000000.0
    
    port_returns = sum(weights[sym] * returns_df[sym] for sym in weights if sym in returns_df.columns)
    engine = RiskEngine(confidence_level=0.95)
    
    var_95_1 = engine.calculate_historical_var(port_returns)
    var_95_2 = engine.calculate_historical_var(port_returns)
    # Strictly deterministic
    assert var_95_1 == var_95_2
    assert var_95_1 > 0.01  # > 1% daily VaR
    
    es_95 = engine.calculate_expected_shortfall(port_returns)
    assert es_95 >= var_95_1  # ES must be >= VaR

def test_var_changes_when_input_returns_change():
    """2. VaR changes when the input return series changes."""
    engine = RiskEngine(confidence_level=0.95)
    returns_low_vol = pd.Series(np.linspace(-0.01, 0.01, 500))
    returns_high_vol = pd.Series(np.linspace(-0.08, 0.08, 500))
    
    var_low = engine.calculate_historical_var(returns_low_vol)
    var_high = engine.calculate_historical_var(returns_high_vol)
    
    assert var_high > var_low * 3.0

def test_scenario_stress_changes_when_shocks_change():
    """3. Scenario stress changes when scenario shocks change."""
    engine = RiskEngine()
    weights = {"XOM": 0.3, "CVX": 0.2, "COP": 0.2, "OXY": 0.1, "XLE": 0.1, "SPY": 0.1}
    port_val = 10000000.0
    
    mild_shock = {"XOM": -0.02, "CVX": -0.01, "COP": -0.01, "OXY": -0.02, "XLE": -0.01, "SPY": -0.005}
    severe_shock = {"XOM": -0.15, "CVX": -0.12, "COP": -0.10, "OXY": -0.20, "XLE": -0.14, "SPY": -0.03}
    
    stress_mild = engine.run_stress_scenario(current_portfolio_value=port_val, asset_weights=weights, scenario_shocks=mild_shock)
    stress_severe = engine.run_stress_scenario(current_portfolio_value=port_val, asset_weights=weights, scenario_shocks=severe_shock)
    
    assert abs(stress_severe["portfolio_shock_pct"]) > abs(stress_mild["portfolio_shock_pct"])
    assert abs(stress_severe["expected_loss_value"]) > abs(stress_mild["expected_loss_value"])

def test_energy_exposure_derived_from_portfolio_weights():
    """4. Energy exposure is derived from portfolio weights."""
    state = AnalysisState(
        query="test energy",
        portfolio_context={
            "weights": {"XOM": 0.3, "CVX": 0.2, "COP": 0.2, "OXY": 0.1, "XLE": 0.1, "SPY": 0.1}
        }
    )
    result = node_risk_agent(state)
    energy_exposure = result.portfolio_context.get("energy_exposure")
    assert energy_exposure == 0.90  # 30+20+20+10+10 = 90%
    
    # Check that it updates if weights change
    state_custom = AnalysisState(
        query="test tech",
        portfolio_context={
            "weights": {"XOM": 0.1, "SPY": 0.9}
        }
    )
    result_custom = node_risk_agent(state_custom)
    assert result_custom.portfolio_context.get("energy_exposure") == 0.10

def test_missing_scenario_data_results_in_unavailable():
    """5. Missing scenario data results in unavailable, not fabricated numbers."""
    state = AnalysisState(query="unknown hypothetical event", portfolio_context={})
    # Run scenario agent without RAG matches
    state.historical_matches = {"status": "unavailable", "matches": []}
    result_scenario = node_scenario_agent(state)
    
    assert result_scenario.scenario.get("portfolio_impact", {}).get("status") == "unavailable"
    assert result_scenario.scenario.get("portfolio_impact", {}).get("impact_level") == "IMPACT UNAVAILABLE"
    # Verify no fake -10% or fabricated numbers
    assert "total_impact_percent" not in result_scenario.scenario.get("portfolio_impact", {})

def test_different_queries_produce_different_scenario_impacts():
    """6 & 7. Different scenario queries produce different scenario outputs while baseline VaR remains stable."""
    # Query 1: Hurricane (has historical hurricane analogues with energy asset reactions)
    q1 = "How would a Category 3 hurricane affecting the US Gulf Coast change the risk of my XOM, CVX, and COP holdings, and what hedge should I consider?"
    res1 = run_analysis(q1)
    
    # Query 2: Wildfire
    q2 = "How would a severe wildfire affecting California impact my portfolio?"
    res2 = run_analysis(q2)
    
    # Query 3: Drought
    q3 = "How would a drought affecting agricultural regions change the portfolio risk?"
    res3 = run_analysis(q3)
    
    # Baseline VaR should be identical across all 3 because portfolio is the same
    var1 = res1["risk"]["baseline"]["var_95"]
    var2 = res2["risk"]["baseline"]["var_95"]
    var3 = res3["risk"]["baseline"]["var_95"]
    assert var1 == var2 == var3
    assert var1 > 0
    
    # Scenario events and regions must match the queries, not historical analogues
    assert res1["user_intent"]["event_type"] == "hurricane"
    assert "gulf" in res1["user_intent"]["region"].lower()
    
    assert res2["user_intent"]["event_type"] == "wildfire"
    assert "california" in res2["user_intent"]["region"].lower()
    
    assert res3["user_intent"]["event_type"] == "drought"
    
    # Scenario impact must reflect query-specific estimated impacts
    impact1 = res1["scenario"].get("portfolio_impact", {}).get("total_impact_percent")
    impact2 = res2["scenario"].get("portfolio_impact", {}).get("total_impact_percent")
    impact3 = res3["scenario"].get("portfolio_impact", {}).get("total_impact_percent")
    
    # Query 1 and Query 2 have different historical analogues and different impacts
    # None of them should be a hardcoded -10%
    if impact1 is not None and impact2 is not None:
        assert impact1 != impact2
    if impact1 is not None:
        assert impact1 != -10.0

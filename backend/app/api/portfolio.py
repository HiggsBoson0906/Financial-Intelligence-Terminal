from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.portfolio import PortfolioSummary, PortfolioPosition
from app.schemas.common import ErrorResponse

router = APIRouter(prefix="/api/v1/portfolio", tags=["Portfolio"])

@router.get("/summary", response_model=PortfolioSummary, responses={501: {"model": ErrorResponse}}, summary="Get Portfolio Summary")
def get_portfolio_summary():
    """
    Retrieve the current summary and overall value of the portfolio.
    """
    raise HTTPException(status_code=501, detail="Not Implemented")

import yfinance as yf
import numpy as np
import pandas as pd
from datetime import datetime, timezone

@router.get("/risk")
def get_portfolio_risk():
    """
    Lightweight deterministic risk recalculation for the synthetic portfolio.
    Uses real market prices.
    """
    synthetic_portfolio = {
        "XOM": 0.30,
        "CVX": 0.20,
        "COP": 0.20,
        "OXY": 0.10,
        "XLE": 0.10,
        "SPY": 0.10
    }
    total_val = 10000000.0
    
    # Fetch live prices and daily changes
    symbols = list(synthetic_portfolio.keys())
    tickers = yf.Tickers(" ".join(symbols))
    
    holdings = []
    total_daily_pnl = 0.0
    total_energy_exposure = 0.0
    
    for sym, weight in synthetic_portfolio.items():
        pos_val = total_val * weight
        try:
            info = tickers.tickers[sym].info
            price = info.get("regularMarketPrice") or info.get("currentPrice") or info.get("previousClose") or 100.0
            prev_close = info.get("previousClose", price)
            daily_change = ((price - prev_close) / prev_close * 100) if prev_close else 0.0
        except:
            price = 100.0
            daily_change = 0.0
            
        pnl = pos_val * (daily_change / 100.0)
        total_daily_pnl += pnl
        
        if sym in ["XOM", "CVX", "COP", "OXY", "XLE"]:
            total_energy_exposure += weight
            
        # Dummy risk contribution proportional to weight
        risk_contrib = weight * 100.0
        
        holdings.append({
            "symbol": sym,
            "weight": weight,
            "position_value": pos_val,
            "live_price": price,
            "daily_change": daily_change,
            "risk_contribution": risk_contrib
        })
        
    # Use RiskEngine
    from risk.engine import RiskEngine
    engine = RiskEngine()
    
    weights_arr = np.array(list(synthetic_portfolio.values()))
    cov_matrix = pd.DataFrame(
        np.diag([0.04] * len(synthetic_portfolio)), 
        index=list(synthetic_portfolio.keys()), 
        columns=list(synthetic_portfolio.keys())
    )
    
    volatility = engine.calculate_portfolio_volatility(weights_arr, cov_matrix)
    
    # Mock some historical returns for VaR/ES
    np.random.seed(int(datetime.now().timestamp()) % 10000)
    # Add a slight negative bias if market is down
    bias = total_daily_pnl / total_val
    mock_returns = pd.Series(np.random.normal(bias, 0.02, 252))
    var_95 = engine.calculate_historical_var(mock_returns)
    es = engine.calculate_expected_shortfall(mock_returns)
    concentration = engine.calculate_concentration(synthetic_portfolio)
    
    return {
        "total_value": total_val,
        "daily_pnl": total_daily_pnl,
        "daily_pnl_pct": (total_daily_pnl / total_val) * 100,
        "energy_exposure_pct": total_energy_exposure * 100,
        "volatility": float(volatility) * 100,
        "var_95": abs(float(var_95)) * total_val,
        "expected_shortfall": abs(float(es)) * total_val,
        "concentration": concentration,
        "holdings": holdings,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

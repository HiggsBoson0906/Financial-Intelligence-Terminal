from pydantic import BaseModel
from typing import List
from .portfolio import PortfolioPosition

class RiskMetrics(BaseModel):
    value_at_risk_95: float
    expected_shortfall_95: float
    volatility_30d: float
    beta_to_spy: float
    max_drawdown: float

class PortfolioRiskRequest(BaseModel):
    positions: List[PortfolioPosition]

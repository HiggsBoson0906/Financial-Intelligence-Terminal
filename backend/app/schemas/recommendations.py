from pydantic import BaseModel
from typing import List

class HedgingRecommendation(BaseModel):
    action: str
    target_symbol: str
    rationale: str
    expected_risk_reduction: float

from pydantic import BaseModel
from typing import List, Optional

class PortfolioPosition(BaseModel):
    symbol: str
    quantity: float
    average_entry_price: float
    current_price: Optional[float] = None
    
class PortfolioSummary(BaseModel):
    total_value: float
    positions: List[PortfolioPosition]

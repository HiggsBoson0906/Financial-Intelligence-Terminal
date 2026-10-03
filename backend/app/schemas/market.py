from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MarketObservation(BaseModel):
    symbol: str
    timestamp: datetime
    price: float
    volume: Optional[int] = None
    currency: str = "USD"

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class HistoricalEvent(BaseModel):
    event_id: str
    name: str
    date: datetime
    description: str
    impact_summary: str

class NewsObservation(BaseModel):
    article_id: str
    title: str
    source: str
    published_at: datetime
    sentiment_score: Optional[float] = None

class WeatherObservation(BaseModel):
    location: str
    timestamp: datetime
    temperature: float
    condition: str
    severity_index: Optional[float] = None

class MacroObservation(BaseModel):
    indicator: str
    timestamp: datetime
    value: float
    unit: str

"""
Data Ingestion Provider Contracts — Phase 3B
==============================================
Abstract base classes and normalized schemas for connecting
external data sources (Market, News, Weather, Macro).

These interfaces ensure that downstream agents process
normalized data rather than provider-specific formats.

Phase 3 implements the abstractions. Phase 4+ will implement
the live connections.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import Any, List, Optional


@dataclass(kw_only=True)
class NormalizedRecord:
    """Base schema for all normalized data."""
    timestamp: datetime
    source: str
    status: str  # e.g., 'fresh', 'stale', 'fallback', 'missing', 'historical', 'simulated'
    retrieved_at: datetime
    raw_data: Optional[Any] = None


@dataclass
class MarketRecord(NormalizedRecord):
    symbol: str
    price: float
    volume: Optional[float] = None


@dataclass
class NewsRecord(NormalizedRecord):
    article_id: str
    title: str
    content: str
    event_id: Optional[str] = None


@dataclass
class WeatherRecord(NormalizedRecord):
    location: str
    max_wind_kt: Optional[float] = None
    min_pressure_mb: Optional[float] = None
    category: Optional[int] = None


@dataclass
class MacroRecord(NormalizedRecord):
    series_id: str
    value: float


class DataProvider(ABC):
    """Base class for all data providers."""
    
    @abstractmethod
    def health_check(self) -> bool:
        """Return True if the provider is available and authenticated."""
        pass


class MarketDataProvider(DataProvider):
    """
    Interface for live market data (e.g., Alpha Vantage, Polygon).
    """
    
    @abstractmethod
    def get_latest_price(self, symbol: str) -> MarketRecord:
        pass


class NewsDataProvider(DataProvider):
    """
    Interface for financial news (e.g., NewsAPI, GDELT).
    """
    
    @abstractmethod
    def get_recent_news(self, query: str, limit: int = 10) -> List[NewsRecord]:
        pass


class WeatherDataProvider(DataProvider):
    """
    Interface for live weather/catastrophe data (e.g., NOAA, WeatherAPI).
    """
    
    @abstractmethod
    def get_current_conditions(self, location: str) -> WeatherRecord:
        pass


class MacroDataProvider(DataProvider):
    """
    Interface for macroeconomic indicators (e.g., FRED).
    """
    
    @abstractmethod
    def get_latest_indicator(self, series_id: str) -> MacroRecord:
        pass

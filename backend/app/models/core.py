from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Text
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from app.db.session import Base
from app.core.config import settings

class HistoricalEvent(Base):
    """Test model for pgvector embeddings."""
    __tablename__ = "historical_events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, index=True, unique=True)
    event_name = Column(String)
    event_year = Column(Integer)
    event_type = Column(String)
    description = Column(Text)
    normalized_summary = Column(Text)
    embedding = Column(Vector(settings.EMBEDDING_DIM))
    metadata_json = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, unique=True, index=True)
    name = Column(String)
    event_type = Column(String)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class EventObservation(Base):
    __tablename__ = "event_observations"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, ForeignKey("events.event_id"))
    timestamp = Column(DateTime)
    metrics = Column(JSON, default={})

class MarketData(Base):
    __tablename__ = "market_data"
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    timestamp = Column(DateTime, index=True)
    close_price = Column(Float)
    volume = Column(Float)

class MacroData(Base):
    __tablename__ = "macro_data"
    id = Column(Integer, primary_key=True, index=True)
    indicator_code = Column(String, index=True)
    timestamp = Column(DateTime, index=True)
    value = Column(Float)

class WeatherData(Base):
    __tablename__ = "weather_data"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, index=True)
    timestamp = Column(DateTime)
    wind_speed = Column(Float)
    pressure = Column(Float)

class News(Base):
    __tablename__ = "news"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, index=True)
    published_at = Column(DateTime)
    title = Column(String)
    content = Column(Text)
    source = Column(String)

class Sentiment(Base):
    __tablename__ = "sentiment"
    id = Column(Integer, primary_key=True, index=True)
    news_id = Column(Integer, ForeignKey("news.id"))
    sentiment_score = Column(Float)
    sentiment_label = Column(String)
    confidence = Column(Float)

class Portfolio(Base):
    __tablename__ = "portfolio"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Position(Base):
    __tablename__ = "positions"
    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolio.id"))
    symbol = Column(String)
    quantity = Column(Float)

class AnalysisRun(Base):
    __tablename__ = "analysis_runs"
    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(String, unique=True, index=True)
    status = Column(String)
    results = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(Integer, primary_key=True, index=True)
    analysis_run_id = Column(String, ForeignKey("analysis_runs.run_id"))
    action = Column(String)
    symbol = Column(String)
    confidence = Column(Float)
    reasoning = Column(Text)

class AuditRecord(Base):
    __tablename__ = "audit_records"
    id = Column(Integer, primary_key=True, index=True)
    action = Column(String)
    user_id = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    details = Column(JSON)

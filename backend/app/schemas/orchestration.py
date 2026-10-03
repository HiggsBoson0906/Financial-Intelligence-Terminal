"""
Orchestration State and Evidence Models — Phase 4
=================================================
Defines the shared typed state for the LangGraph orchestrator
and the Evidence structure for the audit drawer.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class EvidenceItem(BaseModel):
    """
    A single piece of auditable evidence used by agents.
    """
    id: str
    type: str  # e.g., 'market', 'news', 'sentiment', 'weather', 'macro', 'historical_event', 'correlation', 'risk_calculation', 'scenario', 'recommendation'
    source: str
    timestamp: datetime
    description: str
    data_status: str = Field(default="live", description="Indicates if data is live, historical, fallback, or mocked")
    data_reference: Optional[Dict[str, Any]] = None
    model_reference: Optional[str] = None
    confidence: Optional[float] = None
    status: str = "valid"


class AgentTrace(BaseModel):
    """
    Audit-friendly trace record for an orchestration node execution.
    """
    node: str
    agent: str = "system"
    status: str
    started_at: datetime
    completed_at: datetime
    latency_ms: float
    inputs_used: List[str] = Field(default_factory=list)
    outputs_generated: List[str] = Field(default_factory=list)
    sources: List[str] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    cache_hit: Optional[bool] = None


class AnalysisState(BaseModel):
    """
    Shared typed state for the LangGraph orchestration workflow.
    Allows all four agents to communicate without hidden global state.
    """
    run_id: str = Field(default_factory=lambda: "")
    query: str
    status: str = "initialized"
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    
    # Query Parsing output
    user_intent: Dict[str, Any] = Field(default_factory=dict)
    symbols: List[str] = Field(default_factory=list)
    
    # Core state blocks
    portfolio_context: Dict[str, Any] = Field(default_factory=dict)
    market_context: Dict[str, Any] = Field(default_factory=dict)
    event_context: Dict[str, Any] = Field(default_factory=dict)
    
    sentiment: Dict[str, Any] = Field(default_factory=dict)
    macro_weather: Dict[str, Any] = Field(default_factory=dict)
    historical_matches: Dict[str, Any] = Field(default_factory=dict)
    cross_asset_context: Dict[str, Any] = Field(default_factory=dict)
    
    risk: Dict[str, Any] = Field(default_factory=dict)
    scenario: Dict[str, Any] = Field(default_factory=dict)
    recommendations: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Audit & Provenance
    agent_trace: List[AgentTrace] = Field(default_factory=list)
    evidence: List[EvidenceItem] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    
    # System metadata
    data_quality: Dict[str, str] = Field(default_factory=dict)
    latency: Dict[str, float] = Field(default_factory=dict)

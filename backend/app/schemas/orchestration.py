"""
Orchestration State and Evidence Models — Phase 3C
====================================================
Defines the shared typed state for the LangGraph orchestrator
and the Evidence structure for the audit drawer.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class EvidenceItem(BaseModel):
    """
    A single piece of auditable evidence used by agents.
    """
    id: str
    type: str  # e.g., 'historical_event', 'news', 'weather', 'market', 'macro', 'sentiment', 'risk_calculation', 'recommendation'
    source: str
    timestamp: datetime
    description: str
    data_reference: Optional[Dict[str, Any]] = None
    model_reference: Optional[str] = None
    confidence: Optional[float] = None
    status: str = "valid"


class AgentTrace(BaseModel):
    """
    Audit-friendly trace record for an orchestration node execution.
    """
    node: str
    status: str
    started_at: datetime
    completed_at: datetime
    latency_ms: float
    input_summary: str
    retrieval_count: Optional[int] = None
    sources: List[str] = Field(default_factory=list)
    cache_hit: Optional[bool] = None


class AnalysisState(BaseModel):
    """
    Shared typed state for the LangGraph orchestration workflow.
    Designed so the four future specialist agents can consume/populate it.
    """
    query: str
    
    # Core state blocks
    market_context: Dict[str, Any] = Field(default_factory=dict)
    event_context: Dict[str, Any] = Field(default_factory=dict)
    sentiment: Dict[str, Any] = Field(default_factory=dict)
    macro_weather: Dict[str, Any] = Field(default_factory=dict)
    historical_matches: Dict[str, Any] = Field(default_factory=dict)
    risk: Dict[str, Any] = Field(default_factory=dict)
    scenario: Dict[str, Any] = Field(default_factory=dict)
    recommendations: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Audit & Provenance
    agent_trace: List[AgentTrace] = Field(default_factory=list)
    evidence: List[EvidenceItem] = Field(default_factory=list)
    
    # Workflow metadata
    status: str = "initialized"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    errors: List[str] = Field(default_factory=list)

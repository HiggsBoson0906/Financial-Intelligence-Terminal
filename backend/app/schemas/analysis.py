from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

class AgentResult(BaseModel):
    agent_name: str
    summary: str
    confidence_score: float

class AuditRecord(BaseModel):
    audit_id: str
    run_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    user_query: str
    agents_called: List[str]
    data_sources: List[str]
    model_versions: Dict[str, str]
    retrieved_events: List[str]
    retrieved_documents: List[str]
    risk_calculations: Dict[str, Any]
    predictions: Dict[str, Any]
    recommendations: List[str]
    warnings: List[str]

class AnalysisRunRequest(BaseModel):
    run_id: str
    parameters: Dict[str, Any]

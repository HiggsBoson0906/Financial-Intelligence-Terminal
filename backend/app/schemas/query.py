from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class QueryRequest(BaseModel):
    query: str
    include_risk_metrics: bool = False
    conversation_id: Optional[str] = None
    parent_run_id: Optional[str] = None

class LLMMetadata(BaseModel):
    provider: Optional[str] = None
    model_used: Optional[str] = None
    attempts: int = 0
    fallback_used: bool = False
    status: Optional[str] = None

class SourceLink(BaseModel):
    id: str
    name: str
    category: str
    url: str
    title: Optional[str] = None
    description: Optional[str] = None
    status: str
    provider: Optional[str] = None
    citation: Optional[str] = None

class PortfolioAction(BaseModel):
    available: bool = True
    mode: str = "review"
    target: str = "portfolio"
    execution_enabled: bool = False

class ExecutionStatus(BaseModel):
    mode: str = "simulation"
    executed: bool = False

class ExpectedEffect(BaseModel):
    portfolio_risk_change: float = 0.0
    stress_loss_change: float = 0.0
    description: str = ""

class RecommendationResponse(BaseModel):
    id: str
    type: str = "hedge"
    asset: str
    action: str
    target_weight: Optional[float] = None
    allocation_change: Optional[float] = None
    confidence: float = 0.0
    reason: str = ""
    expected_effect: ExpectedEffect = Field(default_factory=ExpectedEffect)
    assumptions: List[str] = Field(default_factory=list)
    supporting_evidence: List[str] = Field(default_factory=list)
    portfolio_action: PortfolioAction = Field(default_factory=PortfolioAction)
    execution: ExecutionStatus = Field(default_factory=ExecutionStatus)
    data_status: str = "simulated"

class AnswerResponse(BaseModel):
    summary: str = ""
    executive_assessment: str = ""
    key_findings: List[str] = Field(default_factory=list)
    risk_explanation: List[str] = Field(default_factory=list)
    historical_context: List[str] = Field(default_factory=list)
    recommendation_explanations: List[Any] = Field(default_factory=list)
    next_steps: List[str] = Field(default_factory=list)
    what_to_watch: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    
    details: List[str] = Field(default_factory=list)
    key_insights: List[str] = Field(default_factory=list)
    confidence: float = 0.0

class DataQualityResponse(BaseModel):
    overall_status: str = "good"
    sources: Dict[str, str] = Field(default_factory=dict)
    warnings: List[str] = Field(default_factory=list)

class LatencyResponse(BaseModel):
    total_ms: float = 0.0
    agents_ms: float = 0.0
    rag_ms: float = 0.0
    risk_ms: float = 0.0
    llm_ms: float = 0.0

class QueryResponse(BaseModel):
    run_id: str
    status: str
    query: str
    
    answer: AnswerResponse = Field(default_factory=AnswerResponse)
    
    market_context: Dict[str, Any] = Field(default_factory=dict)
    event: Dict[str, Any] = Field(default_factory=dict)
    sentiment: Dict[str, Any] = Field(default_factory=dict)
    macro_weather: Dict[str, Any] = Field(default_factory=dict)
    historical_matches: List[Any] = Field(default_factory=list)
    cross_asset_context: List[Any] = Field(default_factory=list)
    
    risk: Dict[str, Any] = Field(default_factory=dict)
    scenario: Dict[str, Any] = Field(default_factory=dict)
    recommendations: List[RecommendationResponse] = Field(default_factory=list)
    
    agent_trace: List[Any] = Field(default_factory=list)
    evidence: List[Any] = Field(default_factory=list)
    
    data_quality: DataQualityResponse = Field(default_factory=DataQualityResponse)
    latency: LatencyResponse = Field(default_factory=LatencyResponse)
    llm: LLMMetadata = Field(default_factory=LLMMetadata)
    data_sources: List[SourceLink] = Field(default_factory=list)
    web_sources: List[SourceLink] = Field(default_factory=list)

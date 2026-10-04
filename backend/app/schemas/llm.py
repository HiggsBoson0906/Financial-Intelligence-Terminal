from pydantic import BaseModel, Field
from typing import List, Optional

class RecommendationExplanation(BaseModel):
    recommendation_id: str = Field(description="ID of the recommendation being explained (must exist in backend).")
    explanation: str = Field(description="Explanation of what the recommendation means.")
    why_it_matters: str = Field(description="Explanation of why the recommendation addresses the identified risk.")
    expected_effect: str = Field(description="Explanation of the backend-generated expected effect.")
    confidence_interpretation: str = Field(description="Explanation of the supplied analytical confidence (without representing it as probability of success).")
    supporting_evidence: List[str] = Field(description="List of evidence IDs supporting this recommendation (must exist in backend evidence).")

class IntelligenceSynthesis(BaseModel):
    """Structured response schema for LLM intelligence synthesis."""
    summary: str = Field(description="Concise executive summary.")
    executive_assessment: str = Field(description="2-4 sentence analyst-style assessment connecting the event, portfolio exposure, risk, and historical context.", default="")
    key_findings: List[str] = Field(description="Important findings", default_factory=list)
    risk_explanation: List[str] = Field(description="Explanation of backend-generated risk metrics and portfolio exposures driving the risk.", default_factory=list)
    historical_context: List[str] = Field(description="Explanation of the relevance, similarities, and differences of historical analogues.", default_factory=list)
    recommendation_explanations: List[RecommendationExplanation] = Field(description="Explanation attached to each backend recommendation.", default_factory=list)
    next_steps: List[str] = Field(description="Next steps supported by backend analysis (e.g., review simulated recommendation, monitor indicators). No real execution.", default_factory=list)
    what_to_watch: List[str] = Field(description="Indicators or events to monitor based on supplied data.", default_factory=list)
    limitations: List[str] = Field(description="Important limitations or data-quality caveats.", default_factory=list)

    # Legacy fields for backwards compatibility
    details: List[str] = Field(description="Detailed explanation of the findings (legacy)", default_factory=list)
    key_insights: List[str] = Field(description="Key insights derived from the evidence (legacy)", default_factory=list)

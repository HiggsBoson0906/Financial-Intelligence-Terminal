from pydantic import BaseModel

class EvidenceItem(BaseModel):
    source_type: str
    content: str
    relevance_score: float

from pydantic import BaseModel

class QueryRequest(BaseModel):
    query: str
    include_risk_metrics: bool = False

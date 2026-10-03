from fastapi import APIRouter, HTTPException
from app.schemas.query import QueryRequest
from app.schemas.analysis import AgentResult
from app.schemas.common import ErrorResponse

router = APIRouter(prefix="/api/v1/query", tags=["Query"])

@router.post("", response_model=AgentResult, responses={501: {"model": ErrorResponse}}, summary="Natural Language Query")
def submit_query(request: QueryRequest):
    """
    Submit a natural language query for the multi-agent system to answer.
    """
    raise HTTPException(status_code=501, detail="Not Implemented")

from fastapi import APIRouter, HTTPException
from app.schemas.analysis import AnalysisRunRequest, AuditRecord
from app.schemas.common import ErrorResponse
from app.agents.orchestrator import run_analysis as orchestrate

router = APIRouter(prefix="/api/v1/analysis", tags=["Analysis"])

@router.post("/run", summary="Run Analysis")
def run_analysis(request: AnalysisRunRequest):
    """
    Trigger a new comprehensive analysis run by orchestrating multiple agents.
    """
    try:
        # Run orchestrator
        query = request.parameters.get("query", "")
        state = orchestrate(query)
        # Ensure numpy types are converted before returning (fastapi handles dicts well if standard python types)
        # We did this inside orchestrator but just in case we return the raw state directly
        return state
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{run_id}", summary="Get Analysis Results")
def get_analysis_results(run_id: str):
    """
    Retrieve the audit record and results of a previously executed analysis run.
    """
    from app.db.session import SessionLocal
    from app.models.core import AnalysisRun
    
    try:
        with SessionLocal() as db:
            run = db.query(AnalysisRun).filter(AnalysisRun.run_id == run_id).first()
            if run:
                return run.results
        raise HTTPException(status_code=404, detail="Run not found")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

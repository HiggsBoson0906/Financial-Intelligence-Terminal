from fastapi import APIRouter, HTTPException
from app.schemas.market import MarketObservation
from app.schemas.common import ErrorResponse

router = APIRouter(prefix="/api/v1/market", tags=["Market"])

@router.get("/{symbol}", response_model=MarketObservation, responses={501: {"model": ErrorResponse}}, summary="Get Market Data for Symbol")
def get_market_data(symbol: str):
    """
    Retrieve market observation data for a specific financial symbol.
    """
    raise HTTPException(status_code=501, detail="Not Implemented")

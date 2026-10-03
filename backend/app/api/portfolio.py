from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.portfolio import PortfolioSummary, PortfolioPosition
from app.schemas.common import ErrorResponse

router = APIRouter(prefix="/api/v1/portfolio", tags=["Portfolio"])

@router.get("/summary", response_model=PortfolioSummary, responses={501: {"model": ErrorResponse}}, summary="Get Portfolio Summary")
def get_portfolio_summary():
    """
    Retrieve the current summary and overall value of the portfolio.
    """
    raise HTTPException(status_code=501, detail="Not Implemented")

@router.get("/positions", response_model=List[PortfolioPosition], responses={501: {"model": ErrorResponse}}, summary="Get Portfolio Positions")
def get_portfolio_positions():
    """
    Retrieve the list of all open positions in the portfolio.
    """
    raise HTTPException(status_code=501, detail="Not Implemented")

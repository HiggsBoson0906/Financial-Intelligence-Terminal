import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))) # Add root directory

from fastapi import FastAPI
from app.api import health, market, portfolio, risk, query, analysis, events, recommendations, scenario

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Financial Intelligence Terminal API",
    description="API Contracts for the Financial Intelligence Terminal",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "https://piller-street.vercel.app"
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "*"],
)

app.include_router(health.router)
app.include_router(market.router)
app.include_router(portfolio.router)
app.include_router(risk.router)
app.include_router(query.router)
app.include_router(analysis.router)
app.include_router(events.router)
app.include_router(recommendations.router)
app.include_router(scenario.router)

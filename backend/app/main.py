from fastapi import FastAPI
from app.api import health, market, portfolio, risk, query, analysis, events, recommendations

app = FastAPI(
    title="Financial Intelligence Terminal API",
    description="API Contracts for the Financial Intelligence Terminal",
    version="1.0.0"
)

app.include_router(health.router)
app.include_router(market.router)
app.include_router(portfolio.router)
app.include_router(risk.router)
app.include_router(query.router)
app.include_router(analysis.router)
app.include_router(events.router)
app.include_router(recommendations.router)

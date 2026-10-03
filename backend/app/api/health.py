from fastapi import APIRouter
from sqlalchemy import text
from app.db.session import engine
from app.services.redis_service import redis_client

router = APIRouter(tags=["Health"])

@router.get("/health", summary="Health Check")
def health() -> dict:
    checks = {}

    # PostgreSQL connectivity
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        checks["postgres"] = "ok"
    except Exception as e:
        checks["postgres"] = f"error: {e}"

    # pgvector extension
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT 1 FROM pg_extension WHERE extname='vector';")
            )
            row = result.fetchone()
            checks["pgvector"] = "ok" if row else "not_installed"
    except Exception as e:
        checks["pgvector"] = f"error: {e}"

    # Redis connectivity
    try:
        checks["redis"] = "ok" if redis_client.check_health() else "unavailable"
    except Exception as e:
        checks["redis"] = f"error: {e}"

    overall = "ok" if all(v == "ok" for v in checks.values()) else "degraded"
    return {"status": overall, "checks": checks}

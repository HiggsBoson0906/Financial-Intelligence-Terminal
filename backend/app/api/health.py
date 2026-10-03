from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/health", summary="Health Check")
def health() -> dict[str, str]:
    return {"status": "ok"}

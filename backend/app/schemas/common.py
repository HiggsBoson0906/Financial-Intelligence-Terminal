from pydantic import BaseModel, Field
from typing import Optional, Any, Dict
from datetime import datetime

class ErrorDetails(BaseModel):
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None

class ErrorResponse(BaseModel):
    error: ErrorDetails

class BaseResponse(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    request_id: str
    api_version: str = "v1"

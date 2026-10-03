import pytest
import time
from unittest.mock import patch, MagicMock
from app.services.gemini_service import GeminiService
from app.core.config import settings
from google.genai.errors import APIError

class MockResponse:
    def __init__(self, text):
        self.text = text

VALID_JSON = """
{
  "summary": "Valid summary.",
  "details": ["Detail 1"],
  "key_insights": ["Insight 1"]
}
"""

@pytest.fixture
def service():
    # Force mock API key for testing
    old_key = settings.GEMINI_API_KEY
    settings.GEMINI_API_KEY = "test_key"
    svc = GeminiService()
    settings.GEMINI_API_KEY = old_key
    
    # Mock client
    svc.client = MagicMock()
    svc.client.models = MagicMock()
    return svc

def test_first_model_succeeds(service, monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_MODELS", "gemini-3.1-flash-lite,gemini-2.5-flash")
    
    service.client.models.generate_content.return_value = MockResponse(VALID_JSON)
    
    synthesis, latency, status, meta = service.synthesize_analysis("Test query", {})
    
    assert synthesis is not None
    assert synthesis.summary == "Valid summary."
    assert meta["attempts"] == 1
    assert meta["model_used"] == "gemini-3.1-flash-lite"
    assert meta["fallback_used"] is False

def test_first_fails_transient_second_succeeds(service, monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_MODELS", "gemini-3.1-flash-lite,gemini-2.5-flash")
    
    def mock_generate(*args, **kwargs):
        if kwargs.get("model") == "gemini-3.1-flash-lite":
            raise Exception("503 UNAVAILABLE")
        return MockResponse(VALID_JSON)
        
    service.client.models.generate_content.side_effect = mock_generate
    
    synthesis, latency, status, meta = service.synthesize_analysis("Test query", {})
    
    assert synthesis is not None
    assert meta["attempts"] == 2
    assert meta["model_used"] == "gemini-2.5-flash"
    assert meta["fallback_used"] is False

def test_all_models_fail_transient(service, monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_MODELS", "model1,model2")
    
    service.client.models.generate_content.side_effect = Exception("500 INTERNAL SERVER ERROR")
    
    synthesis, latency, status, meta = service.synthesize_analysis("Test query", {})
    
    assert synthesis is None
    assert meta["attempts"] == 2
    assert meta["model_used"] is None
    assert meta["fallback_used"] is True
    assert "500 INTERNAL SERVER ERROR" in status

def test_non_transient_permanent_error(service, monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_MODELS", "model1,model2")
    
    # E.g. invalid API key or malformed request (400)
    service.client.models.generate_content.side_effect = Exception("400 INVALID_ARGUMENT")
    
    synthesis, latency, status, meta = service.synthesize_analysis("Test query", {})
    
    # Should stop at 1 attempt because it's a permanent error
    assert synthesis is None
    assert meta["attempts"] == 1
    assert meta["model_used"] is None
    assert meta["fallback_used"] is True

def test_schema_validation_failure(service, monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_MODELS", "model1,model2")
    
    # Missing required fields
    service.client.models.generate_content.return_value = MockResponse("{}")
    
    synthesis, latency, status, meta = service.synthesize_analysis("Test query", {})
    
    # Schema validation failure is permanent for that response
    assert synthesis is None
    assert meta["attempts"] == 1
    assert meta["model_used"] is None
    assert meta["fallback_used"] is True
    assert "validation failed" in status

import pytest
import time
from unittest.mock import patch, MagicMock
from app.services.groq_service import GroqService
from app.core.config import settings

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
    old_key = getattr(settings, "GROQ_API_KEY", None)
    settings.GROQ_API_KEY = "test_key"
    svc = GroqService()
    settings.GROQ_API_KEY = old_key
    
    # Mock client
    svc.client = MagicMock()
    svc.client.chat = MagicMock()
    svc.client.chat.completions = MagicMock()
    return svc

def test_first_model_succeeds(service, monkeypatch):
    monkeypatch.setattr(settings, "GROQ_MODELS", "openai/gpt-oss-120b,openai/gpt-oss-20b")
    
    mock_chat_response = MagicMock()
    mock_chat_response.choices = [MagicMock()]
    mock_chat_response.choices[0].message.content = VALID_JSON
    service.client.chat.completions.create.return_value = mock_chat_response
    
    synthesis, latency, status, meta = service.synthesize_analysis("Test query", {})
    
    assert synthesis is not None
    assert synthesis.summary == "Valid summary."
    assert meta["attempts"] == 1
    assert meta["model_used"] == "openai/gpt-oss-120b"
    assert meta["fallback_used"] is False

def test_first_fails_transient_second_succeeds(service, monkeypatch):
    monkeypatch.setattr(settings, "GROQ_MODELS", "openai/gpt-oss-120b,openai/gpt-oss-20b")
    
    def mock_generate(*args, **kwargs):
        if kwargs.get("model") == "openai/gpt-oss-120b":
            raise Exception("503 UNAVAILABLE")
        mock_chat_response = MagicMock()
        mock_chat_response.choices = [MagicMock()]
        mock_chat_response.choices[0].message.content = VALID_JSON
        return mock_chat_response
        
    service.client.chat.completions.create.side_effect = mock_generate
    
    synthesis, latency, status, meta = service.synthesize_analysis("Test query", {})
    
    assert synthesis is not None
    assert meta["attempts"] == 2
    assert meta["model_used"] == "openai/gpt-oss-20b"
    assert meta["fallback_used"] is True

def test_all_models_fail_transient(service, monkeypatch):
    monkeypatch.setattr(settings, "GROQ_MODELS", "model1,model2")
    
    service.client.chat.completions.create.side_effect = Exception("500 INTERNAL SERVER ERROR")
    
    synthesis, latency, status, meta = service.synthesize_analysis("Test query", {})
    
    assert synthesis is None
    assert meta["attempts"] == 2
    assert meta["model_used"] is None
    assert meta["fallback_used"] is True
    assert "unavailable" in status

def test_non_transient_permanent_error(service, monkeypatch):
    monkeypatch.setattr(settings, "GROQ_MODELS", "model1,model2")
    
    # E.g. invalid API key or malformed request (400)
    service.client.chat.completions.create.side_effect = Exception("400 INVALID_ARGUMENT")
    
    synthesis, latency, status, meta = service.synthesize_analysis("Test query", {})
    
    # Should stop at 1 attempt because it's a permanent error
    assert synthesis is None
    assert meta["attempts"] == 1
    assert meta["model_used"] is None
    assert meta["fallback_used"] is False

def test_schema_validation_failure(service, monkeypatch):
    monkeypatch.setattr(settings, "GROQ_MODELS", "model1,model2")
    
    # Missing required fields
    mock_chat_response = MagicMock()
    mock_chat_response.choices = [MagicMock()]
    mock_chat_response.choices[0].message.content = "{}"
    service.client.chat.completions.create.return_value = mock_chat_response
    
    synthesis, latency, status, meta = service.synthesize_analysis("Test query", {})
    
    # Schema validation failure is permanent for that response
    assert synthesis is None
    assert meta["attempts"] == 1
    assert meta["model_used"] is None
    assert meta["fallback_used"] is False
    assert "validation failed" in status

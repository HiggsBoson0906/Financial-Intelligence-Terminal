import pytest
from app.services.groq_service import GroqService
from unittest.mock import patch, MagicMock
from app.core.config import settings

def test_groq_grounding_preserves_category(monkeypatch):
    """
    Proves that Groq does not contradict the authoritative event category
    supplied by the backend in its generated output when forced.
    """
    old_key = getattr(settings, "GROQ_API_KEY", None)
    settings.GROQ_API_KEY = "test_key"
    service = GroqService()
    settings.GROQ_API_KEY = old_key
    
    service.client = MagicMock()
    service.client.chat = MagicMock()
    service.client.chat.completions = MagicMock()
    
    # Provide a backend payload that explicitly states Category 4
    analysis_payload = {
        "macro_weather": {
            "weather": {
                "category": 4,
                "severity": "Category 4",
                "region": "gulf",
                "status": "active"
            }
        }
    }
    
    # We mock the internal SDK call
    with patch.object(service.client.chat.completions, 'create') as mock_create:
        from app.schemas.llm import IntelligenceSynthesis
        fake_synth = IntelligenceSynthesis(summary="Test", details=[], key_insights=[])
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = fake_synth.model_dump_json()
        mock_create.return_value = mock_response
        
        service.synthesize_analysis("What is the impact of a Category 3 hurricane?", analysis_payload)
        
        # Verify the prompt passed to the LLM contains the strict grounding rules
        call_args = mock_create.call_args
        assert call_args is not None
        
        messages = call_args.kwargs.get("messages")
        assert messages is not None
        
        system_instruction = messages[0]["content"]
        assert "Only use numbers present in supplied evidence" in system_instruction
        assert "Never modify backend-calculated metrics" in system_instruction

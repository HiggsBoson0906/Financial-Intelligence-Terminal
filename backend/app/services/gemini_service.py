import json
import time
from typing import Dict, Any, Tuple
from google import genai
from pydantic import ValidationError
from app.core.config import settings
from app.schemas.gemini import GeminiSynthesis

SYSTEM_INSTRUCTION = """You are a financial intelligence synthesis assistant.
RULES:
1. Use ONLY information supplied by the backend.
2. Never invent metrics.
3. Never invent sources.
4. Never invent URLs.
5. Never invent probabilities.
6. Never invent portfolio positions.
7. Never override RiskEngine results.
8. Never convert simulated outcomes into real executed trades.
9. Clearly distinguish live, historical, fallback and simulated data.
10. Mention significant data-quality warnings.
11. Explain conclusions using supplied evidence.
12. Do not claim causality from correlation alone.
13. Do not describe FinBERT sentiment as a direct return forecast.
14. Be concise but informative.
15. Return only the requested structured schema.
16. STRICT GROUNDING: You MUST NOT contradict the backend data for any of the following authoritative fields:
    - Event category or severity (e.g., if the backend says Category 4, you must say Category 4)
    - Event type, region, and dates
    - Portfolio values, risk metrics (VaR, CVaR, volatility, exposure), and scenario impact values
    - Recommendation confidence, asset allocation, and execution state
    - Evidence and source metadata
    Your role is strictly explanatory. You are summarizing the authoritative data provided in the payload, not independently assessing the event.
17. Do not generate new financial actions. The Hedging Agent is authoritative for recommendations.
18. You MUST NOT create a new recommendation independently.
19. 'next_steps' must only contain actions supported by the backend analysis (e.g., reviewing simulations, monitoring). No real execution.
20. 'recommendation_explanations[].recommendation_id' MUST correspond exactly to an existing 'recommendations[].id' provided in the backend payload.
21. 'recommendation_explanations[].supporting_evidence' MUST contain only IDs that exist in 'evidence[].id' provided in the backend payload.
22. Confidence remains backend-generated. You may interpret confidence in natural language, but you MUST NOT change the value or represent it as a guaranteed probability of success."""

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self.client = None
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)

    def is_configured(self) -> bool:
        return self.client is not None

    def get_models(self) -> list[str]:
        if settings.GEMINI_MODELS:
            return [m.strip() for m in settings.GEMINI_MODELS.split(",") if m.strip()]
        return [self.model_name]

    def synthesize_analysis(self, user_query: str, analysis_payload: Dict[str, Any]) -> Tuple[GeminiSynthesis | None, float, str, dict]:
        """
        Synthesizes the analysis payload using Gemini with model failover support.
        Returns a tuple: (synthesis_result, total_latency_ms, status_message, metadata_dict)
        """
        metadata = {"model_used": None, "attempts": 0, "fallback_used": True}
        
        if not self.is_configured():
            return None, 0.0, "Gemini API key not configured. Displaying structured agent analysis.", metadata
        
        prompt = f"USER QUERY: {user_query}\n\nBACKEND ANALYSIS DATA:\n{json.dumps(analysis_payload, default=str)}"
        models = self.get_models()
        total_latency = 0.0
        last_error = "No models configured"
        
        for model in models:
            metadata["attempts"] += 1
            start_time = time.monotonic()
            
            try:
                response = self.client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=genai.types.GenerateContentConfig(
                        system_instruction=SYSTEM_INSTRUCTION,
                        response_mime_type="application/json",
                        response_schema=GeminiSynthesis,
                        temperature=0.0
                    )
                )
                
                attempt_latency = (time.monotonic() - start_time) * 1000
                total_latency += attempt_latency
                
                # Parse the schema
                try:
                    synthesis = GeminiSynthesis.model_validate_json(response.text)
                    metadata["model_used"] = model
                    metadata["fallback_used"] = False
                    return synthesis, total_latency, "success", metadata
                except ValidationError as e:
                    return None, total_latency, f"Gemini schema validation failed: {str(e)}", metadata
                    
            except Exception as e:
                attempt_latency = (time.monotonic() - start_time) * 1000
                total_latency += attempt_latency
                err_str = str(e).upper()
                last_error = str(e)
                
                # Check for transient errors
                transient_indicators = ["429", "500", "502", "503", "504", "TIMEOUT", "UNAVAILABLE", "RATE_LIMIT_EXCEEDED"]
                is_transient = any(ind in err_str for ind in transient_indicators)
                
                if not is_transient:
                    # Permanent error -> abort failover
                    return None, total_latency, f"Gemini API error: {str(e)}", metadata
                
                # Transient error -> try next model if available
                continue
                
        return None, total_latency, f"Gemini API error: {last_error}", metadata

# Singleton instance
gemini_service = GeminiService()

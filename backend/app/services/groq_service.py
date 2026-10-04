import json
import time
from typing import Dict, Any, Tuple
from groq import Groq
from pydantic import ValidationError
from app.core.config import settings
from app.schemas.llm import IntelligenceSynthesis

SYSTEM_INSTRUCTION = """You are the final intelligence synthesis layer for a quantitative financial intelligence terminal.
You receive authoritative structured evidence from backend agents.
Rules:
1. Never invent financial numbers.
2. Never invent sources.
3. Never invent historical events.
4. Never modify backend-calculated metrics.
5. Never treat your own reasoning as quantitative ground truth.
6. Only use numbers present in supplied evidence.
7. Distinguish historical analogue from current scenario.
8. Distinguish synthetic demo portfolio from real user holdings.
9. Recommendations are simulations, not executed trades.
10. When evidence is missing, say so explicitly.
11. Explain WHY the evidence supports the conclusion.
12. Cite evidence IDs/source references supplied by backend.
13. Do not create fake URLs.
14. Return ONLY a valid JSON object matching the requested schema.

The output should read like a professional financial intelligence brief, not a generic chatbot response.

You MUST format your output EXACTLY as the following JSON object schema. Do not add any extra fields. If you do not have enough data for a field, provide an empty array `[]` or empty string `""` depending on the type.

SCHEMA:
{
  "summary": "string (Concise executive summary)",
  "executive_assessment": "string (2-4 sentence analyst-style assessment)",
  "key_findings": ["string", "string"],
  "risk_explanation": ["string"],
  "historical_context": ["string"],
  "recommendation_explanations": [
    {
      "recommendation_id": "string",
      "explanation": "string",
      "why_it_matters": "string",
      "expected_effect": "string",
      "confidence_interpretation": "string",
      "supporting_evidence": ["string"]
    }
  ],
  "next_steps": ["string"],
  "what_to_watch": ["string"],
  "limitations": ["string"],
  "details": ["string"],
  "key_insights": ["string"]
}
"""

class GroqService:
    def __init__(self):
        self.api_key = getattr(settings, "GROQ_API_KEY", None)
        self.model_name = getattr(settings, "GROQ_MODEL", "openai/gpt-oss-120b")
        self.client = None
        if self.api_key:
            self.client = Groq(api_key=self.api_key)

    def is_configured(self) -> bool:
        return self.client is not None

    def get_models(self) -> list[str]:
        models_str = getattr(settings, "GROQ_MODELS", None)
        if models_str:
            return [m.strip() for m in models_str.split(",") if m.strip()]
        return [self.model_name]

    def synthesize_analysis(self, user_query: str, analysis_payload: Dict[str, Any]) -> Tuple[IntelligenceSynthesis | None, float, str, dict]:
        """
        Synthesizes the analysis payload using Groq with model failover support.
        Returns a tuple: (synthesis_result, total_latency_ms, status_message, metadata_dict)
        """
        metadata = {"provider": "groq", "provider_name": "Groq", "model_used": None, "attempts": 0, "fallback_used": False, "status": None}
        
        if not self.is_configured():
            metadata["status"] = "unconfigured"
            return None, 0.0, "Groq synthesis unavailable; displaying structured agent analysis.", metadata
        
        import copy
        pruned_payload = copy.deepcopy(analysis_payload)
        
        # Aggressive truncation for Groq's 8K TPM limit on free tier
        if "sentiment" in pruned_payload and "articles" in pruned_payload["sentiment"]:
            # Keep only the titles and summary of sentiment, drop full article texts
            for article in pruned_payload["sentiment"].get("articles", []):
                article.pop("content", None)
                article.pop("description", None)
                
        if "historical_matches" in pruned_payload:
            # Keep only top 2 historical matches
            pruned_payload["historical_matches"] = pruned_payload["historical_matches"][:2]
            for match in pruned_payload["historical_matches"]:
                # Drop massive summary fields in historical matches if they exist
                if isinstance(match, dict) and "details" in match:
                    match.pop("details", None)
                    
        if "recommendations" in pruned_payload:
            # Keep only top 2 recommendations
            pruned_payload["recommendations"] = pruned_payload["recommendations"][:2]
            
        if "cross_asset_context" in pruned_payload:
            # Drop long descriptions
            ctx = pruned_payload["cross_asset_context"]
            if isinstance(ctx, dict):
                assets = ctx.get("assets", [])
            elif isinstance(ctx, list):
                assets = ctx
            else:
                assets = []
                
            for asset in assets:
                if isinstance(asset, dict):
                    asset.pop("description", None)
        
        if "evidence" in pruned_payload:
            for ev in pruned_payload["evidence"]:
                if isinstance(ev, dict):
                    ev.pop("data_reference", None)
                    
        payload_str = json.dumps(pruned_payload, default=str)
        # If still too long, do a brutal string truncation
        if len(payload_str) > 10000:  # Roughly 2500 tokens
            payload_str = payload_str[:10000] + "... [TRUNCATED]"
            
        prompt = f"USER QUERY: {user_query}\n\nBACKEND ANALYSIS DATA:\n{payload_str}"
        models = self.get_models()
        total_latency = 0.0
        last_error = "No models configured"
        
        for model in models:
            metadata["attempts"] += 1
            start_time = time.monotonic()
            
            try:
                # Groq Responses API (official SDK)
                chat_completion = self.client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": SYSTEM_INSTRUCTION},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.0,
                    response_format={"type": "json_object"}
                )
                
                attempt_latency = (time.monotonic() - start_time) * 1000
                total_latency += attempt_latency
                
                # Check for output
                message_text = chat_completion.choices[0].message.content

                # Parse the schema
                try:
                    parsed_json = json.loads(message_text)
                    
                    # Fix common Groq schema hallucinations where single-item lists become strings
                    list_fields = ["key_findings", "risk_explanation", "historical_context", "next_steps", "what_to_watch", "limitations", "details", "key_insights"]
                    for f in list_fields:
                        if f in parsed_json and isinstance(parsed_json[f], str):
                            parsed_json[f] = [parsed_json[f]]
                            
                    synthesis = IntelligenceSynthesis.model_validate(parsed_json)
                    metadata["model_used"] = model
                    metadata["fallback_used"] = metadata["attempts"] > 1
                    metadata["status"] = "success"
                    return synthesis, total_latency, "success", metadata
                except ValidationError as e:
                    metadata["fallback_used"] = metadata["attempts"] > 1
                    metadata["status"] = "validation_failed"
                    return None, total_latency, f"Groq schema validation failed: {str(e)}", metadata
                    
            except Exception as e:
                attempt_latency = (time.monotonic() - start_time) * 1000
                total_latency += attempt_latency
                err_str = str(e).lower()
                last_error = str(e)
                
                # Check for transient errors
                transient_indicators = ["429", "500", "502", "503", "504", "timeout", "unavailable", "rate_limit_exceeded"]
                is_transient = any(ind in err_str for ind in transient_indicators)
                
                if "401" in err_str:
                    metadata["fallback_used"] = metadata["attempts"] > 1
                    metadata["status"] = "error"
                    return None, total_latency, "Groq authentication failure. Please check your API key.", metadata
                elif "403" in err_str:
                    metadata["fallback_used"] = metadata["attempts"] > 1
                    metadata["status"] = "error"
                    return None, total_latency, "Groq access failure. Please check your API key permissions.", metadata
                
                if not is_transient:
                    print(f"GROQ PERMANENT ERROR: {err_str}")
                    # Permanent error -> abort failover
                    metadata["fallback_used"] = metadata["attempts"] > 1
                    metadata["status"] = "error"
                    return None, total_latency, f"Groq API error: {str(e)}", metadata
                
                print(f"GROQ TRANSIENT ERROR: {err_str}")
                # Transient error -> try next model if available
                continue
                
        metadata["fallback_used"] = metadata["attempts"] > 1
        metadata["status"] = "degraded"
        return None, total_latency, f"Groq synthesis unavailable; displaying structured agent analysis.", metadata

    def generate_follow_up(self, user_query: str, parent_analysis: Dict[str, Any]) -> str:
        """
        Generate a follow-up answer using the parent context.
        """
        if not self.is_configured():
            return "Groq is not configured. Follow-up answers are unavailable."
            
        import json
        context_str = json.dumps(parent_analysis, default=str)
        if len(context_str) > 10000:
            context_str = context_str[:10000] + "... [TRUNCATED]"
            
        system_prompt = (
            "You are a financial intelligence assistant.\n"
            "Answer the user's follow-up question based on the provided analysis context.\n"
            "Use the supplied parent evidence, do not invent metrics, do not contradict RiskEngine.\n"
            "Respond concisely."
        )
        
        prompt = f"User asks a follow-up question: '{user_query}'. Here is the context of the current analysis:\n{context_str}\n\nRespond concisely as Groq."
        
        models = self.get_models()
        for model in models:
            try:
                chat_completion = self.client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    max_tokens=500
                )
                return chat_completion.choices[0].message.content
            except Exception as e:
                # transient check if needed, but for simplicity try next model
                continue
                
        return "Failed to generate follow-up response from Groq."

# Singleton instance
groq_service = GroqService()

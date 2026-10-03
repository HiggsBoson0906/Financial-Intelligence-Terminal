from typing import Dict, Any, List
from app.schemas.orchestration import AnalysisState, EvidenceItem

class ConfidenceService:
    @staticmethod
    def calculate_system_confidence(state: AnalysisState) -> Dict[str, Any]:
        """
        Calculates a deterministic backend confidence score based on available evidence,
        data completeness, historical analogues, and data statuses.
        """
        score = 0.0
        factors = {}
        
        # 1. Evidence Strength
        evidence = state.evidence
        if not evidence:
            factors["evidence_strength"] = 0.0
        else:
            live_count = sum(1 for e in evidence if e.data_status == "live")
            hist_count = sum(1 for e in evidence if e.data_status == "historical")
            sim_count = sum(1 for e in evidence if e.data_status == "simulated")
            
            # Simple heuristic: live and historical are strong signals
            ev_score = min(1.0, (live_count * 0.15) + (hist_count * 0.1) + (sim_count * 0.05))
            factors["evidence_strength"] = ev_score
            
        # 2. Historical Match Strength
        matches = state.historical_matches.get("matches", [])
        if matches:
            top_similarity = matches[0].get("similarity", 0.0)
            factors["historical_match_strength"] = float(top_similarity)
        else:
            factors["historical_match_strength"] = 0.0
            
        # 3. Data Completeness & Quality
        completeness = 1.0
        warnings = []
        if state.market_context.get("status") in ("unavailable", "missing", "fallback"):
            completeness -= 0.2
            warnings.append("Market data incomplete or missing.")
        if state.macro_weather.get("status") in ("unavailable", "missing", "fallback"):
            completeness -= 0.15
            warnings.append("Macro/weather data incomplete or using fallback.")
            
        # Add state warnings
        warnings.extend(state.warnings)
        
        factors["data_completeness"] = max(0.0, completeness)
        
        # Calculate overall score (weighted average)
        score = (
            factors.get("evidence_strength", 0.0) * 0.4 +
            factors.get("historical_match_strength", 0.0) * 0.4 +
            factors.get("data_completeness", 0.0) * 0.2
        )
        
        label = "low"
        if score > 0.75:
            label = "high"
        elif score > 0.4:
            label = "moderate"
            
        # Build scenario confidence if missing
        if "confidence" not in state.scenario and state.scenario:
            state.scenario["confidence"] = factors.get("historical_match_strength", 0.0)
            
        return {
            "score": round(score, 4),
            "label": label,
            "method": "deterministic_evidence_and_data_quality",
            "factors": {k: round(v, 4) for k, v in factors.items()},
            "warnings": warnings
        }

    @staticmethod
    def link_evidence(state: AnalysisState):
        """
        Links existing evidence items to scenarios and recommendations if not already linked.
        """
        # Collect evidence IDs based on type
        hist_ids = [e.id for e in state.evidence if e.type == "historical_event"]
        market_ids = [e.id for e in state.evidence if e.type in ("market", "sentiment", "macro", "weather")]
        
        if state.scenario and "supporting_evidence" not in state.scenario:
            state.scenario["supporting_evidence"] = hist_ids + market_ids
            
        for rec in state.recommendations:
            if "supporting_evidence" not in rec:
                # Recommendations depend on risk and scenario, so we can link them
                risk_ids = [e.id for e in state.evidence if e.type == "risk_calculation"]
                scen_ids = [e.id for e in state.evidence if e.type == "scenario"]
                rec["supporting_evidence"] = risk_ids + scen_ids + hist_ids
                
            # Add recommendation-specific analytical confidence
            # Base it heavily on scenario confidence if available, adjusted by evidence
            scen_conf = state.scenario.get("confidence", 0.0) if state.scenario else 0.0
            rec_conf = min(0.95, (scen_conf * 0.7) + (len(rec["supporting_evidence"]) * 0.05))
            if not rec.get("confidence"):
                rec["confidence"] = round(rec_conf, 4)
                
            # Populate portfolio review fields
            if "portfolio_action" not in rec:
                rec["portfolio_action"] = {
                    "available": True,
                    "mode": "review",
                    "target": "portfolio",
                    "execution_enabled": False
                }
            if "execution" not in rec:
                rec["execution"] = {
                    "mode": "simulation",
                    "executed": False
                }
                
confidence_service = ConfidenceService()

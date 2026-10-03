"""
Sentiment Agent — Phase 4
=========================
Consumes NewsDataProvider, executes FinBERT sentiment service,
and aggregates event-level sentiment.
"""

import time
from datetime import datetime, timezone
import json

from app.schemas.orchestration import AnalysisState, AgentTrace, EvidenceItem
from app.services.sentiment_service import SentimentService
from app.services.redis_service import redis_client

_sentiment_service = None

def get_sentiment_service():
    global _sentiment_service
    if _sentiment_service is None:
        _sentiment_service = SentimentService()
    return _sentiment_service

# Mock News Provider since we lack live keys
def get_mock_news(query: str, event_type: str = None):
    # Dummy logic to simulate news retrieval
    if not query or not query.strip():
        return []
        
    return [
        {
            "id": "news_1",
            "title": f"Concerns grow as {event_type or 'storm'} approaches.",
            "content": "Energy markets are reacting negatively due to potential supply disruptions.",
            "source": "MockFinancialNews"
        },
        {
            "id": "news_2",
            "title": f"Refineries prepare for {event_type or 'weather'}.",
            "content": "Companies are shutting down facilities. Uncertainty is high.",
            "source": "MockEnergyDaily"
        }
    ]


def node_sentiment_agent(state: AnalysisState) -> AnalysisState:
    if state.status == "error":
        return state
        
    start_time = time.time()
    
    query = state.query
    event_type = state.user_intent.get("event_type")
    
    # Try Cache
    cache_key = f"sentiment:{hash(query)}"
    cached_data = None
    try:
        raw = redis_client.get(cache_key)
        if raw:
            cached_data = json.loads(raw)
    except:
        pass
        
    if cached_data:
        state.sentiment = cached_data
        state.agent_trace.append(
            AgentTrace(
                node="sentiment_agent",
                agent="sentiment",
                status="completed",
                started_at=datetime.fromtimestamp(start_time, tz=timezone.utc),
                completed_at=datetime.now(timezone.utc),
                latency_ms=round((time.time() - start_time) * 1000, 2),
                inputs_used=["query"],
                outputs_generated=["sentiment"],
                sources=["Redis Cache"],
                cache_hit=True
            )
        )
        return state

    news = get_mock_news(query, event_type)
    
    if not news:
        state.sentiment = {
            "overall_sentiment": "neutral",
            "positive": 0.0,
            "negative": 0.0,
            "neutral": 0.0,
            "article_count": 0,
            "articles": [],
            "model": "ProsusAI/finbert",
            "status": "missing",
            "evidence": []
        }
    else:
        articles_formatted = [{"text": n["content"], "date": None} for n in news]
        try:
            svc = get_sentiment_service()
            results_df = svc.analyze_articles(articles_formatted)
            results = results_df.to_dict('records')
            
            # Aggregate
            pos = sum(r["positive"] for r in results) / len(results)
            neg = sum(r["negative"] for r in results) / len(results)
            neu = sum(r["neutral"] for r in results) / len(results)
            
            overall = "neutral"
            if pos > neg and pos > neu:
                overall = "positive"
            elif neg > pos and neg > neu:
                overall = "negative"
                
            state.sentiment = {
                "overall_sentiment": overall,
                "positive": round(pos, 4),
                "negative": round(neg, 4),
                "neutral": round(neu, 4),
                "article_count": len(news),
                "articles": news,
                "model": "ProsusAI/finbert",
                "status": "fallback", # Using mock data
            }
            
            # Generate Evidence
            for idx, article in enumerate(news):
                ev = EvidenceItem(
                    id=f"sent_{article['id']}",
                    type="sentiment",
                    data_status="fallback",
                    source=article['source'],
                    timestamp=datetime.now(timezone.utc),
                    description=f"Analyzed article: {article['title']}",
                    data_reference={"sentiment": results[idx]},
                    model_reference="ProsusAI/finbert"
                )
                state.evidence.append(ev)
                
            try:
                redis_client.set(cache_key, json.dumps(state.sentiment), ttl_seconds=300)
            except:
                pass
                
        except Exception as e:
            state.warnings.append(f"FinBERT failed: {e}")
            state.sentiment = {"status": "unavailable"}
            
    state.agent_trace.append(
        AgentTrace(
            node="sentiment_agent",
            agent="sentiment",
            status="completed" if state.sentiment.get("status") != "unavailable" else "error",
            started_at=datetime.fromtimestamp(start_time, tz=timezone.utc),
            completed_at=datetime.now(timezone.utc),
            latency_ms=round((time.time() - start_time) * 1000, 2),
            inputs_used=["query"],
            outputs_generated=["sentiment"],
            sources=["MockFinancialNews", "ProsusAI/finbert"],
            cache_hit=False
        )
    )
    
    return state

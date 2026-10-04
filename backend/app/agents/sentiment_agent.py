"""
Sentiment Agent — Phase 4
=========================
Consumes NewsDataProvider, executes FinBERT sentiment service,
and aggregates event-level sentiment.
"""

import time
import logging
from datetime import datetime, timezone
import json

from app.schemas.orchestration import AnalysisState, AgentTrace, EvidenceItem
from app.services.sentiment_service import SentimentService
from app.services.redis_service import redis_client
from app.services.news_service import news_service

logger = logging.getLogger(__name__)

_sentiment_service = None

def get_sentiment_service():
    global _sentiment_service
    if _sentiment_service is None:
        logger.info("[SentimentAgent] Loading FinBERT model instance...")
        _sentiment_service = SentimentService()
    return _sentiment_service


def node_sentiment_agent(state: AnalysisState) -> AnalysisState:
    if state.status == "error":
        return state
        
    start_time = time.time()
    
    query = state.query
    event_type = state.user_intent.get("event_type")
    
    # Try Cache (only accept valid cached data with articles)
    cache_key = f"sentiment:{hash(query)}"
    cached_data = None
    try:
        raw = redis_client.get(cache_key)
        if raw:
            if isinstance(raw, dict):
                cached_data = raw
            else:
                cached_data = json.loads(raw)
    except Exception as e:
        logger.debug(f"[SentimentAgent] Redis cache read error: {e}")
        
    if cached_data and cached_data.get("article_count", 0) > 0 and cached_data.get("status") in ["live", "curated"]:
        logger.info(f"[SentimentAgent] Cache hit for query '{query}': {cached_data.get('article_count')} articles.")
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
                sources=["Redis Cache", "ProsusAI/finbert"],
                cache_hit=True
            )
        )
        return state

    # Step 1: Fetch news articles
    news = news_service.get_real_news(query, event_type)
    logger.info(f"[SentimentAgent] Number of articles fetched: {len(news) if news else 0}")
    
    if not news:
        logger.warning(f"[SentimentAgent] External and curated news sources returned 0 articles for '{query}'. Marking sentiment as unavailable.")
        state.sentiment = {
            "overall_sentiment": None,
            "positive": None,
            "negative": None,
            "neutral": None,
            "article_count": 0,
            "articles": [],
            "model": "ProsusAI/finbert",
            "status": "unavailable",
            "evidence": [],
            "metrics": {
                "sources_analyzed": 0,
                "articles_analyzed": 0
            }
        }
    else:
        # Step 2: Format and pass to FinBERT
        articles_formatted = [{"text": n["content"], "date": n.get("published_at")} for n in news]
        logger.info(f"[SentimentAgent] Number passed to FinBERT: {len(articles_formatted)}")
        
        try:
            svc = get_sentiment_service()
            logger.info("[SentimentAgent] Invoking FinBERT inference...")
            results_df = svc.analyze_articles(articles_formatted)
            results = results_df.to_dict('records')
            
            valid_results = []
            for i, r in enumerate(results):
                pos = r.get("positive")
                neg = r.get("negative")
                neu = r.get("neutral")
                if pos is not None and neg is not None and neu is not None:
                    valid_results.append(r)
                    # Classify individual article for frontend MarketView
                    label = "NEUTRAL"
                    if pos > neg and pos > neu:
                        label = "BULLISH"
                    elif neg > pos and neg > neu:
                        label = "BEARISH"
                    news[i]["sentiment"] = label
                    news[i]["sentiment_score"] = round(pos - neg, 4)
                    news[i]["scores"] = {
                        "positive": round(pos, 4),
                        "negative": round(neg, 4),
                        "neutral": round(neu, 4)
                    }
            
            if not valid_results:
                logger.warning("[SentimentAgent] FinBERT produced 0 valid scores. Marking sentiment as unavailable.")
                state.sentiment = {
                    "overall_sentiment": None,
                    "positive": None,
                    "negative": None,
                    "neutral": None,
                    "article_count": 0,
                    "articles": news,
                    "model": "ProsusAI/finbert",
                    "status": "unavailable",
                    "metrics": {
                        "sources_analyzed": len(set(n.get("source", "Unknown") for n in news)),
                        "articles_analyzed": 0
                    }
                }
            else:
                # Step 3: Compute aggregate sentiment counts
                pos_avg = sum(r["positive"] for r in valid_results) / len(valid_results)
                neg_avg = sum(r["negative"] for r in valid_results) / len(valid_results)
                neu_avg = sum(r["neutral"] for r in valid_results) / len(valid_results)
                
                overall = "neutral"
                if pos_avg > neg_avg and pos_avg > neu_avg:
                    overall = "positive"
                elif neg_avg > pos_avg and neg_avg > neu_avg:
                    overall = "negative"
                    
                is_live = any(n.get("data_status") == "live" or n.get("source") != "Bloomberg" for n in news)
                status = "live" if is_live else "curated"
                
                logger.info(
                    f"[SentimentAgent] Sentiment counts: valid_articles={len(valid_results)}, "
                    f"pos={pos_avg:.4f}, neg={neg_avg:.4f}, neu={neu_avg:.4f}, overall={overall}"
                )
                
                # Step 4: Write final sentiment output to graph state
                state.sentiment = {
                    "overall_sentiment": overall,
                    "positive": round(pos_avg, 4),
                    "negative": round(neg_avg, 4),
                    "neutral": round(neu_avg, 4),
                    "article_count": len(valid_results),
                    "articles": news,
                    "model": "ProsusAI/finbert",
                    "status": status,
                    "metrics": {
                        "sources_analyzed": len(set(n.get("source", "Bloomberg") for n in news)),
                        "articles_analyzed": len(valid_results)
                    }
                }
                logger.info(f"[SentimentAgent] Final sentiment output written to graph state: {state.sentiment['overall_sentiment']} (pos: {state.sentiment['positive']}, neg: {state.sentiment['negative']}, neu: {state.sentiment['neutral']})")
                
                # Step 5: Generate Evidence items
                for idx, article in enumerate(news):
                    ev = EvidenceItem(
                        id=f"sent_{article.get('id', idx)}",
                        type="sentiment",
                        data_status="live" if is_live else "curated",
                        source=article.get('source', 'Bloomberg'),
                        timestamp=datetime.now(timezone.utc),
                        description=f"FinBERT Sentiment: {article.get('title', '')}",
                        data_reference={"sentiment": results[idx] if idx < len(results) else {}},
                        model_reference="ProsusAI/finbert"
                    )
                    state.evidence.append(ev)
                    
                # Cache valid result in Redis
                try:
                    redis_client.set(cache_key, json.dumps(state.sentiment), ttl_seconds=300)
                except Exception as cache_err:
                    logger.debug(f"[SentimentAgent] Redis set failed: {cache_err}")
                    
        except Exception as e:
            logger.error(f"[SentimentAgent] FinBERT execution failed: {e}", exc_info=True)
            state.warnings.append(f"FinBERT failed: {e}")
            state.sentiment = {
                "overall_sentiment": None,
                "positive": None,
                "negative": None,
                "neutral": None,
                "article_count": 0,
                "articles": [],
                "model": "ProsusAI/finbert",
                "status": "unavailable"
            }
            
    trace_sources = list(set([n.get("source", "Bloomberg") for n in news] if news else ["None"]) | {"ProsusAI/finbert"})
    state.agent_trace.append(
        AgentTrace(
            node="sentiment_agent",
            agent="sentiment",
            status="completed" if state.sentiment.get("status") in ["live", "curated"] else "error",
            started_at=datetime.fromtimestamp(start_time, tz=timezone.utc),
            completed_at=datetime.now(timezone.utc),
            latency_ms=round((time.time() - start_time) * 1000, 2),
            inputs_used=["query"],
            outputs_generated=["sentiment"],
            sources=trace_sources,
            cache_hit=False
        )
    )
    
    return state

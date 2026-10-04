import requests
import logging
import urllib.parse
from datetime import datetime, timezone
from typing import List, Dict, Optional

try:
    from app.data.curated_news import CURATED_NEWS
except ImportError:
    CURATED_NEWS = []

logger = logging.getLogger(__name__)

class NewsService:
    def get_real_news(self, query: str, event_type: str = None) -> List[Dict]:
        """
        Uses GDELT API to fetch real global news articles for the given query.
        Falls back to curated real financial news if GDELT fails or rate-limits.
        """
        if not query or not query.strip():
            logger.info("[NewsService] Empty query received; returning 0 articles.")
            return []
            
        search_terms = []
        if event_type:
            search_terms.append(event_type)
            
        # extract some keywords from the query or just use the query
        keywords = query.split()
        key_phrases = [k for k in keywords if len(k) > 4 and k.lower() not in ("what", "about", "which", "where", "impact", "affect", "portfolio")][:2]
        if key_phrases:
            search_terms.extend(key_phrases)
            
        search_q = " ".join(search_terms) if search_terms else query
        logger.info(f"[NewsService] Fetching news for query='{query}' -> search_q='{search_q}'")
        
        # 1. Attempt GDELT external news fetch
        try:
            url = f"https://api.gdeltproject.org/api/v2/doc/doc?query={urllib.parse.quote(search_q)}&mode=artlist&maxrecords=5&format=json"
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json"
            }
            res = requests.get(url, headers=headers, timeout=5)
            
            if res.status_code == 200:
                try:
                    data = res.json()
                except Exception as json_err:
                    logger.warning(f"[NewsService] GDELT response was not valid JSON: {json_err}")
                    data = {}
                    
                articles = data.get("articles", [])
                if articles:
                    formatted_news = []
                    for i, art in enumerate(articles):
                        formatted_news.append({
                            "id": f"gdelt_{i}",
                            "title": art.get("title", "Unknown Title"),
                            "content": f"{art.get('title', '')}. {art.get('seendate', '')}".strip(),
                            "source": art.get("domain", "GDELT"),
                            "url": art.get("url", ""),
                            "published_at": art.get("seendate", ""),
                            "data_status": "live"
                        })
                    logger.info(f"[NewsService] Successfully fetched and normalized {len(formatted_news)} articles from GDELT.")
                    return formatted_news
                else:
                    logger.warning(f"[NewsService] GDELT returned 200 but 0 articles for query '{search_q}'.")
            else:
                logger.warning(f"[NewsService] GDELT returned status {res.status_code} ({res.text[:120].strip()}).")
        except Exception as e:
            logger.warning(f"[NewsService] GDELT external fetch encountered error: {e}")
            
        # 2. Fallback to existing real curated news data
        logger.info(f"[NewsService] Falling back to existing curated financial news ({len(CURATED_NEWS)} articles available).")
        if not CURATED_NEWS:
            logger.warning("[NewsService] Curated news list is empty; returning 0 articles.")
            return []
            
        query_lower = query.lower()
        query_words = set(w.lower() for w in query.split() if len(w) > 3)
        
        matched_articles = []
        for art in CURATED_NEWS:
            corpus = f"{art.get('headline', '')} {art.get('summary', '')} {' '.join(art.get('affected_assets', []))} {art.get('category', '')}".lower()
            if any(w in corpus for w in query_words) or (event_type and event_type.lower() in corpus):
                matched_articles.append(art)
                
        selected = matched_articles if matched_articles else CURATED_NEWS
        
        formatted_news = []
        for art in selected:
            headline = art.get("headline", "")
            summary = art.get("summary", "")
            content = f"{headline}. {summary}".strip()
            formatted_news.append({
                "id": art.get("id", f"news_{len(formatted_news)}"),
                "title": headline,
                "content": content,
                "source": art.get("source", "Bloomberg"),
                "url": art.get("url", ""),
                "published_at": art.get("published_at", ""),
                "category": art.get("category", "Energy"),
                "affected_assets": art.get("affected_assets", []),
                "data_status": "curated"
            })
            
        logger.info(f"[NewsService] Successfully normalized {len(formatted_news)} articles from curated news fallback.")
        return formatted_news

news_service = NewsService()

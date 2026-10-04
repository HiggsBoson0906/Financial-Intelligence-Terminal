import requests
import logging
import urllib.parse
from datetime import datetime, timezone
from typing import List, Dict

try:
    from app.data.curated_news import CURATED_NEWS
except ImportError:
    CURATED_NEWS = []

logger = logging.getLogger(__name__)

class NewsService:
    def get_real_news(self, query: str, event_type: str = None) -> List[Dict]:
        """
        Uses GDELT API to fetch real global news articles for the given query.
        """
        if not query or not query.strip():
            return []
            
        search_terms = []
        if event_type:
            search_terms.append(event_type)
            
        # extract some keywords from the query or just use the query
        keywords = query.split()
        key_phrases = [k for k in keywords if len(k) > 4][:2] # Get a few meaningful words
        if key_phrases:
            search_terms.extend(key_phrases)
            
        search_q = " ".join(search_terms) if search_terms else query
        
        try:
            url = f"https://api.gdeltproject.org/api/v2/doc/doc?query={urllib.parse.quote(search_q)}&mode=artlist&maxrecords=5&format=json"
            res = requests.get(url, timeout=10)
            if res.status_code == 200:
                data = res.json()
                articles = data.get("articles", [])
                
                formatted_news = []
                for i, art in enumerate(articles):
                    formatted_news.append({
                        "id": f"news_{i}",
                        "title": art.get("title", "Unknown Title"),
                        "content": art.get("seendate", "") + " " + art.get("title", ""), # using title as snippet if no snippet
                        "source": art.get("domain", "GDELT"),
                        "url": art.get("url", ""),
                        "published_at": art.get("seendate", "")
                    })
                return formatted_news
        except Exception as e:
            logger.warning(f"Failed to fetch news from GDELT: {e}")
            logger.info("Using curated news fallback.")
            
            formatted_news = []
            for art in CURATED_NEWS:
                formatted_news.append({
                    "id": art.get("id"),
                    "title": art.get("headline"),
                    "content": art.get("published_at", "") + " " + art.get("summary", ""),
                    "source": art.get("source"),
                    "url": art.get("url"),
                    "published_at": art.get("published_at")
                })
            return formatted_news

news_service = NewsService()

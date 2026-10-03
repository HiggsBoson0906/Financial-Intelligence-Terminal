import logging
from typing import Dict, List, Optional
import pandas as pd
try:
    from transformers import pipeline
except ImportError:
    pipeline = None

logger = logging.getLogger(__name__)

class SentimentService:
    """
    Service for extracting financial sentiment using FinBERT.
    Provides methods to analyze news articles associated with events.
    """
    def __init__(self):
        logger.info("Initializing FinBERT Sentiment Service...")
        self.model_name = "ProsusAI/finbert"
        if pipeline is not None:
            # use device=-1 for CPU
            self.pipeline = pipeline("sentiment-analysis", model=self.model_name, device=-1)
        else:
            logger.warning("transformers is not installed, FinBERT will return None.")
            self.pipeline = None
        
    def analyze_text(self, text: str) -> Optional[Dict[str, float]]:
        """
        Analyzes a single piece of text and returns a dictionary of sentiment scores.
        """
        if not text or not isinstance(text, str) or text.strip() == "":
            return None
            
        if self.pipeline is None:
            return None
            
        try:
            # FinBERT outputs labels 'positive', 'negative', 'neutral'
            result = self.pipeline(text[:512])[0] # Truncate loosely to avoid length errors
            # The pipeline usually returns {"label": "positive", "score": 0.9}
            # Since we want all three, ideally we'd use return_all_scores=True,
            # but standard pipeline returns top 1. Let's return_all_scores to get full distrib.
            all_scores = self.pipeline(text[:512], top_k=None)
            
            # Formatting as dict
            scores_dict = {}
            for res in all_scores:
                scores_dict[res['label'].lower()] = res['score']
                
            return {
                "positive": scores_dict.get("positive", 0.0),
                "negative": scores_dict.get("negative", 0.0),
                "neutral": scores_dict.get("neutral", 0.0)
            }
        except Exception as e:
            logger.error(f"FinBERT failed on text snippet: {e}")
            return None
        
    def analyze_articles(self, articles: List[Dict]) -> pd.DataFrame:
        """
        Analyzes a batch of articles and computes sentiment.
        Respects missing data (does not fabricate sentiment).
        
        Args:
            articles (List[Dict]): List of article dictionaries with 'text' and 'date' fields.
            
        Returns:
            pd.DataFrame: DataFrame with sentiment scores.
        """
        results = []
        total = len(articles)
        for i, article in enumerate(articles):
            if i % 5 == 0 or i == total - 1:
                logger.info(f"Processing article {i+1}/{total}...")
                
            text = article.get("text", "")
            status = article.get("status")
            
            # If explicit status is given and it signifies missing data, don't even run sentiment
            if status in ["not_collected", "no_match", "unavailable"]:
                scores = None
            else:
                scores = self.analyze_text(text)
            
            # DO NOT fabricate sentiment for missing articles.
            base_result = {
                "date": article.get("date"),
                "status": status,
            }
            if scores is None:
                base_result.update({
                    "positive": None,
                    "negative": None,
                    "neutral": None
                })
            else:
                base_result.update(scores)
                
            results.append(base_result)
                
        return pd.DataFrame(results)

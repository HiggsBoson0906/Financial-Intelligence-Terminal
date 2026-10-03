import pytest
import pandas as pd
from backend.app.services.sentiment_service import SentimentService

@pytest.fixture
def sentiment_service():
    return SentimentService()

def test_analyze_text_handles_empty(sentiment_service):
    # Should all return None without calling pipeline
    assert sentiment_service.analyze_text("") is None
    assert sentiment_service.analyze_text("    ") is None
    assert sentiment_service.analyze_text(None) is None
    assert sentiment_service.analyze_text(12345) is None

def test_analyze_articles_preserves_status(sentiment_service):
    articles = [
        {"date": "2020-01-01", "text": "Valid text"},
        {"date": "2020-01-02", "text": "", "status": "no_match"},
        {"date": "2020-01-03", "text": None, "status": "not_collected"},
        {"date": "2020-01-04", "text": "Another valid text", "status": "collected"}
    ]
    
    df = sentiment_service.analyze_articles(articles)
    
    assert len(df) == 4
    
    # 2020-01-02 should be no_match and sentiment should be None
    no_match_row = df[df["date"] == "2020-01-02"].iloc[0]
    assert no_match_row["status"] == "no_match"
    assert pd.isna(no_match_row["positive"]) or no_match_row["positive"] is None
    
    # 2020-01-03 should be not_collected and sentiment should be None
    not_collected_row = df[df["date"] == "2020-01-03"].iloc[0]
    assert not_collected_row["status"] == "not_collected"
    assert pd.isna(not_collected_row["positive"]) or not_collected_row["positive"] is None

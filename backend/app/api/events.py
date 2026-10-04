from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.events import HistoricalEvent
from app.schemas.common import ErrorResponse

router = APIRouter(prefix="/api/v1/events", tags=["Events"])

@router.get("", response_model=List[HistoricalEvent], responses={501: {"model": ErrorResponse}}, summary="List Historical Events")
def list_events():
    """
    Retrieve a list of documented historical financial or macroeconomic events.
    """
    raise HTTPException(status_code=501, detail="Not Implemented")

@router.get("/news")
def get_live_news():
    """
    Fetch live energy/macro news via GDELT and score it with FinBERT.
    """
    from app.services.news_service import news_service
    from app.services.sentiment_service import SentimentService
    
    try:
        # Default hackathon query priority
        news = news_service.get_real_news("Energy OR Oil OR Hurricane")
        
        if not news:
            from app.data.curated_news import CURATED_NEWS
            news = CURATED_NEWS
            
        try:
            # Score with FinBERT
            svc = SentimentService()
            articles_formatted = [{"text": n.get("content", n.get("summary", "")), "date": None} for n in news]
            results_df = svc.analyze_articles(articles_formatted)
            results = results_df.to_dict('records')
            
            for i, n in enumerate(news):
                n["sentiment_score"] = results[i]["positive"] - results[i]["negative"]
        except Exception as e:
            import logging
            logging.warning(f"FinBERT scoring failed on news endpoint: {e}")
            for n in news:
                n["sentiment_score"] = 0.0
                
        return {"articles": news}
        
    except Exception as e:
        # Final safety net, return curated news
        from app.data.curated_news import CURATED_NEWS
        return {"articles": CURATED_NEWS, "error": str(e)}

@router.get("/weather")
def get_live_weather():
    """
    Fetch live severe weather alerts from NWS.
    """
    import requests
    try:
        # NWS Active Alerts
        res = requests.get("https://api.weather.gov/alerts/active", headers={"User-Agent": "FIT/1.0"}, timeout=5)
        if res.status_code == 200:
            data = res.json()
            features = data.get("features", [])
            
            # Filter for severe hazards
            severe_alerts = []
            for f in features:
                props = f.get("properties", {})
                severity = props.get("severity")
                if severity in ["Extreme", "Severe"]:
                    severe_alerts.append(props)
                    
            return {"alerts": severe_alerts}
        else:
            raise HTTPException(status_code=503, detail="NWS weather API unavailable.")
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@router.get("/{event_id}", response_model=HistoricalEvent, responses={501: {"model": ErrorResponse}}, summary="Get Event Details")
def get_event(event_id: str):
    """
    Retrieve detailed information and impact summaries for a specific historical event.
    """
    raise HTTPException(status_code=501, detail="Not Implemented")

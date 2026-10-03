import argparse
import json
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional
import requests
import pandas as pd

from .config import NEWS_RAW_DIR, PROVENANCE_DIR, GDELT_DOC_API_URL
from .utils import save_provenance, calculate_checksum, logger

# Representative sample of major hurricanes for focused, event-driven news collection
MAJOR_HURRICANES_SEED = [
    {"name": "Harvey", "year": 2017, "date": "2017-08-25", "category": 4},
    {"name": "Irma", "year": 2017, "date": "2017-09-10", "category": 5},
    {"name": "Maria", "year": 2017, "date": "2017-09-20", "category": 5},
    {"name": "Florence", "year": 2018, "date": "2018-09-14", "category": 4},
    {"name": "Michael", "year": 2018, "date": "2018-10-10", "category": 5},
    {"name": "Dorian", "year": 2019, "date": "2019-09-01", "category": 5},
    {"name": "Laura", "year": 2020, "date": "2020-08-27", "category": 4},
    {"name": "Ida", "year": 2021, "date": "2021-08-29", "category": 4},
    {"name": "Ian", "year": 2022, "date": "2022-09-28", "category": 5},
    {"name": "Idalia", "year": 2023, "date": "2023-08-30", "category": 3},
    {"name": "Beryl", "year": 2024, "date": "2024-07-08", "category": 5},
    {"name": "Helene", "year": 2024, "date": "2024-09-26", "category": 4},
    {"name": "Milton", "year": 2024, "date": "2024-10-09", "category": 5}
]


def query_gdelt_for_event(
    storm_name: str,
    event_date: str,
    days_window: int = 5,
    max_records: int = 30
) -> List[Dict]:
    """
    Queries GDELT DOC 2.0 API for articles surrounding an event date.
    Implements retries, rate-limiting, and error handling.
    """
    dt = datetime.strptime(event_date, "%Y-%m-%d")
    start_dt = dt - timedelta(days=2)
    end_dt = dt + timedelta(days=days_window)
    
    start_str = start_dt.strftime("%Y%m%d%H%M%S")
    end_str = end_dt.strftime("%Y%m%d%H%M%S")
    
    query = f'"Hurricane {storm_name}"'
    params = {
        "query": query,
        "mode": "ArtList",
        "maxrecords": str(max_records),
        "format": "json",
        "startdatetime": start_str,
        "enddatetime": end_str
    }
    
    headers = {"User-Agent": "FinancialTerminal/1.0 (Research)"}
    
    articles = []
    for attempt in range(1, 4):
        try:
            logger.info(f"Querying GDELT for Hurricane {storm_name} ({start_str[:8]} to {end_str[:8]})...")
            res = requests.get(GDELT_DOC_API_URL, params=params, headers=headers, timeout=20)
            if res.status_code == 200:
                try:
                    data = res.json()
                    raw_arts = data.get("articles", [])
                    for a in raw_arts:
                        articles.append({
                            "event_name": storm_name,
                            "event_date": event_date,
                            "title": a.get("title"),
                            "url": a.get("url"),
                            "seendate": a.get("seendate"),
                            "domain": a.get("domain"),
                            "language": a.get("language"),
                            "sourcecountry": a.get("sourcecountry")
                        })
                    logger.info(f"Retrieved {len(raw_arts)} articles for Hurricane {storm_name}")
                    break
                except json.JSONDecodeError:
                    logger.warning(f"GDELT returned non-JSON response for Hurricane {storm_name}.")
                    break
            elif res.status_code == 429:
                logger.warning(f"GDELT rate limited (429). Backing off attempt {attempt}...")
                time.sleep(3.0 * attempt)
            else:
                logger.warning(f"GDELT returned status {res.status_code} for Hurricane {storm_name}")
                break
        except Exception as e:
            logger.warning(f"GDELT request exception for Hurricane {storm_name}: {e}")
            time.sleep(2.0)
            
    return articles


def download_news(
    events: Optional[List[Dict]] = None,
    force: bool = False
) -> Path:
    """
    Collects event-driven news articles for historical hurricanes via GDELT.
    Saves raw json to data/raw/news/gdelt_events_news.json.
    """
    NEWS_RAW_DIR.mkdir(parents=True, exist_ok=True)
    destination = NEWS_RAW_DIR / "gdelt_events_news.json"
    
    if destination.exists() and destination.stat().st_size > 1000 and not force:
        logger.info(f"News file already exists at {destination}. Skipping download (idempotent).")
        checksum = calculate_checksum(destination)
        save_provenance(
            source_name="GDELT_News",
            source_url=GDELT_DOC_API_URL,
            provider="GDELT Project",
            date_range={"start": "2010-01-01", "end": "2025-12-31"},
            parameters={"mode": "ArtList", "scope": "major_hurricanes"},
            local_filename=str(destination.relative_to(destination.parent.parent.parent)),
            output_dir=PROVENANCE_DIR,
            checksum=checksum,
            notes="Event-driven news articles surrounding major hurricanes"
        )
        return destination

    events_to_query = events or MAJOR_HURRICANES_SEED
    all_articles = []
    
    for ev in events_to_query:
        name = ev.get("name")
        date_str = ev.get("date")
        if name and date_str:
            arts = query_gdelt_for_event(name, date_str)
            all_articles.extend(arts)
            time.sleep(1.0)  # Politeness interval to prevent rate-limiting

    # Deduplicate by URL
    seen_urls = set()
    unique_articles = []
    for art in all_articles:
        url = art.get("url")
        if url and url not in seen_urls:
            seen_urls.add(url)
            unique_articles.append(art)

    logger.info(f"Total unique GDELT articles collected: {len(unique_articles)}")
    
    with open(destination, "w", encoding="utf-8") as f:
        json.dump(unique_articles, f, indent=2)
        
    checksum = calculate_checksum(destination)
    save_provenance(
        source_name="GDELT_News",
        source_url=GDELT_DOC_API_URL,
        provider="GDELT Project",
        date_range={"start": "2010-01-01", "end": "2025-12-31"},
        parameters={"mode": "ArtList", "queried_events": len(events_to_query)},
        local_filename=str(destination.relative_to(destination.parent.parent.parent)),
        output_dir=PROVENANCE_DIR,
        checksum=checksum,
        notes="Event-driven news articles surrounding major hurricanes"
    )
    return destination


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download event-driven GDELT news")
    parser.add_argument("--force", action="store_true", help="Force redownload")
    args = parser.parse_args()
    download_news(force=args.force)

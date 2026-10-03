import hashlib
import json
from pathlib import Path
from typing import Dict, List, Optional
import pandas as pd

from .config import NEWS_RAW_DIR, PROCESSED_DIR
from .utils import logger


def generate_news_id(url: str, title: str) -> str:
    """Creates a deterministic hash ID for an article."""
    raw = f"{url or ''}|{title or ''}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]


def normalize_news_data(
    raw_file: Path = NEWS_RAW_DIR / "gdelt_events_news.json",
    events_file: Optional[Path] = PROCESSED_DIR / "historical_events.csv",
    output_dir: Path = PROCESSED_DIR
) -> pd.DataFrame:
    """
    Normalizes GDELT raw news JSON, associates records with event IDs where possible,
    deduplicates, and computes news volume aggregates.
    """
    logger.info("Normalizing event-driven news records...")
    if not raw_file.exists():
        logger.warning(f"Raw news file {raw_file} not found.")
        return pd.DataFrame()

    with open(raw_file, "r", encoding="utf-8") as f:
        try:
            articles = json.load(f)
        except Exception as e:
            logger.error(f"Error loading news json: {e}")
            return pd.DataFrame()

    if not articles:
        logger.warning("No news articles in raw file.")
        return pd.DataFrame()

    # Load events lookup for matching:
    # 1. exact event_id
    # 2. (normalized event_name + event_year)
    # NEVER match on event_name alone!
    exact_id_set = set()
    name_year_map = {}
    if events_file and events_file.exists():
        ev_df = pd.read_csv(events_file)
        for _, r in ev_df.iterrows():
            eid = str(r["event_id"]).strip()
            name = str(r["event_name"]).strip().upper()
            start_date_str = str(r.get("start_date", ""))
            exact_id_set.add(eid)
            if len(start_date_str) >= 4:
                try:
                    year = int(start_date_str[:4])
                    name_year_map[(name, year)] = eid
                except ValueError:
                    pass

    records = []
    seen_urls = set()

    for item in articles:
        url = item.get("url", "").strip()
        title = item.get("title", "").strip()
        if not url or url in seen_urls:
            continue
        seen_urls.add(url)

        event_name = item.get("event_name", "").strip().upper()
        raw_event_id = str(item.get("event_id", "")).strip()

        # Parse publication / seen date
        seen = str(item.get("seendate", ""))
        date_str = None
        if len(seen) >= 8:
            date_str = f"{seen[:4]}-{seen[4:6]}-{seen[6:8]}"
        else:
            date_str = item.get("event_date")

        # Extract event year from event_date or seen date
        event_year = None
        item_ev_date = str(item.get("event_date", ""))
        if len(item_ev_date) >= 4:
            try:
                event_year = int(item_ev_date[:4])
            except ValueError:
                pass
        if event_year is None and len(seen) >= 4:
            try:
                event_year = int(seen[:4])
            except ValueError:
                pass

        # Strict association rule:
        # 1. Exact event_id match
        # 2. (normalized event_name + event_year) fallback
        # NEVER match on event_name alone!
        if raw_event_id and raw_event_id in exact_id_set:
            event_id = raw_event_id
        elif event_name and event_year and (event_name, event_year) in name_year_map:
            event_id = name_year_map[(event_name, event_year)]
        else:
            event_id = f"UNMATCHED_{event_name}_{event_year}" if event_year else f"UNMATCHED_{event_name}"

        records.append({
            "news_id": generate_news_id(url, title),
            "event_id": event_id,
            "event_name": event_name,
            "event_year": event_year,
            "date": date_str,
            "title": title,
            "url": url,
            "domain": item.get("domain", ""),
            "language": item.get("language", "English")
        })

    news_df = pd.DataFrame(records)
    if news_df.empty:
        return pd.DataFrame()

    news_df = news_df.sort_values(["event_name", "date"]).reset_index(drop=True)

    output_dir.mkdir(parents=True, exist_ok=True)
    out_path = output_dir / "normalized_news.csv"
    news_df.to_csv(out_path, index=False)
    logger.info(f"Saved normalized news articles ({len(news_df)} records) to {out_path}")

    # Compute news volume aggregates only for successfully matched events
    matched_news = news_df[~news_df["event_id"].str.startswith("UNMATCHED_")].copy()
    volume_by_event = matched_news.groupby(["event_id", "event_name"]).agg(
        total_news_volume=("news_id", "count"),
        unique_domains=("domain", "nunique"),
        earliest_article=("date", "min"),
        latest_article=("date", "max")
    ).reset_index()

    agg_path = output_dir / "news_volume_by_event.csv"
    volume_by_event.to_csv(agg_path, index=False)
    logger.info(f"Saved news volume by event aggregates to {agg_path}")

    return news_df

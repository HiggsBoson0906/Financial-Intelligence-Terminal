"""
Historical RAG Service — Phase 3B
====================================
Retrieval-Augmented Generation over the historical event
corpus using pgvector cosine similarity.

Flow:
  natural-language query
      → EmbeddingService.embed_text()
      → pgvector <=> cosine distance query on historical_events
      → enrich each match with:
            event_impact_dataset (per-asset reactions)
            normalized_macro.csv (macro context near event date)
            historical_events weather attributes (wind / pressure / category)
            cross-asset correlation over the retrieved set
      → RedisService cache (TTL=300s)
      → return RAGResponse

IMPORTANT:
  - Missing data is represented explicitly (null / "missing" status).
  - No values are invented or imputed.
  - This is a RETRIEVAL service — it does not make causal claims.
"""

from __future__ import annotations

import hashlib
import json
import logging
import time
from datetime import datetime, timezone
from typing import Optional

import numpy as np
import pandas as pd

from app.db.session import engine
from app.services.embedding_service import embed_text, model_info
from app.services.redis_service import redis_client
from app.services.cross_asset_service import (
    get_event_asset_reactions,
    get_cross_asset_relationships,
)

logger = logging.getLogger(__name__)

EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
CACHE_TTL_SECONDS = 300
MACRO_SERIES = ["CPIAUCSL", "DFF", "DHHNGSP", "DGS10", "DCOILWTICO"]
MACRO_SERIES_LABELS = {
    "CPIAUCSL": "CPI",
    "DFF": "Fed Funds Rate",
    "DHHNGSP": "Natural Gas (Henry Hub)",
    "DGS10": "10-Year Treasury Yield",
    "DCOILWTICO": "WTI Crude Oil",
}


# ── lazily-loaded cached data ────────────────────────────────────────────────
_macro_df: Optional[pd.DataFrame] = None
_events_df: Optional[pd.DataFrame] = None


def _get_macro_df() -> pd.DataFrame:
    global _macro_df
    if _macro_df is None:
        _macro_df = pd.read_csv(
            "data/processed/normalized_macro.csv",
            parse_dates=["date"],
        )
    return _macro_df


def _get_events_df() -> pd.DataFrame:
    global _events_df
    if _events_df is None:
        _events_df = pd.read_csv(
            "data/processed/historical_events.csv",
            parse_dates=["start_date", "end_date"],
        )
    return _events_df


# ── cache helpers ────────────────────────────────────────────────────────────

def _cache_key(query: str, top_k: int) -> str:
    payload = f"{query.strip().lower()}|top_k={top_k}"
    digest = hashlib.sha256(payload.encode()).hexdigest()[:20]
    return f"rag:{digest}"


def _from_cache(key: str) -> Optional[dict]:
    try:
        raw = redis_client.get(key)
        if raw is None:
            return None
        if isinstance(raw, dict):
            return raw
        return json.loads(raw)
    except Exception as exc:
        logger.warning(f"[RAG] Cache read error (ignored): {exc}")
        return None


class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if hasattr(obj, 'item'):
            return obj.item()
        return super().default(obj)

def _to_cache(key: str, result: dict) -> None:
    try:
        # Serialize with custom encoder to handle numpy types like int64
        serialized = json.dumps(result, cls=NpEncoder)
        redis_client.set(key, serialized, ttl_seconds=CACHE_TTL_SECONDS)
    except Exception as exc:
        logger.warning(f"[RAG] Cache write error (ignored): {exc}")


# ── macro context builder ────────────────────────────────────────────────────

def _build_macro_context(event_date_str: str) -> dict:
    """
    Return macro values closest to the event date for each tracked series.
    Looks back up to 90 days for daily/monthly series alignment.
    """
    try:
        event_date = pd.to_datetime(event_date_str)
    except Exception:
        return {"status": "missing", "reason": "unparseable event_date"}

    macro_df = _get_macro_df()
    context: dict[str, dict] = {}

    for series_id in MACRO_SERIES:
        series_df = macro_df[macro_df["series_id"] == series_id].copy()
        series_df = series_df[series_df["date"] <= event_date].sort_values("date")

        if series_df.empty:
            context[series_id] = {
                "label": MACRO_SERIES_LABELS.get(series_id, series_id),
                "value": None,
                "date": None,
                "source": "FRED",
                "status": "missing",
            }
            continue

        row = series_df.iloc[-1]
        val = row["value"]
        context[series_id] = {
            "label": MACRO_SERIES_LABELS.get(series_id, series_id),
            "value": float(val) if pd.notna(val) else None,
            "date": str(row["date"].date()),
            "source": str(row.get("source", "FRED")),
            "status": "available" if pd.notna(val) else "missing",
        }

    return context


# ── weather context builder ──────────────────────────────────────────────────

def _build_weather_context(event_id: str) -> dict:
    """
    Return wind/pressure/category information from historical_events.csv.
    No external weather API call — purely from stored dataset attributes.
    """
    events_df = _get_events_df()
    row_df = events_df[events_df["event_id"] == event_id]

    if row_df.empty:
        return {"status": "missing"}

    row = row_df.iloc[0]

    def _safe(val):
        return float(val) if pd.notna(val) else None

    return {
        "max_wind_kt": _safe(row.get("max_wind")),
        "min_pressure_mb": _safe(row.get("min_pressure")),
        "category": int(row["category"]) if pd.notna(row.get("category")) else None,
        "severity": str(row["severity"]) if pd.notna(row.get("severity")) else None,
        "region": str(row["region"]) if pd.notna(row.get("region")) else None,
        "latitude": _safe(row.get("latitude")),
        "longitude": _safe(row.get("longitude")),
        "source": "NOAA / IBTrACS processed dataset",
        "status": "available",
    }


# ── pgvector retrieval ───────────────────────────────────────────────────────

def _pgvector_retrieve(query_vec: np.ndarray, top_k: int) -> list[dict]:
    """
    Run cosine-distance similarity search against historical_events.embedding.
    Returns list of rows with similarity score.
    """
    from sqlalchemy import text

    vec_str = "[" + ",".join(f"{x:.8f}" for x in query_vec.tolist()) + "]"

    sql = text(
        f"""
        SELECT
            event_id,
            event_name,
            event_year,
            event_type,
            metadata_json,
            normalized_summary,
            1 - (embedding <=> CAST(:vec AS vector)) AS similarity
        FROM historical_events
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> CAST(:vec AS vector)
        LIMIT :top_k
        """
    )

    with engine.connect() as conn:
        rows = conn.execute(sql, {"vec": vec_str, "top_k": top_k}).fetchall()

    return [dict(r._mapping) for r in rows]


# ── main retrieval function ──────────────────────────────────────────────────

def retrieve_similar_events(query: str, top_k: int = 5) -> dict:
    """
    Retrieve the top-k most similar historical events for a free-text query.

    Returns a RAGResponse dict (see schema in app/schemas/rag_schema.py).

    Steps:
      1. Check Redis cache
      2. Embed query
      3. pgvector cosine search
      4. Enrich each match (weather, macro, asset reactions)
      5. Compute cross-asset correlations over retrieved set
      6. Write to cache
      7. Return
    """
    t_start = time.time()
    cache_key = _cache_key(query, top_k)
    info = model_info()

    # ── 1. Cache check ────────────────────────────────────────────────────────
    cached = _from_cache(cache_key)
    if cached is not None:
        cached["retrieval_metadata"]["cache_hit"] = True
        cached["retrieval_metadata"]["latency_ms"] = round(
            (time.time() - t_start) * 1000, 2
        )
        logger.info(f"[RAG] Cache HIT  key={cache_key}")
        return cached

    # ── 2. Embed query ────────────────────────────────────────────────────────
    t_embed = time.time()
    query_vec = embed_text(query)
    embed_latency_ms = round((time.time() - t_embed) * 1000, 2)

    # ── 3. pgvector retrieval ─────────────────────────────────────────────────
    t_retrieve = time.time()
    raw_matches = _pgvector_retrieve(query_vec, top_k)
    retrieve_latency_ms = round((time.time() - t_retrieve) * 1000, 2)

    # ── 4. Enrich matches ─────────────────────────────────────────────────────
    t_enrich = time.time()
    matches: list[dict] = []
    retrieved_event_ids: list[str] = []

    for row in raw_matches:
        event_id = row["event_id"]
        retrieved_event_ids.append(event_id)

        # Event context (from metadata_json stored during embedding pipeline)
        meta = {}
        if row.get("metadata_json"):
            try:
                meta = row["metadata_json"] if isinstance(row["metadata_json"], dict) else json.loads(row["metadata_json"])
            except Exception:
                meta = {}

        event_date_str = meta.get("start_date", "")
        weather_ctx = _build_weather_context(event_id)
        macro_ctx = _build_macro_context(event_date_str)
        asset_reactions = get_event_asset_reactions(event_id)

        matches.append(
            {
                "event_id": event_id,
                "event_name": row["event_name"],
                "event_year": row["event_year"],
                "event_type": row["event_type"],
                "similarity": round(float(row["similarity"]), 6),
                "event_context": {
                    "normalized_summary": row.get("normalized_summary"),
                    **meta,
                },
                "weather_context": weather_ctx,
                "macro_context": macro_ctx,
                "asset_reactions": asset_reactions,
                "cross_asset_relationships": [],  # filled after all matches
                "provenance": {
                    "source": "data/processed/historical_events.csv + event_impact_dataset.csv",
                    "retrieval_method": "pgvector_cosine",
                    "embedding_model": info["model_name"],
                    "retrieved_at": datetime.now(timezone.utc).isoformat(),
                },
            }
        )

    # ── 5. Cross-asset correlations over retrieved set ────────────────────────
    cross_asset_rels = get_cross_asset_relationships(retrieved_event_ids)
    for m in matches:
        m["cross_asset_relationships"] = cross_asset_rels

    enrich_latency_ms = round((time.time() - t_enrich) * 1000, 2)
    total_latency_ms = round((time.time() - t_start) * 1000, 2)

    result = {
        "query": query,
        "matches": matches,
        "retrieval_metadata": {
            "top_k": top_k,
            "n_matches": len(matches),
            "embed_latency_ms": embed_latency_ms,
            "retrieve_latency_ms": retrieve_latency_ms,
            "enrich_latency_ms": enrich_latency_ms,
            "total_latency_ms": total_latency_ms,
            "latency_ms": total_latency_ms,
            "cache_hit": False,
            "embedding_model": info["model_name"],
            "embedding_dim": info["embedding_dim"],
        },
    }

    # ── 6. Write to cache ─────────────────────────────────────────────────────
    _to_cache(cache_key, result)
    logger.info(
        f"[RAG] Cache MISS  key={cache_key}  "
        f"embed={embed_latency_ms}ms  retrieve={retrieve_latency_ms}ms  "
        f"enrich={enrich_latency_ms}ms  total={total_latency_ms}ms"
    )

    return result

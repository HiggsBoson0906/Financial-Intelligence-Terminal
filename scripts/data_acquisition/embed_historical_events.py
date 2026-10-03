"""
Historical Event Embedding Pipeline
===================================
Reads data/processed/historical_events.csv, constructs a deterministic
natural-language representation of each event, embeds it using
the EmbeddingService (sentence-transformers all-MiniLM-L6-v2),
and inserts/updates the PostgreSQL pgvector `historical_events` table.

Idempotent: updates existing events safely.
"""

import argparse
import json
import logging
import sys
from datetime import datetime, timezone

import pandas as pd
from sqlalchemy import text
from tqdm import tqdm

from app.core.config import settings
from app.db.session import SessionLocal
from app.services.embedding_service import embed_texts, model_info

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


def build_event_text(row: pd.Series) -> str:
    """
    Deterministic builder for event representation using ONLY existing data.
    """
    name = row.get("event_name", "UNKNOWN")
    etype = row.get("event_type", "UNKNOWN")
    start = row.get("start_date", "")
    
    parts = [f"Event: {name} ({etype})", f"Date: {start}"]
    
    if pd.notna(row.get("region")):
        parts.append(f"Region: {row['region']}")
    if pd.notna(row.get("severity")):
        parts.append(f"Severity: {row['severity']}")
    if pd.notna(row.get("max_wind")):
        parts.append(f"Max Wind: {row['max_wind']} kt")
    if pd.notna(row.get("min_pressure")):
        parts.append(f"Min Pressure: {row['min_pressure']} mb")
        
    return "\n".join(parts)


def run_pipeline() -> None:
    logger.info("Starting historical event embedding pipeline...")
    try:
        df = pd.read_csv("data/processed/historical_events.csv")
    except Exception as e:
        logger.error(f"Failed to read dataset: {e}")
        sys.exit(1)

    total_events = len(df)
    logger.info(f"Loaded {total_events} events from dataset.")

    info = model_info()
    logger.info(f"Model Info: {info}")

    db = SessionLocal()
    try:
        # Create a batched embedding process for efficiency
        batch_size = 32
        success = 0
        failed = 0
        updated = 0
        
        insert_stmt = text("""
            INSERT INTO historical_events (
                event_id, event_name, event_year, event_type, 
                embedding, metadata_json, normalized_summary, created_at
            ) VALUES (
                :id, :name, :year, :type, CAST(:vec AS vector), :meta, :summary, :now
            )
            ON CONFLICT (event_id) DO UPDATE SET
                event_name = EXCLUDED.event_name,
                event_year = EXCLUDED.event_year,
                event_type = EXCLUDED.event_type,
                embedding = EXCLUDED.embedding,
                metadata_json = EXCLUDED.metadata_json,
                normalized_summary = EXCLUDED.normalized_summary,
                created_at = EXCLUDED.created_at
        """)

        for start_idx in tqdm(range(0, total_events, batch_size), desc="Embedding Batches"):
            batch_df = df.iloc[start_idx:start_idx + batch_size]
            
            texts = []
            records = []
            
            for _, row in batch_df.iterrows():
                event_id = str(row["event_id"])
                
                # Basic metadata extraction
                try:
                    year = int(str(row["start_date"])[:4]) if pd.notna(row.get("start_date")) else 2000
                except:
                    year = 2000
                    
                meta = {
                    col: row[col] for col in row.index 
                    if pd.notna(row[col]) and col not in ["event_id", "event_name", "event_type"]
                }
                
                summary = build_event_text(row)
                texts.append(summary)
                
                records.append({
                    "id": event_id,
                    "name": str(row.get("event_name", "Unknown")),
                    "year": year,
                    "type": str(row.get("event_type", "Unknown")),
                    "meta": json.dumps(meta),
                    "summary": summary,
                    "now": datetime.now(timezone.utc)
                })

            try:
                vectors = embed_texts(texts)
            except Exception as e:
                logger.error(f"Batch embedding failed: {e}")
                failed += len(texts)
                continue

            for record, vec in zip(records, vectors):
                vec_str = "[" + ",".join(f"{x:.8f}" for x in vec.tolist()) + "]"
                record["vec"] = vec_str
                
                try:
                    db.execute(insert_stmt, record)
                    success += 1
                    updated += 1 # ON CONFLICT handles insert vs update silently here, counting as processed
                except Exception as e:
                    logger.error(f"DB insert failed for {record['id']}: {e}")
                    db.rollback()
                    failed += 1
                    
            db.commit()

        logger.info("Pipeline Complete!")
        logger.info(f"Total Source Events: {total_events}")
        logger.info(f"Processed (Insert/Update): {success}")
        logger.info(f"Failed: {failed}")
        
    finally:
        db.close()


if __name__ == "__main__":
    run_pipeline()

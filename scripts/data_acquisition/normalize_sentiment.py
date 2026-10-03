from pathlib import Path
from typing import Dict, List
import pandas as pd

from .config import SENTIMENT_RAW_DIR, PROCESSED_DIR
from .utils import logger


def normalize_sentiment_phrasebank(
    raw_file: Path = SENTIMENT_RAW_DIR / "Sentences_50Agree.txt",
    output_dir: Path = PROCESSED_DIR
) -> pd.DataFrame:
    """
    Normalizes Financial PhraseBank benchmark sentences and sentiment labels.
    Preserves original sentences and labels without alteration.
    """
    logger.info("Normalizing Financial PhraseBank dataset...")
    if not raw_file.exists():
        logger.warning(f"Raw sentiment file {raw_file} not found.")
        return pd.DataFrame()

    records = []
    # PhraseBank format typically: "Sentence text"@sentiment
    # Or in CSV format: "sentiment","sentence"
    with open(raw_file, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            line_str = line.strip()
            if not line_str:
                continue
            if "@" in line_str:
                parts = line_str.rsplit("@", 1)
                sentence = parts[0].strip()
                sentiment = parts[1].strip().lower()
            elif "," in line_str:
                parts = line_str.split(",", 1)
                sentiment = parts[0].replace('"', '').strip().lower()
                sentence = parts[1].replace('"', '').strip()
            else:
                continue

            if sentiment in ["positive", "neutral", "negative"]:
                records.append({
                    "sentence": sentence,
                    "sentiment": sentiment,
                    "agreement_level": "50Agree"
                })

    df = pd.DataFrame(records)
    if df.empty:
        logger.warning("No valid PhraseBank sentences extracted.")
        return pd.DataFrame()

    output_dir.mkdir(parents=True, exist_ok=True)
    out_path = output_dir / "normalized_sentiment_phrasebank.csv"
    df.to_csv(out_path, index=False)
    logger.info(f"Saved normalized PhraseBank dataset ({len(df)} sentences) to {out_path}")
    return df

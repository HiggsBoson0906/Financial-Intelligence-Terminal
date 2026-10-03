from pathlib import Path
from typing import Dict, Optional
import pandas as pd
import numpy as np

from .config import MACRO_RAW_DIR, PROCESSED_DIR, FRED_SERIES
from .utils import logger

SERIES_METADATA = {
    "FEDFUNDS": {"frequency": "Daily", "name": "Federal Funds Effective Rate"},
    "CPI": {"frequency": "Monthly", "name": "Consumer Price Index (CPIAUCSL)"},
    "TREASURY_10Y": {"frequency": "Daily", "name": "10-Year Treasury Constant Maturity"},
    "WTI": {"frequency": "Daily", "name": "Crude Oil Prices WTI"},
    "NATURAL_GAS": {"frequency": "Daily", "name": "Henry Hub Natural Gas Spot Price"}
}


def normalize_macro_data(
    raw_dir: Path = MACRO_RAW_DIR,
    output_dir: Path = PROCESSED_DIR
) -> pd.DataFrame:
    """
    Normalizes raw FRED macro series into a standardized tabular format:
    date, series_id, series_name, value, frequency, source.
    """
    logger.info("Normalizing macroeconomic series...")
    records = []

    for name, series_id in FRED_SERIES.items():
        raw_path = raw_dir / f"{name}.csv"
        if not raw_path.exists():
            logger.warning(f"Raw macro file {raw_path} not found.")
            continue

        df = pd.read_csv(raw_path)
        if df.empty or "date" not in df.columns or "value" not in df.columns:
            continue

        meta = SERIES_METADATA.get(name, {"frequency": "Unknown", "name": name})

        for _, row in df.iterrows():
            val = row["value"]
            records.append({
                "date": str(row["date"]),
                "series_id": series_id,
                "series_name": name,
                "value": float(val) if pd.notna(val) else np.nan,
                "frequency": meta["frequency"],
                "source": "FRED"
            })

    if not records:
        logger.warning("No macro records found to normalize.")
        return pd.DataFrame()

    normalized_df = pd.DataFrame(records)
    normalized_df = normalized_df.sort_values(["series_name", "date"]).reset_index(drop=True)

    output_dir.mkdir(parents=True, exist_ok=True)
    out_path = output_dir / "normalized_macro.csv"
    normalized_df.to_csv(out_path, index=False)
    logger.info(f"Saved normalized macro series ({len(normalized_df)} rows) to {out_path}")
    return normalized_df


def build_daily_macro_features(
    normalized_macro_df: pd.DataFrame,
    calendar_dates: Optional[pd.DatetimeIndex] = None,
    output_dir: Path = PROCESSED_DIR
) -> pd.DataFrame:
    """
    Constructs a wide daily macro feature table aligned with calendar/trading dates.
    Documented alignment rules:
    - Daily series (FEDFUNDS, TREASURY_10Y, WTI, NATURAL_GAS): forward-filled with a limit
      of 5 business days to bridge holidays/weekends.
    - Monthly series (CPI): forward-filled from the monthly report date to represent
      the currently available macroeconomic regime without look-ahead bias.
    """
    if normalized_macro_df.empty:
        return pd.DataFrame()

    logger.info("Constructing derived daily macro feature table...")
    # Pivot to wide format
    pivot_df = normalized_macro_df.pivot(index="date", columns="series_name", values="value")
    pivot_df.index = pd.to_datetime(pivot_df.index)
    pivot_df = pivot_df.sort_index()

    if calendar_dates is not None:
        full_idx = calendar_dates.sort_values().unique()
    else:
        full_idx = pd.date_range(start=pivot_df.index.min(), end=pivot_df.index.max(), freq="D")

    reindexed = pivot_df.reindex(full_idx)

    # Apply documented forward-filling policies
    daily_cols = [c for c in ["FEDFUNDS", "TREASURY_10Y", "WTI", "NATURAL_GAS"] if c in reindexed.columns]
    # Forward fill daily series max 5 days for long weekends/holidays
    reindexed[daily_cols] = reindexed[daily_cols].ffill(limit=5)

    # Monthly series (CPI) can be forward-filled across the month until next release
    if "CPI" in reindexed.columns:
        reindexed["CPI"] = reindexed["CPI"].ffill()

    daily_macro = reindexed.reset_index().rename(columns={"index": "date"})
    daily_macro["date"] = daily_macro["date"].dt.strftime("%Y-%m-%d")

    out_path = output_dir / "daily_macro_features.csv"
    daily_macro.to_csv(out_path, index=False)
    logger.info(f"Saved daily macro features ({len(daily_macro)} days) to {out_path}")
    return daily_macro

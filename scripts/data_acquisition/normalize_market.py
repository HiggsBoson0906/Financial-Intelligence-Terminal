from pathlib import Path
from typing import Dict, List, Optional
import pandas as pd
import numpy as np

from .config import MARKET_RAW_DIR, PROCESSED_DIR, EQUITY_ASSETS, MARKET_SERIES
from .utils import logger


def normalize_single_market_series(raw_file: Path, symbol_name: str) -> pd.DataFrame:
    """
    Normalizes a single raw market CSV file.
    Calculates daily return and 20-day rolling volatility strictly backwards-looking.
    """
    if not raw_file.exists():
        logger.warning(f"Raw file {raw_file} not found for {symbol_name}.")
        return pd.DataFrame()

    df = pd.read_csv(raw_file)
    if df.empty or "Date" not in df.columns:
        return pd.DataFrame()

    df["date"] = pd.to_datetime(df["Date"]).dt.strftime("%Y-%m-%d")
    df = df.sort_values("date").reset_index(drop=True)

    # Standardize OHLCV column names
    col_map = {
        "Open": "open",
        "High": "high",
        "Low": "low",
        "Close": "close",
        "Adj_close": "adjusted_close",
        "Adj Close": "adjusted_close",
        "Volume": "volume"
    }
    
    clean_cols = {
        "open": pd.Series(np.nan, index=df.index),
        "high": pd.Series(np.nan, index=df.index),
        "low": pd.Series(np.nan, index=df.index),
        "close": pd.Series(np.nan, index=df.index),
        "adjusted_close": pd.Series(np.nan, index=df.index),
        "volume": pd.Series(np.nan, index=df.index)
    }
    for old_col, new_col in col_map.items():
        if old_col in df.columns:
            clean_cols[new_col] = pd.to_numeric(df[old_col], errors="coerce")

    out_df = pd.DataFrame({
        "date": df["date"],
        "symbol": symbol_name,
        "open": clean_cols["open"],
        "high": clean_cols["high"],
        "low": clean_cols["low"],
        "close": clean_cols["close"],
        "adjusted_close": clean_cols["adjusted_close"].fillna(clean_cols["close"]),
        "volume": clean_cols["volume"]
    })

    # Drop non-positive prices
    for p_col in ["open", "high", "low", "close", "adjusted_close"]:
        out_df.loc[out_df[p_col] <= 0, p_col] = np.nan

    # Calculate strictly backward-looking daily returns: (P_t - P_{t-1}) / P_{t-1}
    out_df["daily_return"] = out_df["adjusted_close"].pct_change()

    # Calculate strictly backward-looking 20-day rolling volatility (annualized)
    # min_periods=10 to allow reasonable estimates near start of series
    out_df["rolling_volatility_20d"] = (
        out_df["daily_return"].rolling(window=20, min_periods=10).std() * np.sqrt(252)
    )

    return out_df


def normalize_all_market_data(
    raw_dir: Path = MARKET_RAW_DIR,
    output_dir: Path = PROCESSED_DIR
) -> pd.DataFrame:
    """
    Normalizes all available market equities and series into a single unified table.
    Saves to data/processed/normalized_market.csv.
    """
    logger.info("Normalizing all market series...")
    all_frames = []

    # Equities
    for asset in EQUITY_ASSETS:
        raw_file = raw_dir / f"{asset}.csv"
        df = normalize_single_market_series(raw_file, asset)
        if not df.empty:
            all_frames.append(df)

    # Series
    for name, sym in MARKET_SERIES.items():
        clean_name = name.replace("^", "").replace("=", "_")
        raw_file = raw_dir / f"{clean_name}.csv"
        df = normalize_single_market_series(raw_file, name)
        if not df.empty:
            all_frames.append(df)

    if not all_frames:
        logger.warning("No market series found to normalize.")
        return pd.DataFrame()

    combined_df = pd.concat(all_frames, ignore_index=True)
    combined_df = combined_df.sort_values(["symbol", "date"]).reset_index(drop=True)

    output_dir.mkdir(parents=True, exist_ok=True)
    out_path = output_dir / "normalized_market.csv"
    combined_df.to_csv(out_path, index=False)
    logger.info(f"Saved normalized market observations ({len(combined_df)} rows) to {out_path}")
    return combined_df

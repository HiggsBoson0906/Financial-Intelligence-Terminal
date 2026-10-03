import argparse
from pathlib import Path
from typing import Dict, List, Tuple
import pandas as pd
import numpy as np

from .config import PROCESSED_DIR, EQUITY_ASSETS
from .download_news import MAJOR_HURRICANES_SEED
from .utils import logger

SEED_QUERIED_EVENTS = {
    (s["name"].strip().upper(), s["year"]) for s in MAJOR_HURRICANES_SEED if "name" in s and "year" in s
}

# Explicit architectural separation of columns
METADATA_COLUMNS = [
    "event_id",
    "event_name",
    "event_type",
    "event_date",
    "asset",
    "region",
    "severity",
    "category"
]

FEATURE_COLUMNS = [
    # Weather features
    "max_wind",
    "min_pressure",
    # News features
    "news_volume",
    "news_collection_status",
    # Macro features (point-in-time as of event date)
    "oil_price",
    "gas_price",
    "sp500",
    "vix",
    "fed_rate",
    "cpi",
    "treasury_10y",
    # Pre-event market features (strictly backward-looking)
    "price_before",
    "return_1d",
    "return_3d",
    "return_5d",
    "volatility_before",
    "volume_change"
]

TARGET_COLUMNS = [
    "future_5d_return",
    "future_5d_direction"
]


def extract_event_asset_features(
    asset: str,
    event_row: pd.Series,
    asset_market_df: pd.DataFrame,
    macro_lookup: Dict[str, pd.Series],
    news_volume_map: Dict[str, int]
) -> Dict:
    """
    Computes pre-event features and future target returns for a single Event x Asset pair.
    Guarantees no look-ahead leakage in feature columns.
    """
    event_date = event_row["start_date"]
    
    # Filter market dates
    sorted_df = asset_market_df.sort_values("date").reset_index(drop=True)
    if sorted_df.empty:
        return {}

    # Find the nearest trading day on or immediately before event_date
    trading_dates = sorted_df["date"].values
    prior_trading = trading_dates[trading_dates <= event_date]
    if len(prior_trading) == 0:
        # Event occurred before asset trading history
        return {}
    
    t0_date = prior_trading[-1]
    t0_idx = sorted_df[sorted_df["date"] == t0_date].index[0]

    # Need at least 20 trading days before event for baseline features
    if t0_idx < 20:
        return {}

    # Pre-event prices and volume
    p0 = sorted_df.loc[t0_idx, "adjusted_close"]
    p_minus_1 = sorted_df.loc[t0_idx - 1, "adjusted_close"]
    p_minus_3 = sorted_df.loc[t0_idx - 3, "adjusted_close"]
    p_minus_5 = sorted_df.loc[t0_idx - 5, "adjusted_close"]

    # Pre-event returns
    ret_1d = (p0 - p_minus_1) / p_minus_1 if p_minus_1 > 0 else np.nan
    ret_3d = (p0 - p_minus_3) / p_minus_3 if p_minus_3 > 0 else np.nan
    ret_5d = (p0 - p_minus_5) / p_minus_5 if p_minus_5 > 0 else np.nan

    # Volatility before (20d rolling vol at t0)
    vol_before = sorted_df.loc[t0_idx, "rolling_volatility_20d"]

    # Volume change compared to 20-day pre-event average
    v0 = sorted_df.loc[t0_idx, "volume"]
    mean_v_20 = sorted_df.loc[t0_idx - 20: t0_idx - 1, "volume"].mean()
    vol_change = (v0 - mean_v_20) / mean_v_20 if (pd.notna(mean_v_20) and mean_v_20 > 0) else np.nan

    # Target calculation (forward-looking 5 trading days: t0 to t+5)
    if t0_idx + 5 < len(sorted_df):
        p_plus_5 = sorted_df.loc[t0_idx + 5, "adjusted_close"]
        fut_5d_ret = (p_plus_5 - p0) / p0 if p0 > 0 else np.nan
        fut_5d_dir = 1 if fut_5d_ret > 0 else 0
    else:
        # Event is too close to end of series
        fut_5d_ret = np.nan
        fut_5d_dir = np.nan

    # Macro features lookup at t0
    macro_at_t0 = macro_lookup.get(t0_date, {})

    # News volume & collection status
    ev_id = str(event_row["event_id"]).strip()
    ev_name = str(event_row["event_name"]).strip().upper()
    try:
        ev_year = int(str(event_row["start_date"])[:4])
    except Exception:
        ev_year = None

    # Strict association rule:
    # 1. Exact event_id match
    # 2. (normalized event_name + event_year) fallback
    # NEVER match on event_name alone!
    n_vol = news_volume_map.get(ev_id)
    if n_vol is None and ev_year is not None:
        n_vol = news_volume_map.get((ev_name, ev_year))
    if n_vol is None:
        n_vol = 0

    # Determine collection status
    if n_vol > 0:
        news_status = "collected"
    elif ev_year is not None and (ev_name, ev_year) in SEED_QUERIED_EVENTS:
        news_status = "no_match"
    else:
        news_status = "not_collected"

    record = {
        # Metadata
        "event_id": ev_id,
        "event_name": ev_name,
        "event_type": event_row["event_type"],
        "event_date": event_date,
        "asset": asset,
        "region": event_row.get("region", "North Atlantic"),
        "severity": event_row.get("severity", "Unknown"),
        "category": event_row.get("category", 0),
        # Weather features
        "max_wind": event_row.get("max_wind", np.nan),
        "min_pressure": event_row.get("min_pressure", np.nan),
        # News features
        "news_volume": n_vol,
        "news_collection_status": news_status,
        # Macro features
        "oil_price": macro_at_t0.get("WTI", np.nan),
        "gas_price": macro_at_t0.get("NATURAL_GAS", np.nan),
        "sp500": macro_at_t0.get("SP500", np.nan),
        "vix": macro_at_t0.get("VIX", np.nan),
        "fed_rate": macro_at_t0.get("FEDFUNDS", np.nan),
        "cpi": macro_at_t0.get("CPI", np.nan),
        "treasury_10y": macro_at_t0.get("TREASURY_10Y", np.nan),
        # Pre-event market features
        "price_before": round(p0, 2) if pd.notna(p0) else np.nan,
        "return_1d": round(ret_1d, 4) if pd.notna(ret_1d) else np.nan,
        "return_3d": round(ret_3d, 4) if pd.notna(ret_3d) else np.nan,
        "return_5d": round(ret_5d, 4) if pd.notna(ret_5d) else np.nan,
        "volatility_before": round(vol_before, 4) if pd.notna(vol_before) else np.nan,
        "volume_change": round(vol_change, 4) if pd.notna(vol_change) else np.nan,
        # Target columns (STRICTLY TARGETS)
        "future_5d_return": round(fut_5d_ret, 4) if pd.notna(fut_5d_ret) else np.nan,
        "future_5d_direction": fut_5d_dir
    }
    return record


def build_event_dataset(
    events_file: Path = PROCESSED_DIR / "historical_events.csv",
    market_file: Path = PROCESSED_DIR / "normalized_market.csv",
    macro_file: Path = PROCESSED_DIR / "daily_macro_features.csv",
    news_file: Path = PROCESSED_DIR / "news_volume_by_event.csv",
    output_file: Path = PROCESSED_DIR / "event_impact_dataset.csv"
) -> pd.DataFrame:
    """
    Constructs the Event x Asset impact dataset.
    """
    logger.info("Building Event x Asset impact dataset...")
    if not events_file.exists() or not market_file.exists():
        raise FileNotFoundError("Missing prerequisite processed files for event impact dataset.")

    events_df = pd.read_csv(events_file)
    market_df = pd.read_csv(market_file)

    # Load daily macro features
    macro_lookup = {}
    if macro_file.exists():
        m_df = pd.read_csv(macro_file)
        for _, row in m_df.iterrows():
            d = str(row["date"])
            macro_lookup[d] = row.to_dict()

    # Load series from market_df into macro_lookup (for VIX, SP500, WTI, Natural Gas if present)
    for sym in ["VIX", "SP500", "WTI", "NATURAL_GAS"]:
        sym_df = market_df[market_df["symbol"] == sym]
        for _, r in sym_df.iterrows():
            d = str(r["date"])
            if d not in macro_lookup:
                macro_lookup[d] = {}
            macro_lookup[d][sym] = r["adjusted_close"]

    # Load news volume map:
    # 1. exact event_id -> total_news_volume
    # 2. (normalized event_name, event_year) -> total_news_volume
    # NEVER map on event_name alone!
    news_volume_map = {}
    if news_file.exists():
        n_df = pd.read_csv(news_file)
        ev_year_lookup = {}
        for _, er in events_df.iterrows():
            eid = str(er["event_id"]).strip()
            try:
                ev_year_lookup[eid] = int(str(er["start_date"])[:4])
            except Exception:
                pass

        for _, r in n_df.iterrows():
            eid = str(r["event_id"]).strip()
            ename = str(r["event_name"]).strip().upper()
            vol = int(r["total_news_volume"])
            news_volume_map[eid] = vol
            if eid in ev_year_lookup:
                eyear = ev_year_lookup[eid]
                news_volume_map[(ename, eyear)] = vol

    records = []
    assets = [a for a in EQUITY_ASSETS if a in market_df["symbol"].unique()]

    for asset in assets:
        asset_mkt = market_df[market_df["symbol"] == asset]
        for _, ev_row in events_df.iterrows():
            feat = extract_event_asset_features(
                asset=asset,
                event_row=ev_row,
                asset_market_df=asset_mkt,
                macro_lookup=macro_lookup,
                news_volume_map=news_volume_map
            )
            if feat:
                records.append(feat)

    dataset_df = pd.DataFrame(records)
    if dataset_df.empty:
        logger.warning("No Event x Asset records generated.")
        return pd.DataFrame()

    # Order columns by metadata, features, targets
    ordered_cols = METADATA_COLUMNS + [c for c in FEATURE_COLUMNS if c in dataset_df.columns] + TARGET_COLUMNS
    dataset_df = dataset_df[ordered_cols]

    output_file.parent.mkdir(parents=True, exist_ok=True)
    dataset_df.to_csv(output_file, index=False)
    logger.info(f"Built Event x Asset impact dataset with {len(dataset_df)} rows saved to {output_file}")
    return dataset_df


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build Event x Asset impact dataset")
    args = parser.parse_args()
    build_event_dataset()

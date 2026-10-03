import argparse
import time
from pathlib import Path
from typing import Dict
import pandas as pd
import requests

from .config import (
    MACRO_RAW_DIR,
    PROVENANCE_DIR,
    FRED_SERIES,
    FRED_API_KEY,
    DEFAULT_START_DATE,
    DEFAULT_END_DATE
)
from .utils import save_provenance, calculate_checksum, logger


def fetch_fred_series(series_id: str, start_date: str, end_date: str) -> pd.DataFrame:
    """
    Fetches historical series from FRED.
    Uses official FRED REST API if FRED_API_KEY is available,
    otherwise uses the direct FRED CSV export endpoint.
    """
    if FRED_API_KEY:
        try:
            logger.info(f"Fetching FRED series {series_id} using FRED_API_KEY...")
            url = "https://api.stlouisfed.org/fred/series/observations"
            params = {
                "series_id": series_id,
                "api_key": FRED_API_KEY,
                "file_type": "json",
                "observation_start": start_date,
                "observation_end": end_date
            }
            res = requests.get(url, params=params, timeout=20)
            res.raise_for_status()
            data = res.json()
            obs = data.get("observations", [])
            records = []
            for item in obs:
                val = item.get("value")
                try:
                    num_val = float(val) if val != "." else None
                except ValueError:
                    num_val = None
                records.append({"date": item.get("date"), "value": num_val})
            df = pd.DataFrame(records)
            return df
        except Exception as e:
            logger.warning(f"FRED API failed for {series_id} ({e}), falling back to direct CSV export...")

    # Direct CSV download from FRED (does not require API key)
    logger.info(f"Downloading FRED series {series_id} via direct FRED CSV export...")
    csv_url = f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={series_id}"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    res = requests.get(csv_url, headers=headers, timeout=25)
    res.raise_for_status()
    
    # Save temporary or parse directly
    from io import StringIO
    df = pd.read_csv(StringIO(res.text))
    # FRED CSV typically has DATE and series_id columns
    if len(df.columns) >= 2:
        df.columns = ["date", "value"]
        df["value"] = pd.to_numeric(df["value"], errors="coerce")
        df["date"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")
        df = df[(df["date"] >= start_date) & (df["date"] <= end_date)]
    return df


def download_macro(
    start_date: str = DEFAULT_START_DATE,
    end_date: str = DEFAULT_END_DATE,
    force: bool = False
) -> Dict[str, Path]:
    """
    Downloads macroeconomic series from FRED.
    Saves raw files to data/raw/macro/{name}.csv.
    """
    MACRO_RAW_DIR.mkdir(parents=True, exist_ok=True)
    results = {}

    for name, series_id in FRED_SERIES.items():
        destination = MACRO_RAW_DIR / f"{name}.csv"
        
        if destination.exists() and destination.stat().st_size > 200 and not force:
            logger.info(f"Macro file {destination.name} already exists. Skipping download (idempotent).")
            checksum = calculate_checksum(destination)
            results[name] = destination
            save_provenance(
                source_name=f"Macro_{name}",
                source_url=f"https://fred.stlouisfed.org/series/{series_id}",
                provider="Federal Reserve Bank of St. Louis (FRED)",
                date_range={"start": start_date, "end": end_date},
                parameters={"series_id": series_id},
                local_filename=str(destination.relative_to(destination.parent.parent.parent)),
                output_dir=PROVENANCE_DIR,
                checksum=checksum,
                notes=f"Raw macro observations for {name} ({series_id})"
            )
            continue

        try:
            df = fetch_fred_series(series_id, start_date, end_date)
            if df is not None and not df.empty:
                df.to_csv(destination, index=False)
                checksum = calculate_checksum(destination)
                results[name] = destination
                save_provenance(
                    source_name=f"Macro_{name}",
                    source_url=f"https://fred.stlouisfed.org/series/{series_id}",
                    provider="Federal Reserve Bank of St. Louis (FRED)",
                    date_range={"start": start_date, "end": end_date},
                    parameters={"series_id": series_id},
                    local_filename=str(destination.relative_to(destination.parent.parent.parent)),
                    output_dir=PROVENANCE_DIR,
                    checksum=checksum,
                    notes=f"Raw macro observations for {name} ({series_id})"
                )
            else:
                logger.error(f"Empty macro dataframe for {name} ({series_id})")
        except Exception as e:
            logger.error(f"Failed to fetch macro series {name} ({series_id}): {e}")

        time.sleep(0.5)

    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download FRED macroeconomic series")
    parser.add_argument("--force", action="store_true", help="Force redownload")
    args = parser.parse_args()
    download_macro(force=args.force)

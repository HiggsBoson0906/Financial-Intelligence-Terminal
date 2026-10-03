from pathlib import Path
from typing import Dict, List, Tuple
import pandas as pd
import numpy as np

from .config import HURRICANES_RAW_DIR, PROCESSED_DIR
from .utils import logger


def classify_saffir_simpson(max_wind_kt: float) -> Tuple[str, int]:
    """
    Classifies tropical cyclone severity based on official Saffir-Simpson Hurricane Wind Scale.
    Returns (severity_label, category_int).
    """
    if pd.isna(max_wind_kt) or max_wind_kt <= 0:
        return "Unknown", -1
    if max_wind_kt < 34:
        return "Tropical Depression", 0
    elif max_wind_kt < 64:
        return "Tropical Storm", 0
    elif max_wind_kt < 83:
        return "Category 1", 1
    elif max_wind_kt < 96:
        return "Category 2", 2
    elif max_wind_kt < 113:
        return "Category 3", 3
    elif max_wind_kt < 137:
        return "Category 4", 4
    else:
        return "Category 5", 5


def normalize_ibtracs(raw_file: Path, start_year: int = 2010, end_year: int = 2025) -> pd.DataFrame:
    """
    Normalizes raw NOAA IBTrACS CSV tracks.
    Handles IBTrACS two-line header (row 1 is units).
    """
    logger.info(f"Normalizing IBTrACS data from {raw_file}...")
    if not raw_file.exists():
        raise FileNotFoundError(f"Raw IBTrACS file not found at {raw_file}")

    # Read IBTrACS skipping units row (row 1)
    # keep_default_na=False is critical because 'NA' represents North Atlantic basin, not NaN!
    df = pd.read_csv(raw_file, skiprows=[1], keep_default_na=False, low_memory=False)

    # Normalize column names to uppercase
    df.columns = [c.upper().strip() for c in df.columns]

    for c in df.columns:
        if df[c].dtype == object:
            df[c] = df[c].astype(str).str.strip()

    # Required columns
    # SID, NAME, ISO_TIME, LAT, LON, WMO_WIND, WMO_PRES, USA_WIND, USA_PRES, BASIN, SEASON
    df["SEASON"] = pd.to_numeric(df.get("SEASON"), errors="coerce")
    df = df[(df["SEASON"] >= start_year) & (df["SEASON"] <= end_year)].copy()

    # Filter North Atlantic basin
    if "BASIN" in df.columns:
        df = df[df["BASIN"].isin(["NA", "NORTH ATLANTIC"])].copy()

    # Clean dates
    df["TIMESTAMP"] = pd.to_datetime(df["ISO_TIME"], errors="coerce")
    df = df.dropna(subset=["TIMESTAMP"]).copy()
    df["DATE"] = df["TIMESTAMP"].dt.strftime("%Y-%m-%d")

    # Clean numeric coordinates and intensities
    df["LAT"] = pd.to_numeric(df["LAT"], errors="coerce")
    df["LON"] = pd.to_numeric(df["LON"], errors="coerce")

    # Combine WMO and USA wind estimates (prefer USA_WIND / WMO_WIND whichever is present and positive)
    usa_wind = pd.to_numeric(df.get("USA_WIND"), errors="coerce")
    wmo_wind = pd.to_numeric(df.get("WMO_WIND"), errors="coerce")
    df["MAX_WIND"] = usa_wind.fillna(wmo_wind)

    usa_pres = pd.to_numeric(df.get("USA_PRES"), errors="coerce")
    wmo_pres = pd.to_numeric(df.get("WMO_PRES"), errors="coerce")
    df["MIN_PRESSURE"] = usa_pres.fillna(wmo_pres)

    # Standardize column schema
    normalized = pd.DataFrame({
        "event_id": df["SID"].astype(str),
        "event_name": df["NAME"].astype(str).str.strip().str.upper(),
        "timestamp": df["TIMESTAMP"],
        "date": df["DATE"],
        "latitude": df["LAT"],
        "longitude": df["LON"],
        "wind_kt": df["MAX_WIND"],
        "pressure_mb": df["MIN_PRESSURE"],
        "basin": "NA",
        "nature": df.get("NATURE", "TS").astype(str).str.strip()
    })

    # Drop impossible numeric values (negative winds, pressures outside physical range)
    normalized.loc[normalized["wind_kt"] < 0, "wind_kt"] = np.nan
    normalized.loc[(normalized["pressure_mb"] < 850) | (normalized["pressure_mb"] > 1050), "pressure_mb"] = np.nan

    logger.info(f"Normalized {len(normalized)} IBTrACS track points across {normalized['event_id'].nunique()} events.")
    return normalized


def parse_hurdat2(raw_file: Path, start_year: int = 2010, end_year: int = 2025) -> pd.DataFrame:
    """
    Parses NOAA NHC HURDAT2 fixed-format text file.
    """
    logger.info(f"Parsing HURDAT2 validation dataset from {raw_file}...")
    if not raw_file.exists():
        raise FileNotFoundError(f"Raw HURDAT2 file not found at {raw_file}")

    records = []
    current_storm_id = None
    current_storm_name = None

    with open(raw_file, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            parts = [p.strip() for p in line.strip().split(",")]
            if len(parts) >= 3 and parts[0].startswith("AL"):
                # Header row: AL012010, ALEX, 25,
                current_storm_id = parts[0]
                current_storm_name = parts[1]
            elif len(parts) >= 6 and current_storm_id:
                # Track row: 20100625, 1800,  , HU, 20.8N,  89.0W,  65,  980, ...
                date_str = parts[0]
                time_str = parts[1]
                status = parts[3]
                lat_str = parts[4]
                lon_str = parts[5]
                wind_str = parts[6]
                pres_str = parts[7] if len(parts) > 7 else "-999"

                year = int(date_str[:4])
                if start_year <= year <= end_year:
                    # Convert lat/lon
                    lat = float(lat_str[:-1]) * (-1 if lat_str.endswith("S") else 1)
                    lon = float(lon_str[:-1]) * (-1 if lon_str.endswith("W") else 1)
                    wind = float(wind_str) if wind_str != "-99" else np.nan
                    pres = float(pres_str) if pres_str != "-999" else np.nan

                    records.append({
                        "hurdat_id": current_storm_id,
                        "storm_name": current_storm_name,
                        "year": year,
                        "date": f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:8]}",
                        "latitude": lat,
                        "longitude": lon,
                        "wind_kt": wind,
                        "pressure_mb": pres,
                        "status": status
                    })

    df = pd.DataFrame(records)
    logger.info(f"Parsed {len(df)} HURDAT2 track points across {df['hurdat_id'].nunique() if not df.empty else 0} storms.")
    return df


def compare_ibtracs_and_hurdat2(
    ibtracs_events: pd.DataFrame,
    hurdat_df: pd.DataFrame
) -> Dict:
    """
    Compares overlapping events between IBTrACS and independent HURDAT2.
    Produces validation discrepancy summary without altering IBTrACS.
    """
    if hurdat_df.empty or ibtracs_events.empty:
        return {"status": "insufficient_data"}

    # Aggregate HURDAT2 storms
    hurdat_summary = hurdat_df.groupby("hurdat_id").agg(
        name=("storm_name", "first"),
        year=("year", "first"),
        start_date=("date", "min"),
        end_date=("date", "max"),
        max_wind=("wind_kt", "max"),
        min_pressure=("pressure_mb", "min")
    ).reset_index()

    ibtracs_events_clean = ibtracs_events.copy()
    ibtracs_events_clean["event_name_clean"] = ibtracs_events_clean["event_name"].str.upper()
    ibtracs_events_clean["year"] = pd.to_datetime(ibtracs_events_clean["start_date"]).dt.year

    matched = []
    wind_discrepancies = []
    pressure_discrepancies = []
    date_discrepancies = []

    for _, h_row in hurdat_summary.iterrows():
        # Match by name and year
        h_name = h_row["name"].upper()
        h_year = h_row["year"]
        m = ibtracs_events_clean[
            (ibtracs_events_clean["event_name_clean"] == h_name) &
            (ibtracs_events_clean["year"] == h_year)
        ]
        if not m.empty:
            ib_row = m.iloc[0]
            matched.append((h_name, h_year))
            
            # Check wind discrepancy
            if pd.notna(h_row["max_wind"]) and pd.notna(ib_row["max_wind"]):
                diff_wind = abs(h_row["max_wind"] - ib_row["max_wind"])
                if diff_wind > 5.0:
                    wind_discrepancies.append({
                        "name": h_name,
                        "year": h_year,
                        "hurdat_wind": h_row["max_wind"],
                        "ibtracs_wind": ib_row["max_wind"],
                        "diff": diff_wind
                    })

            # Check pressure discrepancy
            if pd.notna(h_row["min_pressure"]) and pd.notna(ib_row["min_pressure"]):
                diff_pres = abs(h_row["min_pressure"] - ib_row["min_pressure"])
                if diff_pres > 5.0:
                    pressure_discrepancies.append({
                        "name": h_name,
                        "year": h_year,
                        "hurdat_pres": h_row["min_pressure"],
                        "ibtracs_pres": ib_row["min_pressure"],
                        "diff": diff_pres
                    })

            # Check start date discrepancy
            if h_row["start_date"] != ib_row["start_date"]:
                date_discrepancies.append({
                    "name": h_name,
                    "year": h_year,
                    "hurdat_start": h_row["start_date"],
                    "ibtracs_start": ib_row["start_date"]
                })

    summary = {
        "hurdat_total_storms": len(hurdat_summary),
        "ibtracs_total_storms": len(ibtracs_events),
        "matched_storms_count": len(matched),
        "unmatched_hurdat_count": len(hurdat_summary) - len(matched),
        "wind_discrepancies_count": len(wind_discrepancies),
        "wind_discrepancies": wind_discrepancies[:10],
        "pressure_discrepancies_count": len(pressure_discrepancies),
        "pressure_discrepancies": pressure_discrepancies[:10],
        "date_discrepancies_count": len(date_discrepancies),
        "date_discrepancies": date_discrepancies[:10]
    }
    logger.info(f"HURDAT2 vs IBTrACS comparison: {len(matched)} matched storms, {len(wind_discrepancies)} wind diffs > 5kt.")
    return summary

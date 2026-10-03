import argparse
from pathlib import Path
import pandas as pd
import numpy as np

from .config import HURRICANES_RAW_DIR, PROCESSED_DIR
from .normalize_hurricanes import normalize_ibtracs, classify_saffir_simpson
from .utils import logger


def determine_region(lat: float, lon: float) -> str:
    """
    Assigns approximate regional label based on coordinates of peak intensity.
    """
    if pd.isna(lat) or pd.isna(lon):
        return "North Atlantic (Open Ocean)"
    # Gulf of Mexico approximate bounds: Lat 18-31 N, Lon -98 to -80 W
    if 18 <= lat <= 31 and -98 <= lon <= -80:
        return "US Gulf Coast / Gulf of Mexico"
    # US East Coast: Lat 24-45 N, Lon -82 to -65 W
    elif 24 <= lat <= 45 and -82 <= lon <= -65:
        return "US East Coast / Atlantic Seaboard"
    # Caribbean: Lat 10-25 N, Lon -85 to -60 W
    elif 10 <= lat <= 25 and -85 <= lon <= -60:
        return "Caribbean Basin"
    else:
        return "North Atlantic (Open Ocean)"


def build_historical_events(
    raw_ibtracs_file: Path = HURRICANES_RAW_DIR / "ibtracs_NA.csv",
    output_file: Path = PROCESSED_DIR / "historical_events.csv",
    start_year: int = 2010,
    end_year: int = 2025
) -> pd.DataFrame:
    """
    Aggregates IBTrACS track points into a clean historical event table.
    One row per storm event.
    """
    logger.info(f"Building historical events table from {raw_ibtracs_file}...")
    track_df = normalize_ibtracs(raw_ibtracs_file, start_year=start_year, end_year=end_year)

    events = []
    for event_id, group in track_df.groupby("event_id"):
        event_name = group["event_name"].iloc[0]
        # Ignore unnamed disturbances if no meaningful name
        start_date = group["date"].min()
        end_date = group["date"].max()
        max_wind = group["wind_kt"].max()
        min_pres = group["pressure_mb"].min()

        # Find position at peak wind
        peak_idx = group["wind_kt"].idxmax()
        if pd.notna(peak_idx) and peak_idx in group.index:
            peak_lat = group.loc[peak_idx, "latitude"]
            peak_lon = group.loc[peak_idx, "longitude"]
        else:
            peak_lat = group["latitude"].median()
            peak_lon = group["longitude"].median()

        severity_label, category = classify_saffir_simpson(max_wind)
        region = determine_region(peak_lat, peak_lon)

        # Standard event type
        event_type = "Tropical Cyclone"
        if category >= 1:
            event_type = f"Hurricane (Category {category})"
        elif max_wind >= 34:
            event_type = "Tropical Storm"
        elif max_wind > 0:
            event_type = "Tropical Depression"

        events.append({
            "event_id": event_id,
            "event_name": event_name,
            "event_type": event_type,
            "start_date": start_date,
            "end_date": end_date,
            "region": region,
            "basin": "NA",
            "latitude": round(peak_lat, 2) if pd.notna(peak_lat) else np.nan,
            "longitude": round(peak_lon, 2) if pd.notna(peak_lon) else np.nan,
            "max_wind": round(max_wind, 1) if pd.notna(max_wind) else np.nan,
            "min_pressure": round(min_pres, 1) if pd.notna(min_pres) else np.nan,
            "severity": severity_label,
            "category": category
        })

    events_df = pd.DataFrame(events)
    # Sort chronologically by start date
    events_df = events_df.sort_values("start_date").reset_index(drop=True)

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    events_df.to_csv(output_file, index=False)
    logger.info(f"Built historical events table with {len(events_df)} storms saved to {output_file}")
    return events_df


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build historical events table")
    args = parser.parse_args()
    build_historical_events()

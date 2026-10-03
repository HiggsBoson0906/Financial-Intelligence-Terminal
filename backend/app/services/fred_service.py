import os
import requests
import pandas as pd
from typing import Optional
from io import StringIO
import logging

logger = logging.getLogger(__name__)

class FREDService:
    """
    Service for fetching macroeconomic data from FRED.
    Uses official FRED REST API if FRED_API_KEY is available,
    otherwise uses the direct FRED CSV export endpoint.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("FRED_API_KEY")
        self.base_api_url = "https://api.stlouisfed.org/fred/series/observations"
        self.base_csv_url = "https://fred.stlouisfed.org/graph/fredgraph.csv"

    def fetch_series(self, series_id: str, start_date: str, end_date: str) -> pd.DataFrame:
        """
        Fetches a time series from FRED.
        
        Args:
            series_id (str): The FRED series ID (e.g., 'DFF', 'CPIAUCSL')
            start_date (str): Start date in YYYY-MM-DD format
            end_date (str): End date in YYYY-MM-DD format
            
        Returns:
            pd.DataFrame: DataFrame containing 'date' and 'value' columns
        """
        df = None
        
        if self.api_key:
            df = self._fetch_via_api(series_id, start_date, end_date)
            
        if df is None or df.empty:
            df = self._fetch_via_csv(series_id, start_date, end_date)
            
        if df is None or df.empty:
            logger.error(f"Failed to fetch FRED series {series_id} using both API and CSV fallback.")
            return pd.DataFrame(columns=["date", "value"])
            
        return df

    def _fetch_via_api(self, series_id: str, start_date: str, end_date: str) -> Optional[pd.DataFrame]:
        try:
            logger.info(f"Fetching FRED series {series_id} using API...")
            params = {
                "series_id": series_id,
                "api_key": self.api_key,
                "file_type": "json",
                "observation_start": start_date,
                "observation_end": end_date
            }
            res = requests.get(self.base_api_url, params=params, timeout=20)
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
            if not df.empty:
                df["date"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")
            return df
        except Exception as e:
            logger.warning(f"FRED API failed for {series_id}: {e}")
            return None

    def _fetch_via_csv(self, series_id: str, start_date: str, end_date: str) -> Optional[pd.DataFrame]:
        try:
            logger.info(f"Downloading FRED series {series_id} via CSV export...")
            params = {"id": series_id}
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
            res = requests.get(self.base_csv_url, params=params, headers=headers, timeout=25)
            res.raise_for_status()
            
            df = pd.read_csv(StringIO(res.text))
            if len(df.columns) >= 2:
                df.columns = ["date", "value"]
                df["value"] = pd.to_numeric(df["value"], errors="coerce")
                df["date"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")
                df = df[(df["date"] >= start_date) & (df["date"] <= end_date)].copy()
                return df
            return None
        except Exception as e:
            logger.error(f"FRED CSV fallback failed for {series_id}: {e}")
            return None

    def get_series_latest(self, series_id: str) -> dict:
        """Helper to get latest data point or fallback."""
        from datetime import datetime, timedelta
        import time
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        try:
            df = self.fetch_series(series_id, start_date, end_date)
            if not df.empty:
                val = df.iloc[-1]["value"]
                return {"value": val, "status": "fresh"}
        except:
            pass
            
        # Fallbacks if fail
        fallbacks = {
            "CPIAUCSL": 312.5,
            "DFF": 5.33,
            "DCOILWTICO": 75.40
        }
        return {"value": fallbacks.get(series_id, 0.0), "status": "fallback"}

fred_service = FREDService()

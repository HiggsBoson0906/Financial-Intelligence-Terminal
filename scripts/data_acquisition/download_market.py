import argparse
import time
from pathlib import Path
from typing import Dict, List, Optional
import pandas as pd
import yfinance as yf
import requests

from .config import (
    MARKET_RAW_DIR,
    PROVENANCE_DIR,
    EQUITY_ASSETS,
    MARKET_SERIES,
    DEFAULT_START_DATE,
    DEFAULT_END_DATE,
    ALPHA_VANTAGE_API_KEY
)
from .utils import save_provenance, calculate_checksum, logger


def download_symbol_yfinance(symbol: str, start_date: str, end_date: str) -> Optional[pd.DataFrame]:
    """
    Downloads historical OHLCV data using yfinance.
    """
    try:
        logger.info(f"Downloading {symbol} via yfinance ({start_date} to {end_date})...")
        ticker = yf.Ticker(symbol)
        df = ticker.history(start=start_date, end=end_date, auto_adjust=False)
        if df.empty:
            logger.warning(f"yfinance returned empty dataset for {symbol}.")
            return None
        df = df.reset_index()
        # Clean column names
        df.columns = [col.replace(" ", "_").capitalize() for col in df.columns]
        if "Date" in df.columns:
            df["Date"] = pd.to_datetime(df["Date"]).dt.tz_localize(None).dt.strftime("%Y-%m-%d")
        return df
    except Exception as e:
        logger.warning(f"yfinance download failed for {symbol}: {e}")
        return None

from datetime import datetime, timezone

def download_symbol_yahoo_v8(symbol: str, start_date: str, end_date: str) -> Optional[pd.DataFrame]:
    """
    Direct Yahoo Finance v8 chart API download. Resilient against curl_cffi DNS failures.
    """
    try:
        logger.info(f"Downloading {symbol} via Yahoo Finance direct v8 API ({start_date} to {end_date})...")
        p1 = int(datetime.strptime(start_date, "%Y-%m-%d").replace(tzinfo=timezone.utc).timestamp())
        p2 = int(datetime.strptime(end_date, "%Y-%m-%d").replace(tzinfo=timezone.utc).timestamp()) + 86400
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?period1={p1}&period2={p2}&interval=1d"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        res = requests.get(url, headers=headers, timeout=20)
        if res.status_code != 200:
            logger.warning(f"Yahoo v8 chart returned status {res.status_code} for {symbol}")
            return None
        data = res.json()
        result = data.get("chart", {}).get("result", [])
        if not result:
            return None
        res_data = result[0]
        timestamps = res_data.get("timestamp", [])
        quotes = res_data.get("indicators", {}).get("quote", [{}])[0]
        adj = res_data.get("indicators", {}).get("adjclose", [{}])[0].get("adjclose")
        if not timestamps:
            return None
        df = pd.DataFrame({
            "Date": [datetime.fromtimestamp(ts, timezone.utc).strftime("%Y-%m-%d") for ts in timestamps],
            "Open": quotes.get("open", []),
            "High": quotes.get("high", []),
            "Low": quotes.get("low", []),
            "Close": quotes.get("close", []),
            "Adj_close": adj if adj is not None else quotes.get("close", []),
            "Volume": quotes.get("volume", [])
        })
        return df.dropna(subset=["Close"]).reset_index(drop=True)
    except Exception as e:
        logger.warning(f"Yahoo v8 chart fetch failed for {symbol}: {e}")
        return None


def download_symbol_alphavantage(symbol: str) -> Optional[pd.DataFrame]:
    """
    Optional Alpha Vantage adapter. Note: Free tier has strict rate limits (25/day)
    and compact output by default.
    """
    if not ALPHA_VANTAGE_API_KEY:
        logger.info("ALPHA_VANTAGE_API_KEY not configured. Skipping Alpha Vantage.")
        return None
    try:
        logger.info(f"Attempting Alpha Vantage for {symbol}...")
        url = "https://www.alphavantage.co/query"
        params = {
            "function": "TIME_SERIES_DAILY_ADJUSTED",
            "symbol": symbol,
            "outputsize": "full",
            "apikey": ALPHA_VANTAGE_API_KEY,
            "datatype": "json"
        }
        res = requests.get(url, params=params, timeout=20)
        res.raise_for_status()
        data = res.json()
        ts_key = "Time Series (Daily)"
        if ts_key not in data:
            logger.warning(f"Alpha Vantage response did not contain daily time series for {symbol}: {list(data.keys())}")
            return None
        records = []
        for date_str, values in data[ts_key].items():
            records.append({
                "Date": date_str,
                "Open": float(values.get("1. open", 0)),
                "High": float(values.get("2. high", 0)),
                "Low": float(values.get("3. low", 0)),
                "Close": float(values.get("4. close", 0)),
                "Adj_close": float(values.get("5. adjusted close", values.get("4. close", 0))),
                "Volume": float(values.get("6. volume", 0))
            })
        df = pd.DataFrame(records).sort_values("Date").reset_index(drop=True)
        return df
    except Exception as e:
        logger.warning(f"Alpha Vantage fetch failed for {symbol}: {e}")
        return None


def download_market(
    symbols: Optional[List[str]] = None,
    start_date: str = DEFAULT_START_DATE,
    end_date: str = DEFAULT_END_DATE,
    force: bool = False
) -> Dict[str, Path]:
    """
    Acquires market data for equity assets and commodity/volatility series.
    Saves raw files locally in data/raw/market/{symbol}.csv.
    """
    MARKET_RAW_DIR.mkdir(parents=True, exist_ok=True)
    all_targets = {}
    
    # Equities
    for asset in (symbols or EQUITY_ASSETS):
        all_targets[asset] = asset
        
    # Series
    if not symbols:
        for name, sym in MARKET_SERIES.items():
            all_targets[name] = sym

    results = {}

    for name, sym in all_targets.items():
        clean_name = name.replace("^", "").replace("=", "_")
        target_path = MARKET_RAW_DIR / f"{clean_name}.csv"

        if target_path.exists() and target_path.stat().st_size > 500 and not force:
            logger.info(f"Market file {target_path.name} already exists. Skipping download (idempotent).")
            checksum = calculate_checksum(target_path)
            results[name] = target_path
            save_provenance(
                source_name=f"Market_{name}",
                source_url=f"yfinance/yahoo:{sym}",
                provider="yfinance",
                date_range={"start": start_date, "end": end_date},
                parameters={"symbol": sym, "clean_name": clean_name},
                local_filename=str(target_path.relative_to(target_path.parent.parent.parent)),
                output_dir=PROVENANCE_DIR,
                checksum=checksum,
                notes=f"Raw market data for {name} ({sym})"
            )
            continue

        df = None
        provider = "yfinance"
        # Try yfinance first
        df = download_symbol_yfinance(sym, start_date, end_date)
        
        # If yfinance failed, try direct Yahoo Finance v8 chart API
        if df is None or df.empty:
            logger.info(f"Falling back to direct Yahoo Finance v8 API for {sym}...")
            df = download_symbol_yahoo_v8(sym, start_date, end_date)
            if df is not None and not df.empty:
                provider = "Yahoo_v8"

        # If still empty and Alpha Vantage key present, try Alpha Vantage
        if df is None or df.empty:
            logger.info(f"Falling back to Alpha Vantage for {sym}...")
            df = download_symbol_alphavantage(sym)
            if df is not None and not df.empty:
                provider = "Alpha Vantage"

        if df is None or df.empty:
            logger.error(f"Failed to acquire market observations for {name} ({sym}).")
            continue

        # Filter date range
        if "Date" in df.columns:
            df["Date"] = pd.to_datetime(df["Date"]).dt.strftime("%Y-%m-%d")
            df = df[(df["Date"] >= start_date) & (df["Date"] <= end_date)]

        df.to_csv(target_path, index=False)
        checksum = calculate_checksum(target_path)
        results[name] = target_path

        save_provenance(
            source_name=f"Market_{name}",
            source_url=f"{provider}:{sym}",
            provider=provider,
            date_range={"start": start_date, "end": end_date},
            parameters={"symbol": sym, "clean_name": clean_name},
            local_filename=str(target_path.relative_to(target_path.parent.parent.parent)),
            output_dir=PROVENANCE_DIR,
            checksum=checksum,
            notes=f"Raw market data for {name} ({sym}) via {provider}"
        )
        time.sleep(0.5)  # Politeness delay

    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download market historical data")
    parser.add_argument("--force", action="store_true", help="Force redownload")
    args = parser.parse_args()
    download_market(force=args.force)

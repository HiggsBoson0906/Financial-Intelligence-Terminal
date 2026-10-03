from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
PROVENANCE_DIR = PROCESSED_DIR / "provenance"

# Raw subdirectories
HURRICANES_RAW_DIR = RAW_DIR / "hurricanes"
WEATHER_RAW_DIR = RAW_DIR / "weather"
MARKET_RAW_DIR = RAW_DIR / "market"
MACRO_RAW_DIR = RAW_DIR / "macro"
NEWS_RAW_DIR = RAW_DIR / "news"
SENTIMENT_RAW_DIR = RAW_DIR / "sentiment"

# Target date window
DEFAULT_START_DATE = "2010-01-01"
DEFAULT_END_DATE = "2025-12-31"

# Asset Universe
EQUITY_ASSETS = ["XOM", "CVX", "COP", "OXY", "XLE", "SPY"]
MARKET_SERIES = {
    "WTI": "CL=F",
    "NATURAL_GAS": "NG=F",
    "VIX": "^VIX",
    "SP500": "^GSPC"
}

# Macro Series (FRED identifiers)
FRED_SERIES = {
    "FEDFUNDS": "DFF",           # Daily Effective Federal Funds Rate
    "CPI": "CPIAUCSL",          # Consumer Price Index for All Urban Consumers (Monthly)
    "TREASURY_10Y": "DGS10",    # 10-Year Treasury Constant Maturity Rate (Daily)
    "WTI": "DCOILWTICO",        # Crude Oil Prices: Brent/WTI (Daily)
    "NATURAL_GAS": "DHHNGSP"    # Henry Hub Natural Gas Spot Price (Daily)
}

# External Source URLs
IBTRACS_NA_URL = "https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r01/access/csv/ibtracs.NA.list.v04r01.csv"
IBTRACS_BACKUP_URL = "https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r00/access/csv/ibtracs.NA.list.v04r00.csv"
HURDAT2_URL = "https://www.nhc.noaa.gov/data/hurdat/hurdat2-1851-2023-051124.txt"
GDELT_DOC_API_URL = "https://api.gdeltproject.org/api/v2/doc/doc"
PHRASEBANK_URL = "https://raw.githubusercontent.com/maxwellsarpong/NLP-financial-text-processing-dataset/master/Sentences_50Agree.txt"

# API keys (read from env)
FRED_API_KEY = os.getenv("FRED_API_KEY")
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")

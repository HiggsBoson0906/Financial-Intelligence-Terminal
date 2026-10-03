# Data Acquisition & Normalization Pipeline

This package provides a reproducible, modular historical data acquisition and preprocessing pipeline for the Financial Intelligence Terminal.

## Architecture & Data Flow

```
External APIs / Downloads (NOAA, FRED, yfinance, GDELT, PhraseBank)
                        │
                        ▼
                 data/raw/ (Immutable)
                        │
                        ▼
             Normalization Adapters
                        │
                        ▼
               data/processed/
       ├── historical_events.csv
       ├── normalized_market.csv
       ├── daily_macro_features.csv
       ├── normalized_news.csv
       ├── event_impact_dataset.csv
       ├── provenance/ (*.json)
       └── data_report.md
```

## Supported Sources & Adapters

1. **NOAA IBTrACS (Primary Event Source):**
   - Official North Atlantic best-track archive (2010–2025).
   - Classified via Saffir-Simpson Hurricane Wind Scale.
2. **NOAA HURDAT2 (Validation Source):**
   - National Hurricane Center independent validation track database.
   - Compared against IBTrACS to report wind, pressure, and date discrepancies without overwriting primary data.
3. **Equities & Commodities (Market):**
   - Equities/ETF: `XOM`, `CVX`, `COP`, `OXY`, `XLE`, `SPY`.
   - Market series: `WTI` (`CL=F`), `Natural Gas` (`NG=F`), `VIX` (`^VIX`), `S&P 500` (`^GSPC`).
   - Provider abstraction: Primary `yfinance`, fallback `Alpha Vantage`.
4. **Macroeconomic Indicators (FRED):**
   - Series: Effective Federal Funds Rate (`DFF`), CPI (`CPIAUCSL`), 10Y Treasury Yield (`DGS10`), WTI Spot (`DCOILWTICO`), Henry Hub Natural Gas (`DHHNGSP`).
   - Supports official FRED REST API via `FRED_API_KEY` with fallback to direct FRED CSV export.
5. **Event-Driven News (GDELT):**
   - GDELT DOC 2.0 API targeted querying surrounding hurricane occurrence windows.
   - URL deduplication and volume aggregation.
6. **Sentiment Benchmark (Financial PhraseBank):**
   - Benchmark evaluation dataset for future FinBERT evaluation.

## Execution

### Run Full Pipeline
```bash
python -m scripts.data_acquisition.run_pipeline
```

### Force Redownload
```bash
python -m scripts.data_acquisition.run_pipeline --force
```

### Run Source-Specific Execution
```bash
python -m scripts.data_acquisition.run_pipeline --source market
python -m scripts.data_acquisition.run_pipeline --source macro
python -m scripts.data_acquisition.run_pipeline --source ibtracs
```

## Running Tests
```bash
pytest tests/test_data_acquisition.py -v
```

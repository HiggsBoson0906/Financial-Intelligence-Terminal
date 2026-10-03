# Data Ingestion Contracts

This document explains the normalized provider contracts established in Phase 3B.

## I. Normalized Provider Contracts
To insulate internal multi-agent orchestration logic from external vendor-specific schemas, we defined `DataProvider` base classes and standardized data schemas for:

1. **MarketDataProvider**: Emits `MarketRecord` (symbol, price, volume).
2. **NewsDataProvider**: Emits `NewsRecord` (article ID, title, content, event mapping).
3. **WeatherDataProvider**: Emits `WeatherRecord` (location, wind kt, pressure mb).
4. **MacroDataProvider**: Emits `MacroRecord` (series ID, value).

Intended providers for Phase 4:
- Alpha Vantage / Polygon for Market
- Weather API / NOAA for Weather
- Financial News API for News
- FRED for Macro

## J. Robustness and Missing-Data Behavior
Every normalized record natively incorporates a `status` field:
`'fresh', 'stale', 'fallback', 'missing', 'historical', 'simulated'`

This allows the downstream orchestration agents to interpret data quality dynamically. We **do not** silently impute zero or average values for missing data, nor do we fabricate historical context. Missingness is explicitly bubbled up to the final terminal logic so a human operator understands exactly what is or is not available.

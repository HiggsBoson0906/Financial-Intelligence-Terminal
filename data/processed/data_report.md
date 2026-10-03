# Historical Data Foundation — Comprehensive Report

**Status:** `PASS`  

## 1. Sources Used
| Domain | Primary Source | Provider / Identifier | Validation Source |
|---|---|---|---|
| Hurricanes / Events | NOAA IBTrACS v04r01 | NOAA NCEI (North Atlantic Basin) | NOAA HURDAT2 (NHC) |
| Equity & ETF Markets | yfinance | XOM, CVX, COP, OXY, XLE, SPY | Alpha Vantage (Fallback) |
| Market Benchmarks | yfinance | S&P 500 (^GSPC), VIX (^VIX), WTI (CL=F), NatGas (NG=F) | St. Louis Fed FRED |
| Macroeconomic Series | St. Louis Fed FRED | FEDFUNDS, CPIAUCSL, DGS10, DCOILWTICO, DHHNGSP | FRED REST API / CSV |
| Event-driven News | GDELT DOC 2.0 API | Focused query window around hurricane events | Deduplicated URLs |
| Financial Sentiment | Financial PhraseBank | Malo et al. (Aalto University) | 50Agree Benchmark |

## 2. Actual Date Coverage
- **Target Period:** `2010-01-01` to `2025-12-31`
- **Historical Events Range:** `2010-06-24` to `2025-11-01`
- **Market Data Range:** `2010-01-04` to `2025-12-30`
- **Macro Data Range:** `2010-01-01` to `2025-12-31`

## 3. Number of Storms & Events
- **Total Identified North Atlantic Storms:** 291
- **Unique Storm Event IDs:** 291
- **Duplicate Event IDs:** 0

### Storm Severity Breakdown (Saffir-Simpson Scale)
| Severity Category | Count |
|---|---|
| Tropical Storm | 147 |
| Category 1 | 48 |
| Category 4 | 25 |
| Category 2 | 23 |
| Tropical Depression | 18 |
| Category 3 | 17 |
| Category 5 | 13 |

## 4. Asset Coverage
- **Total Market Rows:** 40,231
- **Assets & Series Monitored:** `COP, CVX, NATURAL_GAS, OXY, SP500, SPY, VIX, WTI, XLE, XOM`
- **Zero or Negative Prices:** 0 (Filtered)

## 5. Macro Coverage
- **Calendar Days Covered:** 5,844
- **Aligned Series:** `CPI, FEDFUNDS, NATURAL_GAS, TREASURY_10Y, WTI`
- **Treatment of Frequencies:**
  - *Daily Series (FEDFUNDS, TREASURY_10Y, WTI, NATURAL_GAS):* Forward-filled up to 5 business days across market closures and holidays.
  - *Monthly Series (CPI):* Forward-filled continuously across the month from publication date to represent point-in-time state without look-ahead bias.

## 6. Event-Driven News & Sentiment Evaluation Data
- **Total News Articles Captured (GDELT):** 60
- **Unique News URLs:** 60
- **Events with News Coverage:** 2
- **Articles per Event:** Hurricane Harvey 2017: 30 | Hurricane Irma 2017: 30
- **Cross-Year Disambiguation:** Tropical Storm Harvey 2011 news volume = 0 (strictly decoupled)
- **News Collection Status Breakdown:**
  - `collected` (articles retrieved): 12 rows (2 events × 6 assets)
  - `no_match` (queried in seed window, 0 matches): 66 rows (11 events × 6 assets)
  - `not_collected` (outside seed sample): 1,668 rows (278 events × 6 assets)
- **Financial PhraseBank Benchmark Samples:** 4846
- **PhraseBank Class Distribution:** `{'neutral': 2879, 'positive': 1363, 'negative': 604}`

## 7. Event × Asset Observation Count & Impact Matrix
- **Total Event × Asset Observations:** 1746
### Observations by Asset:
| Asset | Observations |
|---|---|
| XOM | 291 |
| CVX | 291 |
| COP | 291 |
| OXY | 291 |
| XLE | 291 |
| SPY | 291 |

## 8. Missingness by Column (Event Impact Dataset)
| Column | Missing Values | Missing % |
|---|---|---|
| `event_id` | 0 | 0.0% |
| `event_name` | 0 | 0.0% |
| `event_type` | 0 | 0.0% |
| `event_date` | 0 | 0.0% |
| `asset` | 0 | 0.0% |
| `region` | 0 | 0.0% |
| `severity` | 0 | 0.0% |
| `category` | 0 | 0.0% |
| `max_wind` | 0 | 0.0% |
| `min_pressure` | 0 | 0.0% |
| `news_volume` | 0 | 0.0% |
| `news_collection_status` | 0 | 0.0% |
| `oil_price` | 0 | 0.0% |
| `gas_price` | 0 | 0.0% |
| `sp500` | 0 | 0.0% |
| `vix` | 0 | 0.0% |
| `fed_rate` | 0 | 0.0% |
| `cpi` | 0 | 0.0% |
| `treasury_10y` | 0 | 0.0% |
| `price_before` | 0 | 0.0% |
| `return_1d` | 0 | 0.0% |
| `return_3d` | 0 | 0.0% |
| `return_5d` | 0 | 0.0% |
| `volatility_before` | 0 | 0.0% |
| `volume_change` | 0 | 0.0% |
| `future_5d_return` | 0 | 0.0% |
| `future_5d_direction` | 0 | 0.0% |

## 9. Target Distribution & Class Balance
### Target Metric: `future_5d_return`
- **Count:** 1746
- **Mean:** 0.0026
- **Std Dev:** 0.0435
- **Min:** -0.1690
- **25th Percentile:** -0.0166
- **Median:** 0.0036
- **75th Percentile:** 0.0222
- **Max:** 0.7668

### Binary Classification Target: `future_5d_direction`
- **Class Counts:** `{1: 946, 0: 800}`

## 10. HURDAT2 vs IBTrACS Independent Validation Summary
- **Total HURDAT2 Storms (2010–2024):** 255
- **Total IBTrACS Storms (2010–2025):** 291
- **Matched Storms (Name & Year):** 240
- **Wind Speed Discrepancies (>5 kt):** 3
- **Pressure Discrepancies (>5 mb):** 2
- **Date Discrepancies:** 3
- **Verification Note:** HURDAT2 is maintained as an independent validation benchmark. IBTrACS records remain unaltered.

## 11. Target Leakage Verification
- **Leakage Test Result:** `PASSED - NO LEAKAGE`
### Feature-to-Target Pearson Correlations:
| Feature | Correlation with `future_5d_return` | Interpretation |
|---|---|---|
| `return_1d` | -0.0042 | Legitimate weak empirical relationship |
| `return_3d` | -0.0998 | Legitimate weak empirical relationship |
| `return_5d` | -0.0656 | Legitimate weak empirical relationship |
| `volatility_before` | 0.0480 | Legitimate weak empirical relationship |
| `volume_change` | 0.0539 | Legitimate weak empirical relationship |
| `max_wind` | 0.0242 | Legitimate weak empirical relationship |
| `min_pressure` | -0.0463 | Legitimate weak empirical relationship |

## 12. Known Limitations & Source Failures
- **GDELT News Coverage Semantics:** Zero in `news_volume` indicates either an unqueried historical event (`not_collected`, 1,668 rows) or a seed query with zero matched articles (`no_match`, 66 rows), distinguished by the explicit `news_collection_status` column. It does not imply zero global media coverage.
- **Alpha Vantage:** Free tier rate limits (25 requests/day) require yfinance as primary market provider.
- **HURDAT2:** Official release covers up through 2024; 2025 events rely on IBTrACS preliminary best track.
- **Missing Data:** Missing macro data points on specific historical dates are preserved as NaN and not artificially fabricated.

## 13. Provenance Summary
| Source Name | Provider | Local Filename | Checksum (SHA-256) |
|---|---|---|---|
| Financial_PhraseBank | Malo et al. (Aalto University) | `raw\sentiment\Sentences_50Agree.txt` | `13388b8bf2f8...` |
| GDELT_News | GDELT Project | `raw\news\gdelt_events_news.json` | `fc6e16d11a93...` |
| Macro_CPI | Federal Reserve Bank of St. Louis (FRED) | `raw\macro\CPI.csv` | `c5c04b865996...` |
| Macro_FEDFUNDS | Federal Reserve Bank of St. Louis (FRED) | `raw\macro\FEDFUNDS.csv` | `1f3c5f33cbd8...` |
| Macro_NATURAL_GAS | Federal Reserve Bank of St. Louis (FRED) | `raw\macro\NATURAL_GAS.csv` | `84382c50136b...` |
| Macro_TREASURY_10Y | Federal Reserve Bank of St. Louis (FRED) | `raw\macro\TREASURY_10Y.csv` | `313c62f6bacd...` |
| Macro_WTI | Federal Reserve Bank of St. Louis (FRED) | `raw\macro\WTI.csv` | `79cdcadf9164...` |
| Market_COP | yfinance | `raw\market\COP.csv` | `86cc559ede8f...` |
| Market_CVX | yfinance | `raw\market\CVX.csv` | `c0d9dd3ffebe...` |
| Market_NATURAL_GAS | yfinance | `raw\market\NATURAL_GAS.csv` | `d4b20f0e5601...` |
| Market_OXY | yfinance | `raw\market\OXY.csv` | `b6b412b48ee4...` |
| Market_SP500 | yfinance | `raw\market\SP500.csv` | `a2898b22d8b2...` |
| Market_SPY | yfinance | `raw\market\SPY.csv` | `165a59796976...` |
| Market_VIX | yfinance | `raw\market\VIX.csv` | `2b16108013e3...` |
| Market_WTI | yfinance | `raw\market\WTI.csv` | `0f3bdd06bf58...` |
| Market_XLE | yfinance | `raw\market\XLE.csv` | `665f5c4cb6d3...` |
| Market_XOM | yfinance | `raw\market\XOM.csv` | `8c34fa8e35f5...` |
| NOAA HURDAT2 | NOAA NHC | `raw\hurricanes\hurdat2.txt` | `7c54d0a527ff...` |
| NOAA IBTrACS | NOAA NCEI | `raw\hurricanes\ibtracs_NA.csv` | `9e41cf9d3c4e...` |

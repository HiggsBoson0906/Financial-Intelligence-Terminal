# Processed Data Schemas

This document defines the schema, field descriptions, and types for all datasets generated in `data/processed/`.

---

## 1. Historical Events Table (`historical_events.csv`)
One record per tropical cyclone / hurricane event in the North Atlantic basin (2010–2025).

| Field | Type | Description |
|---|---|---|
| `event_id` | String | Unique storm identifier from IBTrACS (SID) |
| `event_name` | String | Storm name (e.g. HARVEY, IAN) |
| `event_type` | String | Formal storm classification (e.g. Hurricane Category 4) |
| `start_date` | Date (YYYY-MM-DD) | Date storm track initiated |
| `end_date` | Date (YYYY-MM-DD) | Date storm dissipated |
| `region` | String | Geographical region at peak intensity (Gulf Coast, East Coast, Caribbean) |
| `basin` | String | Oceanic basin code (`NA` = North Atlantic) |
| `latitude` | Float | Latitude coordinate at peak intensity (degrees North) |
| `longitude` | Float | Longitude coordinate at peak intensity (degrees West negative) |
| `max_wind` | Float | Maximum sustained 1-minute wind speed (knots) |
| `min_pressure` | Float | Minimum central atmospheric pressure (millibars / hPa) |
| `severity` | String | Saffir-Simpson category classification |
| `category` | Integer | Numeric category (0 = Depression/TS, 1–5 = Hurricane) |

---

## 2. Normalized Market Observations (`normalized_market.csv`)
Daily OHLCV observations, returns, and rolling volatility across monitored assets and benchmarks.

| Field | Type | Description |
|---|---|---|
| `date` | Date (YYYY-MM-DD) | Trading date |
| `symbol` | String | Ticker symbol (e.g. `XOM`, `CVX`, `SPY`, `WTI`, `VIX`) |
| `open` | Float | Opening price |
| `high` | Float | Intraday high price |
| `low` | Float | Intraday low price |
| `close` | Float | Closing price |
| `adjusted_close` | Float | Split/dividend adjusted closing price |
| `volume` | Float | Trading volume |
| `daily_return` | Float | Daily percentage return: $(P_t - P_{t-1}) / P_{t-1}$ |
| `rolling_volatility_20d`| Float | 20-trading-day backward-looking rolling annualized volatility |

---

## 3. Daily Macro Features (`daily_macro_features.csv`)
Point-in-time macroeconomic series aligned to calendar dates.

| Field | Type | Description |
|---|---|---|
| `date` | Date (YYYY-MM-DD) | Calendar date |
| `FEDFUNDS` | Float | Effective Federal Funds Rate (%) |
| `CPI` | Float | Consumer Price Index for All Urban Consumers (Monthly level) |
| `TREASURY_10Y` | Float | 10-Year Treasury Constant Maturity Yield (%) |
| `WTI` | Float | West Texas Intermediate Crude Spot Price ($/barrel) |
| `NATURAL_GAS` | Float | Henry Hub Natural Gas Spot Price ($/million BTU) |

---

## 4. Normalized News (`normalized_news.csv`)
Event-driven news articles captured from GDELT DOC 2.0 API.

| Field | Type | Description |
|---|---|---|
| `news_id` | String | Deterministic SHA-256 hash of URL and title |
| `event_id` | String | Associated IBTrACS event ID |
| `event_name` | String | Associated storm name |
| `date` | Date (YYYY-MM-DD) | Publication or article discovery date |
| `title` | String | Headline text |
| `url` | String | Canonical URL of article |
| `domain` | String | Source domain name |
| `language` | String | Article language |

---

## 5. Event Impact Dataset (`event_impact_dataset.csv`)
Primary observation unit: **Event × Asset**.

### Architectural Separation

#### Metadata Columns
- `event_id`: Storm identifier
- `event_name`: Storm name
- `event_type`: Event category
- `event_date`: Occurrence / landfall date
- `asset`: Equity or ETF ticker
- `region`: Geographical region
- `severity`: Saffir-Simpson classification
- `category`: Numeric severity category

#### Feature Columns (Point-in-Time as of Event Date $t_0$)
- **Weather Features:** `max_wind`, `min_pressure`
- **News Features:**
  - `news_volume`: Count of matched event-driven articles.
  - `news_collection_status`: Collection state (`"collected"`: articles matched; `"no_match"`: storm queried in seed window but returned 0 matches; `"not_collected"`: event outside historical news query sample). Prevents conflating uncollected historical storms with zero real-world media attention.
- **Macro Features:** `oil_price`, `gas_price`, `sp500`, `vix`, `fed_rate`, `cpi`, `treasury_10y`
- **Market Features (Backward-looking):**
  - `price_before`: Adjusted close on $t_0$
  - `return_1d`: 1-day return preceding event
  - `return_3d`: 3-day return preceding event
  - `return_5d`: 5-day return preceding event
  - `volatility_before`: 20-day rolling volatility at $t_0$
  - `volume_change`: Volume relative to 20-day pre-event average

#### Target Columns (STRICTLY FORWARD-LOOKING TARGETS — NEVER USE AS FEATURES)
- `future_5d_return`: Realized return from $t_0$ to $t_{+5}$: $(P_{t+5} - P_{t_0}) / P_{t_0}$
- `future_5d_direction`: Binary indicator ($1$ if `future_5d_return` > 0, else $0$)

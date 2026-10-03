# Phase 1.5 — Modeling Readiness & Exploratory Data Analysis Report

**Document:** `docs/analysis/modeling_readiness.md`  
**Dataset Analyzed:** `data/processed/event_impact_dataset.csv` (1,746 rows × 27 columns)  
**Status:** `ANALYSIS ONLY` (No models trained, no pipeline changes, uncommitted)

---

## Executive Summary

This exploratory data analysis evaluates the structural, statistical, and econometric readiness of the historical hurricane event-impact dataset (`data/processed/event_impact_dataset.csv`) for predictive modeling.

### Core Findings:
1. **Target Distribution:** The continuous target `future_5d_return` exhibits a mean of `+0.26%`, median of `+0.36%`, and standard deviation of `4.35%`. The binary directional target `future_5d_direction` is naturally balanced (`54.18%` positive vs `45.82%` negative).
2. **Critical Event Dependence (High Intra-Event Correlation):** 6 assets are evaluated for each of 291 hurricane events. Cross-asset return correlation during the same event averages **`r = 0.7099`**, and common event shocks account for **`68.98%`** of total return variance. **Standard random K-Fold cross-validation is strictly invalid** as it introduces massive event-level look-ahead/contemporaneous leakage. Grouped and time-aware evaluation (`PurgedGroupTimeSeriesSplit` by `event_id`) is strictly mandatory.
3. **Linear Predictability is Weak:** Single-feature linear correlations with 5-day return are minimal (maximum $|r| = 0.0998$), confirming that individual hurricane intensity metrics alone do not linearly drive returns. Nonlinear interaction models with strong regularization and shrinkage toward macro/sector priors are required.
4. **News Feature Sparsity:** While 2017 Harvey and Irma have high-quality GDELT article coverage (`news_volume = 30`), `95.53%` of the historical dataset has `news_collection_status = "not_collected"`. GDELT volume cannot be treated as an unconditioned dense predictor without proper masking or multi-task indicator encoding.
5. **Modeling Readiness Verdict:**
   - **Regression (`future_5d_return`):** `READY WITH CONSTRAINTS` (Requires Huber/Ridge shrinkage or conservative Tree ensembles, Winsorized outliers, and grouped time splits).
   - **Classification (`future_5d_direction`):** `READY` (Balanced target, viable for probabilistic classification using regularized models or gradient boosting).

---

## 1. Dataset Overview

The dataset provides a point-in-time Event × Asset matrix covering North Atlantic tropical cyclone events between 2010 and 2025.

- **Total Rows:** `1,746`
- **Total Columns:** `27` (8 Metadata, 17 Features, 2 Targets)
- **Unique Events (Clusters):** `291` unique IBTrACS tropical cyclones
- **Unique Assets:** `6` (`XOM`, `CVX`, `COP`, `OXY`, `XLE`, `SPY`)
- **Date Range:** `2010-06-24` to `2025-10-21` (dissipation through `2025-11-01`)
- **Missing Values:** `0` (100% complete across all 27 columns)

### Observations per Asset
Every event has complete coverage across all 6 monitored assets:
| Asset | Ticker Type | Observations | Share of Dataset |
|---|---|---|---|
| **XOM** | ExxonMobil (Integrated Oil & Gas) | 291 | 16.67% |
| **CVX** | Chevron (Integrated Oil & Gas) | 291 | 16.67% |
| **COP** | ConocoPhillips (Pure Exploration & Production) | 291 | 16.67% |
| **OXY** | Occidental Petroleum (Independent E&P / Permian) | 291 | 16.67% |
| **XLE** | Energy Select Sector SPDR ETF (Sector Benchmark) | 291 | 16.67% |
| **SPY** | S&P 500 ETF Trust (Broad Market Benchmark) | 291 | 16.67% |

### Observations per Year
| Year | Storms | Observations | % of Total | Dominant Macro / Market Regime |
|---|---|---|---|---|
| **2010** | 21 | 126 | 7.22% | Post-GFC recovery, low interest rates |
| **2011** | 20 | 120 | 6.87% | US debt ceiling crisis, WTI > $100 |
| **2012** | 19 | 114 | 6.53% | Hurricane Sandy, stable commodity prices |
| **2013** | 16 | 96 | 5.50% | Taper Tantrum, calm hurricane season |
| **2014** | 9 | 54 | 3.09% | Mid-year crude price collapse ($105 to $55) |
| **2015** | 12 | 72 | 4.12% | Energy sector credit crunch, low commodity prices |
| **2016** | 16 | 96 | 5.50% | Oil bottoming at $29, US presidential election |
| **2017** | 19 | 114 | 6.53% | Hyper-active hurricane season (Harvey, Irma, Maria) |
| **2018** | 16 | 96 | 5.50% | Fed tightening cycle, Hurricanes Florence & Michael |
| **2019** | 20 | 120 | 6.87% | Fed pivot, Hurricane Dorian |
| **2020** | 31 | 186 | 10.65% | Record storm activity + COVID shock + OPEC+ price war |
| **2021** | 21 | 126 | 7.22% | Post-COVID energy reopening rally, Hurricane Ida |
| **2022** | 17 | 102 | 5.84% | Russia-Ukraine war, high inflation, Hurricane Ian |
| **2023** | 22 | 132 | 7.56% | Fed terminal rate (5.33%), Hurricane Idalia |
| **2024** | 19 | 114 | 6.53% | Category 5 Beryl, Hurricanes Helene & Milton |
| **2025** | 13 | 78 | 4.47% | Early season through Hurricane Melissa |

### Observations per Event Category (Saffir-Simpson Scale)
| Severity Label | Numeric Category | Storm Count | Observations | Share |
|---|---|---|---|---|
| **Tropical Depression** | 0 | 18 | 108 | 6.19% |
| **Tropical Storm** | 0 | 147 | 882 | 50.52% |
| **Category 1 Hurricane** | 1 | 48 | 288 | 16.50% |
| **Category 2 Hurricane** | 2 | 23 | 138 | 7.90% |
| **Category 3 Hurricane** | 3 | 17 | 102 | 5.84% |
| **Category 4 Hurricane** | 4 | 25 | 150 | 8.59% |
| **Category 5 Hurricane** | 5 | 13 | 78 | 4.47% |
| **Total** | — | **291** | **1,746** | **100.0%** |

---

## 2. Target Analysis

Two targets are evaluated:
1. `future_5d_return`: Realized return from anchor trading date $t_0$ to $t_{+5}$:
   $$\text{future\_5d\_return} = \frac{P_{t+5} - P_{t_0}}{P_{t_0}}$$
2. `future_5d_direction`: Binary indicator:
   $$\text{future\_5d\_direction} = \begin{cases} 1 & \text{if } \text{future\_5d\_return} > 0 \\ 0 & \text{if } \text{future\_5d\_return} \le 0 \end{cases}$$

### Continuous Target (`future_5d_return`) Statistics
- **Mean:** `+0.0026` (+0.26%)
- **Median:** `+0.0036` (+0.36%)
- **Standard Deviation:** `0.0435` (4.35%)
- **Minimum:** `-0.1690` (-16.90%)
- **Maximum:** `+0.7668` (+76.68%)
- **Skewness:** `+4.73` (Significantly right-skewed due to OXY post-COVID rally)
- **Kurtosis:** `59.81` (Heavy-tailed leptokurtic financial returns)

#### Quantile Breakdown
| Percentile | Value | Economic Interpretation |
|---|---|---|
| **1st Percentile (Q01)** | `-0.1042` | Severe downside drawdown (>10% loss over 5 days) |
| **5th Percentile (Q05)** | `-0.0609` | Moderate negative shock |
| **10th Percentile (Q10)** | `-0.0439` | Standard negative drift |
| **25th Percentile (Q25)** | `-0.0166` | Interquartile lower bound |
| **50th Percentile (Median)** | `+0.0036` | Slight positive median drift |
| **75th Percentile (Q75)** | `+0.0222` | Interquartile upper bound |
| **90th Percentile (Q90)** | `+0.0422` | Strong weekly outperformance |
| **95th Percentile (Q95)** | `+0.0606` | Top 5% tail performance |
| **99th Percentile (Q99)** | `+0.1228` | Exceptional upward tail shock |

#### ASCII Distribution Histogram (`future_5d_return`)
```text
  Bin Range         Count   Pct   Distribution Visual
  [-0.20 to -0.15]      3   0.2%  |
  [-0.15 to -0.10]     24   1.4%  #
  [-0.10 to -0.05]    107   6.1%  #####
  [-0.05 to  0.00]    666  38.1%  ###############################
  [ 0.00 to +0.05]    772  44.2%  ####################################
  [+0.05 to +0.10]    129   7.4%  ######
  [+0.10 to +0.15]     26   1.5%  #
  [+0.15 to +0.20]     15   0.9%  #
  [+0.20 to +0.25]      3   0.2%  |
  [+0.75 to +0.80]      1   0.1%  | (OXY OPEC+ short squeeze outlier)
```

### Binary Target (`future_5d_direction`) Balance
- **Class 1 (Positive return):** `946` observations (**`54.18%`**)
- **Class 0 (Non-positive return):** `800` observations (**`45.82%`**)
- **Natural Balance:** The target is naturally close to 50/50 without artificial resampling or SMOTE, making it ideal for standard binary classification metrics (ROC-AUC, PR-AUC, Brier score).

---

## 3. Asset-Wise Target Behavior

| Asset | Ticker Profile | Obs | Mean Return | Median Return | Volatility (Std) | Positive % | Negative % | Minimum | Maximum |
|---|---|---|---|---|---|---|---|---|---|
| **XOM** | Supermajor Integrated | 291 | `+0.0026` | `+0.0029` | `0.0352` | 54.30% | 45.70% | -12.76% | +18.28% |
| **CVX** | Supermajor Integrated | 291 | `+0.0017` | `+0.0033` | `0.0340` | 56.01% | 43.99% | -13.35% | +16.70% |
| **COP** | Pure-Play E&P | 291 | `+0.0042` | `+0.0072` | `0.0458` | 54.30% | 45.36% | -13.38% | +21.14% |
| **OXY** | High-Beta E&P / Permian | 291 | `+0.0023` | `-0.0007` | **`0.0703`** | **49.83%** | **50.17%** | **-16.90%** | **+76.68%** |
| **XLE** | Energy Sector ETF | 291 | `+0.0023` | `+0.0023` | `0.0381` | 51.89% | 48.11% | -13.53% | +18.81% |
| **SPY** | Broad Market ETF | 291 | `+0.0027` | `+0.0050` | **`0.0219`** | **58.76%** | **41.24%** | -10.01% | +7.23% |

### Key Asset Insights:
1. **Volatility Hierarchy:** Volatility scales directly with financial leverage and operating focus:
   $$\sigma(\text{SPY: } 2.19\%) < \sigma(\text{CVX: } 3.40\%) \approx \sigma(\text{XOM: } 3.52\%) < \sigma(\text{XLE: } 3.81\%) < \sigma(\text{COP: } 4.58\%) < \sigma(\text{OXY: } 7.03\%)$$
2. **Occidental Petroleum (OXY) Anomaly:** OXY exhibits more than **double the volatility** of ExxonMobil and Chevron, and over **3x the volatility of SPY**. OXY is the only asset whose median return is slightly negative (`-0.07%`), reflecting high debt load and operating sensitivity during commodity downturns.
3. **SPY Structural Drift:** SPY exhibits a `58.76%` positive return frequency, reflecting the underlying secular upward equity drift over the 15-year macroeconomic expansion.

---

## 4. Event Category Analysis

*Descriptive analysis of post-event 5-day returns across Saffir-Simpson intensity tiers (no causal claims inferred):*

| Severity Tier | Numeric Category | Storm Count | Sample Size | Mean 5d Return | Median 5d Return | Volatility ($\sigma$) | Positive % | Min Return | Max Return |
|---|---|---|---|---|---|---|---|---|---|
| **Tropical Depression** | 0 | 18 | 108 | `+0.0063` | `+0.0035` | 0.0337 | 55.56% | -9.08% | +12.45% |
| **Tropical Storm** | 0 | 147 | 882 | `+0.0035` | `+0.0038` | 0.0489 | 53.74% | -16.90% | +76.68% |
| **Category 1** | 1 | 48 | 288 | `-0.0031` | `+0.0005` | 0.0314 | 50.69% | -14.89% | +9.63% |
| **Category 2** | 2 | 23 | 138 | `+0.0011` | `+0.0069` | 0.0356 | 57.97% | -16.90% | +14.10% |
| **Category 3** | 3 | 17 | 102 | `-0.0047` | `+0.0026` | 0.0481 | 54.90% | -14.89% | +12.72% |
| **Category 4** | 4 | 25 | 150 | `+0.0143` | `+0.0065` | 0.0431 | 57.33% | -6.88% | +18.13% |
| **Category 5** | 5 | 13 | 78 | `-0.0013` | `+0.0022` | 0.0280 | 56.41% | -6.53% | +5.53% |

### Key Category Insights:
- **Non-Monotonic Severity Relationship:** Market return is **not a monotonic function of storm category**. Higher category storms do not consistently cause negative returns. For example, Category 4 events show a positive mean return (`+1.43%`), while Category 1 and Category 3 show slight negative means (`-0.31%` and `-0.47%`).
- **Oil Price Supply Disruption Effect:** Major hurricanes (Category 3–5) frequently shut down Gulf of Mexico offshore crude production and refining capacity, pushing crude oil prices higher, which can benefit exploration and production equities over short horizons.
- **Meteorological Intensity is Not Sufficient Alone:** Storm intensity alone cannot predict equity return without conditioning on storm track (Gulf vs open Atlantic), refinery proximity, and concurrent macroeconomic policy.

---

## 5. Feature Distributions

Comprehensive parametric and non-parametric profile of all 15 numerical input features:

| Feature Name | Domain | Dtype | Min | Q25 | Median | Mean | Q75 | Max | Std | Skewness | Distribution Profile |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `max_wind` | Weather | `float64` | 23.00 | 45.00 | 55.00 | 68.52 | 85.00 | 165.00 | 32.00 | `+1.01` | Moderately right-skewed |
| `min_pressure` | Weather | `float64` | 892.00 | 968.00 | 992.00 | 981.72 | 1001.00 | 1014.00 | 25.87 | `-1.20` | Moderately left-skewed |
| `category` | Weather | `int64` | 0 | 0 | 0 | 1.07 | 2.00 | 5 | 1.54 | `+1.29` | Discrete ordinal, zero-inflated |
| `price_before` | Market | `float64` | 8.48 | 34.75 | 53.94 | 90.86 | 93.52 | 665.93 | 107.29 | `+2.87` | Heavy right tail (SPY index price) |
| `return_1d` | Market | `float64` | -0.0860 | -0.0080 | -0.0001 | -0.0000 | 0.0079 | 0.0988 | 0.0157 | `+0.05` | Symmetric, leptokurtic |
| `return_3d` | Market | `float64` | -0.1086 | -0.0147 | +0.0005 | -0.0002 | 0.0144 | 0.1662 | 0.0287 | `+0.24` | Symmetric, leptokurtic |
| `return_5d` | Market | `float64` | -0.1882 | -0.0196 | +0.0013 | +0.0000 | 0.0186 | 0.1876 | 0.0368 | `+0.11` | Symmetric, leptokurtic |
| `volatility_before` | Market | `float64` | 0.0383 | 0.1512 | 0.2124 | 0.2465 | 0.3006 | 1.6662 | 0.1451 | `+2.58` | Heavily right-skewed (vol spikes) |
| `volume_change` | Market | `float64` | -0.6797 | -0.2273 | -0.0663 | +0.0467 | 0.1907 | 3.1993 | 0.4396 | `+2.46` | Heavily right-skewed (volume bursts) |
| `oil_price` | Macro | `float64` | 29.43 | 52.63 | 70.78 | 69.97 | 85.82 | 116.87 | 19.87 | `-0.02` | Bimodal / Broad uniform |
| `gas_price` | Macro | `float64` | 1.64 | 2.61 | 2.95 | 3.37 | 3.85 | 9.34 | 1.26 | `+2.21` | Heavily right-skewed (winter spikes) |
| `sp500` | Macro | `float64` | 1048.92 | 1695.53 | 2885.57 | 3015.27 | 4217.04 | 6753.72 | 1491.66 | `+0.63` | Upward trending non-stationary |
| `vix` | Macro | `float64` | 9.14 | 14.53 | 17.47 | 19.51 | 23.87 | 43.05 | 6.84 | `+1.05` | Moderately right-skewed |
| `fed_rate` | Macro | `float64` | 0.05 | 0.09 | 0.20 | 1.47 | 2.30 | 5.33 | 1.85 | `+1.10` | Zero-bound cluster (ZIRP regimes) |
| `news_volume` | News | `int64` | 0 | 0 | 0 | 0.21 | 0 | 30 | 2.48 | `+11.95` | Extremely sparse / zero-inflated |

### Key Skewness Findings:
- **Heavily Skewed ($\text{Skew} > 2.0$):** `news_volume` (+11.95), `price_before` (+2.87), `volatility_before` (+2.58), `volume_change` (+2.46), `gas_price` (+2.21).
- **Transformation Recommendation:** For linear models and distance-based estimators, apply log-transform $\log(1 + x)$ or Quantile/RobustScaler to `volatility_before`, `volume_change`, and `gas_price`. Tree-based models (XGBoost/LightGBM) natively handle monotonicity without scaling.

---

## 6. Correlation Analysis

### Target Correlation Table (Ranked)
Correlation of each numerical feature against `future_5d_return`:

| Feature Name | Pearson ($r$) | Spearman ($\rho$) | Direction | Analytical Interpretation |
|---|---|---|---|---|
| `vix` | **`+0.0590`** | `+0.0252` | Positive | Elevated pre-event implied vol correlates with slight mean-reversion bounce |
| `volume_change` | **`+0.0539`** | **`+0.0782`** | Positive | Unusual pre-event volume accumulation precedes positive momentum |
| `volatility_before`| **`+0.0480`** | `-0.0116` | Weak | Linear positive correlation driven by 2020 recovery outliers |
| `fed_rate` | `+0.0346` | `+0.0414` | Weak | Higher rate regimes coincide with 2022–2024 energy super-cycle |
| `sp500` | `+0.0313` | `+0.0171` | Weak | Bull market baseline drift |
| `max_wind` | `+0.0242` | `+0.0369` | Weak | Slight positive supply disruption effect on energy prices |
| `news_volume` | `+0.0229` | `+0.0309` | Weak | High media attention events (Harvey/Irma) had positive 5d returns |
| `category` | `+0.0100` | `+0.0051` | Weak | Negligible linear correlation with discrete category |
| `price_before` | `-0.0023` | `+0.0001` | Negligible| Nominal price level has no predictive content |
| `return_1d` | `-0.0042` | `-0.0173` | Negligible| Daily noise |
| `gas_price` | `-0.0192` | `+0.0233` | Negligible| Weak commodity relationship |
| `oil_price` | `-0.0379` | `+0.0069` | Negative | High baseline oil prices slightly diminish upside room for supply shocks |
| `min_pressure` | `-0.0463` | `-0.0479` | Negative | Lower pressure (more intense storm) correlates slightly with higher return |
| `return_5d` | **`-0.0656`** | `-0.0234` | Negative | Short-term mean-reversion (assets up in prior 5d retrace) |
| `return_3d` | **`-0.0998`** | `-0.0190` | Negative | Strongest single negative predictor: 3-day short-term mean-reversion |

### Important Descriptive Notice:
No feature exhibits $|r| > 0.10$ with future returns. This confirms that **market pricing in efficient financial markets does not exhibit naive linear arbitrage opportunities**. Machine learning models must search for nonlinear interaction effects and conditional regimes rather than fitting simple bivariate lines.

### Feature-to-Feature Collinearity:
High multicollinearity is concentrated in two clusters:
1. **Physical Weather Cluster:**
   - `max_wind` $\leftrightarrow$ `category`: $r = +0.9660$
   - `max_wind` $\leftrightarrow$ `min_pressure`: $r = -0.9600$
   - `min_pressure` $\leftrightarrow$ `category`: $r = -0.9337$
   *Implication:* Tree models will randomly split across these three features. Linear models will suffer severe variance inflation unless regularized (L2 Ridge / ElasticNet) or reduced via PCA.
2. **Short-Term Momentum Cluster:**
   - `return_3d` $\leftrightarrow$ `return_5d`: $r = +0.7550$
   - `return_1d` $\leftrightarrow$ `return_3d`: $r = +0.5670$
3. **Macro State Cluster:**
   - `sp500` $\leftrightarrow$ `fed_rate`: $r = +0.7381$
   - `volatility_before` $\leftrightarrow$ `vix`: $r = +0.5971$
   - `oil_price` $\leftrightarrow$ `gas_price`: $r = +0.5073$

---

## 7. Outlier Analysis

### Statistical Outlier Audit Across Key Metrics

| Variable | Min Observed | Max Observed | > 3$\sigma$ Outliers | IQR Outliers ($1.5 \times \text{IQR}$) |
|---|---|---|---|---|
| `future_5d_return` | `-0.1690` | `+0.7668` | 21 (1.20%) | 97 (5.56%) |
| `return_1d` | `-0.0860` | `+0.0988` | 31 (1.78%) | 87 (4.98%) |
| `return_3d` | `-0.1086` | `+0.1662` | 32 (1.83%) | 89 (5.10%) |
| `return_5d` | `-0.1882` | `+0.1876` | 32 (1.83%) | 77 (4.41%) |
| `volume_change` | `-0.6797` | `+3.1993` | 34 (1.95%) | 94 (5.38%) |
| `volatility_before` | `0.0383` | `1.6662` | 9 (0.52%) | 86 (4.93%) |

### Top 5 Extreme Return Observations
| Event ID | Storm Name | Date | Asset | Realized Return | Historical Root Cause |
|---|---|---|---|---|---|
| `2020154N19269` | CRISTOBAL | 2020-06-01 | **OXY** | **`+0.7668`** | Historic OPEC+ output cut agreement extension + massive short squeeze |
| `2020314N28313` | THETA | 2020-11-08 | **COP** | **`+0.2114`** | Pfizer COVID-19 vaccine announcement day (global cyclical equity surge) |
| `2020154N19269` | CRISTOBAL | 2020-06-01 | **XLE** | **`+0.1881`** | Same week broad energy sector index surge |
| `2020154N19269` | CRISTOBAL | 2020-06-01 | **XOM** | **`+0.1828`** | Same week ExxonMobil rally |
| `2020318N16289` | IOTA | 2020-11-12 | **OXY** | **`+0.1813`** | Post-vaccine reopening beta rally |

### Bottom 5 Extreme Return Observations
| Event ID | Storm Name | Date | Asset | Realized Return | Historical Root Cause |
|---|---|---|---|---|---|
| `2020251N15342` | RENE | 2020-09-06 | **OXY** | **`-0.1690`** | Broad equity selloff + WTI dropped from $43 to $37 |
| `2020251N17319` | PAULETTE | 2020-09-07 | **OXY** | **`-0.1690`** | Same September 2020 energy market drawdown |
| `2020224N11326` | JOSEPHINE | 2020-08-10 | **OXY** | **`-0.1559`** | Pre-earnings volatility and debt restructuring fears |
| `2021227N36297` | HENRI | 2021-08-15 | **OXY** | **`-0.1489`** | Delta variant demand destruction selloff |
| `2021225N15313` | GRACE | 2021-08-13 | **OXY** | **`-0.1489`** | Concurrent August 2021 crude demand selloff |

### Outlier Handling Recommendations (Do NOT Drop):
1. **Never Remove Historical Extremes:** These extreme observations represent genuine market events (vaccine announcement, OPEC+ war, demand crashes). Removing them produces unrealistic survivorship bias and underestimates tail risk.
2. **Winsorization / Clipping:** For continuous regression loss functions ($L_2$ MSE), clip targets at the 1st and 99th percentiles (`[-10.4%, +12.3%]`) to prevent OXY's `+76.68%` observation from dominating gradient steps.
3. **Huber Loss / MAE:** Use robust loss functions (Huber loss with $\delta = 0.02$) that transition from quadratic to linear error penalties for deviations beyond 2%.
4. **Classification Conversion:** In classification (`future_5d_direction`), extreme returns naturally map to clean $\{0, 1\}$ labels, completely neutralizing magnitude distortion.

---

## 8. News Feature Analysis

| Status Value | Category | Event Count | Row Count | Share of Dataset | Real-World Meaning |
|---|---|---|---|---|---|
| `collected` | Major Hurricanes Seed | 2 storms | 12 rows | **`0.69%`** | Articles retrieved via GDELT (Harvey 2017: 30, Irma 2017: 30) |
| `no_match` | Major Hurricanes Seed | 11 storms | 66 rows | **`3.78%`** | Queried in seed window, but 0 articles returned by API |
| `not_collected`| Unqueried Historical Storms | 278 storms | 1,668 rows | **`95.53%`** | Historical storms outside the seed collection sample |

### Critical ML Modeling Guidance for News:
1. **Do Not Treat "Not Collected" as Zero News:** 278 historical hurricanes did not have zero media attention in reality. They were simply not queried in this offline snapshot.
2. **Imputation Hazard:** Using raw `news_volume` as a numerical feature will cause models to learn spurious correlations between `news_volume > 0` and 2017 market regimes.
3. **Recommended Modeling Strategy:**
   - **Baseline Feature Set:** Exclude `news_volume` from primary quantitative models.
   - **Alternative Masked Feature Set:** Encode `news_collection_status` as a 3-class categorical dummy variable (`is_collected`, `is_no_match`, `is_unqueried`) to allow the model to condition on sample availability.

---

## 9. Temporal Analysis

### Annual Distribution and Target Stability
```text
 Year  Storms   Obs   Mean 5d Return   Median Return   Volatility (Std)   Positive %
 2010      21   126        +0.0111           +0.0141             0.0264       73.81%
 2011      20   120        -0.0031           -0.0018             0.0387       46.67%
 2012      19   114        +0.0026           +0.0034             0.0254       50.88%
 2013      16    96        +0.0026           +0.0053             0.0162       57.29%
 2014       9    54        -0.0079           -0.0039             0.0210       40.74%
 2015      12    72        -0.0084           -0.0089             0.0541       40.28%
 2016      16    96        -0.0034           +0.0013             0.0255       52.08%
 2017      19   114        +0.0024           +0.0017             0.0209       53.51%
 2018      16    96        +0.0015           +0.0086             0.0321       65.63%
 2019      20   120        +0.0042           +0.0037             0.0317       52.50%
 2020      31   186        +0.0032           -0.0068             0.0893       44.62%
 2021      21   126        +0.0098           +0.0062             0.0474       56.35%
 2022      17   102        -0.0026           +0.0071             0.0484       53.92%
 2023      22   132        +0.0024           +0.0039             0.0333       54.55%
 2024      19   114        +0.0161           +0.0127             0.0302       64.04%
 2025      13    78        -0.0034           +0.0051             0.0292       53.85%
```

### Key Temporal Regime Observations:
1. **Regime 1: Post-GFC & Shale Boom (2010–2013):** High storm frequency, stable upward trend, modest volatility ($\sigma \approx 2.0\%\text{--}2.6\%$).
2. **Regime 2: Energy Bear Market (2014–2016):** Oil crash resulted in negative mean 5-day returns across energy equities (`-0.79%` in 2014, `-0.84%` in 2015).
3. **Regime 3: COVID-19 Volatility Super-Spike (2020):** 2020 was both the most active hurricane season on record (31 storms, 186 observations) and had by far the highest return volatility ($\sigma = 8.93\%$), containing both the single largest positive and negative returns in the entire dataset.
4. **Regime 4: High Inflation & Energy Rebound (2021–2024):** Elevated mean returns (`+1.61%` in 2024), driven by broad commodity strength and geopolitical supply tightening.

---

## 10. Event / Asset Dependence (Clustering Analysis)

A foundational architectural reality of this dataset is that **6 assets are observed for every single hurricane event**:
$$\text{Total Rows (1,746)} = 291 \text{ unique storms} \times 6 \text{ assets}$$

### Cross-Asset Target Correlation During the Same Hurricane Event:
Pivoting the dataset across `event_id` reveals the intra-event correlation of `future_5d_return`:

| Asset Pair | Cross-Asset Correlation ($r$) | Economic Relationship |
|---|---|---|
| **XLE $\leftrightarrow$ XOM** | **`+0.9309`** | Sector ETF dominated by top weighted constituent (XOM) |
| **XLE $\leftrightarrow$ CVX** | **`+0.9099`** | Sector ETF dominated by second largest constituent (CVX) |
| **COP $\leftrightarrow$ XLE** | **`+0.8955`** | Top E&P constituent vs sector benchmark |
| **XOM $\leftrightarrow$ CVX** | **`+0.8626`** | Dual US integrated supermajors |
| **COP $\leftrightarrow$ CVX** | **`+0.8294`** | E&P vs Integrated peer |
| **COP $\leftrightarrow$ XOM** | **`+0.8165`** | E&P vs Integrated peer |
| **XLE $\leftrightarrow$ OXY** | **`+0.7810`** | High-beta E&P vs Sector ETF |
| **XOM $\leftrightarrow$ OXY** | **`+0.7397`** | Supermajor vs High-beta E&P |
| **COP $\leftrightarrow$ OXY** | **`+0.7125`** | Upstream E&P peer correlation |
| **CVX $\leftrightarrow$ OXY** | **`+0.6565`** | Supermajor vs High-beta E&P |
| **SPY $\leftrightarrow$ XLE** | **`+0.5893`** | Broad equity market vs Energy sector |
| **SPY $\leftrightarrow$ CVX** | **`+0.5699`** | Broad market vs Chevron |
| **SPY $\leftrightarrow$ XOM** | **`+0.5176`** | Broad market vs ExxonMobil |
| **SPY $\leftrightarrow$ COP** | **`+0.4564`** | Broad market vs ConocoPhillips |
| **SPY $\leftrightarrow$ OXY** | **`+0.3809`** | Broad market vs Occidental |

### Statistical Decomposition of Variance:
- **Total Target Variance:** `0.001889`
- **Between-Event Target Variance (Common Shock):** `0.001303`
- **Proportion of Variance Explained by Common Event Shock:** **`68.98%`**
- **Asset-Specific Residual Variance:** **`31.02%`**

### Critical Implications for ML Validation:
> [!CAUTION]
> **Random Train/Test Splitting is Fatally Flawed:**  
> If an event (e.g., Hurricane Ian) is randomly split with XOM in the training set and CVX in the test set, the test set model will already "know" the market's response to Hurricane Ian via the 0.86+ correlation between XOM and CVX.  
> **Rule:** All observations belonging to the same `event_id` MUST remain together in either the training fold or the testing fold.

---

## 11. Conceptual Baselines (No Models Trained)

To establish benchmark performance before fitting any machine learning model, four naive and heuristic baselines are formalized:

### Baseline A: Constant Global Mean Return (Regression)
- **Rule:** $\hat{y}_i = \bar{y}_{\text{train}} = +0.002634$ for all $i$.
- **Full-Sample Evaluation:**
  - **MAE:** `0.0284` (2.84%)
  - **RMSE:** `0.0434` (4.34%)
  - **$R^2$:** `0.0000` (By definition)
  - **Directional Accuracy:** `54.18%`

### Baseline B: Majority Class Prediction (Classification)
- **Rule:** $\hat{d}_i = 1$ (Predict positive return for every observation).
- **Full-Sample Evaluation:**
  - **Accuracy:** `54.18%`
  - **Balanced Accuracy:** `50.00%` (Sensitivity = 100%, Specificity = 0%)
  - **F1-Score (Positive Class):** `0.7028`
  - **ROC-AUC:** `0.5000` (No discriminative ability)

### Baseline C: Asset-Specific Historical Mean (Regression)
- **Rule:** Predict the historical mean of each specific asset $\hat{y}_{i, a} = \bar{y}_a$:
  - $\hat{y}_{\text{COP}} = +0.0042$, $\hat{y}_{\text{SPY}} = +0.0027$, $\hat{y}_{\text{XOM}} = +0.0026$, $\hat{y}_{\text{OXY}} = +0.0023$, $\hat{y}_{\text{XLE}} = +0.0023$, $\hat{y}_{\text{CVX}} = +0.0017$.
- **Full-Sample Evaluation:**
  - **MAE:** `0.0284`
  - **RMSE:** `0.0434`
  - **$R^2$:** `+0.0003` (Asset identity explains only 0.03% of return variance)
  - **Directional Accuracy:** `54.18%`

### Baseline D: Hurricane Severity Category Mean (Regression)
- **Rule:** Predict the historical mean of the storm's Saffir-Simpson category $\hat{y}_{i, c} = \bar{y}_c$:
  - Category 4: `+0.0143`, Cat 0: `+0.0038`, Cat 2: `+0.0011`, Cat 5: `-0.0013`, Cat 1: `-0.0031`, Cat 3: `-0.0047`.
- **Full-Sample Evaluation:**
  - **MAE:** `0.0285`
  - **RMSE:** `0.0432`
  - **$R^2$:** `+0.0117` (Storm category explains 1.17% of variance)
  - **Directional Accuracy:** `52.81%`

---

## 12. Modeling Readiness Evaluation

| Dimension | Assessment | Evidence & Technical Rationale | Status |
| :--- | :---: | :--- | :---: |
| **Sample Size** | **ADEQUATE** | 1,746 rows across 291 events. Sufficient for low-complexity models (depth 3–4 trees, regularized linear models). Insufficient for deep learning. | **PASS** |
| **Feature Quality** | **HIGH** | Realistic physical weather units (kt, mb), point-in-time FRED macro series, validated against HURDAT2 and FRED. | **PASS** |
| **Missingness** | **PERFECT** | 0 nulls across all 27 columns. No synthetic numeric zero-fills for continuous features. | **PASS** |
| **Target Balance** | **EXCELLENT** | Directional target is 54.2% / 45.8%. No synthetic balancing (SMOTE) required. | **PASS** |
| **Temporal Separation** | **PROVEN** | Features strictly index trading days $\le t_0$; targets evaluate $[t_0, t_{+5}]$. No look-ahead leakage. | **PASS** |
| **Event Clustering** | **REQUIRES CARE** | 68.98% of target variance is shared across assets during an event. Requires Grouped Splitting. | **CONDITIONAL** |
| **News Sparsity** | **SPARSE** | 95.53% unqueried. Must not be used as an unconditioned dense predictor. | **RESTRICTED** |
| **Tail Risk / Outliers**| **HEAVY TAILED** | OXY June 2020 (+76.7%) requires Huber loss, Winsorization, or robust evaluation. | **CONDITIONAL** |

### Official Readiness Verdict:
- **Regression (`future_5d_return`):** **`READY WITH CONSTRAINTS`**  
  *Constraints: Must use event-grouped cross-validation, Huber/L1 loss or target clipping at 1st/99th percentiles, and exclude/mask news volume.*
- **Classification (`future_5d_direction`):** **`READY`**  
  *Naturally balanced class target, ideal for probabilistic scoring, ROC-AUC evaluation, and risk hedge trigger modeling.*

---

## 13. Model Selection Recommendation

### Comparative Model Analysis for $N = 1,746$ (291 Event Clusters)

| Model Family | Key Strengths | Primary Risks on this Dataset | Data Preprocessing Burden | Interpretability | Fit for Phase 2 |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **1. XGBoost / LightGBM** | Captures non-linear weather-macro interactions; invariant to feature scaling; native split handling. | Overfitting due to small cluster count (291 events); sensitive to extreme OXY target outliers without clipping. | Low (handles raw features without standardizing). | High (Tree SHAP, feature importances). | **VIABLE** (with shallow depth $\le 3$, min_child_weight $\ge 15$) |
| **2. Regularized Linear Model (Ridge / ElasticNet)** | Extreme resilience to overfitting; well-defined coefficient confidence; excellent for small sample sizes. | Cannot capture nonlinear threshold effects (e.g. Cat 3+ Gulf storm vs open ocean storm). | High (requires scaling, one-hot encoding, and interaction engineering). | Very High (direct signed coefficients). | **STRONG BASELINE** |
| **3. Factor / Econometric Event Study Model** | Isolates market beta from storm-specific abnormal return (CAR); directly aligns with financial economic theory. | Requires estimating CAPM/Fama-French betas on pre-event windows. | Moderate. | Highest. | **BENCHMARK** |
| **4. Deep Neural Networks / TabNet** | Capable of learning arbitrary representations. | Severe overfitting on 291 clusters; opaque predictions; unwarranted compute complexity. | Very High. | Low (Black box). | **UNSUITABLE** |

### Single Recommended Modeling Direction (Engineering Decision):
> **RECOMMENDED DIRECTION: Regularized Gradient Boosted Decision Trees (LightGBM / XGBoost) with a Robust Linear ElasticNet Benchmark.**
> 
> **Architecture Plan:**
> 1. **Baseline / Benchmark Model:** ElasticNet Logistic Regression / Ridge Regression with 1-hot asset encoding.
> 2. **Primary Nonlinear Model:** LightGBM / XGBoost constrained with:
>    - Max depth $\le 3$
>    - Number of estimators $\le 100$ (with early stopping)
>    - Minimum child weight / leaf samples $\ge 20$ (forcing splits to represent at least 3–4 distinct hurricane events)
>    - Subsample / colsample $\le 0.80$ to prevent single-feature dominance
>    - Objective: `regression_l1` / `huber` for returns; `binary:logistic` with log-loss for direction.

---

## 14. Validation Strategy Protocol

To ensure 100% scientific validity and prevent both **temporal leakage** and **cross-asset intra-event leakage**, the following evaluation protocol must be adopted for Phase 2:

### 1. Splitting Scheme: Purged Group Time-Series Split
```text
Chronological Event Timeline (2010 -------------> 2025):
Fold 1: Train [2010 - 2014] (Events  1 -  85) | Buffer (10d) | Test [2015 - 2017] (Events  86 - 132)
Fold 2: Train [2010 - 2017] (Events  1 - 132) | Buffer (10d) | Test [2018 - 2020] (Events 133 - 199)
Fold 3: Train [2010 - 2020] (Events  1 - 199) | Buffer (10d) | Test [2021 - 2023] (Events 200 - 259)
Fold 4: Train [2010 - 2023] (Events  1 - 259) | Buffer (10d) | Test [2024 - 2025] (Events 260 - 291)
```

- **Group Key:** `event_id` (Ensures all 6 assets for any storm are strictly in the same split).
- **Purging / Embargo Buffer:** A minimum of 10 calendar days between training end and testing start to prevent target overlap between adjacent storms.
- **Strict Pipeline Fit:** All feature scalers, encoders, and target clipping thresholds must be fit **strictly on the training fold** and applied transform-only to validation/test folds.

### 2. Primary Evaluation Metrics

#### Regression Metrics:
- **Primary Metric:** **MAE** (Mean Absolute Error) — Robust to OXY outliers and directly interpretable in percentage points of return.
- **Secondary Metric:** **RMSE** (Root Mean Squared Error) — Penalizes large unexpected tail moves.
- **Threshold Metric:** **$R^2 > 0.01$** over Baseline A (Global Mean).
- **Directional Accuracy:** % of correct signs ($\text{sign}(\hat{y}) == \text{sign}(y)$).

#### Classification Metrics:
- **Primary Metric:** **ROC-AUC** — Measures rank-ordering and discriminative power across threshold settings.
- **Secondary Metric:** **Brier Score** — Evaluates calibration of predicted probabilities ($P(\text{return} > 0)$).
- **Operational Metrics:** **Precision @ Top Decile**, **F1-Score (Macro)**, **Balanced Accuracy**.
- *Constraint: Never evaluate accuracy alone, as market drift gives naive positive baselines 54.2% accuracy.*

---

## 15. Known Limitations & Research Boundaries

1. **GDELT News Sparsity:** Current news features reflect an offline seed of 60 articles across 2 events. In Phase 2, `news_volume` should either be omitted from baseline models or encoded alongside `news_collection_status`.
2. **Post-Event Target Overlap in Active Clusters:** During hyper-active hurricane weeks (e.g. Sept 2020: Paulette and Rene occurring within 2 days), the 5-day return windows overlap. Grouping by event clusters and purging handles this cleanly.
3. **Macro Confounding:** Returns over 5 days are influenced by concurrent macroeconomic events (Fed announcements, OPEC meetings). Models must treat macro variables (`vix`, `fed_rate`, `oil_price`) as conditioning state controls.

---

## 16. Verification Sign-Off

- **Report Path:** `docs/analysis/modeling_readiness.md`
- **Audit Date:** 2026-10-03
- **Phase 1.5 Modeling Readiness Status:** **APPROVED (READY WITH CONSTRAINTS)**

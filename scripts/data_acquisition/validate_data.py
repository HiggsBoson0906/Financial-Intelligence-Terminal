import argparse
from pathlib import Path
from typing import Dict, Any
import pandas as pd
import numpy as np

from .config import PROCESSED_DIR, EQUITY_ASSETS
from .utils import logger


def validate_all_data(processed_dir: Path = PROCESSED_DIR) -> Dict[str, Any]:
    """
    Performs comprehensive data quality, integrity, and leakage validation.
    Returns structured results report.
    """
    logger.info("Executing comprehensive dataset validation...")
    report = {
        "status": "PASS",
        "checks": {},
        "issues_found": []
    }

    events_file = processed_dir / "historical_events.csv"
    market_file = processed_dir / "normalized_market.csv"
    macro_file = processed_dir / "daily_macro_features.csv"
    news_file = processed_dir / "normalized_news.csv"
    impact_file = processed_dir / "event_impact_dataset.csv"
    phrasebank_file = processed_dir / "normalized_sentiment_phrasebank.csv"

    # 1. Historical Events Validation
    if events_file.exists():
        ev_df = pd.read_csv(events_file)
        unique_ids = ev_df["event_id"].nunique()
        dupes = ev_df.duplicated(subset=["event_id"]).sum()
        
        # Check suspicious values
        invalid_winds = ev_df[(ev_df["max_wind"] < 0) | (ev_df["max_wind"] > 250)]
        invalid_pressures = ev_df[(ev_df["min_pressure"] < 850) | (ev_df["min_pressure"] > 1050)]

        report["checks"]["historical_events"] = {
            "total_storms": len(ev_df),
            "unique_event_ids": unique_ids,
            "duplicate_event_ids": int(dupes),
            "date_range": [str(ev_df["start_date"].min()), str(ev_df["end_date"].max())],
            "invalid_wind_count": len(invalid_winds),
            "invalid_pressure_count": len(invalid_pressures),
            "severity_distribution": ev_df["severity"].value_counts().to_dict()
        }
        if dupes > 0:
            report["issues_found"].append(f"Found {dupes} duplicate event IDs in historical_events.csv")
    else:
        report["issues_found"].append("historical_events.csv not found.")

    # 2. Market Observations Validation
    if market_file.exists():
        mkt_df = pd.read_csv(market_file)
        neg_prices = mkt_df[mkt_df["adjusted_close"] <= 0]
        symbols_found = mkt_df["symbol"].unique().tolist()
        
        # Check return anomalies (e.g. daily return > 1000% or < -90%)
        extreme_returns = mkt_df[(mkt_df["daily_return"] > 5.0) | (mkt_df["daily_return"] < -0.9)]

        report["checks"]["market_data"] = {
            "total_rows": len(mkt_df),
            "symbols_covered": symbols_found,
            "negative_or_zero_prices": len(neg_prices),
            "extreme_daily_returns": len(extreme_returns),
            "date_range": [str(mkt_df["date"].min()), str(mkt_df["date"].max())]
        }
        if len(neg_prices) > 0:
            report["issues_found"].append(f"Found {len(neg_prices)} negative or zero prices in market data.")
    else:
        report["issues_found"].append("normalized_market.csv not found.")

    # 3. Macro Series Validation
    if macro_file.exists():
        mac_df = pd.read_csv(macro_file)
        mac_cols = [c for c in mac_df.columns if c != "date"]
        missing_by_macro = mac_df[mac_cols].isna().sum().to_dict()

        report["checks"]["macro_data"] = {
            "total_days": len(mac_df),
            "macro_series_columns": mac_cols,
            "missing_values_by_series": missing_by_macro,
            "date_range": [str(mac_df["date"].min()), str(mac_df["date"].max())]
        }
    else:
        report["issues_found"].append("daily_macro_features.csv not found.")

    # 4. News Validation
    if news_file.exists():
        news_df = pd.read_csv(news_file)
        report["checks"]["news_data"] = {
            "total_articles": len(news_df),
            "unique_urls": news_df["url"].nunique(),
            "events_covered": news_df["event_name"].nunique()
        }
    else:
        report["issues_found"].append("normalized_news.csv not found.")

    # 5. PhraseBank Validation
    if phrasebank_file.exists():
        pb_df = pd.read_csv(phrasebank_file)
        report["checks"]["phrasebank"] = {
            "total_sentences": len(pb_df),
            "class_distribution": pb_df["sentiment"].value_counts().to_dict()
        }

    # 6. Event Impact Dataset & Target Leakage Validation
    if impact_file.exists():
        imp_df = pd.read_csv(impact_file)
        target_col = "future_5d_return"
        dir_col = "future_5d_direction"

        # Missingness by column
        missing_summary = imp_df.isna().sum().to_dict()

        # Distribution of targets
        valid_targets = imp_df[target_col].dropna()
        target_stats = {
            "count": int(valid_targets.count()),
            "mean": float(valid_targets.mean()) if not valid_targets.empty else 0.0,
            "std": float(valid_targets.std()) if not valid_targets.empty else 0.0,
            "min": float(valid_targets.min()) if not valid_targets.empty else 0.0,
            "q25": float(valid_targets.quantile(0.25)) if not valid_targets.empty else 0.0,
            "median": float(valid_targets.median()) if not valid_targets.empty else 0.0,
            "q75": float(valid_targets.quantile(0.75)) if not valid_targets.empty else 0.0,
            "max": float(valid_targets.max()) if not valid_targets.empty else 0.0
        }

        # Class balance of direction
        class_balance = imp_df[dir_col].value_counts(dropna=False).to_dict()

        # Leakage Tests
        leakage_detected = False
        correlations = {}
        feature_cols = [
            "return_1d", "return_3d", "return_5d",
            "volatility_before", "volume_change",
            "max_wind", "min_pressure"
        ]
        for f in feature_cols:
            if f in imp_df.columns:
                corr = imp_df[[f, target_col]].dropna().corr().iloc[0, 1]
                correlations[f] = round(float(corr), 4) if pd.notna(corr) else 0.0
                if abs(correlations[f]) > 0.95:
                    leakage_detected = True
                    report["issues_found"].append(f"Suspiciously high correlation ({correlations[f]}) between {f} and target {target_col}")

        report["checks"]["event_impact_dataset"] = {
            "total_observations": len(imp_df),
            "asset_coverage": imp_df["asset"].value_counts().to_dict() if "asset" in imp_df.columns else {},
            "missingness": missing_summary,
            "target_statistics": target_stats,
            "class_balance": class_balance,
            "feature_target_correlations": correlations,
            "leakage_test_passed": not leakage_detected
        }
        if leakage_detected:
            report["status"] = "WARNING_LEAKAGE"
    else:
        report["issues_found"].append("event_impact_dataset.csv not found.")

    if report["issues_found"] and report["status"] == "PASS":
        report["status"] = "WARNINGS"

    logger.info(f"Validation completed. Status: {report['status']}, Issues: {len(report['issues_found'])}")
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Validate historical datasets")
    args = parser.parse_args()
    res = validate_all_data()
    import pprint
    pprint.pprint(res)

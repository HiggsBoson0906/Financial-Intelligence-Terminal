import argparse
import sys
from pathlib import Path

from .config import PROCESSED_DIR
from .utils import logger

# Importers
from .download_ibtracs import download_ibtracs
from .download_hurdat import download_hurdat
from .download_market import download_market
from .download_macro import download_macro
from .download_news import download_news
from .download_sentiment import download_sentiment

from .build_historical_events import build_historical_events
from .normalize_market import normalize_all_market_data
from .normalize_macro import normalize_macro_data, build_daily_macro_features
from .normalize_news import normalize_news_data
from .normalize_sentiment import normalize_sentiment_phrasebank
from .build_event_dataset import build_event_dataset
from .validate_data import validate_all_data
from .generate_report import generate_data_report


def run_pipeline(force: bool = False, source: str = "all"):
    """
    Executes the end-to-end data acquisition and normalization pipeline.
    """
    logger.info(f"=== Starting Phase 1 Historical Data Pipeline (source={source}, force={force}) ===")

    # 1. Download steps
    if source in ["all", "ibtracs"]:
        try:
            download_ibtracs(force=force)
        except Exception as e:
            logger.error(f"IBTrACS acquisition failed: {e}")

    if source in ["all", "hurdat"]:
        try:
            download_hurdat(force=force)
        except Exception as e:
            logger.error(f"HURDAT2 acquisition failed: {e}")

    if source in ["all", "market"]:
        try:
            download_market(force=force)
        except Exception as e:
            logger.error(f"Market data acquisition failed: {e}")

    if source in ["all", "macro"]:
        try:
            download_macro(force=force)
        except Exception as e:
            logger.error(f"Macro data acquisition failed: {e}")

    if source in ["all", "news"]:
        try:
            download_news(force=force)
        except Exception as e:
            logger.error(f"News acquisition failed: {e}")

    if source in ["all", "sentiment"]:
        try:
            download_sentiment(force=force)
        except Exception as e:
            logger.error(f"Sentiment acquisition failed: {e}")

    # 2. Normalization & Construction steps
    if source in ["all", "normalize", "build"]:
        try:
            build_historical_events()
        except Exception as e:
            logger.error(f"Historical event construction failed: {e}")

        try:
            normalize_all_market_data()
        except Exception as e:
            logger.error(f"Market normalization failed: {e}")

        try:
            mac_norm = normalize_macro_data()
            build_daily_macro_features(mac_norm)
        except Exception as e:
            logger.error(f"Macro normalization failed: {e}")

        try:
            normalize_news_data()
        except Exception as e:
            logger.error(f"News normalization failed: {e}")

        try:
            normalize_sentiment_phrasebank()
        except Exception as e:
            logger.error(f"Sentiment normalization failed: {e}")

        try:
            build_event_dataset()
        except Exception as e:
            logger.error(f"Event impact dataset construction failed: {e}")

    # 3. Validation & Report
    try:
        val_res = validate_all_data()
        logger.info(f"Validation status: {val_res['status']}")
    except Exception as e:
        logger.error(f"Validation step failed: {e}")

    try:
        report_path = generate_data_report()
        logger.info(f"Report generated at: {report_path}")
    except Exception as e:
        logger.error(f"Report generation failed: {e}")

    logger.info("=== Pipeline execution completed. ===")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Financial Intelligence Terminal - Historical Data Pipeline")
    parser.add_argument("--force", action="store_true", help="Force re-download of existing raw files")
    parser.add_argument(
        "--source",
        type=str,
        default="all",
        choices=["all", "ibtracs", "hurdat", "market", "macro", "news", "sentiment", "normalize"],
        help="Specify individual source or all"
    )
    args = parser.parse_args()
    run_pipeline(force=args.force, source=args.source)

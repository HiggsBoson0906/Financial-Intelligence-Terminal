import tempfile
import json
from pathlib import Path
import pytest
import pandas as pd
import numpy as np

from scripts.data_acquisition.normalize_hurricanes import (
    classify_saffir_simpson,
    normalize_ibtracs,
    parse_hurdat2,
    compare_ibtracs_and_hurdat2
)
from scripts.data_acquisition.normalize_market import normalize_single_market_series
from scripts.data_acquisition.normalize_macro import build_daily_macro_features
from scripts.data_acquisition.build_event_dataset import extract_event_asset_features
from scripts.data_acquisition.utils import calculate_checksum, save_provenance


def test_classify_saffir_simpson():
    """Test Saffir-Simpson hurricane intensity classification."""
    assert classify_saffir_simpson(25)[0] == "Tropical Depression"
    assert classify_saffir_simpson(45)[0] == "Tropical Storm"
    assert classify_saffir_simpson(70)[0] == "Category 1"
    assert classify_saffir_simpson(85)[0] == "Category 2"
    assert classify_saffir_simpson(100)[0] == "Category 3"
    assert classify_saffir_simpson(120)[0] == "Category 4"
    assert classify_saffir_simpson(145)[0] == "Category 5"
    assert classify_saffir_simpson(np.nan)[0] == "Unknown"
    assert classify_saffir_simpson(-10)[0] == "Unknown"


def test_ibtracs_normalization(tmp_path):
    """Test normalization of IBTrACS CSV handling headers and units row."""
    csv_content = """SID,SEASON,NUMBER,BASIN,SUBBASIN,NAME,ISO_TIME,NATURE,LAT,LON,WMO_WIND,WMO_PRES,USA_WIND,USA_PRES
,,,,,,,,,,kts,mb,kts,mb
2017237N12314,2017,11,NA,MM,HARVEY,2017-08-25 18:00:00,TS,27.5,-96.5,115,941,115,941
2017237N12314,2017,11,NA,MM,HARVEY,2017-08-26 00:00:00,TS,28.0,-97.0,110,945,110,945
"""
    raw_file = tmp_path / "test_ibtracs.csv"
    raw_file.write_text(csv_content, encoding="utf-8")

    df = normalize_ibtracs(raw_file, start_year=2010, end_year=2025)
    assert len(df) == 2
    assert df["event_name"].iloc[0] == "HARVEY"
    assert df["event_id"].iloc[0] == "2017237N12314"
    assert df["wind_kt"].iloc[0] == 115.0
    assert df["pressure_mb"].iloc[0] == 941.0
    assert df["date"].iloc[0] == "2017-08-25"


def test_hurdat2_parsing_and_comparison(tmp_path):
    """Test HURDAT2 text file parsing and discrepancy comparison."""
    hurdat_content = """AL092017,            HARVEY,      2,
20170825, 1800,  , HU, 27.5N,  96.5W, 115,  941,
20170826, 0000, L, HU, 28.0N,  97.0W, 110,  945,
"""
    hurdat_file = tmp_path / "test_hurdat2.txt"
    hurdat_file.write_text(hurdat_content, encoding="utf-8")

    hurdat_df = parse_hurdat2(hurdat_file, start_year=2010, end_year=2025)
    assert len(hurdat_df) == 2
    assert hurdat_df["storm_name"].iloc[0] == "HARVEY"

    ib_events = pd.DataFrame([{
        "event_id": "2017237N12314",
        "event_name": "HARVEY",
        "start_date": "2017-08-25",
        "end_date": "2017-08-26",
        "max_wind": 115.0,
        "min_pressure": 941.0
    }])

    comp = compare_ibtracs_and_hurdat2(ib_events, hurdat_df)
    assert comp["matched_storms_count"] == 1
    assert comp["wind_discrepancies_count"] == 0


def test_market_returns_and_volatility(tmp_path):
    """Test daily return calculation and 20-day rolling volatility (backward-looking)."""
    dates = pd.date_range("2020-01-01", periods=30, freq="B").strftime("%Y-%m-%d")
    prices = [100.0 * (1.01 ** i) for i in range(30)]
    mkt_raw = pd.DataFrame({
        "Date": dates,
        "Open": prices,
        "High": prices,
        "Low": prices,
        "Close": prices,
        "Adj_close": prices,
        "Volume": [1000000] * 30
    })
    raw_file = tmp_path / "XOM.csv"
    mkt_raw.to_csv(raw_file, index=False)

    norm_df = normalize_single_market_series(raw_file, "XOM")
    assert len(norm_df) == 30
    assert "daily_return" in norm_df.columns
    assert "rolling_volatility_20d" in norm_df.columns
    # Check that return at index 1 is approximately 0.01 (1%)
    assert pytest.approx(norm_df.loc[1, "daily_return"], 0.001) == 0.01
    # Check that volatility before index 10 is NaN due to min_periods=10
    assert pd.isna(norm_df.loc[0, "rolling_volatility_20d"])


def test_macro_alignment_and_frequency():
    """Test alignment of daily and monthly series without look-ahead bias."""
    macro_records = pd.DataFrame([
        {"date": "2020-01-01", "series_name": "FEDFUNDS", "value": 1.5, "series_id": "DFF", "frequency": "Daily", "source": "FRED"},
        {"date": "2020-01-02", "series_name": "FEDFUNDS", "value": 1.55, "series_id": "DFF", "frequency": "Daily", "source": "FRED"},
        {"date": "2020-01-01", "series_name": "CPI", "value": 250.0, "series_id": "CPIAUCSL", "frequency": "Monthly", "source": "FRED"}
    ])
    calendar_dates = pd.date_range("2020-01-01", "2020-01-05", freq="D")
    aligned = build_daily_macro_features(macro_records, calendar_dates=calendar_dates, output_dir=Path(tempfile.gettempdir()))

    assert len(aligned) == 5
    assert "CPI" in aligned.columns
    assert "FEDFUNDS" in aligned.columns
    # Monthly CPI should be forward filled through the window
    assert aligned["CPI"].iloc[-1] == 250.0


def test_event_window_and_no_lookahead_leakage():
    """Test feature extraction and target separation to prevent leakage."""
    dates = pd.date_range("2020-01-01", periods=60, freq="B").strftime("%Y-%m-%d")
    prices = [100.0 + (i * 0.5) for i in range(60)]
    asset_df = pd.DataFrame({
        "date": dates,
        "adjusted_close": prices,
        "rolling_volatility_20d": [0.15] * 60,
        "volume": [500000] * 60
    })

    # Event occurs on 30th trading day
    ev_date = dates[30]
    event_row = pd.Series({
        "event_id": "EV001",
        "event_name": "TEST_STORM",
        "event_type": "Hurricane",
        "start_date": ev_date,
        "max_wind": 120.0,
        "min_pressure": 930.0,
        "region": "US Gulf Coast",
        "severity": "Category 4",
        "category": 4
    })

    res = extract_event_asset_features(
        asset="XOM",
        event_row=event_row,
        asset_market_df=asset_df,
        macro_lookup={},
        news_volume_map={"EV001": 25}
    )

    assert res["event_id"] == "EV001"
    assert res["asset"] == "XOM"
    assert res["price_before"] == prices[30]
    assert res["news_volume"] == 25
    # Target 5d forward return must match (P35 - P30) / P30
    expected_target_return = (prices[35] - prices[30]) / prices[30]
    assert pytest.approx(res["future_5d_return"], 0.0001) == round(expected_target_return, 4)
    assert res["future_5d_direction"] == 1


def test_provenance_and_checksum(tmp_path):
    """Test provenance metadata saving and SHA-256 calculation."""
    dummy_file = tmp_path / "sample.csv"
    dummy_file.write_text("col1,col2\n1,2\n", encoding="utf-8")

    checksum = calculate_checksum(dummy_file)
    assert len(checksum) == 64  # SHA-256 is 64 hex characters

    prov_file = save_provenance(
        source_name="Test_Source",
        source_url="http://example.com/data.csv",
        provider="Test Provider",
        date_range={"start": "2020-01-01", "end": "2020-12-31"},
        parameters={"test": True},
        local_filename="sample.csv",
        output_dir=tmp_path / "prov",
        checksum=checksum
    )

    assert prov_file.exists()
    with open(prov_file, "r") as f:
        meta = json.load(f)
    assert meta["source_name"] == "Test_Source"
    assert meta["checksum_when_practical"] == checksum


def test_gdelt_event_join_no_cross_year_leakage(tmp_path):
    """
    Test that news association strictly matches on event_id or (event_name, event_year),
    preventing Hurricane Harvey 2017 articles from being assigned to Tropical Storm Harvey 2011.
    """
    from scripts.data_acquisition.normalize_news import normalize_news_data

    # Create mock historical events with Harvey 2011 and Harvey 2017
    mock_events = pd.DataFrame([
        {
            "event_id": "2011_HARVEY_ID",
            "event_name": "HARVEY",
            "start_date": "2011-08-19",
            "end_date": "2011-08-22",
            "severity": "Tropical Storm",
            "category": 0
        },
        {
            "event_id": "2017_HARVEY_ID",
            "event_name": "HARVEY",
            "start_date": "2017-08-17",
            "end_date": "2017-09-01",
            "severity": "Category 4",
            "category": 4
        }
    ])
    events_file = tmp_path / "mock_events.csv"
    mock_events.to_csv(events_file, index=False)

    # Mock raw news json with only 2017 Harvey articles
    mock_news = [
        {
            "event_name": "Harvey",
            "event_date": "2017-08-25",
            "title": "Harvey slams Texas coast",
            "url": "http://example.com/harvey2017_1",
            "seendate": "20170826T120000Z",
            "domain": "example.com",
            "language": "English"
        },
        {
            "event_name": "Harvey",
            "event_date": "2017-08-26",
            "title": "Historic flooding in Houston",
            "url": "http://example.com/harvey2017_2",
            "seendate": "20170827T120000Z",
            "domain": "example.com",
            "language": "English"
        }
    ]
    raw_news_file = tmp_path / "mock_raw_news.json"
    raw_news_file.write_text(json.dumps(mock_news), encoding="utf-8")

    out_dir = tmp_path / "processed"
    norm_news = normalize_news_data(raw_file=raw_news_file, events_file=events_file, output_dir=out_dir)

    # Both articles must be mapped strictly to 2017_HARVEY_ID, never 2011_HARVEY_ID
    assert len(norm_news) == 2
    assert (norm_news["event_id"] == "2017_HARVEY_ID").all()
    assert (norm_news["event_id"] != "2011_HARVEY_ID").all()

    # Verify aggregates table
    vol_df = pd.read_csv(out_dir / "news_volume_by_event.csv")
    assert len(vol_df) == 1
    assert vol_df["event_id"].iloc[0] == "2017_HARVEY_ID"
    assert vol_df["total_news_volume"].iloc[0] == 2

"""
Cross-Asset Historical Reactions Service — Phase 3B
=====================================================
Provides event-level cross-asset reaction data from the
pre-computed event_impact_dataset.csv.

NO causal claims are made.
Correlation labels are used ONLY where correlation is
explicitly computed.  All values trace back to the dataset.
"""

from __future__ import annotations

import logging
from functools import lru_cache
from typing import Optional

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

ASSETS = ["XOM", "CVX", "COP", "OXY", "XLE", "SPY"]

REACTION_COLS = [
    "return_1d",
    "return_3d",
    "return_5d",
    "future_5d_return",
    "future_5d_direction",
    "volatility_before",
    "volume_change",
    "price_before",
]


@lru_cache(maxsize=1)
def _load_impact_df() -> pd.DataFrame:
    df = pd.read_csv("data/processed/event_impact_dataset.csv")
    return df


def get_event_asset_reactions(event_id: str) -> dict:
    """
    Return per-asset reaction metrics for a single event.

    Returns
    -------
    {
        "event_id": ...,
        "assets": {
            "XOM": { "return_1d": ..., ..., "status": "available" | "missing" },
            ...
        }
    }
    """
    df = _load_impact_df()
    event_df = df[df["event_id"] == event_id]

    assets_out: dict[str, dict] = {}
    for asset in ASSETS:
        asset_row = event_df[event_df["asset"] == asset]
        if asset_row.empty:
            assets_out[asset] = {"status": "missing"}
            continue

        row = asset_row.iloc[0]
        record: dict = {"status": "available"}
        for col in REACTION_COLS:
            val = row.get(col)
            if pd.isna(val):
                record[col] = None
            else:
                record[col] = float(val) if isinstance(val, (float, np.floating)) else val
        assets_out[asset] = record

    return {"event_id": event_id, "assets": assets_out}


def get_cross_asset_relationships(event_ids: list[str]) -> list[dict]:
    """
    Compute pairwise Pearson correlations of 5-day forward returns
    across all 6 assets for the given set of historical events.

    Returns a list of {pair, correlation, n_events, metric, note} dicts.
    Correlation is NOT causation.  Explicitly labeled as correlation.
    Only returned where n_events >= 2.
    """
    if not event_ids:
        return []

    df = _load_impact_df()
    subset = df[df["event_id"].isin(event_ids)]

    pivot = (
        subset.pivot_table(
            index="event_id", columns="asset", values="future_5d_return"
        )
        .reindex(columns=ASSETS)
    )

    relationships: list[dict] = []
    assets_present = [a for a in ASSETS if a in pivot.columns]
    for i, a1 in enumerate(assets_present):
        for a2 in assets_present[i + 1:]:
            pair_df = pivot[[a1, a2]].dropna()
            n = len(pair_df)
            if n < 2:
                continue
            corr = float(pair_df[a1].corr(pair_df[a2]))
            relationships.append(
                {
                    "pair": f"{a1}/{a2}",
                    "asset_a": a1,
                    "asset_b": a2,
                    "correlation": round(corr, 4),
                    "n_events": n,
                    "metric": "pearson_future_5d_return",
                    "note": (
                        "Historical correlation across retrieved events. "
                        "Correlation ≠ causation."
                    ),
                    "source": "data/processed/event_impact_dataset.csv",
                }
            )

    return relationships

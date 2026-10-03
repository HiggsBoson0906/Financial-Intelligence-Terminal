import pytest
import numpy as np
from app.services.embedding_service import embed_text, embed_texts
from app.services.historical_rag_service import retrieve_similar_events, _build_macro_context, _build_weather_context
from app.services.cross_asset_service import get_event_asset_reactions, get_cross_asset_relationships


def test_embed_text_dimension():
    vec = embed_text("Test query")
    assert isinstance(vec, np.ndarray)
    assert vec.shape == (384,)


def test_embed_texts_batch():
    vecs = embed_texts(["Test 1", "Test 2"])
    assert len(vecs) == 2
    assert vecs[0].shape == (384,)


def test_embed_empty_fails():
    with pytest.raises(ValueError):
        embed_text("")
    with pytest.raises(ValueError):
        embed_text("   ")


def test_retrieve_similar_events():
    # Will use real DB, assume events are embedded
    res = retrieve_similar_events("hurricane", top_k=2)
    assert res["query"] == "hurricane"
    assert res["retrieval_metadata"]["top_k"] == 2
    assert len(res["matches"]) <= 2
    
    if res["matches"]:
        m = res["matches"][0]
        assert "similarity" in m
        assert "weather_context" in m
        assert "macro_context" in m
        assert "asset_reactions" in m


def test_build_macro_context():
    ctx = _build_macro_context("2010-06-24")
    assert "CPIAUCSL" in ctx
    assert "DFF" in ctx
    
    # CPI in June 2010 should be available from our normalized_macro.csv
    assert ctx["CPIAUCSL"]["status"] == "available"


def test_build_weather_context():
    # Known event from dataset (Hurricane Alex)
    ctx = _build_weather_context("2010176N16278")
    assert ctx["status"] == "available"
    assert ctx["max_wind_kt"] == 95.0
    assert ctx["min_pressure_mb"] == 946.0
    assert ctx["category"] == 2


def test_cross_asset_relationships():
    rels = get_cross_asset_relationships(["2010176N16278", "2010188N21269", "2010203N22286"])
    # May be empty if not enough common assets, but should run
    assert isinstance(rels, list)
    if rels:
        assert "pair" in rels[0]
        assert "correlation" in rels[0]


def test_event_asset_reactions():
    reactions = get_event_asset_reactions("2010176N16278")
    assert reactions["event_id"] == "2010176N16278"
    assert "XOM" in reactions["assets"]
    # Check XOM has a future_5d_return
    xom = reactions["assets"]["XOM"]
    if xom["status"] == "available":
        assert "future_5d_return" in xom

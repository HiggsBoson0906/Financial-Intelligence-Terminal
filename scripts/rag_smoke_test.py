"""
Historical RAG Smoke Test — Phase 3B
====================================
Tests the full Historical RAG pipeline through the LangGraph orchestrator.
Demonstrates:
  - Cache miss latency
  - Cache hit latency
  - Context retrieval (Macro, Weather, Asset Reactions)
  - Evidence & Trace generation
"""

import json
import logging
import time

from app.agents.orchestrator import run_analysis
from app.services.redis_service import redis_client

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


def run_query(query: str, label: str):
    logger.info(f"\n{'='*60}\n{label}\nQUERY: {query}\n{'='*60}")
    
    start = time.time()
    state = run_analysis(query)
    total_ms = round((time.time() - start) * 1000, 2)
    
    matches = state.historical_matches.get("matches", [])
    meta = state.historical_matches.get("retrieval_metadata", {})
    
    logger.info(f"Total time (including orchestrator overhead): {total_ms}ms")
    logger.info(f"RAG Cache Hit: {meta.get('cache_hit')}")
    logger.info(f"RAG Embed Latency: {meta.get('embed_latency_ms')}ms")
    logger.info(f"RAG Retrieve Latency: {meta.get('retrieve_latency_ms')}ms")
    logger.info(f"RAG Enrich Latency: {meta.get('enrich_latency_ms')}ms")
    
    if not matches:
        logger.warning("NO MATCHES RETURNED!")
        return
        
    logger.info(f"\n--- TOP MATCH ---")
    m1 = matches[0]
    logger.info(f"Event: {m1['event_name']} ({m1['event_year']}) - {m1['event_type']}")
    logger.info(f"Similarity: {m1['similarity']:.4f}")
    
    logger.info(f"\n--- WEATHER CONTEXT ---")
    logger.info(json.dumps(m1.get("weather_context", {}), indent=2))
    
    logger.info(f"\n--- MACRO CONTEXT ---")
    logger.info(json.dumps(m1.get("macro_context", {}), indent=2))
    
    logger.info(f"\n--- ASSET REACTIONS (Top match only) ---")
    assets = m1.get("asset_reactions", {}).get("assets", {})
    for asset, data in assets.items():
        if data.get("status") == "available":
            ret = data.get("future_5d_return")
            logger.info(f"  {asset}: {ret:.4f} (future 5d)")
        else:
            logger.info(f"  {asset}: Missing")
            
    logger.info(f"\n--- CROSS-ASSET CORRELATIONS ---")
    rels = m1.get("cross_asset_relationships", [])
    logger.info(f"Generated {len(rels)} pairwise correlations for retrieved set.")
    if rels:
        logger.info(f"Example: {rels[0]['pair']} -> {rels[0]['correlation']} (n={rels[0]['n_events']})")

    logger.info(f"\n--- ORCHESTRATION EVIDENCE (Count: {len(state.evidence)}) ---")
    if state.evidence:
        ev = state.evidence[0]
        logger.info(f"Evidence 1: [{ev.type}] {ev.description} (source: {ev.source})")
        
    logger.info(f"\n--- ORCHESTRATION TRACE (Count: {len(state.agent_trace)}) ---")
    for tr in state.agent_trace:
        logger.info(f"[{tr.node}] status={tr.status} latency={tr.latency_ms}ms")


def main():
    # Ensure cache is clear for the first query to force a miss
    redis_client.client.flushdb()
    
    q1 = "Hurricane approaching the Gulf Coast with possible energy disruption"
    run_query(q1, "QUERY 1 (Expect Cache MISS)")
    
    # Run identical query to test cache hit
    run_query(q1, "QUERY 1 REPEAT (Expect Cache HIT)")
    
    q2 = "Major tropical cyclone affecting oil and gas infrastructure"
    run_query(q2, "QUERY 2 (Expect Cache MISS)")


if __name__ == "__main__":
    main()

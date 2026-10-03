"""
Deterministic Query Parser — Phase 4
====================================
Lightweight intent and entity extraction without relying on an LLM.
"""

import re
from typing import Dict, Any, List

KNOWN_ASSETS = ["XOM", "CVX", "COP", "OXY", "XLE", "SPY"]
KNOWN_EVENT_KEYWORDS = {
    "hurricane": "hurricane",
    "tropical cyclone": "hurricane",
    "storm": "storm",
    "wildfire": "wildfire",
    "earthquake": "earthquake",
    "flood": "flood",
    "drought": "drought"
}
KNOWN_REGIONS = ["gulf", "gulf coast", "texas", "louisiana", "florida", "california", "east coast", "atlantic", "pacific"]


def parse_query(query: str) -> Dict[str, Any]:
    """
    Deterministically parses the query to extract symbols, event type, region, and intent.
    """
    query_lower = query.lower()
    
    # Extract symbols
    symbols = []
    # Tokenize broadly including punctuation handling
    tokens = re.findall(r'\b[a-zA-Z]+\b', query)
    for token in tokens:
        if token.upper() in KNOWN_ASSETS:
            symbols.append(token.upper())
    # De-duplicate
    symbols = list(set(symbols))
    
    # Extract event
    event = None
    for kw, ev in KNOWN_EVENT_KEYWORDS.items():
        if kw in query_lower:
            event = ev
            break
            
    # Extract region
    region = None
    for r in KNOWN_REGIONS:
        if r in query_lower:
            region = r
            break
            
    # Task extraction
    task = "analysis"
    if "risk" in query_lower or "impact" in query_lower or "affect" in query_lower:
        task = "impact/risk"
    if "hedge" in query_lower or "protect" in query_lower or "rebalance" in query_lower:
        task = "hedge"
    if "history" in query_lower or "past" in query_lower or "compare" in query_lower:
        task = "historical comparison"
        
    # Horizon extraction (very basic)
    horizon = "short-term"
    if "long term" in query_lower or "years" in query_lower:
        horizon = "long-term"
    elif "medium term" in query_lower or "months" in query_lower:
        horizon = "medium-term"
        
    # Extract Category if present
    category_match = re.search(r'category\s+(\d)', query_lower)
    category = int(category_match.group(1)) if category_match else None
        
    return {
        "symbols": symbols,
        "event_type": event,
        "region": region,
        "task": task,
        "horizon": horizon,
        "category": category
    }

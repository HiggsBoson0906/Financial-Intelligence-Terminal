"""
Deterministic Query Parser — Phase 4
====================================
Lightweight intent and entity extraction without relying on an LLM.
"""

import re
from typing import Dict, Any, List

KNOWN_ASSETS = ["XOM", "CVX", "COP", "OXY", "XLE", "SPY"]

KNOWN_EVENT_KEYWORDS = {
    "supply disruption": "Supply Disruption",
    "supply disruptions": "Supply Disruption",
    "supply shock": "Supply Shock",
    "supply constraint": "Supply Constraint",
    "supply constraints": "Supply Constraint",
    "disruption": "Supply Disruption",
    "disruptions": "Supply Disruption",
    "refinery outage": "Refinery Outage",
    "refinery outages": "Refinery Outage",
    "outage": "Outage",
    "outages": "Outage",
    "embargo": "Embargo",
    "sanction": "Sanctions",
    "sanctions": "Sanctions",
    "geopolitical": "Geopolitical Event",
    "conflict": "Geopolitical Conflict",
    "war": "Geopolitical Conflict",
    "tropical cyclone": "Hurricane",
    "hurricane": "Hurricane",
    "storm": "Severe Storm",
    "wildfire": "Wildfire",
    "earthquake": "Earthquake",
    "flood": "Flood",
    "drought": "Drought"
}

KNOWN_REGIONS_MAP = {
    "gulf coast": "US Gulf Coast",
    "gulf of mexico": "US Gulf Coast",
    "gulf": "US Gulf Coast",
    "texas": "Texas",
    "louisiana": "Louisiana",
    "florida": "Florida",
    "california": "California",
    "east coast": "US East Coast",
    "atlantic": "Atlantic",
    "pacific": "Pacific",
    "middle east": "Middle East",
    "europe": "Europe",
    "asia": "Asia",
    "red sea": "Red Sea",
    "strait of hormuz": "Strait of Hormuz"
}


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
    
    # Extract Category if present
    category_match = re.search(r'category\s+(\d)', query_lower)
    category = int(category_match.group(1)) if category_match else None

    # Extract event
    event = None
    # Check for named storm/hurricane (e.g., "Hurricane Milton", "Storm Beryl")
    named_match = re.search(r'\b(?:hurricane|storm|cyclone)\s+([a-zA-Z]+)\b', query, re.IGNORECASE)
    if named_match:
        cand = named_match.group(1).lower()
        if cand not in {"in", "at", "on", "near", "warning", "watch", "impact", "category", "risk", "damage", "track", "season", "strikes", "hits", "approaches", "current", "severe", "major", "the", "a", "an"} and len(cand) > 2:
            event = f"Hurricane {cand.capitalize()}"

    if not event:
        # Match longest event keyword first
        for kw in sorted(KNOWN_EVENT_KEYWORDS.keys(), key=len, reverse=True):
            if kw in query_lower:
                event = KNOWN_EVENT_KEYWORDS[kw]
                break

    # Determine structured event_name based strictly on user query
    if event:
        if category and "hurricane" in event.lower():
            if "category" not in event.lower():
                event_name = f"Category {category} {event}"
            else:
                event_name = event
        elif category:
            event_name = f"Category {category} {event}"
        else:
            event_name = event
    else:
        event_name = None
            
    # Extract region (longest match first)
    region = None
    for r in sorted(KNOWN_REGIONS_MAP.keys(), key=len, reverse=True):
        if r in query_lower:
            region = KNOWN_REGIONS_MAP[r]
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
        
    return {
        "symbols": symbols,
        "event_type": event,
        "event_name": event_name,
        "region": region,
        "task": task,
        "horizon": horizon,
        "category": category
    }

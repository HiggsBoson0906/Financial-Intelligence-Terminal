# LangGraph RAG Orchestration

This document describes the orchestration layer developed in Phase 3C using LangGraph.

## K. LangGraph State
We define a shared, typed `AnalysisState` across the workflow. This ensures that every agent (and node) has a consistent view of:
- `query`
- Context blocks: `market_context`, `event_context`, `sentiment`, `macro_weather`, `historical_matches`, `risk`, `scenario`, `recommendations`
- Audit components: `agent_trace` and `evidence`

## L. Agent Trace
For every execution step (e.g., input validation, historical retrieval), the orchestrator appends an `AgentTrace` record containing node name, status, start/end timestamps, latency in ms, and any cached state.

## M. Evidence Model
The final audit drawer is powered by `EvidenceItem` records. The retrieval node explicitly records evidence referencing the source, retrieval timestamp, model used, and similarity score. Future agents will append to this drawer without destroying prior data.

## N. Future Four-Agent Extension Points
The graph structure already integrates placeholder extension points for Phase 4:
- `sentiment_agent`: Will process news and linguistic context.
- `weather_macro_agent`: Will pull live weather updates and macro indicators.
- `risk_agent`: Will calculate real-time portfolio volatility/VaR scenarios.
- `hedging_agent`: Will synthesize constraints and output final reallocation suggestions.

Currently, execution routes directly from historical retrieval to `finalize`. The infrastructure is fully designed to support these parallel/sequential agent workflows.

# Phase 5: Gemini Synthesis Query Engine

This document details the implementation of Phase 5 of the Financial Intelligence Terminal, which transforms the multi-agent orchestration layer into a fully-fledged Natural Language query API backed by Gemini synthesis.

## Core Role of Gemini

**IMPORTANT: Gemini is an explanation/synthesis layer, not the quantitative source of truth.**

Gemini’s responsibilities are strictly confined to synthesizing, explaining, and summarizing the structured analysis produced by the deterministic backend agents (Risk, Scenario, Hedging, Historical RAG, Macro, and Sentiment).

### Rules Enforced by System Prompt

1. Use ONLY information supplied by the backend.
2. Never invent metrics.
3. Never invent sources.
4. Never invent URLs.
5. Never invent historical events.
6. Never invent probabilities.
7. Never invent portfolio positions.
8. Never override RiskEngine results.
9. Never convert simulated outcomes into real executed trades.

## System Architecture

The user interacts through `POST /api/v1/query`. The flow is as follows:

1. **Orchestration**: The LangGraph engine routes the query through the multi-agent framework.
2. **Confidence Calculation**: A backend deterministic evaluation calculates an analytical confidence score.
3. **Evidence Linkage**: Existing evidence objects are strongly linked to scenarios and recommendations.
4. **Gemini Payload Generation**: A JSON dump of the deterministic agent state is passed to Gemini as context.
5. **Synthesis**: Gemini produces a Pydantic-validated `GeminiSynthesis` model (Summary, Details, Key Insights).
6. **Response Formulation**: The final JSON payload combines the synthesis with raw structural metrics, latency, data_quality, and the agent trace.
7. **Persistence**: The newly created `AnalysisRun` gets updated in the PostgreSQL database with the complete generated results.

### Endpoint Interface

- **`POST /api/v1/query`**
- Uses the `QueryRequest` schema.
- Returns the full `QueryResponse` contract, which supports confidence metrics, the agent trace, evidence provenance with URLs, and data quality states (`live`, `historical`, `simulated`, `fallback`).

### Fallback Behavior

If the `GEMINI_API_KEY` is not provided, the external API rate-limits, or it produces invalid output, the system fails gracefully:
- The raw structured data and evidence provenance are preserved entirely.
- A deterministic summary fallback string is injected: *"Gemini synthesis unavailable; displaying structured agent analysis."*
- A warning is appended to `data_quality.warnings`.

## Security & Configuration

The application is configured through environment variables:
- `GEMINI_API_KEY`: Kept securely in `.env` and never committed or persisted in logs/DB.
- `GEMINI_MODEL`: Model ID (e.g., `gemini-2.5-flash`), default configurable.

Gemini SDK: The official `google-genai` Python library is used.

## Limitations
- Gemini may struggle if the backend context payload exceeds context limits (unlikely given focused summaries, but possible on massive portfolios).
- Confidence is purely analytical and derived deterministically by data availability and evidence metrics, not an actual probability of real-world outcome.

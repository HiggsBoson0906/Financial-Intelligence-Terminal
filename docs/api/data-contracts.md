# Core Data Contracts

The system relies on strong typing for all entities. These contracts are defined as Pydantic models in the backend and should be mirrored by frontend TypeScript interfaces.

## Observations
- **MarketObservation:** Defines financial market data points (symbol, timestamp, price, volume, currency).
- **NewsObservation:** Contains news metadata and sentiment (article_id, title, source, published_at, sentiment_score).
- **WeatherObservation:** Details extreme weather conditions (location, timestamp, temperature, condition, severity_index).
- **MacroObservation:** Tracks macroeconomic indicators (indicator, timestamp, value, unit).

## Entities
- **HistoricalEvent:** Represents a documented past event (event_id, name, date, description, impact_summary).
- **PortfolioPosition:** An asset holding in the portfolio (symbol, quantity, average_entry_price, current_price).
- **RiskMetrics:** Computed risk variables (value_at_risk_95, expected_shortfall_95, volatility_30d, beta_to_spy, max_drawdown).
- **AgentResult:** The synthesized output from an agent (agent_name, summary, confidence_score).
- **EvidenceItem:** Supporting data retrieved for agent reasoning (source_type, content, relevance_score).

## Auditability Contract
To maintain transparency and explainability ("Why did the system reach this conclusion?"), the system implements an **AuditRecord**.

The `AuditRecord` contract contains:
- `audit_id`: Unique audit trace ID.
- `run_id`: The analysis run this audit belongs to.
- `timestamp`: Execution time.
- `user_query`: The original natural language prompt.
- `agents_called`: List of agents participating in the orchestration.
- `data_sources`: List of specific data sources accessed.
- `model_versions`: The specific LLMs or ML models used (e.g., `gemini-1.5-pro`, `finbert-v2`).
- `retrieved_events`: List of historical events fetched via RAG.
- `retrieved_documents`: List of unstructured documents referenced.
- `risk_calculations`: Deterministic calculation inputs/outputs.
- `predictions`: Any predictive output.
- `recommendations`: Proposed actions.
- `warnings`: Any risk or constraint violations encountered during reasoning.

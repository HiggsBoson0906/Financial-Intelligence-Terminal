# Backend Architecture

## Architectural Separation
To ensure maintainability and prevent circular dependencies, dependencies flow downwards:

API
 ↓
Orchestration (LangGraph)
 ↓
Agents
 ↓
Domain Services
 ↓
ML / RAG / Risk Engine
 ↓
Data Access
 ↓
External Sources

## Four Primary Agents
The system is designed around a multi-agent architecture orchestrated by LangGraph:
1. **Sentiment Agent:** Analyzes and scores market sentiment from news and social feeds.
2. **Weather & Macro Impact Agent:** Correlates and evaluates the impact of weather phenomena and macroeconomic shifts on asset classes.
3. **Quantitative Risk Agent:** Interfaces with the deterministic risk engine to assess portfolio exposures.
4. **Hedging Strategy Agent:** Consolidates insights and proposes actionable risk mitigation strategies.

*Note: RAG is a shared capability accessed by these agents, not a standalone agent. There is also no distinct "Market Analysis Agent", as this responsibility is distributed.*

## Financial Computation Rule
**CRITICAL:** Gemini must not be treated as the source of truth for numerical financial calculations.

- **Gemini (LLMs) handles:**
  - Reasoning
  - Synthesis
  - Explanation
  - Natural-language generation

- **Deterministic Backend Code (Python/NumPy/Pandas) handles:**
  - Returns calculation
  - Volatility
  - Portfolio exposure
  - Value at Risk (VaR)
  - Expected Shortfall (ES)
  - Drawdown
  - Scenario calculations
  - Other quantitative financial metrics

# Quantitative Risk Engine Architecture

This document describes the Quantitative Risk Engine for the Financial Intelligence Terminal.

## 1. Core Purpose

The risk engine provides deterministic quantitative risk metrics and scenario analysis tools. It acts as the financial grounding layer that later AI/LangGraph agents will query to validate their trading or portfolio recommendations.

## 2. Implemented Components (`risk/engine.py`)

### 2.1. Portfolio Volatility (`calculate_portfolio_volatility`)
Calculates the annualized volatility of a multi-asset portfolio based on asset weights and a historical covariance matrix. It assumes 252 trading days per year.

### 2.2. Value at Risk (`calculate_historical_var`)
Computes the historical Value at Risk (VaR) at a configurable confidence level (default: 95%). This helps answer the question: "What is the maximum expected loss over a specific timeframe with 95% confidence?"

### 2.3. Stress Scenario Simulation (`run_stress_scenario`)
Evaluates the portfolio under simulated shocks (e.g., applying the predicted impact of an upcoming hurricane to the portfolio's assets). It outputs:
- Portfolio shock percentage
- Expected loss in value
- Post-shock portfolio value

## 3. Integration with LangGraph

In later phases, the LangGraph agents will use these deterministic endpoints to:
1. Verify if proposed actions exceed defined risk limits.
2. Simulate hypothetical scenarios proposed by the model.
3. Incorporate risk metrics into the final intelligence reporting.

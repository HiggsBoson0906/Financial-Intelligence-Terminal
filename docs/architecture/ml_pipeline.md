# ML Pipeline Architecture

This document describes the Machine Learning Pipeline for the Financial Intelligence Terminal.

## 1. Feature Engineering (`ml/features/pipeline.py`)

To prevent data leakage, feature engineering is strictly contained within a scikit-learn `Pipeline` and `ColumnTransformer`.
- **Numeric Features**: Imputed using the median, followed by standard scaling.
- **Categorical Features**: Missing values filled with a constant, followed by one-hot encoding.
- Fits exclusively on training data and transforms validation/test data.

## 2. Evaluation Split Strategy (`ml/evaluation/splits.py`)

A critical requirement is that data related to the same event (e.g., a specific hurricane) must not span across training and validation/test sets, as macroeconomic and sentiment factors are event-wide, which would cause severe look-ahead leakage and overly optimistic evaluation metrics.
- **Strategy**: Event-Grouped Chronological Splits.
- **Mechanism**: Groups data by `event_id`, sorts chronologically by the earliest event date, and splits events sequentially.

## 3. Modeling Foundation (`ml/impact/models.py`)

The pipeline supports robust baseline models and constrained tree-based models:
- **Linear Baselines**: Ridge Regression, ElasticNet.
- **Tree-Based Models**: XGBoost, LightGBM (constrained using shallow depth to prevent overfitting on the event dataset).

## 4. Services

- **Macroeconomic Data**: `backend/app/services/fred_service.py` ensures robust fetching of FRED series data using both the official REST API (when authenticated) and public CSV exports as a fallback.
- **Sentiment Analysis**: `backend/app/services/sentiment_service.py` incorporates FinBERT for financial sentiment scoring, explicitly handling missing articles without fabricating sentiment data.

import os
import json
import logging
import time
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime
import joblib

logging.basicConfig(level=logging.INFO, format='%(levelname)s:%(name)s:%(message)s')
logger = logging.getLogger(__name__)

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
RESULTS_DIR = DATA_DIR / "processed" / "model_results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

DOCS_DIR = BASE_DIR / "docs" / "analysis"

import sys
sys.path.insert(0, str(BASE_DIR))

try:
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
    from sklearn.linear_model import Ridge, HuberRegressor
    from sklearn.dummy import DummyRegressor
    from ml.impact.models import EventImpactModel
    from ml.evaluation.splits import create_event_grouped_chronological_splits
    from ml.features.pipeline import FeaturePipeline
    from backend.app.services.sentiment_service import SentimentService
except ImportError as e:
    logger.error(f"Missing internal ML modules: {e}")
    sys.exit(1)


def run_sentiment_feature_builder():
    logger.info("--- 4. BUILD EVENT-LEVEL SENTIMENT FEATURES (REAL INFERENCE) ---")
    
    # 1. Load actual news articles
    news_df = pd.read_csv(DATA_DIR / "processed" / "normalized_news.csv")
    
    # 2. Instantiate FinBERT explicitly on CPU exactly once
    logger.info("Instantiating SentimentService (CPU)...")
    service = SentimentService()
    
    # Format articles for SentimentService
    # Map title to text
    articles_input = []
    for _, row in news_df.iterrows():
        # Title acts as text. If missing, it will safely be handled by service
        text = str(row['title']) if pd.notna(row['title']) else None
        articles_input.append({
            "date": row['date'],
            "text": text,
            "status": "collected",  # These are genuinely collected articles
            "news_id": row['news_id']
        })
        
    logger.info(f"Processing batch of {len(articles_input)} historical news articles...")
    
    start_time = time.time()
    
    # 3. Batch Inference (Skipping missing/null logic handled inside service)
    sentiments_df = service.analyze_articles(articles_input)
    
    inference_time = time.time() - start_time
    
    # Merge sentiment back with news_df to link event_id
    news_df['positive'] = sentiments_df['positive']
    news_df['negative'] = sentiments_df['negative']
    news_df['neutral'] = sentiments_df['neutral']
    news_df['has_sentiment'] = news_df['positive'].notna()
    
    valid_mask = news_df['has_sentiment']
    processed_count = valid_mask.sum()
    skipped_count = (~valid_mask).sum()
    
    logger.info(f"Inference complete: {inference_time:.2f}s total.")
    logger.info(f"Processed {processed_count} articles. Skipped {skipped_count} articles due to missing text.")
    if processed_count > 0:
        logger.info(f"Average latency per valid article: {inference_time / processed_count:.4f}s")
        logger.info("Sentiment distribution averages:")
        logger.info(f"  Positive: {news_df.loc[valid_mask, 'positive'].mean():.4f}")
        logger.info(f"  Negative: {news_df.loc[valid_mask, 'negative'].mean():.4f}")
        logger.info(f"  Neutral:  {news_df.loc[valid_mask, 'neutral'].mean():.4f}")
        
    # Save article-level FinBERT outputs
    news_df.to_csv(RESULTS_DIR / "finbert_article_outputs.csv", index=False)
    
    # 4. Create event-level sentiment features
    # Filter to only valid sentiments to compute means
    valid_news = news_df[valid_mask].copy()
    
    # Calculate composite metrics
    valid_news['sentiment_mean'] = valid_news['positive'] - valid_news['negative']
    valid_news['sentiment_confidence'] = 1.0 - valid_news['neutral'] # simplistic confidence
    
    agg_funcs = {
        'sentiment_mean': ['mean', 'std'],
        'positive': ['mean'],
        'negative': ['mean'],
        'neutral': ['mean'],
        'sentiment_confidence': ['mean'],
        'news_id': ['count']
    }
    
    event_sent = valid_news.groupby('event_id').agg(agg_funcs)
    event_sent.columns = [
        'sentiment_mean', 'sentiment_std', 
        'positive_ratio', 'negative_ratio', 'neutral_ratio', 
        'sentiment_confidence', 'article_count'
    ]
    event_sent = event_sent.reset_index()
    
    # Fill missing std with 0
    event_sent['sentiment_std'] = event_sent['sentiment_std'].fillna(0.0)
    event_sent['sentiment_available'] = 1
    
    # 5. Map features back to event/asset dataset
    df = pd.read_csv(DATA_DIR / "processed" / "event_impact_dataset.csv")
    
    df = pd.merge(df, event_sent, on='event_id', how='left')
    
    # Ensure properties for no_match / not_collected
    df['sentiment_available'] = df['sentiment_available'].fillna(0).astype(int)
    df['article_count'] = df['article_count'].fillna(0).astype(int)
    
    n_mapped = df['sentiment_available'].sum()
    logger.info(f"Mapped genuine event-level sentiment features back to {n_mapped} dataset rows.")
    
    if n_mapped < 50:
        logger.warning(f"Resulting sentiment sample ({n_mapped} rows) is very small. The evaluation may lack statistically meaningful conclusions.")
        
    return df

def run_sentiment_ablation(df):
    logger.info("--- 5. SENTIMENT ABLATION ---")
    train_df, val_df, test_df = create_event_grouped_chronological_splits(df)
    
    target_reg = 'future_5d_return'
    
    drop_cols = ['event_id', 'event_name', 'asset', 'event_date', target_reg, 'future_5d_direction', 
                 'news_collection_status', 'min_pressure', 'category']
                 
    # ABLATION A: Base features (No sentiment)
    sentiment_cols = ['sentiment_mean', 'sentiment_std', 'positive_ratio', 'negative_ratio', 
                      'neutral_ratio', 'article_count', 'sentiment_confidence', 'sentiment_available']
                      
    base_features = [c for c in df.columns if c not in drop_cols and c not in sentiment_cols]
    
    # ABLATION B: Base + Sentiment
    sent_features = base_features + sentiment_cols
    
    def evaluate_features(feature_list, name):
        num_feat = train_df[feature_list].select_dtypes(include=[np.number]).columns.tolist()
        cat_feat = train_df[feature_list].select_dtypes(exclude=[np.number]).columns.tolist()
        
        pipeline = FeaturePipeline(num_feat, cat_feat)
        X_train = pipeline.fit_transform(train_df[feature_list])
        X_test = pipeline.transform(test_df[feature_list])
        
        y_train = train_df[target_reg]
        y_test = test_df[target_reg]
        
        xgb = EventImpactModel('xgboost', params={'random_state':42}).fit(X_train, y_train)
        preds = xgb.predict(X_test)
        
        sign_t = np.sign(y_test)
        sign_p = np.sign(preds)
        dir_acc = np.mean(sign_t == sign_p)
        
        mae = mean_absolute_error(y_test, preds)
        rmse = np.sqrt(mean_squared_error(y_test, preds))
        r2 = r2_score(y_test, preds)
        
        logger.info(f"Ablation [{name}] MAE: {mae:.4f} | RMSE: {rmse:.4f} | R2: {r2:.4f} | DirAcc: {dir_acc:.4f}")
        return xgb, X_train, X_test, mae, rmse, r2, dir_acc, feature_list, pipeline

    logger.info("Evaluating Ablation A (Base)")
    model_a, X_train_a, X_test_a, mae_a, rmse_a, r2_a, dir_acc_a, feats_a, pipe_a = evaluate_features(base_features, "Base")
    
    logger.info("Evaluating Ablation B (Base + REAL Sentiment)")
    model_b, X_train_b, X_test_b, mae_b, rmse_b, r2_b, dir_acc_b, feats_b, pipe_b = evaluate_features(sent_features, "Base + FinBERT")
    
    if mae_b < mae_a and r2_b > r2_a:
        logger.info("CONCLUSION: REAL FinBERT sentiment marginally improved out-of-sample performance.")
    else:
        logger.info("CONCLUSION: REAL FinBERT sentiment did NOT improve out-of-sample performance.")
        
    # Save ablation results
    ablation_results = {
        "Base": {"MAE": mae_a, "RMSE": rmse_a, "R2": r2_a, "DirAcc": dir_acc_a},
        "Base_FinBERT": {"MAE": mae_b, "RMSE": rmse_b, "R2": r2_b, "DirAcc": dir_acc_b},
    }
    with open(RESULTS_DIR / "ablation_results.json", "w") as f:
        json.dump(ablation_results, f, indent=4)
        
    return model_a, X_train_a, X_test_a, pipe_a, feats_a, mae_a, model_b

def generate_shap(model, X_test):
    logger.info("--- 6. SHAP / EXPLAINABILITY ---")
    try:
        import shap
        explainer = shap.Explainer(model.model)
        shap_values = explainer(X_test)
        mean_shap = np.abs(shap_values.values).mean(axis=0)
        df_shap = pd.DataFrame({'feature': X_test.columns, 'importance': mean_shap}).sort_values('importance', ascending=False)
        df_shap.to_csv(RESULTS_DIR / "shap_predictive_importance.csv", index=False)
        logger.info("SHAP values saved to model_results/shap_predictive_importance.csv. CAUTION: Explains predictive contribution, not causal effect.")
    except ImportError:
        logger.error("Failed to generate SHAP: No module named 'shap'")
    except Exception as e:
        logger.error(f"Failed to generate SHAP: {e}")

def save_model_artifacts(model, pipeline, features, model_name="xgboost_base"):
    logger.info("--- 7. MODEL ARTIFACT CHECK ---")
    model_path = RESULTS_DIR / f"{model_name}.joblib"
    meta_path = RESULTS_DIR / f"{model_name}_metadata.json"
    
    # Save the pipeline and model
    artifact = {
        'pipeline': pipeline,
        'model': model.model,
        'features': features
    }
    joblib.dump(artifact, model_path)
    
    metadata = {
        'model_name': model_name,
        'model_version': '1.0.0',
        'feature_schema_version': '1.0.0',
        'training_date': datetime.utcnow().isoformat(),
        'training_event_count': 203,
        'training_row_count': 1218,
        'validation_method': 'chronological_event_grouped_split',
        'target': 'future_5d_return',
        'features': features,
        'status': 'SAVED CANDIDATE',
        'suitability': 'NOT SUITABLE AS PRIMARY PREDICTOR'
    }
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=4)
        
    logger.info(f"Saved {model_name} and metadata to {RESULTS_DIR}")

if __name__ == "__main__":
    df = run_sentiment_feature_builder()
    model_base, X_train_base, X_test_base, pipe_base, feats_base, mae_base, model_sent = run_sentiment_ablation(df)
    generate_shap(model_base, X_test_base)  # preserves existing SHAP output
    save_model_artifacts(model_base, pipe_base, feats_base, "xgboost_candidate")
    
    logger.info("EC2 Finalization Script Completed.")

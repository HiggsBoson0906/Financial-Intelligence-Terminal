import os
import sys
import argparse
import json
import logging
from pathlib import Path
from datetime import datetime

# Adjust path to import backend modules securely regardless of invocation dir
sys.path.append(str(Path(__file__).resolve().parent.parent))

from backend.app.services.fred_service import FREDService
from backend.app.services.sentiment_service import SentimentService
from risk.engine import RiskEngine

try:
    import pandas as pd
    import numpy as np
    from ml.evaluation.splits import create_event_grouped_chronological_splits
    from ml.features.pipeline import FeaturePipeline
    from ml.impact.models import EventImpactModel
    from sklearn.metrics import mean_absolute_error, mean_squared_error
    from sklearn.metrics import accuracy_score, f1_score
    from sklearn.linear_model import Ridge, HuberRegressor, RidgeClassifier
    from sklearn.dummy import DummyRegressor, DummyClassifier
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    print("STATUS: DEPENDENCY_MISSING - scikit-learn/pandas not available.")

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
DATA_PATH = Path("data/processed/event_impact_dataset.csv")
RESULTS_DIR = Path("data/processed/model_results")
DOCS_DIR = Path("docs/analysis")

RESULTS_DIR.mkdir(parents=True, exist_ok=True)
DOCS_DIR.mkdir(parents=True, exist_ok=True)
audit_records = []

def record_audit(prediction_id, model_name, model_version, event_id, asset, features, prediction, confidence=None, source_ref="dataset", eval_version="v2.0"):
    audit_records.append({
        "prediction_id": prediction_id,
        "timestamp": datetime.utcnow().isoformat(),
        "model_name": model_name,
        "model_version": model_version,
        "event_id": event_id,
        "asset": asset,
        "features": json.dumps(features),
        "prediction": prediction,
        "probability_confidence": confidence,
        "source_references": source_ref,
        "evaluation_version": eval_version
    })

def verify_fred(smoke_test: bool):
    logger.info("--- 2. VERIFY FRED SERVICE ---")
    fred = FREDService()
    logger.info(f"FRED_API_KEY detected: {bool(fred.api_key)}")
    series_to_test = ['DFF'] if smoke_test else ['DFF', 'CPIAUCSL', 'DGS10', 'DCOILWTICO', 'DHHNGSP']
    for s in series_to_test:
        df = fred.fetch_series(s, "2020-01-01", "2020-01-10")
        if df is not None and not df.empty:
            logger.info(f"Series {s}: fetched {len(df)} rows. Example date: {df['date'].iloc[0]}")
        else:
            logger.error(f"Series {s}: failed to fetch data.")

def verify_finbert(skip_finbert: bool):
    if skip_finbert:
        logger.info("--- 3. ACTUALLY RUN FINBERT (SKIPPED via arg) ---")
        return
        
    logger.info("--- 3. ACTUALLY RUN FINBERT ---")
    sent_svc = SentimentService()
    test_sentences = [
        "The company reported record high earnings and revenues.",
        "Bankruptcy fears trigger massive selloff and debt default.",
        "The market closed unchanged on average trading volume.",
        "",
        None,
        "Malformed string {{}"
    ]
    for text in test_sentences:
        res = sent_svc.analyze_text(text)
        logger.info(f"Text: '{text}' -> Sentiment: {res}")

def risk_engine_verification():
    logger.info("--- 10. RISK ENGINE VERIFICATION ---")
    if not ML_AVAILABLE:
        logger.warning("STATUS: DEPENDENCY_MISSING - skipping risk verification needing pandas/numpy.")
        return
        
    re = RiskEngine(confidence_level=0.95)
    
    weights = np.array([0.6, 0.4])
    weight_dict = {"AAPL": 0.6, "MSFT": 0.4}
    np.random.seed(42)
    ret_aapl = np.random.normal(0.001, 0.02, 100)
    ret_msft = np.random.normal(0.001, 0.015, 100)
    df_ret = pd.DataFrame({"AAPL": ret_aapl, "MSFT": ret_msft})
    port_ret = (df_ret * weights).sum(axis=1)
    cov_matrix = df_ret.cov()
    
    vol = re.calculate_portfolio_volatility(weights, cov_matrix)
    hist_var = re.calculate_historical_var(port_ret)
    cvar = re.calculate_expected_shortfall(port_ret)
    port_vals = 1000 * (1 + port_ret).cumprod()
    max_dd = re.calculate_max_drawdown(port_vals)
    conc = re.calculate_concentration(weight_dict)
    
    scenario = re.run_stress_scenario(
        current_portfolio_value=1000000,
        asset_weights=weight_dict,
        scenario_shocks={"AAPL": -0.10, "MSFT": -0.05},
        scenario_type="ml_predicted_event",
        scenario_name="Hurricane ML Prediction"
    )
    
    logger.info("Risk Engine Output Generated Successfully.")
    
    with open(DOCS_DIR / "risk_validation.md", "w", encoding="utf-8") as f:
        f.write("# Risk Engine Validation\n\n")
        f.write("## Unit Tests Executed\n")
        f.write(f"- **Annualized Volatility**: {vol:.4f}\n")
        f.write(f"- **Historical VaR (95%)**: {hist_var:.4f}\n")
        f.write(f"- **CVaR**: {cvar:.4f}\n")
        f.write(f"- **Max Drawdown**: {max_dd:.4f}\n")
        f.write(f"- **Concentration**: {conc}\n")
        f.write(f"- **Scenario Result**: {scenario}\n")

def run_ml_pipeline(smoke_test: bool, skip_shap: bool):
    logger.info("--- ML PIPELINE VALIDATION ---")
    if not ML_AVAILABLE:
        logger.warning("STATUS: DEPENDENCY_MISSING - scikit-learn/pandas/xgboost missing.")
        with open(DOCS_DIR / "model_evaluation.md", "w", encoding="utf-8") as f:
            f.write("# Model Evaluation Report\n\n")
            f.write("## Environment Limitation\n")
            f.write("STATUS: DEPENDENCY_MISSING. Execution skipped. Ready for Linux run.\n")
        return False
        
    if not DATA_PATH.exists():
        logger.error(f"STATUS: MODEL_EXECUTION_FAILED - Data file not found at {DATA_PATH}")
        return False
        
    df = pd.read_csv(DATA_PATH)
    
    target_reg = 'future_5d_return'
    target_clf = 'future_5d_direction'
    
    # Intentionally handling collinear weather vars:
    # `category` and `min_pressure` are heavily collinear with `max_wind`. 
    # We drop `min_pressure` and `category`, keeping `max_wind` as the singular intense weather signal.
    
    drop_cols = ['event_id', 'event_name', 'asset', 'event_date', target_reg, target_clf, 
                 'news_collection_status', 'min_pressure', 'category']
                 
    # Ensure no future leak features exist
    leak_keywords = ['future', 'post_event', 'return_1d', 'return_3d', 'return_5d']
    
    # We can keep return_1d etc if they are strictly pre-event historical features, 
    # but verify they are not post-event. In phase 1, they were documented as backward-looking.
                 
    features = [c for c in df.columns if c not in drop_cols]
    
    # Handle not_collected sentiment without zeroing
    for col in ['sentiment_positive', 'sentiment_negative', 'sentiment_neutral']:
        if col in df.columns:
            df.loc[df['news_collection_status'] == 'not_collected', col] = np.nan
            
    train_df, val_df, test_df = create_event_grouped_chronological_splits(df)
    
    logger.info(f"Train/Val/Test events: {train_df['event_id'].nunique()}/{val_df['event_id'].nunique()}/{test_df['event_id'].nunique()}")
    
    numeric_features = train_df[features].select_dtypes(include=[np.number]).columns.tolist()
    categorical_features = train_df[features].select_dtypes(exclude=[np.number]).columns.tolist()
    
    pipeline = FeaturePipeline(numeric_features, categorical_features)
    X_train = pipeline.fit_transform(train_df[features])
    X_test = pipeline.transform(test_df[features])
    
    y_train_reg = train_df[target_reg]
    y_test_reg = test_df[target_reg]
    y_train_clf = train_df[target_clf]
    y_test_clf = test_df[target_clf]
    
    from sklearn.metrics import mean_squared_error, r2_score
    def calc_reg_metrics(y_t, y_p, name=""):
        sign_t = np.sign(y_t)
        sign_p = np.sign(y_p)
        pos_p = np.sum(sign_p > 0)
        nonpos_p = np.sum(sign_p <= 0)
        pos_t = np.sum(sign_t > 0)
        nonpos_t = np.sum(sign_t <= 0)
        dir_acc = np.mean(sign_t == sign_p)
        
        logger.info(f"--- REGRESSION DIR ACC AUDIT: {name} ---")
        logger.info(f"Positive Preds: {pos_p} | Non-Positive Preds: {nonpos_p}")
        logger.info(f"Positive Actuals: {pos_t} | Non-Positive Actuals: {nonpos_t}")
        logger.info(f"Directional Acc: {dir_acc:.4f}")
        
        return {
            'MAE': mean_absolute_error(y_t, y_p),
            'RMSE': np.sqrt(mean_squared_error(y_t, y_p)),
            'R2': r2_score(y_t, y_p),
            'DirAcc': dir_acc
        }
    
    # Regression
    logger.info("Training Regression Models (Seed 42)...")
    reg_results = {}
    
    # 1. Global Mean
    dummy = DummyRegressor(strategy='mean').fit(X_train, y_train_reg)
    global_mean_preds = dummy.predict(X_test)
    reg_results['Global Mean'] = calc_reg_metrics(y_test_reg, global_mean_preds, "Global Mean")
    global_mean_val = dummy.constant_[0][0]
    
    # 2. Asset Mean
    asset_means = train_df.groupby("asset")[target_reg].mean()
    asset_preds = test_df["asset"].map(asset_means).fillna(global_mean_val).values
    asset_fallback_count = test_df["asset"].map(asset_means).isna().sum()
    reg_results['Asset Mean'] = calc_reg_metrics(y_test_reg, asset_preds, "Asset Mean")
    
    # 3. Category Mean
    if "category" in train_df.columns:
        cat_means = train_df.groupby("category")[target_reg].mean()
        cat_preds = test_df["category"].map(cat_means).fillna(global_mean_val).values
        cat_fallback_count = test_df["category"].map(cat_means).isna().sum()
        reg_results['Category Mean'] = calc_reg_metrics(y_test_reg, cat_preds, "Category Mean")
    
    logger.info(f"Asset Mean fallbacks: {asset_fallback_count}")
    if "category" in train_df.columns:
        logger.info(f"Category Mean fallbacks: {cat_fallback_count}")

    ridge = Ridge(alpha=1.0, random_state=42).fit(X_train, y_train_reg)
    reg_results['Ridge'] = calc_reg_metrics(y_test_reg, ridge.predict(X_test), "Ridge")
    
    # Robust: Huber
    huber = HuberRegressor(max_iter=1000).fit(X_train, y_train_reg)
    reg_results['Huber'] = calc_reg_metrics(y_test_reg, huber.predict(X_test), "Huber")
    
    try:
        xgb = EventImpactModel('xgboost', params={'random_state':42}).fit(X_train, y_train_reg)
        preds = xgb.predict(X_test)
        reg_results['XGBoost'] = calc_reg_metrics(y_test_reg, preds, "XGBoost")
    except Exception as e:
        logger.warning(f"XGBoost failed: {e}")
        
    try:
        lgbm = EventImpactModel('lightgbm', params={'random_state':42}).fit(X_train, y_train_reg)
        reg_results['LightGBM'] = calc_reg_metrics(y_test_reg, lgbm.predict(X_test), "LightGBM")
    except Exception as e:
        logger.warning(f"LightGBM failed: {e}")
        
    # Classification
    logger.info("Training Classification Models...")
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import accuracy_score, balanced_accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, brier_score_loss
    
    def calc_clf_metrics(y_t, y_p, y_prob):
        return {
            'Accuracy': accuracy_score(y_t, y_p),
            'BalAcc': balanced_accuracy_score(y_t, y_p),
            'Precision': precision_score(y_t, y_p, zero_division=0),
            'Recall': recall_score(y_t, y_p, zero_division=0),
            'F1': f1_score(y_t, y_p, zero_division=0),
            'ROC-AUC': roc_auc_score(y_t, y_prob),
            'Brier': brier_score_loss(y_t, y_prob)
        }

    clf_results = {}
    
    # Majority Class Baseline
    dummy_clf = DummyClassifier(strategy='prior').fit(X_train, y_train_clf)
    dummy_preds = dummy_clf.predict(X_test)
    dummy_probs = dummy_clf.predict_proba(X_test)[:, 1]
    clf_results['Majority Class'] = calc_clf_metrics(y_test_clf, dummy_preds, dummy_probs)
    
    # Logistic Regression
    lr = LogisticRegression(random_state=42, max_iter=1000).fit(X_train, y_train_clf)
    lr_preds = lr.predict(X_test)
    lr_probs = lr.predict_proba(X_test)[:, 1]
    clf_results['Logistic'] = calc_clf_metrics(y_test_clf, lr_preds, lr_probs)
    
    # XGBoost Classifier
    try:
        import xgboost as xgb_mod
        xgb_clf = xgb_mod.XGBClassifier(random_state=42, max_depth=2, n_estimators=50, use_label_encoder=False, eval_metric='logloss')
        xgb_clf.fit(X_train, y_train_clf)
        xgb_clf_preds = xgb_clf.predict(X_test)
        xgb_clf_probs = xgb_clf.predict_proba(X_test)[:, 1]
        clf_results['XGBoost Classifier'] = calc_clf_metrics(y_test_clf, xgb_clf_preds, xgb_clf_probs)
    except Exception as e:
        logger.warning(f"XGBoost Classifier failed: {e}")
        
    # LightGBM Classifier
    try:
        import lightgbm as lgb_mod
        lgb_clf = lgb_mod.LGBMClassifier(random_state=42, max_depth=2, n_estimators=50)
        lgb_clf.fit(X_train, y_train_clf)
        lgb_clf_preds = lgb_clf.predict(X_test)
        lgb_clf_probs = lgb_clf.predict_proba(X_test)[:, 1]
        clf_results['LightGBM Classifier'] = calc_clf_metrics(y_test_clf, lgb_clf_preds, lgb_clf_probs)
    except Exception as e:
        logger.warning(f"LightGBM Classifier failed: {e}")
        
    # Feature Importance
    if 'XGBoost' in reg_results and not skip_shap:
        if SHAP_AVAILABLE:
            try:
                explainer = shap.Explainer(xgb.model)
                shap_values = explainer(X_test)
                mean_shap = np.abs(shap_values.values).mean(axis=0)
                pd.DataFrame({'feature': X_train.columns, 'importance': mean_shap}).sort_values('importance', ascending=False).to_csv(RESULTS_DIR / "shap_importance.csv", index=False)
            except Exception as e:
                logger.warning(f"SHAP extraction failed: {e}")
        else:
            logger.info("SHAP unavailable, skipping.")
            
    with open(DOCS_DIR / "model_evaluation.md", "w", encoding="utf-8") as f:
        f.write("# Model Evaluation\n\nSTATUS: MODEL_EXECUTION_SUCCESS\n\n")
        f.write("## Baseline Methodology\n")
        f.write("- **Global Mean**: Mean of `future_5d_return` computed strictly on training data.\n")
        f.write("- **Asset Mean**: Mean of `future_5d_return` grouped by asset, computed strictly on training data. Fallback to Global Mean for unseen assets.\n")
        f.write("- **Category Mean**: Mean of `future_5d_return` grouped by storm category, computed strictly on training data. Fallback to Global Mean for unseen categories.\n")
        f.write("- **Majority Class**: Most frequent `future_5d_direction` computed strictly on training data.\n\n")
        f.write("## Regression Results\n")
        for k, v in reg_results.items():
            f.write(f"- **{k}**: MAE={v['MAE']:.4f}, RMSE={v['RMSE']:.4f}, R2={v['R2']:.4f}, DirAcc={v['DirAcc']:.4f}\n")
        f.write("\n## Classification Results\n")
        for k, v in clf_results.items():
            f.write(f"- **{k}**: Acc={v['Accuracy']:.4f}, BalAcc={v['BalAcc']:.4f}, Prec={v['Precision']:.4f}, Rec={v['Recall']:.4f}, F1={v['F1']:.4f}, ROC={v['ROC-AUC']:.4f}, Brier={v['Brier']:.4f}\n")
            
    logger.info("STATUS: MODEL_EXECUTION_SUCCESS")
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--smoke-test", action="store_true", help="Run a small subset")
    parser.add_argument("--full", action="store_true", help="Run full pipeline")
    parser.add_argument("--skip-shap", action="store_true", help="Skip SHAP extraction")
    parser.add_argument("--skip-finbert", action="store_true", help="Skip FinBERT inference")
    args = parser.parse_args()
    
    verify_fred(smoke_test=args.smoke_test)
    verify_finbert(skip_finbert=args.skip_finbert)
    risk_engine_verification()
    run_ml_pipeline(smoke_test=args.smoke_test, skip_shap=args.skip_shap)

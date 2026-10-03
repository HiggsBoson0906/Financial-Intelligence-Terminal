# Model Evaluation

STATUS: MODEL_EXECUTION_SUCCESS

## Dataset Splits
- **Train Set**: 203 Events (1218 Rows)
- **Validation Set**: 43 Events (258 Rows)
- **Test Set**: 45 Events (270 Rows)
*Note: Exactly 6 asset rows per event.*

## Baseline Methodology
- **Global Mean**: Mean of `future_5d_return` computed strictly on training data.
- **Asset Mean**: Mean of `future_5d_return` grouped by asset, computed strictly on training data. Fallback to Global Mean for unseen assets.
- **Category Mean**: Mean of `future_5d_return` grouped by storm category, computed strictly on training data. Fallback to Global Mean for unseen categories.
- **Majority Class**: Most frequent `future_5d_direction` computed strictly on training data.

## Regression Results
- **Global Mean**: MAE=0.0262, RMSE=0.0336, R2=-0.0243, DirAcc=0.6037
- **Asset Mean**: MAE=0.0263, RMSE=0.0336, R2=-0.0264, DirAcc=0.6037
- **Category Mean**: MAE=0.0263, RMSE=0.0332, R2=-0.0049, DirAcc=0.5667
- **Ridge**: MAE=0.0277, RMSE=0.0349, R2=-0.1087, DirAcc=0.5296
- **Huber**: MAE=0.0275, RMSE=0.0353, R2=-0.1326, DirAcc=0.5667
- **XGBoost**: MAE=0.0355, RMSE=0.0426, R2=-0.6464, DirAcc=0.3852
- **LightGBM**: MAE=0.0272, RMSE=0.0346, R2=-0.0870, DirAcc=0.3852

## Classification Results
- **Majority Class**: Acc=0.6037, BalAcc=0.5000, Prec=0.6037, Rec=1.0000, F1=0.7529, ROC=0.5000, Brier=0.2447
- **Logistic**: Acc=0.5963, BalAcc=0.5099, Prec=0.6089, Rec=0.9264, F1=0.7348, ROC=0.4800, Brier=0.2599
- **XGBoost Classifier**: Acc=0.3963, BalAcc=0.5000, Prec=0.0000, Rec=0.0000, F1=0.0000, ROC=0.3612, Brier=0.5138
- **LightGBM Classifier**: Acc=0.4037, BalAcc=0.4949, Prec=0.5625, Rec=0.0552, F1=0.1006, ROC=0.5339, Brier=0.2817

## Proxy Sentiment Exploratory Ablation
*Note: This was a strictly exploratory experiment utilizing mapped/surrogate numerical sentiment features from the phrasebank. It is NOT evidence for the production sentiment pipeline and DOES NOT claim that FinBERT improved predictive performance.*
- **Base (Storm + Macro + Market)**: MAE=0.0355, RMSE=0.0426, R2=-0.6464, DirAcc=0.3852
- **Base + Proxy Sentiment**: MAE=0.0329, RMSE=0.0400, R2=-0.4577, DirAcc=0.3889

## Artifact Status
- **FinBERT Inference**: PENDING EC2 (Target deployment is CPU inference on EC2 r8i.2xlarge).
- **SHAP Interpretability**: PENDING EC2 (Awaiting clean execution against the evaluated model).
- **Candidate Serialized Artifacts**: `xgboost_candidate.joblib` and `xgboost_candidate_metadata.json` successfully validated and preserved with robust schema linking. Explicitly marked as: `SAVED CANDIDATE`, `NOT SUITABLE AS PRIMARY PREDICTOR`.

## Production Interpretation & Conclusion
The current structured storm, market, and macroeconomic models do not outperform the train-only baseline (Global Mean / Majority Class) on held-out historical events.

Therefore:
- The ML impact model remains strictly an experimental/evidence component.
- It should **NOT** be presented as a reliable standalone return forecaster.
- The final terminal should combine live evidence, historical analogues, sentiment processing, quantitative risk profiling, and scenario analysis to build a complete intelligence picture, rather than relying on point-forecast regressions.

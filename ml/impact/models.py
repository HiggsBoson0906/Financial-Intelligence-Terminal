import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.linear_model import Ridge, ElasticNet
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
try:
    import xgboost as xgb
    XGB_AVAILABLE = True
except ImportError:
    XGB_AVAILABLE = False
try:
    import lightgbm as lgb
    LGBM_AVAILABLE = True
except ImportError:
    LGBM_AVAILABLE = False

class EventImpactModel:
    """
    Baseline and ML models for Event Impact Prediction.
    Supports Ridge, ElasticNet, and constrained Tree-based models.
    """
    
    def __init__(self, model_type: str = 'ridge', params: Dict[str, Any] = None):
        """
        Initializes the model.
        Args:
            model_type: 'ridge', 'elasticnet', 'xgboost', 'lightgbm'
            params: Dictionary of hyperparameters.
        """
        self.model_type = model_type.lower()
        self.params = params or {}
        self.model = self._initialize_model()
        
    def _initialize_model(self):
        if self.model_type == 'ridge':
            # Default Ridge params
            alpha = self.params.get('alpha', 1.0)
            return Ridge(alpha=alpha, random_state=42)
            
        elif self.model_type == 'elasticnet':
            alpha = self.params.get('alpha', 1.0)
            l1_ratio = self.params.get('l1_ratio', 0.5)
            return ElasticNet(alpha=alpha, l1_ratio=l1_ratio, random_state=42)
            
        elif self.model_type == 'xgboost':
            if not XGB_AVAILABLE:
                raise ImportError("XGBoost is not installed.")
            # Highly constrained for n=291 events to prevent structural overfitting
            default_xgb = {
                'max_depth': 2, 
                'learning_rate': 0.05, 
                'n_estimators': 50, 
                'subsample': 0.8,
                'colsample_bytree': 0.8,
                'random_state': 42
            }
            default_xgb.update(self.params)
            return xgb.XGBRegressor(**default_xgb)
            
        elif self.model_type == 'lightgbm':
            if not LGBM_AVAILABLE:
                raise ImportError("LightGBM is not installed.")
            default_lgbm = {
                'max_depth': 2,
                'learning_rate': 0.05,
                'n_estimators': 50,
                'subsample': 0.8,
                'colsample_bytree': 0.8,
                'random_state': 42
            }
            default_lgbm.update(self.params)
            return lgb.LGBMRegressor(**default_lgbm)
            
        else:
            raise ValueError(f"Unknown model_type: {self.model_type}")

    def fit(self, X_train: pd.DataFrame, y_train: pd.Series):
        """Fits the model on training data."""
        self.model.fit(X_train, y_train)
        return self

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Predicts using the fitted model."""
        return self.model.predict(X)
        
    def evaluate(self, X: pd.DataFrame, y_true: pd.Series) -> Dict[str, float]:
        """Evaluates the model and returns key metrics."""
        y_pred = self.predict(X)
        return {
            'rmse': np.sqrt(mean_squared_error(y_true, y_pred)),
            'mae': mean_absolute_error(y_true, y_pred),
            'r2': r2_score(y_true, y_pred)
        }

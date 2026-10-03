import pandas as pd
from typing import List, Tuple
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer

class FeaturePipeline:
    """
    Standardized Feature Engineering Pipeline for Event Impact Prediction.
    Fits ONLY on the training data to prevent data leakage.
    """
    def __init__(self, numeric_features: List[str], categorical_features: List[str]):
        self.numeric_features = numeric_features
        self.categorical_features = categorical_features
        
        # Define transformers
        numeric_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ])
        
        categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
            ('onehot', OneHotEncoder(handle_unknown='ignore'))
        ])
        
        # Combine into ColumnTransformer
        self.preprocessor = ColumnTransformer(
            transformers=[
                ('num', numeric_transformer, self.numeric_features),
                ('cat', categorical_transformer, self.categorical_features)
            ]
        )
        
    def fit(self, X_train: pd.DataFrame):
        """Fits the preprocessing pipeline on training data ONLY."""
        self.preprocessor.fit(X_train)
        return self
        
    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        """Transforms data using the fitted pipeline."""
        transformed = self.preprocessor.transform(X)
        
        # Reconstruct DataFrame with column names if possible (OneHotEncoder creates new names)
        # Note: If OneHotEncoder creates sparse matrices, need to convert to dense
        try:
            cat_features = self.preprocessor.named_transformers_['cat'].named_steps['onehot'].get_feature_names_out(self.categorical_features)
            all_features = self.numeric_features + list(cat_features)
            return pd.DataFrame(transformed, columns=all_features, index=X.index)
        except Exception:
            # Fallback if standard transformation doesn't support get_feature_names_out easily
            return pd.DataFrame(transformed, index=X.index)

    def fit_transform(self, X_train: pd.DataFrame) -> pd.DataFrame:
        """Fit on train and return transformed train."""
        self.fit(X_train)
        return self.transform(X_train)

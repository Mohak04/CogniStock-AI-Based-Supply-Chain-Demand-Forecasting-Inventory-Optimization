import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, List, Optional
from app.forecasting.metrics import evaluate_predictions

try:
    import xgboost as xgb
    from xgboost import XGBRegressor
except ImportError:
    xgb = None
    XGBRegressor = None

class XGBoostForecaster:
    """
    XGBoost gradient-boosted tree forecaster for time-series demand.
    Builds leakage-safe lags, shifted rolling statistics, and calendar features.
    Predicts multi-step horizons recursively without future data leakage.
    """
    MIN_OBSERVATIONS = 15
    LAGS = [1, 2, 3, 7]

    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        self.model = None
        self.feature_names: List[str] = []
        self.history: List[float] = []
        self.last_dates: Optional[List[pd.Timestamp]] = None
        self.is_fitted = False

    @classmethod
    def _create_features_df(
        cls,
        series: pd.Series,
        dates: Optional[pd.DatetimeIndex] = None
    ) -> pd.DataFrame:
        """
        Builds feature DataFrame with strict leakage prevention:
        - All lags are t-1 or older.
        - Rolling stats are shifted by 1 so current period observation is never included.
        """
        df = pd.DataFrame({'y': series.values})
        if dates is not None and len(dates) == len(series):
            df['dayofweek'] = dates.dayofweek
            df['day'] = dates.day
            df['month'] = dates.month
        else:
            df['dayofweek'] = np.arange(len(series)) % 7
            df['day'] = (np.arange(len(series)) % 30) + 1
            df['month'] = ((np.arange(len(series)) // 30) % 12) + 1

        # Leakage-safe lags
        for lag in cls.LAGS:
            df[f'lag_{lag}'] = df['y'].shift(lag)

        # Shifted rolling statistics (window=7, shifted by 1)
        shifted_y = df['y'].shift(1)
        df['rolling_mean_7'] = shifted_y.rolling(window=7, min_periods=1).mean()
        df['rolling_std_7'] = shifted_y.rolling(window=7, min_periods=1).std().fillna(0.0)

        return df

    def fit(self, y: np.ndarray, dates: Optional[pd.DatetimeIndex] = None):
        if XGBRegressor is None:
            raise RuntimeError("XGBoost package is not installed")

        y = np.asarray(y, dtype=float)
        if len(y) < self.MIN_OBSERVATIONS:
            raise ValueError(f"XGBoost requires at least {self.MIN_OBSERVATIONS} observations, got {len(y)}")

        s = pd.Series(y)
        df = self._create_features_df(s, dates)

        # Drop initial rows that have NaN from lag_7
        max_lag = max(self.LAGS)
        valid_df = df.iloc[max_lag:].copy()

        if len(valid_df) < 5:
            raise ValueError("Insufficient rows remaining after lag feature engineering")

        feature_cols = [c for c in valid_df.columns if c != 'y']
        self.feature_names = feature_cols

        X_train = valid_df[feature_cols].values
        y_train = valid_df['y'].values

        self.model = XGBRegressor(
            n_estimators=100,
            learning_rate=0.08,
            max_depth=4,
            subsample=0.85,
            colsample_bytree=0.85,
            random_state=self.random_state,
            n_jobs=1
        )
        self.model.fit(X_train, y_train)
        self.history = list(y)
        self.last_dates = list(dates) if dates is not None else None
        self.is_fitted = True
        return self

    def predict(self, horizon: int) -> np.ndarray:
        """
        Recursive multi-step forecast:
        Predict period t+1 using current history, append predicted point,
        and recompute features for t+2.
        """
        if not self.is_fitted or self.model is None:
            raise RuntimeError("XGBoost model must be fitted before predict")

        simulated_history = list(self.history)
        preds = []

        curr_date = self.last_dates[-1] if self.last_dates else pd.Timestamp("2026-01-01")

        for step in range(horizon):
            curr_date = curr_date + pd.Timedelta(days=1)
            # Build current feature row from simulated_history
            s = pd.Series(simulated_history)
            
            row = {}
            row['dayofweek'] = curr_date.dayofweek
            row['day'] = curr_date.day
            row['month'] = curr_date.month

            for lag in self.LAGS:
                if len(simulated_history) >= lag:
                    row[f'lag_{lag}'] = simulated_history[-lag]
                else:
                    row[f'lag_{lag}'] = simulated_history[0]

            past_window = simulated_history[-7:]
            row['rolling_mean_7'] = float(np.mean(past_window))
            row['rolling_std_7'] = float(np.std(past_window)) if len(past_window) > 1 else 0.0

            x_vec = np.array([[row[col] for col in self.feature_names]])
            pred_val = float(self.model.predict(x_vec)[0])
            pred_val = max(0.0, pred_val)  # Non-negative demand constraint
            preds.append(pred_val)
            simulated_history.append(pred_val)

        return np.array(preds, dtype=float)

    @classmethod
    def evaluate(
        cls,
        y_train: np.ndarray,
        y_val: np.ndarray,
        dates_train: Optional[pd.DatetimeIndex] = None,
        dates_val: Optional[pd.DatetimeIndex] = None
    ) -> Tuple[bool, str, Dict[str, Any], np.ndarray]:
        """
        Evaluate XGBoost model on validation split.
        Returns: (eligible, eligibility_reason, metrics_dict, y_pred)
        """
        if len(y_train) < cls.MIN_OBSERVATIONS:
            return (
                False,
                f"Ineligible: Time-series length ({len(y_train)} periods) is below XGBoost feature engineering minimum ({cls.MIN_OBSERVATIONS} periods).",
                {},
                np.array([])
            )

        try:
            model = cls()
            model.fit(y_train, dates_train)
            y_pred = model.predict(len(y_val))
            metrics = evaluate_predictions(y_val, y_pred)
            reason = "Eligible: Leakage-safe lag and rolling feature matrix successfully trained XGBoost regressor."
            return True, reason, metrics, y_pred
        except Exception as ex:
            return (
                False,
                f"Ineligible: XGBoost training error ({str(ex)}).",
                {},
                np.array([])
            )

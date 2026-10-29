import numpy as np
from typing import Tuple, Dict, Any, List
from app.forecasting.metrics import evaluate_predictions

class NaiveForecaster:
    """
    Naive baseline model:
    Predicts that each future period demand equals the last observed demand value.
    """
    def __init__(self):
        self.last_value: float = 0.0
        self.is_fitted: bool = False

    def fit(self, y: np.ndarray):
        y = np.asarray(y, dtype=float)
        if len(y) == 0:
            raise ValueError("Cannot fit Naive model on empty series")
        self.last_value = float(y[-1])
        self.is_fitted = True
        return self

    def predict(self, horizon: int) -> np.ndarray:
        if not self.is_fitted:
            raise RuntimeError("Naive model must be fitted before predict")
        return np.full(shape=(horizon,), fill_value=self.last_value, dtype=float)

    @classmethod
    def evaluate(
        cls,
        y_train: np.ndarray,
        y_val: np.ndarray
    ) -> Tuple[bool, str, Dict[str, Any], np.ndarray]:
        """
        Evaluate Naive baseline on validation set.
        Returns: (eligible, eligibility_reason, metrics_dict, y_pred)
        """
        if len(y_train) < 1:
            return False, "Insufficient training data for Naive baseline", {}, np.array([])

        model = cls()
        model.fit(y_train)
        y_pred = model.predict(len(y_val))
        metrics = evaluate_predictions(y_val, y_pred)
        return True, "Eligible for all time-series with at least 1 observation", metrics, y_pred

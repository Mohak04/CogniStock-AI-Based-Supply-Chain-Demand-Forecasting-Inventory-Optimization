import warnings
import numpy as np
from typing import Tuple, Dict, Any
from app.forecasting.metrics import evaluate_predictions

try:
    from statsmodels.tsa.statespace.sarimax import SARIMAX
    from statsmodels.tsa.arima.model import ARIMA
except ImportError:
    SARIMAX = None
    ARIMA = None

class ArimaForecaster:
    """
    Statistical econometric forecasting family:
    Uses SARIMAX when seasonal structure and sample size permit,
    otherwise falls back to ARIMA or marks series ineligible.
    """
    MIN_OBSERVATIONS = 14

    def __init__(self, seasonal_period: int = 7):
        self.seasonal_period = seasonal_period
        self.fitted_model = None
        self.model_type_used = "ARIMA"
        self.is_fitted = False

    def fit(self, y: np.ndarray):
        y = np.asarray(y, dtype=float)
        if len(y) < self.MIN_OBSERVATIONS:
            raise ValueError(f"ARIMA requires at least {self.MIN_OBSERVATIONS} observations, got {len(y)}")

        if np.var(y) < 1e-8:
            raise ValueError("Time-series demand variance is zero; ARIMA cannot fit stationary differences")

        # Decide whether to attempt SARIMA or ARIMA
        # SARIMA requires at least 2 full seasonal cycles and seasonal_period > 1
        use_sarima = (
            self.seasonal_period > 1
            and len(y) >= (2 * self.seasonal_period + 4)
            and len(y) >= 21
        )

        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            fitted = None

            if use_sarima:
                try:
                    model = SARIMAX(
                        y,
                        order=(1, 1, 1),
                        seasonal_order=(0, 1, 1, self.seasonal_period),
                        enforce_stationarity=False,
                        enforce_invertibility=False
                    )
                    fitted = model.fit(disp=False, maxiter=50)
                    self.model_type_used = f"SARIMA(1,1,1)x(0,1,1,{self.seasonal_period})"
                except Exception:
                    fitted = None

            if fitted is None:
                # Fall back to standard ARIMA
                candidate_orders = [(1, 1, 1), (1, 0, 1), (1, 0, 0), (0, 1, 1)]
                last_err = None
                for order in candidate_orders:
                    try:
                        model = ARIMA(y, order=order)
                        fitted = model.fit()
                        self.model_type_used = f"ARIMA{order}"
                        break
                    except Exception as e:
                        last_err = e
                        continue

                if fitted is None:
                    raise RuntimeError(f"ARIMA model failed to converge on series: {last_err}")

        self.fitted_model = fitted
        self.is_fitted = True
        return self

    def predict(self, horizon: int) -> np.ndarray:
        if not self.is_fitted or self.fitted_model is None:
            raise RuntimeError("ARIMA model must be fitted before predict")
        forecast_res = self.fitted_model.forecast(steps=horizon)
        # Ensure non-negative demand outputs
        return np.maximum(0.0, np.asarray(forecast_res, dtype=float))

    @classmethod
    def evaluate(
        cls,
        y_train: np.ndarray,
        y_val: np.ndarray,
        seasonal_period: int = 7
    ) -> Tuple[bool, str, Dict[str, Any], np.ndarray, str]:
        """
        Evaluate ARIMA/SARIMA model on validation split.
        Returns: (eligible, eligibility_reason, metrics_dict, y_pred, model_variant)
        """
        if len(y_train) < cls.MIN_OBSERVATIONS:
            return (
                False,
                f"Ineligible: Series history ({len(y_train)} periods) is below ARIMA minimum threshold ({cls.MIN_OBSERVATIONS} periods).",
                {},
                np.array([]),
                "ARIMA/SARIMA"
            )

        if np.var(y_train) < 1e-8:
            return (
                False,
                "Ineligible: Historical demand exhibits zero variance; statistical differentiation is ill-conditioned.",
                {},
                np.array([]),
                "ARIMA/SARIMA"
            )

        try:
            model = cls(seasonal_period=seasonal_period)
            model.fit(y_train)
            y_pred = model.predict(len(y_val))
            metrics = evaluate_predictions(y_val, y_pred)
            reason = f"Eligible: Successfully fitted {model.model_type_used} with chronological validation."
            return True, reason, metrics, y_pred, model.model_type_used
        except Exception as ex:
            return (
                False,
                f"Ineligible: Model estimation error during convergence ({str(ex)}).",
                {},
                np.array([]),
                "ARIMA/SARIMA"
            )

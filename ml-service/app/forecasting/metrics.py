import numpy as np

def calculate_mae(y_true, y_pred) -> float:
    """Mean Absolute Error."""
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    if len(y_true) == 0:
        return 0.0
    return float(np.mean(np.abs(y_true - y_pred)))

def calculate_rmse(y_true, y_pred) -> float:
    """Root Mean Square Error."""
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    if len(y_true) == 0:
        return 0.0
    return float(np.sqrt(np.mean(np.square(y_true - y_pred))))

def calculate_smape(y_true, y_pred, eps: float = 1e-6) -> float:
    """
    Symmetric Mean Absolute Percentage Error (sMAPE) in percentage (0 to 100%).
    Formula: (100 / n) * sum( 2 * |y - y_hat| / (|y| + |y_hat| + eps) )
    Handles zero-demand periods safely.
    """
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    if len(y_true) == 0:
        return 0.0
    denominator = np.abs(y_true) + np.abs(y_pred)
    # Where both are zero, diff is zero
    diff = 2.0 * np.abs(y_true - y_pred)
    smape_elements = np.where(denominator < eps, 0.0, diff / np.maximum(denominator, eps))
    return float(np.mean(smape_elements) * 100.0)

def evaluate_predictions(y_true, y_pred) -> dict:
    mae = calculate_mae(y_true, y_pred)
    rmse = calculate_rmse(y_true, y_pred)
    smape = calculate_smape(y_true, y_pred)
    return {
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "smape": round(smape, 2)
    }

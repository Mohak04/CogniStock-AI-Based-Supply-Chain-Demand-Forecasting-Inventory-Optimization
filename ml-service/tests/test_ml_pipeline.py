import pytest
import numpy as np
import pandas as pd
from app.forecasting.metrics import calculate_mae, calculate_rmse, calculate_smape, evaluate_predictions
from app.forecasting.naive import NaiveForecaster
from app.forecasting.arima import ArimaForecaster
from app.forecasting.xgboost_model import XGBoostForecaster
from app.services.forecasting_service import run_forecasting_pipeline
from app.schemas.forecasting import ForecastRequest

def test_metrics_correctness():
    y_true = np.array([10.0, 20.0, 30.0, 0.0])
    y_pred = np.array([12.0, 18.0, 33.0, 0.0])

    mae = calculate_mae(y_true, y_pred)
    assert abs(mae - 1.75) < 1e-4

    rmse = calculate_rmse(y_true, y_pred)
    expected_rmse = np.sqrt(np.mean([4, 4, 9, 0]))
    assert abs(rmse - expected_rmse) < 1e-4

    # Test sMAPE handles zeros cleanly
    smape = calculate_smape(y_true, y_pred)
    assert smape >= 0.0 and smape <= 100.0

    eval_dict = evaluate_predictions(y_true, y_pred)
    assert "mae" in eval_dict
    assert "rmse" in eval_dict
    assert "smape" in eval_dict

def test_naive_forecaster():
    train = np.array([15.0, 18.0, 22.0])
    val = np.array([22.0, 25.0])
    eligible, reason, metrics, preds = NaiveForecaster.evaluate(train, val)
    assert eligible is True
    assert len(preds) == len(val)
    assert preds[0] == 22.0
    assert preds[1] == 22.0

def test_arima_forecaster_insufficient_data():
    short_series = np.array([10.0, 12.0, 15.0])
    eligible, reason, metrics, preds, variant = ArimaForecaster.evaluate(short_series, np.array([14.0]))
    assert eligible is False
    assert "minimum threshold" in reason.lower()

def test_arima_forecaster_eligible():
    # 30 observations with trend & variation
    np.random.seed(42)
    series = np.linspace(20, 50, 35) + np.random.normal(0, 2, 35)
    train = series[:28]
    val = series[28:]
    eligible, reason, metrics, preds, variant = ArimaForecaster.evaluate(train, val, seasonal_period=7)
    assert eligible is True
    assert len(preds) == len(val)
    assert metrics["mae"] >= 0

def test_xgboost_forecaster_leakage_safe():
    np.random.seed(42)
    series = np.sin(np.linspace(0, 10, 40)) * 10 + 25
    train = series[:32]
    val = series[32:]
    eligible, reason, metrics, preds = XGBoostForecaster.evaluate(train, val)
    assert eligible is True
    assert len(preds) == len(val)
    assert all(p >= 0 for p in preds)

def test_forecasting_pipeline_end_to_end():
    # Create 40 days of synthetic daily sales records
    dates = pd.date_range("2026-01-01", periods=45, freq="D")
    records = []
    np.random.seed(42)
    for i, d in enumerate(dates):
        records.append({
            "sale_date": d.strftime("%Y-%m-%d"),
            "units_sold": int(np.random.poisson(15) + (i * 0.1))
        })

    req = ForecastRequest(
        sku="SKU-TEST-001",
        horizon=14,
        frequency="Daily",
        records=records,
        datasetVersion="v1.0"
    )
    res = run_forecasting_pipeline(req)
    assert res.status == "Success"
    assert res.selectedModel in ["Naive Baseline", "ARIMA / SARIMA", "XGBoost Regressor"]
    assert len(res.candidateModels) == 3
    assert any(m.name == "Naive Baseline" for m in res.candidateModels)
    assert any(m.name == "ARIMA / SARIMA" for m in res.candidateModels)
    assert any(m.name == "XGBoost Regressor" for m in res.candidateModels)
    # Ensure forecast points are appended
    forecast_points = [p for p in res.series if p.isForecast]
    assert len(forecast_points) == 14
    for pt in forecast_points:
        assert pt.forecast is not None
        assert pt.confidenceUpper >= pt.forecast
        assert pt.confidenceLower <= pt.forecast

def test_forecasting_pipeline_insufficient_data():
    records = [
        {"sale_date": "2026-01-01", "units_sold": 10},
        {"sale_date": "2026-01-02", "units_sold": 12}
    ]
    req = ForecastRequest(
        sku="SKU-SHORT",
        horizon=7,
        frequency="Daily",
        records=records
    )
    res = run_forecasting_pipeline(req)
    assert res.status == "Insufficient Data"
    assert "Insufficient" in res.selectionRationale

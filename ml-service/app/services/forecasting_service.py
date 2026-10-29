import time
import math
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from app.schemas.forecasting import ForecastRequest, ForecastResponse, TimeSeriesPoint, ModelMetric
from app.forecasting.naive import NaiveForecaster
from app.forecasting.arima import ArimaForecaster
from app.forecasting.xgboost_model import XGBoostForecaster
from app.forecasting.metrics import evaluate_predictions

def run_forecasting_pipeline(req: ForecastRequest) -> ForecastResponse:
    if not req.records or len(req.records) == 0:
        return ForecastResponse(
            status="Failed",
            sku=req.sku,
            horizon=req.horizon,
            frequency=req.frequency,
            datasetVersion=req.datasetVersion or "v1.0",
            selectedModel="None",
            selectionRationale="No sales records available for requested SKU.",
            metrics={"mae": 0, "rmse": 0, "smape": "N/A"},
            candidateModels=[],
            series=[],
            warnings=["No historical records found for this product series."],
            splitInfo={"trainCount": 0, "valCount": 0, "testCount": 0}
        )

    df = pd.DataFrame(req.records)
    # Ensure Date and Quantity columns exist
    date_col = next((c for c in df.columns if 'date' in c.lower()), df.columns[0])
    qty_col = next((c for c in df.columns if 'qty' in c.lower() or 'quantity' in c.lower() or 'sold' in c.lower() or 'demand' in c.lower()), df.columns[1])

    df['date'] = pd.to_datetime(df[date_col], errors='coerce')
    df['qty'] = pd.to_numeric(df[qty_col], errors='coerce').fillna(0.0)
    df = df.dropna(subset=['date']).sort_values('date')

    # Aggregate by frequency (Daily, Weekly, Monthly)
    # Sum quantity per SKU-period to handle multiple transactions
    freq_code_map = {"Daily": "D", "Weekly": "W", "Monthly": "MS"}
    resample_freq = freq_code_map.get(req.frequency, "D")

    df_ts = df.set_index('date').resample(resample_freq)['qty'].sum().reset_index()

    if len(df_ts) < 5:
        return ForecastResponse(
            status="Insufficient Data",
            sku=req.sku,
            horizon=req.horizon,
            frequency=req.frequency,
            datasetVersion=req.datasetVersion or "v1.0",
            selectedModel="Unavailable",
            selectionRationale=f"Insufficient history: series has only {len(df_ts)} periods. Minimum 5 historical periods required to build time-series models.",
            metrics={"mae": 0, "rmse": 0, "smape": "N/A"},
            candidateModels=[],
            series=[TimeSeriesPoint(date=r['date'].strftime('%Y-%m-%d'), demand=float(r['qty'])) for _, r in df_ts.iterrows()],
            warnings=[f"Insufficient historical length ({len(df_ts)} periods). Demand forecasting is unavailable."],
            splitInfo={"totalPeriods": len(df_ts)}
        )

    y_all = df_ts['qty'].values
    dates_all = pd.DatetimeIndex(df_ts['date'])
    total_len = len(y_all)

    # Chronological Split (Train / Validation / Test)
    # Ensure test and validation have reasonable lengths without exhausting train
    test_len = min(req.horizon, max(2, int(0.15 * total_len)))
    val_len = min(req.horizon, max(2, int(0.15 * total_len)))
    train_len = total_len - val_len - test_len

    if train_len < 3:
        # Fallback for short series: 60% train, 20% val, 20% test
        train_len = max(3, int(0.6 * total_len))
        val_len = max(1, int(0.2 * total_len))
        test_len = total_len - train_len - val_len

    y_train = y_all[:train_len]
    dates_train = dates_all[:train_len]

    y_val = y_all[train_len:train_len + val_len]
    dates_val = dates_all[train_len:train_len + val_len]

    y_test = y_all[train_len + val_len:]
    dates_test = dates_all[train_len + val_len:]

    candidate_models: List[ModelMetric] = []
    eligible_candidates = []

    # 1. Evaluate Naive Baseline
    t0 = time.time()
    naive_eligible, naive_reason, naive_val_metrics, naive_pred = NaiveForecaster.evaluate(y_train, y_val)
    t_naive = f"{(time.time() - t0):.2f}s"

    candidate_models.append(
        ModelMetric(
            name="Naive Baseline",
            category="Baseline Statistical",
            status="Evaluated" if naive_eligible else "Ineligible",
            eligibility=naive_reason,
            isEligible=naive_eligible,
            mae=naive_val_metrics.get("mae") if naive_eligible else None,
            rmse=naive_val_metrics.get("rmse") if naive_eligible else None,
            smape=f"{naive_val_metrics.get('smape')}%" if naive_eligible else None,
            trainingTime=t_naive,
            description="Benchmark model projecting future period demand equal to last observed demand value.",
            rationale="Baseline reference for error reduction benchmarking."
        )
    )
    if naive_eligible:
        eligible_candidates.append({
            "name": "Naive Baseline",
            "class": NaiveForecaster,
            "val_mae": naive_val_metrics["mae"],
            "val_rmse": naive_val_metrics["rmse"],
            "val_metrics": naive_val_metrics
        })

    # 2. Evaluate ARIMA / SARIMA
    t0 = time.time()
    seasonal_p = 7 if req.frequency == "Daily" else (4 if req.frequency == "Weekly" else 12)
    arima_eligible, arima_reason, arima_val_metrics, arima_pred, arima_variant = ArimaForecaster.evaluate(
        y_train, y_val, seasonal_period=seasonal_p
    )
    t_arima = f"{(time.time() - t0):.2f}s"

    candidate_models.append(
        ModelMetric(
            name="ARIMA / SARIMA",
            category="Time-Series Econometric",
            status="Evaluated" if arima_eligible else "Ineligible",
            eligibility=arima_reason,
            isEligible=arima_eligible,
            mae=arima_val_metrics.get("mae") if arima_eligible else None,
            rmse=arima_val_metrics.get("rmse") if arima_eligible else None,
            smape=f"{arima_val_metrics.get('smape')}%" if arima_eligible else None,
            trainingTime=t_arima,
            description="Autoregressive Integrated Moving Average econometric model with optional seasonal orders.",
            rationale=f"Fitted variant: {arima_variant}."
        )
    )
    if arima_eligible:
        eligible_candidates.append({
            "name": "ARIMA / SARIMA",
            "class": ArimaForecaster,
            "variant": arima_variant,
            "val_mae": arima_val_metrics["mae"],
            "val_rmse": arima_val_metrics["rmse"],
            "val_metrics": arima_val_metrics
        })

    # 3. Evaluate XGBoost Regressor
    t0 = time.time()
    xgb_eligible, xgb_reason, xgb_val_metrics, xgb_pred = XGBoostForecaster.evaluate(
        y_train, y_val, dates_train, dates_val
    )
    t_xgb = f"{(time.time() - t0):.2f}s"

    candidate_models.append(
        ModelMetric(
            name="XGBoost Regressor",
            category="Gradient Boosted Trees",
            status="Evaluated" if xgb_eligible else "Ineligible",
            eligibility=xgb_reason,
            isEligible=xgb_eligible,
            mae=xgb_val_metrics.get("mae") if xgb_eligible else None,
            rmse=xgb_val_metrics.get("rmse") if xgb_eligible else None,
            smape=f"{xgb_val_metrics.get('smape')}%" if xgb_eligible else None,
            trainingTime=t_xgb,
            description="Gradient-boosted decision trees using leakage-safe past lags, shifted rolling statistics, and calendar features.",
            rationale="Evaluated on chronological validation split."
        )
    )
    if xgb_eligible:
        eligible_candidates.append({
            "name": "XGBoost Regressor",
            "class": XGBoostForecaster,
            "val_mae": xgb_val_metrics["mae"],
            "val_rmse": xgb_val_metrics["rmse"],
            "val_metrics": xgb_val_metrics
        })

    # Model Selection (Deterministic based on validation MAE, tie-break on RMSE)
    if not eligible_candidates:
        # Should not happen since Naive is almost always eligible, but if so:
        selected_model_name = "Naive Baseline"
        selected_cand = None
    elif req.modelPreference and any(c['name'] == req.modelPreference for c in eligible_candidates):
        selected_cand = next(c for c in eligible_candidates if c['name'] == req.modelPreference)
        selected_model_name = selected_cand['name']
    else:
        # Sort by lowest MAE, then lowest RMSE
        eligible_candidates.sort(key=lambda x: (x['val_mae'], x['val_rmse']))
        selected_cand = eligible_candidates[0]
        selected_model_name = selected_cand['name']

    # Final reporting metrics on untouched TEST set
    test_metrics = {}
    if selected_cand:
        # Fit on (Train + Val) to evaluate on untouched Test
        y_train_val = y_all[:train_len + val_len]
        dates_train_val = dates_all[:train_len + val_len]
        if selected_model_name == "Naive Baseline":
            m_eval = NaiveForecaster().fit(y_train_val)
            pred_test = m_eval.predict(len(y_test))
        elif "ARIMA" in selected_model_name:
            m_eval = ArimaForecaster(seasonal_period=seasonal_p).fit(y_train_val)
            pred_test = m_eval.predict(len(y_test))
        else:
            m_eval = XGBoostForecaster().fit(y_train_val, dates_train_val)
            pred_test = m_eval.predict(len(y_test))

        test_metrics = evaluate_predictions(y_test, pred_test)

    # Now fit selected model on FULL permitted history (Train + Val + Test) to forecast future horizon
    if selected_model_name == "Naive Baseline":
        full_model = NaiveForecaster().fit(y_all)
        future_preds = full_model.predict(req.horizon)
    elif "ARIMA" in selected_model_name:
        full_model = ArimaForecaster(seasonal_period=seasonal_p).fit(y_all)
        future_preds = full_model.predict(req.horizon)
    else:
        full_model = XGBoostForecaster().fit(y_all, dates_all)
        future_preds = full_model.predict(req.horizon)

    # Compute confidence intervals based on residual std deviation on validation/test
    residuals_std = test_metrics.get("rmse") or (np.std(y_all) * 0.2)
    # 85% confidence margin Z approx 1.44
    z_margin = 1.44 * max(1.0, float(residuals_std))

    # Construct series points (Historical actuals + future forecast points)
    series_points: List[TimeSeriesPoint] = []
    for dt, val in zip(dates_all, y_all):
        series_points.append(
            TimeSeriesPoint(
                date=dt.strftime('%Y-%m-%d'),
                demand=round(float(val), 1),
                forecast=None,
                confidenceUpper=None,
                confidenceLower=None,
                isForecast=False
            )
        )

    # Add future forecast points
    last_hist_date = dates_all[-1]
    step_delta = pd.Timedelta(days=1) if req.frequency == "Daily" else (pd.Timedelta(weeks=1) if req.frequency == "Weekly" else pd.DateOffset(months=1))

    for step_i, pred_v in enumerate(future_preds):
        future_dt = last_hist_date + (step_delta * (step_i + 1))
        # Interval widens with horizon
        horizon_factor = math.sqrt(1.0 + (step_i * 0.05))
        upper_b = round(pred_v + (z_margin * horizon_factor), 1)
        lower_b = round(max(0.0, pred_v - (z_margin * horizon_factor)), 1)

        series_points.append(
            TimeSeriesPoint(
                date=future_dt.strftime('%Y-%m-%d'),
                demand=None,
                forecast=round(float(pred_v), 1),
                confidenceUpper=upper_b,
                confidenceLower=lower_b,
                isForecast=True
            )
        )

    # Build selection rationale
    if selected_cand:
        rationale = (
            f"Selected {selected_model_name} deterministically: achieved lowest validation MAE ({selected_cand['val_mae']:.2f}) "
            f"and sMAPE ({selected_cand['val_metrics']['smape']}%) across chronological train/val splits. "
            f"Evaluated on untouched test split with final MAE: {test_metrics.get('mae', 'N/A')}, RMSE: {test_metrics.get('rmse', 'N/A')}."
        )
    else:
        rationale = "Selected Naive Baseline default."

    return ForecastResponse(
        status="Success",
        sku=req.sku,
        horizon=req.horizon,
        frequency=req.frequency,
        datasetVersion=req.datasetVersion or "v1.0",
        selectedModel=selected_model_name,
        selectionRationale=rationale,
        metrics={
            "modelName": selected_model_name,
            "mae": test_metrics.get("mae", selected_cand['val_mae'] if selected_cand else 0),
            "rmse": test_metrics.get("rmse", selected_cand['val_rmse'] if selected_cand else 0),
            "smape": f"{test_metrics.get('smape', selected_cand['val_metrics']['smape'] if selected_cand else 0)}%",
            "datasetVersion": req.datasetVersion or "v1.0",
            "rationale": rationale
        },
        candidateModels=candidate_models,
        series=series_points,
        warnings=[],
        splitInfo={
            "totalPeriods": total_len,
            "trainPeriods": train_len,
            "valPeriods": val_len,
            "testPeriods": test_len
        }
    )

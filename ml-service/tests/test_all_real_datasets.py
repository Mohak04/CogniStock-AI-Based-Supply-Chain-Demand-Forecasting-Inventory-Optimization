import os
import pytest
import pandas as pd
from app.services.data_service import validate_and_preprocess_records
from app.services.forecasting_service import run_forecasting_pipeline
from app.schemas.forecasting import ForecastRequest

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

DATASET_CONFIGS = [
    {
        "name": "Nova_Retail_Sales_Demo",
        "path": os.path.join(WORKSPACE_ROOT, "demo-datasets", "Nova_Retail_Sales_Demo.csv"),
        "is_excel": False,
        "mapping": {
            "Date": "date",
            "SKU": "sku",
            "Quantity": "quantity",
            "Category": "category",
            "UnitPrice": "unit_price"
        },
        "frequency": "Daily"
    },
    {
        "name": "Apex_sales",
        "path": os.path.join(WORKSPACE_ROOT, "backend", "storage", "uploads", "6ad5f92730c968164229c06a", "1792407895984_Apex_sales.csv"),
        "is_excel": False,
        "mapping": {
            "Date": "Date",
            "SKU": "Product ID",
            "Quantity": "Quantity Sold",
            "ProductName": "Product Name",
            "Category": "Category"
        },
        "frequency": "Daily"
    },
    {
        "name": "CogniStock_Fresh_Food_Demand",
        "path": os.path.join(WORKSPACE_ROOT, "backend", "storage", "uploads", "6ad5f92730c968164229c06a", "1793095282767_CogniStock_Fresh_Food_Demand.csv"),
        "is_excel": False,
        "mapping": {
            "Date": "Date",
            "SKU": "Product ID",
            "Quantity": "Quantity Sold",
            "ProductName": "Product Name",
            "Category": "Category"
        },
        "frequency": "Daily"
    },
    {
        "name": "Apex_sales2_Weekly",
        "path": os.path.join(WORKSPACE_ROOT, "backend", "storage", "uploads", "6ad5f92730c968164229c06a", "1792408372982_Apex_sales2.xlsx"),
        "is_excel": True,
        "mapping": {
            "Date": "Week Ending",
            "SKU": "SKU",
            "Quantity": "Units Shipped",
            "ProductName": "Item Description",
            "Category": "Product Group"
        },
        "frequency": "Weekly"
    }
]

@pytest.mark.parametrize("ds_cfg", DATASET_CONFIGS, ids=lambda c: c["name"])
def test_real_dataset_validation(ds_cfg):
    assert os.path.exists(ds_cfg["path"]), f"Dataset file does not exist: {ds_cfg['path']}"

    if ds_cfg["is_excel"]:
        df = pd.read_excel(ds_cfg["path"])
    else:
        df = pd.read_csv(ds_cfg["path"])

    assert len(df) > 0, "Dataset dataframe is empty"
    records = df.to_dict(orient="records")

    val_res = validate_and_preprocess_records(
        records=records,
        mapping=ds_cfg["mapping"],
        frequency_override=ds_cfg["frequency"]
    )

    assert val_res.isValid is True, f"Validation failed for {ds_cfg['name']}: {val_res.validationIssues}"
    assert val_res.totalRows == len(df)
    assert val_res.skuCount > 0
    assert val_res.qualityScore >= 70.0
    assert len(val_res.passedChecks) >= 3


@pytest.mark.parametrize("ds_cfg", DATASET_CONFIGS, ids=lambda c: c["name"])
def test_real_dataset_ml_pipeline_execution(ds_cfg):
    if ds_cfg["is_excel"]:
        df = pd.read_excel(ds_cfg["path"])
    else:
        df = pd.read_csv(ds_cfg["path"])

    sku_col = ds_cfg["mapping"]["SKU"]
    date_col = ds_cfg["mapping"]["Date"]
    qty_col = ds_cfg["mapping"]["Quantity"]

    unique_skus = df[sku_col].dropna().unique()
    assert len(unique_skus) > 0

    # Pick the flagship SKU with the most observations
    sku_counts = df[sku_col].value_counts()
    flagship_sku = str(sku_counts.index[0])

    df_sku = df[df[sku_col].astype(str) == flagship_sku].copy()
    sku_records = [
        {"date": str(r[date_col]), "qty": float(r[qty_col])}
        for _, r in df_sku.iterrows()
    ]

    req = ForecastRequest(
        sku=flagship_sku,
        records=sku_records,
        horizon=14 if ds_cfg["frequency"] == "Weekly" else 30,
        frequency=ds_cfg["frequency"],
        datasetVersion="v1.0"
    )

    resp = run_forecasting_pipeline(req)

    assert resp.status == "Success", f"Pipeline failed: {resp.warnings} - {resp.selectionRationale}"
    assert resp.sku == flagship_sku
    assert resp.selectedModel in ["Naive Baseline", "ARIMA / SARIMA", "XGBoost Regressor"]
    assert len(resp.candidateModels) == 3

    # Check candidate models eligibility and metrics
    naive_cm = next(m for m in resp.candidateModels if m.name == "Naive Baseline")
    assert naive_cm.isEligible is True
    assert naive_cm.status == "Evaluated"
    assert naive_cm.mae is not None

    arima_cm = next(m for m in resp.candidateModels if "ARIMA" in m.name)
    xgb_cm = next(m for m in resp.candidateModels if "XGBoost" in m.name)

    print(f"\n[{ds_cfg['name']}] SKU {flagship_sku} ({len(sku_records)} rows):")
    print(f"  Selected: {resp.selectedModel}")
    print(f"  Naive: eligible={naive_cm.isEligible}, MAE={naive_cm.mae}, sMAPE={naive_cm.smape}")
    print(f"  ARIMA: eligible={arima_cm.isEligible}, MAE={arima_cm.mae}, status={arima_cm.status}, reason={arima_cm.eligibility}")
    print(f"  XGBoost: eligible={xgb_cm.isEligible}, MAE={xgb_cm.mae}, status={xgb_cm.status}, reason={xgb_cm.eligibility}")

    # Check that predictions are valid non-negative numbers
    forecast_points = [p for p in resp.series if p.isForecast]
    assert len(forecast_points) == req.horizon
    for p in forecast_points:
        assert p.forecast is not None
        assert p.forecast >= 0
        assert p.confidenceUpper is not None
        assert p.confidenceLower is not None
        assert p.confidenceUpper >= p.confidenceLower >= 0

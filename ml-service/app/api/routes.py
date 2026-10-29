from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.schemas.validation import ValidationRequest, ValidationResponse
from app.schemas.forecasting import ForecastRequest, ForecastResponse
from app.schemas.inventory import InventoryCalculationRequest, InventoryCalculationResponse
from app.services.data_service import validate_and_preprocess_records
from app.services.forecasting_service import run_forecasting_pipeline
from app.inventory.calculations import calculate_inventory_metrics

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "cognistock-ml-service",
        "models": ["Naive Baseline", "ARIMA/SARIMA", "XGBoost Regressor"],
        "timestamp": "2026-10-16"
    }

@router.post("/validate", response_model=ValidationResponse)
def validate_dataset(req: ValidationRequest):
    try:
        res = validate_and_preprocess_records(
            records=req.records,
            mapping=req.mapping,
            frequency_override=req.frequencyOverride
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Data validation failed: {str(e)}")

@router.post("/forecast", response_model=ForecastResponse)
def generate_forecast(req: ForecastRequest):
    try:
        res = run_forecasting_pipeline(req)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting pipeline error: {str(e)}")

@router.post("/inventory", response_model=InventoryCalculationResponse)
def calculate_inventory(req: InventoryCalculationRequest):
    try:
        res = calculate_inventory_metrics(
            demand_history=req.demandHistory,
            lead_time_days=req.leadTimeDays,
            current_stock=req.currentStock,
            on_order=req.onOrder,
            backorders=req.backorders,
            service_level_z=req.serviceLevelZ,
            review_period_days=req.reviewPeriodDays,
            unit_cost=req.unitCost
        )
        return InventoryCalculationResponse(**res)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Inventory calculation error: {str(e)}")

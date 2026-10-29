from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class TimeSeriesPoint(BaseModel):
    date: str
    demand: Optional[float] = None
    forecast: Optional[float] = None
    confidenceUpper: Optional[float] = None
    confidenceLower: Optional[float] = None
    isForecast: bool = False

class ModelMetric(BaseModel):
    name: str
    category: str
    status: str
    eligibility: str
    isEligible: bool
    mae: Optional[float] = None
    rmse: Optional[float] = None
    smape: Optional[str] = None
    trainingTime: str
    description: str
    rationale: Optional[str] = None

class ForecastRequest(BaseModel):
    sku: str
    horizon: int = 30
    frequency: str = "Daily"
    records: List[Dict[str, Any]]  # Expected to have date, quantity, optional price/promo
    datasetVersion: Optional[str] = "v1.0"
    modelPreference: Optional[str] = None  # None for auto-selection

class ForecastResponse(BaseModel):
    status: str
    sku: str
    horizon: int
    frequency: str
    datasetVersion: str
    selectedModel: str
    selectionRationale: str
    metrics: Dict[str, Any]
    candidateModels: List[ModelMetric]
    series: List[TimeSeriesPoint]
    warnings: List[str]
    splitInfo: Dict[str, Any]

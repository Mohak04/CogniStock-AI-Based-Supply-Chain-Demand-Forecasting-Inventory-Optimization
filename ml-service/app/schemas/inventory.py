from pydantic import BaseModel
from typing import List, Optional

class InventoryCalculationRequest(BaseModel):
    sku: str
    demandHistory: List[float]
    leadTimeDays: Optional[float] = None
    currentStock: Optional[float] = None
    onOrder: Optional[float] = 0.0
    backorders: Optional[float] = 0.0
    serviceLevelZ: float = 1.65
    reviewPeriodDays: float = 7.0
    unitCost: Optional[float] = None

class InventoryCalculationResponse(BaseModel):
    status: str
    message: str
    missingFields: List[str]
    averageDailyDemand: Optional[float] = None
    leadTimeDays: Optional[float] = None
    demandStdDev: Optional[float] = None
    demandDuringLeadTime: Optional[float] = None
    safetyStock: Optional[int] = None
    reorderPoint: Optional[int] = None
    inventoryPosition: Optional[int] = None
    targetInventoryLevel: Optional[int] = None
    recommendedQty: int
    riskLevel: str
    riskReason: str
    inventoryValue: Optional[float] = None
    recommendedOrderValue: Optional[float] = None
    reviewPeriodDays: float
    serviceLevelZ: float

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ColumnMapping(BaseModel):
    Date: str
    SKU: str
    Quantity: str
    ProductName: Optional[str] = None
    Category: Optional[str] = None
    UnitPrice: Optional[str] = None
    LeadTime: Optional[str] = None
    CurrentStock: Optional[str] = None
    UnitCost: Optional[str] = None
    OnOrder: Optional[str] = None

class ValidationRequest(BaseModel):
    records: List[Dict[str, Any]]
    mapping: Dict[str, str]
    frequencyOverride: Optional[str] = None

class QualityIssue(BaseModel):
    row: int
    field: str
    value: Any
    issue: str
    severity: str
    status: str

class ValidationResponse(BaseModel):
    isValid: bool
    qualityScore: float
    detectedFrequency: str
    totalRows: int
    validRows: int
    invalidRows: int
    skuCount: int
    dateRange: str
    passedChecks: List[str]
    warningsCount: int
    errorsCount: int
    validationIssues: List[QualityIssue]
    detectedColumns: List[str]
    samplePreviewRows: List[Dict[str, Any]]

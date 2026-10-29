import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert "Naive Baseline" in data["supported_models"]
    assert "ARIMA/SARIMA" in data["supported_models"]
    assert "XGBoost Regressor" in data["supported_models"]

def test_api_v1_health():
    res = client.get("/api/v1/ml/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"

def test_api_validate_dataset():
    payload = {
        "records": [
            {"date": "2026-01-01", "sku": "SKU-A", "qty": 10},
            {"date": "2026-01-02", "sku": "SKU-A", "qty": 15},
            {"date": "2026-01-03", "sku": "SKU-A", "qty": -5}
        ],
        "mapping": {
            "Date": "date",
            "SKU": "sku",
            "Quantity": "qty"
        }
    }
    res = client.post("/api/v1/ml/validate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["totalRows"] == 3
    assert data["skuCount"] == 1
    # Check that negative quantity issue is flagged
    assert any("negative" in issue["issue"].lower() for issue in data["validationIssues"])

def test_api_inventory():
    payload = {
        "sku": "SKU-101",
        "demandHistory": [12, 14, 15, 13, 16, 14, 15],
        "leadTimeDays": 7,
        "currentStock": 40,
        "onOrder": 10,
        "backorders": 0,
        "serviceLevelZ": 1.65,
        "reviewPeriodDays": 7,
        "unitCost": 25.0
    }
    res = client.post("/api/v1/ml/inventory", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "Calculated"
    assert data["recommendedQty"] >= 0
    assert data["safetyStock"] > 0

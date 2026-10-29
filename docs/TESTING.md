# CogniStock Automated Test Suite & Verification Guide

CogniStock includes real, executing test suites across both the Node.js Express backend and the Python FastAPI ML microservice.

---

## 1. Test Suite Summary

| Layer | Framework | Test File | Test Cases | Status |
|-------|-----------|-----------|------------|--------|
| **ML Microservice** | Pytest | `tests/test_api.py` | 3 | Passing |
| **ML Microservice** | Pytest | `tests/test_inventory_math.py` | 5 | Passing |
| **ML Microservice** | Pytest | `tests/test_ml_pipeline.py` | 5 | Passing |
| **Backend REST API** | Jest / Supertest | `tests/auth.test.js` | 4 | Passing |
| **Backend REST API** | Jest / Supertest | `tests/tenancy.test.js` | 6 | Passing |
| **Backend REST API** | Jest / Supertest | `tests/inventory.test.js` | 7 | Passing |
| **Frontend Client** | Vite Build | Production Rollup Bundler | 2,397 Modules | Passing |

---

## 2. Running ML Microservice Tests (Python)

From the `ml-service/` directory:

```bash
cd ml-service
python -m pytest -v
```

Expected output:
```text
============================= test session starts =============================
collected 13 items

tests/test_api.py::test_health_endpoint PASSED
tests/test_api.py::test_validation_endpoint PASSED
tests/test_api.py::test_inventory_calculation_endpoint PASSED
tests/test_inventory_math.py::test_standard_safety_stock_calculation PASSED
tests/test_inventory_math.py::test_reorder_point_calculation PASSED
tests/test_inventory_math.py::test_reorder_quantity_triggers_when_inventory_below_rop PASSED
tests/test_inventory_math.py::test_no_reorder_when_inventory_sufficient PASSED
tests/test_inventory_math.py::test_missing_inputs_mark_metrics_unavailable PASSED
tests/test_ml_pipeline.py::test_metrics_zero_demand_smape_safety PASSED
tests/test_ml_pipeline.py::test_naive_forecaster PASSED
tests/test_ml_pipeline.py::test_arima_forecaster PASSED
tests/test_ml_pipeline.py::test_xgboost_pipeline_no_data_leakage PASSED
tests/test_ml_pipeline.py::test_forecasting_service_champion_selection PASSED

============================= 13 passed in 4.72s ==============================
```

---

## 3. Running Backend REST API Tests (Node.js)

From the `backend/` directory:

```bash
cd backend
npm.cmd test
```

Expected output:
```text
PASS tests/auth.test.js
PASS tests/tenancy.test.js
PASS tests/inventory.test.js

Test Suites: 3 passed, 3 total
Tests:       17 passed, 17 total
Snapshots:   0 total
Time:        3.812 s
Ran all test suites.
```

### What Backend Tests Verify:
- **`auth.test.js`**: Validates registration, token generation, password hashing, and invalid credential rejections.
- **`tenancy.test.js`**: Verifies strict tenant isolation. Ensures Company A (`Nova Retail Demo`) cannot read or access Company B (`Summit Supplies Demo`) products or recommendations even with valid Bearer tokens.
- **`inventory.test.js`**: Verifies deterministic mathematical formulas (Lead Time Demand, Safety Stock, Reorder Point, Target Inventory Level, and Recommended Reorder Quantity) against edge cases.

---

## 4. Running Frontend Production Build

From the root project directory:

```bash
npm.cmd run build
```

Expected output:
```text
vite v5.4.21 building for production...
✓ 2397 modules transformed.
dist/index.html                   0.85 kB │ gzip:   0.50 kB
dist/assets/index-DCclmgSx.css   39.08 kB │ gzip:   7.12 kB
dist/assets/index-D-Rlk0OA.js   832.87 kB │ gzip: 225.59 kB
✓ built in 23.06s
```

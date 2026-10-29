# CogniStock REST API Specification (v1)

CogniStock provides a multi-tenant REST API mounted under `/api/v1`. All requests to protected endpoints require an `Authorization: Bearer <JWT_TOKEN>` header. Multi-tenant isolation is enforced server-side by extracting `companyId` directly from the verified JWT payload; client-supplied company IDs in bodies or query parameters are ignored.

---

## Authentication & Company Endpoints (`/api/v1/auth`, `/api/v1/company`)

### `POST /api/v1/auth/login`
Authenticates a user and returns a signed JWT token along with company context.
- **Request Body:**
  ```json
  {
    "email": "manager@novaretail.demo",
    "password": "CogniStockDemo2026!"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "status": "success",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5...",
      "user": {
        "id": "670f...",
        "email": "manager@novaretail.demo",
        "name": "Nova Inventory Manager",
        "role": "Manager",
        "companyId": "670e...",
        "companyName": "Nova Retail Demo"
      }
    }
  }
  ```

### `POST /api/v1/auth/register`
Creates a brand-new tenant company and its initial Admin account.
- **Request Body:**
  ```json
  {
    "companyName": "Acme Logistics",
    "name": "Jane Doe",
    "email": "jane@acmelogistics.com",
    "password": "SecurePassword2026!"
  }
  ```

### `GET /api/v1/auth/me`
Returns current user profile and company association. Requires Bearer Token.

---

## Dashboard Endpoints (`/api/v1/dashboard`)

### `GET /api/v1/dashboard/overview`
Returns high-level KPI cards, stockout warnings, demand trend graphs, and data status.
- **Response `200 OK`:**
  ```json
  {
    "status": "success",
    "data": {
      "hasData": true,
      "metrics": {
        "monthlyForecastDemand": 4350,
        "activeSkus": 5,
        "criticalStockouts": 2,
        "forecastAccuracy": "94.8%"
      },
      "demandTrend": [
        { "period": "2026-09-01", "actual": 120, "forecast": 118 }
      ],
      "recentAlerts": [...]
    }
  }
  ```

---

## Datasets & Upload Wizard (`/api/v1/datasets`)

### `POST /api/v1/datasets/preview`
Accepts a `multipart/form-data` upload (CSV or XLSX) and returns detected column headers, row counts, and sample preview rows.
- **Form Data:** `file: <binary>`
- **Response `200 OK`:**
  ```json
  {
    "status": "success",
    "data": {
      "tempFilePath": "uploads/temp_1729153000.csv",
      "detectedColumns": ["date", "sku", "quantity", "unit_price"],
      "sampleRows": [...],
      "suggestedMappings": {
        "date": "date",
        "sku": "sku",
        "quantity": "quantity",
        "unitPrice": "unit_price"
      }
    }
  }
  ```

### `POST /api/v1/datasets/validate`
Validates uploaded data against the column mappings via the ML microservice.
- **Request Body:**
  ```json
  {
    "tempFilePath": "uploads/temp_1729153000.csv",
    "mappings": {
      "date": "date",
      "sku": "sku",
      "quantity": "quantity"
    }
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "status": "success",
    "data": {
      "isValid": true,
      "qualityScore": 94.2,
      "detectedFrequency": "D",
      "totalRows": 600,
      "uniqueSkus": 5,
      "issues": []
    }
  }
  ```

### `POST /api/v1/datasets/confirm`
Finalizes ingestion, persists the dataset record and version, and automatically updates catalog products.

---

## Demand Forecasting (`/api/v1/forecasts`)

### `GET /api/v1/forecasts`
Returns all active SKU forecast runs for the tenant.

### `POST /api/v1/forecasts/generate`
Triggers demand forecasting for an SKU or across the catalog. Evaluates Naive, ARIMA/SARIMA, and XGBoost regressor, picking the candidate with the lowest validation sMAPE.
- **Request Body:**
  ```json
  {
    "sku": "SKU-101",
    "horizonDays": 30,
    "selectedModel": "auto"
  }
  ```

### `GET /api/v1/forecasts/comparison`
Returns model error benchmark comparisons (MAE, RMSE, sMAPE, latency) across candidate model families.

---

## Inventory Intelligence (`/api/v1/inventory`, `/api/v1/recommendations`)

### `GET /api/v1/inventory/overview`
Catalog inventory posture and calculation matrix:
- Lead time demand (DDLT = LeadTime × AvgDailyDemand)
- Safety Stock ($SS = Z \times \sigma_d \times \sqrt{L}$)
- Reorder Point ($ROP = DDLT + SS$)
- Inventory Position ($IP = OnHand + OnOrder - Backorders$)
- Target Inventory Level ($TIL = ROP + SS$)
- Recommended Order Quantity ($RecQty = \max(0, TIL - IP)$ if $IP \le ROP$)

### `GET /api/v1/recommendations`
Returns replenishment queue items filtered by priority (`High Priority`, `Medium Priority`, `Normal`).

### `PATCH /api/v1/recommendations/:id/status`
Updates officer review status (`Pending`, `Approved`, `Rejected`, `Ordered`).

---

## Executive Reports (`/api/v1/reports`)

### `GET /api/v1/reports`
Lists all generated reports for the tenant.

### `POST /api/v1/reports/generate`
Generates a new company report.

### `GET /api/v1/reports/:id/pdf`
Downloads a PDF document generated server-side using `pdfkit`. Authorized via JWT token.

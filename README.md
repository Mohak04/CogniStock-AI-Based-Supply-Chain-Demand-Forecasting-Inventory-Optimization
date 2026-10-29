# CogniStock — AI-Based Demand Forecasting & Inventory Optimization

**CogniStock** is a full-stack, enterprise-grade demand forecasting and inventory intelligence platform. It ingests historical sales records (CSV/XLSX), validates data quality, trains and benchmarks time-series forecasting models (Naive Baseline, ARIMA/SARIMA, and XGBoost Regressor), and produces deterministic replenishment proposals with human-in-the-loop governance.

---

## Architecture Overview

CogniStock is structured as a 3-tier distributed application:

1. **Frontend (`/`):** React 18, Vite, Tailwind CSS, Lucide Icons, Recharts (Port `5173`).
2. **Backend REST API (`/backend`):** Node.js, Express, MongoDB (Mongoose), PDFKit, Multer (Port `5000`).
3. **ML Microservice (`/ml-service`):** Python 3.11+, FastAPI, Uvicorn, Statsmodels, XGBoost, Pandas, Scikit-learn (Port `8000`).

---

## Key Features

- **Strict Multi-Company Tenancy:** Total data isolation across companies via server-verified JWT identities (`companyId`). No cross-tenant data leaks.
- **Three Evaluated Model Families:**
  - *Naive Baseline:* Benchmark for low-frequency or insufficient history.
  - *ARIMA / SARIMA:* Econometric modeling for linear trend and seasonal components (`statsmodels`).
  - *XGBoost Regressor:* Gradient boosted tree forecaster with leakage-safe lags ($t-1, t-2, t-3, t-7$) and shifted rolling statistics.
  - *No LSTM/RNN:* Strictly adheres to the project constraint.
- **Deterministic Inventory Intelligence:**
  - DDLT (Demand During Lead Time) $= L \times \bar{d}$
  - Safety Stock ($SS$) $= Z \times \sigma_d \times \sqrt{L}$ ($Z=1.65$ for 95% service level)
  - Reorder Point ($ROP$) $= \text{DDLT} + SS$
  - Inventory Position ($IP$) $= \text{OnHand} + \text{OnOrder} - \text{Backorders}$
  - Recommended Order Quantity ($RecQty$) $= \max(0, \lceil \text{TIL} - IP \rceil)$ if $IP \le ROP$
  - Missing parameters return `"Unavailable"` rather than fabricating zero values.
- **Real PDF Generation:** Server-side PDF export via `pdfkit` for executive stockout and audit reports.
- **5-Step Dataset Upload Wizard:** File upload $\rightarrow$ Column auto-mapping $\rightarrow$ ML schema validation $\rightarrow$ Ingestion $\rightarrow$ Auto-catalog sync.
- **Governance & Audit Trail:** Immutable system activity log capturing data ingestion, forecast runs, and officer order approvals.

---

## Quickstart Guide

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### 1. Database Seeding & Demo Setup
From `backend/`:
```bash
cd backend
npm.cmd install
node src/scripts/seed.js
```

This sets up two isolated demo companies:
- **Company 1:** Nova Retail Demo
  - Email: `manager@novaretail.demo` (or `admin@novaretail.demo`)
  - Password: `CogniStockDemo2026!`
- **Company 2:** Summit Supplies Demo
  - Email: `manager@summitsupplies.demo`
  - Password: `CogniStockDemo2026!`

### 2. Start the Python ML Microservice
From `ml-service/`:
```bash
cd ml-service
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Health Check:* `http://127.0.0.1:8000/health`

### 3. Start the Backend REST API
From `backend/`:
```bash
cd backend
npm.cmd run dev
```
*Runs on:* `http://localhost:5000/api/v1`

### 4. Start the Frontend Client
From root:
```bash
npm.cmd run dev
```
*App URL:* `http://localhost:5173`

---

## Automated Test Suites

### Backend Tests (Node.js)
```bash
cd backend
npm.cmd test
```
*Result:* 17 tests passed across auth, tenancy isolation, and inventory math.

### ML Microservice Tests (Python)
```bash
cd ml-service
python -m pytest -v
```
*Result:* 13 tests passed across FastAPI endpoints, inventory formulas, zero-demand safety, and XGBoost lag pipelines.

### Frontend Production Build
```bash
npm.cmd run build
```
*Result:* 2,397 modules bundled cleanly with zero errors.

---

## Documentation Links

- [API Specification](docs/API.md)
- [System Architecture & Math](docs/ARCHITECTURE.md)
- [Automated Testing Guide](docs/TESTING.md)

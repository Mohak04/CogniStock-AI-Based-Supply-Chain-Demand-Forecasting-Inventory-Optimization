# CogniStock — Architecture & System Design

CogniStock is an AI-based demand forecasting and inventory optimization platform architected as a clean three-tier distributed system with strict multi-company tenancy.

---

## 1. System Architecture

```
┌────────────────────────────────────────────────────────┐
│               Frontend: React 18 + Vite                │
│       Tailwind CSS · Lucide Icons · Recharts · Axios   │
│                 (Runs on port 5173)                    │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP + Bearer JWT
                            ▼
┌────────────────────────────────────────────────────────┐
│            Backend REST API: Node.js Express           │
│       Auth · Mongoose ODM · Tenancy · PDFKit · Multer  │
│                 (Runs on port 5000)                    │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
               ▼                           ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│         MongoDB          │  │     ML Microservice      │
│   Multi-Tenant Schemas   │  │   Python FastAPI / Uvicorn│
│   Indexed by companyId   │  │  ARIMA · XGBoost · Stats │
│   (Port 27017)           │  │   (Runs on port 8000)    │
└──────────────────────────┘  └──────────────────────────┘
```

---

## 2. Multi-Company Tenancy Model

1. **Company Isolation:** Every core collection (`User`, `Product`, `Dataset`, `DatasetVersion`, `ForecastRun`, `ForecastResult`, `ModelEvaluation`, `Recommendation`, `Report`, `ActivityLog`, `CompanySettings`) carries a required `companyId` foreign key.
2. **Server-Derived Identity:** In `backend/src/middleware/auth.js`, the JWT token is decrypted to extract `req.user` and `req.companyId`.
3. **No Client ID Injection:** Controllers never query with `req.body.companyId` or `req.query.companyId`. All database operations are scoped to `req.companyId`.
4. **Isolated Demo Companies:**
   - **Company 1:** `Nova Retail Demo` (`admin@novaretail.demo`, `manager@novaretail.demo`)
   - **Company 2:** `Summit Supplies Demo` (`manager@summitsupplies.demo`)
   - Cross-tenant queries are blocked and return 404/403.

---

## 3. Forecasting Engine (3 Model Families)

Per specification, CogniStock utilizes **exactly three model families** (no LSTM / RNN models):

1. **Naive Baseline:**
   - Benchmark model forecasting $y_{t+h} = y_t$ (or weekly seasonal lag).
   - Fast fallback baseline when historical observations are limited (< 14 periods).
2. **ARIMA / SARIMA (`statsmodels`):**
   - Econometric time-series model capturing linear trends and cyclical seasonality.
   - Evaluated on stationary or differenced demand series.
3. **XGBoost Regressor (`xgboost`):**
   - Gradient boosted decision tree forecaster.
   - Leakage-safe feature engineering:
     - Lags: $t-1, t-2, t-3, t-7$
     - Rolling statistics: 7-day rolling mean and standard deviation shifted by 1 to prevent data leakage.
     - Calendar features: day of week, day of month, month.
   - Recursive multi-step prediction for $7, 14, 30$ day horizons.

### Model Evaluation & Selection
- Data is split chronologically into training (80%) and holdout validation (20%) sets.
- Metrics evaluated: Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and symmetric Mean Absolute Percentage Error (sMAPE).
- sMAPE is computed with epsilon safety ($2 \times \frac{|y - \hat{y}|}{|y| + |\hat{y}| + 10^{-6}}$) to prevent division by zero during zero-demand periods.
- The model with the lowest validation sMAPE is automatically selected as the champion model.

---

## 4. Deterministic Inventory Intelligence Math

All replenishment recommendations and risk flags follow exact inventory formulas without black-box guessing:

1. **Lead Time Demand ($DDLT$):**
   $$\text{DDLT} = \text{LeadTimeDays} \times \text{AvgDailyDemand}$$
2. **Safety Stock ($SS$):**
   $$\text{SS} = Z \times \sigma_{\text{demand}} \times \sqrt{\text{LeadTimeDays}}$$
   Where $Z = 1.65$ for 95% service level, $1.96$ for 97.5%, and $2.33$ for 99%.
3. **Reorder Point ($ROP$):**
   $$\text{ROP} = \text{DDLT} + \text{SS}$$
4. **Inventory Position ($IP$):**
   $$\text{IP} = \text{OnHandStock} + \text{OnOrderStock} - \text{Backorders}$$
5. **Target Inventory Level ($TIL$):**
   $$\text{TIL} = \text{ROP} + \text{SS}$$
6. **Recommended Reorder Quantity ($RecQty$):**
   - If $\text{IP} \le \text{ROP}$: $\text{RecQty} = \max(0, \lceil \text{TIL} - \text{IP} \rceil)$
   - If $\text{IP} > \text{ROP}$: $\text{RecQty} = 0$
7. **Risk Classification:**
   - **Stockout Risk:** When $\text{IP} \le \text{SS}$ or $\text{IP} \le \text{ROP}$ with $\text{RecQty} > 0$.
   - **Overstock Risk:** When $\text{IP} > \text{TIL} \times 1.5$.
   - **Healthy Buffer:** All other states.

When required parameters (lead time or historical variance) are missing, calculations explicitly mark the metrics as `"Unavailable"` rather than fabricating zero values.

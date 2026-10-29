export const mockReports = [
  {
    id: "rep-001",
    title: "Product Demand & Inventory Intelligence Report — Demo",
    type: "Product Analysis Report",
    description: "Detailed analysis of SKU-104 (Declining Product D) demand drift, overstock risk, and calculation breakdown.",
    datasetVersion: "Nova Retail Demo v1.2",
    skuScope: "SKU-104",
    generatedAt: "2026-09-29 09:30 AM",
    generatedBy: "System (Prototype)",
    status: "Ready",
    fileFormat: "PDF Preview / Structured JSON",
    executiveSummary: "Prototype analysis reveals structural demand deceleration for SKU-104. On-hand inventory covers 160 days of forward demand, creating holding cost risk. Recommended action: freeze reorders and evaluate promo markdown."
  },
  {
    id: "rep-002",
    title: "Executive Inventory Risk Assessment — Prototype",
    type: "Company Inventory Report",
    description: "Enterprise-wide inventory posture across 128 SKUs, categorizing stockout risks, capital allocation, and replenishment priorities.",
    datasetVersion: "Nova Retail Demo v1.2",
    skuScope: "All Catalog SKUs (128)",
    generatedAt: "2026-09-28 05:00 PM",
    generatedBy: "Inventory Manager",
    status: "Ready",
    fileFormat: "PDF Preview / Structured JSON",
    executiveSummary: "14 SKUs present elevated stockout risks due to lead time variance. 8 SKUs show overstock accumulation. Total prototype capital tied up in excess inventory is estimated at $64,200."
  },
  {
    id: "rep-003",
    title: "ML Model Benchmark & Evaluation Summary",
    type: "Forecast Evaluation Report",
    description: "Comparative accuracy review of Naive, ARIMA/SARIMA, and XGBoost models across validation datasets.",
    datasetVersion: "Nova Retail Demo v1.2",
    skuScope: "Validation Subset (25 SKUs)",
    generatedAt: "2026-09-27 02:15 PM",
    generatedBy: "ML Team",
    status: "Ready",
    fileFormat: "PDF Preview / Structured JSON",
    executiveSummary: "XGBoost Regressor achieved lowest global sMAPE (3.6%) on 30-day forecast horizons, outperforming ARIMA by 1.5 percentage points. Recommended as primary engine for non-stationary categories."
  },
  {
    id: "rep-004",
    title: "Dataset Quality & Integrity Audit",
    type: "Data Quality Report",
    description: "Validation log report detailing missing fields, outlier counts, and schema mappings for Nova Retail Demo v1.2.",
    datasetVersion: "Nova Retail Demo v1.2",
    skuScope: "45,230 Records",
    generatedAt: "2026-09-25 11:00 AM",
    generatedBy: "Data Engineer",
    status: "Ready",
    fileFormat: "PDF Preview / Structured JSON",
    executiveSummary: "Data quality score passed at 94.2%. 238 record errors were flagged and excluded from ML feature engineering pipeline. All mandatory forecasting fields verified."
  }
];

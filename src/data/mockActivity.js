export const mockActivityTimeline = [
  {
    id: "act-001",
    timestamp: "2026-09-29 09:30 AM",
    user: "Inventory Manager (Demo)",
    action: "Report Generated",
    details: "Generated 'Product Demand & Inventory Intelligence Report' for SKU-104 (Declining Product D).",
    category: "Report",
    status: "Success",
    isPrototype: true
  },
  {
    id: "act-002",
    timestamp: "2026-09-29 08:00 AM",
    user: "CogniStock Engine (Prototype)",
    action: "Recommendation Generated",
    details: "Calculated replenishment order of 460 units for SKU-103 (Stockout Risk).",
    category: "Inventory",
    status: "Flagged for Review",
    isPrototype: true
  },
  {
    id: "act-003",
    timestamp: "2026-09-28 04:00 PM",
    user: "ML Pipelines (Prototype)",
    action: "Model Training Initiated",
    details: "Trained XGBoost Regressor (v2.1) on 'Nova Retail Historical Sales — Demo'. Validation sMAPE: 3.6%.",
    category: "ML Training",
    status: "Completed",
    isPrototype: true
  },
  {
    id: "act-004",
    timestamp: "2026-09-28 01:15 PM",
    user: "Supply Chain Analyst",
    action: "Recommendation Approved",
    details: "Manually approved draft order for SKU-102 (Standard Product B, 0 units required).",
    category: "Approval",
    status: "Approved",
    isPrototype: true
  },
  {
    id: "act-005",
    timestamp: "2026-09-25 10:30 AM",
    user: "Data Engineer",
    action: "Dataset Uploaded",
    details: "Imported file 'Nova Retail Historical Sales — Demo v1.2' (45,230 records, 128 SKUs).",
    category: "Data Ingestion",
    status: "Passed Validation",
    isPrototype: true
  },
  {
    id: "act-006",
    timestamp: "2026-09-25 10:32 AM",
    user: "Data Engineer",
    action: "Column Mapping Verified",
    details: "Mapped 'sale_date' → Date, 'product_code' → SKU, 'units_sold' → Quantity.",
    category: "Data Ingestion",
    status: "Verified",
    isPrototype: true
  }
];

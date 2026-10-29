export const mockDatasets = [
  {
    id: "ds-001",
    name: "Nova Retail Historical Sales — Demo",
    version: "v1.2",
    source: "Nova Retail ERP (Demo Export)",
    rows: 45230,
    skus: 128,
    dateRange: "2024-01-01 to 2026-08-31",
    frequency: "Daily",
    qualityStatus: "Passed Validation",
    qualityScore: 94.2,
    uploadedAt: "2026-09-15 10:30 AM",
    uploadedBy: "Inventory Manager (Demo User)",
    isDefault: true,
    fileType: "CSV",
    fileSize: "4.8 MB",
    description: "Primary prototype dataset representing multi-category retail demand patterns across 128 SKUs over 32 months.",
    requiredFieldsDetected: {
      date: true,
      sku: true,
      quantity: true
    },
    optionalFieldsDetected: {
      productName: true,
      category: true,
      unitPrice: true,
      leadTime: true,
      currentStock: true,
      unitCost: true,
      onOrder: false
    }
  },
  {
    id: "ds-002",
    name: "Sample FMCG Sales — Prototype",
    version: "v2.0",
    source: "FMCG Distribution Data (Sample)",
    rows: 72450,
    skus: 214,
    dateRange: "2024-06-01 to 2026-09-01",
    frequency: "Daily",
    qualityStatus: "Passed with Warnings",
    qualityScore: 88.5,
    uploadedAt: "2026-09-20 02:15 PM",
    uploadedBy: "Supply Chain Analyst",
    isDefault: false,
    fileType: "XLSX",
    fileSize: "8.2 MB",
    description: "Sample FMCG dataset with fast-moving goods demand, promotional flags, and warehouse inventory positions.",
    requiredFieldsDetected: {
      date: true,
      sku: true,
      quantity: true
    },
    optionalFieldsDetected: {
      productName: true,
      category: true,
      unitPrice: true,
      leadTime: false,
      currentStock: true,
      unitCost: true,
      onOrder: true
    }
  },
  {
    id: "ds-003",
    name: "Electronics Chain Demand — Sample",
    version: "v1.0",
    source: "POS System Export (Demo)",
    rows: 18900,
    skus: 45,
    dateRange: "2025-01-01 to 2026-08-15",
    frequency: "Daily",
    qualityStatus: "Needs Review",
    qualityScore: 76.4,
    uploadedAt: "2026-09-25 11:00 AM",
    uploadedBy: "Data Engineer",
    isDefault: false,
    fileType: "CSV",
    fileSize: "2.1 MB",
    description: "High-value electronics sales data with intermittent demand patterns and longer lead times.",
    requiredFieldsDetected: {
      date: true,
      sku: true,
      quantity: true
    },
    optionalFieldsDetected: {
      productName: true,
      category: true,
      unitPrice: true,
      leadTime: true,
      currentStock: false,
      unitCost: false,
      onOrder: false
    }
  }
];

export const mockSchemaMappings = {
  "ds-001": [
    { sourceColumn: "sale_date", mappedTo: "Date", status: "Mapped", isRequired: true },
    { sourceColumn: "product_code", mappedTo: "SKU / Product ID", status: "Mapped", isRequired: true },
    { sourceColumn: "units_sold", mappedTo: "Quantity Sold", status: "Mapped", isRequired: true },
    { sourceColumn: "item_name", mappedTo: "Product Name", status: "Mapped", isRequired: false },
    { sourceColumn: "category_desc", mappedTo: "Category", status: "Mapped", isRequired: false },
    { sourceColumn: "unit_price_usd", mappedTo: "Unit Price", status: "Mapped", isRequired: false },
    { sourceColumn: "supplier_lead_days", mappedTo: "Lead Time (Days)", status: "Mapped", isRequired: false },
    { sourceColumn: "on_hand_qty", mappedTo: "Current Stock", status: "Mapped", isRequired: false },
    { sourceColumn: "cost_price_usd", mappedTo: "Unit Cost", status: "Mapped", isRequired: false }
  ]
};

export const mockDataQualitySummary = {
  datasetId: "ds-001",
  datasetName: "Nova Retail Historical Sales — Demo",
  overallScore: 94.2,
  totalRecords: 45230,
  validRecords: 44102,
  warningCount: 890,
  errorCount: 238,
  missingValuesCount: 312,
  duplicatesCount: 45,
  outliersCount: 182,
  timeSeriesGapsCount: 14,
  fieldQuality: [
    { field: "Date (sale_date)", completionRate: 100.0, validRate: 99.8, status: "Excellent" },
    { field: "SKU (product_code)", completionRate: 100.0, validRate: 100.0, status: "Excellent" },
    { field: "Quantity (units_sold)", completionRate: 99.7, validRate: 99.2, status: "Good" },
    { field: "Unit Price", completionRate: 98.5, validRate: 97.9, status: "Good" },
    { field: "Lead Time", completionRate: 95.2, validRate: 95.0, status: "Acceptable" },
    { field: "Current Stock", completionRate: 96.8, validRate: 96.5, status: "Good" }
  ],
  validationIssues: [
    { id: 1, row: 1234, field: "units_sold", value: "-5", issue: "Negative sales quantity detected", severity: "Error", status: "Flagged" },
    { id: 2, row: 5321, field: "sale_date", value: "2025/13/45", issue: "Invalid date format string", severity: "Error", status: "Flagged" },
    { id: 3, row: 8902, field: "unit_price", value: "NULL", issue: "Missing unit price value", severity: "Warning", status: "Imputed" },
    { id: 4, row: 14320, field: "units_sold", value: "4,500", issue: "Extreme outlier detected (>4x std dev)", severity: "Warning", status: "Flagged" },
    { id: 5, row: 22109, field: "product_code", value: "SKU-104", issue: "Duplicate timestamp entry for SKU", severity: "Error", status: "Resolved" },
    { id: 6, row: 31045, field: "supplier_lead_days", value: "0", issue: "Zero lead time provided (used default 7d)", severity: "Warning", status: "Defaulted" }
  ]
};

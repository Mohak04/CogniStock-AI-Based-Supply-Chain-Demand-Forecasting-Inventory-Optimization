export const mockDashboardMetrics = {
  totalSkus: 128,
  historicalSalesVolume: "1.42M Units (Demo)",
  productsAtRiskCount: 14,
  forecastCoverage: "98.4% Catalog Coverage",
  pendingRecommendationsCount: 3,
  datasetsActive: 1,
  defaultDatasetName: "Nova Retail Historical Sales — Demo",
  
  riskDistribution: [
    { name: "Healthy / Optimal", value: 106, color: "#10b981" },
    { name: "Stockout Risk", value: 14, color: "#ef4444" },
    { name: "Overstock Risk", value: 8, color: "#f59e0b" }
  ],

  demandTrends: [
    { trend: "Increasing", count: 42, color: "#10b981" },
    { trend: "Stable", count: 64, color: "#3b82f6" },
    { trend: "Decreasing", count: 14, color: "#ef4444" },
    { trend: "Volatile / Seasonal", count: 8, color: "#f59e0b" }
  ],

  prototypeInsights: [
    {
      id: "ins-1",
      sku: "SKU-104",
      title: "Overstock Holding Alert",
      text: "SKU-104 (Declining Product D) exhibits decreasing historical demand trend in prototype dataset. Current stock of 1,420 units far exceeds 30-day forecast demand of 260 units.",
      type: "warning",
      category: "Inventory Risk"
    },
    {
      id: "ins-2",
      sku: "SKU-103",
      title: "Upcoming Seasonal Surge",
      text: "SKU-103 (Seasonal Product C) is entering a peak seasonal window. XGBoost forecast projects a 680 unit demand vs current stock position of 440 units.",
      type: "danger",
      category: "Stockout Risk"
    },
    {
      id: "ins-3",
      sku: "SKU-101",
      title: "Positive Trend Velocity",
      text: "SKU-101 (Premium Product A) shows steady 12% MoM demand growth. Reorder point parameters are aligned with 14-day supplier lead time.",
      type: "info",
      category: "Demand Trend"
    }
  ]
};

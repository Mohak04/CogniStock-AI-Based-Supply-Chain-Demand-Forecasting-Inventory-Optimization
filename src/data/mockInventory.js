export const mockInventorySummary = {
  totalSkus: 128,
  stockoutRiskCount: 14,
  overstockRiskCount: 8,
  healthyCount: 106,
  replenishmentCandidates: 19,
  totalStockValueDemo: "$482,950 (Demo Valuation)",
  averageLeadTimeDays: 11.4
};

export const mockInventoryCalculations = {
  formulas: {
    demandDuringLeadTime: "Average Daily Demand × Lead Time (Days)",
    safetyStock: "Z-score (1.65 for 95% service level) × Lead Time Std Dev × Demand Std Dev",
    reorderPoint: "Demand During Lead Time + Safety Stock",
    inventoryPosition: "Current On-Hand Stock + On-Order Pipeline Stock - Backorders",
    targetInventoryLevel: "Reorder Point + Economic Order Quantity (EOQ buffer)",
    recommendedQuantity: "Max(0, Target Inventory Level - Inventory Position)"
  }
};

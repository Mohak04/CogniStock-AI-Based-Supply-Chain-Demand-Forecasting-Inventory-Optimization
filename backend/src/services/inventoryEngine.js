function calculateInventoryMetrics({
  demandHistory = [],
  leadTimeDays = 14,
  currentStock = null,
  onOrder = 0,
  backorders = 0,
  serviceLevelZ = 1.65,
  reviewPeriodDays = 7,
  unitCost = null
}) {
  const missingFields = [];
  if (currentStock === null || currentStock === undefined) {
    missingFields.push('Current Stock');
  }
  if (leadTimeDays === null || leadTimeDays === undefined) {
    missingFields.push('Lead Time');
  }

  if (missingFields.length > 0 || !demandHistory || demandHistory.length === 0) {
    return {
      status: 'Unavailable',
      message: `Inventory analysis unavailable. Missing required fields: ${missingFields.join(', ')}`,
      missingFields,
      averageDailyDemand: null,
      leadTimeDays,
      demandStdDev: null,
      demandDuringLeadTime: null,
      safetyStock: null,
      reorderPoint: null,
      inventoryPosition: null,
      targetInventoryLevel: null,
      recommendedQty: 0,
      riskLevel: 'Unavailable',
      riskReason: `Missing required inputs: ${missingFields.join(', ')}`,
      inventoryValue: null,
      recommendedOrderValue: null
    };
  }

  const currStockVal = Number(currentStock);
  const onOrderVal = Number(onOrder) || 0;
  const backordersVal = Number(backorders) || 0;
  const leadTimeVal = Math.max(1, Number(leadTimeDays));
  const zScore = Number(serviceLevelZ) || 1.65;
  const reviewPeriod = Number(reviewPeriodDays) || 7;

  // Demand statistics
  const sum = demandHistory.reduce((acc, v) => acc + Number(v), 0);
  const avgDemand = sum / demandHistory.length;

  let variance = 0;
  if (demandHistory.length > 1) {
    variance = demandHistory.reduce((acc, v) => acc + Math.pow(Number(v) - avgDemand, 2), 0) / (demandHistory.length - 1);
  }
  const stdDemand = Math.sqrt(variance);

  // 1. Demand During Lead Time
  const ddlt = avgDemand * leadTimeVal;

  // 2. Safety Stock = Z * sigma_d * sqrt(L)
  const safetyStock = Math.ceil(zScore * stdDemand * Math.sqrt(leadTimeVal));

  // 3. Reorder Point = DDLT + SS
  const reorderPoint = Math.ceil(ddlt + safetyStock);

  // 4. Net Inventory Position = OnHand + OnOrder - Backorders
  const inventoryPosition = Math.round(currStockVal + onOrderVal - backordersVal);

  // 5. Target Inventory Level = ROP + expected review period demand
  const expectedReviewDemand = avgDemand * reviewPeriod;
  const targetInventoryLevel = Math.ceil(reorderPoint + expectedReviewDemand);

  // 6. Recommended Order Quantity = max(0, ceil(TIL - IP))
  const rawRecQty = targetInventoryLevel - inventoryPosition;
  const recommendedQty = Math.max(0, Math.ceil(rawRecQty));

  // Risk Classification
  let riskLevel = 'Low Risk';
  let riskReason = `Stock posture is balanced. Inventory position (${inventoryPosition}) is maintained above Reorder Point (${reorderPoint}).`;

  if (currStockVal < (0.5 * safetyStock) || inventoryPosition < (0.75 * reorderPoint)) {
    riskLevel = 'High Risk';
    riskReason = `Critical stockout risk: inventory position (${inventoryPosition}) is far below Reorder Point (${reorderPoint}). Immediate replenishment required.`;
  } else if (inventoryPosition < reorderPoint) {
    riskLevel = 'Medium Risk';
    riskReason = `Reorder Point breached: inventory position (${inventoryPosition}) is below threshold (${reorderPoint}).`;
  } else if (targetInventoryLevel > 0 && inventoryPosition > (targetInventoryLevel * 1.5)) {
    riskLevel = 'Overstock';
    riskReason = `Excess stock holding: inventory position (${inventoryPosition}) exceeds 150% of Target Inventory Level (${targetInventoryLevel}).`;
  }

  const inventoryValue = unitCost !== null && unitCost !== undefined ? Number((currStockVal * Number(unitCost)).toFixed(2)) : null;
  const recommendedOrderValue = unitCost !== null && unitCost !== undefined ? Number((recommendedQty * Number(unitCost)).toFixed(2)) : null;

  return {
    status: 'Calculated',
    message: 'Inventory calculations completed deterministically.',
    missingFields: [],
    averageDailyDemand: Number(avgDemand.toFixed(2)),
    leadTimeDays: leadTimeVal,
    demandStdDev: Number(stdDemand.toFixed(2)),
    demandDuringLeadTime: Number(ddlt.toFixed(1)),
    safetyStock,
    reorderPoint,
    inventoryPosition,
    targetInventoryLevel,
    recommendedQty,
    riskLevel,
    riskReason,
    inventoryValue,
    recommendedOrderValue,
    reviewPeriodDays: reviewPeriod,
    serviceLevelZ: zScore
  };
}

module.exports = { calculateInventoryMetrics };

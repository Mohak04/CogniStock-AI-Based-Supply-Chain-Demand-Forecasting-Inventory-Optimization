import math
import numpy as np
from typing import Dict, Any, Optional, List

def calculate_inventory_metrics(
    demand_history: List[float],
    lead_time_days: Optional[float],
    current_stock: Optional[float],
    on_order: Optional[float] = 0.0,
    backorders: Optional[float] = 0.0,
    service_level_z: float = 1.65,
    review_period_days: float = 7.0,
    unit_cost: Optional[float] = None
) -> Dict[str, Any]:
    """
    Computes deterministic inventory intelligence metrics:
    - Average Demand per period
    - Demand During Lead Time (DDLT)
    - Safety Stock (SS)
    - Reorder Point (ROP)
    - Net Inventory Position (IP)
    - Target Inventory Level (TIL)
    - Recommended Order Quantity (RecQty)
    - Stockout / Overstock risk classification
    """
    missing_fields = []
    if current_stock is None:
        missing_fields.append("Current Stock")
    if lead_time_days is None:
        missing_fields.append("Lead Time")

    if missing_fields or not demand_history:
        return {
            "status": "Unavailable",
            "message": f"Inventory analysis unavailable. Missing required fields: {', '.join(missing_fields) if missing_fields else 'Demand History'}",
            "missingFields": missing_fields,
            "averageDailyDemand": None,
            "leadTimeDays": lead_time_days,
            "demandStdDev": None,
            "demandDuringLeadTime": None,
            "safetyStock": None,
            "reorderPoint": None,
            "inventoryPosition": None,
            "targetInventoryLevel": None,
            "recommendedQty": 0,
            "riskLevel": "Unavailable",
            "riskReason": f"Missing inputs: {', '.join(missing_fields)}",
            "inventoryValue": None,
            "recommendedOrderValue": None,
            "reviewPeriodDays": review_period_days,
            "serviceLevelZ": service_level_z
        }

    on_order_val = float(on_order) if on_order is not None else 0.0
    backorders_val = float(backorders) if backorders is not None else 0.0
    curr_stock_val = float(current_stock)
    lead_time_val = max(1.0, float(lead_time_days))

    demand_arr = np.asarray(demand_history, dtype=float)
    avg_demand = float(np.mean(demand_arr)) if len(demand_arr) > 0 else 0.0
    std_demand = float(np.std(demand_arr, ddof=1)) if len(demand_arr) > 1 else 0.0

    # 1. Demand During Lead Time (DDLT) = avg_demand * L
    ddlt = avg_demand * lead_time_val

    # 2. Safety Stock (SS) = Z * sigma_d * sqrt(L)
    safety_stock = service_level_z * std_demand * math.sqrt(lead_time_val)

    # 3. Reorder Point (ROP) = DDLT + SS
    rop = ddlt + safety_stock

    # 4. Net Inventory Position (IP) = Current Stock + On Order - Backorders
    inventory_position = curr_stock_val + on_order_val - backorders_val

    # 5. Target Inventory Level (TIL) = ROP + expected demand over review period
    expected_review_demand = avg_demand * float(review_period_days)
    til = rop + expected_review_demand

    # 6. Recommended Order Quantity = max(0, ceil(TIL - IP))
    raw_rec_qty = til - inventory_position
    recommended_qty = int(math.ceil(max(0.0, raw_rec_qty)))

    # Deterministic Risk Thresholds
    if curr_stock_val < (0.5 * safety_stock) or inventory_position < (0.75 * rop):
        risk_level = "High Risk"
        risk_reason = f"Net inventory position ({inventory_position:.0f}) is critically below Reorder Point ({rop:.0f}). Imminent stockout risk."
    elif inventory_position < rop:
        risk_level = "Medium Risk"
        risk_reason = f"Inventory position ({inventory_position:.0f}) has breached Reorder Point ({rop:.0f}). Reorder recommended."
    elif inventory_position > (til * 1.5) and til > 0:
        risk_level = "Overstock"
        risk_reason = f"Inventory position ({inventory_position:.0f}) exceeds 150% of Target Inventory Level ({til:.0f}). Excess holding capital."
    else:
        risk_level = "Low Risk"
        risk_reason = f"Stock posture is balanced. Inventory position ({inventory_position:.0f}) is maintained above Reorder Point ({rop:.0f})."

    # Monetary valuations if unit_cost is provided
    inv_value = round(curr_stock_val * unit_cost, 2) if unit_cost is not None else None
    rec_order_value = round(recommended_qty * unit_cost, 2) if unit_cost is not None else None

    return {
        "status": "Calculated",
        "message": "Deterministic inventory optimization calculated successfully.",
        "missingFields": [],
        "averageDailyDemand": round(avg_demand, 2),
        "leadTimeDays": round(lead_time_val, 1),
        "demandStdDev": round(std_demand, 2),
        "demandDuringLeadTime": round(ddlt, 1),
        "safetyStock": int(math.ceil(safety_stock)),
        "reorderPoint": int(math.ceil(rop)),
        "inventoryPosition": int(round(inventory_position)),
        "targetInventoryLevel": int(math.ceil(til)),
        "recommendedQty": recommended_qty,
        "riskLevel": risk_level,
        "riskReason": risk_reason,
        "inventoryValue": inv_value,
        "recommendedOrderValue": rec_order_value,
        "reviewPeriodDays": review_period_days,
        "serviceLevelZ": service_level_z
    }

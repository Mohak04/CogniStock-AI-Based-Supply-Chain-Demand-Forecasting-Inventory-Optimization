import pytest
from app.inventory.calculations import calculate_inventory_metrics

def test_inventory_metrics_deterministic_calculation():
    # 20 days with avg demand = 10, std dev = 2
    demand_history = [10.0] * 20
    demand_history[0] = 8.0
    demand_history[1] = 12.0

    res = calculate_inventory_metrics(
        demand_history=demand_history,
        lead_time_days=14,
        current_stock=100,
        on_order=20,
        backorders=0,
        service_level_z=1.65,
        review_period_days=7,
        unit_cost=15.0
    )

    assert res["status"] == "Calculated"
    assert res["leadTimeDays"] == 14
    assert res["demandDuringLeadTime"] == pytest.approx(140.0, rel=0.1)
    assert res["safetyStock"] > 0
    assert res["reorderPoint"] > res["demandDuringLeadTime"]
    assert res["inventoryPosition"] == 120  # 100 + 20 - 0
    assert res["recommendedQty"] >= 0
    assert res["inventoryValue"] == 1500.0  # 100 * 15

def test_inventory_metrics_missing_inputs_never_substitutes_zero():
    # Current stock is missing
    res = calculate_inventory_metrics(
        demand_history=[10, 15, 20],
        lead_time_days=14,
        current_stock=None
    )
    assert res["status"] == "Unavailable"
    assert "Current Stock" in res["missingFields"]
    assert res["riskLevel"] == "Unavailable"

    # Lead time is missing
    res2 = calculate_inventory_metrics(
        demand_history=[10, 15, 20],
        lead_time_days=None,
        current_stock=50
    )
    assert res2["status"] == "Unavailable"
    assert "Lead Time" in res2["missingFields"]

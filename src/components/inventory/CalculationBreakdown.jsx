import React from 'react';
import { Calculator, Info, ArrowDown, HelpCircle, CheckCircle2 } from 'lucide-react';

export const CalculationBreakdown = ({ product }) => {
  if (!product) return null;

  const leadTimeDays = product.leadTimeDays || 14;
  const avgDailyDemand = product.averageDailyDemand || 15;
  const leadTimeDemand = Math.round(leadTimeDays * avgDailyDemand);
  const safetyStock = product.safetyStock || 180;
  const reorderPoint = product.reorderPoint || (leadTimeDemand + safetyStock);
  const currentStock = product.currentStock || 0;
  const onOrder = product.onOrder || 0;
  const inventoryPosition = product.inventoryPosition || (currentStock + onOrder);
  const targetInventory = product.targetInventory || 750;
  const recommendedQty = product.recommendedQty || Math.max(0, targetInventory - inventoryPosition);

  return (
    <div className="card-panel p-6 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-bold text-slate-100">Transparent Calculation Breakdown</h3>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-purple-950/80 text-purple-400 border border-purple-500/30">
          Prototype Inventory Scenario Engine
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        CogniStock derives inventory replenishment recommendations deterministically by integrating daily forecast demand, lead time variance, safety buffers, and pipeline stock positions.
      </p>

      {/* Step 1: Lead Time Demand */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-300">Step 1: Demand During Lead Time (DDLT)</span>
          <span className="font-mono text-purple-400">{leadTimeDemand} units</span>
        </div>
        <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 flex items-center justify-between">
          <span>DDLT = Average Daily Demand ({avgDailyDemand}) × Lead Time ({leadTimeDays} days)</span>
          <span className="text-purple-300 font-bold">= {leadTimeDemand}</span>
        </div>
      </div>

      {/* Step 2: Safety Stock & Reorder Point */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-300">Step 2: Reorder Point (ROP)</span>
          <span className="font-mono text-purple-400">{reorderPoint} units</span>
        </div>
        <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 flex items-center justify-between">
          <span>ROP = Demand During Lead Time ({leadTimeDemand}) + Safety Stock ({safetyStock})</span>
          <span className="text-purple-300 font-bold">= {reorderPoint}</span>
        </div>
      </div>

      {/* Step 3: Current Inventory Position */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-300">Step 3: Net Inventory Position</span>
          <span className="font-mono text-purple-400">{inventoryPosition} units</span>
        </div>
        <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 flex items-center justify-between">
          <span>Position = On-Hand Stock ({currentStock}) + On-Order Pipeline ({onOrder})</span>
          <span className="text-purple-300 font-bold">= {inventoryPosition}</span>
        </div>
      </div>

      {/* Step 4: Final Recommendation Derivation */}
      <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-purple-200">Final Step: Recommended Order Quantity</span>
          <span className="font-mono text-emerald-400 text-sm">{recommendedQty} units</span>
        </div>
        <div className="p-3 rounded bg-slate-900 border border-purple-800/50 font-mono text-[11px] text-slate-200 space-y-1">
          <div className="flex items-center justify-between">
            <span>Formula: Max(0, Target Inventory ({targetInventory}) - Inventory Position ({inventoryPosition}))</span>
            <span className="font-bold text-emerald-400">= {recommendedQty} units</span>
          </div>
          <p className="text-[10px] text-slate-400 font-sans mt-1">
            {inventoryPosition < reorderPoint
              ? `Status: Inventory Position (${inventoryPosition}) is BELOW Reorder Point (${reorderPoint}). Order triggered.`
              : `Status: Inventory Position (${inventoryPosition}) is ABOVE Reorder Point (${reorderPoint}). No immediate order needed.`}
          </p>
        </div>
      </div>
    </div>
  );
};

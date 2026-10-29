import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { RiskBadge } from '../common/RiskBadge';
import { Check, X, Eye, PackageCheck } from 'lucide-react';

export const RecommendationCard = ({ recommendation, onStatusChange, onViewDetails }) => {
  return (
    <div className="card-panel p-5 space-y-4 border-slate-800 hover:border-slate-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-400">{recommendation.sku}</span>
            <h4 className="text-sm font-bold text-slate-100">{recommendation.productName}</h4>
          </div>
          <span className="text-xs text-slate-400">{recommendation.category}</span>
        </div>
        <div className="flex items-center gap-2">
          <RiskBadge risk={recommendation.riskLevel} />
          <StatusBadge status={recommendation.status} size="sm" />
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">{recommendation.reason}</p>

      {/* Numerical breakdown row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Current Stock</span>
          <span className="font-bold text-slate-200">{recommendation.currentStock}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Forecast 30d</span>
          <span className="font-bold text-amber-400">{recommendation.forecastDemand30d}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Reorder Point</span>
          <span className="font-bold text-purple-400">{recommendation.reorderPoint}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Recommended Qty</span>
          <span className="font-bold text-emerald-400 text-sm">{recommendation.recommendedQty}</span>
        </div>
      </div>

      {/* Human Decision Control Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
        <button
          onClick={() => onViewDetails && onViewDetails(recommendation)}
          className="text-slate-400 hover:text-slate-200 font-medium inline-flex items-center gap-1 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> Calculation Details
        </button>

        <div className="flex items-center gap-2">
          {recommendation.status !== 'Approved' && (
            <button
              onClick={() => onStatusChange && onStatusChange(recommendation.id, 'Approved')}
              className="px-2.5 py-1 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 text-[11px] font-semibold hover:bg-emerald-800/60 inline-flex items-center gap-1 transition-colors"
            >
              <Check className="w-3 h-3" /> Approve Draft
            </button>
          )}

          {recommendation.status !== 'Rejected' && (
            <button
              onClick={() => onStatusChange && onStatusChange(recommendation.id, 'Rejected')}
              className="px-2.5 py-1 rounded bg-red-900/40 text-red-300 border border-red-700/50 text-[11px] font-semibold hover:bg-red-800/60 inline-flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" /> Reject
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

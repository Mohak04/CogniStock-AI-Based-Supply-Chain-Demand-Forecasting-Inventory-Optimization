import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, FileCheck2, Database } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const DataQualitySummary = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="space-y-6">
      {/* Top summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-panel p-4">
          <div className="text-xs font-medium text-slate-400">Quality Score</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{summary.overallScore ?? summary.qualityScore ?? 90}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Validation Integrity Score</div>
        </div>
        <div className="card-panel p-4">
          <div className="text-xs font-medium text-slate-400">Total Records</div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{(summary.totalRecords ?? summary.rowCount ?? 0).toLocaleString()}</div>
          <div className="text-[11px] text-emerald-400 mt-1">{(summary.validRecords ?? summary.totalRecords ?? summary.rowCount ?? 0).toLocaleString()} Valid</div>
        </div>
        <div className="card-panel p-4">
          <div className="text-xs font-medium text-slate-400">Missing / Errors</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{summary.missingValuesCount ?? summary.errorsCount ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Flagged for Review</div>
        </div>
        <div className="card-panel p-4">
          <div className="text-xs font-medium text-slate-400">Outliers / Warnings</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">{(summary.outliersCount ?? summary.warningsCount ?? 0) + (summary.timeSeriesGapsCount || 0)}</div>
          <div className="text-[11px] text-slate-500 mt-1">{summary.timeSeriesGapsCount || 0} Time-series gaps</div>
        </div>
      </div>

      {/* Field completion breakdown */}
      <div className="card-panel p-5">
        <h4 className="text-sm font-bold text-slate-100 mb-4 pb-2 border-b border-slate-800">
          Field Completion & Integrity Breakdown
        </h4>
        <div className="space-y-3">
          {summary.fieldQuality?.map((item) => (
            <div key={item.field} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">{item.field}</span>
                <span className="font-mono text-slate-400">{item.validRate}% Valid</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full ${
                    item.validRate >= 98
                      ? 'bg-emerald-500'
                      : item.validRate >= 95
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${item.validRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

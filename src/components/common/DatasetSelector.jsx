import React from 'react';
import { Database, Calendar, Layers } from 'lucide-react';

export const DatasetSelector = ({
  datasets = [],
  selectedDatasetId,
  onSelectDataset,
  disabled = false
}) => {
  if (!datasets || datasets.length === 0) {
    return (
      <div className="card-panel p-3 flex items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Database className="w-4 h-4 text-slate-500" />
          <span>No ingested datasets found for this tenant company.</span>
        </div>
      </div>
    );
  }

  const currentDataset = datasets.find(
    (d) => d.id === selectedDatasetId || d._id === selectedDatasetId
  ) || datasets[0];

  return (
    <div className="card-panel p-3 flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 text-xs shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-950/80 border border-blue-500/30 text-blue-400">
            <Database className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-300">Active Dataset Scope:</span>
        </div>

        <select
          value={selectedDatasetId || currentDataset?.id || currentDataset?._id || ''}
          onChange={(e) => onSelectDataset(e.target.value)}
          disabled={disabled}
          className="bg-slate-950 border border-slate-700/80 hover:border-slate-600 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-medium outline-none transition-colors cursor-pointer"
        >
          {datasets.map((d) => {
            const did = d.id || d._id;
            return (
              <option key={did} value={did} className="bg-slate-950 text-slate-200">
                {d.name} ({d.version || 'v1.0'})
              </option>
            );
          })}
        </select>
      </div>

      {currentDataset && (
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/80 flex items-center gap-1">
            <Layers className="w-3 h-3 text-purple-400" /> Version: {currentDataset.version || 'v1.0'}
          </span>
          {currentDataset.createdAt && (
            <span className="hidden sm:flex items-center gap-1 text-slate-500">
              <Calendar className="w-3 h-3 text-slate-500" /> Imported: {new Date(currentDataset.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Cpu, CheckCircle2, Play, Sliders } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const ModelCard = ({ model, onTrainClick, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`card-panel p-5 space-y-4 cursor-pointer transition-all ${
        isSelected ? 'border-blue-500 bg-slate-900 ring-1 ring-blue-500/50' : 'hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <h4 className="text-base font-bold text-slate-100">{model.name}</h4>
          </div>
          <span className="text-xs text-slate-400">{model.category}</span>
        </div>
        <StatusBadge status={model.status} size="sm" />
      </div>

      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{model.description}</p>

      {/* Demo Metrics */}
      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center font-mono">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Validation sMAPE</span>
          <span className="text-sm font-bold text-amber-400">{model.smapeDemo}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">MAE (Demo)</span>
          <span className="text-sm font-bold text-slate-200">{model.maeDemo}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Train Time</span>
          <span className="text-sm font-bold text-blue-400">{model.trainingTime}</span>
        </div>
      </div>

      {/* Hyperparameters snippet */}
      {model.hyperparameters && (
        <div className="text-[11px] font-mono text-slate-400 space-y-1 border-t border-slate-800/80 pt-2">
          <div className="flex items-center gap-1 text-slate-500 text-[10px] uppercase tracking-wider font-semibold">
            <Sliders className="w-3 h-3" /> Hyperparameters (Prototype Spec)
          </div>
          <div className="truncate">
            {Object.entries(model.hyperparameters)
              .map(([k, v]) => `${k}: ${v}`)
              .join(' · ')}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-1 text-xs">
        <span className="text-slate-500 font-mono text-[11px]">Version {model.version}</span>
        {onTrainClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTrainClick(model);
            }}
            className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center gap-1 transition-colors"
          >
            <Play className="w-3 h-3 fill-current" /> Retrain Model
          </button>
        )}
      </div>
    </div>
  );
};

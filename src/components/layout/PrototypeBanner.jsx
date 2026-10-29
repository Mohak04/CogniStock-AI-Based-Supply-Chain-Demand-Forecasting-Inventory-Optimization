import React, { useState } from 'react';
import { Info, X, ShieldCheck } from 'lucide-react';

export const PrototypeBanner = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-blue-950/90 border-b border-blue-500/30 text-blue-200 px-4 py-2 text-xs flex items-center justify-between gap-4 font-sans no-print">
      <div className="flex items-center gap-2.5 max-w-4xl">
        <span className="p-1 rounded bg-blue-900/80 border border-blue-500/40 text-blue-300 font-mono text-[10px] font-bold uppercase tracking-wider shrink-0">
          Review 1 Prototype
        </span>
        <p className="leading-tight">
          <strong className="text-white font-semibold">Prototype Mode · Demo Data:</strong> All metrics, historical sales, ML models, and inventory calculations are displayed using simulated sample datasets. Backend, ML pipeline, and MongoDB services will be connected in later implementation phases.
        </p>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="text-blue-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-blue-900/50 shrink-0"
        title="Dismiss Banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

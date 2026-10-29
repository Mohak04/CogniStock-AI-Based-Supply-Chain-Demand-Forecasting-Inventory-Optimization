import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

export const RiskBadge = ({ risk }) => {
  const r = String(risk || '').toLowerCase();

  if (r.includes('stockout') || r.includes('high')) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-red-950/80 text-red-400 border border-red-500/40 animate-pulse">
        <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
        Stockout Risk
      </span>
    );
  }

  if (r.includes('overstock') || r.includes('medium')) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-950/80 text-amber-400 border border-amber-500/40">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        Overstock Risk
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
      Healthy
    </span>
  );
};

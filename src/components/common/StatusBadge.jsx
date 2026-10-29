import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, HelpCircle } from 'lucide-react';

export const StatusBadge = ({ status, size = "normal" }) => {
  const s = String(status || '').toLowerCase();
  
  let colorClass = "bg-slate-800 text-slate-300 border-slate-700";
  let Icon = Info;

  if (s.includes('passed') || s.includes('active') || s.includes('healthy') || s.includes('ready') || s.includes('approved') || s.includes('success')) {
    colorClass = "bg-emerald-950/70 text-emerald-400 border-emerald-500/30";
    Icon = CheckCircle2;
  } else if (s.includes('warning') || s.includes('review') || s.includes('overstock') || s.includes('flagged') || s.includes('medium')) {
    colorClass = "bg-amber-950/70 text-amber-400 border-amber-500/30";
    Icon = AlertTriangle;
  } else if (s.includes('error') || s.includes('stockout') || s.includes('danger') || s.includes('high') || s.includes('critical') || s.includes('rejected')) {
    colorClass = "bg-red-950/70 text-red-400 border-red-500/30";
    Icon = AlertCircle;
  } else if (s.includes('trained') || s.includes('info') || s.includes('mapped')) {
    colorClass = "bg-blue-950/70 text-blue-400 border-blue-500/30";
    Icon = Info;
  }

  const pxClass = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium border rounded-md ${colorClass} ${pxClass}`}>
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span>{status}</span>
    </span>
  );
};

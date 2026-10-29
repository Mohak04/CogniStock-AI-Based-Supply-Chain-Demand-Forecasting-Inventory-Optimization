import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

export const MetricCard = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon: Icon,
  badgeText = "Prototype Data",
  accentColor = "blue",
  onClick
}) => {
  const isClickable = typeof onClick === 'function';

  return (
    <div
      onClick={onClick}
      className={`card-panel p-5 relative overflow-hidden group ${
        isClickable ? 'cursor-pointer hover:border-blue-500/50 hover:bg-slate-900/90' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
            {badgeText && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/80">
                {badgeText}
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-slate-100 tracking-tight">{value}</div>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 group-hover:scale-105 transition-transform`}>
            <Icon className="w-5 h-5 text-blue-400" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
          {trend && (
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                trend === 'up'
                  ? 'text-emerald-400'
                  : trend === 'down'
                  ? 'text-red-400'
                  : 'text-slate-400'
              }`}
            >
              {trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
              {trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
              {trend === 'neutral' && <Minus className="w-3.5 h-3.5" />}
              {trendValue}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

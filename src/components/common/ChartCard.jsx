import React from 'react';
import { Info, Download } from 'lucide-react';

export const ChartCard = ({
  title,
  subtitle,
  children,
  actionControls,
  badgeText = "Prototype Model View",
  className = ""
}) => {
  return (
    <div className={`card-panel p-5 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-100">{title}</h3>
            {badgeText && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        {actionControls && <div className="flex items-center gap-2 shrink-0">{actionControls}</div>}
      </div>

      <div className="w-full relative">{children}</div>
    </div>
  );
};

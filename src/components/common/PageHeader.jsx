import React from 'react';
import { Breadcrumb } from './Breadcrumb';
import { ShieldCheck } from 'lucide-react';

export const PageHeader = ({ title, subtitle, breadcrumbItems, actions, isDemo = true }) => {
  return (
    <div className="mb-6 space-y-2">
      {breadcrumbItems && <Breadcrumb items={breadcrumbItems} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">{title}</h1>
            {isDemo && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-500/30">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                Prototype View
              </span>
            )}
          </div>
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>

        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
};

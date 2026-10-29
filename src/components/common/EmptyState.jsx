import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({
  title = "No Data Available",
  description = "There is no information to display for the current selection.",
  icon: Icon = PackageOpen,
  actionButton
}) => {
  return (
    <div className="card-panel p-12 text-center flex flex-col items-center justify-center">
      <div className="p-4 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 mb-4">
        <Icon className="w-8 h-8 text-blue-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-200 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
};

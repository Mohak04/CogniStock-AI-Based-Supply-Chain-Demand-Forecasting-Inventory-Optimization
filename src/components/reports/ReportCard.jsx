import React from 'react';
import { FileText, Eye, Download, Sparkles } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const ReportCard = ({ report, onPreview, onDownload }) => {
  return (
    <div className="card-panel p-5 space-y-4 flex flex-col justify-between hover:border-slate-700">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <StatusBadge status={report.status} size="sm" />
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">{report.type}</span>
          <h4 className="text-base font-bold text-slate-100 mt-0.5">{report.title}</h4>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">{report.description}</p>
      </div>

      <div className="space-y-3 pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Version: {report.datasetVersion}</span>
          <span>{report.generatedAt}</span>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onPreview && onPreview(report)}
            className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
          >
            <Eye className="w-3.5 h-3.5" /> Preview Report
          </button>
          <button
            onClick={() => onDownload && onDownload(report)}
            className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>
      </div>
    </div>
  );
};

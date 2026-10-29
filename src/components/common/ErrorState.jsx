import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorState = ({
  title = "Service Error",
  message = "Failed to load prototype resources.",
  onRetry
}) => {
  return (
    <div className="card-panel p-8 text-center flex flex-col items-center justify-center border-red-500/30 bg-red-950/20">
      <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
      <h4 className="text-base font-bold text-red-200 mb-1">{title}</h4>
      <p className="text-xs text-red-300/80 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 rounded-lg bg-red-900/40 text-red-200 border border-red-700/50 text-xs font-semibold hover:bg-red-900/60 inline-flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Request
        </button>
      )}
    </div>
  );
};

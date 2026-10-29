import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = "Loading prototype data..." }) => {
  return (
    <div className="card-panel p-12 text-center flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
      <span className="text-xs font-mono text-slate-400 animate-pulse">{message}</span>
    </div>
  );
};

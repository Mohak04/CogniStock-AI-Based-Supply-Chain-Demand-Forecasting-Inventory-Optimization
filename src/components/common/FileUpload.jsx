import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export const FileUpload = ({ onFileSelected, acceptedFormats = ".csv, .xlsx" }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file) => {
    setSelectedFile(file);
    if (onFileSelected) {
      onFileSelected(file);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-950/20'
            : selectedFile
            ? 'border-emerald-500/50 bg-emerald-950/10'
            : 'border-slate-700 bg-slate-950/40 hover:border-slate-600'
        }`}
      >
        <input
          type="file"
          accept={acceptedFormats}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        <div className="flex flex-col items-center justify-center gap-3">
          {selectedFile ? (
            <>
              <div className="p-3 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-200">{selectedFile.name}</p>
                <p className="text-xs font-mono text-slate-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · {selectedFile.type || 'Data File'}
                </p>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">Click or drag another file to replace</span>
            </>
          ) : (
            <>
              <div className="p-3 rounded-full bg-slate-900 border border-slate-700 text-blue-400">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">
                  Drag and drop your sales dataset here, or <span className="text-blue-400 underline">browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">Supports CSV or XLSX up to 50MB (Prototype Simulator)</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

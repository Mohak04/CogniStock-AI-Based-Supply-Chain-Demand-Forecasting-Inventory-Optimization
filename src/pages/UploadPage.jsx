import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Layers, Info } from 'lucide-react';
import DataBadge from '../components/DataBadge';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null); // Result from Stage 1 upload
  const [datasetName, setDatasetName] = useState('');
  const [sourceType, setSourceType] = useState('COMPANY_HISTORICAL');
  const [missingObservationPolicy, setMissingObservationPolicy] = useState('PRESERVE_AS_UNKNOWN');
  const [mapping, setMapping] = useState({
    dateColumn: '',
    skuColumn: '',
    quantityColumn: '',
    optionalMappings: {
      productName: '',
      category: '',
      unitPrice: '',
      unitCost: '',
      leadTime: '',
      currentStock: '',
      onOrder: '',
      backorders: ''
    }
  });
  const [submittingMapping, setSubmittingMapping] = useState(false);
  const [createdDataset, setCreatedDataset] = useState(null);
  const [error, setError] = useState(null);

  // Stage 1: File selection & upload
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setDatasetName(selected.name.replace(/\.[^/.]+$/, ""));
      setError(null);
      setUploadResult(null);
      setCreatedDataset(null);
    }
  };

  const handleUploadFile = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/v1/datasets/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadResult(res.data);
      
      // Pre-fill mapped values from auto-detection
      const suggested = res.data.suggestedMapping || {};
      setMapping({
        dateColumn: suggested.dateColumn || '',
        skuColumn: suggested.skuColumn || '',
        quantityColumn: suggested.quantityColumn || '',
        optionalMappings: {
          productName: suggested.optionalMappings?.productName || '',
          category: suggested.optionalMappings?.category || '',
          unitPrice: suggested.optionalMappings?.unitPrice || '',
          unitCost: suggested.optionalMappings?.unitCost || '',
          leadTime: suggested.optionalMappings?.leadTime || '',
          currentStock: suggested.optionalMappings?.currentStock || '',
          onOrder: suggested.optionalMappings?.onOrder || '',
          backorders: suggested.optionalMappings?.backorders || ''
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Stage 2: Confirm Mapping & Create Dataset Version
  const handleConfirmMapping = async () => {
    if (!mapping.dateColumn || !mapping.skuColumn || !mapping.quantityColumn) {
      setError('Mandatory columns (Date, SKU, and Quantity Sold) must be mapped before importing.');
      return;
    }

    setSubmittingMapping(true);
    setError(null);

    try {
      const payload = {
        tempFileId: uploadResult.tempFileId,
        datasetName,
        sourceType,
        missingObservationPolicy,
        columnMapping: mapping
      };

      const res = await axios.post('/api/v1/datasets/confirm-mapping', payload);
      setCreatedDataset(res.data.dataset);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create dataset version.');
    } finally {
      setSubmittingMapping(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 border-l-4 border-l-cyan-500">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Flexible Company Data Ingestion Engine</h2>
            <p className="text-slate-400 text-sm">
              Upload historical sales data (.csv or .xlsx). CogniStock preserves raw uploaded files immutably and generates unique Dataset Versions.
            </p>
          </div>
          <DataBadge type="ACTUAL" label="HISTORICAL DATA SOURCE" />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm">
          <AlertTriangle size={20} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STAGE 1: FILE DROPZONE */}
      {!uploadResult && (
        <div className="glass-panel p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
            <FileSpreadsheet size={32} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Select Sales Dataset File</h3>
            <p className="text-xs text-slate-400 mt-1">Supports CSV (.csv) and Excel (.xlsx, .xls) up to 50MB</p>
          </div>

          <div className="max-w-md mx-auto">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="block w-full py-3 px-4 border border-dashed border-slate-700 hover:border-cyan-500 rounded-xl cursor-pointer bg-slate-950/50 hover:bg-slate-900 transition-all text-xs text-slate-300 font-medium"
            >
              {file ? file.name : "Click to browse or drop file here"}
            </label>
          </div>

          {file && (
            <button
              onClick={handleUploadFile}
              disabled={uploading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 mx-auto"
            >
              {uploading ? (
                <span>Parsing & Auto-Detecting...</span>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Upload & Detect Schema</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* STAGE 2: COLUMN MAPPER & INGESTION SETTINGS */}
      {uploadResult && !createdDataset && (
        <div className="space-y-6">
          <div className="glass-panel p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Dataset Configuration & Schema Mapper
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-normal">
                    {uploadResult.originalFilename} ({Math.round(uploadResult.fileSizeBytes / 1024)} KB)
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Map your file columns to CogniStock standard analytical fields.</p>
              </div>
              <button
                onClick={() => setUploadResult(null)}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Upload Different File
              </button>
            </div>

            {/* General Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Dataset Name</label>
                <input
                  type="text"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                  placeholder="e.g. Retail Sales Q1 2026"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Data Source Type</label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                >
                  <option value="COMPANY_HISTORICAL">Company Historical Sales Data</option>
                  <option value="PUBLIC_DEMO">Public Development Dataset (Demo)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Missing Observation Policy</label>
                <select
                  value={missingObservationPolicy}
                  onChange={(e) => setMissingObservationPolicy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                >
                  <option value="PRESERVE_AS_UNKNOWN">Preserve Gaps as UNKNOWN (Default)</option>
                  <option value="USER_CONFIRMED_ZERO_SALES">Explicit User Confirmed Zero Sales</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
              <Info size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Missing Observation Rule:</strong> By default, missing transaction dates are preserved as <em>UNKNOWN</em> gaps and flagged in data quality. They are converted to zero sales only if explicitly confirmed by user setting.
              </span>
            </div>

            {/* Schema Mapper Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Mandatory Demand Forecasting Fields</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Date Column <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={mapping.dateColumn}
                    onChange={(e) => setMapping({ ...mapping, dateColumn: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                  >
                    <option value="">Select Column...</option>
                    {uploadResult.headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    SKU / Product ID Column <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={mapping.skuColumn}
                    onChange={(e) => setMapping({ ...mapping, skuColumn: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                  >
                    <option value="">Select Column...</option>
                    {uploadResult.headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Quantity Sold Column <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={mapping.quantityColumn}
                    onChange={(e) => setMapping({ ...mapping, quantityColumn: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                  >
                    <option value="">Select Column...</option>
                    {uploadResult.headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider pt-2">Optional Business Fields (Never Fabricated)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                {Object.keys(mapping.optionalMappings).map((optKey) => (
                  <div key={optKey}>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1 capitalize">
                      {optKey.replace(/([A-Z])/g, ' $1')}
                    </label>
                    <select
                      value={mapping.optionalMappings[optKey] || ''}
                      onChange={(e) => setMapping({
                        ...mapping,
                        optionalMappings: { ...mapping.optionalMappings, [optKey]: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 outline-none"
                    >
                      <option value="">Not Present</option>
                      {uploadResult.headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingestion Data Preview */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 mb-2">Raw File Preview (First {uploadResult.previewRows.length} Rows)</h4>
              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-300 border-b border-slate-800">
                    <tr>
                      {uploadResult.headers.map((h) => (
                        <th key={h} className="p-3 font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-400">
                    {uploadResult.previewRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        {uploadResult.headers.map((h) => (
                          <td key={h} className="p-3 whitespace-nowrap">{row[h] !== null && row[h] !== undefined ? String(row[h]) : '-'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={handleConfirmMapping}
                disabled={submittingMapping}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {submittingMapping ? (
                  <span>Validating & Creating Dataset Version...</span>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Confirm Mapping & Create Dataset Version</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: SUCCESS CREATION SUMMARY */}
      {createdDataset && (
        <div className="glass-panel p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white">Dataset Version v{createdDataset.version} Created</h3>
            <p className="text-slate-400 text-xs mt-1">Unique Dataset ID: <span className="font-mono text-cyan-400">{createdDataset.datasetId}</span></p>
          </div>

          <div className="max-w-xl mx-auto bg-slate-950 p-6 rounded-xl border border-slate-800 text-left space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Dataset Name:</span>
              <span className="font-semibold text-white">{createdDataset.datasetName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Data Source:</span>
              <span className="font-semibold text-cyan-400">{createdDataset.sourceType}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Missing Observation Policy:</span>
              <span className="font-semibold text-purple-400">{createdDataset.missingObservationPolicy}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Sample Row Count:</span>
              <span className="font-semibold text-white">{createdDataset.qualitySummary?.totalRows} rows</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">SKUs Sampled:</span>
              <span className="font-semibold text-emerald-400">{createdDataset.qualitySummary?.skuCount} SKUs</span>
            </div>
          </div>

          <button
            onClick={() => {
              setFile(null);
              setUploadResult(null);
              setCreatedDataset(null);
            }}
            className="px-6 py-2.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold transition-all"
          >
            Upload Another Dataset
          </button>
        </div>
      )}
    </div>
  );
}

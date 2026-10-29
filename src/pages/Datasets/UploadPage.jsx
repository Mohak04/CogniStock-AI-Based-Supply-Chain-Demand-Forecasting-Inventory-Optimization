import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { FileUpload } from '../../components/common/FileUpload';
import { ColumnMapper } from '../../components/datasets/ColumnMapper';
import { datasetService } from '../../services/datasetService';
import {
  UploadCloud,
  Eye,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  FileText,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const UploadPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadInfo, setUploadInfo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [columnMappings, setColumnMappings] = useState({
    Date: 'sale_date',
    SKU: 'product_code',
    Quantity: 'units_sold'
  });
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setErrorMessage('');
  };

  const handleProceedToPreview = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setErrorMessage('');
    try {
      const data = await datasetService.uploadFile(selectedFile);
      setUploadInfo(data);
      // Guess mappings from sourceColumns
      const cols = data.sourceColumns || [];
      setColumnMappings({
        Date: cols.find(c => c.toLowerCase().includes('date')) || cols[0] || 'Date',
        SKU: cols.find(c => c.toLowerCase().includes('sku') || c.toLowerCase().includes('code') || c.toLowerCase().includes('part')) || cols[1] || 'SKU',
        Quantity: cols.find(c => c.toLowerCase().includes('qty') || c.toLowerCase().includes('unit') || c.toLowerCase().includes('sold') || c.toLowerCase().includes('demand')) || cols[2] || 'Quantity',
        ProductName: cols.find(c => c.toLowerCase().includes('name') || c.toLowerCase().includes('desc')) || 'None / Ignore',
        Category: cols.find(c => c.toLowerCase().includes('cat')) || 'None / Ignore',
        UnitPrice: cols.find(c => c.toLowerCase().includes('price')) || 'None / Ignore',
        LeadTime: cols.find(c => c.toLowerCase().includes('lead')) || 'None / Ignore',
        CurrentStock: cols.find(c => c.toLowerCase().includes('stock') || c.toLowerCase().includes('hand')) || 'None / Ignore',
        UnitCost: cols.find(c => c.toLowerCase().includes('cost')) || 'None / Ignore'
      });
      setCurrentStep(2);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to upload and parse file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValidateMapping = async () => {
    if (!uploadInfo?.tempFilePath) return;
    setIsProcessing(true);
    setErrorMessage('');
    try {
      const val = await datasetService.validateDataset({
        tempFilePath: uploadInfo.tempFilePath,
        mapping: columnMappings
      });
      setValidationResult(val);
      setCurrentStep(4);
    } catch (err) {
      setErrorMessage(err.message || 'Validation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportFinal = async () => {
    if (!uploadInfo?.tempFilePath) return;
    setIsProcessing(true);
    setErrorMessage('');
    try {
      await datasetService.confirmImport({
        tempFilePath: uploadInfo.tempFilePath,
        fileName: uploadInfo.fileName,
        mapping: columnMappings,
        validationResult
      });
      navigate('/datasets');
    } catch (err) {
      setErrorMessage(err.message || 'Dataset import failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { num: 1, label: "Upload File" },
    { num: 2, label: "Data Preview" },
    { num: 3, label: "Column Mapping" },
    { num: 4, label: "Validation" },
    { num: 5, label: "Confirm Import" }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload Sales Dataset"
        subtitle="Ingest historical sales data to trigger demand forecasting and inventory optimization pipelines."
        breadcrumbItems={[{ label: "Data", href: "/datasets" }, { label: "Upload Data" }]}
      />

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Multi-Step Indicator */}
      <div className="card-panel p-4">
        <div className="flex items-center justify-between gap-2 overflow-x-auto">
          {steps.map((step, idx) => {
            const isDone = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <React.Fragment key={step.num}>
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                      isDone
                        ? 'bg-emerald-500 text-slate-950'
                        : isCurrent
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 ring-2 ring-blue-500/50'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent ? 'text-slate-100 font-bold' : isDone ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {idx < steps.length - 1 && <div className="h-0.5 w-8 bg-slate-800 shrink-0 hidden sm:block" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step 1: File Upload */}
      {currentStep === 1 && (
        <div className="card-panel p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-100">Step 1: Select or Drag Raw Sales File</h3>
            <p className="text-xs text-slate-400">Supported formats: CSV, XLSX. File must contain Date, SKU, and Quantity fields.</p>
          </div>

          <FileUpload onFileSelected={handleFileSelect} />

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={handleProceedToPreview}
              disabled={!selectedFile || isProcessing}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              {isProcessing ? "Uploading & Inspecting File..." : "Continue to Data Preview"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Data Preview */}
      {currentStep === 2 && uploadInfo && (
        <div className="card-panel p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100">Step 2: Inspect Raw Data Preview</h3>
              <p className="text-xs text-slate-400">
                Showing sample rows extracted from {uploadInfo.fileName} (Size: {(uploadInfo.fileSize / 1024).toFixed(1)} KB).
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-500/30">
              {uploadInfo.sourceColumns?.length || 0} Columns Detected
            </span>
          </div>

          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left text-xs text-slate-300 font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase">
                <tr>
                  {uploadInfo.sourceColumns?.map((col) => (
                    <th key={col} className="p-3 whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {uploadInfo.previewRows?.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    {uploadInfo.sourceColumns?.map((col) => (
                      <td key={col} className="p-3 text-slate-200 whitespace-nowrap">
                        {String(row[col] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              Proceed to Column Mapping <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Column Mapping */}
      {currentStep === 3 && uploadInfo && (
        <div className="space-y-6">
          <ColumnMapper
            sourceColumns={uploadInfo.sourceColumns || []}
            onMappingChange={(m) => setColumnMappings(m)}
          />

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleValidateMapping}
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              {isProcessing ? "Validating Schema & Integrity..." : "Validate Data Integrity"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Validation Results */}
      {currentStep === 4 && (
        <div className="card-panel p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100">Step 4: Automated Data Integrity Validation</h3>
              <p className="text-xs text-slate-400">
                Verified required fields, date formatting, and non-negative sales volume.
              </p>
            </div>
            <span
              className={`text-xs font-mono px-3 py-1 rounded border font-bold ${
                validationResult?.isValid
                  ? 'text-emerald-400 bg-emerald-950 border-emerald-500/30'
                  : 'text-amber-400 bg-amber-950 border-amber-500/30'
              }`}
            >
              {validationResult?.isValid ? '✓ Validation Passed' : '⚠ Validation Warnings'} (Score: {validationResult?.qualityScore}%)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] block uppercase">Total Rows</span>
              <span className="text-base font-bold text-slate-200">{validationResult?.totalRows?.toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] block uppercase">SKU Count</span>
              <span className="text-base font-bold text-blue-400">{validationResult?.skuCount} SKUs</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] block uppercase">Frequency</span>
              <span className="text-base font-bold text-purple-400">{validationResult?.detectedFrequency}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] block uppercase">Quality Score</span>
              <span className="text-base font-bold text-emerald-400">{validationResult?.qualityScore}%</span>
            </div>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {validationResult?.passedChecks?.map((check, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  {check}
                </span>
                <span className="text-[10px] text-emerald-400 uppercase font-bold">PASSED</span>
              </div>
            ))}

            {validationResult?.validationIssues?.map((issue, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-amber-300">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  Row #{issue.row} ({issue.field}): {issue.issue}
                </span>
                <span className="text-[10px] uppercase font-bold text-amber-400">{issue.status}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setCurrentStep(5)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              Proceed to Confirmation <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Confirm Import */}
      {currentStep === 5 && (
        <div className="card-panel p-8 text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-100">Ready to Ingest Company Dataset</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              File '{uploadInfo?.fileName || 'sales_data.csv'}' has passed all schema checks. Ingesting this dataset will initialize your product catalog, generate baseline forecasts, and compute deterministic inventory parameters.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-w-sm mx-auto text-left font-mono text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">File Name:</span>
              <span className="text-slate-200 font-bold">{uploadInfo?.fileName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Records:</span>
              <span className="text-slate-200 font-bold">{validationResult?.totalRows?.toLocaleString()} rows</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">SKUs Detected:</span>
              <span className="text-blue-400 font-bold">{validationResult?.skuCount} SKUs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Quality Score:</span>
              <span className="text-emerald-400 font-bold">{validationResult?.qualityScore}%</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Back
            </button>
            <button
              onClick={handleImportFinal}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-2 shadow-lg shadow-emerald-900/30"
            >
              {isProcessing ? "Importing & Computing Forecasts..." : "Import Dataset Now"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

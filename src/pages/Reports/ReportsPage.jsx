import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { ReportCard } from '../../components/reports/ReportCard';
import { Modal } from '../../components/common/Modal';
import { LoadingState } from '../../components/common/LoadingState';
import { DatasetSelector } from '../../components/common/DatasetSelector';
import { reportService } from '../../services/reportService';
import { FileText, Plus, Database } from 'lucide-react';

export const ReportsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(searchParams.get('datasetId') || '');
  const [currentDatasetName, setCurrentDatasetName] = useState('');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [reportType, setReportType] = useState('Company Inventory Report');
  const [skuScope, setSkuScope] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchReports = async (dId) => {
    setLoading(true);
    try {
      const res = await reportService.getReports(dId);
      if (res?.data) {
        setReports(res.data);
        if (res.datasets) setDatasets(res.datasets);
        if (res.datasetName) setCurrentDatasetName(res.datasetName);
        if (res.datasetId && !selectedDatasetId) setSelectedDatasetId(res.datasetId);
      } else if (Array.isArray(res)) {
        setReports(res);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(selectedDatasetId);
  }, [selectedDatasetId]);

  const handleDatasetChange = (newId) => {
    setSelectedDatasetId(newId);
    setSearchParams(newId ? { datasetId: newId } : {});
  };

  const handleGenerateNewReport = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const newRep = await reportService.generateReport({
        type: reportType,
        sku: skuScope || undefined,
        datasetId: selectedDatasetId || undefined
      });
      setReports((prev) => [newRep, ...prev]);
      setIsGenerateModalOpen(false);
    } catch (err) {
      alert(`Report generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewReport = (rep) => {
    navigate(`/reports/${rep.id}`);
  };

  const handleDownloadReport = async (rep) => {
    try {
      await reportService.downloadReport(rep.id, `${rep.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    }
  };

  if (loading && reports.length === 0 && datasets.length === 0) {
    return <LoadingState message="Loading enterprise reports center..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enterprise Reports Center"
        subtitle="Generate and review PDF-exportable analytical reports for demand forecasts, inventory posture, and model audits."
        breadcrumbItems={[{ label: "Analytics", href: "/reports" }, { label: "Reports Center" }]}
        actions={
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-900/30"
          >
            <Plus className="w-4 h-4" /> Generate New Report
          </button>
        }
      />

      {/* Dataset Selector Bar */}
      <DatasetSelector
        datasets={datasets}
        selectedDatasetId={selectedDatasetId}
        onSelectDataset={handleDatasetChange}
      />

      {/* Reports Grid */}
      {reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((r) => (
            <ReportCard
              key={r.id}
              report={r}
              onPreview={handlePreviewReport}
              onDownload={handleDownloadReport}
            />
          ))}
        </div>
      ) : (
        <div className="card-panel p-12 text-center space-y-4 bg-slate-900/60 border border-slate-800">
          <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7 text-slate-400" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-slate-100">No Reports Generated Yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No analytical reports have been generated for <span className="text-slate-200 font-semibold">{currentDatasetName || 'the selected dataset'}</span>.
              Click <strong className="text-blue-300">"Generate New Report"</strong> to compile a PDF report with inventory posture, forecast benchmarks, or data quality audit.
            </p>
          </div>
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Generate First Report
          </button>
        </div>
      )}

      {/* Generate Report Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate Analytical Report"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleGenerateNewReport} className="space-y-4 text-xs">
          {/* Dataset scope info */}
          {currentDatasetName && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-950/50 border border-blue-500/30 text-blue-300 text-[11px]">
              <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Report will be scoped to: <strong className="text-blue-200">{currentDatasetName}</strong></span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Report Category</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="Company Inventory Report">Company Inventory Report</option>
              <option value="Product Analysis Report">Product Analysis Report</option>
              <option value="Forecast Evaluation Report">Forecast Evaluation Report</option>
              <option value="Data Quality Report">Data Quality Report</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">SKU / Scope Selection <span className="text-slate-500 font-normal">(optional — leave blank for catalog-wide scope)</span></label>
            <input
              type="text"
              value={skuScope}
              onChange={(e) => setSkuScope(e.target.value)}
              placeholder="e.g. SKU-104 or leave blank for all SKUs"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
            Report will compile real dataset metrics, safety stock calculations, and structured document preview scoped to the selected dataset only.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsGenerateModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold inline-flex items-center gap-1.5"
            >
              {isGenerating ? 'Compiling Report...' : 'Generate Report'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ColumnMapper } from '../../components/datasets/ColumnMapper';
import { DataQualitySummary } from '../../components/datasets/DataQualitySummary';
import { LoadingState } from '../../components/common/LoadingState';
import { datasetService } from '../../services/datasetService';
import { Database, CheckCircle2, ArrowLeft, FileCheck, Layers } from 'lucide-react';

export const DatasetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dataset, setDataset] = useState(null);
  const [qualitySummary, setQualitySummary] = useState(null);

  useEffect(() => {
    Promise.all([
      datasetService.getDatasetById(id || 'ds-001'),
      datasetService.getDataQuality(id || 'ds-001')
    ]).then(([ds, q]) => {
      setDataset(ds);
      setQualitySummary(q);
      setLoading(false);
    });
  }, [id]);

  if (loading || !dataset) return <LoadingState message="Loading dataset details..." />;

  const breadcrumbItems = [
    { label: "Data", href: "/datasets" },
    { label: "Datasets", href: "/datasets" },
    { label: dataset.name }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={dataset.name}
        subtitle={`Dataset Version ${dataset.version} · Source: ${dataset.source}`}
        breadcrumbItems={breadcrumbItems}
        actions={
          <button
            onClick={() => navigate(`/data-quality?datasetId=${id}`)}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <FileCheck className="w-4 h-4 text-emerald-400" /> Inspect Full Quality Log
          </button>
        }
      />

      {/* Dataset Overview Metadata Card */}
      <div className="card-panel p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-950/80 border border-blue-500/30 text-blue-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">{dataset.name}</h3>
              <p className="text-xs text-slate-400">{dataset.description}</p>
            </div>
          </div>
          <StatusBadge status={dataset.qualityStatus} />
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] block uppercase">Total Rows</span>
            <span className="text-base font-bold text-slate-100">{dataset.rows.toLocaleString()}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] block uppercase">SKU Count</span>
            <span className="text-base font-bold text-blue-400">{dataset.skus} SKUs</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] block uppercase">Date Horizon</span>
            <span className="text-xs font-bold text-slate-200">{dataset.dateRange}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] block uppercase">Quality Score</span>
            <span className="text-base font-bold text-emerald-400">{dataset.qualityScore}%</span>
          </div>
        </div>

        {/* Required Fields Checklist */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
            Required Forecasting Fields Validation
          </span>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-md border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" /> Date Field ({dataset.mappings?.Date || 'Date'})
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-md border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" /> Product ID / SKU ({dataset.mappings?.SKU || 'SKU'})
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-md border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" /> Quantity Sold ({dataset.mappings?.Quantity || 'Quantity'})
            </span>
          </div>
        </div>
      </div>

      {/* Schema Mapping UI */}
      <ColumnMapper
        sourceColumns={
          dataset.samplePreview?.length > 0
            ? Object.keys(dataset.samplePreview[0])
            : (dataset.mappings ? Object.values(dataset.mappings).filter(Boolean) : [])
        }
        initialMappings={dataset.mappings || {}}
      />

      {/* Quality Breakdown */}
      {qualitySummary && <DataQualitySummary summary={qualitySummary} />}
    </div>
  );
};

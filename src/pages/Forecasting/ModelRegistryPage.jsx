import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { LoadingState } from '../../components/common/LoadingState';
import { modelService } from '../../services/modelService';
import { Layers, Eye, Download, Cpu, HardDrive, CheckCircle2 } from 'lucide-react';

export const ModelRegistryPage = () => {
  const [loading, setLoading] = useState(true);
  const [registry, setRegistry] = useState([]);
  const [selectedArtifact, setSelectedArtifact] = useState(null);

  useEffect(() => {
    modelService.getModelRegistry().then((data) => {
      setRegistry(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState message="Loading model artifact registry..." />;

  const columns = [
    {
      header: "Model Version",
      accessor: "version",
      cell: (row) => (
        <div>
          <span className="font-bold text-slate-100 font-mono text-xs">{row.version}</span>
          <span className="text-[11px] text-slate-400 block font-mono">{row.artifactId}</span>
        </div>
      )
    },
    {
      header: "Architecture",
      accessor: "modelName",
      cell: (row) => <span className="font-semibold text-slate-200">{row.modelName}</span>
    },
    {
      header: "Dataset Version",
      accessor: "datasetVersion",
      cell: (row) => <span className="font-mono text-xs text-slate-300">{row.datasetVersion}</span>
    },
    {
      header: "SKU Scope",
      accessor: "skuScope",
      cell: (row) => <span className="text-xs text-slate-300">{row.skuScope}</span>
    },
    {
      header: "Primary Metric",
      accessor: "primaryMetric",
      cell: (row) => <span className="font-mono text-emerald-400 font-bold">{row.primaryMetric}</span>
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => <StatusBadge status={row.status} size="sm" />
    },
    {
      header: "Actions",
      accessor: "actions",
      sortable: false,
      align: "right",
      cell: (row) => (
        <button
          onClick={() => setSelectedArtifact(row)}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1 transition-colors border border-slate-700"
        >
          <Eye className="w-3 h-3" /> Artifact Specs
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Model Registry & Artifact Repository"
        subtitle="Track trained model versions, deployed artifacts, and production selection rationales."
        breadcrumbItems={[{ label: "Forecasting", href: "/forecasts" }, { label: "Model Registry" }]}
      />

      <DataTable
        columns={columns}
        data={registry}
        searchPlaceholder="Search model registry by version or model..."
      />

      {/* Model Artifact Detail Modal */}
      {selectedArtifact && (
        <Modal
          isOpen={!!selectedArtifact}
          onClose={() => setSelectedArtifact(null)}
          title={`Artifact Details — ${selectedArtifact.version}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500 uppercase">Artifact File:</span>
                <span className="text-blue-400 font-bold">{selectedArtifact.artifactId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">File Size:</span>
                <span className="text-slate-200">{selectedArtifact.artifactsSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trained Date:</span>
                <span className="text-slate-200">{selectedArtifact.trainedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Validation Metric:</span>
                <span className="text-emerald-400 font-bold">{selectedArtifact.primaryMetric}</span>
              </div>
            </div>

            <div className="space-y-1">
              <h5 className="font-bold text-slate-200">Selection Rationale</h5>
              <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                {selectedArtifact.selectionRationale}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

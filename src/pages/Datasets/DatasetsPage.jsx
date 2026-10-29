import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { datasetService } from '../../services/datasetService';
import { Database, UploadCloud, Eye, ShieldCheck, FileText, ShieldAlert } from 'lucide-react';

export const DatasetsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [datasets, setDatasets] = useState([]);

  useEffect(() => {
    datasetService.getDatasets().then((data) => {
      setDatasets(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState message="Loading datasets registry..." />;

  const columns = [
    {
      header: "Dataset Name",
      accessor: "name",
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>{row.name}</span>
            {row.isDefault && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-950 text-blue-400 border border-blue-500/30">
                ACTIVE DEMO
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 truncate max-w-xs">{row.description}</p>
        </div>
      )
    },
    {
      header: "Version",
      accessor: "version",
      cell: (row) => <span className="font-mono text-slate-300 font-semibold">{row.version}</span>
    },
    {
      header: "Rows & SKUs",
      accessor: "rows",
      cell: (row) => (
        <div className="font-mono text-xs">
          <div className="text-slate-200 font-bold">{row.rows.toLocaleString()} Records</div>
          <div className="text-slate-400 text-[11px]">{row.skus} SKUs</div>
        </div>
      )
    },
    {
      header: "Date Horizon",
      accessor: "dateRange",
      cell: (row) => <span className="font-mono text-[11px] text-slate-300">{row.dateRange}</span>
    },
    {
      header: "Quality Status",
      accessor: "qualityStatus",
      cell: (row) => (
        <div className="space-y-1">
          <StatusBadge status={row.qualityStatus} size="sm" />
          <div className="text-[10px] font-mono text-emerald-400">{row.qualityScore}% Score</div>
        </div>
      )
    },
    {
      header: "Uploaded",
      accessor: "uploadedAt",
      cell: (row) => (
        <div className="text-[11px]">
          <div className="text-slate-300 font-mono">{row.uploadedAt}</div>
          <div className="text-slate-500">{row.uploadedBy}</div>
        </div>
      )
    },
    {
      header: "Actions",
      accessor: "actions",
      sortable: false,
      align: "right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => navigate(`/datasets/${row.id}`)}
            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center gap-1 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Inspect
          </button>
          <button
            onClick={() => navigate(`/data-quality?datasetId=${row.id}`)}
            className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs inline-flex items-center gap-1 transition-colors border border-slate-600"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> Quality Log
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dataset Management"
        subtitle="Manage ingested sales datasets, verify schema column mappings, and audit quality validation metrics."
        breadcrumbItems={[{ label: "Data / Datasets" }]}
        actions={
          <button
            onClick={() => navigate('/upload')}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-900/30"
          >
            <UploadCloud className="w-4 h-4" /> Upload Dataset
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={datasets}
        searchPlaceholder="Search datasets by name or source..."
        emptyTitle="No datasets found"
        emptyDescription="Upload a CSV/XLSX file to begin demand analysis."
      />
    </div>
  );
};

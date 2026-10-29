import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DataQualitySummary } from '../../components/datasets/DataQualitySummary';
import { LoadingState } from '../../components/common/LoadingState';
import { DatasetSelector } from '../../components/common/DatasetSelector';
import { datasetService } from '../../services/datasetService';
import { FileCheck, ShieldAlert, AlertTriangle, Database, CheckCircle2, UploadCloud } from 'lucide-react';

export const DataQualityPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [qualityData, setQualityData] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(searchParams.get('datasetId') || '');

  useEffect(() => {
    datasetService.getDatasets().then((dsList) => {
      setDatasets(dsList);
      if (!selectedDatasetId && dsList.length > 0) {
        setSelectedDatasetId(dsList[0].id || dsList[0]._id);
      }
    });
  }, []);

  const fetchQuality = async (dId) => {
    setLoading(true);
    try {
      const data = await datasetService.getDataQuality(dId);
      setQualityData(data);
      if (data?.datasetId && !selectedDatasetId) {
        setSelectedDatasetId(data.datasetId);
      }
    } catch (err) {
      console.error('Failed to load data quality:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuality(selectedDatasetId);
  }, [selectedDatasetId]);

  const handleDatasetChange = (newId) => {
    setSelectedDatasetId(newId);
    setSearchParams(newId ? { datasetId: newId } : {});
  };

  if (loading && !qualityData) return <LoadingState message="Running dataset schema and quality checks..." />;

  const columns = [
    {
      header: "Row Index",
      accessor: "row",
      cell: (row) => <span className="font-mono text-slate-300 font-bold">Row #{row.row}</span>
    },
    {
      header: "Field",
      accessor: "field",
      cell: (row) => <span className="font-semibold text-slate-200">{row.field}</span>
    },
    {
      header: "Raw Value",
      accessor: "value",
      cell: (row) => <span className="font-mono text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{row.value}</span>
    },
    {
      header: "Validation Issue Description",
      accessor: "issue",
      cell: (row) => <span className="text-slate-300">{row.issue}</span>
    },
    {
      header: "Severity",
      accessor: "severity",
      cell: (row) => <StatusBadge status={row.severity} size="sm" />
    },
    {
      header: "Audit Action",
      accessor: "status",
      cell: (row) => (
        <span className="font-mono text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          {row.status}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Quality & Integrity Audit"
        subtitle="Review dataset validation scores, missing fields, schema mapping accuracy, and outlier audit logs."
        breadcrumbItems={[{ label: "Data", href: "/datasets" }, { label: "Data Quality" }]}
      />

      {/* Dataset Selector Bar */}
      <DatasetSelector
        datasets={datasets}
        selectedDatasetId={selectedDatasetId}
        onSelectDataset={handleDatasetChange}
      />

      {qualityData && qualityData.status !== 'empty' ? (
        <>
          <DataQualitySummary summary={qualityData} />

          {/* Row-by-Row Validation Log Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <span>Row-Level Validation Issue Log</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {qualityData.validationIssues?.length || 0} Issues Flagged for {qualityData.datasetName}
              </span>
            </div>

            {qualityData.validationIssues && qualityData.validationIssues.length > 0 ? (
              <DataTable
                columns={columns}
                data={qualityData.validationIssues}
                searchPlaceholder="Search issue by row or field..."
              />
            ) : (
              <div className="card-panel p-8 text-center space-y-3 bg-slate-900/60 border border-slate-800">
                <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="text-sm font-bold text-slate-200">No Validation Issues Found</h4>
                  <p className="text-xs text-slate-400">
                    All {qualityData.rowCount} rows in <strong className="text-slate-300">{qualityData.datasetName}</strong> passed schema checks, date parsing, and non-negative demand filters.
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="card-panel p-12 text-center space-y-4 bg-slate-900/60 border border-slate-800">
          <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto">
            <Database className="w-7 h-7 text-slate-400" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-slate-100">No Dataset Quality Report</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No datasets have been ingested yet. Upload a historical sales dataset to generate schema validation and quality audit metrics.
            </p>
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <UploadCloud className="w-4 h-4" /> Upload Sales Dataset
          </button>
        </div>
      )}
    </div>
  );
};

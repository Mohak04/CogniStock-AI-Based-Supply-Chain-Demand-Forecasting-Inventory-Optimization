import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { ChartCard } from '../../components/common/ChartCard';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { DatasetSelector } from '../../components/common/DatasetSelector';
import { modelService } from '../../services/modelService';
import { BarChart3, Cpu, AlertCircle, Layers, PlayCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export const ModelComparisonPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [runningBenchmark, setRunningBenchmark] = useState(false);
  const [benchmarkStatus, setBenchmarkStatus] = useState(null); // 'success' | 'error' | null
  const [benchmarkError, setBenchmarkError] = useState('');
  const [comparisonData, setComparisonData] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(searchParams.get('datasetId') || '');

  const fetchComparison = async (dId) => {
    setLoading(true);
    try {
      const data = await modelService.getModelComparison(dId);
      setComparisonData(data);
      if (data?.datasets) setDatasets(data.datasets);
      if (data?.datasetId && !selectedDatasetId) setSelectedDatasetId(data.datasetId);
    } catch (err) {
      console.error('Failed to load model comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison(selectedDatasetId);
  }, [selectedDatasetId]);

  const handleDatasetChange = (newId) => {
    setSelectedDatasetId(newId);
    setBenchmarkStatus(null);
    setBenchmarkError('');
    setSearchParams(newId ? { datasetId: newId } : {});
  };

  const handleRunBenchmark = async () => {
    setRunningBenchmark(true);
    setBenchmarkStatus(null);
    setBenchmarkError('');
    try {
      await modelService.runModelEvaluation(selectedDatasetId || comparisonData?.datasetId);
      // Re-fetch after completion
      await fetchComparison(selectedDatasetId || comparisonData?.datasetId);
      setBenchmarkStatus('success');
    } catch (err) {
      console.error('Benchmark run failed:', err);
      setBenchmarkStatus('error');
      setBenchmarkError(err.message || 'Benchmark run failed.');
    } finally {
      setRunningBenchmark(false);
    }
  };

  const columns = [
    {
      header: "Model Architecture",
      accessor: "name",
      cell: (row) => (
        <div>
          <span className="font-bold text-slate-100">{row.name}</span>
          <span className="text-[11px] text-slate-400 block font-mono">{row.category}</span>
        </div>
      )
    },
    {
      header: "Eligibility / Ideal Scope",
      accessor: "eligibility",
      cell: (row) => <span className="text-xs text-slate-300">{row.eligibility}</span>
    },
    {
      header: "MAE",
      accessor: "maeDemo",
      cell: (row) => <span className="font-mono text-slate-200 font-bold">{row.maeDemo}</span>
    },
    {
      header: "RMSE",
      accessor: "rmseDemo",
      cell: (row) => <span className="font-mono text-blue-400 font-bold">{row.rmseDemo}</span>
    },
    {
      header: "sMAPE",
      accessor: "smapeDemo",
      cell: (row) => <span className="font-mono text-amber-400 font-bold">{row.smapeDemo}</span>
    },
    {
      header: "Training Time",
      accessor: "trainingTime",
      cell: (row) => <span className="font-mono text-slate-400">{row.trainingTime}</span>
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => <StatusBadge status={row.status} size="sm" />
    }
  ];

  const isUncalculated = !loading && comparisonData?.status === 'uncalculated';
  const hasData = !loading && comparisonData?.data?.models?.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Model Benchmark & Error Comparison"
        subtitle="Evaluate validation error metrics (MAE, RMSE, sMAPE) across Naive Baseline, ARIMA/SARIMA, and XGBoost Regressor."
        breadcrumbItems={[{ label: "Forecasting", href: "/forecasts" }, { label: "Model Comparison" }]}
        actions={
          <button
            onClick={handleRunBenchmark}
            disabled={runningBenchmark}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:text-blue-400 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-900/30"
          >
            {runningBenchmark
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Running Benchmark...</>
              : <><PlayCircle className="w-4 h-4" /> Run Forecast Benchmark</>
            }
          </button>
        }
      />

      {/* Dataset Selector Bar */}
      <DatasetSelector
        datasets={datasets}
        selectedDatasetId={selectedDatasetId}
        onSelectDataset={handleDatasetChange}
        disabled={runningBenchmark}
      />

      {/* Benchmark Status Toast */}
      {benchmarkStatus === 'success' && (
        <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p>Benchmark completed successfully. Model evaluation metrics have been computed and saved for this dataset.</p>
        </div>
      )}
      {benchmarkStatus === 'error' && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <p className="font-semibold">Benchmark run failed: {benchmarkError || 'Service communication error.'}</p>
            <p className="text-[11px] text-red-300 mt-0.5">
              Ensure the Python ML microservice is running on port 8000 (<code className="font-mono bg-red-900/50 px-1 py-0.5 rounded">cd ml-service && python main.py</code>) and the dataset has products with valid historical demand (≥5 observations).
            </p>
          </div>
        </div>
      )}

      {/* Info Disclaimer */}
      <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
        <p>
          <strong className="font-semibold text-white">Automated Model Selection:</strong> Validation error metrics are computed via chronological train/test splits by the Python ML microservice across Naive Baseline, ARIMA/SARIMA, and XGBoost Regressor models. Click "Run Forecast Benchmark" to evaluate a fresh dataset.
        </p>
      </div>

      {loading ? (
        <LoadingState message="Loading model benchmark comparison..." />
      ) : isUncalculated ? (
        /* Uncalculated empty state */
        <div className="card-panel p-12 text-center space-y-4 bg-slate-900/60 border border-slate-800">
          <div className="w-14 h-14 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto">
            <BarChart3 className="w-7 h-7 text-blue-400" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-slate-100">No Benchmark Results for This Dataset</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Model evaluation has not been run for <span className="text-slate-200 font-semibold">{comparisonData?.datasetName || 'the selected dataset'}</span> yet. Click the <strong className="text-blue-300">"Run Forecast Benchmark"</strong> button above to execute chronological train/test evaluation across all three model families.
            </p>
          </div>
          <button
            onClick={handleRunBenchmark}
            disabled={runningBenchmark}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:text-blue-400 text-white font-bold text-sm inline-flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/30"
          >
            {runningBenchmark
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Running...</>
              : <><PlayCircle className="w-4 h-4" /> Run Forecast Benchmark</>
            }
          </button>
        </div>
      ) : hasData ? (
        <>
          {/* Error Comparison Bar Chart */}
          <ChartCard
            title="Validation Error Metric Comparison (Lower is Better)"
            subtitle="Side-by-side comparison of MAE and RMSE across evaluated model families."
            badgeText={`${comparisonData?.datasetName || 'Dataset'} · ${comparisonData?.datasetVersion || 'v1.0'}`}
          >
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={comparisonData.data.chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="mae" fill="#3b82f6" name="MAE (Mean Absolute Error)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rmse" fill="#8b5cf6" name="RMSE (Root Mean Square Error)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Model Benchmark Table */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span>Detailed Model Benchmark Summary</span>
              <span className="text-xs font-mono text-purple-400 bg-purple-950 px-2.5 py-1 rounded border border-purple-500/30 ml-auto">
                {comparisonData.datasetName} · {comparisonData.datasetVersion}
              </span>
            </h3>

            <DataTable
              columns={columns}
              data={comparisonData.data.models}
              searchable={false}
            />
          </div>
        </>
      ) : (
        <div className="card-panel p-12 text-center space-y-4 bg-slate-900/60 border border-slate-800">
          <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto">
            <Layers className="w-7 h-7 text-slate-400" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-slate-100">No Datasets Available</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload a historical sales dataset first, then return here to run model evaluation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

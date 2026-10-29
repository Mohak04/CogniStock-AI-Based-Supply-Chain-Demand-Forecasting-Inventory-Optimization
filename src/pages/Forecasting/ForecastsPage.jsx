import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { ChartCard } from '../../components/common/ChartCard';
import { ForecastChart } from '../../components/forecasting/ForecastChart';
import { LoadingState } from '../../components/common/LoadingState';
import { DatasetSelector } from '../../components/common/DatasetSelector';
import { forecastService } from '../../services/forecastService';
import { productService } from '../../services/productService';
import { datasetService } from '../../services/datasetService';
import { LineChart, Cpu, Eye, BarChart3, AlertCircle, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

export const ForecastsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(searchParams.get('datasetId') || '');
  const [selectedSku, setSelectedSku] = useState(searchParams.get('sku') || '');
  const [horizon, setHorizon] = useState(30);

  const [loading, setLoading] = useState(true);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [runningModel, setRunningModel] = useState(false);
  const [forecastData, setForecastData] = useState(null);
  const [productList, setProductList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Load Datasets
  useEffect(() => {
    datasetService.getDatasets().then((dsList) => {
      setDatasets(dsList);
      if (!selectedDatasetId && dsList.length > 0) {
        setSelectedDatasetId(dsList[0].id || dsList[0]._id);
      }
    }).catch((err) => {
      console.error('Failed to load datasets:', err);
    });
  }, []);

  // 2. Load Products whenever selectedDatasetId changes
  useEffect(() => {
    if (!selectedDatasetId) return;

    setLoading(true);
    setErrorMessage('');
    productService.getProducts({ datasetId: selectedDatasetId })
      .then((prods) => {
        setProductList(prods);
        if (prods.length > 0) {
          // Keep current SKU if present in new list, else select first product
          const exists = prods.some((p) => p.sku === selectedSku);
          if (!exists) {
            setSelectedSku(prods[0].sku);
            setSearchParams({ datasetId: selectedDatasetId, sku: prods[0].sku });
          }
        } else {
          setSelectedSku('');
          setForecastData(null);
        }
      })
      .catch((err) => {
        console.error('Failed to load products:', err);
        setErrorMessage(err.message || 'Failed to load products for selected dataset.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedDatasetId]);

  // 3. Load Forecast whenever selectedSku, horizon, or selectedDatasetId changes
  useEffect(() => {
    if (!selectedSku || !selectedDatasetId) {
      setForecastData(null);
      return;
    }

    setForecastLoading(true);
    setErrorMessage('');

    forecastService.getForecastBySku(selectedSku, horizon, selectedDatasetId)
      .then((data) => {
        setForecastData(data);
      })
      .catch((err) => {
        console.warn('Forecast fetch warning:', err.message);
        setForecastData(null);
        setErrorMessage(err.message || `No forecast generated yet for ${selectedSku}. Click 'Run Forecast' to trigger model evaluation.`);
      })
      .finally(() => {
        setForecastLoading(false);
      });
  }, [selectedSku, horizon, selectedDatasetId]);

  const handleDatasetChange = (newId) => {
    setSelectedDatasetId(newId);
    setSearchParams(newId ? { datasetId: newId } : {});
  };

  const handleSkuChange = (newSku) => {
    setSelectedSku(newSku);
    setSearchParams({ datasetId: selectedDatasetId, sku: newSku });
  };

  const handleRunForecast = async () => {
    if (!selectedSku || !selectedDatasetId) return;
    setRunningModel(true);
    setErrorMessage('');
    try {
      await forecastService.generateForecast({
        sku: selectedSku,
        horizon,
        datasetId: selectedDatasetId
      });
      // Refresh forecast
      const data = await forecastService.getForecastBySku(selectedSku, horizon, selectedDatasetId);
      setForecastData(data);
    } catch (err) {
      setErrorMessage(err.message || 'Forecast generation failed.');
    } finally {
      setRunningModel(false);
    }
  };

  const currentDataset = datasets.find((d) => (d.id || d._id) === selectedDatasetId) || datasets[0];
  const currentProduct = productList.find((p) => p.sku === selectedSku) || productList[0];

  if (loading && !productList.length) {
    return <LoadingState message="Loading demand forecasting workspace..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demand Forecasting Workspace"
        subtitle="Inspect machine learning time-series demand projections, historical baseline actuals, and error evaluation metrics."
        breadcrumbItems={[{ label: "Forecasting", href: "/forecasts" }, { label: "Demand Forecasts" }]}
        actions={
          <button
            onClick={() => navigate(`/models/comparison${selectedDatasetId ? `?datasetId=${selectedDatasetId}` : ''}`)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-900/30"
          >
            <BarChart3 className="w-4 h-4" /> Compare 3 Candidate Models
          </button>
        }
      />

      {/* Dataset Selector */}
      <DatasetSelector
        datasets={datasets}
        selectedDatasetId={selectedDatasetId}
        onSelectDataset={handleDatasetChange}
      />

      {/* Control Bar: SKU Selector & Horizon */}
      <div className="card-panel p-4 flex flex-wrap items-center justify-between gap-4 bg-slate-900/90">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Target Product SKU:</span>
            {productList.length > 0 ? (
              <select
                value={selectedSku}
                onChange={(e) => handleSkuChange(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-bold font-mono focus:outline-none focus:border-blue-500"
              >
                {productList.map((p) => (
                  <option key={p.sku} value={p.sku}>
                    {p.sku} — {p.name} ({p.category})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-mono text-slate-400">No products in this dataset</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Active Scope:</span>
            <span className="font-mono text-xs text-slate-300 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              {currentDataset?.name || 'Dataset'} ({currentDataset?.version || 'v1.0'})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedSku && (
            <button
              onClick={handleRunForecast}
              disabled={runningModel || forecastLoading}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-md shadow-blue-900/30"
            >
              {runningModel ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Training Model...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Run ML Forecast
                </>
              )}
            </button>
          )}

          {selectedSku && (
            <button
              onClick={() => navigate(`/forecasts/${selectedSku}?datasetId=${selectedDatasetId}`)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1 transition-colors border border-slate-700"
            >
              <Eye className="w-3.5 h-3.5" /> Full SKU Detail
            </button>
          )}
        </div>
      </div>

      {/* Main Forecast State Handling */}
      {forecastLoading ? (
        <LoadingState message={`Calculating ML forecast projection for ${selectedSku}...`} />
      ) : forecastData && forecastData.series && forecastData.series.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartCard
              title={`Demand Forecast trajectory for ${currentProduct ? currentProduct.sku : selectedSku} (${currentProduct ? currentProduct.name : 'Target Item'})`}
              subtitle={`Comparing historical actuals vs ${horizon}-day demand projection generated by ${forecastData.metrics?.modelName || 'Selected Model'}.`}
              badgeText="Machine Learning Projections"
            >
              <ForecastChart
                data={forecastData.series}
                sku={selectedSku}
                height={350}
                onHorizonChange={(h) => setHorizon(h)}
              />
            </ChartCard>
          </div>

          {/* Model Metrics & Evaluation Box */}
          <div className="card-panel p-5 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-bold text-slate-100">Model Evaluation</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                  Validated Run
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Selected ML Engine:</span>
                  <span className="font-bold text-slate-200 font-mono">{forecastData.metrics?.modelName || 'Naive Baseline'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Forecast Horizon:</span>
                  <span className="font-mono text-slate-200">{horizon} Days Forward</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Dataset Scope:</span>
                  <span className="font-mono text-slate-300">{currentDataset?.name || forecastData.metrics?.datasetVersion}</span>
                </div>
              </div>

              {/* 3 Metric Boxes: sMAPE, MAE, RMSE */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">sMAPE</span>
                  <span className="text-base font-bold text-amber-400">{forecastData.metrics?.smape || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">MAE</span>
                  <span className="text-base font-bold text-slate-200">{forecastData.metrics?.mae ?? 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">RMSE</span>
                  <span className="text-base font-bold text-blue-400">{forecastData.metrics?.rmse ?? 0}</span>
                </div>
              </div>

              {/* Selection Rationale */}
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1 text-xs">
                <span className="text-slate-400 font-semibold block text-[11px]">Selection Rationale</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {forecastData.metrics?.rationale || "Evaluated on chronological train/val split."}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() => navigate(`/models/comparison?datasetId=${selectedDatasetId}`)}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
              >
                Compare Against Other Models →
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-panel p-12 text-center space-y-4 bg-slate-900/60 border border-slate-800">
          <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto">
            <LineChart className="w-7 h-7 text-blue-400" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">
              {errorMessage || `No Forecast Available for ${selectedSku || 'Product'}`}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {productList.length === 0
                ? "This dataset has no catalog products imported yet. Please verify data import or switch datasets."
                : "Execute the ML time-series pipeline to fit Naive, ARIMA, and XGBoost models on historical observations and generate 30-day demand projections."}
            </p>
          </div>
          {productList.length > 0 && selectedSku && (
            <button
              onClick={handleRunForecast}
              disabled={runningModel}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-colors"
            >
              {runningModel ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Training Time-Series Models...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Run Forecast for {selectedSku}
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

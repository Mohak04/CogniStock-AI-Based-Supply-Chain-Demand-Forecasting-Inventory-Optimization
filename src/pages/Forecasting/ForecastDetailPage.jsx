import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { ChartCard } from '../../components/common/ChartCard';
import { ForecastChart } from '../../components/forecasting/ForecastChart';
import { LoadingState } from '../../components/common/LoadingState';
import { forecastService } from '../../services/forecastService';
import { productService } from '../../services/productService';
import { LineChart, Cpu, ArrowLeft, Boxes, AlertCircle, RefreshCw } from 'lucide-react';

export const ForecastDetailPage = () => {
  const { sku } = useParams();
  const [searchParams] = useSearchParams();
  const datasetId = searchParams.get('datasetId');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState('');

  const loadData = () => {
    if (!sku) return;
    setLoading(true);
    setError('');

    Promise.all([
      productService.getProductBySku(sku, datasetId),
      forecastService.getForecastBySku(sku, 30, datasetId)
    ])
      .then(([p, f]) => {
        setProduct(p);
        setForecast(f);
      })
      .catch((err) => {
        setError(err.message || `Failed to load forecast breakdown for ${sku}.`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [sku, datasetId]);

  if (loading) {
    return <LoadingState message={`Loading forecast breakdown for ${sku}...`} />;
  }

  if (error || !product || !forecast) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`Forecast Analysis — ${sku}`}
          subtitle="Model evaluation and time-series demand trajectory."
          breadcrumbItems={[
            { label: "Forecasting", href: "/forecasts" },
            { label: "Forecasts", href: `/forecasts${datasetId ? `?datasetId=${datasetId}` : ''}` },
            { label: `${sku} Forecast Detail` }
          ]}
        />
        <div className="card-panel p-12 text-center space-y-4 bg-slate-900/60 border border-slate-800">
          <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7 text-amber-400" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">Forecast Data Unavailable</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {error || `No forecast run found for SKU '${sku}' in this dataset.`}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate(`/forecasts${datasetId ? `?datasetId=${datasetId}` : ''}`)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Forecasts
            </button>
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-md shadow-blue-900/30"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Forecasting", href: "/forecasts" },
    { label: "Forecasts", href: `/forecasts${datasetId ? `?datasetId=${datasetId}` : ''}` },
    { label: `${product.sku} Forecast Detail` }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Forecast Analysis — ${product.sku}`}
        subtitle={`${product.name} (${product.category}) · Model: ${forecast.metrics?.modelName || 'Selected Model'}`}
        breadcrumbItems={breadcrumbItems}
        actions={
          <button
            onClick={() => navigate(`/products/${product.sku}${datasetId ? `?datasetId=${datasetId}` : ''}`)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
          >
            <Boxes className="w-4 h-4" /> View Full SKU Profile & Inventory
          </button>
        }
      />

      {/* Main Forecast Chart */}
      <ChartCard
        title={`30-Day Demand Projection — ${product.name}`}
        subtitle="Visualizing historical daily sales against machine learning demand forecast."
        badgeText="Model Forecast Trajectory"
      >
        <ForecastChart data={forecast.series} sku={product.sku} height={340} />
      </ChartCard>

      {/* Deep-dive analytics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
        <div className="card-panel p-5 space-y-3">
          <h4 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">Demand Decomposition</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Demand Trend:</span>
              <span className="font-bold text-slate-200">{product.demandTrend || 'Neutral'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Variability:</span>
              <span className="font-mono text-slate-300">{product.variability || 'Moderate'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Seasonality Pattern:</span>
              <span className="text-slate-200">{product.seasonality || 'Standard'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Avg Daily Velocity:</span>
              <span className="font-mono text-blue-400 font-bold">{product.averageDailyDemand ?? 0} units/day</span>
            </div>
          </div>
        </div>

        <div className="card-panel p-5 space-y-3">
          <h4 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">Model Specifications</h4>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Model Engine:</span>
              <span className="font-bold text-blue-400">{forecast.metrics?.modelName || 'Naive Baseline'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Dataset Scope:</span>
              <span className="text-slate-300">{forecast.metrics?.datasetVersion || 'Current'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Validation sMAPE:</span>
              <span className="text-amber-400 font-bold">{forecast.metrics?.smape || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Validation MAE:</span>
              <span className="text-slate-200 font-bold">{forecast.metrics?.mae ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="card-panel p-5 space-y-3">
          <h4 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">Model Selection Rationale</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {forecast.metrics?.rationale || "Selected based on lowest validation error across candidate models."}
          </p>
        </div>
      </div>
    </div>
  );
};

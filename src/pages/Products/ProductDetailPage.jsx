import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { ChartCard } from '../../components/common/ChartCard';
import { ForecastChart } from '../../components/forecasting/ForecastChart';
import { RiskBadge } from '../../components/common/RiskBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CalculationBreakdown } from '../../components/inventory/CalculationBreakdown';
import { LoadingState } from '../../components/common/LoadingState';
import { productService } from '../../services/productService';
import { forecastService } from '../../services/forecastService';
import {
  Boxes,
  LineChart,
  Cpu,
  Calculator,
  ShieldCheck,
  Tag,
  Truck,
  DollarSign,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ProductDetailPage = () => {
  const { sku } = useParams();
  const [searchParams] = useSearchParams();
  const datasetId = searchParams.get('datasetId');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sku) return;
    setLoading(true);
    setError('');

    Promise.all([
      productService.getProductBySku(sku, datasetId),
      forecastService.getForecastBySku(sku, 30, datasetId).catch(() => null)
    ])
      .then(([p, f]) => {
        if (!p) {
          setError(`Product with SKU '${sku}' was not found.`);
        } else {
          setProduct(p);
          setForecast(f);
        }
      })
      .catch((err) => {
        setError(err.message || `Failed to load product profile for ${sku}.`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sku, datasetId]);

  if (loading) return <LoadingState message={`Loading flagship profile for ${sku}...`} />;

  if (error || !product) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`Product Profile — ${sku}`}
          subtitle="Inventory positioning and demand metrics."
          breadcrumbItems={[
            { label: "Analytics", href: "/products" },
            { label: "Products Catalog", href: `/products${datasetId ? `?datasetId=${datasetId}` : ''}` },
            { label: sku }
          ]}
        />
        <div className="card-panel p-12 text-center space-y-4 bg-slate-900/60 border border-slate-800">
          <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7 text-amber-400" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">Product Not Found</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {error || `Product '${sku}' does not exist in the active dataset.`}
            </p>
          </div>
          <button
            onClick={() => navigate(`/products${datasetId ? `?datasetId=${datasetId}` : ''}`)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center gap-2 transition-colors"
          >
            ← Return to Catalog
          </button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Analytics", href: "/products" },
    { label: "Products Catalog", href: `/products${datasetId ? `?datasetId=${datasetId}` : ''}` },
    { label: `${product.sku} — ${product.name}` }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${product.sku} — ${product.name}`}
        subtitle={`Category: ${product.category} · Lead Time: ${product.leadTimeDays ?? 14} days`}
        breadcrumbItems={breadcrumbItems}
        actions={
          <div className="flex items-center gap-2">
            <span className="data-badge-forecast">{product.modelUsed || 'Model Scoped'}</span>
            <span className="data-badge-recommendation">Inventory Analysis</span>
          </div>
        }
      />

      {/* Top Banner: Product Profile & Quick Stats */}
      <div className="card-panel p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-950/80 border border-blue-500/30 text-blue-400 font-mono font-bold text-lg">
              {product.sku}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">{product.name}</h2>
              <p className="text-xs text-slate-400 font-mono">
                Category: {product.category} · Scope: {product.datasetVersion || 'v1.0'}
              </p>
            </div>
          </div>
          <RiskBadge risk={product.riskLevel} />
        </div>

        {/* 6 Key Parameter Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] block uppercase">Current Stock</span>
            <span className="text-base font-bold text-slate-100">{product.currentStock ?? 0}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] block uppercase">On Order</span>
            <span className="text-base font-bold text-blue-400">{product.onOrder ?? 0}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] block uppercase">Lead Time</span>
            <span className="text-base font-bold text-slate-200">{product.leadTimeDays ?? 14} days</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] block uppercase">Safety Stock</span>
            <span className="text-base font-bold text-purple-400">{product.safetyStock ?? 0}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] block uppercase">Reorder Point</span>
            <span className="text-base font-bold text-amber-400">{product.reorderPoint ?? 0}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] block uppercase">Suggested Order</span>
            <span className="text-base font-bold text-emerald-400">
              {product.recommendedQty > 0 ? `+${product.recommendedQty}` : 0}
            </span>
          </div>
        </div>
      </div>

      {/* Main Forecast Chart if forecast series exists */}
      {forecast && forecast.series && forecast.series.length > 0 && (
        <ChartCard
          title={`30-Day Demand Projection — ${product.name}`}
          subtitle={`Comparing historical demand actuals vs model projections generated by ${forecast.metrics?.modelName || product.modelUsed}.`}
          badgeText="Machine Learning Series"
        >
          <ForecastChart data={forecast.series} sku={product.sku} height={340} />
        </ChartCard>
      )}

      {/* Two Column Grid: Demand Profile & Model Engine */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Demand Profile */}
        <div className="card-panel p-5 space-y-3">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
            <LineChart className="w-5 h-5 text-blue-400" />
            <span>Demand Characterization</span>
          </h3>
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

        {/* Assigned Model Info */}
        <div className="card-panel p-5 space-y-3">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <span>Assigned Machine Learning Engine</span>
          </h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Model Family:</span>
              <span className="font-bold text-blue-400">{product.modelUsed || 'Naive Baseline'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Training Scope:</span>
              <span className="text-slate-300">{product.datasetVersion || 'v1.0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Validation Error sMAPE:</span>
              <span className="text-amber-400 font-bold">{forecast?.metrics?.smape || 'Calculated on run'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Selection Rationale:</span>
              <span className="text-slate-300 font-sans truncate max-w-xs">{forecast?.metrics?.rationale || 'Chronological validation baseline'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flagship Section: Transparent Calculation Breakdown */}
      <CalculationBreakdown product={product} />

      {/* Replenishment Recommendation Banner */}
      <div className="card-panel p-6 space-y-3 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-emerald-500/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
            Automated Replenishment Directive
          </span>
          <StatusBadge status={product.recommendedQty > 0 ? 'Needs Review' : 'Healthy Posture'} />
        </div>
        <p className="text-sm font-semibold text-slate-200">
          {product.riskReason || (product.recommendedQty > 0
            ? `Reorder threshold triggered. Recommended replenishment of ${product.recommendedQty} units.`
            : `Stock level of ${product.currentStock ?? 0} units is balanced above reorder point (${product.reorderPoint ?? 0}).`)}
        </p>
      </div>
    </div>
  );
};

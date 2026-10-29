import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { ChartCard } from '../../components/common/ChartCard';
import { ForecastChart } from '../../components/forecasting/ForecastChart';
import { RiskBadge } from '../../components/common/RiskBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { DatasetSelector } from '../../components/common/DatasetSelector';
import { dashboardService } from '../../services/dashboardService';
import { datasetService } from '../../services/datasetService';
import {
  Boxes,
  TrendingUp,
  AlertTriangle,
  LineChart,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Filter,
  Eye,
  Activity,
  UploadCloud
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const DashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(searchParams.get('datasetId') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

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

  // 2. Load Dashboard Data for selectedDatasetId
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    dashboardService.getDashboardSummary(selectedDatasetId)
      .then((data) => {
        if (isMounted) {
          setDashboardData(data);
          if (data?.datasetId && !selectedDatasetId) {
            setSelectedDatasetId(data.datasetId);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load dashboard summary:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [selectedDatasetId]);

  const handleDatasetChange = (newId) => {
    setSelectedDatasetId(newId);
    setSearchParams(newId ? { datasetId: newId } : {});
  };

  if (loading && !dashboardData) {
    return <LoadingState message="Loading CogniStock executive dashboard..." />;
  }

  const breadcrumbItems = [{ label: "Overview", href: "/dashboard" }, { label: "Executive Dashboard" }];
  const currentDataset = datasets.find((d) => (d.id || d._id) === selectedDatasetId) || datasets[0];

  const stockoutCount = dashboardData?.riskDistribution?.find((r) => r.name.toLowerCase().includes('stockout'))?.value || 0;
  const overstockCount = dashboardData?.riskDistribution?.find((r) => r.name.toLowerCase().includes('overstock'))?.value || 0;

  // Filter top products by selected category
  const filteredTopProducts = (dashboardData?.topProductsAttention || []).filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview & Executive Summary"
        subtitle="Monitor demand forecasting performance, catalog inventory risk distribution, and AI recommendations."
        breadcrumbItems={breadcrumbItems}
        actions={
          <button
            onClick={() => navigate('/upload')}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-900/30"
          >
            + Upload New Dataset
          </button>
        }
      />

      {/* Dataset Selector */}
      <DatasetSelector
        datasets={datasets}
        selectedDatasetId={selectedDatasetId}
        onSelectDataset={handleDatasetChange}
      />

      {/* Onboarding Empty State if company has no datasets or products */}
      {(!dashboardData || dashboardData.hasData === false) && (
        <div className="card-panel p-8 text-center space-y-4 bg-gradient-to-br from-blue-950/40 via-slate-900 to-purple-950/30 border border-blue-500/30">
          <div className="w-12 h-12 rounded-full bg-blue-950 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">Welcome to CogniStock</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your company workspace is initialized. Upload your historical sales data in CSV or Excel format to calculate demand forecasts, evaluate models, and derive replenishment recommendations.
            </p>
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-colors"
          >
            <UploadCloud className="w-4 h-4" /> Upload Sales Dataset
          </button>
        </div>
      )}

      {dashboardData && dashboardData.hasData && (
        <>
          {/* Top Filter Bar */}
          <div className="card-panel p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-900/90">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Filter className="w-3.5 h-3.5 text-blue-400" /> Filters:
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                >
                  {(dashboardData.categories || ['All']).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? `All Categories (${dashboardData.totalSkus} SKUs)` : cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Dataset Scope:</span>
                <span className="font-mono text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  {dashboardData.datasetName} ({dashboardData.datasetVersion})
                </span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              Active Scope: <span className="text-slate-200">{dashboardData.totalSkus} Active SKUs</span>
            </div>
          </div>

          {/* 5 Executive Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard
              title="Total SKUs"
              value={dashboardData.totalSkus}
              subtitle="Active Catalog Items"
              icon={Boxes}
              badgeText="Active Scope"
              onClick={() => navigate(`/products?datasetId=${selectedDatasetId}`)}
            />
            <MetricCard
              title="Sales Volume"
              value={dashboardData.historicalSalesVolume}
              subtitle="Historical Demand Sum"
              icon={TrendingUp}
              badgeText="Dataset Volume"
            />
            <MetricCard
              title="Products at Risk"
              value={dashboardData.productsAtRiskCount}
              subtitle={`${stockoutCount} Stockout · ${overstockCount} Overstock`}
              icon={AlertTriangle}
              trend="down"
              trendValue={`${Math.round((dashboardData.productsAtRiskCount / Math.max(1, dashboardData.totalSkus)) * 100)}% Risk Ratio`}
              badgeText="Risk Thresholds"
              onClick={() => navigate(`/inventory?datasetId=${selectedDatasetId}`)}
            />
            <MetricCard
              title="Forecast Coverage"
              value={dashboardData.forecastCoverage}
              subtitle="Naive, ARIMA & XGBoost"
              icon={LineChart}
              badgeText="Pipeline Status"
              onClick={() => navigate(`/forecasts?datasetId=${selectedDatasetId}`)}
            />
            <MetricCard
              title="Pending Recs"
              value={dashboardData.pendingRecommendationsCount}
              subtitle="Requires Human Action"
              icon={CheckSquare}
              badgeText="Needs Review"
              onClick={() => navigate(`/recommendations?datasetId=${selectedDatasetId}`)}
            />
          </div>

          {/* Main Grid: Forecast Line Chart (Left 2 cols) & Risk Donut (Right 1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartCard
                title={`Demand Trajectory — ${dashboardData.primarySku || 'Primary SKU'}`}
                subtitle={`Displaying historical sales and projections for ${dashboardData.primaryProductName || dashboardData.primarySku || 'flagship product'}.`}
                badgeText="Time Series Analytics"
              >
                {dashboardData.timeSeriesChartData && dashboardData.timeSeriesChartData.length > 0 ? (
                  <ForecastChart
                    data={dashboardData.timeSeriesChartData}
                    sku={dashboardData.primarySku || 'SKU'}
                    height={310}
                  />
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
                    <LineChart className="w-8 h-8 text-slate-600" />
                    <p className="text-xs">No forecast trajectory calculated yet for this dataset.</p>
                  </div>
                )}
              </ChartCard>
            </div>

            <div>
              <ChartCard
                title="Inventory Risk Distribution"
                subtitle="Catalog risk breakdown by current stock posture vs reorder thresholds."
                badgeText="Inventory Posture"
              >
                <div className="h-64 flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {dashboardData.riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
                  {dashboardData.riskDistribution.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-300 font-sans">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-200">{item.value} SKUs</span>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </div>
          </div>

          {/* Grid: Top Attention SKUs Table & AI Insights Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Attention Table (2 cols) */}
            <div className="lg:col-span-2 card-panel p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Top Products Requiring Attention</h3>
                  <p className="text-xs text-slate-400">SKUs displaying stockout or replenishment needs in {dashboardData.datasetName}.</p>
                </div>
                <button
                  onClick={() => navigate(`/products?datasetId=${selectedDatasetId}`)}
                  className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1 font-mono"
                >
                  View All {dashboardData.totalSkus} SKUs →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3">SKU / Product</th>
                      <th className="p-3">Current Stock</th>
                      <th className="p-3">Forecast 30d</th>
                      <th className="p-3">Risk Level</th>
                      <th className="p-3">Recommended Order</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredTopProducts.map((p) => (
                      <tr key={p.sku} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3">
                          <span className="font-bold text-slate-200 font-mono block">{p.sku}</span>
                          <span className="text-slate-400 text-[11px] truncate block max-w-xs">{p.name}</span>
                        </td>
                        <td className="p-3 font-mono font-semibold text-slate-200">{p.currentStock}</td>
                        <td className="p-3 font-mono text-amber-400 font-semibold">{p.forecastDemand30d}</td>
                        <td className="p-3">
                          <RiskBadge risk={p.riskLevel} />
                        </td>
                        <td className="p-3 font-mono">
                          {p.recommendedQty > 0 ? (
                            <span className="text-blue-400 font-bold">+{p.recommendedQty} units</span>
                          ) : (
                            <span className="text-slate-500">0</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => navigate(`/products/${p.sku}?datasetId=${selectedDatasetId}`)}
                            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors inline-flex items-center gap-1 font-semibold text-[11px]"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-400" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredTopProducts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-500 font-mono text-xs">
                          No products flagged for attention under selected category.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Strategic Insights Card (1 col) */}
            <div className="card-panel p-5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <h3 className="text-base font-bold text-slate-100">AI Inventory Insights</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30">
                    Calculated Signals
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {dashboardData.prototypeInsights?.map((ins) => (
                    <div
                      key={ins.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          {ins.title}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">{ins.sku}</span>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">{ins.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => navigate(`/recommendations?datasetId=${selectedDatasetId}`)}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/30"
                >
                  Review All Recommendations <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

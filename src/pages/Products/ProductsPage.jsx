import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { RiskBadge } from '../../components/common/RiskBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { DatasetSelector } from '../../components/common/DatasetSelector';
import { productService } from '../../services/productService';
import { datasetService } from '../../services/datasetService';
import { PackageSearch, Filter, Eye } from 'lucide-react';

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(searchParams.get('datasetId') || '');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  // 1. Load datasets
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

  // 2. Load products scoped to selectedDatasetId
  useEffect(() => {
    if (!selectedDatasetId) return;
    setLoading(true);
    productService.getProducts({
      datasetId: selectedDatasetId,
      category: categoryFilter,
      riskLevel: riskFilter
    })
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        console.error('Failed to load products:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedDatasetId, categoryFilter, riskFilter]);

  const handleDatasetChange = (newId) => {
    setSelectedDatasetId(newId);
    setSearchParams(newId ? { datasetId: newId } : {});
  };

  if (loading && !products.length) return <LoadingState message="Loading catalog product list..." />;

  const columns = [
    {
      header: "SKU / Product",
      accessor: "sku",
      cell: (row) => (
        <div>
          <span className="font-bold text-slate-100 font-mono text-xs">{row.sku}</span>
          <span className="text-slate-300 text-xs block">{row.name}</span>
        </div>
      )
    },
    {
      header: "Category",
      accessor: "category",
      cell: (row) => <span className="text-xs text-slate-400">{row.category}</span>
    },
    {
      header: "Demand Trend",
      accessor: "demandTrend",
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-blue-400">
          {row.demandTrend || 'Neutral'}
        </span>
      )
    },
    {
      header: "Current Stock",
      accessor: "currentStock",
      cell: (row) => <span className="font-mono text-slate-200 font-bold">{row.currentStock}</span>
    },
    {
      header: "Forecast 30d",
      accessor: "forecastDemand30d",
      cell: (row) => <span className="font-mono text-amber-400 font-bold">{row.forecastDemand30d || 0}</span>
    },
    {
      header: "Risk Level",
      accessor: "riskLevel",
      cell: (row) => <RiskBadge risk={row.riskLevel} />
    },
    {
      header: "Assigned Model",
      accessor: "modelUsed",
      cell: (row) => <span className="font-mono text-[11px] text-slate-400">{row.modelUsed || 'Naive Baseline'}</span>
    },
    {
      header: "Actions",
      accessor: "actions",
      sortable: false,
      align: "right",
      cell: (row) => (
        <button
          onClick={() => navigate(`/products/${row.sku}?datasetId=${selectedDatasetId}`)}
          className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center gap-1 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> Product Profile
        </button>
      )
    }
  ];

  // Derive unique categories from products
  const availableCategories = Array.from(new Set(['All', ...products.map((p) => p.category).filter(Boolean)]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products Catalog & Demand Profiles"
        subtitle="Search catalog items, review demand trends, forecast metrics, and inventory positions."
        breadcrumbItems={[{ label: "Analytics", href: "/products" }, { label: "Products Catalog" }]}
      />

      {/* Dataset Selector */}
      <DatasetSelector
        datasets={datasets}
        selectedDatasetId={selectedDatasetId}
        onSelectDataset={handleDatasetChange}
      />

      {/* Filter Bar */}
      <div className="card-panel p-3.5 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-400" /> Filters:
          </span>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none"
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none"
            >
              <option value="All">All Risk Levels</option>
              <option value="High Risk">Stockout / High Risk</option>
              <option value="Medium Risk">Medium Risk</option>
              <option value="Overstock">Overstock</option>
              <option value="Low Risk">Healthy / Low Risk</option>
            </select>
          </div>
        </div>

        <span className="font-mono text-[11px] text-slate-400">
          Showing {products.length} Products
        </span>
      </div>

      <DataTable
        columns={columns}
        data={products}
        searchPlaceholder="Search products by SKU or product name..."
        onRowClick={(row) => navigate(`/products/${row.sku}?datasetId=${selectedDatasetId}`)}
      />
    </div>
  );
};

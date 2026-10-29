import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { DataTable } from '../../components/common/DataTable';
import { RiskBadge } from '../../components/common/RiskBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { DatasetSelector } from '../../components/common/DatasetSelector';
import { inventoryService } from '../../services/inventoryService';
import { Boxes, ShieldAlert, AlertTriangle, CheckSquare, Eye, Calculator, UploadCloud, CheckCircle2 } from 'lucide-react';

export const InventoryPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState(null);
  const [selectedDatasetId, setSelectedDatasetId] = useState('');

  const fetchInventory = async (datasetId = '') => {
    setLoading(true);
    try {
      const data = await inventoryService.getInventoryOverview(datasetId);
      setInventoryData(data);
      if (data?.datasetId && !selectedDatasetId) {
        setSelectedDatasetId(data.datasetId);
      }
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(selectedDatasetId);
  }, [selectedDatasetId]);

  if (loading || !inventoryData) return <LoadingState message="Calculating prototype inventory positions..." />;

  const columns = [
    {
      header: "SKU / Product",
      accessor: "sku",
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-100 font-mono">{row.sku}</div>
          <div className="text-slate-400 text-[11px] truncate max-w-[140px]">{row.name}</div>
        </div>
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
      cell: (row) => <span className="font-mono text-amber-400 font-bold">{row.forecastDemand30d}</span>
    },
    {
      header: "Lead Time",
      accessor: "leadTimeDays",
      cell: (row) => <span className="font-mono text-slate-300">{row.leadTimeDays} days</span>
    },
    {
      header: "Safety Stock",
      accessor: "safetyStock",
      cell: (row) => <span className="font-mono text-purple-400">{row.safetyStock}</span>
    },
    {
      header: "Reorder Point",
      accessor: "reorderPoint",
      cell: (row) => <span className="font-mono text-purple-300 font-bold">{row.reorderPoint}</span>
    },
    {
      header: "Net Position",
      accessor: "inventoryPosition",
      cell: (row) => <span className="font-mono text-slate-100 font-bold">{row.inventoryPosition}</span>
    },
    {
      header: "Recommended Order",
      accessor: "recommendedQty",
      cell: (row) => (
        <span className={`font-mono font-bold ${row.recommendedQty > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
          {row.recommendedQty} units
        </span>
      )
    },
    {
      header: "Risk Status",
      accessor: "riskLevel",
      cell: (row) => <RiskBadge risk={row.riskLevel} />
    },
    {
      header: "Action",
      accessor: "actions",
      sortable: false,
      align: "right",
      cell: (row) => (
        <button
          onClick={() => navigate(`/products/${row.sku}${selectedDatasetId ? `?datasetId=${selectedDatasetId}` : ''}`)}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1 transition-colors border border-slate-700"
        >
          <Eye className="w-3 h-3" /> Breakdown
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Intelligence Workspace"
        subtitle="Monitor safety stock thresholds, reorder point calculations, and stockout risk classifications."
        breadcrumbItems={[{ label: "Inventory / Inventory Intelligence" }]}
        actions={
          <button
            onClick={() => navigate(`/recommendations${selectedDatasetId ? `?datasetId=${selectedDatasetId}` : ''}`)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-900/30"
          >
            <CheckSquare className="w-4 h-4" /> View Replenishment Queue
          </button>
        }
      />

      {/* Dataset Selector Bar */}
      <DatasetSelector
        datasets={inventoryData.datasets || []}
        selectedDatasetId={selectedDatasetId || inventoryData.datasetId}
        onSelectDataset={(newId) => setSelectedDatasetId(newId)}
      />

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total SKUs"
          value={inventoryData.summary?.totalSkus ?? 0}
          subtitle="Catalog Inventory Scope"
          icon={Boxes}
          badgeText={inventoryData.datasetName || "Catalog Scope"}
        />
        <MetricCard
          title="Stockout Risk"
          value={inventoryData.summary?.stockoutRiskCount ?? 0}
          subtitle="Position below ROP"
          icon={ShieldAlert}
          badgeText="Critical Flag"
        />
        <MetricCard
          title="Overstock Risk"
          value={inventoryData.summary?.overstockRiskCount ?? 0}
          subtitle="Excess Holding Capital"
          icon={AlertTriangle}
          badgeText="Warning Flag"
        />
        <MetricCard
          title="Replenishment Candidates"
          value={inventoryData.summary?.replenishmentCandidates ?? 0}
          subtitle="Triggered Reorder Queue"
          icon={CheckSquare}
          badgeText="Needs Action"
        />
      </div>

      {/* Main Inventory Intelligence Table or Empty State */}
      {inventoryData.items && inventoryData.items.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-purple-400" />
              <span>Catalog Inventory Posture & Calculation Matrix</span>
            </h3>
            <span className="text-xs font-mono text-purple-400 bg-purple-950 px-2.5 py-1 rounded border border-purple-500/30">
              {inventoryData.datasetName} · {inventoryData.datasetVersion}
            </span>
          </div>

          <DataTable
            columns={columns}
            data={inventoryData.items}
            searchPlaceholder="Search inventory by SKU or product name..."
          />
        </div>
      ) : (
        <div className="card-panel p-12 text-center space-y-4 bg-slate-900/60 border border-slate-800">
          <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto">
            <Boxes className="w-7 h-7 text-slate-400" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-slate-100">No Inventory Items in Dataset</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This selected dataset does not have any product records with mapped stock, lead times, or sales history.
            </p>
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <UploadCloud className="w-4 h-4" /> Upload New Sales Dataset
          </button>
        </div>
      )}
    </div>
  );
};

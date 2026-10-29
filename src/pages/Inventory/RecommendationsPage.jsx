import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { RecommendationCard } from '../../components/inventory/RecommendationCard';
import { Modal } from '../../components/common/Modal';
import { CalculationBreakdown } from '../../components/inventory/CalculationBreakdown';
import { LoadingState } from '../../components/common/LoadingState';
import { DatasetSelector } from '../../components/common/DatasetSelector';
import { inventoryService } from '../../services/inventoryService';
import { productService } from '../../services/productService';
import { CheckSquare, ShieldAlert, Filter, CheckCircle2, Boxes } from 'lucide-react';

export const RecommendationsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(searchParams.get('datasetId') || '');
  const [currentDatasetName, setCurrentDatasetName] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [inspectProduct, setInspectProduct] = useState(null);

  const fetchRecommendations = async (pFilter, dId) => {
    setLoading(true);
    try {
      const res = await inventoryService.getRecommendations(pFilter, dId);
      if (res?.data) {
        setRecommendations(res.data);
        if (res.datasets) setDatasets(res.datasets);
        if (res.datasetName) setCurrentDatasetName(res.datasetName);
        if (res.datasetId && !selectedDatasetId) setSelectedDatasetId(res.datasetId);
      } else if (Array.isArray(res)) {
        setRecommendations(res);
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(priorityFilter, selectedDatasetId);
  }, [priorityFilter, selectedDatasetId]);

  const handleDatasetChange = (newId) => {
    setSelectedDatasetId(newId);
    setSearchParams(newId ? { datasetId: newId } : {});
  };

  const handleStatusChange = async (recId, newStatus) => {
    await inventoryService.updateRecommendationStatus(recId, newStatus);
    setRecommendations((prev) =>
      prev.map((r) => (r.id === recId ? { ...r, status: newStatus } : r))
    );
  };

  const handleInspectDetails = async (rec) => {
    const fullProduct = await productService.getProductBySku(rec.sku);
    setInspectProduct(fullProduct);
  };

  if (loading && recommendations.length === 0 && datasets.length === 0) {
    return <LoadingState message="Loading replenishment recommendation queue..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Replenishment Recommendation Queue"
        subtitle="Review AI-driven reorder quantity proposals. All final procurement actions require human officer approval."
        breadcrumbItems={[{ label: "Inventory", href: "/inventory" }, { label: "Recommendations" }]}
      />

      {/* Dataset Selector Bar */}
      <DatasetSelector
        datasets={datasets}
        selectedDatasetId={selectedDatasetId}
        onSelectDataset={handleDatasetChange}
      />

      {/* Priority Filter Bar */}
      <div className="card-panel p-3.5 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-400" /> Filter Priority:
          </span>
          <div className="flex items-center gap-1.5">
            {['All', 'High Priority', 'Medium Priority', 'Normal'].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  priorityFilter === p
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <span className="font-mono text-[11px] text-slate-400">
          Showing {recommendations.length} Queue Items
        </span>
      </div>

      {/* Recommendations Cards List or Healthy Empty State */}
      {recommendations.length === 0 ? (
        <div className="card-panel p-12 text-center space-y-4 bg-slate-900/60 border border-slate-800">
          <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-slate-100">All Products Healthy & Stocked</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No replenishment orders required for <span className="text-slate-200 font-semibold">{currentDatasetName || 'this dataset'}</span>. Every catalog item currently maintains an inventory position safely above its Reorder Point (<span className="font-mono text-purple-300">ROP</span>).
            </p>
          </div>
          <button
            onClick={() => navigate(`/inventory${selectedDatasetId ? `?datasetId=${selectedDatasetId}` : ''}`)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-2 transition-colors border border-slate-700"
          >
            <Boxes className="w-4 h-4 text-purple-400" /> View Catalog Inventory Postures →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onStatusChange={handleStatusChange}
              onViewDetails={handleInspectDetails}
            />
          ))}
        </div>
      )}

      {/* Detail Calculation Modal */}
      {inspectProduct && (
        <Modal
          isOpen={!!inspectProduct}
          onClose={() => setInspectProduct(null)}
          title={`Transparent Formula Breakdown — ${inspectProduct.sku}`}
          maxWidth="max-w-2xl"
        >
          <CalculationBreakdown product={inspectProduct} />
        </Modal>
      )}
    </div>
  );
};

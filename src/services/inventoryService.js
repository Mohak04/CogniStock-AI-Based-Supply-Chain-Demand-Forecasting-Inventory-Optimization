import api from './api';

export const inventoryService = {
  getInventoryOverview: async (datasetId) => {
    const url = datasetId ? `/inventory/overview?datasetId=${encodeURIComponent(datasetId)}` : '/inventory/overview';
    const res = await api.get(url);
    return res.data?.data;
  },

  getRecommendations: async (priorityFilter = 'All', datasetId = null) => {
    const params = new URLSearchParams();
    if (priorityFilter && priorityFilter !== 'All') params.set('priority', priorityFilter);
    if (datasetId) params.set('datasetId', datasetId);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await api.get(`/recommendations${query}`);
    return res.data;
  },

  updateRecommendationStatus: async (recId, newStatus, notes = '') => {
    const res = await api.patch(`/recommendations/${recId}/status`, {
      status: newStatus,
      notes
    });
    return res.data;
  },

  updateProductInventory: async (sku, data) => {
    const res = await api.patch(`/inventory/products/${sku}`, data);
    return res.data?.product;
  }
};

import api from './api';

export const productService = {
  getProducts: async (filters = {}) => {
    const params = {};
    if (filters.datasetId && filters.datasetId !== 'all') params.datasetId = filters.datasetId;
    if (filters.category && filters.category !== 'All') params.category = filters.category;
    if (filters.riskLevel && filters.riskLevel !== 'All') params.riskLevel = filters.riskLevel;
    if (filters.search) params.search = filters.search;

    const res = await api.get('/products', { params });
    return res.data?.data || [];
  },

  getProductBySku: async (sku, datasetId = null) => {
    let url = `/products/${sku}`;
    if (datasetId) {
      url += `?datasetId=${encodeURIComponent(datasetId)}`;
    }
    const res = await api.get(url);
    return res.data?.data;
  }
};

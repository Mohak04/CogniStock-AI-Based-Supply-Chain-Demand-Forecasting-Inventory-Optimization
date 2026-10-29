import api from './api';

export const datasetService = {
  getDatasets: async () => {
    const res = await api.get('/datasets');
    return res.data?.data || [];
  },

  getDatasetById: async (id) => {
    const res = await api.get(`/datasets/${id}`);
    return res.data?.data;
  },

  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data?.data;
  },

  validateDataset: async ({ tempFilePath, mapping, frequencyOverride }) => {
    const res = await api.post('/datasets/validate', {
      tempFilePath,
      mapping,
      frequencyOverride
    });
    return res.data?.data;
  },

  confirmImport: async ({ tempFilePath, fileName, mapping, validationResult }) => {
    const res = await api.post('/datasets/import', {
      tempFilePath,
      fileName,
      mapping,
      validationResult
    });
    return res.data?.dataset;
  },

  uploadDataset: async (payload) => {
    // Legacy helper fallback if called directly
    return payload;
  },

  getDataQuality: async (datasetId) => {
    const url = datasetId ? `/datasets/quality?datasetId=${datasetId}` : '/datasets/quality';
    const res = await api.get(url);
    return res.data;
  },

  archiveDataset: async (id) => {
    const res = await api.patch(`/datasets/${id}/archive`);
    return res.data;
  }
};

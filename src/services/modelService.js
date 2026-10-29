import api from './api';

export const modelService = {
  getModelComparison: async (datasetId) => {
    const url = datasetId ? `/forecasts/comparison?datasetId=${encodeURIComponent(datasetId)}` : '/forecasts/comparison';
    const res = await api.get(url);
    return res.data;
  },

  runModelEvaluation: async (datasetId, horizon = 30) => {
    const res = await api.post('/forecasts/generate', { datasetId, horizon });
    return res.data;
  }
};

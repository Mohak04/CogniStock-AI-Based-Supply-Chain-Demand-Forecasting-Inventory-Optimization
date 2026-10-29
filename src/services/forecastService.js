import api from './api';

export const forecastService = {
  getForecastBySku: async (sku = "SKU-101", horizonDays = 30, datasetId = null) => {
    let url = `/forecasts/sku/${sku}?horizon=${horizonDays}`;
    if (datasetId) {
      url += `&datasetId=${encodeURIComponent(datasetId)}`;
    }
    const res = await api.get(url);
    return res.data?.data;
  },

  generateForecast: async (params) => {
    const res = await api.post('/forecasts/runs', params);
    return res.data;
  }
};

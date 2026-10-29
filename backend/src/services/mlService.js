const axios = require('axios');
const env = require('../config/env');

const mlClient = axios.create({
  baseURL: `${env.ML_SERVICE_URL}/api/v1/ml`,
  timeout: 120000, // 2 minutes max for model fitting
  headers: {
    'Content-Type': 'application/json'
  }
});

const mlService = {
  healthCheck: async () => {
    try {
      const res = await mlClient.get('/health');
      return res.data;
    } catch (err) {
      console.warn('[ML Service] Health check failed:', err.message);
      return { status: 'offline', error: err.message };
    }
  },

  validateDataset: async (records, mapping, frequencyOverride = null) => {
    try {
      const res = await mlClient.post('/validate', {
        records,
        mapping,
        frequencyOverride
      });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message;
      throw new Error(`ML Validation Service Error: ${msg}`);
    }
  },

  generateForecast: async ({ sku, records, horizon = 30, frequency = 'Daily', datasetVersion = 'v1.0', modelPreference = null }) => {
    try {
      const res = await mlClient.post('/forecast', {
        sku,
        records,
        horizon,
        frequency,
        datasetVersion,
        modelPreference
      });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message;
      throw new Error(`ML Forecasting Service Error: ${msg}`);
    }
  },

  calculateInventory: async (params) => {
    try {
      const res = await mlClient.post('/inventory', params);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message;
      throw new Error(`ML Inventory Service Error: ${msg}`);
    }
  }
};

module.exports = mlService;

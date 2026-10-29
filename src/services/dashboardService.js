import api from './api';

export const dashboardService = {
  getDashboardSummary: async (datasetId = null) => {
    let url = '/dashboard/summary';
    if (datasetId) {
      url += `?datasetId=${encodeURIComponent(datasetId)}`;
    }
    const res = await api.get(url);
    return res.data;
  }
};

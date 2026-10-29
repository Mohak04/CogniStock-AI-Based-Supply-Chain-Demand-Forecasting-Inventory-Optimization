import api from './api';

export const reportService = {
  getReports: async (datasetId) => {
    const url = datasetId ? `/reports?datasetId=${encodeURIComponent(datasetId)}` : '/reports';
    const res = await api.get(url);
    return res.data;
  },

  getReportById: async (id) => {
    const res = await api.get(`/reports/${id}`);
    return res.data?.data;
  },

  generateReport: async (reportConfig) => {
    const res = await api.post('/reports', reportConfig);
    return res.data?.data;
  },

  downloadReport: async (reportId, filename = 'CogniStock_Report.pdf') => {
    const res = await api.get(`/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

import api from './api';

export const settingsService = {
  getSettings: async () => {
    const res = await api.get('/settings');
    return res.data?.settings;
  },

  updateSettings: async (settingsData) => {
    const res = await api.patch('/settings', settingsData);
    return res.data?.settings;
  },

  getCompany: async () => {
    const res = await api.get('/company');
    return res.data?.company;
  },

  updateCompany: async (companyData) => {
    const res = await api.patch('/company', companyData);
    return res.data?.company;
  }
};

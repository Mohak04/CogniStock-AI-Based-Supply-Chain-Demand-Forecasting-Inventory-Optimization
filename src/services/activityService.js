import api from './api';

export const activityService = {
  getActivity: async () => {
    const res = await api.get('/activity');
    return res.data?.data || [];
  }
};

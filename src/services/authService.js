import api from './api';

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.token) {
      localStorage.setItem('cognistock_token', res.data.token);
      localStorage.setItem('cognistock_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data?.token) {
      localStorage.setItem('cognistock_token', res.data.token);
      localStorage.setItem('cognistock_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    if (res.data?.user) {
      localStorage.setItem('cognistock_user', JSON.stringify(res.data.user));
    }
    return res.data?.user;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('cognistock_token');
      localStorage.removeItem('cognistock_user');
      window.location.href = '/login';
    }
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('cognistock_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('cognistock_token');
  }
};

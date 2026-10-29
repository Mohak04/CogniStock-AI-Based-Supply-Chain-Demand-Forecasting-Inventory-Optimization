import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cognistock_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 session expiry & normalize errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear expired session and redirect to login
      localStorage.removeItem('cognistock_token');
      localStorage.removeItem('cognistock_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/landing' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }

    const message = error.response?.data?.message || error.message || 'Network request failed';
    console.error('[CogniStock API Error]', message);
    return Promise.reject(new Error(message));
  }
);

export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!path.startsWith('/login') && !path.startsWith('/signup')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error) {
  const data = error.response?.data;
  if (!data) return error.message || 'Request failed';
  if (typeof data.error === 'string') {
    if (Array.isArray(data.details) && data.details.length) {
      return `${data.error}: ${data.details.join(', ')}`;
    }
    return data.error;
  }
  return 'Request failed';
}

export default api;

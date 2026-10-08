import axios from 'axios';

const apiURL = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_API_URL : 'http://localhost:3000/api';

const api = axios.create({
  baseURL: apiURL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

import { useAuthStore } from '../stores/auth';

// Request interceptor to add the token
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers['x-token'] = authStore.token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

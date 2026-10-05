import axios from 'axios';

const apiURL = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_API_URL : 'https://proyecto-autos-six.vercel.app/api';

const api = axios.create({
  baseURL: apiURL || 'https://proyecto-autos-six.vercel.app/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add the token
api.interceptors.request.use(
  (config) => {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['x-token'] = token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

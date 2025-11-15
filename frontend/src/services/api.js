// client/src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Mentions API
export const mentionsAPI = {
  getAll: (params) => api.get('/mentions', { params }),
  getById: (id) => api.get(`/mentions/${id}`),
};

// Stats API
export const statsAPI = {
  getBrandStats: (brand, timeframe = '24h') => 
    api.get('/stats', { params: { brand, timeframe } }),
  
  getOverview: (timeframe = '24h') => 
    api.get('/stats/overview', { params: { timeframe } }),
  
  getSourcesComparison: (timeframe = '24h') => 
    api.get('/stats/sources-comparison', { params: { timeframe } }),
};

// Spikes API
export const spikesAPI = {
  getCurrent: (brand) => api.get('/spikes', { params: { brand } }),
  getHistory: (brand, days = 7) => 
    api.get('/spikes/history', { params: { brand, days } }),
};

// Brands API
export const brandsAPI = {
  getAll: () => api.get('/brands'),
  add: (brand) => api.post('/brands', { brand }),
  remove: (brand) => api.delete(`/brands/${brand}`),
  triggerCollection: (brand) => api.post(`/collect/${brand}`),
};

// Overview API
export const overviewAPI = {
  getAll: () => api.get('/overview'),
};

// Topics API
export const topicsAPI = {
  getTopics: (brand, timeframe = '24h', limit = 20) => 
    api.get('/topics', { params: { brand, timeframe, limit } }),
  
  getTrending: (brand, limit = 10) =>
    api.get('/topics/trending', { params: { brand, limit } }),
  
  getClusters: (brand, timeframe = '24h', limit = 10) =>
    api.get('/topics/clusters', { params: { brand, timeframe, limit } }),
  
  getTimeline: (brand, keyword, hours = 24) =>
    api.get(`/topics/timeline/${keyword}`, { params: { brand, hours } }),
  
  getComparison: (timeframe = '24h') =>
    api.get('/topics/compare', { params: { timeframe } }),
};

export default api;
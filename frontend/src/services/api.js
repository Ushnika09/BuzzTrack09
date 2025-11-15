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
  getActive: () => api.get('/spikes/active'),
  getOverview: () => api.get('/spikes/overview'),
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

// Topics API - Updated to match backend routes
export const topicsAPI = {
  // Get trending topics across all brands
  getTrending: (timeframe = '24h', limit = 10) =>
    api.get('/topics/trending', { params: { timeframe, limit } }),
  
  // Get topics for a specific brand
  getBrandTopics: (brand, timeframe = '24h', limit = 15) =>
    api.get(`/topics/brand/${brand}`, { params: { timeframe, limit } }),
  
  // Get clustered mentions by topic
  getClusters: (brand, timeframe = '24h') =>
    api.get('/topics/clusters', { params: { brand, timeframe } }),
  
  // Get topic timeline for a brand
  getTimeline: (brand, days = 7) =>
    api.get('/topics/timeline', { params: { brand, days } }),
  
  // Compare topics across multiple brands
  getComparison: (brands, timeframe = '24h') =>
    api.get('/topics/comparison', { params: { brands: brands?.join(','), timeframe } }),
};

// Debug API (remove in production)
export const debugAPI = {
  getSources: (brand, timeframe) => 
    api.get(`/debug/sources/${brand}`, { params: { timeframe } }),
};

export default api;
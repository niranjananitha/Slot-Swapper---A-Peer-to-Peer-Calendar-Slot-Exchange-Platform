import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const auth = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data)
};

// Events API
export const events = {
  getMyEvents: () => api.get('/events/my-events'),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  updateStatus: (id, status) => api.patch(`/events/${id}/status`, { status }),
  delete: (id) => api.delete(`/events/${id}`)
};

// Swaps API
export const swaps = {
  getSwappableSlots: () => api.get('/swaps/swappable-slots'),
  requestSwap: (data) => api.post('/swaps/swap-request', data),
  respondToSwap: (requestId, accept) => 
    api.post(`/swaps/swap-response/${requestId}`, { accept }),
  getIncomingRequests: () => api.get('/swaps/incoming-requests'),
  getOutgoingRequests: () => api.get('/swaps/outgoing-requests')
};

export default api;
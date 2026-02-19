import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
});

export const tripService = {
    getAll: () => api.get('/trips'),
    create: (data) => api.post('/trips', data), // Should be POST but following user's structure if needed, actually POST is standard
    getById: (id) => api.get(`/trips/${id}`),
    addMember: (tripId, data) => api.post(`/trips/${tripId}/members`, data),
    getExpenses: (tripId) => api.get(`/trips/${tripId}/expenses`),
    addExpense: (tripId, data) => api.post(`/trips/${tripId}/expenses`, data),
    getSettlements: (tripId) => api.get(`/trips/${tripId}/settlements`),
    delete: (id) => api.delete(`/trips/${id}`),
};

export default api;

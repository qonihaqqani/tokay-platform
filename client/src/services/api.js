import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export default {
  // Auth
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyPhone: (data) => api.post('/auth/verify-phone', data),
  getProfile: () => api.get('/auth/profile'),
  
  // Emergency Fund
  getEmergencyFund: () => api.get('/emergency-fund'),
  updateContribution: (data) => api.put('/emergency-fund/contribution', data),
  contribute: (data) => api.post('/emergency-fund/contribute', data),
  getTransactions: (params) => api.get('/emergency-fund/transactions', { params }),
  getRecommendations: () => api.get('/emergency-fund/recommendations'),
  
  // Risk Assessment
  getCurrentRisk: (businessId) => api.get(`/risk/current/${businessId}`),
  getRiskAssessments: (params) => api.get('/risk', { params }),
  runRiskAnalysis: (businessId) => api.post(`/risk/analyze/${businessId}`),
  getRiskHistory: (businessId, params) => api.get(`/risk/history/${businessId}`, { params }),
  getRecommendations: (businessId) => api.get(`/risk/recommendations/${businessId}`),
  getLocationRisks: (businessId) => api.get(`/risk/location/${businessId}`),
  
  // Invoices
  getInvoices: (params) => api.get('/invoices', { params }),
  getInvoice: (id) => api.get(`/invoices/${id}`),
  createInvoice: (data) => api.post('/invoices', data),
  updateInvoice: (id, data) => api.put(`/invoices/${id}`, data),
  deleteInvoice: (id) => api.delete(`/invoices/${id}`),
  submitToLHDN: (id) => api.post(`/invoices/${id}/submit-lhdn`),
  generatePDF: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
  sendInvoice: (id, data) => api.post(`/invoices/${id}/send`, data),
  
  // Receipts
  getReceipts: (params) => api.get('/receipts', { params }),
  uploadReceipt: (formData) => api.post('/receipts/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  analyzeReceipt: (id) => api.post(`/receipts/${id}/analyze`),
  
  // Alerts
  getAlerts: (params) => api.get('/alerts', { params }),
  markAlertAsRead: (id) => api.put(`/alerts/${id}/read`),
  
  // Reports
  getReports: (params) => api.get('/reports', { params }),
  generateReport: (type, params) => api.post(`/reports/generate/${type}`, params),
  
  // Payments
  getPaymentMethods: () => api.get('/payments/methods'),
  processPayment: (data) => api.post('/payments/process', data),
  
  // Generic get method for demo purposes
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  delete: (url, config) => api.delete(url, config),
};
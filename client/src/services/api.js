import axios from 'axios';
import toast from 'react-hot-toast';

// Create base API instance
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
    const token = localStorage.getItem('tokay_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('tokay_token');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
          break;
        case 403:
          toast.error('Access denied. You do not have permission to perform this action.');
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(data.message || 'An error occurred.');
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your internet connection.');
    } else {
      // Other error
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

// API service endpoints
export const authAPI = api;
export const businessAPI = api;
export const riskAPI = api;
export const alertAPI = api;
export const emergencyFundAPI = api;
export const reportAPI = api;
export const paymentAPI = api;
export const userAPI = api;

// Specific API methods for different services

// Authentication API methods
export const authService = {
  login: (credentials) => authAPI.post('/auth/login', credentials),
  register: (userData) => authAPI.post('/auth/register', userData),
  verifyPhone: (data) => authAPI.post('/auth/verify-phone', data),
  resendVerification: (phoneNumber) => authAPI.post('/auth/resend-verification', { phoneNumber }),
  setPassword: (password) => authAPI.post('/auth/set-password', { password }),
  getProfile: () => authAPI.get('/auth/profile'),
};

// Business API methods
export const businessService = {
  getBusinesses: () => businessAPI.get('/businesses'),
  getBusiness: (id) => businessAPI.get(`/businesses/${id}`),
  createBusiness: (data) => businessAPI.post('/businesses', data),
  updateBusiness: (id, data) => businessAPI.put(`/businesses/${id}`, data),
  deleteBusiness: (id) => businessAPI.delete(`/businesses/${id}`),
  getBusinessMetrics: (id) => businessAPI.get(`/businesses/${id}/metrics`),
};

// Risk Assessment API methods
export const riskService = {
  getRiskAssessments: (businessId) => riskAPI.get(`/risk?businessId=${businessId}`),
  getRiskAssessment: (id) => riskAPI.get(`/risk/${id}`),
  createRiskAssessment: (data) => riskAPI.post('/risk', data),
  updateRiskAssessment: (id, data) => riskAPI.put(`/risk/${id}`, data),
  deleteRiskAssessment: (id) => riskAPI.delete(`/risk/${id}`),
  getCurrentRiskLevel: (businessId) => riskAPI.get(`/risk/current/${businessId}`),
  getRiskHistory: (businessId, period) => riskAPI.get(`/risk/history/${businessId}?period=${period}`),
  runRiskAnalysis: (businessId) => riskAPI.post(`/risk/analyze/${businessId}`),
  getMitigationRecommendations: (businessId) => riskAPI.get(`/risk/recommendations/${businessId}`),
};

// Alerts API methods
export const alertService = {
  getAlerts: (businessId, filters = {}) => {
    const params = new URLSearchParams(filters);
    return alertAPI.get(`/alerts?businessId=${businessId}&${params}`);
  },
  getAlert: (id) => alertAPI.get(`/alerts/${id}`),
  markAsRead: (id) => alertAPI.patch(`/alerts/${id}/read`),
  markAllAsRead: (businessId) => alertAPI.patch(`/alerts/read-all/${businessId}`),
  deleteAlert: (id) => alertAPI.delete(`/alerts/${id}`),
  createAlert: (data) => alertAPI.post('/alerts', data),
  getActiveAlerts: (businessId) => alertAPI.get(`/alerts/active/${businessId}`),
  getAlertStatistics: (businessId) => alertAPI.get(`/alerts/statistics/${businessId}`),
};

// Emergency Fund API methods
export const emergencyFundService = {
  getEmergencyFund: (businessId) => emergencyFundAPI.get(`/emergency-fund/${businessId}`),
  createEmergencyFund: (data) => emergencyFundAPI.post('/emergency-fund', data),
  updateEmergencyFund: (id, data) => emergencyFundAPI.put(`/emergency-fund/${id}`, data),
  contribute: (id, amount, data) => emergencyFundAPI.post(`/emergency-fund/${id}/contribute`, { amount, ...data }),
  withdraw: (id, amount, purpose) => emergencyFundAPI.post(`/emergency-fund/${id}/withdraw`, { amount, purpose }),
  getTransactionHistory: (id, filters = {}) => {
    const params = new URLSearchParams(filters);
    return emergencyFundAPI.get(`/emergency-fund/${id}/transactions?${params}`);
  },
  getFundRecommendations: (businessId) => emergencyFundAPI.get(`/emergency-fund/recommendations/${businessId}`),
  setAutoContribution: (id, data) => emergencyFundAPI.patch(`/emergency-fund/${id}/auto-contribution`, data),
  calculateRunway: (businessId) => emergencyFundAPI.get(`/emergency-fund/runway/${businessId}`),
};

// Reports API methods
export const reportService = {
  getReports: (businessId, filters = {}) => {
    const params = new URLSearchParams(filters);
    return reportAPI.get(`/reports?businessId=${businessId}&${params}`);
  },
  getReport: (id) => reportAPI.get(`/reports/${id}`),
  generateImpactAssessment: (businessId, data) => reportAPI.post(`/reports/impact-assessment/${businessId}`, data),
  generateResilienceReport: (businessId, period) => reportAPI.post(`/reports/resilience/${businessId}`, { period }),
  generateFinancialReport: (businessId, period) => reportAPI.post(`/reports/financial/${businessId}`, { period }),
  exportReport: (id, format) => reportAPI.get(`/reports/${id}/export?format=${format}`, { responseType: 'blob' }),
  getBusinessAnalytics: (businessId, period) => reportAPI.get(`/reports/analytics/${businessId}?period=${period}`),
  getBenchmarkData: (businessId) => reportAPI.get(`/reports/benchmark/${businessId}`),
};

// Payment API methods
export const paymentService = {
  createPaymentIntent: (data) => paymentAPI.post('/payments/create-intent', data),
  confirmPayment: (paymentIntentId) => paymentAPI.post('/payments/confirm', { paymentIntentId }),
  getPaymentMethods: (businessId) => paymentAPI.get(`/payments/methods/${businessId}`),
  addPaymentMethod: (data) => paymentAPI.post('/payments/methods', data),
  removePaymentMethod: (methodId) => paymentAPI.delete(`/payments/methods/${methodId}`),
  getTransactionHistory: (businessId, filters = {}) => {
    const params = new URLSearchParams(filters);
    return paymentAPI.get(`/payments/transactions/${businessId}?${params}`);
  },
  processFPXPayment: (data) => paymentAPI.post('/payments/fpx', data),
  processTouchNGoPayment: (data) => paymentAPI.post('/payments/touchngo', data),
  processGrabPayPayment: (data) => paymentAPI.post('/payments/grabpay', data),
};

// User API methods
export const userService = {
  updateProfile: (data) => userAPI.patch('/users/profile', data),
  updatePreferences: (data) => userAPI.patch('/users/preferences', data),
  deleteAccount: () => userAPI.delete('/users/account'),
  getUserActivity: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return userAPI.get(`/users/activity?${params}`);
  },
  exportUserData: () => userAPI.get('/users/export', { responseType: 'blob' }),
};

// Utility function to handle file uploads
export const uploadFile = async (file, type = 'document') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Utility function to download files
export const downloadFile = async (url, filename) => {
  const response = await api.get(url, { responseType: 'blob' });
  const blob = new Blob([response.data]);
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};

// WebSocket connection for real-time alerts
export const createWebSocketConnection = (businessId) => {
  const token = localStorage.getItem('tokay_token');
  const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
  
  const socket = new WebSocket(`${wsUrl}?token=${token}&businessId=${businessId}`);
  
  return socket;
};

export default api;
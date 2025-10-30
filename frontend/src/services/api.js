import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => {
    // Check if userData is FormData (for file upload)
    const config = userData instanceof FormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    return api.post('/auth/register', userData, config);
  },
  login: (credentials) => api.post('/auth/login', credentials),
};

// Patient API
export const patientAPI = {
  getProfile: () => api.get('/patients/profile'),
  updateProfile: (data) => {
    // Check if data is FormData (for file upload)
    const config = data instanceof FormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    return api.patch('/patients/profile', data, config);
  },
  getConversations: (includeArchived = false) =>
    api.get(`/patients/conversations?includeArchived=${includeArchived}`),
  getConversation: (id) => api.get(`/patients/conversations/${id}`),
  getNotifications: () => api.get('/patients/notifications'),
  markAsRead: (id) => api.patch(`/patients/conversations/${id}/mark-read`),
  archiveConversation: (id) => api.patch(`/patients/conversations/${id}/archive`),
  unarchiveConversation: (id) => api.patch(`/patients/conversations/${id}/unarchive`),
  deleteConversation: (id) => api.delete(`/patients/conversations/${id}`),
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: (message, conversationId) =>
    api.post('/chatbot/chat', { message, conversationId }),
  uploadFile: (formData) =>
    api.post('/chatbot/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getHistory: () => api.get('/chatbot/history'),
  getConversation: (id) => api.get(`/chatbot/conversation/${id}`),
};

// Doctor API
export const doctorAPI = {
  getPendingConversations: () => api.get('/doctors/pending-conversations'),
  getMyConversations: (includeArchived = false) =>
    api.get(`/doctors/my-conversations?includeArchived=${includeArchived}`),
  getConversation: (id) => api.get(`/doctors/conversation/${id}`),
  updateConversationInfo: (id, data) =>
    api.patch(`/doctors/conversation/${id}/update-info`, data),
  respondToPatient: (id, response) =>
    api.post(`/doctors/conversation/${id}/respond`, response),
  getPatientHistory: (patientId) =>
    api.get(`/doctors/patient/${patientId}/history`),
  getStats: () => api.get('/doctors/stats'),
  archiveConversation: (id) => api.patch(`/doctors/conversation/${id}/archive`),
  unarchiveConversation: (id) => api.patch(`/doctors/conversation/${id}/unarchive`),
  deleteConversation: (id) => api.delete(`/doctors/conversation/${id}`),
};

// Admin API
export const adminAPI = {
  getUsers: (role, search) => {
    let url = '/admin/users?';
    if (role) url += `role=${role}&`;
    if (search) url += `search=${search}`;
    return api.get(url);
  },
  getStats: () => api.get('/admin/stats'),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getConversations: (status, search) => {
    let url = '/admin/conversations?';
    if (status) url += `status=${status}&`;
    if (search) url += `search=${search}`;
    return api.get(url);
  },
  deleteConversation: (id) => api.delete(`/admin/conversations/${id}`),
  getActivityLogs: (filters) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    return api.get(`/admin/logs/activities?${params.toString()}`);
  },
  getLogStatistics: (startDate, endDate) => {
    let url = '/admin/logs/statistics?';
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}`;
    return api.get(url);
  },
};

// Appointments API
export const appointmentsAPI = {
  getAppointments: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    return api.get(`/appointments?${params.toString()}`);
  },
  getAppointment: (id) => api.get(`/appointments/${id}`),
  bookAppointment: (data) => api.post('/appointments', data),
  updateAppointment: (id, data) => api.patch(`/appointments/${id}`, data),
  cancelAppointment: (id, reason) => api.delete(`/appointments/${id}`, { data: { reason } }),
};

// Lab Results API
export const labResultsAPI = {
  getLabResults: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    return api.get(`/lab-results?${params.toString()}`);
  },
  getLabResult: (id) => api.get(`/lab-results/${id}`),
  getTrends: (testName, limit) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    return api.get(`/lab-results/trends/${encodeURIComponent(testName)}?${params.toString()}`);
  },
};

// Vital Signs API
export const vitalSignsAPI = {
  getVitalSigns: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    return api.get(`/vital-signs?${params.toString()}`);
  },
  getLatestVitalSign: () => api.get('/vital-signs/latest'),
  addVitalSign: (data) => api.post('/vital-signs', data),
  deleteVitalSign: (id) => api.delete(`/vital-signs/${id}`),
};

// Care Plans API
export const carePlansAPI = {
  getCarePlans: (status) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    return api.get(`/care-plans?${params.toString()}`);
  },
  getCarePlan: (id) => api.get(`/care-plans/${id}`),
  updateGoal: (carePlanId, goalId, data) =>
    api.patch(`/care-plans/${carePlanId}/goals/${goalId}`, data),
  updateTask: (carePlanId, taskId, data) =>
    api.patch(`/care-plans/${carePlanId}/tasks/${taskId}`, data),
};

// Documents API
export const documentsAPI = {
  getDocuments: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    return api.get(`/documents?${params.toString()}`);
  },
  getDocument: (id) => api.get(`/documents/${id}`),
  downloadDocument: (id) => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
  uploadDocument: (formData) =>
    api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
};

// Billing API
export const billingAPI = {
  getInvoices: (status) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    return api.get(`/billing/invoices?${params.toString()}`);
  },
  getInvoice: (id) => api.get(`/billing/invoices/${id}`),
  payInvoice: (id, paymentMethodId, amount) =>
    api.post(`/billing/invoices/${id}/pay`, { paymentMethodId, amount }),
  getPaymentMethods: () => api.get('/billing/payment-methods'),
  addPaymentMethod: (data) => api.post('/billing/payment-methods', data),
  deletePaymentMethod: (id) => api.delete(`/billing/payment-methods/${id}`),
};

// Messages API (Direct Messages)
export const messagesAPI = {
  getConversations: () => api.get('/messages'),
  getConversationMessages: (userId) => api.get(`/messages/conversation/${userId}`),
  sendMessage: (data) => api.post('/messages', data),
  markAsRead: (id) => api.patch(`/messages/${id}/read`),
  getUnreadCount: () => api.get('/messages/unread/count'),
};

export default api;

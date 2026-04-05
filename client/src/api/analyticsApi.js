import api from './axios';

export const analyticsApi = {
  // ============================================
  // Admin Analytics
  // ============================================
  
  // Get admin dashboard stats
  getAdminDashboardStats: async () => {
    const response = await api.get('/analytics/admin/dashboard');
    return response.data;
  },

  // Get user analytics
  getUserAnalytics: async (params) => {
    const response = await api.get('/analytics/admin/users', { params });
    return response.data;
  },

  // Get job analytics
  getJobAnalytics: async (params) => {
    const response = await api.get('/analytics/admin/jobs', { params });
    return response.data;
  },

  // Get job statistics
  getJobStatistics: async () => {
    const response = await api.get('/admin/jobs/statistics');
    return response.data;
  },

  // ============================================
  // Recruiter Analytics
  // ============================================
  
  // Get recruiter dashboard analytics
  getRecruiterDashboard: async (params) => {
    const response = await api.get('/analytics/recruiter/dashboard', { params });
    return response.data;
  },

  // Get job performance metrics
  getJobPerformance: async (jobId, params) => {
    const response = await api.get(`/analytics/recruiter/job/${jobId}`, { params });
    return response.data;
  },
};

import api from './axios';

export const adminApi = {
  // User Management
  getAllUsers: async (params) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  
  activateUser: async (userId) => {
    const response = await api.patch(`/users/${userId}/activate`);
    return response.data;
  },
  
  deactivateUser: async (userId) => {
    const response = await api.patch(`/users/${userId}/deactivate`);
    return response.data;
  },
  
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
  
  notifyUser: async (userId, notificationData) => {
    const response = await api.post(`/users/${userId}/notify`, notificationData);
    return response.data;
  },
  
  // Recruiter Verification
  getAllRecruiters: async (params) => {
    const response = await api.get('/admin/recruiters', { params });
    return response.data;
  },
  
  getPendingRecruiters: async () => {
    const response = await api.get('/admin/recruiters/pending');
    return response.data;
  },
  
  verifyRecruiter: async (recruiterId, notes) => {
    const response = await api.patch(`/admin/recruiters/${recruiterId}/verify`, { notes });
    return response.data;
  },
  
  rejectRecruiter: async (recruiterId, reason) => {
    const response = await api.patch(`/admin/recruiters/${recruiterId}/reject`, { reason });
    return response.data;
  },
  
  // Job Moderation
  getAllJobs: async (params) => {
    const response = await api.get('/admin/jobs/pending', { params });
    return response.data;
  },
  
  getPendingJobs: async () => {
    const response = await api.get('/admin/jobs/pending');
    return response.data;
  },
  
  approveJob: async (jobId, notes) => {
    const response = await api.patch(`/admin/jobs/${jobId}/approve`, { notes });
    return response.data;
  },
  
  rejectJob: async (jobId, data) => {
    const response = await api.patch(`/admin/jobs/${jobId}/reject`, data);
    return response.data;
  },
  
  featureJob: async (jobId) => {
    const response = await api.patch(`/admin/jobs/${jobId}/feature`);
    return response.data;
  },
  
  deleteJob: async (jobId) => {
    const response = await api.delete(`/admin/jobs/${jobId}`);
    return response.data;
  },
  
  getJobStatistics: async () => {
    const response = await api.get('/admin/jobs/statistics');
    return response.data;
  },
  
  // Skills & Categories
  getAllSkills: async (params) => {
    const response = await api.get('/skills', { params });
    return response.data;
  },
  
  createSkill: async (skillData) => {
    const response = await api.post('/skills', skillData);
    return response.data;
  },
  
  updateSkill: async (skillId, skillData) => {
    const response = await api.put(`/skills/${skillId}`, skillData);
    return response.data;
  },
  
  deleteSkill: async (skillId) => {
    const response = await api.delete(`/skills/${skillId}`);
    return response.data;
  },
  
  getAllCategories: async (params) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },
  
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },
  
  updateCategory: async (categoryId, categoryData) => {
    const response = await api.put(`/categories/${categoryId}`, categoryData);
    return response.data;
  },
  
  deleteCategory: async (categoryId, force = false) => {
    const response = await api.delete(`/categories/${categoryId}`, { params: { force } });
    return response.data;
  },
  
  // User Notifications
  notifyUser: async (userId, notificationData) => {
    const response = await api.post(`/users/${userId}/notify`, notificationData);
    return response.data;
  },

  // Get all jobs (Admin view)
  getAllJobs: async (params) => {
    const response = await api.get('/admin/jobs', { params });
    return response.data;
  },

  // Get job statistics
  getJobStatistics: async () => {
    const response = await api.get('/admin/jobs/statistics');
    return response.data;
  },

  // Bulk approve jobs
  bulkApproveJobs: async (jobIds) => {
    const response = await api.patch('/admin/jobs/bulk/approve', { jobIds });
    return response.data;
  },

  // Email Management
  sendBroadcastEmail: async (emailData) => {
    const response = await api.post('/emails/admin/broadcast', emailData);
    return response.data;
  },

  // Analytics
  getAdminDashboardStats: async () => {
    const response = await api.get('/analytics/admin/dashboard');
    return response.data;
  },
  
  getUserAnalytics: async (params) => {
    const response = await api.get('/analytics/admin/users', { params });
    return response.data;
  },
  
  getJobAnalytics: async (params) => {
    const response = await api.get('/analytics/admin/jobs', { params });
    return response.data;
  },
};

import api from './axios';

export const publicApi = {
  // ============================================
  // Health Check
  // ============================================
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // ============================================
  // Job Routes (Public)
  // ============================================
  
  // Get all jobs with pagination and filtering
  getAllJobs: async (params) => {
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  // Advanced job search with full-text search
  searchJobs: async (params) => {
    const response = await api.get('/jobs/search', { params });
    return response.data;
  },

  // Get job by ID
  getJobById: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  },

  // Track job view (for analytics)
  trackJobView: async (jobId, viewData) => {
    const response = await api.post(`/jobs/${jobId}/view`, viewData);
    return response.data;
  },

  // ============================================
  // Skills Routes (Public)
  // ============================================
  
  // Get all skills with pagination
  getAllSkills: async (params) => {
    const response = await api.get('/skills', { params });
    return response.data;
  },

  // Search skills by name (for autocomplete)
  searchSkills: async (params) => {
    const response = await api.get('/skills/search', { params });
    return response.data;
  },

  // ============================================
  // Categories Routes (Public)
  // ============================================
  
  // Get all job categories
  getAllCategories: async (params) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  // ============================================
  // Public Company Profile
  // ============================================
  
  // Get public company profile
  getPublicCompanyProfile: async (recruiterId) => {
    const response = await api.get(`/recruiters/${recruiterId}/profile`);
    return response.data;
  },
};

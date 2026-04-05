import api from './axios';

export const recruiterApi = {
  // ============================================
  // Company Profile Management
  // ============================================
  
  // Get my company profile
  getMyProfile: async () => {
    const response = await api.get('/recruiters/profile');
    return response.data;
  },

  // Create company profile
  createProfile: async (profileData) => {
    const response = await api.post('/recruiters/profile', profileData);
    return response.data;
  },

  // Update company profile
  updateProfile: async (profileData) => {
    const response = await api.put('/recruiters/profile', profileData);
    return response.data;
  },

  // Upload company logo
  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/recruiters/profile/logo', formData);
    return response.data;
  },

  // Upload company banner
  uploadBanner: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/recruiters/profile/banner', formData);
    return response.data;
  },

  // Get verification status
  getVerificationStatus: async () => {
    const response = await api.get('/recruiters/verification-status');
    return response.data;
  },

  // ============================================
  // Job Management
  // ============================================
  
  // Create job posting
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  // Get my jobs
  getMyJobs: async (params) => {
    const response = await api.get('/jobs/my-jobs', { params });
    return response.data;
  },

  // Update job posting
  updateJob: async (jobId, jobData) => {
    const response = await api.put(`/jobs/${jobId}`, jobData);
    return response.data;
  },

  // Delete job posting
  deleteJob: async (jobId) => {
    const response = await api.delete(`/jobs/${jobId}`);
    return response.data;
  },

  // Close job posting
  closeJob: async (jobId, data) => {
    const response = await api.patch(`/jobs/${jobId}/close`, data);
    return response.data;
  },

  // ============================================
  // Application Management
  // ============================================
  
  // Get applications for a specific job
  getApplicationsForJob: async (jobId, params) => {
    const response = await api.get(`/applications/job/${jobId}`, { params });
    return response.data;
  },

  // Update application status
  updateApplicationStatus: async (applicationId, data) => {
    const response = await api.patch(`/applications/${applicationId}/status`, data);
    return response.data;
  },

  // Add recruiter notes to application
  addRecruiterNotes: async (applicationId, data) => {
    const response = await api.post(`/applications/${applicationId}/notes`, data);
    return response.data;
  },

  // Rate candidate
  rateCandidate: async (applicationId, data) => {
    const response = await api.patch(`/applications/${applicationId}/rating`, data);
    return response.data;
  },

  // Schedule interview
  scheduleInterview: async (applicationId, data) => {
    const response = await api.post(`/applications/${applicationId}/schedule-interview`, data);
    return response.data;
  },

  // ============================================
  // Recruiter Analytics
  // ============================================
  
  // Get dashboard analytics
  getDashboardAnalytics: async (params) => {
    const response = await api.get('/analytics/recruiter/dashboard', { params });
    return response.data;
  },

  // Get job performance metrics
  getJobPerformanceMetrics: async (jobId, params) => {
    const response = await api.get(`/analytics/recruiter/job/${jobId}`, { params });
    return response.data;
  },

  // ============================================
  // Candidate Communication
  // ============================================
  
  // Contact candidate via email
  contactCandidate: async (data) => {
    const response = await api.post('/emails/contact-candidate', data);
    return response.data;
  },

  // ============================================
  // Job Seeker Discovery
  // ============================================
  
  // Search job seekers
  searchJobSeekers: async (params) => {
    const response = await api.get('/jobseekers/search', { params });
    return response.data;
  },

  // View job seeker profile
  viewJobSeekerProfile: async (jobSeekerId) => {
    const response = await api.get(`/jobseekers/${jobSeekerId}/profile`);
    return response.data;
  },
};

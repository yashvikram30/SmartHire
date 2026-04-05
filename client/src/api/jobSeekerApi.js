import api from './axios';

export const jobSeekerApi = {
  // ============================================
  // Profile Management
  // ============================================
  
  // Get my profile
  getMyProfile: async () => {
    const response = await api.get(`/jobseekers/profile?_t=${new Date().getTime()}`);
    return response.data;
  },

  // Create profile
  createProfile: async (profileData) => {
    const response = await api.post('/jobseekers/profile', profileData);
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/jobseekers/profile', profileData);
    return response.data;
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/jobseekers/profile/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete profile picture
  deleteProfilePicture: async () => {
    const response = await api.delete('/jobseekers/profile/profile-picture');
    return response.data;
  },

  // ============================================
  // Resume & Portfolio Management
  // ============================================
  
  // Upload resume
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    const response = await api.post('/jobseekers/profile/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete resume
  deleteResume: async () => {
    const response = await api.delete('/jobseekers/profile/resume');
    return response.data;
  },

  // Upload video resume
  uploadVideoResume: async (file) => {
    const formData = new FormData();
    formData.append('video', file);
    const response = await api.post('/jobseekers/profile/video-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete video resume
  deleteVideoResume: async () => {
    const response = await api.delete('/jobseekers/profile/video-resume');
    return response.data;
  },

  // Add portfolio item
  addPortfolioItem: async (portfolioData) => {
    const formData = new FormData();
    formData.append('title', portfolioData.title);
    if (portfolioData.description) {
      formData.append('description', portfolioData.description);
    }
    if (portfolioData.projectUrl) {
      formData.append('projectUrl', portfolioData.projectUrl);
    }
    if (portfolioData.portfolioFile) {
      formData.append('portfolioFile', portfolioData.portfolioFile);
    }
    const response = await api.post('/jobseekers/profile/portfolio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete portfolio item
  deletePortfolioItem: async (itemId) => {
    const response = await api.delete(`/jobseekers/profile/portfolio/${itemId}`);
    return response.data;
  },

  // ============================================
  // Portfolio Management
  // ============================================

  // Add portfolio item
  addPortfolioItem: async (portfolioData) => {
    // Check if it's FormData (has file) or JSON
    if (portfolioData instanceof FormData) {
      const response = await api.post('/jobseekers/profile/portfolio', portfolioData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } else {
      // If no file, we can ideally send JSON, but the endpoint might expect multipart
      // Let's safe-guard by converting to FormData if it's not
      const formData = new FormData();
      Object.keys(portfolioData).forEach(key => {
        if (Array.isArray(portfolioData[key])) {
          portfolioData[key].forEach(val => formData.append(key, val));
        } else {
          formData.append(key, portfolioData[key]);
        }
      });
      const response = await api.post('/jobseekers/profile/portfolio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
  },

  // Delete portfolio item
  deletePortfolioItem: async (itemId) => {
    const response = await api.delete(`/jobseekers/profile/portfolio/${itemId}`);
    return response.data;
  },

  // ============================================
  // Job Applications
  // ============================================
  
  // Apply to job
  applyToJob: async (applicationData) => {
    const response = await api.post('/applications', applicationData);
    return response.data;
  },

  // Get my applications
  getMyApplications: async (params) => {
    const response = await api.get('/applications/my-applications', { params });
    return response.data;
  },

  // Get application details
  getApplicationDetails: async (applicationId) => {
    const response = await api.get(`/applications/${applicationId}`);
    return response.data;
  },

  // Withdraw application
  withdrawApplication: async (applicationId) => {
    const response = await api.patch(`/applications/${applicationId}/withdraw`);
    return response.data;
  },

  // ============================================
  // Saved Jobs
  // ============================================
  
  // Get saved jobs
  getSavedJobs: async () => {
    const response = await api.get('/saved-jobs');
    return response.data;
  },

  // Save job
  saveJob: async (jobId) => {
    const response = await api.post('/saved-jobs', { jobId });
    return response.data;
  },

  // Unsave job
  unsaveJob: async (jobId) => {
    const response = await api.delete(`/saved-jobs/${jobId}`);
    return response.data;
  },

  // ============================================
  // Job Search & Recommendations
  // ============================================
  
  // Get recommended jobs
  getRecommendedJobs: async (params) => {
    const response = await api.get('/jobs/recommendations', { params });
    return response.data;
  },
};

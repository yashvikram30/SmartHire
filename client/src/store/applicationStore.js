import { create } from 'zustand';
import { jobSeekerApi } from '@api/jobSeekerApi';

const useApplicationStore = create((set, get) => ({
  appliedJobIds: [],
  hasFetched: false,
  
  fetchAppliedJobIds: async () => {
    if (get().hasFetched) return;
    try {
      // Use max limit to retrieve all applications for tracking
      const response = await jobSeekerApi.getMyApplications({ limit: 1000 });
      if (response.success && response.data) {
        // Extract plain IDs mapping regardless of populated structure
        const ids = response.data.map(app => app.jobId?._id || app.jobId);
        set({ appliedJobIds: ids, hasFetched: true });
      }
    } catch (error) {
      console.error('Failed to sync application status tracking:', error);
    }
  },
  
  addAppliedJobId: (jobId) => {
    set((state) => ({ 
      appliedJobIds: [...state.appliedJobIds, jobId] 
    }));
  }
}));

export default useApplicationStore;

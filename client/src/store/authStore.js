import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@api/authApi';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      
      // Set authentication data
      setAuth: (user, accessToken) => {
        set({
          user,
          accessToken,
          isAuthenticated: true,
        });
      },
      
      // Update user data
      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },
      
      // Logout user
      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('auth-storage');
      },
      
      // Set loading state
      setLoading: (isLoading) => {
        set({ isLoading });
      },
      
      // Check if user has specific role
      hasRole: (role) => {
        return get().user?.role === role;
      },
      
      // Check if user is verified
      isVerified: () => {
        return get().user?.isVerified === true;
      },
      // Check authentication status
      checkAuth: async () => {
        const state = get();
        
        // Skip if we're already logged out and have no user data
        if (!state.user && !state.isAuthenticated) {
          set({ isLoading: false });
          return;
        }
        
        set({ isLoading: true });
        try {
          const response = await authApi.getCurrentUser();
          if (response.success) {
            set({
              user: response.data,
              isAuthenticated: true,
            });
          } else {
            // Invalid session - clear auth state
            set({
              user: null,
              accessToken: null,
              isAuthenticated: false,
            });
          }
        } catch (error) {
          // Auth check failed - just clear the state, don't call logout
          // (logout would clear localStorage which we might want to keep for retry)
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
          });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken, // Persist access token too if needed for API interceptors
      }),
    }
  )
);

export default useAuthStore;

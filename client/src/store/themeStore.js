import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set, get) => ({
      displayMode: 'light', // 'light' or 'dark'
      
      // Toggle between light and dark mode
      toggleTheme: () => {
        const newMode = get().displayMode === 'light' ? 'dark' : 'light';
        set({ displayMode: newMode });
        
        // Apply theme to document
        if (newMode === 'dark') {
          document.documentElement.classList.add('dark');
          document.body.classList.remove('light');
          document.body.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
          document.body.classList.add('light');
        }
      },
      
      // Set specific theme
      setTheme: (mode) => {
        set({ displayMode: mode });
        
        if (mode === 'dark') {
          document.documentElement.classList.add('dark');
          document.body.classList.remove('light');
          document.body.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
          document.body.classList.add('light');
        }
      },
      
      // Initialize theme on app load
      initTheme: () => {
        const mode = get().displayMode;
        if (mode === 'dark') {
          document.documentElement.classList.add('dark');
          document.body.classList.add('dark');
        } else {
          document.body.classList.add('light');
        }
      },
    }),
    {
      name: 'theme-storage', // localStorage key
      getStorage: () => localStorage,
    }
  )
);

export default useThemeStore;

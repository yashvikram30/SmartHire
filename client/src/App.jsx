import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from '@/routes/AppRoutes';
import useThemeStore from '@store/themeStore';

import useAuthStore from '@store/authStore';

function App() {
  const { initTheme } = useThemeStore();
  const { checkAuth } = useAuthStore();
  
  useEffect(() => {
    // Initialize theme on app mount
    initTheme();
    // Check authentication status only once on mount
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-text)',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useState, useEffect } from 'react';
import { theme } from '@/theme/theme';
import { trackVisitor } from '@/features/visitors/api';
import { useAuthStore } from '@/stores/authStore';

let globalQueryClient: QueryClient | null = null;

export function getQueryClient(): QueryClient | null {
  return globalQueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    trackVisitor();
  }, []);

  // After zustand rehydrates auth from localStorage: drop stale `user` if tokens are gone
  // (e.g. refresh failed and tokens were cleared, or any token/user mismatch).
  useEffect(() => {
    const syncStaleUser = () => {
      if (typeof window === 'undefined') return;
      const hasToken = !!(localStorage.getItem('access') || localStorage.getItem('refresh'));
      const { user, logout } = useAuthStore.getState();
      if (!hasToken && user) logout();
    };
    const unsub = useAuthStore.persist.onFinishHydration(syncStaleUser);
    if (useAuthStore.persist.hasHydrated()) syncStaleUser();
    return unsub;
  }, []);

  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { staleTime: 60 * 1000 },
      },
    });
    globalQueryClient = client;
    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

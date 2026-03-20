'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useState, useEffect } from 'react';
import { theme } from '@/theme/theme';
import { trackVisitor } from '@/features/visitors/api';

let globalQueryClient: QueryClient | null = null;

export function getQueryClient(): QueryClient | null {
  return globalQueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    trackVisitor();
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

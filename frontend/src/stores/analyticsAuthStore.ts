import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ANALYTICS_ACCESS_KEY, ANALYTICS_REFRESH_KEY } from '@/lib/analyticsTokens';

interface AnalyticsUser {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface AnalyticsAuthState {
  user: AnalyticsUser | null;
  access: string | null;
  refresh: string | null;
  setAuth: (user: AnalyticsUser, access: string, refresh: string) => void;
  logout: () => void;
}

export const useAnalyticsAuthStore = create<AnalyticsAuthState>()(
  persist(
    (set) => ({
      user: null,
      access: null,
      refresh: null,
      setAuth: (user, access, refresh) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(ANALYTICS_ACCESS_KEY, access);
          localStorage.setItem(ANALYTICS_REFRESH_KEY, refresh);
        }
        set({ user, access, refresh });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(ANALYTICS_ACCESS_KEY);
          localStorage.removeItem(ANALYTICS_REFRESH_KEY);
        }
        set({ user: null, access: null, refresh: null });
      },
    }),
    { name: 'analytics-auth-storage', partialize: (s) => ({ user: s.user }) }
  )
);

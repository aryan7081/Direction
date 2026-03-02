import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  access: string | null;
  refresh: string | null;
  setAuth: (user: User, access: string, refresh: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      access: null,
      refresh: null,
      setAuth: (user, access, refresh) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access', access);
          localStorage.setItem('refresh', refresh);
        }
        set({ user, access, refresh });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
        }
        set({ user: null, access: null, refresh: null });
      },
      setUser: (user) => set({ user }),
    }),
    { name: 'auth-storage', partialize: (s) => ({ user: s.user }) }
  )
);

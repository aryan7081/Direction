import axios, { AxiosError } from 'axios';
import { getApiBase } from '@/lib/getApiBase';
import { ANALYTICS_ACCESS_KEY, ANALYTICS_REFRESH_KEY } from '@/lib/analyticsTokens';
import { useAnalyticsAuthStore } from '@/stores/analyticsAuthStore';

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const analyticsApi = axios.create({
  baseURL: DEFAULT_API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

analyticsApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    config.baseURL = getApiBase();
    const token = localStorage.getItem(ANALYTICS_ACCESS_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

analyticsApi.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config;
    if (err.response?.status === 401 && original && !(original as { _retry?: boolean })._retry) {
      (original as { _retry?: boolean })._retry = true;
      const refresh = typeof window !== 'undefined' ? localStorage.getItem(ANALYTICS_REFRESH_KEY) : null;
      if (refresh) {
        try {
          const refreshUrl = `${getApiBase()}/auth/refresh/`;
          const { data } = await axios.post<{ access: string }>(refreshUrl, { refresh });
          localStorage.setItem(ANALYTICS_ACCESS_KEY, data.access);
          if (original.headers) original.headers.Authorization = `Bearer ${data.access}`;
          return analyticsApi(original);
        } catch {
          useAnalyticsAuthStore.getState().logout();
          if (typeof window !== 'undefined') window.location.href = '/analytics/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

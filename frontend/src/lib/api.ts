import axios, { AxiosError } from 'axios';

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// In browser: use same host as page for mobile dev (phone can't reach localhost)
function getApiBase(): string {
  if (typeof window === 'undefined') return DEFAULT_API_BASE;
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  return `${window.location.protocol}//${window.location.hostname}:8000/api`;
}

export const api = axios.create({
  baseURL: DEFAULT_API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    config.baseURL = getApiBase();
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config;
    if (err.response?.status === 401 && original && !(original as any)._retry) {
      (original as any)._retry = true;
      const refresh = localStorage.getItem('refresh');
      if (refresh) {
        try {
          const refreshUrl = `${getApiBase()}/auth/refresh/`;
          const { data } = await axios.post(refreshUrl, {
            refresh,
          });
          localStorage.setItem('access', data.access);
          if (original?.headers) original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          if (typeof window !== 'undefined') window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

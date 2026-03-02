import axios, { AxiosError } from 'axios';

// Call backend directly to avoid Next.js proxy redirect loops (trailing slash conflict)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
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
          const refreshUrl = `${API_BASE}/auth/refresh/`;
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

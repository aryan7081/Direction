import { api } from '@/lib/api';

export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login/', { email, password });
  return data;
}

export async function register(payload: { email: string; password: string }) {
  const { data } = await api.post('/auth/register/', payload);
  return data;
}

import { api } from '@/lib/api';

export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login/', { email, password });
  return data;
}

export async function register(payload: { email: string; password: string }) {
  const { data } = await api.post('/auth/register/', payload);
  return data;
}

export interface GoogleAuthResponse {
  user: { id: number; email: string; username: string; first_name: string; last_name: string; role: string };
  access: string;
  refresh: string;
}

export async function googleAuth(credential: string, sessionId?: string): Promise<GoogleAuthResponse> {
  const { data } = await api.post('/auth/google/', { credential, session_id: sessionId });
  return data;
}

import { api } from '@/lib/api';

export interface Profile {
  user: { id: number; email: string; first_name: string; last_name: string };
  grade: string;
  school: string;
  date_of_birth: string | null;
  parent_email: string;
  financial_tier: string;
  subject_marks: Record<string, number>;
}

export interface ProfileUpdate {
  grade?: string;
  school?: string;
  date_of_birth?: string | null;
  parent_email?: string;
  financial_tier?: string;
  subject_marks?: Record<string, number>;
}

export async function getProfile(): Promise<Profile> {
  const { data } = await api.get<Profile>('/auth/profile/');
  return data;
}

export async function updateProfile(payload: ProfileUpdate): Promise<Profile> {
  const { data } = await api.patch<Profile>('/auth/profile/', payload);
  return data;
}

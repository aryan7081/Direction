import { api } from '@/lib/api';
import type { Career } from '@/types';

export async function getCareers(): Promise<Career[]> {
  const { data } = await api.get<{ results?: Career[] } | Career[]>('/careers/');
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
}

export async function getCareerBySlug(slug: string) {
  const { data } = await api.get<Career>(`/careers/${slug}/`);
  return data;
}

import { api } from '@/lib/api';
import type { Question } from '@/types';

export async function getQuestions(): Promise<Question[]> {
  const { data } = await api.get<{ results?: Question[] } | Question[]>('/questions/');
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
}

export async function startAssessment() {
  const { data } = await api.post<{ attempt_id: number; message: string }>(
    '/assessment/start/'
  );
  return data;
}

export async function submitAssessment(
  attemptId: number,
  responses: { question_id: number; answer_option_id: number }[]
) {
  const { data } = await api.post(`/assessment/${attemptId}/submit/`, {
    responses,
  });
  return data;
}

export async function getAssessmentResult(attemptId: number) {
  const { data } = await api.get(`/assessment/${attemptId}/result/`);
  return data;
}

export async function getDashboard() {
  const { data } = await api.get<{
    attempts: { id: number; is_complete: boolean; completed_at: string; created_at: string }[];
    latest_result_attempt_id: number | null;
  }>('/dashboard/');
  return data;
}

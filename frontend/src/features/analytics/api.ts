import { analyticsApi } from '@/lib/analyticsApi';
import type { AnalyticsDashboardPayload } from './types';

export async function fetchAnalyticsHealth() {
  const { data } = await analyticsApi.get<{ ok: boolean; email: string }>('/analytics/health/');
  return data;
}

export async function fetchAnalyticsDashboard(from: string, to: string) {
  const { data } = await analyticsApi.get<AnalyticsDashboardPayload>('/analytics/dashboard/', {
    params: { from, to },
  });
  return data;
}

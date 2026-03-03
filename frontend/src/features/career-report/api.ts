import { api } from '@/lib/api';
import type { CareerReport } from './types';

export async function fetchCareerReport(sessionId: string): Promise<CareerReport> {
  const { data } = await api.get(`/game/report/${sessionId}/`);
  return data;
}

export function getReportPdfUrl(sessionId: string): string {
  return `/game/report/${sessionId}/pdf/`;
}

export async function downloadReportPdf(sessionId: string): Promise<void> {
  const response = await api.get(`/game/report/${sessionId}/pdf/`, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `career-report-${sessionId}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

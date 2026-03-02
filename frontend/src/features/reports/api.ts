import { api } from '@/lib/api';

async function getErrorMessage(err: any): Promise<string> {
  const status = err?.response?.status;
  const blob = err?.response?.data;
  if (blob instanceof Blob) {
    try {
      const text = await blob.text();
      const json = JSON.parse(text);
      return json?.error || json?.detail || 'Failed to generate report';
    } catch {
      // Not JSON, use generic message
    }
  }
  if (status === 404) return 'Report not found';
  if (status === 401) return 'Please log in again';
  return 'Failed to generate report';
}

export async function downloadReport(attemptId: number): Promise<void> {
  try {
    const res = await api.get(`/reports/${attemptId}/pdf/`, {
      responseType: 'blob',
    });
    const blob = res.data as Blob;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-report-${attemptId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err: any) {
    const msg = await getErrorMessage(err);
    throw new Error(msg);
  }
}

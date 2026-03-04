import { api } from '@/lib/api';
import type { CareerReport } from './types';

export interface ReportTeaser {
  session_id: string;
  student_name: string;
  hero_career: string;
  hero_confidence: string;
  dominant_pattern: string;
  trait_preview: { label: string; icon: string; score: number; max: number }[];
  career_preview: { rank: number; career_name: string; stream: string; confidence: string }[];
  total_traits: number;
  total_sections: number;
  is_paid: boolean;
  price?: number;
}

export interface PaymentOrder {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  user_email: string;
  user_name: string;
}

export async function fetchReportTeaser(sessionId: string): Promise<ReportTeaser> {
  const { data } = await api.get(`/game/report/${sessionId}/teaser/`);
  return data;
}

export async function fetchCareerReport(sessionId: string): Promise<CareerReport> {
  const { data } = await api.get(`/game/report/${sessionId}/`);
  return data;
}

export async function createPaymentOrder(sessionId: string): Promise<PaymentOrder & { is_paid?: boolean }> {
  const { data } = await api.post('/game/payment/create-order/', { session_id: sessionId });
  return data;
}

export async function verifyPayment(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<{ verified: boolean; session_id: string }> {
  const { data } = await api.post('/game/payment/verify/', params);
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

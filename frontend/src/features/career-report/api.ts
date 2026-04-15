import { api } from '@/lib/api';
import type { CareerReport } from './types';

export interface ReportTeaser {
  session_id: string;
  student_name: string;
  hero_career: string;
  hero_career_category?: string;
  hero_confidence: string;
  dominant_pattern: string;
  dominant_pattern_description: string;
  stream_recommendation: string;
  trait_preview: { label: string; icon: string }[];
  career_preview: { rank: number; career_category?: string; career_name?: string; stream?: string }[];
  top_two_gap?: number;
  total_traits: number;
  total_sections: number;
  is_paid: boolean;
  /** True when user can open the full report (₹49 report, or ₹99 bundle after extra questions). */
  report_accessible?: boolean;
  premium_unlocked?: boolean;
  premium_extension_complete?: boolean;
  report_price_inr?: number;
  premium_bundle_price_inr?: number;
  /** ₹50 — only when user already paid for the ₹49 report. */
  premium_upgrade_price_inr?: number;
  premium_upgrade_available?: boolean;
  price?: number;
  pending_email?: string;
  assessment_tier?: 'free' | 'premium';
  scenario_questions_answered?: number;
  scenario_questions_expected?: number;
  profile_depth?: 'overview' | 'full';
  profile_depth_title?: string;
  profile_depth_detail?: string;
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

export type PaymentProductType = 'report' | 'premium_bundle';

export type CouponPriceLine = {
  list_price_inr: number;
  final_amount_inr: number;
  savings_inr: number;
};

/** Same % applies to report (₹49) and bundle (₹99); upgrade (₹50) when eligible. */
export interface ValidateCouponResult {
  valid: boolean;
  coupon_applied?: boolean;
  coupon_code?: string;
  discount_percent?: number;
  report?: CouponPriceLine;
  premium_bundle?: CouponPriceLine;
  upgrade?: CouponPriceLine | null;
}

export async function validatePaymentCoupon(
  sessionId: string,
  opts: { coupon_code: string }
): Promise<ValidateCouponResult> {
  const { data } = await api.post('/game/payment/validate-coupon/', {
    session_id: sessionId,
    coupon_code: opts.coupon_code.trim(),
  });
  return data;
}

export async function createPaymentOrder(
  sessionId: string,
  opts?: { product_type?: PaymentProductType; coupon_code?: string }
): Promise<
  PaymentOrder & {
    is_paid?: boolean;
    product_type?: PaymentProductType;
    premium_pending_extension?: boolean;
    /** True when charging bundle delta (₹50) after ₹49 report purchase. */
    is_premium_upgrade?: boolean;
    detail?: string;
    coupon_applied?: boolean;
    list_price_inr?: number;
    final_amount_inr?: number;
    savings_inr?: number;
    discount_percent?: number;
  }
> {
  const { data } = await api.post('/game/payment/create-order/', {
    session_id: sessionId,
    product_type: opts?.product_type ?? 'report',
    ...(opts?.coupon_code?.trim() ? { coupon_code: opts.coupon_code.trim() } : {}),
  });
  return data;
}

export async function verifyPayment(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<{ verified: boolean; session_id: string; is_premium_upgrade?: boolean }> {
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

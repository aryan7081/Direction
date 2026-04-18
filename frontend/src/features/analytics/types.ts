export interface DeltaMetric {
  current: number;
  previous: number;
  change_pct: number;
}

export interface SeriesPoint {
  date: string;
  count?: number;
  revenue_inr?: number;
}

export interface PaymentProductRow {
  count: number;
  revenue_inr: number;
}

export interface TopCareerRow {
  name: string;
  slug: string | null;
  count: number;
}

export interface AnalyticsDashboardPayload {
  range: {
    from: string;
    to: string;
    span_days: number;
    timezone: string;
  };
  kpis: {
    visitor_hits: number;
    unique_visitor_ips: number;
    new_user_registrations: number;
    game_sessions_started: number;
    game_sessions_completed: number;
    game_sessions_with_account: number;
    completion_rate_pct: number;
    paid_orders: number;
    revenue_inr: number;
    payment_conversion_vs_completed_pct: number;
    career_counseling_requests: number;
    api_errors_logged: number;
    legacy_mcq_completions: number;
    coupon_redemptions: number;
    coupon_discount_inr_total: number;
  };
  deltas: {
    visitor_hits: DeltaMetric;
    new_user_registrations: DeltaMetric;
    game_sessions_started: DeltaMetric;
    game_sessions_completed: DeltaMetric;
    paid_orders: DeltaMetric;
    revenue_inr: DeltaMetric;
  };
  series: {
    visitors_by_day: SeriesPoint[];
    registrations_by_day: SeriesPoint[];
    assessment_completions_by_day: SeriesPoint[];
    revenue_by_day: SeriesPoint[];
    api_errors_by_day: SeriesPoint[];
  };
  payments: {
    by_product: Record<string, PaymentProductRow>;
  };
  counseling: {
    by_status: Record<string, number>;
  };
  assessments: {
    tier_breakdown_completed: Record<string, number>;
    top_careers_rank1: TopCareerRow[];
  };
}

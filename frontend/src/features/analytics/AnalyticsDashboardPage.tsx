'use client';

import { useCallback, useId, useLayoutEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { motion } from 'framer-motion';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ANALYTICS_ACCESS_KEY } from '@/lib/analyticsTokens';
import { ax, chartAxisTick, chartTooltipSx } from './analyticsDesignSystem';
import { fetchAnalyticsDashboard, fetchAnalyticsHealth } from './api';
import { formatChartAxisDate, formatInr, formatNumber, humanizeProductType, humanizeStatus, humanizeTier } from './formatters';
import type { AnalyticsDashboardPayload, DeltaMetric } from './types';

const PIE_COLORS = [ax.chart.visitors, ax.chart.registrations, ax.chart.completions, ax.accent.rose, ax.accent.violet, ax.accent.lime, ax.chart.tier, ax.chart.product];

function presetRange(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function rangeMatchesPreset(days: number, from: string, to: string): boolean {
  const p = presetRange(days);
  return p.from === from && p.to === to;
}

function mergeTrafficSeries(payload: AnalyticsDashboardPayload) {
  const v = payload.series.visitors_by_day;
  const r = payload.series.registrations_by_day;
  const c = payload.series.assessment_completions_by_day;
  return v.map((row, i) => ({
    date: row.date,
    visitors: row.count ?? 0,
    registrations: r[i]?.count ?? 0,
    completions: c[i]?.count ?? 0,
  }));
}

function SectionLabel({ title, hint }: { title: string; hint?: string }) {
  return (
    <Box sx={{ mb: 2, mt: title === 'Acquisition & traffic' ? 0 : 4 }}>
      <Typography variant="subtitle2" color="text.secondary" letterSpacing="0.12em">
        {title}
      </Typography>
      {hint ? (
        <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5, maxWidth: 720 }}>
          {hint}
        </Typography>
      ) : null}
    </Box>
  );
}

function DeltaBadge({ d, inverse }: { d: DeltaMetric; inverse?: boolean }) {
  const up = d.change_pct >= 0;
  const good = inverse ? !up : up;
  const label = `${up ? '↑' : '↓'} ${Math.abs(d.change_pct)}%`;
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        mt: 1.25,
        px: 1,
        py: 0.35,
        borderRadius: 999,
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        bgcolor: good ? alpha('#34d399', 0.12) : alpha('#fb7185', 0.12),
        color: good ? '#6ee7b7' : '#fda4af',
        border: `1px solid ${good ? alpha('#34d399', 0.25) : alpha('#fb7185', 0.25)}`,
      }}
    >
      {label}
      <Box component="span" sx={{ ml: 0.75, opacity: 0.75, fontWeight: 500 }}>
        vs prior
      </Box>
    </Box>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  delta,
  inverseDelta,
  accent = 'cyan',
}: {
  title: string;
  value: string;
  subtitle?: string;
  delta?: DeltaMetric;
  inverseDelta?: boolean;
  accent?: 'cyan' | 'violet' | 'amber' | 'emerald' | 'rose';
}) {
  const accentMap = {
    cyan: ax.chart.visitors,
    violet: ax.accent.violet,
    amber: ax.accent.amber,
    emerald: ax.accent.emerald,
    rose: ax.accent.rose,
  };
  const bar = accentMap[accent];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
      <Box
        sx={{
          height: '100%',
          p: 2.25,
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          border: `1px solid ${ax.border.subtle}`,
          background: `linear-gradient(155deg, ${alpha('#0f172a', 0.85)} 0%, ${alpha('#0c1220', 0.95)} 100%)`,
          boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            borderColor: alpha(bar, 0.35),
            boxShadow: `0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px ${alpha(bar, 0.12)}`,
            transform: 'translateY(-2px)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${bar}, ${alpha(bar, 0.2)})`,
            borderRadius: '12px 12px 0 0',
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontSize: '0.65rem',
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mt: 1,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            fontSize: { xs: '1.5rem', sm: '1.65rem' },
            background: `linear-gradient(180deg, ${ax.text.primary} 0%, ${alpha(ax.text.primary, 0.85)} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {value}
        </Typography>
        {subtitle ? (
          <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.75, lineHeight: 1.45 }}>
            {subtitle}
          </Typography>
        ) : null}
        {delta ? <DeltaBadge d={delta} inverse={inverseDelta} /> : null}
      </Box>
    </motion.div>
  );
}

function ChartPanel({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        border: `1px solid ${ax.border.subtle}`,
        background: `linear-gradient(165deg, ${alpha(ax.bg.elevated, 0.55)} 0%, ${alpha('#0a0f1a', 0.85)} 100%)`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: '1.05rem' }}>
            {title}
          </Typography>
          {description ? (
            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5, maxWidth: 520, lineHeight: 1.5 }}>
              {description}
            </Typography>
          ) : null}
        </Box>
        {action}
      </Box>
      {children}
    </Box>
  );
}

const chartLegendStyle = { paddingTop: 16, fontSize: 12, fontWeight: 600 };

function DashboardSkeleton() {
  return (
    <Stack spacing={3}>
      <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
      <Skeleton variant="rounded" height={52} sx={{ borderRadius: 3 }} />
      <Grid container spacing={2}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Skeleton variant="rounded" height={132} sx={{ borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
      <Skeleton variant="rounded" height={360} sx={{ borderRadius: 3 }} />
    </Stack>
  );
}

export function AnalyticsDashboardPage() {
  const router = useRouter();
  const gradId = useId().replace(/:/g, '');
  const revGradId = `rev-${gradId}`;
  const [from, setFrom] = useState(() => presetRange(30).from);
  const [to, setTo] = useState(() => presetRange(30).to);
  const [sessionReady, setSessionReady] = useState(false);

  const activePreset = useMemo(() => {
    if (rangeMatchesPreset(7, from, to)) return 7;
    if (rangeMatchesPreset(30, from, to)) return 30;
    if (rangeMatchesPreset(90, from, to)) return 90;
    return null;
  }, [from, to]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(ANALYTICS_ACCESS_KEY)) {
      router.replace('/analytics/login');
      return;
    }
    setSessionReady(true);
  }, [router]);

  const healthQuery = useQuery({
    queryKey: ['analytics-health'],
    queryFn: fetchAnalyticsHealth,
    retry: false,
    enabled: sessionReady,
  });

  const dashboardQuery = useQuery({
    queryKey: ['analytics-dashboard', from, to],
    queryFn: () => fetchAnalyticsDashboard(from, to),
    enabled: healthQuery.isSuccess,
  });

  const applyPreset = useCallback((days: number) => {
    const r = presetRange(days);
    setFrom(r.from);
    setTo(r.to);
  }, []);

  const exportJson = useCallback(() => {
    if (!dashboardQuery.data) return;
    const blob = new Blob([JSON.stringify(dashboardQuery.data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `analytics-${from}_${to}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [dashboardQuery.data, from, to]);

  const payload = dashboardQuery.data;

  const trafficMerged = useMemo(() => {
    if (!payload) return [];
    return mergeTrafficSeries(payload);
  }, [payload]);

  const revenueData = useMemo(() => {
    if (!payload) return [];
    return payload.series.revenue_by_day.map((row) => ({
      date: row.date,
      revenue_inr: row.revenue_inr ?? 0,
    }));
  }, [payload]);

  const errorsData = useMemo(() => {
    if (!payload) return [];
    return payload.series.api_errors_by_day.map((row) => ({
      date: row.date,
      errors: row.count ?? 0,
    }));
  }, [payload]);

  const paymentBars = useMemo(() => {
    if (!payload) return [];
    return Object.entries(payload.payments.by_product).map(([key, v]) => ({
      name: humanizeProductType(key),
      revenue_inr: v.revenue_inr,
      count: v.count,
    }));
  }, [payload]);

  const counselingPie = useMemo(() => {
    if (!payload) return [];
    return Object.entries(payload.counseling.by_status).map(([name, value]) => ({
      name: humanizeStatus(name),
      value,
    }));
  }, [payload]);

  const tierBars = useMemo(() => {
    if (!payload) return [];
    return Object.entries(payload.assessments.tier_breakdown_completed).map(([tier, n]) => ({
      tier: humanizeTier(tier),
      n,
    }));
  }, [payload]);

  if (!sessionReady || healthQuery.isLoading) {
    return <DashboardSkeleton />;
  }

  if (healthQuery.error && isAxiosError(healthQuery.error)) {
    const st = healthQuery.error.response?.status;
    if (st === 403) {
      return (
        <Alert severity="warning" icon={false} sx={{ maxWidth: 560, borderRadius: 3 }}>
          <Typography fontWeight={700} gutterBottom>
            No access yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ask a staff admin to assign &quot;Can view analytics dashboard&quot; or add you to the Analytics dashboard viewers group in Django Admin.
          </Typography>
        </Alert>
      );
    }
    if (st === 401) {
      router.replace('/analytics/login');
      return null;
    }
  }

  if (healthQuery.isError) {
    return (
      <Alert severity="error" sx={{ borderRadius: 3, maxWidth: 480 }}>
        Unable to verify your session.{' '}
        <Button color="inherit" size="small" onClick={() => router.replace('/analytics/login')} sx={{ fontWeight: 700 }}>
          Sign in again
        </Button>
      </Alert>
    );
  }

  return (
    <Stack spacing={0}>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
        <Box
          sx={{
            p: { xs: 2.5, sm: 3 },
            mb: 3,
            borderRadius: 4,
            border: `1px solid ${ax.border.subtle}`,
            background: `linear-gradient(125deg, ${alpha('#0f172a', 0.9)} 0%, ${alpha('#050810', 0.6)} 55%, ${alpha('#134e4a', 0.12)} 100%)`,
            boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'flex-end' }} justifyContent="space-between">
            <Box>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.18em' }}>
                Product intelligence
              </Typography>
              <Typography variant="h3" sx={{ mt: 0.5, fontSize: { xs: '1.65rem', sm: '2rem' } }}>
                Analytics overview
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 560, lineHeight: 1.65 }}>
                Compare performance to the previous window of equal length. Dates follow UTC boundaries (same as API aggregates).
              </Typography>
            </Box>
            <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
              <Chip
                size="small"
                label={dashboardQuery.isFetching ? 'Refreshing…' : 'Live data'}
                color={dashboardQuery.isFetching ? 'default' : 'success'}
                variant="outlined"
                sx={{ fontWeight: 700, borderColor: alpha('#34d399', 0.35) }}
              />
              {healthQuery.data?.email ? (
                <Chip size="small" variant="outlined" label={healthQuery.data.email} sx={{ fontWeight: 600, maxWidth: 220 }} />
              ) : null}
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', lg: 'center' }}
            justifyContent="space-between"
            sx={{ mt: 3, pt: 3, borderTop: `1px solid ${ax.border.subtle}` }}
          >
            <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
              <Typography variant="caption" color="text.disabled" fontWeight={700} sx={{ mr: 0.5 }}>
                Quick range
              </Typography>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={activePreset}
                onChange={(_, v) => v != null && applyPreset(v)}
                sx={{ flexWrap: 'wrap' }}
              >
                <ToggleButton value={7} aria-label="Last 7 days">
                  7 days
                </ToggleButton>
                <ToggleButton value={30} aria-label="Last 30 days">
                  30 days
                </ToggleButton>
                <ToggleButton value={90} aria-label="Last 90 days">
                  90 days
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
              <TextField
                label="From"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: { sm: 160 } }}
              />
              <TextField
                label="To"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: { sm: 160 } }}
              />
              <Button
                variant="outlined"
                color="primary"
                onClick={exportJson}
                disabled={!payload}
                sx={{ minHeight: 40, px: 2 }}
              >
                Export JSON
              </Button>
            </Stack>
          </Stack>
        </Box>
      </motion.div>

      {dashboardQuery.isLoading ? (
        <Skeleton variant="rounded" height={420} sx={{ borderRadius: 3 }} />
      ) : dashboardQuery.error ? (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          Couldn&apos;t load metrics. Check your connection and try again.
        </Alert>
      ) : payload ? (
        <>
          <SectionLabel title="Acquisition & traffic" hint="Reach and new accounts in the selected window." />
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MetricCard
                title="Visitor hits"
                value={formatNumber(payload.kpis.visitor_hits)}
                delta={payload.deltas.visitor_hits}
                accent="cyan"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MetricCard title="Unique visitor IPs" value={formatNumber(payload.kpis.unique_visitor_ips)} subtitle="Distinct IPs (proxy for reach)" accent="violet" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MetricCard
                title="New registrations"
                value={formatNumber(payload.kpis.new_user_registrations)}
                delta={payload.deltas.new_user_registrations}
                accent="emerald"
              />
            </Grid>
          </Grid>

          <SectionLabel title="Assessment funnel" hint="Game sessions and completion quality." />
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title="Sessions started"
                value={formatNumber(payload.kpis.game_sessions_started)}
                delta={payload.deltas.game_sessions_started}
                accent="cyan"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title="Sessions completed"
                value={formatNumber(payload.kpis.game_sessions_completed)}
                delta={payload.deltas.game_sessions_completed}
                accent="emerald"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title="Completion rate"
                value={`${formatNumber(payload.kpis.completion_rate_pct)}%`}
                subtitle="Completed ÷ started"
                accent="amber"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title="Sessions with account"
                value={formatNumber(payload.kpis.game_sessions_with_account)}
                subtitle="Starts while logged in"
                accent="violet"
              />
            </Grid>
          </Grid>

          <SectionLabel title="Revenue & monetization" hint="Orders, INR, and coupon impact." />
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title="Paid orders"
                value={formatNumber(payload.kpis.paid_orders)}
                delta={payload.deltas.paid_orders}
                accent="emerald"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard title="Revenue" value={formatInr(payload.kpis.revenue_inr)} delta={payload.deltas.revenue_inr} accent="emerald" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title="Payment vs completed"
                value={`${formatNumber(payload.kpis.payment_conversion_vs_completed_pct)}%`}
                subtitle="Paid orders ÷ completed sessions"
                accent="amber"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                title="Coupon redemptions"
                value={formatNumber(payload.kpis.coupon_redemptions)}
                subtitle={`Est. discount ${formatInr(payload.kpis.coupon_discount_inr_total)}`}
                accent="violet"
              />
            </Grid>
          </Grid>

          <SectionLabel title="Operations & quality" hint="Counseling demand, errors, and legacy MCQ usage." />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MetricCard title="Counseling requests" value={formatNumber(payload.kpis.career_counseling_requests)} accent="cyan" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MetricCard title="API errors (logged)" value={formatNumber(payload.kpis.api_errors_logged)} accent="rose" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MetricCard title="Legacy MCQ completions" value={formatNumber(payload.kpis.legacy_mcq_completions)} accent="violet" />
            </Grid>
          </Grid>

          <SectionLabel title="Trends" hint="Daily series for the selected window." />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <ChartPanel
                title="Traffic & funnel"
                description="Visitor volume, signups, and completed assessments — aligned by day."
              >
                <ResponsiveContainer width="100%" height={340}>
                  <LineChart data={trafficMerged} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={ax.chart.grid} strokeDasharray="4 4" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={chartAxisTick}
                      tickFormatter={formatChartAxisDate}
                      tickLine={false}
                      axisLine={{ stroke: ax.border.subtle }}
                      minTickGap={28}
                    />
                    <YAxis tick={chartAxisTick} tickLine={false} axisLine={false} width={44} />
                    <RechartsTooltip
                      contentStyle={chartTooltipSx}
                      labelStyle={{ color: ax.text.primary, fontWeight: 700 }}
                      labelFormatter={(l) => formatChartAxisDate(String(l))}
                    />
                    <Legend wrapperStyle={chartLegendStyle} />
                    <Line type="monotone" dataKey="visitors" name="Visitors" stroke={ax.chart.visitors} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="registrations" name="Registrations" stroke={ax.chart.registrations} strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="completions" name="Completions" stroke={ax.chart.completions} strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartPanel>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <ChartPanel title="Revenue" description="Paid INR by calendar day.">
                <ResponsiveContainer width="100%" height={340}>
                  <AreaChart data={revenueData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={revGradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={ax.chart.revenueFill} stopOpacity={0.45} />
                        <stop offset="95%" stopColor={ax.chart.revenueFill} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={ax.chart.grid} strokeDasharray="4 4" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={chartAxisTick}
                      tickFormatter={formatChartAxisDate}
                      tickLine={false}
                      axisLine={{ stroke: ax.border.subtle }}
                      minTickGap={24}
                    />
                    <YAxis tick={chartAxisTick} tickLine={false} axisLine={false} width={52} tickFormatter={(v) => `₹${v}`} />
                    <RechartsTooltip
                      contentStyle={chartTooltipSx}
                      formatter={(value) => [formatInr(Number(value ?? 0)), 'Revenue']}
                      labelFormatter={(l) => formatChartAxisDate(String(l))}
                    />
                    <Area type="monotone" dataKey="revenue_inr" stroke={ax.chart.revenueStroke} strokeWidth={2} fill={`url(#${revGradId})`} fillOpacity={1} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartPanel>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ChartPanel title="API errors" description="Logged client/server issues by day — lower is better.">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={errorsData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={ax.chart.grid} strokeDasharray="4 4" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={chartAxisTick}
                      tickFormatter={formatChartAxisDate}
                      tickLine={false}
                      axisLine={{ stroke: ax.border.subtle }}
                      minTickGap={20}
                    />
                    <YAxis tick={chartAxisTick} tickLine={false} axisLine={false} width={36} allowDecimals={false} />
                    <RechartsTooltip contentStyle={chartTooltipSx} labelFormatter={(l) => formatChartAxisDate(String(l))} />
                    <Bar dataKey="errors" fill={ax.chart.errors} radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartPanel>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ChartPanel title="Revenue by product" description="Recognized revenue in range.">
                {paymentBars.length === 0 ? (
                  <Typography color="text.disabled" sx={{ py: 8, textAlign: 'center' }}>
                    No paid orders in this range.
                  </Typography>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={paymentBars} layout="vertical" margin={{ left: 4, right: 12 }}>
                      <CartesianGrid stroke={ax.chart.grid} strokeDasharray="4 4" horizontal={false} />
                      <XAxis type="number" tick={chartAxisTick} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="name" width={118} tick={chartAxisTick} tickLine={false} />
                      <RechartsTooltip
                        contentStyle={chartTooltipSx}
                        formatter={(value, name) =>
                          name === 'revenue_inr' ? [formatInr(Number(value ?? 0)), 'Revenue'] : [value, 'Orders']
                        }
                      />
                      <Bar dataKey="revenue_inr" fill={ax.chart.product} radius={[0, 8, 8, 0]} barSize={22} name="revenue_inr" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartPanel>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ChartPanel title="Counseling pipeline" description="New requests by status.">
                {counselingPie.length === 0 ? (
                  <Typography color="text.disabled" sx={{ py: 8, textAlign: 'center' }}>
                    No counseling requests in this range.
                  </Typography>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={counselingPie}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={96}
                        paddingAngle={3}
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        labelLine={{ stroke: ax.border.strong }}
                      >
                        {counselingPie.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="rgba(0,0,0,0.2)" />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={chartTooltipSx} />
                      <Legend wrapperStyle={{ ...chartLegendStyle, paddingTop: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartPanel>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ChartPanel title="Assessment tier mix" description="Among completed sessions only.">
                {tierBars.length === 0 ? (
                  <Typography color="text.disabled" sx={{ py: 8, textAlign: 'center' }}>
                    No completed sessions in this range.
                  </Typography>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={tierBars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke={ax.chart.grid} strokeDasharray="4 4" vertical={false} />
                      <XAxis dataKey="tier" tick={chartAxisTick} tickLine={false} axisLine={{ stroke: ax.border.subtle }} interval={0} />
                      <YAxis tick={chartAxisTick} tickLine={false} axisLine={false} width={36} allowDecimals={false} />
                      <RechartsTooltip contentStyle={chartTooltipSx} />
                      <Bar dataKey="n" fill={ax.chart.tier} radius={[6, 6, 0, 0]} maxBarSize={56} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartPanel>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <ChartPanel title="Top careers (#1 match)" description="Most frequent #1 career match for completed sessions.">
                <TableContainer sx={{ borderRadius: 2, border: `1px solid ${ax.border.subtle}`, overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha('#0f172a', 0.6) }}>
                        <TableCell sx={{ fontWeight: 800, color: 'text.secondary', borderBottom: `1px solid ${ax.border.subtle}` }}>
                          #
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: 'text.secondary', borderBottom: `1px solid ${ax.border.subtle}` }}>
                          Career
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary', borderBottom: `1px solid ${ax.border.subtle}` }}>
                          Sessions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payload.assessments.top_careers_rank1.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3}>
                            <Typography color="text.disabled" sx={{ py: 3 }}>
                              No data in this range.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        payload.assessments.top_careers_rank1.map((row, idx) => (
                          <TableRow
                            key={row.slug ?? row.name}
                            hover
                            sx={{
                              '&:nth-of-type(even)': { bgcolor: alpha('#0f172a', 0.35) },
                              '&:last-child td': { borderBottom: 0 },
                            }}
                          >
                            <TableCell sx={{ color: 'text.disabled', fontWeight: 700, width: 48 }}>{idx + 1}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                            <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
                              {formatNumber(row.count)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </ChartPanel>
            </Grid>
          </Grid>

          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 3, pt: 2, borderTop: `1px solid ${ax.border.subtle}` }}>
            <Chip
              size="small"
              variant="outlined"
              label={`${payload.range.from} → ${payload.range.to}`}
              sx={{ fontWeight: 600, borderColor: ax.border.strong }}
            />
            <Chip size="small" variant="outlined" label={`${payload.range.span_days} days · ${payload.range.timezone}`} sx={{ fontWeight: 600 }} />
          </Stack>
        </>
      ) : null}
    </Stack>
  );
}

'use client';

import { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { alpha } from '@mui/material/styles';
import { useAuthStore } from '@/stores/authStore';
import { fetchGameDashboard, fetchGameContent, fetchResumeSession } from '@/features/game-assessment/api';
import { fetchReportTeaser } from '@/features/career-report/api';
import { PREMIUM_UPGRADE_FROM_REPORT_INR } from '@/lib/productCopy';
import { getCareers } from '@/features/careers/api';
import { DashboardSkeleton } from '@/components/ui/Loaders';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  LinearProgress,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';

const PHASE_LABELS: Record<string, string> = {
  logic: 'Assessment',
  risk: 'Assessment',
  planner: 'Assessment',
  scenario: 'Career questionnaire',
  processing: 'Analyzing',
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay },
});

const glassCard = {
  borderRadius: 3,
  bgcolor: alpha('#fff', 0.92),
  backdropFilter: 'blur(14px)',
  border: `1px solid ${alpha('#000', 0.06)}`,
  boxShadow: `0 4px 24px ${alpha('#0f172a', 0.06)}`,
};

const liftHover = {
  transition: 'box-shadow 0.25s ease, transform 0.2s ease, border-color 0.2s ease',
  '&:hover': {
    boxShadow: `0 16px 48px ${alpha('#16a34a', 0.12)}`,
    transform: 'translateY(-2px)',
    borderColor: alpha('#16a34a', 0.25),
  },
};

function StatPill({
  label,
  value,
  accent = 'neutral',
}: {
  label: string;
  value: string;
  accent?: 'green' | 'amber' | 'slate' | 'neutral';
}) {
  const colors = {
    green: { bg: alpha('#16a34a', 0.1), border: alpha('#16a34a', 0.22), fg: '#15803d' },
    amber: { bg: alpha('#d97706', 0.1), border: alpha('#d97706', 0.22), fg: '#b45309' },
    slate: { bg: alpha('#64748b', 0.1), border: alpha('#64748b', 0.18), fg: '#475569' },
    neutral: { bg: alpha('#0f172a', 0.04), border: alpha('#0f172a', 0.08), fg: '#111827' },
  }[accent];
  return (
    <Box
      sx={{
        px: 2,
        py: 1.25,
        borderRadius: 2,
        bgcolor: colors.bg,
        border: `1px solid ${colors.border}`,
        minWidth: { xs: '100%', sm: 0 },
        flex: { sm: '1 1 0' },
      }}
    >
      <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', letterSpacing: 0.6, textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: colors.fg, mt: 0.25 }}>{value}</Typography>
    </Box>
  );
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['game-content', 'free'],
      queryFn: () => fetchGameContent(),
    });
    router.prefetch('/game-assessment');
  }, [queryClient, router]);

  const { data, isLoading: dashLoading } = useQuery({
    queryKey: ['game-dashboard'],
    queryFn: fetchGameDashboard,
  });

  const attempts = Array.isArray(data?.attempts) ? data.attempts : [];
  const inProgressAttempt = attempts.find((a) => !a.is_complete);

  const { data: resumeInfo } = useQuery({
    queryKey: ['game-resume'],
    queryFn: fetchResumeSession,
    enabled: !dashLoading && !!inProgressAttempt,
  });

  const { data: gameContent } = useQuery({
    queryKey: ['game-content', 'free'],
    queryFn: fetchGameContent,
    enabled: !dashLoading && !!inProgressAttempt,
  });

  const latestSessionId = data?.latest_result_session_id;
  const { data: teaser } = useQuery({
    queryKey: ['report-teaser', latestSessionId],
    queryFn: () => fetchReportTeaser(latestSessionId!),
    enabled: !!latestSessionId,
  });

  const { data: careersData } = useQuery({
    queryKey: ['careers'],
    queryFn: getCareers,
  });

  const sampleCareers = Array.isArray(careersData) ? careersData.slice(0, 4) : [];

  const state = useMemo(() => {
    if (!attempts.length) return 'new' as const;
    if (inProgressAttempt) return 'in_progress' as const;
    if (data?.latest_report_paid) return 'completed_paid' as const;
    return 'completed_unpaid' as const;
  }, [attempts.length, inProgressAttempt, data?.latest_report_paid]);

  const progressPercent = useMemo(() => {
    if (state === 'new') return 0;
    if (state !== 'in_progress') return 100;
    const need =
      inProgressAttempt?.assessment_tier === 'premium'
        ? gameContent?.question_counts?.premium ?? 50
        : gameContent?.question_counts?.free ?? 40;
    const sess = resumeInfo?.session;
    const sid = sess?.session_id;
    const answered =
      sid && inProgressAttempt && sid === inProgressAttempt.id
        ? sess.scenario_answer_index ?? 0
        : 0;
    if (!need) return 0;
    return Math.min(100, Math.round((answered / need) * 100));
  }, [state, inProgressAttempt, resumeInfo, gameContent]);

  const completedCount = attempts.filter((a) => a.is_complete).length;
  const displayName = user?.first_name?.trim() || user?.email?.split('@')[0] || 'there';
  const initial = (displayName[0] || '?').toUpperCase();

  if (dashLoading) return <DashboardSkeleton />;

  const nextStepCopy =
    state === 'new'
      ? 'Start the game-style assessment to unlock your stream direction and top career matches.'
      : state === 'in_progress'
        ? 'Pick up where you left off — every answer sharpens your profile.'
        : data?.latest_report_paid
          ? 'Your full report is ready. Share it with parents or a counsellor when you plan subjects.'
          : 'Review your results and unlock the full report when you are ready.';

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
      {/* ── Hero ───────────────────────────────────────────── */}
      <motion.div {...fadeUp()}>
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 4,
            p: { xs: 2.5, sm: 3.5 },
            mb: 3,
            background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 35%, #eff6ff 100%)',
            border: `1px solid ${alpha('#16a34a', 0.18)}`,
            boxShadow: `0 8px 32px ${alpha('#16a34a', 0.08)}`,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -40,
              right: -20,
              width: 180,
              height: 180,
              borderRadius: '50%',
              bgcolor: alpha('#fff', 0.45),
              pointerEvents: 'none',
            }}
          />
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2.5, alignItems: { sm: 'center' } }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                fontSize: '1.5rem',
                fontWeight: 800,
                bgcolor: '#16a34a',
                color: '#fff',
                border: `3px solid ${alpha('#fff', 0.9)}`,
                boxShadow: `0 4px 16px ${alpha('#16a34a', 0.35)}`,
              }}
            >
              {initial}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                component="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.5rem', sm: '1.85rem' },
                  color: '#0f172a',
                  letterSpacing: -0.5,
                  lineHeight: 1.2,
                }}
              >
                Welcome back, {displayName}
              </Typography>
              <Typography sx={{ color: '#64748b', mt: 0.75, fontSize: { xs: '0.9rem', sm: '0.95rem' }, maxWidth: 560 }}>
                Your home for assessments, career matches, and next steps — all in one calm place.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 3, position: 'relative' }}>
            <StatPill label="Assessments" value={`${attempts.length}`} accent="slate" />
            <StatPill
              label="Journey"
              value={
                state === 'new'
                  ? 'Not started'
                  : state === 'in_progress'
                    ? 'In progress'
                    : data?.latest_report_paid
                      ? 'Report ready'
                      : 'Results ready'
              }
              accent={state === 'in_progress' ? 'amber' : state === 'new' ? 'neutral' : 'green'}
            />
            <StatPill
              label="Full report"
              value={data?.latest_report_paid ? 'Unlocked' : completedCount ? 'Locked / teaser' : '—'}
              accent={data?.latest_report_paid ? 'green' : completedCount ? 'amber' : 'neutral'}
            />
          </Box>
        </Box>
      </motion.div>

      {latestSessionId && teaser?.premium_upgrade_available && (
        <motion.div {...fadeUp(0.04)}>
          <Box
            sx={{
              mb: 2.5,
              p: { xs: 2, sm: 2.25 },
              borderRadius: 3,
              border: '1px solid #93c5fd',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              boxShadow: `0 8px 28px ${alpha('#2563eb', 0.12)}`,
            }}
          >
            <Typography
              sx={{
                fontSize: '0.65rem',
                fontWeight: 800,
                color: '#1d4ed8',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                mb: 0.75,
              }}
            >
              Stronger accuracy
            </Typography>
            <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '0.95rem', sm: '1.05rem' }, mb: 1, lineHeight: 1.35 }}>
              Want a more confident stream and career read?
            </Typography>
            <Typography sx={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.55, mb: 1.75 }}>
              Your report is from Phase 1 only. Add the short premium assignment — pay{' '}
              <Box component="span" sx={{ fontWeight: 800, color: '#1e40af' }}>
                ₹{teaser.premium_upgrade_price_inr ?? PREMIUM_UPGRADE_FROM_REPORT_INR} more
              </Box>{' '}
              to complete the full bundle and refine your matches.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => router.push(`/report?session=${latestSessionId}#premium-upgrade`)}
              sx={{
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: 2,
                py: 1.15,
                bgcolor: '#2563eb',
                boxShadow: '0 6px 18px rgba(37,99,235,0.28)',
                '&:hover': { bgcolor: '#1d4ed8' },
              }}
            >
              Upgrade accuracy — ₹{teaser.premium_upgrade_price_inr ?? PREMIUM_UPGRADE_FROM_REPORT_INR}
            </Button>
          </Box>
        </motion.div>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 300px' },
          gap: { xs: 2.5, lg: 3 },
          alignItems: 'start',
        }}
      >
        {/* ── Main column ───────────────────────────────── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Primary journey */}
          <motion.div {...fadeUp(0.06)}>
            <Box sx={{ ...glassCard, p: { xs: 2.5, sm: 3 }, ...liftHover }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1.75 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor:
                        state === 'new'
                          ? alpha('#64748b', 0.12)
                          : state === 'in_progress'
                            ? alpha('#d97706', 0.15)
                            : alpha('#16a34a', 0.14),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.35rem',
                      flexShrink: 0,
                    }}
                  >
                    {state === 'completed_paid' || (state === 'completed_unpaid' && !inProgressAttempt) ? '✓' : state === 'in_progress' ? '◉' : '◇'}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase' }}>
                      Your journey
                    </Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a', mt: 0.35 }}>
                      Career assessment
                    </Typography>
                    <Typography sx={{ fontSize: '0.88rem', color: '#64748b', mt: 0.5, lineHeight: 1.55 }}>
                      {state === 'new' && 'Take the interactive questionnaire to see your stream and top career fits.'}
                      {state === 'in_progress' &&
                        `Last activity ${new Date(inProgressAttempt!.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} · ${PHASE_LABELS[inProgressAttempt!.resume_phase || 'scenario'] ?? 'In progress'}`}
                      {(state === 'completed_unpaid' || state === 'completed_paid') &&
                        attempts[0] &&
                        `Completed ${new Date(attempts[0].completed_at || attempts[0].created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.75 }}>
                  {state === 'completed_paid' && (
                    <Chip label="Report unlocked" size="small" sx={{ fontWeight: 700, bgcolor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }} />
                  )}
                  {state === 'completed_unpaid' && !inProgressAttempt && (
                    <Chip label="Teaser available" size="small" sx={{ fontWeight: 700, bgcolor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }} />
                  )}
                  {inProgressAttempt?.assessment_tier === 'premium' && (
                    <Chip label="Premium" size="small" sx={{ fontWeight: 700, bgcolor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }} />
                  )}
                </Box>
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                    {state === 'new' && 'Progress'}
                    {state === 'in_progress' && `Questionnaire · ${progressPercent}%`}
                    {(state === 'completed_unpaid' || state === 'completed_paid') && 'Progress · complete'}
                  </Typography>
                  {state === 'in_progress' && (
                    <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>{progressPercent}%</Typography>
                  )}
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={state === 'new' ? 0 : state === 'in_progress' ? progressPercent : 100}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: alpha('#0f172a', 0.06),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      background: 'linear-gradient(90deg, #22c55e, #16a34a, #15803d)',
                    },
                  }}
                />
              </Box>

              {state === 'new' && (
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={() => router.push('/game-assessment')}
                  sx={{
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    textTransform: 'none',
                    fontWeight: 800,
                    borderRadius: 2.5,
                    py: 1.6,
                    fontSize: '1rem',
                    boxShadow: '0 8px 28px rgba(22,163,74,0.32)',
                    '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)' },
                  }}
                >
                  Start career assessment
                </Button>
              )}
              {state === 'in_progress' && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => router.push(`/game-assessment?resume=${inProgressAttempt!.id}`)}
                    sx={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #16a34a, #15803d)',
                      textTransform: 'none',
                      fontWeight: 800,
                      borderRadius: 2.5,
                      py: 1.45,
                      boxShadow: '0 6px 22px rgba(22,163,74,0.28)',
                      '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)' },
                    }}
                  >
                    Continue where you left off
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/game-assessment')}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5, borderColor: alpha('#0f172a', 0.12), color: '#475569', px: 2.5 }}
                  >
                    New attempt
                  </Button>
                </Box>
              )}
              {(state === 'completed_unpaid' || state === 'completed_paid') && !inProgressAttempt && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => router.push(`/report?session=${latestSessionId}`)}
                    sx={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #16a34a, #15803d)',
                      textTransform: 'none',
                      fontWeight: 800,
                      borderRadius: 2.5,
                      py: 1.45,
                      boxShadow: '0 6px 22px rgba(22,163,74,0.28)',
                      '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)' },
                    }}
                  >
                    {state === 'completed_paid' ? 'Open full career report' : 'View results & unlock options'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/game-assessment')}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5, borderColor: alpha('#0f172a', 0.12), color: '#475569', px: 2.5 }}
                  >
                    Retake assessment
                  </Button>
                </Box>
              )}
            </Box>
          </motion.div>

          {/* Career match */}
          {latestSessionId && teaser && (
            <motion.div {...fadeUp(0.1)}>
              <Box
                sx={{
                  ...glassCard,
                  ...liftHover,
                  p: { xs: 2.5, sm: 3 },
                  background: 'linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 45%, #f8fafc 100%)',
                  border: `1px solid ${alpha('#16a34a', 0.2)}`,
                }}
              >
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803d', letterSpacing: 1, textTransform: 'uppercase', mb: 1 }}>
                  Top direction
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {teaser.hero_career_category ? (
                    <>
                      <Typography sx={{ fontSize: { xs: '1.35rem', sm: '1.5rem' }, fontWeight: 900, color: '#15803d', lineHeight: 1.15, letterSpacing: -0.3 }}>
                        {teaser.hero_career_category}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap', mt: 0.75 }}>
                        <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b' }}>{teaser.hero_career}</Typography>
                        <Chip label={teaser.hero_confidence} size="small" sx={{ fontWeight: 700, bgcolor: '#fff', color: '#16a34a', border: '1px solid #bbf7d0' }} />
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontSize: { xs: '1.35rem', sm: '1.5rem' }, fontWeight: 900, color: '#16a34a' }}>{teaser.hero_career}</Typography>
                      <Chip label={teaser.hero_confidence} size="small" sx={{ fontWeight: 700, bgcolor: '#fff', color: '#16a34a', border: '1px solid #bbf7d0' }} />
                    </Box>
                  )}
                </Box>
                {teaser.stream_recommendation && (
                  <Typography sx={{ fontSize: '0.86rem', color: '#475569', mb: 2, lineHeight: 1.6 }}>
                    Suggested stream: <strong style={{ color: '#0f172a' }}>{teaser.stream_recommendation}</strong>
                  </Typography>
                )}
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => router.push(`/report?session=${latestSessionId}`)}
                  sx={{
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    textTransform: 'none',
                    fontWeight: 800,
                    borderRadius: 2,
                    py: 1.35,
                    boxShadow: '0 6px 20px rgba(22,163,74,0.22)',
                    '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)' },
                  }}
                >
                  {data?.latest_report_paid ? 'View full report' : 'Open results page'}
                </Button>
              </Box>
            </motion.div>
          )}

          {/* Past runs */}
          {attempts.length > 1 && (
            <motion.div {...fadeUp(0.14)}>
              <Box sx={{ ...glassCard, p: { xs: 2.5, sm: 3 } }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', mb: 1.5 }}>
                  History
                </Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', mb: 2 }}>Past assessments</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {attempts.slice(0, 6).map((a) => (
                    <Box
                      key={a.id}
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'stretch', sm: 'center' },
                        gap: 1.25,
                        py: 1.75,
                        borderBottom: `1px solid ${alpha('#0f172a', 0.06)}`,
                        '&:last-of-type': { borderBottom: 0, pb: 0 },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                        <Typography sx={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600, minWidth: 100 }}>
                          {new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Typography>
                        <Chip
                          label={a.is_complete ? 'Done' : 'In progress'}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            height: 26,
                            bgcolor: a.is_complete ? '#f0fdf4' : '#fffbeb',
                            color: a.is_complete ? '#15803d' : '#b45309',
                            border: `1px solid ${a.is_complete ? '#bbf7d0' : '#fde68a'}`,
                          }}
                        />
                        {!a.is_complete && a.resume_phase && (
                          <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8' }}>{PHASE_LABELS[a.resume_phase] ?? a.resume_phase}</Typography>
                        )}
                      </Box>
                      {a.is_complete ? (
                        <Button
                          size="medium"
                          variant="text"
                          onClick={() => router.push(`/report?session=${a.id}`)}
                          sx={{ textTransform: 'none', fontWeight: 800, color: '#16a34a', alignSelf: { xs: 'flex-start', sm: 'center' } }}
                        >
                          {a.is_report_paid ? 'Open report →' : 'View results →'}
                        </Button>
                      ) : (
                        <Button
                          size="medium"
                          variant="text"
                          onClick={() => router.push(`/game-assessment?resume=${a.id}`)}
                          sx={{ textTransform: 'none', fontWeight: 800, color: '#d97706', alignSelf: { xs: 'flex-start', sm: 'center' } }}
                        >
                          Continue →
                        </Button>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            </motion.div>
          )}

          {/* Careers */}
          <motion.div {...fadeUp(0.18)}>
            <Box sx={{ ...glassCard, p: { xs: 2.5, sm: 3 }, ...liftHover }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', mb: 1 }}>
                Explore
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', mb: 0.5 }}>Career ideas to browse</Typography>
              <Typography sx={{ color: '#64748b', mb: 2.5, fontSize: '0.9rem', lineHeight: 1.65 }}>
                Short reads on roles that often pair well with science, commerce, and arts streams.
              </Typography>

              {sampleCareers.length > 0 ? (
                <>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 1.25,
                      mb: 2,
                    }}
                  >
                    {sampleCareers.map((c) => (
                      <Box
                        key={c.id}
                        component={Link}
                        href={`/careers/${c.slug}`}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          textDecoration: 'none',
                          color: 'inherit',
                          p: 1.75,
                          borderRadius: 2,
                          bgcolor: alpha('#0f172a', 0.025),
                          border: `1px solid ${alpha('#0f172a', 0.06)}`,
                          transition: '0.2s ease',
                          '&:hover': {
                            bgcolor: alpha('#16a34a', 0.07),
                            borderColor: alpha('#16a34a', 0.22),
                          },
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.name}
                          </Typography>
                          <Chip label={c.stream} size="small" sx={{ mt: 0.75, height: 22, fontSize: '0.68rem', fontWeight: 700, bgcolor: alpha('#16a34a', 0.1), color: '#15803d' }} />
                        </Box>
                        <Typography sx={{ color: '#cbd5e1', fontWeight: 700 }}>→</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Button
                    variant="outlined"
                    fullWidth
                    component={Link}
                    href="/careers"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 800,
                      borderRadius: 2,
                      py: 1.1,
                      borderColor: alpha('#0f172a', 0.12),
                      color: '#334155',
                      '&:hover': { borderColor: '#16a34a', color: '#15803d', bgcolor: alpha('#16a34a', 0.05) },
                    }}
                  >
                    Browse all careers
                  </Button>
                </>
              ) : (
                <Button variant="outlined" fullWidth component={Link} href="/careers" sx={{ textTransform: 'none', fontWeight: 800, py: 1.1, borderRadius: 2 }}>
                  Open career library
                </Button>
              )}
            </Box>
          </motion.div>
        </Box>

        {/* ── Sidebar (desktop) ───────────────────────────── */}
        <Box
          sx={{
            display: { xs: 'none', lg: 'flex' },
            flexDirection: 'column',
            gap: 2,
            position: 'sticky',
            top: 88,
          }}
        >
          <motion.div {...fadeUp(0.08)}>
            <Box sx={{ ...glassCard, p: 2.5 }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', mb: 1.5 }}>
                Next step
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.65, fontWeight: 500 }}>{nextStepCopy}</Typography>
            </Box>
          </motion.div>

          <motion.div {...fadeUp(0.12)}>
            <Box sx={{ ...glassCard, p: 2.5 }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', mb: 1.5 }}>
                Shortcuts
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Button fullWidth variant="text" onClick={() => router.push('/game-assessment')} sx={{ justifyContent: 'flex-start', textTransform: 'none', fontWeight: 700, color: '#0f172a', borderRadius: 2, py: 1 }}>
                  Assessment
                </Button>
                <Button fullWidth variant="text" component={Link} href="/careers" sx={{ justifyContent: 'flex-start', textTransform: 'none', fontWeight: 700, color: '#0f172a', borderRadius: 2, py: 1 }}>
                  Careers
                </Button>
                {latestSessionId && (
                  <Button
                    fullWidth
                    variant="text"
                    onClick={() => router.push(`/report?session=${latestSessionId}`)}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none', fontWeight: 700, color: '#16a34a', borderRadius: 2, py: 1 }}
                  >
                    Latest results
                  </Button>
                )}
              </Box>
            </Box>
          </motion.div>

          <motion.div {...fadeUp(0.16)}>
            <Box
              sx={{
                ...glassCard,
                p: 2.5,
                background: `linear-gradient(160deg, ${alpha('#eff6ff', 0.9)} 0%, ${alpha('#fff', 0.95)} 100%)`,
                border: `1px solid ${alpha('#3b82f6', 0.15)}`,
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e40af', mb: 1 }}>Tip</Typography>
              <Typography sx={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.65 }}>
                Discuss your stream and report with a parent or counsellor — data-backed conversations are easier than guessing.
              </Typography>
            </Box>
          </motion.div>

          <Box sx={{ px: 0.5 }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6 }}>
              <Link href="/terms" style={{ color: '#64748b', fontWeight: 600 }}>
                Terms
              </Link>
              {' · '}
              <Link href="/privacy" style={{ color: '#64748b', fontWeight: 600 }}>
                Privacy
              </Link>
            </Typography>
          </Box>
        </Box>

        {/* Mobile: next step + tip below main */}
        <Box sx={{ display: { xs: 'flex', lg: 'none' }, flexDirection: 'column', gap: 2, gridColumn: '1 / -1' }}>
          <Box sx={{ ...glassCard, p: 2.5 }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', mb: 1 }}>
              Next step
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.65 }}>{nextStepCopy}</Typography>
          </Box>
          <Box
            sx={{
              ...glassCard,
              p: 2.5,
              background: `linear-gradient(160deg, ${alpha('#eff6ff', 0.9)} 0%, ${alpha('#fff', 0.95)} 100%)`,
              border: `1px solid ${alpha('#3b82f6', 0.15)}`,
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e40af', mb: 1 }}>Tip</Typography>
            <Typography sx={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.65 }}>
              Share results when you plan Class 11–12 subjects — alignment now saves regret later.
            </Typography>
          </Box>
          <Divider sx={{ borderColor: alpha('#0f172a', 0.08) }} />
          <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
            <Link href="/terms" style={{ color: '#64748b', fontWeight: 600 }}>
              Terms
            </Link>
            {' · '}
            <Link href="/privacy" style={{ color: '#64748b', fontWeight: 600 }}>
              Privacy
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

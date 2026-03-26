'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { fetchGameDashboard, fetchGameContent } from '@/features/game-assessment/api';
import { fetchReportTeaser } from '@/features/career-report/api';
import { getCareers } from '@/features/careers/api';
import { getProfile } from '@/features/profile/api';
import { ProfileForm } from '@/features/profile/ProfileForm';
import { DashboardSkeleton } from '@/components/ui/Loaders';
import { Box, Button, Chip, Container, LinearProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const PHASE_LABELS: Record<string, string> = {
  logic: 'Assessment',
  risk: 'Assessment',
  planner: 'Assessment',
  scenario: '30 questions',
  processing: 'Analyzing',
};

const PHASE_PROGRESS: Record<string, number> = {
  logic: 100,
  risk: 100,
  planner: 100,
  scenario: 100,
};

const cardBase = {
  bgcolor: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(12px)',
  borderRadius: 3,
  border: '1px solid rgba(0,0,0,0.06)',
  p: { xs: 2.5, sm: 3.5 },
  transition: 'box-shadow 0.3s ease, transform 0.25s ease, border-color 0.2s ease',
  '&:hover': {
    boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
    transform: 'translateY(-3px)',
    borderColor: 'rgba(22,163,74,0.2)',
  },
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.prefetchQuery({ queryKey: ['game-content'], queryFn: fetchGameContent });
    router.prefetch('/game-assessment');
  }, [queryClient, router]);

  const { data, isLoading: dashLoading } = useQuery({
    queryKey: ['game-dashboard'],
    queryFn: fetchGameDashboard,
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
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

  const attempts = Array.isArray(data?.attempts) ? data.attempts : [];
  const sampleCareers = Array.isArray(careersData) ? careersData.slice(0, 3) : [];

  const inProgressAttempt = attempts.find((a) => !a.is_complete);
  const progressPercent = inProgressAttempt?.resume_phase
    ? PHASE_PROGRESS[inProgressAttempt.resume_phase] ?? 0
    : 0;

  const state =
    !attempts.length
      ? 'new'
      : inProgressAttempt
        ? 'in_progress'
        : data?.latest_report_paid
          ? 'completed_paid'
          : 'completed_unpaid';

  if (dashLoading && profileLoading) return <DashboardSkeleton />;

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
      {/* Header + Emotional tagline */}
      <motion.div {...fadeUp()}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#111827',
              letterSpacing: -0.5,
              fontSize: { xs: '1.6rem', sm: '2rem' },
            }}
          >
            Dashboard
          </Typography>
          <Typography sx={{ color: '#6b7280', mt: 0.5, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            Welcome back, {user?.first_name || user?.email}
          </Typography>
        </Box>
        <Typography
          sx={{
            color: '#16a34a',
            fontWeight: 600,
            fontSize: '0.9rem',
            mb: 4,
            fontStyle: 'italic',
          }}
        >
          Discover your strengths. Align your future.
        </Typography>
      </motion.div>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Profile */}
        <motion.div {...fadeUp(0.05)}>
          <ProfileForm profile={profile ?? null} />
        </motion.div>

        {/* 1️⃣ Assessment Status Card */}
        <motion.div {...fadeUp(0.1)}>
          <Box sx={{ ...cardBase }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: state === 'new' ? 'rgba(107,114,128,0.1)' : 'rgba(22,163,74,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                }}
              >
                {state === 'completed_paid' || (state === 'completed_unpaid' && !inProgressAttempt)
                  ? '✔'
                  : '📋'}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1.15rem', color: '#111827' }}>
                  Assessment Status
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#6b7280', mt: 0.25 }}>
                  {state === 'new' && 'Not started yet'}
                  {state === 'in_progress' &&
                    `Last activity: ${new Date(inProgressAttempt!.created_at).toLocaleDateString()}`}
                  {(state === 'completed_unpaid' || state === 'completed_paid') &&
                    attempts[0] &&
                    `Completed ${new Date(attempts[0].created_at).toLocaleDateString()}`}
                </Typography>
              </Box>
            </Box>

            {/* Progress bar */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                  {state === 'new'
                    ? 'Assessment: 0% completed'
                    : state === 'in_progress'
                      ? `Assessment: ${progressPercent}% completed`
                      : 'Assessment completed ✔'}
                </Typography>
                {state === 'completed_paid' && (
                  <Chip
                    label="Report unlocked"
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      bgcolor: '#f0fdf4',
                      color: '#16a34a',
                      border: '1px solid #bbf7d0',
                    }}
                  />
                )}
                {state === 'completed_unpaid' && !inProgressAttempt && (
                  <Chip
                    label="Report locked"
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      bgcolor: '#fffbeb',
                      color: '#d97706',
                      border: '1px solid #fde68a',
                    }}
                  />
                )}
              </Box>
              <LinearProgress
                variant="determinate"
                value={state === 'new' ? 0 : state === 'in_progress' ? progressPercent : 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(0,0,0,0.06)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #16a34a, #15803d)',
                  },
                }}
              />
            </Box>

            {/* CTA based on state */}
            {state === 'new' && (
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => router.push('/game-assessment')}
                sx={{
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 2.5,
                  py: 1.5,
                  fontSize: '1rem',
                  boxShadow: '0 6px 20px rgba(22,163,74,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #15803d, #166534)',
                    boxShadow: '0 8px 28px rgba(22,163,74,0.35)',
                  },
                }}
              >
                Start Career Assessment →
              </Button>
            )}
            {state === 'in_progress' && (
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => router.push(`/game-assessment?resume=${inProgressAttempt!.id}`)}
                  sx={{
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2.5,
                    py: 1.4,
                    boxShadow: '0 6px 20px rgba(22,163,74,0.25)',
                    '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)' },
                  }}
                >
                  Continue Assessment →
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/game-assessment')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2.5,
                    borderColor: 'rgba(0,0,0,0.15)',
                    color: '#374151',
                  }}
                >
                  Retake from start
                </Button>
              </Box>
            )}
            {(state === 'completed_unpaid' || state === 'completed_paid') && !inProgressAttempt && (
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => router.push(`/report?session=${latestSessionId}`)}
                  sx={{
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2.5,
                    py: 1.4,
                    boxShadow: '0 6px 20px rgba(22,163,74,0.25)',
                    '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)' },
                  }}
                >
                  {state === 'completed_paid' ? '📊 View Career Report' : '🔓 View Your Results'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/game-assessment')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2.5,
                    borderColor: 'rgba(0,0,0,0.15)',
                    color: '#374151',
                  }}
                >
                  Retake assessment
                </Button>
              </Box>
            )}
          </Box>
        </motion.div>

        {/* 2️⃣ Your Career Match (if completed) */}
        {latestSessionId && teaser && (
          <motion.div {...fadeUp(0.15)}>
            <Box
              sx={{
                ...cardBase,
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)',
                border: '1px solid #bbf7d0',
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: '1.15rem', color: '#111827', mb: 0.5 }}>
                Your Career Match
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>
                  {teaser.hero_career}
                </Typography>
                <Chip
                  label={teaser.hero_confidence}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    bgcolor: '#fff',
                    color: '#16a34a',
                    border: '1px solid #bbf7d0',
                  }}
                />
              </Box>
              <Button
                variant="contained"
                fullWidth
                onClick={() => router.push(`/report?session=${latestSessionId}`)}
                sx={{
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 2,
                  py: 1.3,
                  boxShadow: '0 4px 14px rgba(22,163,74,0.25)',
                  '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)' },
                }}
              >
                {data?.latest_report_paid ? '📊 View Full Report' : '🔓 View Results'}
              </Button>
            </Box>
          </motion.div>
        )}

        {/* Past assessments (if more than 1) */}
        {attempts.length > 1 && (
          <motion.div {...fadeUp(0.2)}>
            <Box sx={cardBase}>
              <Typography sx={{ fontWeight: 700, fontSize: '1.15rem', color: '#111827', mb: 2 }}>
                Past Assessments
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {attempts.slice(0, 5).map((a) => (
                  <Box
                    key={a.id}
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: 1,
                      py: 1.5,
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      '&:last-child': { borderBottom: 0, pb: 0 },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography sx={{ color: '#6b7280', fontSize: '0.88rem' }}>
                        {new Date(a.created_at).toLocaleDateString()}
                      </Typography>
                      <Chip
                        label={a.is_complete ? 'Completed' : 'In Progress'}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.72rem',
                          height: 24,
                          bgcolor: a.is_complete ? '#f0fdf4' : '#fffbeb',
                          color: a.is_complete ? '#16a34a' : '#d97706',
                          border: `1px solid ${a.is_complete ? '#bbf7d0' : '#fde68a'}`,
                        }}
                      />
                      {!a.is_complete && a.resume_phase && (
                        <Typography sx={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                          {PHASE_LABELS[a.resume_phase] ?? a.resume_phase}
                        </Typography>
                      )}
                    </Box>
                    {a.is_complete ? (
                      <Button
                        size="small"
                        onClick={() => router.push(`/report?session=${a.id}`)}
                        sx={{ textTransform: 'none', fontWeight: 600, color: '#16a34a', fontSize: '0.82rem' }}
                      >
                        {a.is_report_paid ? '📊 View Report' : 'View Results'}
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        onClick={() => router.push(`/game-assessment?resume=${a.id}`)}
                        sx={{ textTransform: 'none', fontWeight: 600, color: '#d97706', fontSize: '0.82rem' }}
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

        {/* 3️⃣ Explore Careers — sample cards + link */}
        <motion.div {...fadeUp(0.25)}>
          <Box sx={cardBase}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.15rem', color: '#111827', mb: 0.5 }}>
              Explore Possible Futures
            </Typography>
            <Typography sx={{ color: '#6b7280', mb: 2, fontSize: '0.9rem', lineHeight: 1.6 }}>
              Discover careers that could match your strengths and interests.
            </Typography>

            {sampleCareers.length > 0 ? (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                  {sampleCareers.map((c, i) => (
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
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'rgba(0,0,0,0.02)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'rgba(22,163,74,0.06)',
                          borderColor: 'rgba(22,163,74,0.2)',
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>
                          {c.name}
                        </Typography>
                        <Chip
                          label={c.stream}
                          size="small"
                          sx={{
                            mt: 0.5,
                            height: 20,
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            bgcolor: 'rgba(22,163,74,0.08)',
                            color: '#16a34a',
                            border: '1px solid rgba(22,163,74,0.15)',
                          }}
                        />
                      </Box>
                      <Typography sx={{ color: '#9ca3af', fontSize: '1rem' }}>→</Typography>
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
                    fontWeight: 600,
                    borderRadius: 2,
                    borderColor: 'rgba(0,0,0,0.15)',
                    color: '#374151',
                    '&:hover': { borderColor: '#16a34a', color: '#16a34a', bgcolor: 'rgba(22,163,74,0.04)' },
                  }}
                >
                  Explore all careers →
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                fullWidth
                component={Link}
                href="/careers"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  borderColor: 'rgba(0,0,0,0.15)',
                  color: '#374151',
                  '&:hover': { borderColor: '#16a34a', color: '#16a34a' },
                }}
              >
                Browse careers →
              </Button>
            )}
          </Box>
        </motion.div>
      </Box>
    </Container>
  );
}

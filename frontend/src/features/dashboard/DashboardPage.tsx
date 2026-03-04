'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { fetchGameDashboard } from '@/features/game-assessment/api';
import { getProfile } from '@/features/profile/api';
import { ProfileForm } from '@/features/profile/ProfileForm';
import { DashboardSkeleton } from '@/components/ui/Loaders';
import { Box, Button, Chip, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const PHASE_LABELS: Record<string, string> = {
  logic: 'Logic Challenge',
  risk: 'Risk Simulator',
  planner: 'Weekly Planner',
  scenario: 'Scenarios',
  processing: 'Ready to Submit',
};

const card = {
  bgcolor: 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(12px)',
  borderRadius: 3,
  border: '1px solid rgba(0,0,0,0.06)',
  p: { xs: 2.5, sm: 3.5 },
  transition: 'box-shadow 0.25s ease, transform 0.25s ease',
  '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' },
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay },
});

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const { data, isLoading: dashLoading } = useQuery({
    queryKey: ['game-dashboard'],
    queryFn: fetchGameDashboard,
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  if (dashLoading && profileLoading) return <DashboardSkeleton />;

  const latestSessionId = data?.latest_result_session_id;
  const attempts = Array.isArray(data?.attempts) ? data.attempts : [];

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 1, sm: 2 }, px: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <motion.div {...fadeUp()}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1, mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', letterSpacing: -0.5, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              Dashboard
            </Typography>
            <Typography sx={{ color: '#6b7280', mt: 0.5, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Welcome back, {user?.first_name || user?.email}
            </Typography>
          </Box>
          <Button
            onClick={() => { logout(); router.replace('/login'); }}
            sx={{
              color: '#6b7280',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
            }}
          >
            Logout
          </Button>
        </Box>
      </motion.div>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Profile */}
        <motion.div {...fadeUp(0.05)}>
          <ProfileForm profile={profile ?? null} />
        </motion.div>

        {/* Start CTA */}
        <motion.div {...fadeUp(0.1)}>
          <Box
            sx={{
              ...card,
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)',
              border: '1px solid #d1fae5',
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827', mb: 0.5 }}>
              Career Assessment
            </Typography>
            <Typography sx={{ color: '#6b7280', mb: 2.5, lineHeight: 1.6, fontSize: '0.9rem' }}>
              Take our game-based assessment to discover careers that match your interests and aptitude.
            </Typography>
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
                py: 1.4,
                fontSize: '1rem',
                boxShadow: '0 6px 20px rgba(22,163,74,0.25)',
                '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)', boxShadow: '0 8px 28px rgba(22,163,74,0.35)' },
              }}
            >
              Start Career Assessment →
            </Button>
          </Box>
        </motion.div>

        {/* Latest results */}
        {latestSessionId && (
          <motion.div {...fadeUp(0.15)}>
            <Box sx={card}>
              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827', mb: 0.5 }}>
                Your Latest Results
              </Typography>
              <Typography sx={{ color: '#6b7280', mb: 2, fontSize: '0.9rem' }}>
                {data?.latest_report_paid
                  ? 'View your career report and detailed analysis.'
                  : 'Your results are ready — unlock your premium career report.'}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  fullWidth={false}
                  onClick={() => router.push(`/game-assessment?view=${latestSessionId}`)}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: 'rgba(0,0,0,0.15)', color: '#374151', minHeight: 44 }}
                >
                  Quick View
                </Button>
                <Button
                  variant="contained"
                  onClick={() => router.push(`/report?session=${latestSessionId}`)}
                  sx={{
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2,
                    minHeight: 44,
                    boxShadow: '0 4px 14px rgba(22,163,74,0.2)',
                    '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)' },
                  }}
                >
                  {data?.latest_report_paid ? '📊 View Career Report' : '🔓 Unlock Career Report'}
                </Button>
              </Box>
            </Box>
          </motion.div>
        )}

        {/* Past assessments */}
        {attempts.length > 0 && (
          <motion.div {...fadeUp(0.2)}>
            <Box sx={card}>
              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827', mb: 2 }}>
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
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Button
                          size="small"
                          onClick={() => router.push(`/game-assessment?view=${a.id}`)}
                          sx={{ textTransform: 'none', fontWeight: 600, color: '#374151', fontSize: '0.82rem' }}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          onClick={() => router.push(`/report?session=${a.id}`)}
                          sx={{ textTransform: 'none', fontWeight: 600, color: '#16a34a', fontSize: '0.82rem' }}
                        >
                          {a.is_report_paid ? '📊 Report' : '🔓 Unlock'}
                        </Button>
                      </Box>
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

        {/* Explore careers */}
        <motion.div {...fadeUp(0.25)}>
          <Box sx={card}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827', mb: 0.5 }}>
              Explore Careers
            </Typography>
            <Typography sx={{ color: '#6b7280', mb: 2, fontSize: '0.9rem' }}>
              Browse our database of career options and discover possibilities.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => router.push('/careers')}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                borderColor: 'rgba(0,0,0,0.15)',
                color: '#374151',
                '&:hover': { borderColor: '#16a34a', color: '#16a34a' },
              }}
            >
              Browse Careers →
            </Button>
          </Box>
        </motion.div>
      </Box>
    </Container>
  );
}

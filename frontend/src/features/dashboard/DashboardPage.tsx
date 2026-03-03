'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { fetchGameDashboard } from '@/features/game-assessment/api';
import { getProfile } from '@/features/profile/api';
import { ProfileForm } from '@/features/profile/ProfileForm';
import { DashboardSkeleton } from '@/components/ui/Loaders';
import { Box, Button, Card, CardContent, Chip, Typography } from '@mui/material';

const PHASE_LABELS: Record<string, string> = {
  logic: 'Logic Challenge',
  risk: 'Risk Simulator',
  planner: 'Weekly Planner',
  scenario: 'Scenarios',
  processing: 'Ready to Submit',
};

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

  if (dashLoading && profileLoading) {
    return <DashboardSkeleton />;
  }

  const latestSessionId = data?.latest_result_session_id;
  const attempts = Array.isArray(data?.attempts) ? data.attempts : [];

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Dashboard</Typography>
          <Typography color="text.secondary">Welcome, {user?.first_name || user?.email}!</Typography>
        </Box>
        <Button onClick={logout}>Logout</Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <ProfileForm profile={profile ?? null} />

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>Get Started</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Take the career assessment to discover careers that match your interests and aptitude.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={() => router.push('/game-assessment')}
            >
              Start Career Assessment
            </Button>
          </CardContent>
        </Card>

        {latestSessionId && (
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Your Latest Results</Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>View your most recent career recommendations.</Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => router.push(`/game-assessment?view=${latestSessionId}`)}
                >
                  Quick View
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => router.push(`/report?session=${latestSessionId}`)}
                  sx={{ fontWeight: 600 }}
                >
                  Full Career Report
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {attempts.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Past Assessments</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {attempts.slice(0, 5).map((a) => (
                  <Box
                    key={a.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1.5,
                      borderBottom: 1,
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 0 },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography color="text.secondary">
                        {new Date(a.created_at).toLocaleDateString()}
                      </Typography>
                      <Chip
                        label={a.is_complete ? 'Completed' : 'In Progress'}
                        size="small"
                        color={a.is_complete ? 'success' : 'warning'}
                        variant="outlined"
                      />
                      {!a.is_complete && a.resume_phase && (
                        <Typography variant="caption" color="text.secondary">
                          — {PHASE_LABELS[a.resume_phase] ?? a.resume_phase}
                        </Typography>
                      )}
                    </Box>
                    {a.is_complete ? (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Button
                          color="primary"
                          size="small"
                          onClick={() => router.push(`/game-assessment?view=${a.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          color="success"
                          size="small"
                          variant="outlined"
                          onClick={() => router.push(`/report?session=${a.id}`)}
                        >
                          Report
                        </Button>
                      </Box>
                    ) : (
                      <Button
                        color="warning"
                        size="small"
                        variant="outlined"
                        onClick={() => router.push(`/game-assessment?resume=${a.id}`)}
                      >
                        Continue
                      </Button>
                    )}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>Explore Careers</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>Browse our database of career options.</Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => router.push('/careers')}
            >
              Browse Careers
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

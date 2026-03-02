'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { getDashboard } from '@/features/assessment/api';
import { getProfile } from '@/features/profile/api';
import { ProfileForm } from '@/features/profile/ProfileForm';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const latestId = data?.latest_result_attempt_id;
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
            <Button component={Link} href="/assessment" variant="contained" color="primary" size="large" fullWidth>
              Start Career Assessment
            </Button>
          </CardContent>
        </Card>

        {latestId && (
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Your Latest Results</Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>View your most recent career recommendations.</Typography>
              <Button component={Link} href={`/result?attempt=${latestId}`} variant="outlined" color="primary">
                View Results
              </Button>
            </CardContent>
          </Card>
        )}

        {attempts.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Past Attempts</Typography>
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
                    <Typography color="text.secondary">
                      {new Date(a.created_at).toLocaleDateString()} – {a.is_complete ? 'Completed' : 'Incomplete'}
                    </Typography>
                    {a.is_complete && (
                      <Button component={Link} href={`/result?attempt=${a.id}`} color="primary" size="small">
                        View
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
            <Button component={Link} href="/careers" variant="outlined" color="primary">
              Browse Careers
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

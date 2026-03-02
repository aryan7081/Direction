'use client';

import Link from 'next/link';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';

export default function LandingPage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box component="header" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={600}>Direction</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Link href="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Button color="inherit">Sign in</Button>
          </Link>
          <Link href="/register" style={{ textDecoration: 'none' }}>
            <Button variant="contained" color="primary">Get Started</Button>
          </Link>
        </Box>
      </Box>

      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 2, py: 8, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight="bold" sx={{ maxWidth: 600, mb: 2 }}>
          Find Your Path. Not By Chance.
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 500, mb: 4 }}>
          Direction helps Class 9–10 students discover careers that match their interests and aptitude.
        </Typography>
        <Link href="/register" style={{ textDecoration: 'none' }}>
          <Button variant="contained" color="primary" size="large">
            Start Free Assessment
          </Button>
        </Link>

        <Box sx={{ mt: 8, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, maxWidth: 700 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Smart Assessment</Typography>
              <Typography variant="body2" color="text.secondary">Questions on interests, aptitude & personality</Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Career Matching</Typography>
              <Typography variant="body2" color="text.secondary">Matches you to 20+ careers</Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>PDF Reports</Typography>
              <Typography variant="body2" color="text.secondary">Download your career report</Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

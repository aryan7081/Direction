'use client';

import Link from 'next/link';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { LoginForm } from '@/features/auth/LoginForm';

export default function LoginPage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2, bgcolor: 'grey.50' }}>
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>Sign in</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Welcome back. Enter your credentials.</Typography>
          <LoginForm />
          <Typography sx={{ mt: 3, textAlign: 'center' }} variant="body2" color="text.secondary">
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: 'inherit', fontWeight: 600 }}>Register</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

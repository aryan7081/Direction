'use client';

import Link from 'next/link';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { RegisterForm } from '@/features/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2, bgcolor: 'grey.50' }}>
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>Create account</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Join and discover your ideal career path.</Typography>
          <RegisterForm />
          <Typography sx={{ mt: 3, textAlign: 'center' }} variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'inherit', fontWeight: 600 }}>Sign in</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

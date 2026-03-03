'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { login } from './api';
import { ButtonSpinner } from '@/components/ui/Loaders';
import { Box, Button, TextField, Alert } from '@mui/material';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      setAuth(res.user, res.access, res.refresh);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={loading}
        sx={{
          background: 'linear-gradient(135deg, #16a34a, #15803d)',
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 2,
          py: 1.3,
          fontSize: '0.95rem',
          boxShadow: '0 4px 14px rgba(22,163,74,0.25)',
          '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)', boxShadow: '0 6px 20px rgba(22,163,74,0.35)' },
        }}
      >
        {loading ? <><ButtonSpinner /> Signing in...</> : 'Sign in'}
      </Button>
    </Box>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { isAxiosError } from 'axios';
import { motion } from 'framer-motion';
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { getApiBase } from '@/lib/getApiBase';
import { useAnalyticsAuthStore } from '@/stores/analyticsAuthStore';
import { ax } from './analyticsDesignSystem';
import { fetchAnalyticsHealth } from './api';
import { ButtonSpinner } from '@/components/ui/Loaders';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function LockBadge() {
  return (
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: 2.5,
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: ax.gradients.brand,
        boxShadow: '0 8px 28px rgba(34, 211, 238, 0.25)',
      }}
      aria-hidden
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v10H6V11z"
          stroke="#050810"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
}

function getErrorMessage(err: unknown): string {
  if (!err || typeof err !== 'object' || !('response' in err)) {
    return 'Unable to connect. Please check your network and try again.';
  }
  const res = (err as { response?: { status?: number; data?: unknown } }).response;
  const status = res?.status;
  const data = res?.data;
  if (status === 401) return 'Invalid email or password.';
  if (status === 403) return 'This account does not have access to analytics. Contact an administrator.';
  if (status === 429) return 'Too many attempts. Please try again later.';
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object' && 'detail' in data) return String((data as { detail: unknown }).detail);
  return 'Sign in failed. Please try again.';
}

export function AnalyticsLoginForm() {
  const router = useRouter();
  const setAuth = useAnalyticsAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setError('Please enter your email.');
      return;
    }
    if (!EMAIL_REGEX.test(emailTrimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post<{
        user: {
          id: number;
          email: string;
          username: string;
          first_name: string;
          last_name: string;
          role: string;
        };
        access: string;
        refresh: string;
      }>(`${getApiBase()}/auth/login/`, { email: emailTrimmed, password });

      setAuth(data.user, data.access, data.refresh);

      try {
        await fetchAnalyticsHealth();
      } catch (healthErr) {
        useAnalyticsAuthStore.getState().logout();
        if (isAxiosError(healthErr) && healthErr.response?.status === 403) {
          setError(
            'This account does not have the analytics permission. Ask a staff admin to assign "Can view analytics dashboard" or add you to the Analytics dashboard viewers group.'
          );
        } else if (isAxiosError(healthErr) && healthErr.response?.status === 401) {
          setError('Session could not be verified. Please try again.');
        } else {
          setError('Could not verify analytics access. Check your connection and try again.');
        }
        setLoading(false);
        return;
      }

      router.replace('/analytics/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
      <Box
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          maxWidth: 440,
          mx: 'auto',
          borderRadius: 4,
          border: `1px solid ${ax.border.subtle}`,
          background: `linear-gradient(155deg, ${alpha('#111827', 0.95)} 0%, ${alpha('#050810', 0.98)} 100%)`,
          boxShadow: '0 24px 64px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: ax.gradients.brand,
            opacity: 0.9,
          },
        }}
      >
        <LockBadge />
        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.16em' }}>
          Staff access
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, letterSpacing: '-0.03em', fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
          Sign in to analytics
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.65, mb: 2.5 }}>
          Accounts are created in Django Admin only — there is no public signup. Use the email and password your administrator issued.
        </Typography>

        {error ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              label="Work email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              disabled={loading}
              inputProps={{ 'aria-label': 'Work email' }}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              disabled={loading}
              inputProps={{ 'aria-label': 'Password' }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontWeight: 800,
                fontSize: '1rem',
                borderRadius: 2,
                boxShadow: '0 8px 24px rgba(52, 211, 153, 0.25)',
              }}
            >
              {loading ? <ButtonSpinner size={24} /> : 'Continue to dashboard'}
            </Button>
          </Stack>
        </Box>
      </Box>
    </motion.div>
  );
}

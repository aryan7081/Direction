'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { register } from './api';
import { Box, Button, TextField, Alert, InputAdornment, IconButton } from '@mui/material';
import { ButtonSpinner } from '@/components/ui/Loaders';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function parseBackendErrors(err: unknown): { message: string; fieldErrors?: Record<string, string> } {
  if (!err || typeof err !== 'object' || !('response' in err)) {
    return { message: 'Unable to connect. Please check your internet and try again.' };
  }
  const res = (err as { response?: { data?: unknown } }).response;
  const data = res?.data;
  if (typeof data === 'string') return { message: data };
  if (data && typeof data === 'object') {
    const fieldErrors: Record<string, string> = {};
    const parts: string[] = [];
    for (const [k, v] of Object.entries(data)) {
      if (Array.isArray(v)) {
        const msg = v.map(String).join(' ');
        if (['email', 'password'].includes(k)) fieldErrors[k] = msg;
        else parts.push(msg);
      } else if (typeof v === 'string') parts.push(v);
    }
    return {
      message: parts.length ? parts.join(' ') : 'Registration failed. Please check the form.',
      fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined,
    };
  }
  return { message: 'Registration failed. Please try again.' };
}

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setFieldErrors({ email: 'Email is required.' });
      setError('Please enter your email.');
      return;
    }
    if (!EMAIL_REGEX.test(emailTrimmed)) {
      setFieldErrors({ email: 'Please enter a valid email.' });
      setError('Please enter a valid email.');
      return;
    }
    if (password.length < 8) {
      setFieldErrors({ password: 'Password must be at least 8 characters.' });
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({ email: emailTrimmed, password });
      const user = res?.user;
      const access = res?.access;
      const refresh = res?.refresh;
      if (user && access && refresh) {
        setAuth(user, access, refresh);
        router.push('/dashboard');
      } else {
        setError('Account created. Redirecting to sign in...');
        setTimeout(() => router.push('/login'), 1500);
      }
    } catch (err) {
      const { message, fieldErrors: be } = parseBackendErrors(err);
      setError(message);
      if (be) setFieldErrors((prev) => ({ ...prev, ...be }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && (
        <Alert severity="error" role="alert" aria-live="assertive">
          {error}
        </Alert>
      )}
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
        autoComplete="email"
        inputProps={{ inputMode: 'email' }}
        InputLabelProps={{ shrink: true }}
        error={!!fieldErrors.email}
        helperText={fieldErrors.email}
      />
      <TextField
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
        autoComplete="new-password"
        inputProps={{ minLength: 8 }}
        InputLabelProps={{ shrink: true }}
        helperText="Min 8 characters"
        error={!!fieldErrors.password}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword((v) => !v)}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
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
        {loading ? <><ButtonSpinner /> Creating account...</> : 'Create account'}
      </Button>
    </Box>
  );
}

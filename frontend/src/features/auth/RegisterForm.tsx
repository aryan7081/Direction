'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { register } from './api';
import { Box, Button, TextField, Alert } from '@mui/material';
import { ButtonSpinner } from '@/components/ui/Loaders';

export function RegisterForm() {
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await register(form);
      const user = res?.user;
      const access = res?.access;
      const refresh = res?.refresh;
      if (user && access && refresh) {
        setAuth(user, access, refresh);
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    } catch (err: unknown) {
      let message = 'Registration failed';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: unknown } }).response;
        const data = res?.data;
        if (typeof data === 'string') message = data;
        else if (data && typeof data === 'object') {
          const parts: string[] = [];
          for (const v of Object.values(data)) {
            if (Array.isArray(v)) parts.push(...v.map(String));
            else if (typeof v === 'string') parts.push(v);
          }
          if (parts.length) message = parts.join(' ');
        }
      }
      setError(message);
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
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        required
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Username"
        value={form.username}
        onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
        required
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <TextField
          label="First name"
          value={form.first_name}
          onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Last name"
          value={form.last_name}
          onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Box>
      <TextField
        label="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        required
        fullWidth
        inputProps={{ minLength: 8 }}
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
        {loading ? <><ButtonSpinner /> Creating account...</> : 'Create account'}
      </Button>
    </Box>
  );
}

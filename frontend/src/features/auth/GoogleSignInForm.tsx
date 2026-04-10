'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box } from '@mui/material';
import { useAuthStore } from '@/stores/authStore';
import { googleAuth } from './api';
import { GoogleSignInButton } from './GoogleSignInButton';
import { ButtonSpinner } from '@/components/ui/Loaders';

export function GoogleSignInForm({ buttonWidth = 280 }: { buttonWidth?: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  async function handleSuccess(credential: string) {
    setLoading(true);
    try {
      const res = await googleAuth(credential);
      setAuth(res.user, res.access, res.refresh);
      const target = redirectTo.startsWith('/') ? redirectTo : '/dashboard';
      router.push(target);
    } catch {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <ButtonSpinner size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <GoogleSignInButton onSuccess={handleSuccess} text="signin_with" width={buttonWidth} disabled={loading} />
    </Box>
  );
}

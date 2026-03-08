'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { GoogleSignInForm } from '@/features/auth/GoogleSignInForm';
import { ButtonSpinner } from '@/components/ui/Loaders';

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 4 },
        bgcolor: '#fafbfc',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background orbs */}
      <Box
        sx={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(22,163,74,0.08) 0%, transparent 70%)',
          top: '-10%',
          right: '-5%',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
          bottom: '5%',
          left: '-3%',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4, height: 68, overflow: 'hidden' }}>
          <Box component="img" src="/logo.png" alt="Outcave" sx={{ height: 136, width: 'auto', minWidth: 136, objectFit: 'cover', objectPosition: 'center' }} />
        </Box>

        {/* Card */}
        <Box
          sx={{
            bgcolor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(16px)',
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            p: { xs: 3, sm: 4 },
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
            Welcome back
          </Typography>
          <Typography sx={{ color: '#6b7280', mb: 3, fontSize: '0.95rem' }}>
            Sign in with Google to continue your career journey.
          </Typography>
          <Suspense fallback={<Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}><ButtonSpinner size={36} /></Box>}>
            <GoogleSignInForm />
          </Suspense>
          <Typography sx={{ mt: 3, textAlign: 'center', fontSize: '0.88rem', color: '#9ca3af' }}>
            <Link href="/" style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>
              ← Back to home
            </Link>
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
}

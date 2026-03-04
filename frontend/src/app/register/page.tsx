'use client';

import Link from 'next/link';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { RegisterForm } from '@/features/auth/RegisterForm';

export default function RegisterPage() {
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
      <Box
        sx={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(22,163,74,0.08) 0%, transparent 70%)',
          top: '-8%',
          left: '-5%',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
          bottom: '0%',
          right: '-3%',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', mb: 4 }}>
          <Box component="img" src="/logo.png" alt="Direction" sx={{ width: 44, height: 44 }} />
          <Typography sx={{ fontWeight: 700, fontSize: '1.3rem', color: '#111827', letterSpacing: -0.5 }}>
            Direction
          </Typography>
        </Box>

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
            Create your account
          </Typography>
          <Typography sx={{ color: '#6b7280', mb: 3, fontSize: '0.95rem' }}>
            Start your career discovery journey today.
          </Typography>
          <RegisterForm />
          <Typography sx={{ mt: 3, textAlign: 'center', fontSize: '0.88rem', color: '#6b7280' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
}

'use client';

import Link from 'next/link';
import { Box, Button, Typography } from '@mui/material';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
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
          top: '-10%',
          right: '-5%',
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4, height: 68, overflow: 'hidden' }}>
          <Box component="img" src="/logo.png" alt="Outcave" sx={{ height: 136, width: 'auto', minWidth: 136, objectFit: 'cover', objectPosition: 'center' }} />
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
            Forgot password?
          </Typography>
          <Typography sx={{ color: '#6b7280', mb: 3, fontSize: '0.95rem', lineHeight: 1.6 }}>
            Password reset is coming soon. For now, please contact your school or administrator if you need help accessing your account.
          </Typography>
          <Button
            component={Link}
            href="/login"
            variant="contained"
            fullWidth
            sx={{
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              py: 1.3,
              '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)' },
            }}
          >
            Back to Sign in
          </Button>
        </Box>
      </motion.div>
    </Box>
  );
}

'use client';

import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { ButtonSpinner } from '@/components/ui/Loaders';
import { GoogleSignInButton } from '@/features/auth/GoogleSignInButton';

export function SaveProgressScreen({
  onGoogleSignIn,
  loading,
  questionsCompleted = 5,
}: {
  onGoogleSignIn: (credential: string) => void;
  loading: boolean;
  questionsCompleted?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Box sx={{ textAlign: 'center', maxWidth: 420, mx: 'auto' }}>
        {/* Progress badge — accomplishment + urgency */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.75,
              mb: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(22,163,74,0.08) 100%)',
              border: '1px solid rgba(34,197,94,0.3)',
            }}
          >
            <Box
              component="span"
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                bgcolor: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 800,
              }}
            >
              ✓
            </Box>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#15803d' }}>
              {questionsCompleted} questions completed
            </Typography>
          </Box>
        </motion.div>

        {/* Urgent headline — loss aversion */}
        <Typography
          sx={{
            fontWeight: 800,
            color: '#111827',
            fontSize: { xs: '1.35rem', sm: '1.5rem' },
            lineHeight: 1.25,
            mb: 1,
            letterSpacing: '-0.03em',
          }}
        >
          Don&apos;t lose your progress
        </Typography>
        <Typography
          sx={{
            color: '#6b7280',
            fontWeight: 500,
            fontSize: '0.95rem',
            lineHeight: 1.55,
            mb: 3,
          }}
        >
          Your answers aren&apos;t saved yet. One tap with Google to save and continue.
        </Typography>

        {/* Single CTA — Google button only, no nested button feel */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          {loading ? (
            <Box sx={{ py: 3, px: 4 }}>
              <ButtonSpinner size={44} />
              <Typography sx={{ mt: 1.5, fontSize: '1rem', fontWeight: 700, color: '#15803d' }}>
                Saving your progress...
              </Typography>
            </Box>
          ) : (
            <GoogleSignInButton
              onSuccess={onGoogleSignIn}
              text="continue_with"
              width={320}
              disabled={loading}
            />
          )}
        </motion.div>

        {/* Trust footer */}
        <Typography
          sx={{
            mt: 2,
            fontSize: '0.8rem',
            color: '#9ca3af',
            fontWeight: 500,
          }}
        >
          No spam. We&apos;ll only use your email for your report.
        </Typography>
      </Box>
    </motion.div>
  );
}

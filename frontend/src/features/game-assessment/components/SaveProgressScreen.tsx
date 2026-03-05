'use client';

import { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { ButtonSpinner } from '@/components/ui/Loaders';

export function SaveProgressScreen({
  onContinue,
  saving,
}: {
  onContinue: (email: string) => void;
  saving: boolean;
}) {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (isValid) {
      onContinue(email.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box sx={{ textAlign: 'center', maxWidth: 400, mx: 'auto' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: '#111827',
            mb: 1,
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
          }}
        >
          Save your progress
        </Typography>
        <Typography
          sx={{
            color: '#6b7280',
            fontWeight: 500,
            fontSize: '0.95rem',
            lineHeight: 1.6,
            mb: 3,
          }}
        >
          Enter your email so we can save your answers and unlock your report later.
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            error={touched && !isValid && email.length > 0}
            helperText={
              touched && !isValid && email.length > 0
                ? 'Please enter a valid email'
                : ''
            }
            disabled={saving}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.9)',
              },
            }}
            autoFocus
            autoComplete="email"
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={saving || !isValid}
            sx={{
              py: 1.5,
              minHeight: 48,
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2.5,
              fontSize: '1rem',
              boxShadow: '0 8px 24px rgba(22,163,74,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #15803d, #166534)',
                boxShadow: '0 12px 32px rgba(22,163,74,0.4)',
              },
            }}
          >
            {saving ? (
              <><ButtonSpinner size={24} /> Saving...</>
            ) : (
              <>Continue Assessment →</>
            )}
          </Button>
        </Box>

        <Typography
          sx={{
            mt: 2,
            fontSize: '0.8rem',
            color: '#9ca3af',
            fontWeight: 500,
          }}
        >
          No spam. We&apos;ll only send your report link.
        </Typography>
      </Box>
    </motion.div>
  );
}

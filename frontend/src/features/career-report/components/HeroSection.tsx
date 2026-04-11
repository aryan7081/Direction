'use client';

import { Box, Chip, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { CareerReport } from '../types';

const BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  High: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  Moderate: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  Exploratory: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
};

export function HeroSection({ hero }: { hero: CareerReport['hero'] }) {
  const badge = BADGE_COLORS[hero.confidence] ?? BADGE_COLORS.Exploratory;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          textAlign: 'center',
          py: { xs: 4, sm: 5 },
          px: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)',
          border: '1px solid',
          borderColor: 'grey.200',
          mb: 3,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary', fontWeight: 500, mb: 1, letterSpacing: 1,
            textTransform: 'uppercase', fontSize: '0.75rem',
          }}
        >
          #1 Career Match
        </Typography>

        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          {hero.career_category ? (
            <>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: '#15803d',
                  mb: 0.75,
                  fontSize: { xs: '1.55rem', sm: '2.05rem' },
                  lineHeight: 1.2,
                }}
              >
                {hero.career_category}
              </Typography>
              <Typography
                sx={{
                  fontWeight: 600,
                  color: '#64748b',
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                  mb: 1,
                  lineHeight: 1.35,
                }}
              >
                {hero.career_name}
              </Typography>
            </>
          ) : (
            <Typography
              variant="h3"
              sx={{ fontWeight: 800, color: '#111827', mb: 1, fontSize: { xs: '1.6rem', sm: '2.2rem' } }}
            >
              {hero.career_name}
            </Typography>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Typography
            sx={{
              fontSize: { xs: '2.4rem', sm: '3rem' }, fontWeight: 800,
              color: '#16a34a', lineHeight: 1, mb: 1.5,
            }}
          >
            {hero.score_percent}%
          </Typography>
        </motion.div>

        <Chip
          label={`${hero.confidence} Confidence`}
          sx={{
            bgcolor: badge.bg, color: badge.text, border: `1px solid ${badge.border}`,
            fontWeight: 600, fontSize: '0.82rem', height: 32,
          }}
        />
      </Box>

      {hero.confidence_explanation && (
        <Box
          sx={{
            p: 2.5, borderRadius: 2, bgcolor: badge.bg,
            border: `1px solid ${badge.border}`, mb: 3,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: badge.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            What &ldquo;{hero.confidence} Confidence&rdquo; means
          </Typography>
          <Typography variant="body2" sx={{ color: '#374151', mt: 0.5, lineHeight: 1.7 }}>
            {hero.confidence_explanation}
          </Typography>
        </Box>
      )}
    </motion.div>
  );
}

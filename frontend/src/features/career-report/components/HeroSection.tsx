'use client';

import { Box, Chip, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { CareerReport } from '../types';

const BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  High: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  Moderate: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  Exploratory: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
};

export function HeroSection({
  hero,
  streamRecommendation,
}: {
  hero: CareerReport['hero'];
  streamRecommendation: CareerReport['stream_recommendation'];
}) {
  const badge = BADGE_COLORS[hero.confidence] ?? BADGE_COLORS.Exploratory;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 2, sm: 3 },
          mb: 4,
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        {/* Recommended Stream — left */}
        <Box
          sx={{
            flex: 1,
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            border: '1px solid #bbf7d0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="overline"
            sx={{ color: '#15803d', fontWeight: 600, letterSpacing: 1.5 }}
          >
            Recommended Stream
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#16a34a',
              mt: 0.5,
              mb: 1.5,
              fontSize: { xs: '1.5rem', sm: '2rem' },
            }}
          >
            {streamRecommendation.stream}
          </Typography>
          <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.7 }}>
            {streamRecommendation.reasoning}
          </Typography>
        </Box>

        {/* Top Career Match — right */}
        <Box
          sx={{
            flex: 1,
            textAlign: 'center',
            py: { xs: 4, sm: 5 },
            px: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)',
            border: '1px solid',
            borderColor: 'grey.200',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              mb: 1,
              letterSpacing: 1,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
            }}
          >
            Top Career Match
          </Typography>

          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#111827',
                mb: 0.5,
                fontSize: { xs: '1.5rem', sm: '2rem' },
              }}
            >
              {hero.career_name}
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Typography
              sx={{
                fontSize: { xs: '2.2rem', sm: '2.8rem' },
                fontWeight: 800,
                color: '#16a34a',
                mb: 1.5,
                lineHeight: 1,
              }}
            >
              {hero.score_percent}%
            </Typography>
          </motion.div>

          <Chip
            label={`${hero.confidence} Confidence`}
            sx={{
              bgcolor: badge.bg,
              color: badge.text,
              border: `1px solid ${badge.border}`,
              fontWeight: 600,
              fontSize: '0.8rem',
              height: 32,
            }}
          />
        </Box>
      </Box>
    </motion.div>
  );
}

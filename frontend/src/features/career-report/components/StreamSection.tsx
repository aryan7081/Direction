'use client';

import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { CareerReport } from '../types';

const STREAM_THEME: Record<string, { bg: string; accent: string; border: string; icon: string }> = {
  Science: { bg: '#eff6ff', accent: '#1d4ed8', border: '#bfdbfe', icon: '🔬' },
  Commerce: { bg: '#fefce8', accent: '#a16207', border: '#fde68a', icon: '📈' },
  Arts: { bg: '#fdf2f8', accent: '#be185d', border: '#fbcfe8', icon: '🎨' },
  Humanities: { bg: '#fdf2f8', accent: '#be185d', border: '#fbcfe8', icon: '📚' },
  General: { bg: '#f3f4f6', accent: '#374151', border: '#d1d5db', icon: '🎓' },
};

export function StreamSection({
  streamRecommendation,
}: {
  streamRecommendation: CareerReport['stream_recommendation'];
}) {
  const theme = STREAM_THEME[streamRecommendation.stream] || STREAM_THEME.General;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Box
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${theme.border}`,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: { xs: 2.5, sm: 3 },
            py: 2,
            bgcolor: theme.bg,
          }}
        >
          <Typography sx={{ fontSize: 28 }}>{theme.icon}</Typography>
          <Box>
            <Typography variant="overline" sx={{ color: theme.accent, fontWeight: 700, letterSpacing: 1.5, fontSize: '0.7rem' }}>
              Recommended Stream
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: theme.accent, fontSize: { xs: '1.5rem', sm: '1.8rem' }, lineHeight: 1.2 }}>
              {streamRecommendation.stream}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ px: { xs: 2.5, sm: 3 }, py: 2, bgcolor: '#fff' }}>
          <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.8 }}>
            {streamRecommendation.reasoning}
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
}

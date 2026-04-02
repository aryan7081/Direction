'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { PersonalityDimension } from '../types';

function SpectrumSlider({ dim, index }: { dim: PersonalityDimension; index: number }) {
  const position = dim.position;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index }}
    >
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 2.5,
          bgcolor: '#fff',
          border: '1px solid #e5e7eb',
          mb: 2,
        }}
      >
        {/* Emoji + description */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Typography sx={{ fontSize: 22 }}>{dim.emoji}</Typography>
          <Typography sx={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.5 }}>
            {dim.description}
          </Typography>
        </Box>

        {/* Spectrum labels */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
          <Typography
            sx={{
              fontSize: '0.82rem',
              fontWeight: position <= 35 ? 700 : 500,
              color: position <= 35 ? '#1d4ed8' : '#9ca3af',
            }}
          >
            {dim.label_low}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.82rem',
              fontWeight: position >= 65 ? 700 : 500,
              color: position >= 65 ? '#7c3aed' : '#9ca3af',
            }}
          >
            {dim.label_high}
          </Typography>
        </Box>

        {/* Spectrum track */}
        <Box
          sx={{
            position: 'relative',
            height: 12,
            borderRadius: 6,
            background: 'linear-gradient(90deg, #bfdbfe 0%, #e5e7eb 50%, #ddd6fe 100%)',
            mb: 1.5,
          }}
        >
          {/* Center mark */}
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: -2,
              bottom: -2,
              width: 2,
              bgcolor: '#d1d5db',
              transform: 'translateX(-50%)',
              zIndex: 1,
            }}
          />
          {/* Position dot */}
          <motion.div
            initial={{ left: '50%' }}
            animate={{ left: `${position}%` }}
            transition={{ delay: 0.1 * index + 0.3, duration: 0.6, type: 'spring', stiffness: 200 }}
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: position <= 35 ? '#3b82f6' : position >= 65 ? '#7c3aed' : '#6b7280',
              border: '3px solid #fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 2,
            }}
          />
        </Box>

        {/* Insight text */}
        <Box
          sx={{
            px: 1.5,
            py: 1,
            borderRadius: 1.5,
            bgcolor: position <= 35 ? '#eff6ff' : position >= 65 ? '#f5f3ff' : '#f9fafb',
            border: `1px solid ${position <= 35 ? '#bfdbfe' : position >= 65 ? '#ddd6fe' : '#e5e7eb'}`,
          }}
        >
          <Typography sx={{ fontSize: '0.78rem', color: '#374151', lineHeight: 1.6 }}>
            {dim.insight}
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
}

export function PersonalityStyle({ dimensions }: { dimensions: PersonalityDimension[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <Card variant="outlined" sx={{ borderRadius: 3, mb: 4 }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Your Personality Style
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            These 4 dimensions describe your natural behavioural tendencies.
            There are no right or wrong answers — each end of the spectrum has its own strengths.
          </Typography>
          <Typography variant="body2" sx={{ color: '#9ca3af', fontSize: '0.75rem', mb: 3 }}>
            The dot shows where you fall on each spectrum based on 8 personality questions.
          </Typography>

          {dimensions.map((dim, i) => (
            <SpectrumSlider key={dim.slug} dim={dim} index={i} />
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

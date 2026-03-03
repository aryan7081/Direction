'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { DominantPattern as DominantPatternType } from '../types';

export function DominantPattern({ pattern }: { pattern: DominantPatternType }) {
  if (!pattern) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          mb: 4,
          background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)',
          borderColor: '#bfdbfe',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Typography
            variant="overline"
            sx={{ color: '#1d4ed8', fontWeight: 600, letterSpacing: 1.5 }}
          >
            Your Dominant Pattern
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: '#1e40af',
              mt: 0.5,
              mb: 1.5,
            }}
          >
            {pattern.name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.8 }}>
            {pattern.description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
}

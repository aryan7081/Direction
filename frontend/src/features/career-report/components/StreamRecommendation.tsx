'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { CareerReport } from '../types';

export function StreamRecommendation({
  rec,
}: {
  rec: CareerReport['stream_recommendation'];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <Card
        sx={{
          borderRadius: 3,
          mb: 4,
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          border: '1px solid #bbf7d0',
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography variant="overline" sx={{ color: '#15803d', fontWeight: 600, letterSpacing: 1.5 }}>
            Recommended Stream
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: '#16a34a', mt: 0.5, mb: 1.5, fontSize: { xs: '1.5rem', sm: '2rem' } }}
          >
            {rec.stream}
          </Typography>
          <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.7 }}>
            {rec.reasoning}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
}

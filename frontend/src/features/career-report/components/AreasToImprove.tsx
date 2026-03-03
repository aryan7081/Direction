'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { CareerReport } from '../types';

export function AreasToImprove({
  areas,
}: {
  areas: CareerReport['areas_to_improve'];
}) {
  if (!areas || areas.length === 0) return null;

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, mb: 4 }}>
      <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Areas to Develop
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          These are not weaknesses — they are growth opportunities. Even small effort here can expand your career options.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {areas.map((area, i) => (
            <motion.div
              key={area.trait}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: '#fffbeb',
                  border: '1px solid #fde68a',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#92400e' }}>
                    {area.label}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#d97706' }}>
                    {area.score}/10
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#78350f', lineHeight: 1.7 }}>
                  {area.tip}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

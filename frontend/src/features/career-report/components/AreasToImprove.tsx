'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { AreaToImprove } from '../types';

export function AreasToImprove({ areas }: { areas: AreaToImprove[] }) {
  if (!areas || areas.length === 0) return null;

  const isStretch = areas[0]?.is_stretch;

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, mb: 4 }}>
      <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {isStretch ? '🚀 Stretch Goals' : 'Areas to Develop'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
          {isStretch
            ? 'Your profile is exceptionally strong across all traits. Here\'s how to go from great to outstanding — push these already-solid skills to an elite level.'
            : 'These are not weaknesses — they are growth opportunities. Even small effort here can expand your career options.'}
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
                  bgcolor: isStretch ? '#f0fdf4' : '#fffbeb',
                  border: `1px solid ${isStretch ? '#bbf7d0' : '#fde68a'}`,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isStretch ? '#15803d' : '#92400e' }}>
                    {area.label}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: isStretch ? '#16a34a' : '#d97706' }}>
                    {area.score}/10
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: isStretch ? '#166534' : '#78350f', lineHeight: 1.7, mb: area.steps?.length ? 1 : 0 }}>
                  {area.tip}
                </Typography>
                {area.steps && area.steps.length > 0 && (
                  <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                    {area.steps.map((step, j) => (
                      <Box
                        component="li"
                        key={j}
                        sx={{
                          fontSize: '0.82rem',
                          color: isStretch ? '#15803d' : '#92400e',
                          lineHeight: 1.7,
                          '&::marker': { color: isStretch ? '#16a34a' : '#d97706' },
                        }}
                      >
                        {step}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </motion.div>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

'use client';

import { Box, Card, CardContent, LinearProgress, Typography } from '@mui/material';
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
            sx={{ fontWeight: 800, color: '#1e40af', mt: 0.5, mb: 1.5 }}
          >
            {pattern.name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.8, mb: pattern.key_traits?.length ? 2.5 : 0 }}>
            {pattern.description}
          </Typography>

          {pattern.key_traits && pattern.key_traits.length > 0 && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(29,78,216,0.12)',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5, fontSize: '0.68rem' }}>
                Key Traits Driving This Pattern
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {pattern.key_traits.map((kt, i) => {
                  const pct = (kt.score / kt.max) * 100;
                  return (
                    <motion.div
                      key={kt.trait}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e40af' }}>
                          {kt.label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1d4ed8' }}>
                          {kt.score}/{kt.max}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'rgba(29,78,216,0.08)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                          },
                        }}
                      />
                    </motion.div>
                  );
                })}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

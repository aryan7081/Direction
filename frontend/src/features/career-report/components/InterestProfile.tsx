'use client';

import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { InterestProfile as InterestProfileType } from '../types';

function getBarColor(score: number): string {
  if (score >= 8) return '#16a34a';
  if (score >= 6) return '#3b82f6';
  if (score >= 4) return '#f59e0b';
  return '#ef4444';
}

function DimensionBar({
  dim,
  index,
  isTop,
}: {
  dim: InterestProfileType['dimensions'][0];
  index: number;
  isTop: boolean;
}) {
  const pct = (dim.score / dim.max) * 100;
  const barColor = getBarColor(dim.score);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index }}
    >
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: 2,
          bgcolor: isTop ? '#f0fdf4' : '#fff',
          border: `1px solid ${isTop ? '#bbf7d0' : '#e5e7eb'}`,
          mb: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: 20 }}>{dim.emoji}</Typography>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>
                  {dim.label}
                </Typography>
                <Chip
                  label={dim.code}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    bgcolor: isTop ? '#dcfce7' : '#f3f4f6',
                    color: isTop ? '#15803d' : '#6b7280',
                  }}
                />
                {isTop && (
                  <Chip
                    label="Top Interest"
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.58rem',
                      fontWeight: 700,
                      bgcolor: '#16a34a',
                      color: '#fff',
                    }}
                  />
                )}
              </Box>
              <Typography sx={{ fontSize: '0.72rem', color: '#9ca3af', mt: 0.25 }}>
                {dim.careers_hint}
              </Typography>
            </Box>
          </Box>
          <Typography sx={{ fontWeight: 800, color: barColor, fontSize: '1.2rem', minWidth: 32, textAlign: 'right' }}>
            {dim.score}
          </Typography>
        </Box>

        <Box sx={{ position: 'relative', height: 8, borderRadius: 4, bgcolor: '#f3f4f6', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ delay: 0.1 * index + 0.2, duration: 0.6, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: 4, background: barColor }}
          />
        </Box>

        {isTop && (
          <Typography sx={{ fontSize: '0.78rem', color: '#374151', mt: 1, lineHeight: 1.6 }}>
            {dim.description}
          </Typography>
        )}
      </Box>
    </motion.div>
  );
}

export function InterestProfile({ profile }: { profile: InterestProfileType }) {
  const codes = profile.holland_code.split('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <Card variant="outlined" sx={{ borderRadius: 3, mb: 4, overflow: 'visible' }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Your Interest Profile
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Based on your RIASEC interest responses (scenario-style items in the questionnaire).
                Your top codes show the kinds of work that will feel most naturally engaging.
              </Typography>
            </Box>
          </Box>

          {/* Holland Code badge */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 2,
              bgcolor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              my: 2,
            }}
          >
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#15803d' }}>
              Your Holland Code:
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {codes.map((code, i) => (
                <Box
                  key={code}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    bgcolor: i === 0 ? '#16a34a' : i === 1 ? '#3b82f6' : '#f59e0b',
                    color: '#fff',
                  }}
                >
                  {code}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Dimension bars */}
          {profile.dimensions.map((dim, i) => (
            <DimensionBar key={dim.slug} dim={dim} index={i} isTop={i < 3} />
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { CoreTrait } from '../types';

function getLevel(score: number): { label: string; color: string } {
  if (score >= 8) return { label: 'Excellent', color: '#16a34a' };
  if (score >= 6) return { label: 'Strong', color: '#3b82f6' };
  if (score >= 4) return { label: 'Developing', color: '#f59e0b' };
  return { label: 'Growing', color: '#ef4444' };
}

function TraitCard({ trait, index }: { trait: CoreTrait; index: number }) {
  const pct = (trait.score / trait.max) * 100;
  const level = getLevel(trait.score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 * index }}
    >
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 2.5,
          bgcolor: '#fff',
          border: '1px solid #e5e7eb',
          transition: 'all 0.2s ease',
          '&:hover': { borderColor: level.color, boxShadow: `0 2px 12px ${level.color}15` },
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography sx={{ fontSize: 22 }}>{trait.emoji}</Typography>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>
                {trait.label}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography sx={{ fontWeight: 800, color: level.color, fontSize: '1.3rem', lineHeight: 1 }}>
                  {trait.score}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#9ca3af' }}>/10</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Score bar */}
        <Box sx={{ position: 'relative', height: 8, borderRadius: 4, bgcolor: '#f3f4f6', mb: 1.5, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ delay: 0.1 * index + 0.2, duration: 0.6, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: 4, background: level.color }}
          />
        </Box>

        {/* Description */}
        <Typography sx={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.6, mb: trait.stream_connection ? 1 : 0 }}>
          {trait.description}
        </Typography>

        {/* Stream connection */}
        {trait.stream_connection && (
          <Box
            sx={{
              mt: 1,
              px: 1.5,
              py: 1,
              borderRadius: 1.5,
              bgcolor: '#f0fdf4',
              border: '1px solid #dcfce7',
            }}
          >
            <Typography sx={{ fontSize: '0.75rem', color: '#166534', lineHeight: 1.5, fontWeight: 500 }}>
              💡 {trait.stream_connection}
            </Typography>
          </Box>
        )}
      </Box>
    </motion.div>
  );
}

export function WorkDNA({ traits }: { traits: CoreTrait[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card variant="outlined" sx={{ borderRadius: 3, mb: 4 }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Your Work DNA
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            These 5 traits describe how you naturally approach work, learning, and challenges.
            They were measured through 10 direct questions about your habits and preferences.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {traits.map((t, i) => (
              <TraitCard key={t.slug} trait={t} index={i} />
            ))}
          </Box>

          {/* Legend */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2.5, mt: 3, flexWrap: 'wrap' }}>
            {[
              { label: 'Excellent (8+)', color: '#16a34a' },
              { label: 'Strong (6–7)', color: '#3b82f6' },
              { label: 'Developing (4–5)', color: '#f59e0b' },
              { label: 'Growing (0–3)', color: '#ef4444' },
            ].map((l) => (
              <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: l.color }} />
                <Typography sx={{ fontSize: '0.68rem', color: '#6b7280', fontWeight: 500 }}>
                  {l.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

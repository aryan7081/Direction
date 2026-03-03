'use client';

import { Box, Card, CardContent, LinearProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { ReportTrait } from '../types';

function TraitRow({ trait, index }: { trait: ReportTrait; index: number }) {
  const pct = (trait.score / trait.max) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index }}
    >
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
            {trait.label}
          </Typography>
          <Typography variant="subtitle2" fontWeight={700} color="primary.main">
            {trait.score} / {trait.max}
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            height: 10,
            borderRadius: 5,
            bgcolor: 'grey.100',
            mb: 1,
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
              background: pct >= 70
                ? 'linear-gradient(90deg, #16a34a, #22c55e)'
                : pct >= 40
                  ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                  : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
            },
          }}
        />

        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          {trait.description}
        </Typography>
      </Box>
    </motion.div>
  );
}

export function TraitBreakdown({ traits }: { traits: ReportTrait[] }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, mb: 4 }}>
      <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Trait Breakdown
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Each trait is scored on a 0–10 scale based on how you responded during the assessment.
        </Typography>

        {traits.map((t, i) => (
          <TraitRow key={t.trait} trait={t} index={i} />
        ))}
      </CardContent>
    </Card>
  );
}

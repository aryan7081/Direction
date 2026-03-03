'use client';

import { Box, LinearProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { PHASE_ORDER, type GamePhase } from '../types';

const GAME_LABELS: Record<string, string> = {
  intro: 'Get Ready',
  logic: 'Logic Challenge',
  risk: 'Decision Maker',
  planner: 'Weekly Planner',
  scenario: 'Situations',
  processing: 'Analyzing...',
  results: 'Your Results',
};

export function GameProgressBar({
  phase,
  subProgress,
}: {
  phase: GamePhase;
  subProgress: number;
}) {
  const phaseIdx = PHASE_ORDER.indexOf(phase);
  const totalPhases = PHASE_ORDER.length - 2; // exclude intro & results
  const base = Math.max(0, phaseIdx - 1);
  const overall = ((base + subProgress) / totalPhases) * 100;

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {GAME_LABELS[phase] ?? ''}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {Math.round(overall)}%
        </Typography>
      </Box>
      <motion.div layout>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, overall)}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </motion.div>
    </Box>
  );
}

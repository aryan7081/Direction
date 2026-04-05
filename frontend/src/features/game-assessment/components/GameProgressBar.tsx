'use client';

import { Box, LinearProgress, Typography, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import type { GamePhase } from '../types';

const ACTIVE_PHASES: GamePhase[] = ['scenario'];

const GAME_LABELS: Record<string, string> = {
  logic: 'Assessment',
  save_progress: 'Assessment',
  risk: 'Assessment',
  planner: 'Assessment',
  scenario: 'Career assessment',
  processing: 'Analyzing...',
};

export function GameProgressBar({
  phase,
  subProgress,
  scenarioQuestionTotal = 30,
}: {
  phase: GamePhase;
  subProgress: number;
  /** Total scenario questions for this assessment tier (shown in the step chip). */
  scenarioQuestionTotal?: number;
}) {
  const stepLabels: { phase: GamePhase; label: string }[] = [
    { phase: 'scenario', label: `${scenarioQuestionTotal} questions` },
  ];
  const phaseIdx = ACTIVE_PHASES.indexOf(phase as GamePhase);
  const totalPhases = ACTIVE_PHASES.length;

  let overall: number;
  if (phase === 'processing') {
    overall = 100;
  } else if (phase === 'save_progress') {
    overall = subProgress * 100;
  } else if (phaseIdx >= 0) {
    overall = ((phaseIdx + subProgress) / totalPhases) * 100;
  } else {
    overall = 0;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {GAME_LABELS[phase] ?? ''}
        </Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {Math.round(overall)}%
        </Typography>
      </Box>

      <motion.div
        initial={false}
        animate={{ opacity: 1 }}
      >
        <LinearProgress
          variant="determinate"
          value={Math.min(100, overall)}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              transition: 'transform 0.4s ease',
            },
          }}
        />
      </motion.div>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
        {stepLabels.map((step, i) => {
          const stepIdx = ACTIVE_PHASES.indexOf(step.phase);
          const isDone = phaseIdx > stepIdx || phase === 'processing';
          const isCurrent = phaseIdx === stepIdx && phase !== 'processing';

          return (
            <Chip
              key={step.phase}
              label={step.label}
              size="small"
              variant={isDone || isCurrent ? 'filled' : 'outlined'}
              color={isDone ? 'success' : isCurrent ? 'primary' : 'default'}
              sx={{
                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                height: { xs: 22, sm: 24 },
                fontWeight: isCurrent ? 700 : 500,
                opacity: isDone || isCurrent ? 1 : 0.5,
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}

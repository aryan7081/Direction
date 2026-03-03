'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store';
import type { RiskScenario } from '../types';

export function RiskSimulator({
  scenarios,
  onComplete,
  onProgress,
}: {
  scenarios: RiskScenario[];
  onComplete: () => void;
  onProgress?: (fraction: number) => void;
}) {
  const pushEvent = useGameStore((s) => s.pushEvent);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [answered, setAnswered] = useState(false);

  const scenario = scenarios[current];

  useEffect(() => {
    setStartTime(Date.now());
    setSelected(null);
    setAnswered(false);
  }, [current]);

  const handleSelect = useCallback(
    (optionId: string) => {
      if (answered) return;
      setSelected(optionId);
      setAnswered(true);
      const timeTaken = Date.now() - startTime;

      pushEvent({
        game: 'risk',
        event_type: 'decision',
        payload: {
          scenario_id: scenario.id,
          selected_option_id: optionId,
          time_taken_ms: timeTaken,
        },
        timestamp: Date.now(),
      });

      const next = current + 1;
      onProgress?.(next / scenarios.length);

      setTimeout(() => {
        if (next < scenarios.length) {
          setCurrent(next);
        } else {
          onComplete();
        }
      }, 600);
    },
    [answered, startTime, pushEvent, scenario, current, scenarios.length, onComplete, onProgress]
  );

  if (!scenario) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={scenario.id}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', p: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Chip
                label={`Scenario ${current + 1} / ${scenarios.length}`}
                size="small"
                sx={{ fontWeight: 600, bgcolor: 'rgba(245,158,11,0.08)', color: '#d97706', border: '1px solid rgba(245,158,11,0.2)' }}
              />
              <Typography sx={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                Choose what feels right to you
              </Typography>
            </Box>

            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827', mb: 3, lineHeight: 1.6 }}>
              {scenario.prompt}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {scenario.options.map((opt) => (
                <motion.div key={opt.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    variant={selected === opt.id ? 'contained' : 'outlined'}
                    fullWidth
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      py: 1.5,
                      px: 2,
                      fontSize: '0.95rem',
                      textAlign: 'left',
                      borderRadius: 2,
                      borderColor: selected === opt.id ? undefined : 'rgba(0,0,0,0.1)',
                      color: selected === opt.id ? '#fff' : '#374151',
                      ...(selected === opt.id && { background: 'linear-gradient(135deg, #f59e0b, #d97706)', '&:hover': { background: 'linear-gradient(135deg, #d97706, #b45309)' } }),
                      ...(!selected && { '&:hover': { borderColor: '#f59e0b', color: '#d97706', bgcolor: 'rgba(245,158,11,0.04)' } }),
                    }}
                    onClick={() => handleSelect(opt.id)}
                    disabled={answered}
                  >
                    {opt.text}
                  </Button>
                </motion.div>
              ))}
            </Box>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
}

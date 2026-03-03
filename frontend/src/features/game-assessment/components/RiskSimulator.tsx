'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, Button, Card, CardContent, Typography, Chip } from '@mui/material';
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
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Chip
                label={`Scenario ${current + 1} / ${scenarios.length}`}
                size="small"
                color="secondary"
                variant="outlined"
              />
              <Typography variant="caption" color="text.secondary">
                Choose what feels right to you
              </Typography>
            </Box>

            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              {scenario.prompt}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {scenario.options.map((opt) => (
                <motion.div
                  key={opt.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    variant={selected === opt.id ? 'contained' : 'outlined'}
                    color={selected === opt.id ? 'primary' : 'inherit'}
                    fullWidth
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      py: 1.5,
                      px: 2,
                      fontSize: '0.95rem',
                      textAlign: 'left',
                    }}
                    onClick={() => handleSelect(opt.id)}
                    disabled={answered}
                  >
                    {opt.text}
                  </Button>
                </motion.div>
              ))}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

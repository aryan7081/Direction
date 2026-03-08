'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store';
import type { LogicTask } from '../types';

export function LogicGame({
  tasks,
  onComplete,
  onProgress,
}: {
  tasks: LogicTask[];
  onComplete: () => void;
  onProgress?: (fraction: number) => void;
}) {
  const pushEvent = useGameStore((s) => s.pushEvent);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(tasks[0]?.time_limit ?? 30);
  const [answered, setAnswered] = useState(false);

  const task = tasks[current];

  useEffect(() => {
    setStartTime(Date.now());
    setTimeLeft(task?.time_limit ?? 30);
    setSelected(null);
    setAnswered(false);
  }, [current, task?.time_limit]);

  useEffect(() => {
    if (answered) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmit(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, answered]);

  const handleSubmit = useCallback(
    (answer: string | null) => {
      if (answered) return;
      setAnswered(true);
      const timeTaken = Date.now() - startTime;

      pushEvent({
        game: 'logic',
        event_type: 'answer',
        payload: {
          task_id: task.id,
          selected_answer: answer,
          time_taken_ms: timeTaken,
        },
        timestamp: Date.now(),
      });

      const next = current + 1;
      onProgress?.(next / tasks.length);

      setTimeout(() => {
        if (next < tasks.length) {
          setCurrent(next);
        } else {
          onComplete();
        }
      }, 600);
    },
    [answered, startTime, pushEvent, task, current, tasks.length, onComplete, onProgress]
  );

  if (!task) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={task.id}
        initial={{ opacity: 1, x: 0 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(16px)', borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)', p: { xs: 2.5, sm: 3.5 }, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Chip
                label={`${current + 1} / ${tasks.length}`}
                size="small"
                sx={{ fontWeight: 600, bgcolor: 'rgba(139,92,246,0.08)', color: '#7c3aed', border: '1px solid rgba(139,92,246,0.2)' }}
              />
              <Chip
                label={`${timeLeft}s`}
                size="small"
                sx={{ fontWeight: 700, minWidth: 50, bgcolor: timeLeft <= 5 ? 'rgba(239,68,68,0.1)' : 'rgba(0,0,0,0.04)', color: timeLeft <= 5 ? '#dc2626' : '#374151', border: timeLeft <= 5 ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(0,0,0,0.06)' }}
              />
            </Box>

            <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.15rem', sm: '1.2rem' }, color: '#111827', mb: 3, whiteSpace: 'pre-line', lineHeight: 1.7 }}>
              {task.prompt}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {task.options.map((opt) => (
                <Button
                  key={opt}
                  variant={selected === opt ? 'contained' : 'outlined'}
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: { xs: 1.75, sm: 1.5 },
                    px: 2,
                    fontSize: { xs: '0.9rem', sm: '0.95rem' },
                    minHeight: 48,
                    borderRadius: 2,
                    borderColor: selected === opt ? undefined : 'rgba(0,0,0,0.1)',
                    color: selected === opt ? '#fff' : '#374151',
                    ...(selected === opt && { background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', '&:hover': { background: 'linear-gradient(135deg, #6d28d9, #5b21b6)' } }),
                    ...(!selected && { '&:hover': { borderColor: '#7c3aed', color: '#7c3aed', bgcolor: 'rgba(139,92,246,0.04)' } }),
                  }}
                  onClick={() => { setSelected(opt); handleSubmit(opt); }}
                  disabled={answered}
                >
                  {opt}
                </Button>
              ))}
            </Box>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
}

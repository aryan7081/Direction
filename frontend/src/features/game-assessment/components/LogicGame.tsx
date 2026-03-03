'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, Button, Card, CardContent, Typography, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store';
import type { LogicTask } from '../types';

export function LogicGame({ tasks, onComplete }: { tasks: LogicTask[]; onComplete: () => void }) {
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

      setTimeout(() => {
        if (current < tasks.length - 1) {
          setCurrent((c) => c + 1);
        } else {
          onComplete();
        }
      }, 600);
    },
    [answered, startTime, pushEvent, task, current, tasks.length, onComplete]
  );

  if (!task) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={task.id}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.3 }}
      >
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Chip
                label={`${current + 1} / ${tasks.length}`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`${timeLeft}s`}
                size="small"
                color={timeLeft <= 5 ? 'error' : 'default'}
                sx={{ fontWeight: 600, minWidth: 50 }}
              />
            </Box>

            <Typography variant="h6" fontWeight={600} sx={{ mb: 3, whiteSpace: 'pre-line' }}>
              {task.prompt}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {task.options.map((opt) => (
                <Button
                  key={opt}
                  variant={selected === opt ? 'contained' : 'outlined'}
                  color={selected === opt ? 'primary' : 'inherit'}
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1.5,
                    px: 2,
                    fontSize: '0.95rem',
                  }}
                  onClick={() => {
                    setSelected(opt);
                    handleSubmit(opt);
                  }}
                  disabled={answered}
                >
                  {opt}
                </Button>
              ))}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

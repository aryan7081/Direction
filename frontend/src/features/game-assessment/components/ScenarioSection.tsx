'use client';

import { useState, useCallback, useEffect } from 'react';
import { Box, Button, Card, CardContent, Typography, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store';
import type { ScenarioQuestion } from '../types';

export function ScenarioSection({
  questions,
  onComplete,
  onProgress,
}: {
  questions: ScenarioQuestion[];
  onComplete: () => void;
  onProgress?: (fraction: number) => void;
}) {
  const pushEvent = useGameStore((s) => s.pushEvent);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const question = questions[current];

  useEffect(() => {
    setSelected(null);
    setAnswered(false);
  }, [current]);

  const handleSelect = useCallback(
    (optionId: string) => {
      if (answered) return;
      setSelected(optionId);
      setAnswered(true);

      pushEvent({
        game: 'scenario',
        event_type: 'answer',
        payload: {
          question_id: question.id,
          selected_option_id: optionId,
        },
        timestamp: Date.now(),
      });

      const next = current + 1;
      onProgress?.(next / questions.length);

      setTimeout(() => {
        if (next < questions.length) {
          setCurrent(next);
        } else {
          onComplete();
        }
      }, 500);
    },
    [answered, pushEvent, question, current, questions.length, onComplete, onProgress]
  );

  if (!question) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.25 }}
      >
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Chip
                label={`${current + 1} / ${questions.length}`}
                size="small"
                color="info"
                variant="outlined"
              />
              <Typography variant="caption" color="text.secondary">
                Pick what feels most natural
              </Typography>
            </Box>

            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              {question.prompt}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {question.options.map((opt) => (
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

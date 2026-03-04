'use client';

import { useState, useCallback, useEffect } from 'react';
import { Box, Button, Typography, Chip } from '@mui/material';
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
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', p: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Chip
                label={`${current + 1} / ${questions.length}`}
                size="small"
                sx={{ fontWeight: 600, bgcolor: 'rgba(59,130,246,0.08)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.2)' }}
              />
              <Typography sx={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                Pick what feels most natural
              </Typography>
            </Box>

            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827', mb: 3, lineHeight: 1.6 }}>
              {question.prompt}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {question.options.map((opt) => (
                <motion.div key={opt.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    variant={selected === opt.id ? 'contained' : 'outlined'}
                    fullWidth
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      py: { xs: 1.75, sm: 1.5 },
                      px: 2,
                      fontSize: { xs: '0.9rem', sm: '0.95rem' },
                      minHeight: 48,
                      textAlign: 'left',
                      borderRadius: 2,
                      borderColor: selected === opt.id ? undefined : 'rgba(0,0,0,0.1)',
                      color: selected === opt.id ? '#fff' : '#374151',
                      ...(selected === opt.id && { background: 'linear-gradient(135deg, #3b82f6, #2563eb)', '&:hover': { background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' } }),
                      ...(!selected && { '&:hover': { borderColor: '#3b82f6', color: '#2563eb', bgcolor: 'rgba(59,130,246,0.04)' } }),
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

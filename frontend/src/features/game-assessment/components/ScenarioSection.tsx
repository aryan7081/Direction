'use client';

import { useState, useCallback, useEffect } from 'react';
import { Box, Button, Typography, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store';
import type { ScenarioQuestion } from '../types';

const DEFAULT_AUTH_GATE_AFTER = 10;

const MILESTONES: Record<number, { emoji: string; title: string; subtitle: string }> = {
  10: {
    emoji: '🎯',
    title: 'Great start!',
    subtitle: 'Your personality pattern is emerging...',
  },
  20: {
    emoji: '🔥',
    title: 'Almost there!',
    subtitle: 'We can already see strong career signals.',
  },
};

export function ScenarioSection({
  questions,
  onComplete,
  onProgress,
  startIndex = 0,
  isAuthenticated = true,
  authGateAfterCount = DEFAULT_AUTH_GATE_AFTER,
  onAuthGate,
}: {
  questions: ScenarioQuestion[];
  onComplete: () => void;
  onProgress?: (fraction: number) => void;
  startIndex?: number;
  isAuthenticated?: boolean;
  authGateAfterCount?: number;
  onAuthGate?: (resumeAtIndex: number, completedCount: number) => void | Promise<void>;
}) {
  const pushEvent = useGameStore((s) => s.pushEvent);
  const [current, setCurrent] = useState(startIndex);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [milestone, setMilestone] = useState<{ emoji: string; title: string; subtitle: string } | null>(null);

  const question = questions[current];

  useEffect(() => {
    setCurrent(startIndex);
  }, [startIndex]);

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

      setTimeout(async () => {
        if (MILESTONES[next] && next < questions.length) {
          setMilestone(MILESTONES[next]);
          setTimeout(() => {
            setMilestone(null);
            if (next === authGateAfterCount && !isAuthenticated && onAuthGate) {
              onAuthGate(next, authGateAfterCount);
              return;
            }
            setCurrent(next);
          }, 2000);
          return;
        }

        if (next === authGateAfterCount && !isAuthenticated && onAuthGate) {
          await onAuthGate(next, authGateAfterCount);
          return;
        }
        if (next < questions.length) {
          setCurrent(next);
        } else {
          onComplete();
        }
      }, 500);
    },
    [
      answered,
      pushEvent,
      question,
      current,
      questions.length,
      onComplete,
      onProgress,
      authGateAfterCount,
      isAuthenticated,
      onAuthGate,
    ]
  );

  if (!question) return null;

  return (
    <AnimatePresence mode="wait">
      {milestone ? (
        <motion.div
          key="milestone"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.35 }}
        >
          <Box
            sx={{
              textAlign: 'center',
              py: { xs: 6, sm: 8 },
              px: 3,
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              <Typography sx={{ fontSize: 56, mb: 2 }}>{milestone.emoji}</Typography>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', sm: '1.6rem' }, color: '#111827', mb: 0.5 }}>
                {milestone.title}
              </Typography>
              <Typography sx={{ color: '#6366f1', fontWeight: 600, fontSize: '0.95rem' }}>
                {milestone.subtitle}
              </Typography>
            </motion.div>
          </Box>
        </motion.div>
      ) : (
        <motion.div
          key={question.id}
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
        >
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(16px)', borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)', p: { xs: 2.5, sm: 3.5 }, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
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

            <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.15rem', sm: '1.2rem' }, color: '#111827', mb: 3, lineHeight: 1.7 }}>
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
      )}
    </AnimatePresence>
  );
}

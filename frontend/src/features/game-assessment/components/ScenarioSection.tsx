'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Box, Button, Typography, Chip, useMediaQuery, useTheme } from '@mui/material';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useGameStore } from '../store';
import type { ScenarioQuestion } from '../types';
import { resolveOptionHelper, resolveQuestionVisual } from '../questionVisualConfig';
import { getLikertStepForOptionText, isLikertScaleQuestion } from '../likertScaleUi';
import { LikertFaceIcon } from './LikertFaceIcon';
import { QuestionPromptArt } from './QuestionPromptArt';
import { optionLabelForDisplay } from '@/lib/optionLabelDisplay';

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
  const reduceMotion = useReducedMotion();
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  /** Fewer / no motion distractions on phones (matches compact QuestionPromptArt). */
  const calmUi = Boolean(reduceMotion || isSmDown);
  const firstScenarioIntroIndex = useMemo(
    () => questions.findIndex((q) => q.show_scenario_intro_before),
    [questions]
  );
  const openIntroInitially =
    firstScenarioIntroIndex >= 0 && startIndex === firstScenarioIntroIndex;

  const [current, setCurrent] = useState(startIndex);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [milestone, setMilestone] = useState<{ emoji: string; title: string; subtitle: string } | null>(null);
  const [scenarioIntroOpen, setScenarioIntroOpen] = useState(openIntroInitially);
  const scenarioIntroShownRef = useRef(openIntroInitially);

  const question = questions[current];

  const questionVisual = useMemo(() => resolveQuestionVisual(question), [question]);
  const optionHelper = useMemo(() => resolveOptionHelper(question), [question]);
  const showLikertIcons = useMemo(() => isLikertScaleQuestion(question), [question]);

  const optionContainerVariants = useMemo(
    () => ({
      hidden: { opacity: calmUi ? 1 : 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: calmUi ? 0 : 0.04,
          delayChildren: calmUi ? 0 : 0.03,
        },
      },
    }),
    [calmUi]
  );

  const optionItemVariants = useMemo(
    () => ({
      hidden: { opacity: calmUi ? 1 : 0, y: calmUi ? 0 : 5 },
      show: { opacity: 1, y: 0, transition: { duration: calmUi ? 0 : 0.2, ease: 'easeOut' as const } },
    }),
    [calmUi]
  );

  useEffect(() => {
    setCurrent(startIndex);
  }, [startIndex]);

  useEffect(() => {
    if (firstScenarioIntroIndex < 0) return;
    const reachedFirstScenario =
      current === firstScenarioIntroIndex ||
      startIndex === firstScenarioIntroIndex;
    if (reachedFirstScenario && !scenarioIntroShownRef.current) {
      scenarioIntroShownRef.current = true;
      setScenarioIntroOpen(true);
    }
  }, [current, startIndex, firstScenarioIntroIndex]);

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

  if (scenarioIntroOpen) {
    return (
      <motion.div
        key="scenario-intro"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 5, sm: 7 },
            px: 2,
            bgcolor: 'rgba(255,255,255,0.98)',
            borderRadius: 3,
            border: '1px solid rgba(99,102,241,0.2)',
            boxShadow: '0 8px 32px rgba(79,70,229,0.12)',
          }}
        >
          <Typography sx={{ fontSize: '2.25rem', mb: 2 }} aria-hidden>
            🧭
          </Typography>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.2rem', sm: '1.35rem' }, color: '#1e1b4b', mb: 1.5, lineHeight: 1.35 }}>
            Real-life situations
          </Typography>
          <Typography sx={{ color: '#4b5563', fontSize: { xs: '0.95rem', sm: '1rem' }, lineHeight: 1.65, maxWidth: 420, mx: 'auto', mb: 3 }}>
            Now we will show you a few real-life situations to understand how you think and act.
          </Typography>
          <Button variant="contained" size="large" onClick={() => setScenarioIntroOpen(false)} sx={{ textTransform: 'none', fontWeight: 700, px: 4, borderRadius: 2, bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}>
            Continue
          </Button>
        </Box>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {milestone ? (
        <motion.div
          key="milestone"
          initial={{ opacity: calmUi ? 1 : 0, scale: calmUi ? 1 : 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: calmUi ? 1 : 0.95 }}
          transition={{ duration: calmUi ? 0.12 : 0.35 }}
        >
          <Box sx={{ textAlign: 'center', py: { xs: 4, sm: 8 }, px: 2 }}>
            {calmUi ? (
              <>
                <Typography sx={{ fontSize: { xs: 44, sm: 56 }, mb: 2 }} aria-hidden>
                  {milestone.emoji}
                </Typography>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.35rem', sm: '1.6rem' }, color: '#111827', mb: 0.5 }}>
                  {milestone.title}
                </Typography>
                <Typography sx={{ color: '#6366f1', fontWeight: 600, fontSize: '0.9rem' }}>
                  {milestone.subtitle}
                </Typography>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  <Typography sx={{ fontSize: 56, mb: 2 }} aria-hidden>
                    {milestone.emoji}
                  </Typography>
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
              </>
            )}
          </Box>
        </motion.div>
      ) : (
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: calmUi ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: calmUi ? 0 : -12 }}
          transition={{ duration: calmUi ? 0.12 : 0.22, ease: 'easeOut' }}
        >
          <Box
            sx={{
              bgcolor: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(16px)',
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.08)',
              p: { xs: 2, sm: 3.5 },
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: { xs: 'min(100dvh - 132px, 900px)', sm: 'auto' },
              maxHeight: { xs: 'calc(100dvh - 120px)', sm: 'none' },
              overflow: { xs: 'hidden', sm: 'visible' },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: { xs: 0.5, sm: 0 },
                mb: { xs: 1, sm: 2 },
                flexShrink: 0,
              }}
            >
              <Chip
                label={`${current + 1} / ${questions.length}`}
                size="small"
                sx={{ fontWeight: 600, bgcolor: 'rgba(59,130,246,0.08)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.2)' }}
              />
              <Typography
                sx={{
                  fontSize: { xs: '0.7rem', sm: '0.78rem' },
                  color: '#64748b',
                  fontWeight: 600,
                  textAlign: { xs: 'left', sm: 'right' },
                  maxWidth: { xs: '100%', sm: '58%' },
                  lineHeight: 1.35,
                }}
              >
                {optionHelper}
              </Typography>
            </Box>

            <QuestionPromptArt visual={questionVisual} questionId={question.id} />

            <Typography
              component="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.05rem', sm: '1.2rem' },
                color: '#111827',
                mb: { xs: 1.25, sm: 3 },
                lineHeight: 1.55,
                flexShrink: 0,
              }}
            >
              {question.prompt}
            </Typography>

            <Box
              sx={{
                flex: { xs: 1, sm: 'none' },
                minHeight: 0,
                overflowY: { xs: 'auto', sm: 'visible' },
                WebkitOverflowScrolling: 'touch',
                pb: { xs: 0.5, sm: 0 },
              }}
            >
              <motion.div
                key={`options-${question.id}`}
                variants={optionContainerVariants}
                initial="hidden"
                animate="show"
                style={{ display: 'flex', flexDirection: 'column', gap: isSmDown ? 8 : 12 }}
              >
                {question.options.map((opt) => {
                  const likertStep = showLikertIcons ? getLikertStepForOptionText(opt.text) : null;
                  const label = optionLabelForDisplay(opt.text);
                  return (
                    <motion.div
                      key={opt.id}
                      variants={optionItemVariants}
                      whileHover={calmUi ? undefined : { scale: 1.008 }}
                      whileTap={calmUi ? undefined : { scale: 0.995 }}
                    >
                      <Button
                        variant={selected === opt.id ? 'contained' : 'outlined'}
                        fullWidth
                        sx={{
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                          py: { xs: 1.25, sm: 1.5 },
                          px: { xs: 1.5, sm: 2 },
                          fontSize: { xs: '0.875rem', sm: '0.95rem' },
                          minHeight: { xs: 46, sm: 48 },
                          textAlign: 'left',
                          borderRadius: 2,
                          gap: { xs: 1, sm: 1.25 },
                          touchAction: 'manipulation',
                          WebkitTapHighlightColor: 'transparent',
                          borderColor: selected === opt.id ? undefined : 'rgba(0,0,0,0.1)',
                          color: selected === opt.id ? '#fff' : '#374151',
                          ...(selected === opt.id && {
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            '&:hover': { background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' },
                          }),
                          ...(!selected && {
                            '&:hover': { borderColor: '#3b82f6', color: '#2563eb', bgcolor: 'rgba(59,130,246,0.04)' },
                          }),
                        }}
                        onClick={() => handleSelect(opt.id)}
                        disabled={answered}
                      >
                        {likertStep !== null && (
                          <Box
                            sx={{
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 1.25,
                              bgcolor: selected === opt.id ? 'rgba(255,255,255,0.2)' : '#f5f3ff',
                              p: 0.25,
                              lineHeight: 0,
                            }}
                            aria-hidden
                          >
                            <LikertFaceIcon step={likertStep} maskBaseId={`${question.id}-${opt.id}`} size={isSmDown ? 24 : 28} />
                          </Box>
                        )}
                        {label}
                      </Button>
                    </motion.div>
                  );
                })}
              </motion.div>
            </Box>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

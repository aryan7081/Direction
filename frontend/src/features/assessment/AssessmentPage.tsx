'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getQuestions,
  startAssessment,
  submitAssessment,
} from './api';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Chip,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLoader, ButtonSpinner } from '@/components/ui/Loaders';
import type { Question } from '@/types';

function humanizeUnderscore(s: string) {
  return s
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function AssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [started, setStarted] = useState(false);

  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ['questions'],
    queryFn: getQuestions,
  });

  useEffect(() => {
    const raw = searchParams.get('attempt');
    if (!raw) return;
    const id = parseInt(raw, 10);
    if (!Number.isNaN(id) && id > 0) setAttemptId(id);
  }, [searchParams]);

  const startMutation = useMutation({
    mutationFn: startAssessment,
    onSuccess: (data) => {
      setAttemptId(data.attempt_id);
      setStarted(true);
    },
  });

  const submitMutation = useMutation({
    mutationFn: ({ attemptId, responses }: { attemptId: number; responses: { question_id: number; answer_option_id: number }[] }) =>
      submitAssessment(
        attemptId,
        responses.map((r) => ({ question_id: r.question_id, answer_option_id: r.answer_option_id }))
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.push(`/result?attempt=${variables.attemptId}`);
    },
  });

  const handleStart = () => {
    if (attemptId) {
      setStarted(true);
      return;
    }
    startMutation.mutate();
  };

  const handleSelect = (qId: number, optId: number) => {
    setResponses((prev) => ({ ...prev, [qId]: optId }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleSubmit = () => {
    if (!attemptId) return;
    const resps = Object.entries(responses).map(([qId, optId]) => ({
      question_id: parseInt(qId, 10),
      answer_option_id: optId,
    }));
    if (resps.length !== questions.length) return;
    submitMutation.mutate({ attemptId, responses: resps });
  };

  const currentQ = questions[currentIndex] as Question | undefined;
  const answeredCount = Object.keys(responses).length;
  const canSubmit = answeredCount === questions.length && questions.length > 0;
  const progressPercent = questions.length ? (answeredCount / questions.length) * 100 : 0;
  const hasSelection = currentQ && responses[currentQ.id] != null;
  const [showStickyNav, setShowStickyNav] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Show sticky nav when inline nav scrolls out of view (mobile)
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyNav(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, questions.length]);

  if (questionsLoading) {
    return <PageLoader message="Loading assessment..." />;
  }

  // ── Start screen ─────────────────────────────────────────────────────
  if (!started) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ maxWidth: 560, mx: 'auto', p: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              textAlign: 'center',
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#111827',
                mb: 1.5,
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
              }}
            >
              Career Assessment
            </Typography>
            <Typography
              sx={{
                color: '#6b7280',
                fontSize: '1rem',
                lineHeight: 1.6,
                mb: 2,
              }}
            >
              Answer {questions.length} questions to discover careers that match your interests.
            </Typography>
            <Typography
              sx={{
                color: '#9ca3af',
                fontSize: '0.88rem',
                mb: 3,
              }}
            >
              Takes about 5 minutes • Your answers stay private
            </Typography>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleStart}
              disabled={startMutation.isPending}
              sx={{
                py: 1.75,
                minHeight: 52,
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 2.5,
                fontSize: '1.05rem',
                boxShadow: '0 8px 24px rgba(22,163,74,0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #15803d, #166534)',
                  boxShadow: '0 12px 32px rgba(22,163,74,0.4)',
                },
              }}
            >
              {startMutation.isPending ? (
                <><ButtonSpinner size={24} /> Starting...</>
              ) : (
                <>Start Assessment →</>
              )}
            </Button>
          </Box>
        </Box>
      </motion.div>
    );
  }

  // ── Question flow ────────────────────────────────────────────────────
  const options = Array.isArray(currentQ?.answer_options) ? currentQ.answer_options : [];

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', p: { xs: 2, sm: 3 }, pb: { xs: 12, sm: 4 } }}>
      {/* Progress */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Chip
            label={`Question ${currentIndex + 1} of ${questions.length}`}
            size="small"
            sx={{
              fontWeight: 600,
              bgcolor: 'rgba(22,163,74,0.1)',
              color: '#15803d',
              border: '1px solid rgba(22,163,74,0.2)',
            }}
          />
          <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
            {answeredCount} answered
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: 'rgba(22,163,74,0.15)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: 'linear-gradient(90deg, #16a34a, #15803d)',
            },
          }}
        />
      </Box>

      {/* Question card */}
      <AnimatePresence mode="wait">
        {currentQ && (
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(12px)',
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.06)',
                p: { xs: 2.5, sm: 3.5 },
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5, alignItems: 'center' }}>
                {currentQ.category?.name && (
                  <Chip
                    label={currentQ.category.name}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      bgcolor: 'rgba(22,163,74,0.12)',
                      color: '#15803d',
                      border: '1px solid rgba(22,163,74,0.25)',
                    }}
                  />
                )}
                {currentQ.metadata?.code && (
                  <Chip
                    label={currentQ.metadata.code}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600, color: '#6b7280', borderColor: 'rgba(0,0,0,0.15)' }}
                  />
                )}
                {currentQ.metadata?.format && (
                  <Chip
                    label={humanizeUnderscore(currentQ.metadata.format)}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 500, color: '#6b7280', borderColor: 'rgba(0,0,0,0.12)' }}
                  />
                )}
                {currentQ.metadata?.context && (
                  <Chip
                    label={humanizeUnderscore(currentQ.metadata.context)}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 500, color: '#6b7280', borderColor: 'rgba(0,0,0,0.12)' }}
                  />
                )}
              </Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.1rem', sm: '1.2rem' },
                  color: '#111827',
                  lineHeight: 1.5,
                  mb: 3,
                }}
              >
                {currentQ.text}
              </Typography>

              {/* Answer options */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {options.map((opt, idx) => {
                  const isSelected = responses[currentQ.id] === opt.id;
                  return (
                    <Box
                      key={opt.id}
                      onClick={() => handleSelect(currentQ.id, opt.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelect(currentQ.id, opt.id);
                        }
                      }}
                      sx={{
                        p: { xs: 2, sm: 2.25 },
                        borderRadius: 2,
                        border: '2px solid',
                        borderColor: isSelected ? '#16a34a' : 'rgba(0,0,0,0.08)',
                        bgcolor: isSelected ? 'rgba(22,163,74,0.08)' : 'rgba(255,255,255,0.8)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: isSelected ? '#16a34a' : 'rgba(22,163,74,0.4)',
                          bgcolor: isSelected ? 'rgba(22,163,74,0.12)' : 'rgba(22,163,74,0.04)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            bgcolor: isSelected ? '#16a34a' : 'rgba(0,0,0,0.06)',
                            color: isSelected ? '#fff' : '#6b7280',
                          }}
                        >
                          {String.fromCharCode(65 + idx)}
                        </Box>
                        <Typography
                          sx={{
                            fontWeight: isSelected ? 600 : 500,
                            fontSize: '1rem',
                            color: isSelected ? '#111827' : '#374151',
                            lineHeight: 1.5,
                          }}
                        >
                          {opt.text}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <Box
        ref={navRef}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 3,
          gap: 2,
        }}
      >
        <Button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            color: '#6b7280',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
            '&.Mui-disabled': { color: '#9ca3af' },
          }}
        >
          ← Previous
        </Button>
        {currentIndex < questions.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!hasSelection}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              py: 1.25,
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #15803d, #166534)',
                boxShadow: '0 6px 20px rgba(22,163,74,0.4)',
              },
            }}
          >
            Next →
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!canSubmit || submitMutation.isPending}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              py: 1.25,
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #15803d, #166534)',
                boxShadow: '0 6px 20px rgba(22,163,74,0.4)',
              },
            }}
          >
            {submitMutation.isPending ? (
              <><ButtonSpinner size={20} /> Submitting...</>
            ) : (
              <>Submit & See Results →</>
            )}
          </Button>
        )}
      </Box>

      {/* Sticky nav - mobile only, when inline nav scrolls out of view */}
      <Box
        sx={{
          display: { xs: 'block', sm: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          bgcolor: 'rgba(250,251,252,0.98)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          zIndex: 40,
          opacity: showStickyNav ? 1 : 0,
          visibility: showStickyNav ? 'visible' : 'hidden',
          pointerEvents: showStickyNav ? 'auto' : 'none',
          transform: showStickyNav ? 'translateY(0)' : 'translateY(100%)',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          {currentIndex > 0 && (
            <Button
              onClick={handlePrev}
              sx={{ textTransform: 'none', fontWeight: 600, color: '#6b7280' }}
            >
              ← Prev
            </Button>
          )}
          {currentIndex < questions.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!hasSelection}
              sx={{
                flex: 1,
                textTransform: 'none',
                fontWeight: 700,
                py: 1.5,
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)' },
              }}
            >
              Next →
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!canSubmit || submitMutation.isPending}
              fullWidth
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                py: 1.5,
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)' },
              }}
            >
              {submitMutation.isPending ? (
                <><ButtonSpinner size={20} /> Submitting...</>
              ) : (
                <>Submit & See Results →</>
              )}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}

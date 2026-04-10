'use client';

import { useState, useRef, useEffect } from 'react';
import { Box, Button, Chip, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { ButtonSpinner } from '@/components/ui/Loaders';

const GAMES = [
  {
    icon: '🎯',
    title: 'RIASEC interests',
    desc: 'Scenario-style items map how you like to work — realistic, investigative, artistic, social, enterprising, conventional',
    tag: '~18 items',
  },
  {
    icon: '🧠',
    title: 'Personality & values',
    desc: 'Big Five–style traits plus what you care about in study and work (e.g. stability, impact, mastery)',
    tag: '~9 items',
  },
  {
    icon: '✨',
    title: 'Readiness & aptitude',
    desc: 'How clear you feel about next steps, plus short verbal/numeric/logic taps — not a school exam',
    tag: '~3 items',
  },
];

const CTA_BUTTON_SX = {
  py: 2,
  minHeight: 56,
  background: 'linear-gradient(135deg, #16a34a, #15803d)',
  textTransform: 'none' as const,
  fontWeight: 800,
  borderRadius: 3,
  fontSize: '1.05rem',
  boxShadow: '0 10px 32px rgba(22,163,74,0.4)',
  '&:hover': {
    background: 'linear-gradient(135deg, #15803d, #166534)',
    boxShadow: '0 14px 40px rgba(22,163,74,0.5)',
  },
};

export function IntroScreen({
  onStart,
  questionCounts,
}: {
  onStart: () => void;
  questionCounts?: { free: number; premium: number };
}) {
  const [starting, setStarting] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const inlineCtaRef = useRef<HTMLDivElement>(null);

  const nFree = questionCounts?.free ?? 30;

  useEffect(() => {
    const el = inlineCtaRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyCta(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-10px 0px 0px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleClick = async () => {
    setStarting(true);
    try {
      await onStart();
    } finally {
      setStarting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            maxWidth: 720,
            mx: 'auto',
            px: { xs: 0, sm: 1 },
            display: 'flex',
            flexDirection: 'column',
            pb: { xs: 10, sm: 0 },
          }}
        >
          {/* 1. TITLE - order 1 */}
          <Box sx={{ textAlign: 'center', order: { xs: 1, sm: 1 } }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#111827',
                letterSpacing: -0.02,
                mb: 1.5,
                fontSize: { xs: '1.6rem', sm: '2.1rem' },
                lineHeight: 1.2,
              }}
            >
              Discover Your Career DNA
            </Typography>
          </Box>

          {/* 2. SHORT DESCRIPTION - order 2 */}
          <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 0 }, order: { xs: 2, sm: 2 } }}>
            <Typography
              sx={{
                color: '#374151',
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                lineHeight: 1.5,
                mb: { xs: 0, sm: 0.75 },
              }}
            >
              {nFree} questions on interests, work habits, and style — no trick answers.
            </Typography>
            <Typography
              sx={{
                color: '#6b7280',
                fontSize: { xs: '0.9rem', sm: '0.95rem' },
                lineHeight: 1.6,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              We combine RIASEC interests, Big Five–style personality, career values, readiness, and aptitude
              into your stream and career matches. Optional premium adds more items later if you want finer detail.
            </Typography>
            <Typography
              sx={{
                color: '#9ca3af',
                fontSize: { xs: '0.82rem', sm: '0.85rem' },
                lineHeight: 1.55,
                mt: 1,
                px: { xs: 1, sm: 0 },
              }}
            >
              After you finish, you&apos;ll see your direction. If you want maximum accuracy before big
              decisions, you can add our premium assessment later — we&apos;ll explain on your results page.
            </Typography>
          </Box>

          {/* 3. PRIMARY CTA - mobile: above cards (order 3), desktop: below cards (order 6) */}
          <Box
            ref={inlineCtaRef}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: { xs: 3, sm: 1.5 },
              width: '100%',
              maxWidth: { xs: '100%', sm: 360 },
              mx: 'auto',
              order: { xs: 3, sm: 5 },
            }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ width: '100%' }}
            >
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleClick}
                disabled={starting}
                sx={CTA_BUTTON_SX}
              >
                {starting ? (
                  <><ButtonSpinner size={24} /> Starting...</>
                ) : (
                  <>Start Assessment →</>
                )}
              </Button>
            </motion.div>
          </Box>

          {/* 4. ACTIVITY CARDS - mobile: below CTA (order 4), desktop: after desc (order 3) */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: { xs: 1.5, sm: 2 },
              mb: { xs: 3, sm: 4 },
              order: { xs: 4, sm: 3 },
            }}
          >
            {GAMES.map((g, i) => (
              <motion.div
                key={g.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                whileHover={{ y: -4 }}
              >
                <Box
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 2.5,
                    border: '1px solid rgba(0,0,0,0.06)',
                    p: 2.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    '&:hover': {
                      boxShadow: '0 8px 28px rgba(0,0,0,0.08)',
                      borderColor: 'rgba(22,163,74,0.25)',
                      bgcolor: 'rgba(255,255,255,0.95)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ fontSize: 28, lineHeight: 1 }}>{g.icon}</Box>
                    <Chip
                      label={g.tag}
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        height: 22,
                        fontWeight: 600,
                        bgcolor: 'rgba(22,163,74,0.1)',
                        color: '#15803d',
                        border: 'none',
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: '#111827',
                        fontSize: '0.98rem',
                        mb: 0.25,
                      }}
                    >
                      {g.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: '#6b7280',
                        fontSize: '0.85rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {g.desc}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>

          {/* 5. PROGRESS EXPECTATION - order 5 */}
          <Typography
            sx={{
              textAlign: 'center',
              color: '#6b7280',
              mb: { xs: 0, sm: 2 },
              fontSize: '0.9rem',
              fontWeight: 500,
              order: { xs: 5, sm: 4 },
            }}
          >
            Phase 1 usually takes about 8–15 minutes • Your answers stay private
          </Typography>

          {/* 6. TRUST MICROCOPY - order 6 on desktop */}
          <Typography
            sx={{
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: '0.82rem',
              fontWeight: 500,
              display: { xs: 'none', sm: 'block' },
              order: { xs: 6, sm: 6 },
            }}
          >
            Free for students • No signup required yet
          </Typography>
        </Box>
      </motion.div>

      {/* STICKY CTA - mobile only, fixed at bottom, visible when inline CTA scrolls out of view */}
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
          opacity: showStickyCta ? 1 : 0,
          visibility: showStickyCta ? 'visible' : 'hidden',
          transform: showStickyCta ? 'translateY(0)' : 'translateY(100%)',
          pointerEvents: showStickyCta ? 'auto' : 'none',
          transition: 'opacity 0.25s ease, transform 0.25s ease, visibility 0.25s',
        }}
      >
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleClick}
          disabled={starting}
          sx={CTA_BUTTON_SX}
        >
          {starting ? (
            <><ButtonSpinner size={24} /> Starting...</>
          ) : (
            <>Start Assessment →</>
          )}
        </Button>
      </Box>
    </>
  );
}

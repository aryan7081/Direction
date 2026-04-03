'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Box, Typography, Stack, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { GoogleSignInForm } from '@/features/auth/GoogleSignInForm';
import { ButtonSpinner } from '@/components/ui/Loaders';
import { CAREER_CATALOG_LABEL, PRODUCT_NAME } from '@/lib/productCopy';

const SPARKS = [
  { top: '18%', left: '12%', delay: 0, size: 6 },
  { top: '42%', left: '78%', delay: 0.4, size: 4 },
  { top: '68%', left: '22%', delay: 0.8, size: 5 },
  { top: '28%', left: '55%', delay: 1.2, size: 3 },
  { top: '82%', left: '65%', delay: 1.6, size: 4 },
];

const HIGHLIGHTS = [
  { emoji: '🧭', label: 'RIASEC-style interests', sub: '6 dimensions mapped' },
  { emoji: '📚', label: 'Stream clarity', sub: 'Science · Commerce · Arts' },
  { emoji: '🚀', label: `${CAREER_CATALOG_LABEL} career paths`, sub: 'Matched to your profile' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

function AmbientBackdrop() {
  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          width: 'min(90vw, 520px)',
          height: 'min(90vw, 520px)',
          borderRadius: '50%',
          top: '-15%',
          right: '-20%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.35) 0%, transparent 65%)',
          filter: 'blur(48px)',
          pointerEvents: 'none',
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.75, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        style={{
          position: 'absolute',
          width: 'min(70vw, 420px)',
          height: 'min(70vw, 420px)',
          borderRadius: '50%',
          bottom: '-10%',
          left: '-15%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 65%)',
          filter: 'blur(44px)',
          pointerEvents: 'none',
        }}
        animate={{ scale: [1, 1.18, 1], x: [0, 24, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      {SPARKS.map((s, i) => (
        <motion.span
          key={i}
          style={{
            position: 'absolute',
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.85)',
            boxShadow: '0 0 12px rgba(255,255,255,0.6)',
            pointerEvents: 'none',
          }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.15, 0.8] }}
          transition={{ duration: 3.2 + i * 0.3, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        />
      ))}
    </>
  );
}

function JourneyRing() {
  return (
    <Box sx={{ position: 'relative', width: 140, height: 140, mx: 'auto', mb: 3 }}>
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.12)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        style={{
          position: 'absolute',
          inset: 8,
          borderRadius: '50%',
          border: '2px dashed rgba(74,222,128,0.45)',
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
        }}
      >
        <Typography sx={{ fontFamily: 'var(--font-display), sans-serif', fontWeight: 800, fontSize: '2rem', color: '#fff', lineHeight: 1 }}>
          30
        </Typography>
        <Typography sx={{ fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>
          questions
        </Typography>
      </Box>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        overflow: 'hidden',
        bgcolor: '#f8fafc',
      }}
    >
      {/* ── Left: immersive brand panel ── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          position: 'relative',
          flex: { md: '1 1 48%', lg: '1 1 52%' },
          minHeight: { md: '100vh' },
          alignItems: 'center',
          justifyContent: 'center',
          px: { md: 5, lg: 8 },
          py: 6,
          overflow: 'hidden',
          background: 'linear-gradient(155deg, #0c1222 0%, #134e2a 42%, #0f172a 88%)',
        }}
      >
        <AmbientBackdrop />
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          style={{ position: 'relative', zIndex: 1, maxWidth: 440 }}
        >
          <motion.div variants={item}>
            <Typography
              component="span"
              sx={{
                display: 'inline-block',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(74,222,128,0.95)',
                mb: 2,
              }}
            >
              {PRODUCT_NAME}
            </Typography>
          </motion.div>
          <motion.div variants={item}>
            <Typography
              sx={{
                fontFamily: 'var(--font-display), sans-serif',
                fontWeight: 800,
                fontSize: { md: '2.35rem', lg: '2.75rem' },
                lineHeight: 1.12,
                color: '#fff',
                mb: 1.5,
                textWrap: 'balance',
              }}
            >
              Log in and continue your career map
            </Typography>
          </motion.div>
          <motion.div variants={item}>
            <Typography sx={{ color: 'rgba(255,255,255,0.72)', fontSize: '1.05rem', lineHeight: 1.65, mb: 4, maxWidth: 400 }}>
              One short assessment turns messy &ldquo;what should I pick?&rdquo; energy into stream ideas, trait insights, and real career directions.
            </Typography>
          </motion.div>
          <motion.div variants={item}>
            <JourneyRing />
          </motion.div>
          <Stack spacing={2}>
            {HIGHLIGHTS.map((h) => (
              <motion.div key={h.label} variants={item}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(8px)',
                    transition: 'transform 0.25s ease, border-color 0.25s ease, background 0.25s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.09)',
                      borderColor: 'rgba(74,222,128,0.35)',
                      transform: 'translateX(6px)',
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '1.5rem', lineHeight: 1 }} aria-hidden>
                    {h.emoji}
                  </Typography>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{h.label}</Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', mt: 0.25 }}>{h.sub}</Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Stack>
        </motion.div>
      </Box>

      {/* ── Mobile hero strip ── */}
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'relative',
          overflow: 'hidden',
          py: 3,
          px: 2.5,
          background: 'linear-gradient(135deg, #0c1222 0%, #166534 50%, #0f172a 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.4,
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        <Stack spacing={1} sx={{ position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(74,222,128,0.95)' }}>
            {PRODUCT_NAME}
          </Typography>
          <Typography sx={{ fontFamily: 'var(--font-display), sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#fff', lineHeight: 1.2 }}>
            Continue your career journey
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ pt: 0.5 }}>
            {['30 questions', 'Stream fit', `${CAREER_CATALOG_LABEL} careers`].map((t) => (
              <Chip
                key={t}
                label={t}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.92)',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </Stack>
        </Stack>
      </Box>

      {/* ── Right: sign-in card ── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2.5, sm: 4 },
          py: { xs: 4, sm: 5 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 360,
            height: 360,
            borderRadius: '50%',
            top: '8%',
            right: '-8%',
            background: 'radial-gradient(circle, rgba(22,163,74,0.09) 0%, transparent 70%)',
            filter: 'blur(32px)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 280,
            height: 280,
            borderRadius: '50%',
            bottom: '12%',
            left: '-5%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
            filter: 'blur(28px)',
            pointerEvents: 'none',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }}
          style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, height: 72 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.45 }}
            >
              <Box
                component="img"
                src="/logo.png"
                alt="Outcave"
                sx={{ height: 140, width: 'auto', minWidth: 140, objectFit: 'cover', objectPosition: 'center' }}
              />
            </motion.div>
          </Box>

          <Box
            sx={{
              position: 'relative',
              borderRadius: 4,
              p: { xs: 3, sm: 4 },
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(15,23,42,0.08)',
              boxShadow: '0 4px 6px -1px rgba(15,23,42,0.06), 0 24px 48px -12px rgba(15,23,42,0.12)',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: 'inherit',
                padding: '1px',
                background: 'linear-gradient(135deg, rgba(34,197,94,0.45), rgba(99,102,241,0.35), rgba(34,197,94,0.2))',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                pointerEvents: 'none',
              },
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'var(--font-display), sans-serif',
                fontWeight: 800,
                color: '#0f172a',
                mb: 0.75,
                fontSize: { xs: '1.35rem', sm: '1.5rem' },
              }}
            >
              Welcome back, explorer
            </Typography>
            <Typography sx={{ color: '#64748b', mb: 1, fontSize: '0.95rem', lineHeight: 1.55 }}>
              Sign in with Google — we&apos;ll drop you on your dashboard, saved progress, and latest report.
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
              <Chip label="Secure OAuth" size="small" sx={{ fontWeight: 600, bgcolor: 'rgba(34,197,94,0.12)', color: '#15803d', border: 'none' }} />
              <Chip label="Built for Class 9–10" size="small" sx={{ fontWeight: 600, bgcolor: 'rgba(99,102,241,0.1)', color: '#4338ca', border: 'none' }} />
            </Stack>

            <Suspense
              fallback={
                <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                  <ButtonSpinner size={36} />
                </Box>
              }
            >
              <GoogleSignInForm buttonWidth={320} />
            </Suspense>

            <Typography sx={{ mt: 3, textAlign: 'center', fontSize: '0.875rem', color: '#94a3b8' }}>
              <Link
                href="/"
                style={{
                  color: '#16a34a',
                  fontWeight: 700,
                  textDecoration: 'none',
                  borderBottom: '2px solid rgba(22,163,74,0.25)',
                  transition: 'border-color 0.2s',
                }}
              >
                ← Back to home
              </Link>
            </Typography>
          </Box>

          <Typography sx={{ textAlign: 'center', mt: 2.5, fontSize: '0.75rem', color: '#94a3b8', px: 1 }}>
            By continuing, you agree to our flow of assessment data used only to personalise your {PRODUCT_NAME} experience.
          </Typography>
        </motion.div>
      </Box>
    </Box>
  );
}

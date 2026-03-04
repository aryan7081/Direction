'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Box, Button, Typography, Container, Chip } from '@mui/material';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

/* ── Floating icon data (career / education themed) ── */
const FLOATING_ICONS = [
  { emoji: '🎓', x: '8%', y: '12%', size: 38, delay: 0, duration: 6 },
  { emoji: '🧬', x: '85%', y: '8%', size: 32, delay: 1.2, duration: 7 },
  { emoji: '💡', x: '75%', y: '65%', size: 36, delay: 0.5, duration: 5.5 },
  { emoji: '🚀', x: '12%', y: '70%', size: 34, delay: 2, duration: 6.5 },
  { emoji: '📊', x: '92%', y: '40%', size: 30, delay: 0.8, duration: 7.5 },
  { emoji: '🧠', x: '5%', y: '42%', size: 36, delay: 1.5, duration: 5 },
  { emoji: '⚡', x: '50%', y: '5%', size: 28, delay: 3, duration: 6 },
  { emoji: '🎯', x: '30%', y: '80%', size: 32, delay: 0.3, duration: 7 },
  { emoji: '🔬', x: '70%', y: '85%', size: 30, delay: 2.5, duration: 5.8 },
  { emoji: '✏️', x: '20%', y: '25%', size: 26, delay: 1.8, duration: 6.2 },
];

const FEATURES = [
  {
    icon: '🧩',
    title: 'Logic & Pattern Games',
    desc: 'Brain teasers that reveal your natural reasoning and analytical style',
    color: '#8b5cf6',
  },
  {
    icon: '🎯',
    title: 'Decision Simulators',
    desc: 'Real scenarios that uncover your leadership, risk, and decision-making style',
    color: '#3b82f6',
  },
  {
    icon: '📅',
    title: 'Weekly Planner',
    desc: 'Drag-and-drop your ideal week to show how you organize and prioritize',
    color: '#16a34a',
  },
  {
    icon: '💬',
    title: 'Situation Analysis',
    desc: 'Real-life situations with no right or wrong — just your authentic self',
    color: '#f59e0b',
  },
];

const STATS = [
  { value: '8', label: 'Core Traits Measured' },
  { value: '15+', label: 'Career Matches' },
  { value: '4', label: 'Interactive Games' },
  { value: 'A4', label: 'PDF Report Included' },
];

function FloatingIcon({ emoji, x, y, size, delay, duration }: typeof FLOATING_ICONS[0]) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        fontSize: size,
        zIndex: 0,
        pointerEvents: 'none',
        willChange: 'transform',
      }}
      animate={{
        y: [0, -18, 0, 12, 0],
        x: [0, 8, -6, 4, 0],
        rotate: [0, 8, -5, 3, 0],
        scale: [1, 1.08, 0.95, 1.04, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {emoji}
    </motion.div>
  );
}

function GradientOrbs() {
  return (
    <>
      <motion.div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(22,163,74,0.12) 0%, transparent 70%)',
          top: '-10%',
          right: '-8%',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
        animate={{ scale: [1, 1.15, 1], x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)',
          bottom: '5%',
          left: '-5%',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
        animate={{ scale: [1, 1.2, 1], x: [0, -15, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
    </>
  );
}

function GridPattern() {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        backgroundImage:
          'radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

function FeatureCard({ icon, title, desc, color, index }: typeof FEATURES[0] & { index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12 }}
    >
      <Box
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 3,
          bgcolor: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid',
          borderColor: 'rgba(0,0,0,0.06)',
          height: '100%',
          transition: 'all 0.3s ease',
          cursor: 'default',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: `0 20px 40px -12px ${color}22`,
            borderColor: `${color}44`,
          },
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2.5,
            bgcolor: `${color}14`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            mb: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.6 }}>
          {desc}
        </Typography>
      </Box>
    </motion.div>
  );
}

function StatsBar() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: { xs: 2, sm: 3 },
          py: 5,
          px: { xs: 2, sm: 4 },
          borderRadius: 4,
          bgcolor: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        {STATS.map((s, i) => (
          <Box key={i} sx={{ textAlign: 'center' }}>
            <Typography
              sx={{
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                fontWeight: 800,
                background: 'linear-gradient(135deg, #16a34a, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2,
              }}
            >
              {s.value}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mt: 0.5 }}>
              {s.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </motion.div>
  );
}

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafbfc', overflow: 'hidden' }}>
      {/* ── Navbar ── */}
      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          px: { xs: 2, sm: 4 },
          py: { xs: 1, sm: 1.5 },
          minHeight: { xs: 56, sm: 64 },
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'rgba(250,251,252,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: { xs: 0, sm: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="img" src="/logo.png" alt="Direction" sx={{ width: { xs: 34, sm: 40 }, height: { xs: 34, sm: 40 } }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', letterSpacing: -0.5, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Direction
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, alignItems: 'center' }}>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <Button
                size="small"
                sx={{
                  color: '#374151',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                  py: { xs: 1, sm: 1.25 },
                  minHeight: 44,
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                }}
              >
                Sign in
              </Button>
            </Link>
            <Link href="/register" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1, sm: 1.25 },
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                  minHeight: 44,
                  boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #15803d, #166534)',
                    boxShadow: '0 6px 20px rgba(22,163,74,0.4)',
                  },
                }}
              >
                Get Started
              </Button>
            </Link>
          </Box>
        </Container>
      </Box>

      {/* ── Hero ── */}
      <Box
        ref={heroRef}
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          pt: { xs: 10, sm: 12 },
          pb: { xs: 6, sm: 8 },
        }}
      >
        <GridPattern />
        <GradientOrbs />
        {FLOATING_ICONS.map((icon, i) => (
          <FloatingIcon key={i} {...icon} />
        ))}

        <motion.div style={{ y: heroY, opacity: heroOpacity, position: 'relative', zIndex: 1, width: '100%' }}>
          <Container maxWidth="md" sx={{ textAlign: 'center', px: { xs: 2, sm: 3 } }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Chip
                label="AI-Powered Career Discovery"
                sx={{
                  mb: 3,
                  bgcolor: 'rgba(22,163,74,0.08)',
                  color: '#16a34a',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  height: 34,
                  border: '1px solid rgba(22,163,74,0.2)',
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2.4rem', sm: '3.4rem', md: '4rem' },
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  color: '#111827',
                  mb: 2.5,
                }}
              >
                Find Your Path.
                <br />
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(135deg, #16a34a 0%, #3b82f6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Not By Chance.
                </Box>
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <Typography
                sx={{
                  fontSize: { xs: '1rem', sm: '1.2rem' },
                  color: '#6b7280',
                  maxWidth: 540,
                  mx: 'auto',
                  mb: 4,
                  lineHeight: 1.7,
                }}
              >
                Direction helps Class 9–12 students discover careers that match their
                natural abilities through interactive games, not boring questionnaires.
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', alignItems: 'stretch', width: '100%', maxWidth: { xs: 320, sm: 'none' }, mx: 'auto' }}>
                <Link href="/register" style={{ textDecoration: 'none', width: '100%' }}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{
                      background: 'linear-gradient(135deg, #16a34a, #15803d)',
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: 2.5,
                      px: 4,
                      py: { xs: 1.75, sm: 1.5 },
                      fontSize: { xs: '0.95rem', sm: '1rem' },
                      minHeight: 48,
                      boxShadow: '0 8px 24px rgba(22,163,74,0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #15803d, #166534)',
                        boxShadow: '0 12px 32px rgba(22,163,74,0.4)',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Start Free Assessment →
                  </Button>
                </Link>
                <Link href="/login" style={{ textDecoration: 'none', width: '100%' }}>
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    sx={{
                      borderColor: 'rgba(0,0,0,0.15)',
                      color: '#374151',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2.5,
                      px: 4,
                      py: { xs: 1.75, sm: 1.5 },
                      fontSize: { xs: '0.95rem', sm: '1rem' },
                      minHeight: 48,
                      '&:hover': {
                        borderColor: 'rgba(0,0,0,0.3)',
                        bgcolor: 'rgba(0,0,0,0.02)',
                      },
                    }}
                  >
                    I have an account
                  </Button>
                </Link>
              </Box>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Typography variant="caption" sx={{ display: 'block', mt: 3, color: '#9ca3af' }}>
                Free for students · No credit card needed · Takes 10 minutes
              </Typography>
            </motion.div>
          </Container>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          style={{ position: 'absolute', bottom: 24, left: '50%', marginLeft: -12, zIndex: 1 }}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Box sx={{ width: 24, height: 40, borderRadius: 12, border: '2px solid #d1d5db', display: 'flex', justifyContent: 'center', pt: '8px' }}>
            <Box sx={{ width: 4, height: 8, borderRadius: 2, bgcolor: '#9ca3af' }} />
          </Box>
        </motion.div>
      </Box>

      {/* ── How It Works ── */}
      <Box sx={{ position: 'relative', py: { xs: 8, sm: 12 } }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                textAlign: 'center',
                mb: 1.5,
                fontSize: { xs: '1.6rem', sm: '2.2rem' },
                color: '#111827',
                letterSpacing: '-0.02em',
              }}
            >
              Not a boring questionnaire.
            </Typography>
            <Typography
              sx={{
                textAlign: 'center',
                color: '#6b7280',
                mb: 6,
                fontSize: { xs: '0.95rem', sm: '1.1rem' },
                maxWidth: 500,
                mx: 'auto',
              }}
            >
              Four interactive games designed by career psychologists to map your natural abilities.
            </Typography>
          </motion.div>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 3,
            }}
          >
            {FEATURES.map((f, i) => (
              <FeatureCard key={i} {...f} index={i} />
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── Stats ── */}
      <Box sx={{ py: { xs: 4, sm: 6 } }}>
        <Container maxWidth="md">
          <StatsBar />
        </Container>
      </Box>

      {/* ── CTA ── */}
      <Box sx={{ position: 'relative', py: { xs: 8, sm: 12 }, overflow: 'hidden' }}>
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(22,163,74,0.04) 0%, rgba(59,130,246,0.04) 100%)',
            zIndex: 0,
          }}
        />
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '1.5rem', sm: '2rem' },
                color: '#111827',
                letterSpacing: '-0.02em',
              }}
            >
              Ready to discover your direction?
            </Typography>
            <Typography sx={{ color: '#6b7280', mb: 4, lineHeight: 1.7 }}>
              Join students across India who found clarity about their career path
              through our game-based trait assessment.
            </Typography>
            <Link href="/register" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 2.5,
                  px: 5,
                  py: 1.5,
                  fontSize: '1.05rem',
                  boxShadow: '0 8px 24px rgba(22,163,74,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #15803d, #166534)',
                    boxShadow: '0 12px 32px rgba(22,163,74,0.4)',
                  },
                }}
              >
                Start Free Assessment →
              </Button>
            </Link>
          </motion.div>
        </Container>
      </Box>

      {/* ── Footer ── */}
      <Box
        component="footer"
        sx={{
          py: 4,
          textAlign: 'center',
          borderTop: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <Typography variant="caption" sx={{ color: '#9ca3af' }}>
          © {new Date().getFullYear()} Direction · Built for students, by educators
        </Typography>
      </Box>
    </Box>
  );
}

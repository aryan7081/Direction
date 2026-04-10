'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Typography,
  Container,
  Chip,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { fetchGameContent } from '@/features/game-assessment/api';
import {
  CAREER_CATALOG_LABEL,
  LANDING_STUDENTS_STAT_LABEL,
  LANDING_STUDENTS_STAT_VALUE,
  PRODUCT_NAME,
} from '@/lib/productCopy';

/* ── Gradient orbs (subtle, professional) ── */
function GradientOrbs() {
  return (
    <>
      <motion.div
        style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(22,163,74,0.10) 0%, transparent 70%)',
          top: '-10%', right: '-8%', filter: 'blur(50px)', pointerEvents: 'none',
        }}
        animate={{ scale: [1, 1.15, 1], x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          bottom: '5%', left: '-5%', filter: 'blur(50px)', pointerEvents: 'none',
        }}
        animate={{ scale: [1, 1.2, 1], x: [0, -15, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
    </>
  );
}

function GridPattern() {
  return (
    <Box
      sx={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)',
        backgroundSize: '32px 32px', pointerEvents: 'none', zIndex: 0,
      }}
    />
  );
}

/* ── Features ── */
const FEATURES = [
  {
    icon: '🧠',
    title: 'Science-backed questionnaire',
    desc: 'Phase 1 maps RIASEC interests, Big Five–style personality, career values, readiness, and short aptitude items — about 30 questions, honest answers only',
    color: '#6366f1',
  },
  {
    icon: '🎯',
    title: 'Stream recommendation',
    desc: 'Science, Commerce, or Arts — grounded in your interest and personality pattern, not just marks',
    color: '#3b82f6',
  },
  {
    icon: '💼',
    title: 'Career matches',
    desc: `See which careers from ${CAREER_CATALOG_LABEL} options fit your profile — optional premium adds more items and refines the match`,
    color: '#16a34a',
  },
  {
    icon: '📊',
    title: 'Report & PDF',
    desc: '15 profile dimensions plus 8 career-trait scores, top matches, roadmap — share with parents or counsellors',
    color: '#f59e0b',
  },
];

const STATS = [
  { value: LANDING_STUDENTS_STAT_VALUE, label: LANDING_STUDENTS_STAT_LABEL },
  { value: CAREER_CATALOG_LABEL, label: 'Careers Matched' },
  { value: '15', label: 'Profile dimensions' },
  { value: '~8–12 min', label: 'Phase 1' },
];

const TESTIMONIALS = [
  {
    quote: `I was torn between Science and Commerce. ${PRODUCT_NAME} showed me I'm a natural fit for Science with a career in Biotech. My parents were so relieved!`,
    name: 'Siddhartha',
    detail: 'Class 10, Gorakhpur',
  },
  {
    quote: 'The report was incredibly detailed — my counsellor at school was impressed. Best ₹49 my parents ever spent.',
    name: 'Juhi',
    detail: 'Class 10, Lucknow',
  },
  {
    quote: `I always thought I should do Science because of marks. ${PRODUCT_NAME} helped me realize Commerce suits my personality way better.`,
    name: 'Ayush',
    detail: 'Class 9, Delhi',
  },
];

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
          p: { xs: 2.5, sm: 3.5 }, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.06)', height: '100%',
          transition: 'all 0.3s ease', cursor: 'default',
          '&:hover': { transform: 'translateY(-6px)', boxShadow: `0 20px 40px -12px ${color}22`, borderColor: `${color}44` },
        }}
      >
        <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, mb: 2 }}>
          {icon}
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>{title}</Typography>
        <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.6 }}>{desc}</Typography>
      </Box>
    </motion.div>
  );
}

function StatsBar() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
      <Box
        sx={{
          display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: { xs: 2, sm: 3 }, py: 5, px: { xs: 2, sm: 4 }, borderRadius: 4,
          bgcolor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        {STATS.map((s, i) => (
          <Box key={i} sx={{ textAlign: 'center' }}>
            <Typography
              sx={{
                fontSize: { xs: '1.8rem', sm: '2.2rem' }, fontWeight: 800,
                background: 'linear-gradient(135deg, #16a34a, #6366f1)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2,
              }}
            >
              {s.value}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mt: 0.5 }}>{s.label}</Typography>
          </Box>
        ))}
      </Box>
    </motion.div>
  );
}

function TestimonialCard({ quote, name, detail, index }: typeof TESTIMONIALS[0] & { index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15 }}
    >
      <Box
        sx={{
          p: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(8px)', border: '1px solid rgba(0,0,0,0.06)', height: '100%',
          display: 'flex', flexDirection: 'column', gap: 2,
          transition: 'all 0.3s ease',
          '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(0,0,0,0.06)' },
        }}
      >
        <Box sx={{ display: 'flex', gap: 0.25 }}>
          {[...Array(5)].map((_, i) => (
            <Typography key={i} sx={{ fontSize: 14, color: '#f59e0b' }}>★</Typography>
          ))}
        </Box>
        <Typography sx={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.7, fontStyle: 'italic', flex: 1 }}>
          &ldquo;{quote}&rdquo;
        </Typography>
        <Box>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{name}</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>{detail}</Typography>
        </Box>
      </Box>
    </motion.div>
  );
}

/* ── Social Proof Strip ── */
function SocialProofStrip() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div ref={ref} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap', mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ display: 'flex' }}>
            {['#16a34a', '#3b82f6', '#6366f1', '#f59e0b'].map((c, i) => (
              <Box
                key={i}
                sx={{
                  width: 28, height: 28, borderRadius: '50%', bgcolor: c,
                  border: '2px solid #fff', ml: i > 0 ? -1 : 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 800, color: '#fff',
                }}
              >
                {['PS', 'AK', 'RS', 'NK'][i]}
              </Box>
            ))}
          </Box>
          <Typography sx={{ fontSize: { xs: '0.78rem', sm: '0.85rem' }, color: '#6b7280', fontWeight: 500 }}>
            <Box component="span" sx={{ fontWeight: 700, color: '#111827' }}>Many students</Box>
            {' '}are finding clarity with {PRODUCT_NAME}
          </Typography>
        </Box>
        <Chip
          label="⭐ 4.8/5 rating"
          size="small"
          sx={{ bgcolor: '#fffbeb', color: '#92400e', fontWeight: 600, border: '1px solid #fde68a', fontSize: '0.75rem' }}
        />
      </Box>
    </motion.div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const heroRef = useRef(null);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [accountMenuEl, setAccountMenuEl] = useState<null | HTMLElement>(null);
  const accountMenuOpen = Boolean(accountMenuEl);

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['game-content', 'free'],
      queryFn: () => fetchGameContent(),
    });
    router.prefetch('/game-assessment');
  }, [queryClient, router]);

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const displayName = user?.first_name || user?.email?.split('@')[0] || 'there';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafbfc', overflow: 'hidden' }}>
      {/* ── Navbar ── */}
      <Box
        component="header"
        sx={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          px: { xs: 2, sm: 4 }, py: { xs: 1, sm: 1.5 }, minHeight: { xs: 56, sm: 64 },
          display: 'flex', alignItems: 'center',
          bgcolor: 'rgba(250,251,252,0.92)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: { xs: 0, sm: 2 }, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Box sx={{ width: { xs: 112, sm: 128 }, height: { xs: 48, sm: 56 }, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box component="img" src="/logo.png" alt={PRODUCT_NAME} sx={{ height: { xs: 96, sm: 112 }, width: 'auto', minWidth: { xs: 96, sm: 112 }, objectFit: 'cover', objectPosition: 'center' }} />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, alignItems: 'center', flexShrink: 0, ml: 'auto' }}>
            {user ? (
              isSmDown ? (
                <>
                  <Button
                    id="landing-account-menu-button"
                    onClick={(e) => setAccountMenuEl(e.currentTarget)}
                    aria-label="Open account menu"
                    aria-expanded={accountMenuOpen ? 'true' : undefined}
                    aria-haspopup="true"
                    aria-controls={accountMenuOpen ? 'landing-account-menu' : undefined}
                    variant="outlined"
                    size="small"
                    sx={{
                      color: '#374151',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.8rem',
                      py: 0.75,
                      px: 1.25,
                      minHeight: 40,
                      borderColor: 'rgba(0,0,0,0.15)',
                      borderRadius: 2,
                      '&:hover': { borderColor: 'rgba(0,0,0,0.25)', bgcolor: 'rgba(0,0,0,0.03)' },
                    }}
                  >
                    Menu
                  </Button>
                  <Menu
                    id="landing-account-menu"
                    anchorEl={accountMenuEl}
                    open={accountMenuOpen}
                    onClose={() => setAccountMenuEl(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    slotProps={{ list: { 'aria-labelledby': 'landing-account-menu-button' }, paper: { sx: { minWidth: 200, borderRadius: 2, mt: 0.5 } } }}
                  >
                    <MenuItem
                      onClick={() => {
                        setAccountMenuEl(null);
                        router.push('/game-assessment');
                      }}
                      sx={{ fontWeight: 600, py: 1.25 }}
                    >
                      Assessment
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setAccountMenuEl(null);
                        router.push('/dashboard');
                      }}
                      sx={{ fontWeight: 600, py: 1.25 }}
                    >
                      Dashboard
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setAccountMenuEl(null);
                        handleLogout();
                      }}
                      sx={{ color: '#6b7280', fontWeight: 600, py: 1.25 }}
                    >
                      Log out
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Link href="/game-assessment" style={{ textDecoration: 'none' }}>
                    <Button size="small" sx={{ color: '#374151', fontWeight: 600, textTransform: 'none', fontSize: { xs: '0.8rem', sm: '0.9rem' }, py: { xs: 0.75, sm: 1.25 }, px: { xs: 1, sm: 1.5 }, minHeight: 40, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
                      Assessment
                    </Button>
                  </Link>
                  <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                    <Button
                      variant="contained" size="small"
                      sx={{
                        background: 'linear-gradient(135deg, #16a34a, #15803d)', textTransform: 'none', fontWeight: 600,
                        borderRadius: 2, px: { xs: 1.5, sm: 3 }, py: { xs: 0.75, sm: 1.25 }, fontSize: { xs: '0.8rem', sm: '0.9rem' },
                        minHeight: 40, whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
                        '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)', boxShadow: '0 6px 20px rgba(22,163,74,0.4)' },
                      }}
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    size="small" onClick={handleLogout}
                    sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'none', fontSize: { xs: '0.8rem', sm: '0.9rem' }, py: { xs: 0.75, sm: 1.25 }, px: { xs: 1, sm: 1.5 }, minHeight: 40, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', color: '#374151' } }}
                  >
                    Log out
                  </Button>
                </>
              )
            ) : (
              <>
                <Link href="/login" style={{ textDecoration: 'none' }}>
                  <Button size="small" sx={{ color: '#374151', fontWeight: 600, textTransform: 'none', fontSize: { xs: '0.8rem', sm: '0.9rem' }, py: { xs: 0.75, sm: 1.25 }, px: { xs: 1, sm: 1.5 }, minHeight: 40, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
                    Sign in
                  </Button>
                </Link>
                <Link href="/game-assessment" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained" size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #16a34a, #15803d)', textTransform: 'none', fontWeight: 600,
                      borderRadius: 2, px: { xs: 1.5, sm: 3 }, py: { xs: 0.75, sm: 1.25 }, fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      minHeight: 40, whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
                      '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)', boxShadow: '0 6px 20px rgba(22,163,74,0.4)' },
                    }}
                  >
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Start Free Assessment</Box>
                    <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Start Free</Box>
                  </Button>
                </Link>
              </>
            )}
          </Box>
        </Container>
      </Box>

      {/* ── Hero ── */}
      <Box
        ref={heroRef}
        sx={{
          position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', overflow: 'hidden', pt: { xs: 10, sm: 12 }, pb: { xs: 6, sm: 8 },
        }}
      >
        <GridPattern />
        <GradientOrbs />

        <motion.div style={{ y: heroY, opacity: heroOpacity, position: 'relative', zIndex: 1, width: '100%' }}>
          <Container maxWidth="md" sx={{ textAlign: 'center', px: { xs: 2, sm: 3 } }}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <Chip
                label={user ? `Welcome back, ${displayName}` : 'Free for Class 9–10 Students'}
                sx={{
                  mb: 3, bgcolor: 'rgba(22,163,74,0.08)', color: '#16a34a',
                  fontWeight: 600, fontSize: '0.82rem', height: 34, border: '1px solid rgba(22,163,74,0.2)',
                }}
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800, fontSize: { xs: '2.2rem', sm: '3.2rem', md: '3.8rem' },
                  lineHeight: 1.1, letterSpacing: '-0.03em', color: '#111827', mb: 2.5,
                }}
              >
                {user ? (
                  <>
                    Your career insights
                    <br />
                    <Box component="span" sx={{ background: 'linear-gradient(135deg, #16a34a 0%, #6366f1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      are waiting.
                    </Box>
                  </>
                ) : (
                  <>
                    Confused about which
                    <br />
                    <Box component="span" sx={{ background: 'linear-gradient(135deg, #16a34a 0%, #6366f1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      stream to choose?
                    </Box>
                  </>
                )}
              </Typography>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}>
              <Typography sx={{ fontSize: { xs: '1rem', sm: '1.2rem' }, color: '#6b7280', maxWidth: 560, mx: 'auto', mb: 4, lineHeight: 1.7 }}>
                {user
                  ? 'Access your dashboard to view your career report, retake the assessment, or explore career paths.'
                  : 'Built using scientifically proven methods used by top career counsellors worldwide. Get clarity in under 15 minutes.'}
              </Typography>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', alignItems: 'stretch', width: '100%', maxWidth: { xs: 340, sm: 'none' }, mx: 'auto' }}>
                {user ? (
                  <>
                    <Link href="/dashboard" style={{ textDecoration: 'none', width: '100%' }}>
                      <Button
                        variant="contained" size="large" fullWidth
                        sx={{
                          background: 'linear-gradient(135deg, #16a34a, #15803d)', textTransform: 'none', fontWeight: 700,
                          borderRadius: 2.5, px: 4, py: { xs: 1.75, sm: 1.5 }, fontSize: { xs: '0.95rem', sm: '1rem' }, minHeight: 48,
                          boxShadow: '0 8px 24px rgba(22,163,74,0.3)',
                          '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)', boxShadow: '0 12px 32px rgba(22,163,74,0.4)', transform: 'translateY(-1px)' },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        Go to Dashboard →
                      </Button>
                    </Link>
                    <Link href="/game-assessment" style={{ textDecoration: 'none', width: '100%' }}>
                      <Button
                        variant="outlined" size="large" fullWidth
                        sx={{
                          borderColor: 'rgba(0,0,0,0.15)', color: '#374151', textTransform: 'none', fontWeight: 600,
                          borderRadius: 2.5, px: 4, py: { xs: 1.75, sm: 1.5 }, fontSize: { xs: '0.95rem', sm: '1rem' }, minHeight: 48,
                          '&:hover': { borderColor: 'rgba(0,0,0,0.3)', bgcolor: 'rgba(0,0,0,0.02)' },
                        }}
                      >
                        Take Another Assessment
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/game-assessment" style={{ textDecoration: 'none', width: '100%' }}>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="contained" size="large" fullWidth
                          sx={{
                            background: 'linear-gradient(135deg, #16a34a, #15803d)', textTransform: 'none', fontWeight: 700,
                            borderRadius: 2.5, px: 4, py: { xs: 1.75, sm: 1.5 }, fontSize: { xs: '1rem', sm: '1.05rem' }, minHeight: 52,
                            boxShadow: '0 8px 24px rgba(22,163,74,0.3)',
                            '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)', boxShadow: '0 12px 32px rgba(22,163,74,0.4)' },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          Discover My Stream — It&apos;s Free →
                        </Button>
                      </motion.div>
                    </Link>
                    <Link href="/login" style={{ textDecoration: 'none', width: '100%' }}>
                      <Button
                        variant="outlined" size="large" fullWidth
                        sx={{
                          borderColor: 'rgba(0,0,0,0.15)', color: '#374151', textTransform: 'none', fontWeight: 600,
                          borderRadius: 2.5, px: 4, py: { xs: 1.75, sm: 1.5 }, fontSize: { xs: '0.95rem', sm: '1rem' }, minHeight: 48,
                          '&:hover': { borderColor: 'rgba(0,0,0,0.3)', bgcolor: 'rgba(0,0,0,0.02)' },
                        }}
                      >
                        I have an account
                      </Button>
                    </Link>
                  </>
                )}
              </Box>
            </motion.div>

            {!user && <SocialProofStrip />}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }}>
              <Typography variant="caption" sx={{ display: 'block', mt: user ? 3 : 2, color: '#9ca3af' }}>
                {user ? 'View your reports, retake the assessment, or explore careers.' : 'No signup needed · No credit card · 100% free assessment'}
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
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: 800, textAlign: 'center', mb: 1.5, fontSize: { xs: '1.6rem', sm: '2.2rem' }, color: '#111827', letterSpacing: '-0.02em' }}
            >
              How It Works
            </Typography>
            <Typography sx={{ textAlign: 'center', color: '#6b7280', mb: 6, fontSize: { xs: '0.95rem', sm: '1.1rem' }, maxWidth: 500, mx: 'auto' }}>
              A 5-minute assessment designed by career psychologists to map your natural abilities across 15 dimensions.
            </Typography>
          </motion.div>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
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

      {/* ── Testimonials ── */}
      <Box sx={{ py: { xs: 8, sm: 12 }, bgcolor: '#f8fafc' }}>
        <Container maxWidth="lg">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, textAlign: 'center', mb: 1.5, fontSize: { xs: '1.6rem', sm: '2.2rem' }, color: '#111827', letterSpacing: '-0.02em' }}>
              Students Love {PRODUCT_NAME}
            </Typography>
            <Typography sx={{ textAlign: 'center', color: '#6b7280', mb: 6, fontSize: { xs: '0.95rem', sm: '1.1rem' }, maxWidth: 500, mx: 'auto' }}>
              Real stories from students who found clarity about their career path.
            </Typography>
          </motion.div>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={i} {...t} index={i} />
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── Parent-Specific Section ── */}
      <Box sx={{ py: { xs: 8, sm: 10 } }}>
        <Container maxWidth="md">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <Box
              sx={{
                p: { xs: 3, sm: 5 }, borderRadius: 4, bgcolor: '#fff',
                border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontSize: 36, mb: 1 }}>👨‍👩‍👧</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', mb: 1.5, fontSize: { xs: '1.3rem', sm: '1.6rem' }, letterSpacing: '-0.02em' }}>
                For Parents
              </Typography>
              <Typography sx={{ color: '#6b7280', lineHeight: 1.7, mb: 3, maxWidth: 520, mx: 'auto', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Making the right stream choice after Class 10 is one of the most important decisions in your child&apos;s academic life.
                {PRODUCT_NAME} uses scientifically-backed assessment methodology — no guesswork, no bias. The report is shareable and easy to discuss with school counsellors.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 2, sm: 3 }, flexWrap: 'wrap', mb: 3 }}>
                {['🔒 Data stays private', '📊 Science-backed methodology', '📄 Shareable PDF report'].map((item) => (
                  <Typography key={item} sx={{ fontSize: '0.82rem', color: '#374151', fontWeight: 600 }}>{item}</Typography>
                ))}
              </Box>
              <Link href="/game-assessment" style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined" size="large"
                  sx={{
                    borderColor: '#16a34a', color: '#16a34a', textTransform: 'none', fontWeight: 600,
                    borderRadius: 2.5, px: 4, py: 1.25, fontSize: '0.95rem',
                    '&:hover': { bgcolor: 'rgba(22,163,74,0.04)', borderColor: '#15803d' },
                  }}
                >
                  Let Your Child Try It Free →
                </Button>
              </Link>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* ── Final CTA ── */}
      <Box sx={{ position: 'relative', py: { xs: 8, sm: 12 }, overflow: 'hidden' }}>
        <motion.div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(22,163,74,0.04) 0%, rgba(99,102,241,0.04) 100%)', zIndex: 0 }} />
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '1.5rem', sm: '2rem' }, color: '#111827', letterSpacing: '-0.02em' }}>
              Ready to discover your path with {PRODUCT_NAME}?
            </Typography>
            <Typography sx={{ color: '#6b7280', mb: 4, lineHeight: 1.7 }}>
              {user
                ? 'Your career insights are ready. Access your dashboard to view your report and explore matched careers.'
                : 'Join thousands of students across India who found clarity about their stream and career path — in just 5 minutes.'}
            </Typography>
            <Link href={user ? '/dashboard' : '/game-assessment'} style={{ textDecoration: 'none' }}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="contained" size="large"
                  sx={{
                    background: 'linear-gradient(135deg, #16a34a, #15803d)', textTransform: 'none', fontWeight: 700,
                    borderRadius: 2.5, px: 5, py: 1.5, fontSize: '1.05rem',
                    boxShadow: '0 8px 24px rgba(22,163,74,0.3)',
                    '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)', boxShadow: '0 12px 32px rgba(22,163,74,0.4)' },
                  }}
                >
                  {user ? 'Go to Dashboard →' : 'Start Free Assessment →'}
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </Container>
      </Box>

      {/* ── Footer ── */}
      <Box component="footer" sx={{ py: 4, textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <Typography variant="caption" sx={{ color: '#9ca3af' }}>
          © {new Date().getFullYear()} Outcave · Built for students, by educators
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Link href="/privacy" style={{ textDecoration: 'none' }}>
            <Typography variant="caption" sx={{ color: '#9ca3af', '&:hover': { color: '#6b7280' } }}>Privacy Policy</Typography>
          </Link>
          <Link href="/terms" style={{ textDecoration: 'none' }}>
            <Typography variant="caption" sx={{ color: '#9ca3af', '&:hover': { color: '#6b7280' } }}>Terms of Service</Typography>
          </Link>
        </Box>
      </Box>
    </Box>
  );
}

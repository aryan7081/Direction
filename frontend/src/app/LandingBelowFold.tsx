'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Box, Button, Typography, Container } from '@mui/material';
import { MotionConfig, motion, useInView } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import {
  CAREER_CATALOG_LABEL,
  LANDING_STUDENTS_STAT_LABEL,
  LANDING_STUDENTS_STAT_VALUE,
  PRODUCT_NAME,
} from '@/lib/productCopy';

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
        <Box aria-hidden sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, mb: 2 }}>
          {icon}
        </Box>
        <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>{title}</Typography>
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
          position: 'relative',
          display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: { xs: 2, sm: 3 }, py: 5, px: { xs: 2, sm: 4 }, borderRadius: 4,
          bgcolor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <Typography
          component="h2"
          sx={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          Key statistics
        </Typography>
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
        <Box aria-hidden sx={{ display: 'flex', gap: 0.25 }}>
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

const FOOTER_MUTED = '#6b7280';

export default function LandingBelowFold() {
  const user = useAuthStore((s) => s.user);

  return (
    <MotionConfig reducedMotion="user">
    <Box component="span" sx={{ display: 'contents' }}>
      <Box sx={{ position: 'relative', py: { xs: 8, sm: 12 } }}>
        <Container maxWidth="lg">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <Typography
              component="h2"
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

      <Box sx={{ py: { xs: 4, sm: 6 } }}>
        <Container maxWidth="md">
          <StatsBar />
        </Container>
      </Box>

      <Box sx={{ py: { xs: 8, sm: 12 }, bgcolor: '#f8fafc' }}>
        <Container maxWidth="lg">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <Typography component="h2" variant="h3" sx={{ fontWeight: 800, textAlign: 'center', mb: 1.5, fontSize: { xs: '1.6rem', sm: '2.2rem' }, color: '#111827', letterSpacing: '-0.02em' }}>
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
              <Typography aria-hidden sx={{ fontSize: 36, mb: 1 }}>👨‍👩‍👧</Typography>
              <Typography component="h2" variant="h4" sx={{ fontWeight: 800, color: '#111827', mb: 1.5, fontSize: { xs: '1.3rem', sm: '1.6rem' }, letterSpacing: '-0.02em' }}>
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

      <Box sx={{ position: 'relative', py: { xs: 8, sm: 12 }, overflow: 'hidden' }}>
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            background: 'linear-gradient(135deg, rgba(22,163,74,0.04) 0%, rgba(99,102,241,0.04) 100%)',
          }}
        />
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <Typography component="h2" variant="h4" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '1.5rem', sm: '2rem' }, color: '#111827', letterSpacing: '-0.02em' }}>
              Ready to discover your path with {PRODUCT_NAME}?
            </Typography>
            <Typography sx={{ color: '#6b7280', mb: 4, lineHeight: 1.7 }}>
              {user
                ? 'Your career insights are ready. Access your dashboard to view your report and explore matched careers.'
                : 'Join thousands of students across India who found clarity about their stream and career path — in just 5 minutes.'}
            </Typography>
            <Link href={user ? '/dashboard' : '/game-assessment'} style={{ textDecoration: 'none' }}>
              <Button
                variant="contained" size="large"
                sx={{
                  background: 'linear-gradient(135deg, #16a34a, #15803d)', textTransform: 'none', fontWeight: 700,
                  borderRadius: 2.5, px: 5, py: 1.5, fontSize: '1.05rem',
                  boxShadow: '0 8px 24px rgba(22,163,74,0.3)',
                  transition: 'transform 0.15s ease, background 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #15803d, #166534)',
                    boxShadow: '0 12px 32px rgba(22,163,74,0.4)',
                    transform: 'scale(1.02)',
                  },
                  '&:active': { transform: 'scale(0.98)' },
                }}
              >
                {user ? 'Go to Dashboard →' : 'Start Free Assessment →'}
              </Button>
            </Link>
          </motion.div>
        </Container>
      </Box>

      <Box component="footer" sx={{ py: 4, textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <Typography variant="caption" component="p" sx={{ color: FOOTER_MUTED, m: 0 }}>
          © {new Date().getFullYear()} Outcave · Built for students, by educators
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Link href="/privacy" style={{ textDecoration: 'none' }}>
            <Typography variant="caption" sx={{ color: FOOTER_MUTED, '&:hover': { color: '#374151' } }}>Privacy Policy</Typography>
          </Link>
          <Link href="/terms" style={{ textDecoration: 'none' }}>
            <Typography variant="caption" sx={{ color: FOOTER_MUTED, '&:hover': { color: '#374151' } }}>Terms of Service</Typography>
          </Link>
        </Box>
      </Box>
    </Box>
    </MotionConfig>
  );
}

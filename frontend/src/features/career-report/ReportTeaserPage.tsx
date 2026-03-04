'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  LinearProgress,
  Typography,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLoader, ButtonSpinner } from '@/components/ui/Loaders';
import { fetchReportTeaser, createPaymentOrder, verifyPayment } from './api';
import type { ReportTeaser } from './api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const WHAT_YOU_GET = [
  { icon: '🎯', title: '8-Trait Deep Analysis', desc: 'Understand your unique strengths with precise scores' },
  { icon: '🏆', title: 'Top 3 Career Matches', desc: 'Personalized career recommendations with match %' },
  { icon: '🧠', title: 'Dominant Personality Pattern', desc: 'Know your archetype and what it means for your future' },
  { icon: '📊', title: 'Interactive Radar Chart', desc: 'Visual profile of your abilities across all dimensions' },
  { icon: '🗺️', title: 'Step-by-Step Roadmap', desc: 'Class 10 → 11-12 → After 12th actionable plan' },
  { icon: '📄', title: 'Premium PDF Report', desc: 'A4 consulting-grade report to share with parents & mentors' },
];

const SOCIAL_PROOF_COUNT = 12847;

function LockedTraitBar() {
  return (
    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1 }}>
      <LinearProgress
        variant="determinate"
        value={50}
        sx={{
          flex: 1,
          height: 8,
          borderRadius: 4,
          bgcolor: '#f3f4f6',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            bgcolor: '#e5e7eb',
          },
        }}
      />
      <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, minWidth: 28 }}>
        🔒
      </Typography>
    </Box>
  );
}

function CountUp({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(interval);
  }, [target, duration]);
  return <>{count.toLocaleString('en-IN')}</>;
}

const STICKY_BAR_SCROLL_THRESHOLD = 120;

export function ReportTeaserPage({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [paying, setPaying] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowStickyBar(window.scrollY > STICKY_BAR_SCROLL_THRESHOLD);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const { data: teaser, isLoading, error } = useQuery({
    queryKey: ['report-teaser', sessionId],
    queryFn: () => fetchReportTeaser(sessionId),
    enabled: !!sessionId,
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && !document.getElementById('razorpay-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (teaser?.is_paid) {
      router.replace(`/report?session=${sessionId}`);
    }
  }, [teaser, sessionId, router]);

  const handlePurchase = async () => {
    setPaying(true);
    try {
      const orderData = await createPaymentOrder(sessionId);

      if (orderData.is_paid) {
        queryClient.invalidateQueries({ queryKey: ['report-teaser', sessionId] });
        router.push(`/report?session=${sessionId}`);
        return;
      }

      if (!orderData.order_id) {
        router.push(`/report?session=${sessionId}`);
        return;
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: 'Direction',
        description: 'Premium Career Intelligence Report',
        order_id: orderData.order_id,
        prefill: {
          email: orderData.user_email,
          name: orderData.user_name,
        },
        theme: { color: '#16a34a' },
        handler: async (response: any) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            queryClient.invalidateQueries({ queryKey: ['report-teaser', sessionId] });
            router.push(`/report?session=${sessionId}`);
          } catch {
            alert('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      alert('Could not initiate payment. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (isLoading) return <PageLoader message="Loading your career preview..." />;

  if (error || !teaser) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography color="error">Failed to load report preview.</Typography>
        <Button variant="outlined" onClick={() => router.push('/dashboard')} sx={{ mt: 2 }}>
          Go to Dashboard
        </Button>
      </Container>
    );
  }

  const price = teaser.price ?? 299;

  return (
    <>
    <Container maxWidth="sm" sx={{ py: { xs: 1, sm: 2 }, pb: showStickyBar ? 12 : 4 }}>
      {/* HERO: reveal the top career to hook them */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 4, sm: 5 },
            px: 3,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)',
            border: '1px solid #d1fae5',
            mb: 3,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(22,163,74,0.1) 0%, transparent 70%)',
            }}
          />
          <Typography
            variant="overline"
            sx={{ color: '#15803d', fontWeight: 700, letterSpacing: 2, fontSize: '0.7rem' }}
          >
            Your Assessment is Complete
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: '1rem', sm: '1.1rem' },
              color: '#6b7280',
              mt: 1,
              mb: 0.5,
            }}
          >
            {teaser.student_name}, your top career match is
          </Typography>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            <Typography
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem' },
                fontWeight: 800,
                color: '#111827',
                lineHeight: 1.2,
                mb: 1,
              }}
            >
              {teaser.hero_career}
            </Typography>
          </motion.div>

          <Chip
            label={`${teaser.hero_confidence} Confidence`}
            sx={{
              bgcolor: '#fff',
              color: '#16a34a',
              border: '1px solid #bbf7d0',
              fontWeight: 600,
              fontSize: '0.85rem',
              height: 34,
            }}
          />

          {teaser.dominant_pattern && (
            <Typography sx={{ color: '#6b7280', mt: 2, fontSize: '0.9rem' }}>
              Your personality pattern: <strong style={{ color: '#1e40af' }}>{teaser.dominant_pattern}</strong>
            </Typography>
          )}

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handlePurchase}
            disabled={paying}
            sx={{
              mt: 3,
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: 2.5,
              py: 1.8,
              fontSize: '1rem',
              boxShadow: '0 6px 24px rgba(22,163,74,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #15803d, #166534)',
                boxShadow: '0 8px 32px rgba(22,163,74,0.4)',
              },
            }}
          >
            {paying ? <><ButtonSpinner size={20} /> Processing...</> : <>🔓 Unlock full report — ₹{price}</>}
          </Button>
        </Box>
      </motion.div>

      {/* BLURRED TRAIT PREVIEW — creates desire */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Box
          sx={{
            bgcolor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.06)',
            p: { xs: 2.5, sm: 3 },
            mb: 3,
            position: 'relative',
          }}
        >
          <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '1rem', mb: 2 }}>
            Your 8-Trait Profile
          </Typography>

          {teaser.trait_preview.map((t) => (
            <Box key={t.label} sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                  {t.label}
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#9ca3af' }}>
                  —
                </Typography>
              </Box>
              <LockedTraitBar />
            </Box>
          ))}

          {/* Overlay lock */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(transparent, rgba(255,255,255,0.95))',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              pb: 2,
              borderRadius: '0 0 12px 12px',
            }}
          >
            <Typography sx={{ color: '#6b7280', fontWeight: 600, fontSize: '0.85rem' }}>
              🔒 Unlock exact scores & detailed analysis
            </Typography>
          </Box>
        </Box>
      </motion.div>

      {/* CAREER PREVIEW — no names shown, only teaser to unlock */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Box
          sx={{
            bgcolor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.06)',
            p: { xs: 2.5, sm: 3 },
            mb: 3,
          }}
        >
          <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '1rem', mb: 1 }}>
            Your Top 3 Career Matches
          </Typography>
          <Typography sx={{ color: '#6b7280', fontSize: '0.88rem', mb: 2 }}>
            Unlock your full report to see which careers fit you best — with match %, stream, and education paths.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {teaser.career_preview.map((c, i) => {
              const colors = ['#16a34a', '#3b82f6', '#f59e0b'];
              const isRevealed = 'career_name' in c && c.career_name;
              return (
                <Box
                  key={c.rank}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    py: 1.5,
                    px: 2,
                    borderRadius: 2,
                    bgcolor: isRevealed ? '#f0fdf4' : '#f9fafb',
                    border: `1px solid ${isRevealed ? '#bbf7d0' : '#e5e7eb'}`,
                  }}
                >
                  <Chip
                    label={`#${c.rank}`}
                    size="small"
                    sx={{
                      bgcolor: `${colors[i]}18`,
                      color: colors[i],
                      fontWeight: 700,
                      border: `1px solid ${colors[i]}40`,
                      height: 24,
                    }}
                  />
                  {isRevealed ? (
                    <>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>
                          {c.career_name}
                        </Typography>
                        {c.stream && (
                          <Typography sx={{ fontSize: '0.78rem', color: '#6b7280' }}>
                            {c.stream}
                          </Typography>
                        )}
                      </Box>
                    </>
                  ) : (
                    <>
                      <Typography sx={{ flex: 1, color: '#9ca3af', fontSize: '0.9rem', fontStyle: 'italic' }}>
                        Unlock to reveal
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                        🔒
                      </Typography>
                    </>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </motion.div>

      {/* SOCIAL PROOF */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography sx={{ fontSize: '0.85rem', color: '#6b7280' }}>
            <strong style={{ color: '#16a34a' }}>
              <CountUp target={SOCIAL_PROOF_COUNT} />+
            </strong>{' '}
            students have unlocked their career report
          </Typography>
        </Box>
      </motion.div>

      {/* WHAT YOU GET */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Box
          sx={{
            bgcolor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.06)',
            p: { xs: 2.5, sm: 3 },
            mb: 3,
          }}
        >
          <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '1rem', mb: 2 }}>
            What&apos;s Inside Your Report
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            {WHAT_YOU_GET.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.05 }}
              >
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <Typography sx={{ fontSize: '1.4rem', lineHeight: 1 }}>{item.icon}</Typography>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.85rem' }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ color: '#6b7280', fontSize: '0.78rem', lineHeight: 1.5 }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        </Box>
      </motion.div>

      {/* PRICING CTA */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 4, sm: 5 },
            px: 3,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            border: '2px solid #bbf7d0',
            mb: 3,
          }}
        >
          {/* Anchoring: crossed out higher price */}
          <Typography sx={{ fontSize: '0.85rem', color: '#9ca3af', mb: 0.5 }}>
            <span style={{ textDecoration: 'line-through' }}>₹999</span>{' '}
            <Chip
              label="Limited Time"
              size="small"
              sx={{
                bgcolor: '#fef2f2',
                color: '#dc2626',
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 20,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.7 },
                },
              }}
            />
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: '2.8rem', sm: '3.5rem' },
              fontWeight: 800,
              color: '#16a34a',
              lineHeight: 1,
              mb: 0.5,
            }}
          >
            ₹{price}
          </Typography>

          <Typography sx={{ color: '#6b7280', fontSize: '0.85rem', mb: 3 }}>
            One-time payment · Lifetime access · Instant delivery
          </Typography>

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handlePurchase}
            disabled={paying}
            sx={{
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: 3,
              py: 2,
              fontSize: '1.1rem',
              boxShadow: '0 8px 30px rgba(22,163,74,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #15803d, #166534)',
                boxShadow: '0 12px 40px rgba(22,163,74,0.4)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {paying ? (
              <><ButtonSpinner size={22} /> Processing...</>
            ) : (
              <>🔓 Unlock My Full Career Report</>
            )}
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}>
            {['🔒 Secure Payment', '⚡ Instant Access', '📄 PDF Download'].map((item) => (
              <Typography key={item} sx={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 500 }}>
                {item}
              </Typography>
            ))}
          </Box>
        </Box>
      </motion.div>

      {/* URGENCY + TRUST */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
        <Box
          sx={{
            bgcolor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 2.5,
            p: 2.5,
            mb: 3,
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontWeight: 700, color: '#92400e', fontSize: '0.9rem', mb: 0.5 }}>
            ⏳ Your assessment data is time-sensitive
          </Typography>
          <Typography sx={{ color: '#78350f', fontSize: '0.82rem', lineHeight: 1.6 }}>
            Career aptitude signals are strongest when reviewed immediately after the assessment.
            We recommend unlocking your report within 48 hours for the most accurate guidance.
          </Typography>
        </Box>
      </motion.div>

      {/* FAQ TRUST BUILDERS */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <Box
          sx={{
            bgcolor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.06)',
            p: { xs: 2.5, sm: 3 },
            mb: 3,
          }}
        >
          <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '1rem', mb: 2 }}>
            Frequently Asked
          </Typography>

          {[
            {
              q: 'Who is this report for?',
              a: 'Class 9-12 students and their parents who want data-driven career guidance instead of guesswork.',
            },
            {
              q: 'Is this a generic report?',
              a: 'No. Every word is generated from YOUR assessment scores. No two reports are the same.',
            },
            {
              q: 'Can I share it with my parents/teacher?',
              a: 'Absolutely. The PDF is designed to be shared with parents, teachers, and career counsellors.',
            },
            {
              q: 'What if I\'m not satisfied?',
              a: 'Contact us within 7 days and we\'ll work with you to address any concerns.',
            },
          ].map((faq, i) => (
            <Box key={i} sx={{ mb: i < 3 ? 2 : 0 }}>
              <Typography sx={{ fontWeight: 700, color: '#374151', fontSize: '0.88rem', mb: 0.3 }}>
                {faq.q}
              </Typography>
              <Typography sx={{ color: '#6b7280', fontSize: '0.82rem', lineHeight: 1.6 }}>
                {faq.a}
              </Typography>
              {i < 3 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}
        </Box>
      </motion.div>

      {/* BOTTOM CTA (sticky feel) */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handlePurchase}
            disabled={paying}
            sx={{
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: 3,
              py: 1.8,
              fontSize: '1rem',
              boxShadow: '0 8px 30px rgba(22,163,74,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #15803d, #166534)',
                boxShadow: '0 12px 40px rgba(22,163,74,0.4)',
              },
            }}
          >
            {paying ? <><ButtonSpinner size={20} /> Processing...</> : <>🔓 Unlock Report — ₹{price}</>}
          </Button>
          <Typography sx={{ color: '#9ca3af', fontSize: '0.75rem', mt: 1 }}>
            Powered by Razorpay · 100% Secure
          </Typography>
        </Box>
      </motion.div>

      {/* Skip link */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Button
          size="small"
          onClick={() => router.push('/dashboard')}
          sx={{ color: '#9ca3af', textTransform: 'none', fontSize: '0.82rem' }}
        >
          ← Back to Dashboard
        </Button>
      </Box>
    </Container>

      {/* Sticky bottom CTA — visible on scroll so user can unlock without scrolling back up */}
      {showStickyBar && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            px: 2,
            py: 1.5,
            bgcolor: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid #e5e7eb',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
            pb: 'max(12px, env(safe-area-inset-bottom))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>
            Unlock full report — ₹{price}
          </Typography>
          <Button
            variant="contained"
            size="medium"
            onClick={handlePurchase}
            disabled={paying}
            sx={{
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: 2.5,
              px: 3,
              py: 1.2,
              fontSize: '0.95rem',
              boxShadow: '0 4px 16px rgba(22,163,74,0.3)',
              '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)' },
            }}
          >
            {paying ? <><ButtonSpinner size={18} /> Processing...</> : '🔓 Unlock now'}
          </Button>
        </Box>
      )}
    </>
  );
}

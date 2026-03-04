'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Box, Button, Chip, Collapse, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { PageLoader, ButtonSpinner } from '@/components/ui/Loaders';
import { fetchReportTeaser, createPaymentOrder, verifyPayment } from './api';
import type { ReportTeaser } from './api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SOCIAL_PROOF_COUNT = 12847;

function CountUp({ target, duration = 2200 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(t);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return <>{count.toLocaleString('en-IN')}</>;
}

const WHAT_INSIDE = [
  '8-trait deep analysis with your exact scores',
  'Top 3 career matches with match % and education paths',
  'Dominant personality pattern & roadmap (Class 10 → 12th)',
  'Premium PDF to share with parents & counsellors',
];

export function ReportTeaserPage({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [paying, setPaying] = useState(false);
  const [showWhatInside, setShowWhatInside] = useState(false);

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
      document.body.appendChild(script);
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
        modal: { ondismiss: () => setPaying(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      alert('Could not initiate payment. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (isLoading) return <PageLoader message="Loading your result..." />;

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
    <Container maxWidth="sm" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 }, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Big result card */}
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 3, sm: 5 },
            px: { xs: 2, sm: 3 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)',
            border: '1px solid #d1fae5',
            mb: 3,
          }}
        >
          <Typography
            variant="overline"
            sx={{ color: '#15803d', fontWeight: 700, letterSpacing: 1.5, fontSize: '0.7rem' }}
          >
            Your top career match
          </Typography>

          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
          >
            <Typography
              sx={{
                fontSize: { xs: '2rem', sm: '2.6rem' },
                fontWeight: 800,
                color: '#111827',
                lineHeight: 1.2,
                mt: 0.5,
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
              height: 32,
            }}
          />

          <Typography
            sx={{
              mt: 2.5,
              fontSize: '1rem',
              color: '#374151',
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            This matches your strongest behavioral pattern.
          </Typography>
          <Typography
            sx={{
              mt: 1,
              fontSize: '0.9rem',
              color: '#6b7280',
              lineHeight: 1.5,
              fontWeight: 500,
              fontStyle: 'italic',
            }}
          >
            Based on your responses, this is statistically your strongest match.
          </Typography>
          <Typography
            sx={{
              mt: 1.5,
              fontSize: '0.85rem',
              color: '#4b5563',
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            Most students never get this level of clarity before choosing their path.
          </Typography>
        </Box>

        {/* Primary CTA — larger, heavier, only thing to click */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handlePurchase}
          disabled={paying}
          sx={{
            py: { xs: 2, sm: 2.2 },
            minHeight: 52,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            textTransform: 'none',
            fontWeight: 800,
            fontSize: { xs: '1rem', sm: '1.12rem' },
            letterSpacing: '-0.02em',
            boxShadow: '0 10px 32px rgba(22,163,74,0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #15803d, #166534)',
              boxShadow: '0 12px 40px rgba(22,163,74,0.45)',
            },
          }}
        >
          {paying ? (
            <><ButtonSpinner size={24} /> Processing...</>
          ) : (
            <>🔒 Get My Complete Career Roadmap — ₹{price}</>
          )}
        </Button>

        {/* Subtle urgency */}
        <Typography
          sx={{
            mt: 1.5,
            textAlign: 'center',
            fontSize: '0.8rem',
            color: '#6b7280',
            fontWeight: 500,
          }}
        >
          ⚡ Unlock within 24 hours for maximum accuracy.
        </Typography>

        {/* Trust row */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 2, sm: 3 },
            flexWrap: 'wrap',
            mt: 2,
            mb: 2,
          }}
        >
          {['✓ Instant PDF', '✓ Parent-share ready', '✓ Personalized analysis'].map((item) => (
            <Typography key={item} sx={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>
              {item}
            </Typography>
          ))}
        </Box>

        {/* Locked Top 3 — curiosity lever, darker bg, blur on locked, gap line */}
        <Box
          sx={{
            py: 1.5,
            px: 2,
            mb: 2,
            borderRadius: 2,
            bgcolor: '#f1f5f9',
            border: '1px solid #e2e8f0',
          }}
        >
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', mb: 1.5, textAlign: 'center' }}>
            Your Top 3 Career Matches
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {teaser.career_preview.map((c, i) => {
              const isRevealed = 'career_name' in c && c.career_name;
              const colors = ['#16a34a', '#6b7280', '#6b7280'];
              return (
                <Box
                  key={c.rank}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    py: 0.75,
                    px: 1.5,
                    borderRadius: 1,
                    bgcolor: isRevealed ? 'rgba(22,163,74,0.08)' : 'rgba(255,255,255,0.6)',
                    filter: isRevealed ? 'none' : 'blur(0.4px)',
                    transition: 'filter 0.2s ease',
                    '&:hover': {
                      filter: isRevealed ? 'none' : 'blur(0.2px)',
                    },
                    '& .lock-icon': {
                      display: 'inline-block',
                      transition: 'transform 0.25s ease',
                    },
                    '&:hover .lock-icon': {
                      transform: 'scale(1.15)',
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: colors[i], minWidth: 20 }}>
                    #{c.rank}
                  </Typography>
                  {isRevealed ? (
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827' }}>
                      {c.career_name}
                    </Typography>
                  ) : (
                    <Typography sx={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                      <span className="lock-icon">🔒</span> Unlock to reveal
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
          {teaser.top_two_gap != null && (
            <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textAlign: 'center', mt: 1.5 }}>
              Difference between #1 and #2 is only {teaser.top_two_gap}%
            </Typography>
          )}
          <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', mt: 1 }}>
            See full ranking, match % and stream path.
          </Typography>
        </Box>

        {/* Social proof — validation before paying */}
        <Box
          sx={{
            textAlign: 'center',
            py: 2,
            px: 2,
            borderRadius: 2,
            bgcolor: 'rgba(0,0,0,0.02)',
            border: '1px solid rgba(0,0,0,0.06)',
            mb: 2,
          }}
        >
          <Typography sx={{ fontSize: '0.9rem', color: '#374151', fontWeight: 600 }}>
            <CountUp target={SOCIAL_PROOF_COUNT} />+ students unlocked their blueprint
          </Typography>
        </Box>

        {/* See what's inside — collapsible so page isn't dead if they don't click */}
        <Box sx={{ mb: 2 }}>
          <Button
            fullWidth
            onClick={() => setShowWhatInside((v) => !v)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: '#6b7280',
              fontSize: '0.88rem',
              justifyContent: 'center',
              py: 1,
            }}
          >
            {showWhatInside ? '▼ Hide' : 'See what\'s inside'}
          </Button>
          <Collapse in={showWhatInside}>
            <Box
              component="ul"
              sx={{
                m: 0,
                pl: 2.5,
                py: 1,
                '& li': { fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.8 },
              }}
            >
              {WHAT_INSIDE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </Box>
          </Collapse>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Button
            size="small"
            onClick={() => router.push('/dashboard')}
            sx={{ color: '#9ca3af', textTransform: 'none', fontSize: '0.82rem' }}
          >
            ← Back to Dashboard
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
}

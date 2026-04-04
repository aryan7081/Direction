'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Chip,
  Container,
  Snackbar,
  Alert,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { PageLoader, ButtonSpinner } from '@/components/ui/Loaders';
import { useAuthStore } from '@/stores/authStore';
import { fetchReportTeaser, createPaymentOrder, verifyPayment } from './api';
import { googleAuth } from '@/features/auth/api';
import { GoogleSignInButton } from '@/features/auth/GoogleSignInButton';
import type { ReportTeaser } from './api';
import { REPORT_PRICE_INR } from '@/lib/productCopy';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SOCIAL_PROOF_COUNT = 12_847;

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

const STREAM_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Science: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  Commerce: { bg: '#fefce8', text: '#a16207', border: '#fde68a' },
  Arts: { bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8' },
  Humanities: { bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8' },
};

const UNLOCK_FEATURES = [
  { icon: '📊', text: 'Detailed trait analysis across 8 dimensions with exact scores' },
  { icon: '🎯', text: 'Top 5 career matches with confidence scores & education paths' },
  { icon: '🗺️', text: 'Personalized development roadmap (Class 10 → 12th → College)' },
  { icon: '📈', text: 'Career comparison chart — see why #1 beats #2' },
  { icon: '📄', text: 'Premium PDF report to share with parents & counsellors' },
];

export function ReportTeaserPage({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);
  const [paying, setPaying] = useState(false);
  const [showSignInStep, setShowSignInStep] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'error' | 'success' }>({
    open: false,
    message: '',
    severity: 'error',
  });

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

  const showError = (message: string) => setSnack({ open: true, message, severity: 'error' });

  const needsSignIn = !user;

  const handleUnlockClick = () => {
    if (needsSignIn) {
      setShowSignInStep(true);
    } else {
      handlePurchase();
    }
  };

  const handleGoogleSignInAndPurchase = async (credential: string) => {
    setSigningIn(true);
    try {
      const res = await googleAuth(credential, sessionId);
      setAuth(res.user, res.access, res.refresh);
      setShowSignInStep(false);
      await handlePurchase();
    } catch {
      showError('Sign in failed. Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

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
        name: 'Outcave',
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
            showError('Payment verification failed. Please contact support@outcave.in');
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      showError('Could not initiate payment. Please try again.');
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

  const price = REPORT_PRICE_INR;
  const streamColor = STREAM_COLORS[teaser.stream_recommendation] || STREAM_COLORS.Science;

  if (showSignInStep) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 }, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', mb: 1 }}>
              Sign in to unlock
            </Typography>
            <Typography sx={{ color: '#6b7280', fontSize: '0.95rem' }}>
              Sign in with Google to securely purchase and access your full report.
            </Typography>
          </Box>
          <Box sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {signingIn ? (
              <Box sx={{ py: 3 }}>
                <ButtonSpinner size={32} />
                <Typography sx={{ mt: 1, fontSize: '0.9rem', color: '#6b7280' }}>Signing you in...</Typography>
              </Box>
            ) : (
              <GoogleSignInButton onSuccess={handleGoogleSignInAndPurchase} text="signin_with" width={280} />
            )}
            <Button size="small" onClick={() => setShowSignInStep(false)} sx={{ color: '#9ca3af', textTransform: 'none' }}>
              ← Back
            </Button>
          </Box>
        </motion.div>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="sm" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 }, minHeight: '100vh' }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* ── Header: celebration ── */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
              <Box sx={{ fontSize: 48, mb: 1 }}>🎉</Box>
            </motion.div>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
              Your Results Are Ready!
            </Typography>
            <Typography sx={{ color: '#6b7280', fontSize: '0.9rem', mt: 0.5 }}>
              Here&apos;s a preview of what we found about you
            </Typography>
          </Box>

          {/* ── Free Insights Card ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Box
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
                mb: 3,
                bgcolor: '#fff',
              }}
            >
              <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 1 }}>
                  ✓ Your Free Insights
                </Typography>
              </Box>

              <Box sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Stream Recommendation */}
                {teaser.stream_recommendation && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: streamColor.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      🎓
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Recommended Stream</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>
                          {teaser.stream_recommendation}
                        </Typography>
                        <Chip
                          label="✓ Matched"
                          size="small"
                          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700, bgcolor: streamColor.bg, color: streamColor.text, border: `1px solid ${streamColor.border}` }}
                        />
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Personality Type */}
                {teaser.dominant_pattern && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      🧠
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Your Personality Type</Typography>
                      <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>
                        {teaser.dominant_pattern}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Top Career Match */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    🏆
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>#1 Career Match</Typography>
                    <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}>
                      {teaser.hero_career_category ? (
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#15803d', display: 'block', mb: 0.25 }}>
                          {teaser.hero_career_category}
                        </Typography>
                      ) : null}
                      <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>
                        {teaser.hero_career}
                      </Typography>
                    </motion.div>
                  </Box>
                  <Chip
                    label={`${teaser.hero_confidence}`}
                    size="small"
                    sx={{ ml: 'auto', height: 24, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#ecfdf5', color: '#16a34a', border: '1px solid #bbf7d0' }}
                  />
                </Box>
              </Box>
            </Box>
          </motion.div>

          {/* ── Rarity / Curiosity Hook ── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Box sx={{ textAlign: 'center', mb: 3, py: 1.5, px: 2, borderRadius: 2, background: 'linear-gradient(135deg, #faf5ff 0%, #eff6ff 100%)', border: '1px solid #e9d5ff' }}>
              <Typography sx={{ fontSize: '0.85rem', color: '#6d28d9', fontWeight: 600 }}>
                ✨ Only 8% of students share your exact trait combination
              </Typography>
            </Box>
          </motion.div>

          {/* ── Unlock Section ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Box
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'rgba(99,102,241,0.2)',
                mb: 3,
                bgcolor: '#fff',
              }}
            >
              <Box sx={{ px: 2.5, py: 1.5, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 1 }}>
                  🔓 Unlock Your Full Report
                </Typography>
              </Box>

              <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {UNLOCK_FEATURES.map((f) => (
                    <Box key={f.text} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <Typography sx={{ fontSize: 18, lineHeight: 1.4, flexShrink: 0 }}>{f.icon}</Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.5, fontWeight: 500 }}>
                        {f.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </motion.div>

          {/* ── Value Anchoring ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 2, sm: 3 },
                py: 2,
                px: 2,
                mb: 2,
                borderRadius: 2,
                bgcolor: '#fffbeb',
                border: '1px solid #fde68a',
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.7rem', color: '#92400e', fontWeight: 600, textTransform: 'uppercase' }}>
                  Career Counselor
                </Typography>
                <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: '#92400e', textDecoration: 'line-through', opacity: 0.7 }}>
                  ₹3,000+
                </Typography>
              </Box>

              <Box sx={{ fontSize: 20, color: '#d97706' }}>→</Box>

              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase' }}>
                  Outcave Report
                </Typography>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>
                  ₹{price}
                </Typography>
              </Box>
            </Box>
          </motion.div>

          {/* ── Primary CTA ── */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45 }}>
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleUnlockClick}
                disabled={paying}
                sx={{
                  py: { xs: 2, sm: 2.2 },
                  minHeight: 56,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: { xs: '1.05rem', sm: '1.15rem' },
                  letterSpacing: '-0.02em',
                  boxShadow: '0 10px 32px rgba(22,163,74,0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #15803d, #166534)',
                    boxShadow: '0 12px 40px rgba(22,163,74,0.5)',
                  },
                }}
              >
                {paying ? (
                  <><ButtonSpinner size={24} /> Processing...</>
                ) : (
                  <>🔓 Unlock Full Report — ₹{price}</>
                )}
              </Button>
            </motion.div>
          </motion.div>

          {/* ── Trust Badges ── */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 1.5, sm: 2.5 }, flexWrap: 'wrap', mt: 2, mb: 2 }}>
            {[
              { icon: '🔒', text: 'Secure Payment' },
              { icon: '⚡', text: 'Instant Access' },
              { icon: '📱', text: 'Razorpay Protected' },
            ].map((badge) => (
              <Box key={badge.text} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontSize: 14 }}>{badge.icon}</Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600 }}>
                  {badge.text}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* ── Social Proof ── */}
          <Box sx={{ textAlign: 'center', py: 1.5, px: 2, mb: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontSize: '0.88rem', color: '#374151', fontWeight: 600 }}>
              📊 <CountUp target={SOCIAL_PROOF_COUNT} />+ students unlocked their career report
            </Typography>
          </Box>

          {/* ── Locked Top 3 Preview ── */}
          <Box sx={{ py: 1.5, px: 2, mb: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', mb: 1.5, textAlign: 'center' }}>
              Your Top 3 Career Matches
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {teaser.career_preview.map((c, i) => {
                const isRevealed = 'career_name' in c && c.career_name;
                return (
                  <Box
                    key={c.rank}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 0.75,
                      px: 1.5,
                      borderRadius: 1.5,
                      bgcolor: isRevealed ? 'rgba(22,163,74,0.06)' : 'rgba(255,255,255,0.7)',
                      border: isRevealed ? '1px solid rgba(22,163,74,0.15)' : '1px solid transparent',
                      filter: isRevealed ? 'none' : 'blur(0.5px)',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: i === 0 ? '#16a34a' : '#9ca3af', minWidth: 20 }}>
                      #{c.rank}
                    </Typography>
                    {isRevealed ? (
                      <Box>
                        {c.career_category ? (
                          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803d', display: 'block' }}>
                            {c.career_category}
                          </Typography>
                        ) : null}
                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827' }}>
                          {c.career_name}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography sx={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                        🔒 Unlock to reveal
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
            {teaser.top_two_gap != null && (
              <Typography sx={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 600, textAlign: 'center', mt: 1.5 }}>
                Gap between #1 and #2 is only {teaser.top_two_gap}% — the details matter
              </Typography>
            )}
          </Box>

          {/* ── Back ── */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
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

      {/* ── Toast Notifications ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
}

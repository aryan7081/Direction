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
  Stack,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';
import { PageLoader, ButtonSpinner } from '@/components/ui/Loaders';
import { useAuthStore } from '@/stores/authStore';
import { fetchReportTeaser, createPaymentOrder, verifyPayment } from './api';
import { googleAuth } from '@/features/auth/api';
import { GoogleSignInButton } from '@/features/auth/GoogleSignInButton';
import {
  LANDING_STUDENTS_STAT_LABEL,
  LANDING_STUDENTS_STAT_VALUE,
  PREMIUM_BUNDLE_PRICE_INR,
  PRODUCT_NAME,
  REPORT_PRICE_INR,
} from '@/lib/productCopy';
import type { PaymentProductType } from './api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const COUNSELLING_ANCHOR_LABEL = '₹3,000+';

const REPORT_BULLETS = [
  'Unlock the full report from this session — no extra questions',
  'Trait scores, stream read, top careers & a Class 10→college roadmap',
  'Share-ready for parents, teachers, or counselling conversations',
];

const PREMIUM_BULLETS = [
  'Complete a short add-on assessment — we refine your profile first',
  'Then unlock the same full report with our most confident matches',
  'Ideal when two streams or careers feel “too close to call”',
];

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

const pageBg =
  'linear-gradient(165deg, #f0fdf4 0%, #ecfeff 28%, #eff6ff 55%, #faf5ff 100%)';

function BulletRow({ children }: { children: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ py: 0.35 }}>
      <Typography sx={{ color: '#16a34a', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.4, flexShrink: 0 }} aria-hidden>
        ✓
      </Typography>
      <Typography sx={{ fontSize: '0.84rem', color: '#374151', lineHeight: 1.55, fontWeight: 500 }}>{children}</Typography>
    </Stack>
  );
}

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
    if (teaser?.report_accessible ?? teaser?.is_paid) {
      router.replace(`/report?session=${sessionId}`);
    }
  }, [teaser, sessionId, router]);

  const showError = (message: string) => setSnack({ open: true, message, severity: 'error' });

  const needsSignIn = !user;

  const [pendingProduct, setPendingProduct] = useState<PaymentProductType>('report');

  const handleUnlockClick = (productType: PaymentProductType) => {
    setPendingProduct(productType);
    if (needsSignIn) {
      setShowSignInStep(true);
    } else {
      handlePurchase(productType);
    }
  };

  const handleGoogleSignInAndPurchase = async (credential: string) => {
    setSigningIn(true);
    try {
      const res = await googleAuth(credential, sessionId);
      setAuth(res.user, res.access, res.refresh);
      setShowSignInStep(false);
      await handlePurchase(pendingProduct);
    } catch {
      showError('Sign in failed. Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

  const handlePurchase = async (productType: PaymentProductType) => {
    setPaying(true);
    try {
      const orderData = await createPaymentOrder(sessionId, { product_type: productType });

      if (orderData.premium_pending_extension) {
        showError('Finish your premium questions first, then your report unlocks.');
        return;
      }

      if (orderData.is_paid) {
        queryClient.invalidateQueries({ queryKey: ['report-teaser', sessionId] });
        if (productType === 'premium_bundle') {
          router.push(`/game-assessment?premium_continue=${sessionId}`);
        } else {
          router.push(`/report?session=${sessionId}`);
        }
        return;
      }

      if (!orderData.order_id) {
        queryClient.invalidateQueries({ queryKey: ['report-teaser', sessionId] });
        if (productType === 'premium_bundle') {
          router.push(`/game-assessment?premium_continue=${sessionId}`);
        } else {
          router.push(`/report?session=${sessionId}`);
        }
        return;
      }

      const desc =
        productType === 'premium_bundle'
          ? 'Premium assessment + full career report'
          : 'Full career report (30-question run)';

      const options = {
        key: orderData.key_id,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: 'Outcave',
        description: desc,
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
            if (productType === 'premium_bundle') {
              router.push(`/game-assessment?premium_continue=${sessionId}`);
            } else {
              router.push(`/report?session=${sessionId}`);
            }
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

  const reportPrice = teaser.report_price_inr ?? REPORT_PRICE_INR;
  const bundlePrice = teaser.premium_bundle_price_inr ?? PREMIUM_BUNDLE_PRICE_INR;
  const streamColor = STREAM_COLORS[teaser.stream_recommendation] || STREAM_COLORS.Science;
  const firstName = teaser.student_name?.split(/\s+/)[0] || 'there';

  if (showSignInStep) {
    return (
      <Box sx={{ minHeight: '100vh', background: pageBg }}>
        <Container maxWidth="sm" sx={{ py: { xs: 3, sm: 6 }, px: { xs: 2, sm: 3 } }}>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <Box
              sx={{
                borderRadius: 4,
                p: { xs: 3, sm: 4 },
                bgcolor: alpha('#fff', 0.92),
                backdropFilter: 'blur(12px)',
                border: '1px solid',
                borderColor: alpha('#0f172a', 0.06),
                boxShadow: '0 24px 80px -20px rgba(15,23,42,0.15)',
                textAlign: 'center',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, letterSpacing: '-0.02em' }}>
                Sign in to continue
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, mb: 3 }}>
                One quick sign-in with Google keeps your purchase and report in one secure place.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                {signingIn ? (
                  <Box sx={{ py: 3 }}>
                    <ButtonSpinner size={32} />
                    <Typography sx={{ mt: 1, fontSize: '0.9rem', color: '#64748b' }}>Signing you in...</Typography>
                  </Box>
                ) : (
                  <GoogleSignInButton onSuccess={handleGoogleSignInAndPurchase} text="signin_with" width={280} />
                )}
                <Button size="small" onClick={() => setShowSignInStep(false)} sx={{ color: '#94a3b8', textTransform: 'none' }}>
                  ← Back
                </Button>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ minHeight: '100vh', background: pageBg, pb: 6 }}>
        <Container maxWidth="md" sx={{ py: { xs: 2.5, sm: 4 }, px: { xs: 2, sm: 3 } }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <Box sx={{ textAlign: 'center', mb: { xs: 2.5, sm: 3.5 } }}>
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              >
                <Typography sx={{ fontSize: { xs: 40, sm: 44 }, lineHeight: 1, mb: 1.5 }} aria-hidden>
                  ✨
                </Typography>
              </motion.div>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.03em',
                  fontSize: { xs: '1.55rem', sm: '2rem' },
                  lineHeight: 1.2,
                  mb: 1,
                }}
              >
                {firstName}, your snapshot is ready
              </Typography>
              <Typography
                sx={{
                  color: '#475569',
                  fontSize: { xs: '0.92rem', sm: '1rem' },
                  maxWidth: 520,
                  mx: 'auto',
                  lineHeight: 1.65,
                }}
              >
                You&apos;ve done the hard part. Unlock the full story — structured scores, career matches, and a roadmap
                you can actually use with {PRODUCT_NAME}.
              </Typography>
            </Box>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1, sm: 0 }}
              justifyContent="center"
              alignItems="center"
              sx={{ mb: 3, gap: { sm: 2 } }}
            >
              {[
                { emoji: '🛡️', label: 'Razorpay checkout' },
                { emoji: '⚡', label: 'Instant access after pay' },
                { emoji: '🔒', label: 'Your data stays private' },
              ].map(({ emoji, label }) => (
                <Chip
                  key={label}
                  icon={
                    <Box component="span" sx={{ pl: 0.75, display: 'flex', fontSize: '0.95rem' }} aria-hidden>
                      {emoji}
                    </Box>
                  }
                  label={label}
                  size="small"
                  sx={{
                    bgcolor: alpha('#fff', 0.85),
                    border: '1px solid',
                    borderColor: alpha('#16a34a', 0.2),
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: '#166534',
                    py: 2.25,
                  }}
                />
              ))}
            </Stack>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.4 }}>
              <Box
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: alpha('#0f172a', 0.08),
                  mb: 2.5,
                  bgcolor: '#fff',
                  boxShadow: '0 4px 24px -8px rgba(15,23,42,0.12)',
                }}
              >
                <Box
                  sx={{
                    px: 2.5,
                    py: 1.25,
                    background: 'linear-gradient(90deg, #ecfdf5 0%, #f0fdf4 100%)',
                    borderBottom: '1px solid',
                    borderColor: alpha('#16a34a', 0.15),
                  }}
                >
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    Your free preview
                  </Typography>
                </Box>

                <Box sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {teaser.stream_recommendation && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          bgcolor: streamColor.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 22,
                          flexShrink: 0,
                          border: `1px solid ${streamColor.border}`,
                        }}
                      >
                        🎓
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Stream signal
                        </Typography>
                        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                          <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                            {teaser.stream_recommendation}
                          </Typography>
                          <Chip
                            label="Preview"
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              bgcolor: streamColor.bg,
                              color: streamColor.text,
                              border: `1px solid ${streamColor.border}`,
                            }}
                          />
                        </Stack>
                      </Box>
                    </Box>
                  )}

                  {teaser.dominant_pattern && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          bgcolor: '#f5f3ff',
                          border: '1px solid #ddd6fe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 22,
                          flexShrink: 0,
                        }}
                      >
                        🧠
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Working style
                        </Typography>
                        <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{teaser.dominant_pattern}</Typography>
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: '#ecfdf5',
                        border: '1px solid #bbf7d0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        flexShrink: 0,
                      }}
                    >
                      🏆
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Top career match (preview)
                      </Typography>
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        {teaser.hero_career_category ? (
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d', display: 'block', mb: 0.25 }}>
                            {teaser.hero_career_category}
                          </Typography>
                        ) : null}
                        <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{teaser.hero_career}</Typography>
                      </motion.div>
                    </Box>
                    <Chip
                      label={teaser.hero_confidence}
                      size="small"
                      sx={{
                        height: 26,
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        bgcolor: '#ecfdf5',
                        color: '#15803d',
                        border: '1px solid #bbf7d0',
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </motion.div>

            {teaser.profile_depth_detail && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                <Box
                  sx={{
                    borderRadius: 3,
                    mb: 2.5,
                    p: { xs: 2, sm: 2.25 },
                    bgcolor: teaser.assessment_tier === 'premium' ? alpha('#16a34a', 0.08) : alpha('#f59e0b', 0.1),
                    border: '1px solid',
                    borderColor: teaser.assessment_tier === 'premium' ? alpha('#16a34a', 0.25) : alpha('#f59e0b', 0.35),
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: teaser.assessment_tier === 'premium' ? '#15803d' : '#b45309',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      mb: 0.75,
                    }}
                  >
                    {teaser.profile_depth_title || 'About this read'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.9rem', lineHeight: 1.65, color: '#334155', fontWeight: 500 }}>
                    {teaser.profile_depth_detail}
                  </Typography>
                </Box>
              </motion.div>
            )}

            {teaser.premium_unlocked && !teaser.premium_extension_complete && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Box
                  sx={{
                    borderRadius: 3,
                    mb: 3,
                    p: 2.5,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    border: '2px solid #93c5fd',
                    boxShadow: '0 12px 40px -16px rgba(37,99,235,0.45)',
                  }}
                >
                  <Typography sx={{ fontWeight: 800, color: '#1e40af', mb: 0.5, fontSize: '1.05rem' }}>You&apos;re almost there</Typography>
                  <Typography sx={{ fontSize: '0.9rem', color: '#1e3a8a', mb: 2, lineHeight: 1.55 }}>
                    Finish the premium questions — then your full report unlocks with our most confident read.
                  </Typography>
                  <Button
                    variant="contained"
                    href={`/game-assessment?premium_continue=${sessionId}`}
                    size="large"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 800,
                      px: 3,
                      borderRadius: 2,
                      bgcolor: '#2563eb',
                      boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
                      '&:hover': { bgcolor: '#1d4ed8' },
                    }}
                  >
                    Continue premium assessment
                  </Button>
                </Box>
              </motion.div>
            )}

            <Box
              sx={{
                textAlign: 'center',
                py: 1.75,
                px: 2,
                mb: 3,
                borderRadius: 3,
                bgcolor: alpha('#fff', 0.75),
                border: '1px dashed',
                borderColor: alpha('#64748b', 0.35),
              }}
            >
              <Typography sx={{ fontSize: { xs: '0.82rem', sm: '0.88rem' }, color: '#475569', fontWeight: 600, lineHeight: 1.55 }}>
                One-on-one counselling often starts around <strong>{COUNSELLING_ANCHOR_LABEL}</strong>. Both options below are built for students — clear, structured, and a fraction of that cost.
              </Typography>
            </Box>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  color: '#0f172a',
                  mb: 0.5,
                  fontSize: { xs: '1.2rem', sm: '1.35rem' },
                  letterSpacing: '-0.02em',
                  textAlign: 'center',
                }}
              >
                Pick what fits you right now
              </Typography>
              <Typography sx={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', mb: 3, maxWidth: 480, mx: 'auto', lineHeight: 1.55 }}>
                Same full report format — choose speed today or maximum accuracy after a few more questions.
              </Typography>

              <Stack spacing={2.5} sx={{ mb: 3, maxWidth: 720, mx: 'auto' }}>
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: 4,
                    p: { xs: 2.25, sm: 2.75 },
                    pt: { xs: 3.25, sm: 3.5 },
                    bgcolor: '#fff',
                    border: '2px solid',
                    borderColor: '#60a5fa',
                    boxShadow: '0 20px 50px -24px rgba(37,99,235,0.35), 0 0 0 1px rgba(37,99,235,0.08) inset',
                    order: { xs: -1, md: 0 },
                  }}
                >
                  <Chip
                    label="Most accurate"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 16,
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      bgcolor: '#2563eb',
                      color: '#fff',
                      height: 26,
                    }}
                  />
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 1.5, pr: { xs: 0, sm: 10 } }}>
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
                        Premium bundle
                      </Typography>
                      <Typography sx={{ fontSize: '0.82rem', color: '#64748b', mt: 0.35, lineHeight: 1.5 }}>
                        Extra assessment + full report
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.75rem', color: '#1d4ed8', lineHeight: 1, letterSpacing: '-0.03em' }}>
                        ₹{bundlePrice}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>one-time</Typography>
                    </Box>
                  </Stack>
                  <Stack sx={{ mb: 2 }}>{PREMIUM_BULLETS.map((t) => <BulletRow key={t}>{t}</BulletRow>)}</Stack>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={paying}
                    onClick={() => handleUnlockClick('premium_bundle')}
                    sx={{
                      py: 1.6,
                      textTransform: 'none',
                      fontWeight: 800,
                      fontSize: '1rem',
                      borderRadius: 2.5,
                      bgcolor: '#2563eb',
                      boxShadow: '0 10px 28px rgba(37,99,235,0.35)',
                      '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 12px 32px rgba(37,99,235,0.4)' },
                    }}
                  >
                    {paying ? <ButtonSpinner size={24} /> : `Get premium bundle — ₹${bundlePrice}`}
                  </Button>
                </Box>

                <Box
                  sx={{
                    borderRadius: 4,
                    p: { xs: 2.25, sm: 2.75 },
                    bgcolor: '#fff',
                    border: '1px solid',
                    borderColor: alpha('#0f172a', 0.1),
                    boxShadow: '0 8px 30px -18px rgba(15,23,42,0.15)',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 1.5 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                        Career report only
                      </Typography>
                      <Typography sx={{ fontSize: '0.82rem', color: '#64748b', mt: 0.35, lineHeight: 1.5 }}>
                        From this 30-question run — unlock now
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: '#15803d', lineHeight: 1, letterSpacing: '-0.03em' }}>
                        ₹{reportPrice}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>one-time</Typography>
                    </Box>
                  </Stack>
                  <Stack sx={{ mb: 2 }}>{REPORT_BULLETS.map((t) => <BulletRow key={t}>{t}</BulletRow>)}</Stack>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={paying}
                    onClick={() => handleUnlockClick('report')}
                    sx={{
                      py: 1.6,
                      textTransform: 'none',
                      fontWeight: 800,
                      fontSize: '1rem',
                      borderRadius: 2.5,
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      boxShadow: '0 10px 28px rgba(22,163,74,0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #16a34a, #15803d)',
                        boxShadow: '0 12px 32px rgba(22,163,74,0.35)',
                      },
                    }}
                  >
                    {paying ? <ButtonSpinner size={24} /> : `Unlock full report — ₹${reportPrice}`}
                  </Button>
                </Box>
              </Stack>
            </motion.div>

            <Box
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: alpha('#0f172a', 0.08),
                mb: 3,
                bgcolor: alpha('#fff', 0.9),
              }}
            >
              <Box sx={{ px: 2.5, py: 1.5, bgcolor: alpha('#f8fafc', 0.95), borderBottom: '1px solid', borderColor: alpha('#0f172a', 0.06) }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                  Inside the full report
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: '#64748b', mt: 0.5, fontWeight: 500 }}>
                  Everything below is included whether you choose ₹{reportPrice} or ₹{bundlePrice}.
                </Typography>
              </Box>
              <Box sx={{ p: { xs: 2, sm: 2.5 }, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: 1.5, sm: 2 } }}>
                {UNLOCK_FEATURES.map((f) => (
                  <Stack key={f.text} direction="row" spacing={1.25} alignItems="flex-start">
                    <Typography sx={{ fontSize: 20, lineHeight: 1 }}>{f.icon}</Typography>
                    <Typography sx={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.5, fontWeight: 500 }}>{f.text}</Typography>
                  </Stack>
                ))}
              </Box>
            </Box>

            <Box
              sx={{
                textAlign: 'center',
                py: 2,
                px: 2,
                mb: 3,
                borderRadius: 3,
                bgcolor: alpha('#fff', 0.8),
                border: '1px solid',
                borderColor: alpha('#0f172a', 0.06),
              }}
            >
              <Typography sx={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600, lineHeight: 1.55 }}>
                {LANDING_STUDENTS_STAT_VALUE} {LANDING_STUDENTS_STAT_LABEL.toLowerCase()} with {PRODUCT_NAME} — structured guidance, not guesswork.
              </Typography>
            </Box>

            <Box
              sx={{
                py: 2,
                px: 2.5,
                mb: 2,
                borderRadius: 4,
                bgcolor: '#fff',
                border: '1px solid',
                borderColor: alpha('#0f172a', 0.08),
                boxShadow: '0 4px 20px -12px rgba(15,23,42,0.12)',
              }}
            >
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', mb: 0.5, textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Your top 3 career matches
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', mb: 2 }}>
                #1 is unlocked above — see #2 and #3 in the full report
              </Typography>
              <Stack spacing={1}>
                {teaser.career_preview.map((c) => {
                  const isRevealed = 'career_name' in c && c.career_name;
                  return (
                    <Box
                      key={c.rank}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        py: 1,
                        px: 1.5,
                        borderRadius: 2,
                        bgcolor: isRevealed ? alpha('#22c55e', 0.08) : alpha('#f1f5f9', 0.9),
                        border: '1px solid',
                        borderColor: isRevealed ? alpha('#22c55e', 0.2) : alpha('#cbd5e1', 0.6),
                      }}
                    >
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: isRevealed ? '#15803d' : '#94a3b8', minWidth: 28 }}>
                        #{c.rank}
                      </Typography>
                      {isRevealed ? (
                        <Box sx={{ flex: 1 }}>
                          {c.career_category ? (
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803d' }}>{c.career_category}</Typography>
                          ) : null}
                          <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{c.career_name}</Typography>
                        </Box>
                      ) : (
                        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flex: 1, color: '#94a3b8' }}>
                          <Typography sx={{ fontSize: 16 }} aria-hidden>
                            🔒
                          </Typography>
                          <Typography sx={{ fontSize: '0.84rem', fontWeight: 600 }}>Unlock in full report</Typography>
                        </Stack>
                      )}
                    </Box>
                  );
                })}
              </Stack>
              {teaser.top_two_gap != null && (
                <Typography sx={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 700, textAlign: 'center', mt: 2, lineHeight: 1.5 }}>
                  #1 and #2 are only {teaser.top_two_gap}% apart — the breakdown in the report matters.
                </Typography>
              )}
            </Box>

            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Button
                size="small"
                onClick={() => router.push('/dashboard')}
                sx={{ color: '#94a3b8', textTransform: 'none', fontSize: '0.82rem' }}
              >
                ← Back to dashboard
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

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

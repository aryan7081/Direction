'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  TextField,
} from '@mui/material';
import { motion } from 'framer-motion';
import { PageLoader, ButtonSpinner } from '@/components/ui/Loaders';
import { useAuthStore } from '@/stores/authStore';
import {
  fetchReportTeaser,
  fetchCareerReportPreview,
  createPaymentOrder,
  verifyPayment,
  validatePaymentCoupon,
} from './api';
import { CareerReportContent } from './CareerReportContent';
import { CouponCelebrateDialog, type CouponCelebratePayload } from './components/CouponCelebrateDialog';
import { googleAuth } from '@/features/auth/api';
import { GoogleSignInButton } from '@/features/auth/GoogleSignInButton';
import {
  LANDING_STUDENTS_STAT_LABEL,
  LANDING_STUDENTS_STAT_VALUE,
  PREMIUM_BUNDLE_PRICE_INR,
  PREMIUM_UPGRADE_FROM_REPORT_INR,
  PRODUCT_NAME,
  REPORT_PRICE_INR,
} from '@/lib/productCopy';
import type { PaymentProductType } from './api';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (payload: unknown) => void) => void;
    };
  }
}

const COUNSELLING_ANCHOR_LABEL = '₹3,000+';

const REPORT_BULLETS = [
  'Unlock the full report for this completed session — no need to retake the questionnaire',
  '15 profile dimensions, 8 career-matching trait scores, stream read, top careers & Class 10→college roadmap',
  'Share-ready for parents, teachers, or counselling conversations',
];

const PREMIUM_BULLETS = [
  'Complete a short add-on assessment — we refine your profile first',
  'Then unlock the same full report with our most confident matches',
  'Ideal when two streams or careers feel “too close to call”',
];

const UNLOCK_FEATURES = [
  { icon: '📊', text: '15-dimension profile plus 8 career-matching trait scores with exact numbers' },
  { icon: '🎯', text: 'Top 5 career matches with confidence scores & education paths' },
  { icon: '🗺️', text: 'Personalized development roadmap (Class 10 → 12th → College)' },
  { icon: '📈', text: 'Career comparison chart — see why #1 beats #2' },
  { icon: '📄', text: 'Premium PDF report to share with parents & counsellors' },
];

const pageBg =
  'linear-gradient(165deg, #f0fdf4 0%, #ecfeff 28%, #eff6ff 55%, #faf5ff 100%)';

function LockIcon({ size = 14 }: { size?: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      aria-hidden
      sx={{ width: size, height: size, flexShrink: 0, fill: 'currentColor', color: '#64748b', display: 'block' }}
    >
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z" />
    </Box>
  );
}

function CheckoutTrustFooter({ compact }: { compact?: boolean }) {
  return (
    <Box
      sx={{
        mt: compact ? 1.25 : 2.5,
        pt: compact ? 1.25 : 2.5,
        borderTop: '1px solid',
        borderColor: alpha('#0f172a', 0.08),
        textAlign: 'center',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={0}
        alignItems="center"
        justifyContent="center"
        sx={{ gap: { xs: compact ? 0.5 : 1, sm: 1.5 }, flexWrap: 'wrap' }}
      >
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: '#64748b' }}>
          <LockIcon size={compact ? 12 : 14} />
          <Typography
            sx={{
              fontSize: compact ? '0.65rem' : '0.75rem',
              fontWeight: 600,
              color: '#475569',
              letterSpacing: '0.01em',
            }}
          >
            Encrypted checkout
          </Typography>
        </Stack>
        <Typography
          component="span"
          sx={{ display: { xs: 'none', sm: 'inline' }, fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 700, px: 0.25 }}
          aria-hidden
        >
          ·
        </Typography>
        <Typography sx={{ fontSize: compact ? '0.65rem' : '0.75rem', fontWeight: 500, color: '#64748b' }}>
          UPI · Cards · Netbanking · Wallets
        </Typography>
        <Typography
          component="span"
          sx={{ display: { xs: 'none', sm: 'inline' }, fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 700, px: 0.25 }}
          aria-hidden
        >
          ·
        </Typography>
        <Typography sx={{ fontSize: compact ? '0.65rem' : '0.75rem', fontWeight: 600, color: '#64748b' }}>Powered by Razorpay</Typography>
      </Stack>
      <Typography
        sx={{
          fontSize: compact ? '0.62rem' : '0.7rem',
          color: '#94a3b8',
          fontWeight: 500,
          mt: compact ? 0.75 : 1.25,
          lineHeight: 1.45,
        }}
      >
        One-time purchase · No subscription · Unlocks immediately after payment
      </Typography>
    </Box>
  );
}

function BulletRow({ children, dense }: { children: React.ReactNode; dense?: boolean }) {
  return (
    <Stack direction="row" spacing={dense ? 0.75 : 1.25} alignItems="flex-start" sx={{ py: dense ? 0.08 : 0.35 }}>
      <Typography
        sx={{
          color: '#16a34a',
          fontWeight: 800,
          fontSize: dense ? '0.78rem' : '0.95rem',
          lineHeight: 1.35,
          flexShrink: 0,
        }}
        aria-hidden
      >
        ✓
      </Typography>
      <Typography
        sx={{
          fontSize: dense ? '0.68rem' : '0.84rem',
          color: '#374151',
          lineHeight: dense ? 1.4 : 1.55,
          fontWeight: 500,
        }}
      >
        {children}
      </Typography>
    </Stack>
  );
}

export function ReportTeaserPage({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);
  /** Which checkout is in progress — only that button shows a spinner. */
  const [payingProduct, setPayingProduct] = useState<PaymentProductType | null>(null);

  const [couponCode, setCouponCode] = useState('');
  /** After successful Apply — drives card prices until code is edited. */
  const [couponPricePreview, setCouponPricePreview] = useState<CouponCelebratePayload | null>(null);
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [celebrateOpen, setCelebrateOpen] = useState(false);
  const [celebratePayload, setCelebratePayload] = useState<CouponCelebratePayload | null>(null);
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

  const hasReportAccess = !!(teaser && (teaser.report_accessible ?? teaser.is_paid));
  const bundleAddOnPending =
    !!teaser &&
    !teaser.report_accessible &&
    !!teaser.premium_unlocked &&
    !teaser.premium_extension_complete;

  const { data: previewReport, isLoading: previewLoading, error: previewError } = useQuery({
    queryKey: ['career-report-preview', sessionId],
    queryFn: () => fetchCareerReportPreview(sessionId),
    enabled: !!sessionId && !!teaser && !hasReportAccess && !bundleAddOnPending,
  });

  const reportPreviewScrollRef = useRef<HTMLDivElement>(null);
  const [reportPreviewScroll, setReportPreviewScroll] = useState({ hasOverflow: false, atBottom: false });

  const updateReportPreviewScrollMetrics = useCallback(() => {
    const el = reportPreviewScrollRef.current;
    if (!el) return;
    const { scrollHeight, clientHeight, scrollTop } = el;
    const hasOverflow = scrollHeight > clientHeight + 2;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 12;
    setReportPreviewScroll({ hasOverflow, atBottom });
  }, []);

  useEffect(() => {
    if (!previewReport && !previewLoading) return;
    const t = window.setTimeout(() => updateReportPreviewScrollMetrics(), 120);
    return () => window.clearTimeout(t);
  }, [previewReport, previewLoading, updateReportPreviewScrollMetrics]);

  useEffect(() => {
    const el = reportPreviewScrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => updateReportPreviewScrollMetrics());
    ro.observe(el);
    window.addEventListener('resize', updateReportPreviewScrollMetrics);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateReportPreviewScrollMetrics);
    };
  }, [updateReportPreviewScrollMetrics, previewReport]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !document.getElementById('razorpay-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const hasReport = teaser?.report_accessible ?? teaser?.is_paid;
    /** Stay on this page when ₹49 report is paid so user can still choose premium upgrade (₹50). */
    if (hasReport && !teaser?.premium_upgrade_available) {
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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Enter a coupon code.');
      return;
    }
    if (needsSignIn) {
      setCouponError('Sign in to apply a coupon code.');
      return;
    }
    setCouponApplying(true);
    setCouponError(null);
    try {
      const res = await validatePaymentCoupon(sessionId, {
        coupon_code: couponCode.trim(),
      });
      if (!res.coupon_applied || !res.report || !res.premium_bundle) {
        setCelebratePayload(null);
        setCouponPricePreview(null);
        setCelebrateOpen(false);
        return;
      }
      const payload: CouponCelebratePayload = {
        coupon_code: res.coupon_code ?? couponCode.trim().toUpperCase(),
        discount_percent: res.discount_percent ?? 0,
        report: res.report,
        premium_bundle: res.premium_bundle,
        upgrade: res.upgrade,
      };
      setCelebratePayload(payload);
      setCouponPricePreview(payload);
      setCelebrateOpen(true);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { detail?: string } } };
      setCouponError(ax.response?.data?.detail || 'Invalid coupon.');
      setCouponPricePreview(null);
    } finally {
      setCouponApplying(false);
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
    setPayingProduct(productType);
    try {
      const orderData = await createPaymentOrder(sessionId, {
        product_type: productType,
        coupon_code: couponCode.trim(),
      });

      if (orderData.premium_pending_extension) {
        // Paid premium bundle but add-on not done — same as successful bundle checkout (not an error).
        queryClient.invalidateQueries({ queryKey: ['report-teaser', sessionId] });
        router.push(`/game-assessment?premium_continue=${sessionId}`);
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

      const isUpgrade = orderData.is_premium_upgrade === true;
      const desc =
        isUpgrade && productType === 'premium_bundle'
          ? `Premium accuracy add-on — ₹${orderData.amount} (you already paid ₹${REPORT_PRICE_INR} toward ₹${PREMIUM_BUNDLE_PRICE_INR})`
          : productType === 'premium_bundle'
            ? 'Premium assessment + full career report'
            : 'Full career report (Phase 1 questionnaire)';

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
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
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
            showError('Payment verification failed. Please contact haryan458@gmail.com');
          }
        },
        modal: { ondismiss: () => setPayingProduct(null) },
      };

      if (!window.Razorpay) {
        showError('Payment form is still loading. Wait a moment and try again.');
        return;
      }
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { detail?: string } } };
      showError(ax.response?.data?.detail || 'Could not initiate payment. Please try again.');
    } finally {
      setPayingProduct(null);
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
  const upgradePrice = teaser.premium_upgrade_price_inr ?? PREMIUM_UPGRADE_FROM_REPORT_INR;
  const showBundleAsUpgrade = !!teaser.premium_upgrade_available;

  const payReport = couponPricePreview?.report.final_amount_inr ?? reportPrice;
  const payBundle = couponPricePreview?.premium_bundle.final_amount_inr ?? bundlePrice;
  const payUpgrade =
    showBundleAsUpgrade
      ? couponPricePreview?.upgrade?.final_amount_inr ?? upgradePrice
      : upgradePrice;
  const hasCouponDiscount =
    !!couponPricePreview && (couponPricePreview.discount_percent ?? 0) > 0;
  const firstNameToken = teaser.student_name?.split(/\s+/)[0]?.trim();

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
      <Box
        sx={{
          minHeight: { xs: 'calc(100dvh - 56px)', sm: 'calc(100dvh - 64px)' },
          background: pageBg,
          pb: { xs: 3, sm: 4 },
        }}
      >
        <Container
          maxWidth="lg"
          sx={{ pt: { xs: 1.25, sm: 2.5 }, pb: { xs: 1.25, sm: 1.75, md: 2 }, px: { xs: 1.5, sm: 2.5 } }}
        >
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <Box sx={{ mb: { xs: 1.25, sm: 2.5 } }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: { xs: 1.15, sm: 2, md: 2.5 },
                  alignItems: 'stretch',
                  maxWidth: 720,
                  mx: 'auto',
                }}
              >
                <Box sx={{ textAlign: 'center', minWidth: 0, width: '100%' }}>
                  {firstNameToken ? (
                    <Typography
                      sx={{
                        display: { xs: 'none', sm: 'block' },
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.14em',
                        mb: 0.5,
                      }}
                    >
                      {firstNameToken}
                    </Typography>
                  ) : null}
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                      fontWeight: 800,
                      color: '#0f172a',
                      letterSpacing: '-0.03em',
                      fontSize: { xs: '1.35rem', sm: '1.55rem', md: '1.75rem' },
                      lineHeight: 1.15,
                      mb: { xs: 0.35, sm: 0.5 },
                    }}
                  >
                    {firstNameToken ? (
                      <>
                        <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                          {firstNameToken}, your report is ready
                        </Box>
                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                          Your career report is ready
                        </Box>
                      </>
                    ) : (
                      'Your career report is ready'
                    )}
                  </Typography>
                  <Typography
                    sx={{
                      display: { xs: 'block', sm: 'none' },
                      color: '#64748b',
                      fontSize: '0.78rem',
                      maxWidth: 480,
                      mx: 'auto',
                      lineHeight: 1.35,
                      fontWeight: 500,
                      mb: 1,
                    }}
                  >
                    Full report &amp; PDF · one payment unlocks everything below.
                  </Typography>
                  <Typography
                    sx={{
                      display: { xs: 'none', sm: 'block' },
                      color: '#64748b',
                      fontSize: '0.85rem',
                      maxWidth: 480,
                      mx: 'auto',
                      lineHeight: 1.45,
                      fontWeight: 500,
                      mb: 1.5,
                    }}
                  >
                    Unlock the full breakdown, top matches, and PDF from {PRODUCT_NAME}. One payment — instant access.
                  </Typography>

                  {!bundleAddOnPending && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04, duration: 0.35 }}
                    >
                      <Box
                        sx={{
                          borderRadius: 3,
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: alpha('#0f172a', 0.08),
                          bgcolor: '#fff',
                          boxShadow: '0 4px 20px -8px rgba(15,23,42,0.12)',
                          textAlign: 'left',
                        }}
                      >
                        <Box
                          sx={{
                            px: { xs: 1.15, sm: 1.5 },
                            py: { xs: 0.5, sm: 0.65 },
                            background: 'linear-gradient(90deg, #ecfdf5 0%, #f0fdf4 100%)',
                            borderBottom: '1px solid',
                            borderColor: alpha('#16a34a', 0.15),
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            spacing={1}
                            sx={{ display: { xs: 'flex', sm: 'none' } }}
                          >
                            <Typography
                              sx={{
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                color: '#15803d',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                              }}
                            >
                              Report preview
                            </Typography>
                            <Chip
                              size="small"
                              label="Scroll ↓"
                              sx={{
                                height: 22,
                                fontSize: '0.58rem',
                                fontWeight: 700,
                                bgcolor: alpha('#fff', 0.85),
                                color: '#15803d',
                                border: `1px solid ${alpha('#16a34a', 0.35)}`,
                              }}
                            />
                          </Stack>
                          <Typography
                            sx={{
                              display: { xs: 'none', sm: 'block' },
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              color: '#15803d',
                              textTransform: 'uppercase',
                              letterSpacing: '0.1em',
                            }}
                          >
                            Full report preview
                          </Typography>
                          <Typography
                            sx={{
                              display: { xs: 'none', sm: 'block' },
                              fontSize: '0.65rem',
                              color: '#64748b',
                              fontWeight: 600,
                              mt: 0.35,
                            }}
                          >
                            Same layout as after payment — locked fields stay blurred until you unlock.
                          </Typography>
                          <Typography
                            sx={{
                              display: { xs: 'none', md: 'block' },
                              fontSize: '0.62rem',
                              color: '#94a3b8',
                              fontWeight: 600,
                              mt: 0.5,
                              lineHeight: 1.4,
                            }}
                          >
                            Scroll inside this panel to explore; payment stays below — no need to read everything first.
                          </Typography>
                        </Box>

                        <Box sx={{ position: 'relative' }}>
                          <Box
                            ref={reportPreviewScrollRef}
                            onScroll={updateReportPreviewScrollMetrics}
                            sx={{
                              maxHeight: { xs: 'min(62vh, 520px)', sm: 'min(56vh, 560px)' },
                              minHeight: { xs: 220, sm: 200 },
                              overflowY: 'auto',
                              overflowX: 'hidden',
                              px: { xs: 0.9, sm: 1.35 },
                              py: { xs: 0.85, sm: 1.35 },
                              WebkitOverflowScrolling: 'touch',
                              scrollbarGutter: 'stable',
                              scrollbarWidth: 'thin',
                              '&::-webkit-scrollbar': { width: 8 },
                              '&::-webkit-scrollbar-track': {
                                background: alpha('#f1f5f9', 0.95),
                                borderRadius: 4,
                                margin: '4px 0',
                              },
                              '&::-webkit-scrollbar-thumb': {
                                background: alpha('#64748b', 0.42),
                                borderRadius: 4,
                                border: '2px solid transparent',
                                backgroundClip: 'padding-box',
                              },
                              '&::-webkit-scrollbar-thumb:hover': {
                                background: alpha('#475569', 0.55),
                              },
                            }}
                          >
                            {previewLoading && (
                              <Box sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <ButtonSpinner size={28} />
                              </Box>
                            )}
                            {previewError && (
                              <Typography color="error" sx={{ fontSize: '0.85rem', textAlign: 'center', py: 2 }}>
                                Couldn&apos;t load the preview. Refresh and try again.
                              </Typography>
                            )}
                            {previewReport && (
                              <CareerReportContent
                                variant="preview"
                                report={previewReport}
                                sessionId={sessionId}
                              />
                            )}
                          </Box>

                          {reportPreviewScroll.hasOverflow && !reportPreviewScroll.atBottom && (
                            <Box
                              sx={{
                                position: 'absolute',
                                left: 0,
                                right: 8,
                                bottom: 0,
                                height: 64,
                                pointerEvents: 'none',
                                background:
                                  'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 45%, #ffffff 100%)',
                              }}
                            />
                          )}
                          {reportPreviewScroll.hasOverflow && !reportPreviewScroll.atBottom && (
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={0.5}
                              sx={{
                                position: 'absolute',
                                bottom: 8,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                pointerEvents: 'none',
                                px: 1.5,
                                py: 0.45,
                                borderRadius: 999,
                                bgcolor: alpha('#fff', 0.97),
                                border: `1px solid ${alpha('#0f172a', 0.1)}`,
                                boxShadow: '0 4px 16px rgba(15,23,42,0.1)',
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: '0.6rem',
                                  fontWeight: 800,
                                  color: '#475569',
                                  letterSpacing: '0.08em',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Scroll for more
                              </Typography>
                              <Typography component="span" sx={{ fontSize: '0.85rem', color: '#16a34a', lineHeight: 1 }} aria-hidden>
                                ↓
                              </Typography>
                            </Stack>
                          )}
                        </Box>
                      </Box>
                    </motion.div>
                  )}
                </Box>

                <Box sx={{ minWidth: 0, width: '100%' }}>
                  {teaser.premium_unlocked && !teaser.premium_extension_complete && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <Box
                        sx={{
                          borderRadius: 2.5,
                          mb: 1.25,
                          p: { xs: 1.25, sm: 1.5 },
                          textAlign: 'center',
                          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                          border: '2px solid #93c5fd',
                          boxShadow: '0 8px 28px -14px rgba(37,99,235,0.4)',
                        }}
                      >
                        <Typography sx={{ fontWeight: 800, color: '#1e40af', mb: 0.35, fontSize: '0.92rem' }}>
                          You&apos;re almost there
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#1e3a8a', mb: 1.25, lineHeight: 1.45 }}>
                          Finish the premium questions — then your full report unlocks with our most confident read.
                        </Typography>
                        <Button
                          variant="contained"
                          href={`/game-assessment?premium_continue=${sessionId}`}
                          size="medium"
                          sx={{
                            textTransform: 'none',
                            fontWeight: 800,
                            px: 2,
                            py: 0.85,
                            borderRadius: 2,
                            fontSize: '0.82rem',
                            bgcolor: '#2563eb',
                            boxShadow: '0 6px 18px rgba(37,99,235,0.3)',
                            '&:hover': { bgcolor: '#1d4ed8' },
                          }}
                        >
                          Continue premium assessment
                        </Button>
                      </Box>
                    </motion.div>
                  )}

                  {!bundleAddOnPending && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.35 }}>
                    <Typography
                      component="h2"
                      sx={{
                        fontWeight: 800,
                        color: '#0f172a',
                        mb: 0.35,
                        fontSize: { xs: '1.05rem', sm: '1.2rem' },
                        letterSpacing: '-0.02em',
                        textAlign: 'center',
                      }}
                    >
                      Choose an option
                    </Typography>
                    <Typography
                      sx={{
                        textAlign: 'center',
                        color: '#64748b',
                        fontSize: { xs: '0.78rem', sm: '0.84rem' },
                        mb: { xs: 1.15, sm: 1.25 },
                        maxWidth: 480,
                        lineHeight: 1.45,
                        mx: 'auto',
                      }}
                    >
                      {showBundleAsUpgrade
                        ? 'You already unlocked the full report from Phase 1. Add the premium assignment below for our strongest match read.'
                        : 'Same full report either way — unlock now, or add a short assessment first for our strongest match read.'}
                    </Typography>

                    <Box
                      sx={{
                        mb: { xs: 1.5, sm: 2 },
                        p: { xs: 1.25, sm: 1.5 },
                        borderRadius: 2,
                        bgcolor: alpha('#fff', 0.85),
                        border: `1px solid ${alpha('#0f172a', 0.08)}`,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          color: '#64748b',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          mb: 0.75,
                        }}
                      >
                        Have a coupon?
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: '#64748b', mb: 1, lineHeight: 1.45 }}>
                        Same code applies to report (₹{payReport}) or premium bundle (₹{payBundle}) — discount is a
                        percentage off whichever you choose.
                      </Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="Enter code"
                          value={couponCode}
                          onChange={(e) => {
                            const v = e.target.value.toUpperCase();
                            setCouponCode(v);
                            setCouponError(null);
                            if (
                              couponPricePreview &&
                              v.trim().toUpperCase() !== couponPricePreview.coupon_code
                            ) {
                              setCouponPricePreview(null);
                            }
                          }}
                          inputProps={{ 'aria-label': 'Coupon code', style: { fontWeight: 600 } }}
                        />
                        <Button
                          variant="outlined"
                          disabled={couponApplying || !user}
                          onClick={() => void handleApplyCoupon()}
                          sx={{ textTransform: 'none', fontWeight: 800, minWidth: { sm: 100 }, flexShrink: 0 }}
                        >
                          {couponApplying ? <ButtonSpinner size={20} /> : 'Apply'}
                        </Button>
                      </Stack>
                      {couponError && (
                        <Typography sx={{ fontSize: '0.75rem', color: 'error.main', mt: 0.75 }}>{couponError}</Typography>
                      )}
                    </Box>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: showBundleAsUpgrade
                          ? '1fr'
                          : { xs: '1fr 1fr', sm: '1fr 1fr' },
                        gap: { xs: 1, sm: 1.5, md: 2 },
                        width: '100%',
                      }}
                    >
                      <Box
                        sx={{
                          borderRadius: 3,
                          p: { xs: 1.15, sm: 1.75, md: 2.25 },
                          bgcolor: '#fff',
                          border: '2px solid',
                          borderColor: '#60a5fa',
                          boxShadow: '0 12px 36px -20px rgba(37,99,235,0.35), 0 0 0 1px rgba(37,99,235,0.06) inset',
                          order: { xs: -1, md: 0 },
                          display: 'flex',
                          flexDirection: 'column',
                          minWidth: 0,
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          spacing={0.75}
                          sx={{ mb: 1, flexWrap: 'nowrap', gap: 0.75 }}
                        >
                          <Box sx={{ minWidth: 0, flex: '1 1 0%', pr: 0.5 }}>
                            <Stack direction="row" alignItems="center" gap={0.5} flexWrap="wrap" sx={{ mb: 0.25 }}>
                              <Typography
                                sx={{
                                  fontWeight: 800,
                                  color: '#0f172a',
                                  fontSize: { xs: '0.82rem', sm: '1.05rem' },
                                  letterSpacing: '-0.02em',
                                }}
                              >
                                {showBundleAsUpgrade ? 'Premium accuracy add-on' : 'Premium bundle'}
                              </Typography>
                              <Chip
                                label="Most accurate"
                                size="small"
                                sx={{
                                  height: 20,
                                  fontWeight: 800,
                                  fontSize: '0.58rem',
                                  bgcolor: '#2563eb',
                                  color: '#fff',
                                }}
                              />
                            </Stack>
                            <Typography sx={{ fontSize: { xs: '0.65rem', sm: '0.78rem' }, color: '#64748b', lineHeight: 1.35 }}>
                              {showBundleAsUpgrade
                                ? `You have the report — pay ₹${payUpgrade} more for the full ₹${payBundle} bundle`
                                : 'Extra assessment + full report'}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right', flexShrink: 0, flexGrow: 0, ml: 'auto' }}>
                            {hasCouponDiscount &&
                              (showBundleAsUpgrade ? payUpgrade < upgradePrice : payBundle < bundlePrice) && (
                              <Typography
                                sx={{
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  color: '#94a3b8',
                                  textDecoration: 'line-through',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                ₹{showBundleAsUpgrade ? upgradePrice : bundlePrice}
                              </Typography>
                            )}
                            <Typography
                              sx={{
                                fontWeight: 800,
                                fontSize: { xs: '1.1rem', sm: '1.55rem', md: '1.7rem' },
                                color: '#1d4ed8',
                                lineHeight: 1,
                                letterSpacing: '-0.03em',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {showBundleAsUpgrade ? `₹${payUpgrade}` : `₹${payBundle}`}
                            </Typography>
                            <Typography sx={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>
                              {showBundleAsUpgrade ? 'upgrade' : 'one-time'}
                            </Typography>
                          </Box>
                        </Stack>
                        <Stack sx={{ mb: { xs: 1, md: 1.5 }, flex: 1 }}>
                          {PREMIUM_BULLETS.map((t) => (
                            <BulletRow key={t} dense>
                              {t}
                            </BulletRow>
                          ))}
                        </Stack>
                        <Button
                          variant="contained"
                          fullWidth
                          disabled={payingProduct !== null}
                          onClick={() => handleUnlockClick('premium_bundle')}
                          sx={{
                            py: { xs: 1.1, sm: 1.35 },
                            textTransform: 'none',
                            fontWeight: 800,
                            fontSize: { xs: '0.72rem', sm: '0.88rem', md: '0.95rem' },
                            borderRadius: 2,
                            minHeight: 44,
                            bgcolor: '#2563eb',
                            boxShadow: '0 8px 22px rgba(37,99,235,0.32)',
                            '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 10px 26px rgba(37,99,235,0.38)' },
                          }}
                        >
                          {payingProduct === 'premium_bundle' ? (
                            <ButtonSpinner size={22} />
                          ) : showBundleAsUpgrade ? (
                            `Upgrade — ₹${payUpgrade}`
                          ) : (
                            `Premium — ₹${payBundle}`
                          )}
                        </Button>
                      </Box>

                      {!showBundleAsUpgrade && (
                      <Box
                        sx={{
                          borderRadius: 3,
                          p: { xs: 1.15, sm: 1.75, md: 2.25 },
                          bgcolor: '#fff',
                          border: '1px solid',
                          borderColor: alpha('#0f172a', 0.1),
                          boxShadow: '0 6px 24px -16px rgba(15,23,42,0.14)',
                          display: 'flex',
                          flexDirection: 'column',
                          minWidth: 0,
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 1 }}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontWeight: 800,
                                color: '#0f172a',
                                fontSize: { xs: '0.82rem', sm: '1.02rem' },
                                letterSpacing: '-0.02em',
                                mb: 0.15,
                              }}
                            >
                              Report only
                            </Typography>
                            <Typography sx={{ fontSize: { xs: '0.65rem', sm: '0.78rem' }, color: '#64748b', lineHeight: 1.35 }}>
                              From this run — unlock now
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                            {hasCouponDiscount && payReport < reportPrice && (
                              <Typography
                                sx={{
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  color: '#94a3b8',
                                  textDecoration: 'line-through',
                                }}
                              >
                                ₹{reportPrice}
                              </Typography>
                            )}
                            <Typography
                              sx={{
                                fontWeight: 800,
                                fontSize: { xs: '1.1rem', sm: '1.45rem', md: '1.55rem' },
                                color: '#15803d',
                                lineHeight: 1,
                                letterSpacing: '-0.03em',
                              }}
                            >
                              ₹{payReport}
                            </Typography>
                            <Typography sx={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 600 }}>one-time</Typography>
                          </Box>
                        </Stack>
                        <Stack sx={{ mb: { xs: 1, md: 1.5 }, flex: 1 }}>
                          {REPORT_BULLETS.map((t) => (
                            <BulletRow key={t} dense>
                              {t}
                            </BulletRow>
                          ))}
                        </Stack>
                        <Button
                          variant="contained"
                          fullWidth
                          disabled={payingProduct !== null}
                          onClick={() => handleUnlockClick('report')}
                          sx={{
                            py: { xs: 1.1, sm: 1.35 },
                            textTransform: 'none',
                            fontWeight: 800,
                            fontSize: { xs: '0.72rem', sm: '0.88rem', md: '0.95rem' },
                            borderRadius: 2,
                            minHeight: 44,
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            boxShadow: '0 8px 22px rgba(22,163,74,0.28)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #16a34a, #15803d)',
                              boxShadow: '0 10px 26px rgba(22,163,74,0.32)',
                            },
                          }}
                        >
                          {payingProduct === 'report' ? (
                            <ButtonSpinner size={22} />
                          ) : (
                            `Unlock — ₹${payReport}`
                          )}
                        </Button>
                      </Box>
                      )}
                    </Box>
                    <CheckoutTrustFooter compact />
                  </motion.div>
                  )}
                </Box>
              </Box>
            </Box>

            {teaser.profile_depth_detail && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                <Box
                  sx={{
                    borderRadius: 3,
                    mb: 2,
                    p: { xs: 1.75, sm: 2.25 },
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

            {!bundleAddOnPending && (
            <Box
              sx={{
                textAlign: 'center',
                py: 1.35,
                px: 1.75,
                mb: 2.5,
                borderRadius: 3,
                bgcolor: alpha('#fff', 0.75),
                border: '1px dashed',
                borderColor: alpha('#64748b', 0.35),
              }}
            >
              <Typography sx={{ fontSize: { xs: '0.78rem', sm: '0.85rem' }, color: '#475569', fontWeight: 600, lineHeight: 1.5 }}>
                One-on-one counselling often starts around <strong>{COUNSELLING_ANCHOR_LABEL}</strong>. Both options above are built for students — clear, structured, and a fraction of that cost.
              </Typography>
            </Box>
            )}

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
                  {bundleAddOnPending
                    ? 'Same full report format — unlocks after you finish the short premium add-on above.'
                    : `Included with both ₹${payReport} and ₹${payBundle} — same full report format.`}
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

      <CouponCelebrateDialog
        open={celebrateOpen}
        onClose={() => setCelebrateOpen(false)}
        payload={celebratePayload}
      />

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

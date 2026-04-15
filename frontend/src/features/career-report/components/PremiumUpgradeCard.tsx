'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Box, Button, Typography } from '@mui/material';
import { ButtonSpinner } from '@/components/ui/Loaders';
import { createPaymentOrder, verifyPayment } from '../api';
import { PREMIUM_BUNDLE_PRICE_INR, REPORT_PRICE_INR } from '@/lib/productCopy';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (payload: unknown) => void) => void;
    };
  }
}

type PremiumUpgradeCardProps = {
  sessionId: string;
  upgradePriceInr: number;
};

export function PremiumUpgradeCard({ sessionId, upgradePriceInr }: PremiumUpgradeCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !document.getElementById('razorpay-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);
    }
  }, []);

  const startCheckout = async () => {
    setError(null);
    setPaying(true);
    try {
      const orderData = await createPaymentOrder(sessionId, { product_type: 'premium_bundle' });

      if (orderData.premium_pending_extension) {
        queryClient.invalidateQueries({ queryKey: ['career-report', sessionId] });
        router.push(`/game-assessment?premium_continue=${sessionId}`);
        return;
      }

      if (orderData.is_paid) {
        queryClient.invalidateQueries({ queryKey: ['career-report', sessionId] });
        router.push(`/game-assessment?premium_continue=${sessionId}`);
        return;
      }

      if (!orderData.order_id) {
        queryClient.invalidateQueries({ queryKey: ['career-report', sessionId] });
        router.push(`/game-assessment?premium_continue=${sessionId}`);
        return;
      }

      const isUpgrade = orderData.is_premium_upgrade === true;
      const desc = isUpgrade
        ? `Premium accuracy add-on — ₹${orderData.amount} (you already paid ₹${REPORT_PRICE_INR} toward ₹${PREMIUM_BUNDLE_PRICE_INR})`
        : 'Premium assessment + full career report';

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
        theme: { color: '#2563eb' },
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
            queryClient.invalidateQueries({ queryKey: ['career-report', sessionId] });
            queryClient.invalidateQueries({ queryKey: ['report-teaser', sessionId] });
            router.push(`/game-assessment?premium_continue=${sessionId}`);
          } catch {
            setError('Payment verification failed. Please try again or contact support.');
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      };

      if (!window.Razorpay) {
        setError('Payment form is still loading. Wait a moment and try again.');
        return;
      }
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setError('Could not start payment. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <Box
      id="premium-upgrade"
      sx={{
        mb: 3,
        scrollMarginTop: { xs: 72, sm: 88 },
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 55%, #e0e7ff 100%)',
        border: '2px solid #93c5fd',
        boxShadow: '0 12px 36px -18px rgba(37,99,235,0.45)',
      }}
    >
      <Typography
        sx={{
          fontSize: '0.65rem',
          fontWeight: 800,
          color: '#1d4ed8',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          mb: 0.75,
        }}
      >
        Higher accuracy available
      </Typography>
      <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.05rem', sm: '1.2rem' }, mb: 1, lineHeight: 1.35 }}>
        Want a stronger read on stream and careers?
      </Typography>
      <Typography sx={{ color: '#334155', fontSize: '0.88rem', lineHeight: 1.6, mb: 2 }}>
        Your report is based on Phase 1 only. Add a short premium assignment — we refine your profile first, then unlock
        the same full report with our most confident matches. You already paid ₹{REPORT_PRICE_INR} for the report; complete
        the ₹{PREMIUM_BUNDLE_PRICE_INR} bundle by paying just{' '}
        <Box component="span" sx={{ fontWeight: 800, color: '#1e40af' }}>
          ₹{upgradePriceInr} more
        </Box>
        .
      </Typography>
      <Button
        variant="contained"
        fullWidth
        disabled={paying}
        onClick={startCheckout}
        sx={{
          py: 1.25,
          textTransform: 'none',
          fontWeight: 800,
          fontSize: '0.95rem',
          borderRadius: 2,
          bgcolor: '#2563eb',
          boxShadow: '0 8px 22px rgba(37,99,235,0.35)',
          '&:hover': { bgcolor: '#1d4ed8' },
        }}
      >
        {paying ? (
          <>
            <ButtonSpinner size={20} /> Starting checkout…
          </>
        ) : (
          `Add premium accuracy — ₹${upgradePriceInr}`
        )}
      </Button>
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1.5, textAlign: 'center' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

'use client';

import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import { motion } from 'framer-motion';
import type { CouponPriceLine } from '../api';

export type { CouponPriceLine };

export type CouponCelebratePayload = {
  coupon_code: string;
  discount_percent: number;
  report: CouponPriceLine;
  premium_bundle: CouponPriceLine;
  upgrade?: CouponPriceLine | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  payload: CouponCelebratePayload | null;
};

function LineRow({
  label,
  line,
}: {
  label: string;
  line: CouponPriceLine;
}) {
  return (
    <Box
      sx={{
        py: 1,
        px: 1.25,
        borderRadius: 2,
        bgcolor: 'rgba(255,255,255,0.88)',
        border: '1px solid rgba(15,23,42,0.08)',
        textAlign: 'left',
      }}
    >
      <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 0.35 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
        List ₹{line.list_price_inr}
        <Box component="span" sx={{ color: '#94a3b8', mx: 0.5 }}>
          →
        </Box>
        Pay{' '}
        <Box component="span" sx={{ fontWeight: 900, color: '#1d4ed8' }}>
          {line.final_amount_inr <= 0 ? '₹0' : `₹${line.final_amount_inr}`}
        </Box>
        <Box component="span" sx={{ color: '#15803d', fontWeight: 800, ml: 1 }}>
          (save ₹{line.savings_inr})
        </Box>
      </Typography>
    </Box>
  );
}

export function CouponCelebrateDialog({ open, onClose, payload }: Props) {
  if (!payload) return null;

  const fullOff = payload.discount_percent >= 100;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          background: 'linear-gradient(165deg, #fefce8 0%, #ecfdf5 40%, #eff6ff 100%)',
          border: '2px solid #86efac',
          boxShadow: '0 24px 64px -12px rgba(22,163,74,0.25)',
        },
      }}
    >
      <DialogContent sx={{ py: 3, px: 2.5, textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        >
          <Typography sx={{ fontSize: '2.75rem', lineHeight: 1, mb: 1 }} aria-hidden>
            {fullOff ? '🎉' : '✨'}
          </Typography>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: '1.35rem',
              color: '#0f172a',
              letterSpacing: '-0.02em',
              mb: 0.75,
            }}
          >
            {fullOff ? "You're in — it's free!" : 'Discount unlocked!'}
          </Typography>
          <Typography sx={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.55, mb: 1.5 }}>
            Code <strong>{payload.coupon_code}</strong> — <strong>{payload.discount_percent}%</strong> off. Same deal
            whether you choose report-only (₹49) or full premium bundle (₹99).
          </Typography>

          <Stack spacing={1} sx={{ mb: 2, textAlign: 'left' }}>
            <LineRow label="Report only · Phase 1" line={payload.report} />
            <LineRow label="Premium bundle · full assessment + report" line={payload.premium_bundle} />
            {payload.upgrade != null && payload.upgrade !== undefined && (
              <LineRow label="Upgrade (after ₹49 report) · add-on" line={payload.upgrade} />
            )}
          </Stack>

          <Button
            variant="contained"
            fullWidth
            onClick={onClose}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              py: 1.2,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              boxShadow: '0 8px 22px rgba(22,163,74,0.28)',
            }}
          >
            Continue to checkout
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

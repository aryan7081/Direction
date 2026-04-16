'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ButtonSpinner } from '@/components/ui/Loaders';
import { requestCareerCounselingCall } from '../api';
import type { CareerReport } from '../types';

type Props = {
  sessionId: string;
  counselingRequest?: CareerReport['counseling_request'];
};

function digitsOnly(s: string): string {
  return s.replace(/\D/g, '').slice(0, 10);
}

export function CounselingStickyCta({ sessionId, counselingRequest }: Props) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Success / already-requested state — synced from API so it survives navigation. */
  const [done, setDone] = useState(false);
  const [phoneMasked, setPhoneMasked] = useState('');

  useEffect(() => {
    if (counselingRequest?.submitted && counselingRequest.phone_masked) {
      setDone(true);
      setPhoneMasked(counselingRequest.phone_masked);
    } else {
      setDone(false);
      setPhoneMasked('');
    }
  }, [counselingRequest?.submitted, counselingRequest?.phone_masked]);

  const handleSubmit = async () => {
    const d = digitsOnly(phone);
    if (d.length !== 10) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await requestCareerCounselingCall(sessionId, { phone: d });
      setPhoneMasked(res.phone_masked);
      setDone(true);
      setDialogOpen(false);
      setPhone('');
      await queryClient.invalidateQueries({ queryKey: ['career-report', sessionId] });
    } catch (e: unknown) {
      const ax = e as { response?: { data?: { detail?: string } } };
      setError(ax.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isUpdateFlow = done;

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: theme.zIndex.drawer + 2,
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'center',
          px: { xs: 1.5, sm: 2 },
          pb: 'max(12px, env(safe-area-inset-bottom, 0px))',
          pt: 1,
        }}
      >
        <Container maxWidth="md" sx={{ pointerEvents: 'auto', px: { xs: 1, sm: 2 } }}>
          <Box
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: `1px solid ${alpha('#6366f1', 0.35)}`,
              background: done
                ? `linear-gradient(135deg, ${alpha('#ecfdf5', 0.97)} 0%, ${alpha('#f0fdf4', 0.98)} 100%)`
                : `linear-gradient(135deg, ${alpha('#eef2ff', 0.97)} 0%, ${alpha('#faf5ff', 0.98)} 100%)`,
              backdropFilter: 'blur(12px)',
              boxShadow: '0 -8px 32px rgba(15, 23, 42, 0.12), 0 4px 20px rgba(99, 102, 241, 0.15)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: 'space-between',
                gap: { xs: 1.5, sm: 2 },
                px: { xs: 2, sm: 2.5 },
                py: { xs: 1.75, sm: 2 },
              }}
            >
              {done ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Typography sx={{ fontSize: '1.35rem', lineHeight: 1 }} aria-hidden>
                      ✓
                    </Typography>
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: '#166534', fontSize: '0.92rem', lineHeight: 1.35 }}>
                        Request received
                      </Typography>
                      <Typography sx={{ color: '#15803d', fontSize: '0.8rem', lineHeight: 1.5, mt: 0.35 }}>
                        Someone from our team will connect with you soon on{' '}
                        <Box component="span" sx={{ fontWeight: 700 }}>
                          {phoneMasked}
                        </Box>
                        .
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => {
                      setError(null);
                      setPhone('');
                      setDialogOpen(true);
                    }}
                    sx={{ textTransform: 'none', fontWeight: 600, color: '#166534', flexShrink: 0, alignSelf: { sm: 'center' } }}
                  >
                    Update number
                  </Button>
                </>
              ) : (
                <>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, color: '#312e81', fontSize: '0.95rem', lineHeight: 1.35 }}>
                      Still confused after reading your report?
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.5, mt: 0.35 }}>
                      Request a quick call — our expert career counsellors help you make sense of streams, subjects,
                      and next steps.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setError(null);
                      setDialogOpen(true);
                    }}
                    sx={{
                      flexShrink: 0,
                      textTransform: 'none',
                      fontWeight: 800,
                      px: 2.5,
                      py: 1,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      boxShadow: '0 4px 16px rgba(79, 70, 229, 0.35)',
                      '&:hover': { background: 'linear-gradient(135deg, #4338ca, #6d28d9)' },
                    }}
                  >
                    Request a call
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => !submitting && setDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.05rem', pb: 0.5 }}>
          {isUpdateFlow ? 'Update your mobile number' : 'Request a call from a counsellor'}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', mb: 2, lineHeight: 1.55 }}>
            {isUpdateFlow
              ? 'Enter a new 10-digit number if you want us to call a different phone. We will use the latest number you submit.'
              : "Enter your 10-digit Indian mobile number. We'll reach out from our team line during working hours."}
          </Typography>
          <TextField
            autoFocus
            label="Mobile number"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(digitsOnly(e.target.value))}
            fullWidth
            type="tel"
            inputProps={{ inputMode: 'numeric', maxLength: 10, 'aria-label': 'Mobile number' }}
            error={Boolean(error)}
            helperText={error || 'We only use this number to reach you for this request.'}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSubmit()}
            disabled={submitting || digitsOnly(phone).length !== 10}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            }}
          >
            {submitting ? <ButtonSpinner size={20} /> : isUpdateFlow ? 'Save' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

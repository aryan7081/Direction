'use client';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import {
  DIRECTIONAL_SNAPSHOT_BODY,
  DIRECTIONAL_SNAPSHOT_TITLE,
} from '@/lib/productCopy';

type DirectionalSnapshotModalProps = {
  open: boolean;
  onContinue: () => void;
};

export function DirectionalSnapshotModal({ open, onContinue }: DirectionalSnapshotModalProps) {
  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      onClose={(_, reason) => {
        if (reason === 'backdropClick') return;
      }}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: { borderRadius: 3, overflow: 'hidden' },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, color: '#111827', pr: 6, pt: 2.5 }}>
        {DIRECTIONAL_SNAPSHOT_TITLE}
      </DialogTitle>
      <DialogContent sx={{ pt: 0, pb: 1 }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309', mb: 1.5 }}>
          Please read this before you view your results
        </Typography>
        <Box
          sx={{
            maxHeight: { xs: 'min(52vh, 360px)', sm: 340 },
            overflowY: 'auto',
            pr: 0.5,
            borderRadius: 2,
            bgcolor: '#f9fafb',
            border: '1px solid #e5e7eb',
            p: 2,
          }}
        >
          <Typography sx={{ fontSize: '0.95rem', color: '#374151', lineHeight: 1.65 }}>
            {DIRECTIONAL_SNAPSHOT_BODY}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 0, flexDirection: 'column', alignItems: 'stretch', gap: 1 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={onContinue}
          sx={{
            py: 1.35,
            textTransform: 'none',
            fontWeight: 800,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
          }}
        >
          Continue to my results
        </Button>
      </DialogActions>
    </Dialog>
  );
}

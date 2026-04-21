'use client';

import { Box } from '@mui/material';

/**
 * In teaser preview, blurs only the wrapped region so the rest of the report
 * stays sharp and identical to the paid layout.
 * When `onLockedClick` is set, the blurred area is clickable (e.g. scroll to paywall).
 */
export function PreviewSensitiveRegion({
  locked,
  onLockedClick,
  children,
}: {
  locked: boolean;
  onLockedClick?: () => void;
  children: React.ReactNode;
}) {
  if (!locked) return <>{children}</>;
  return (
    <Box sx={{ position: 'relative', display: 'block' }}>
      <Box
        sx={{
          filter: 'blur(6px)',
          userSelect: 'none',
          pointerEvents: 'none',
          opacity: 0.9,
        }}
        aria-hidden
      >
        {children}
      </Box>
      {onLockedClick ? (
        <Box
          component="button"
          type="button"
          onClick={onLockedClick}
          sx={{
            position: 'absolute',
            inset: 0,
            cursor: 'pointer',
            zIndex: 1,
            border: 'none',
            p: 0,
            m: 0,
            background: 'transparent',
            borderRadius: 'inherit',
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: 2,
            },
          }}
          aria-label="Go to payment options to unlock"
        />
      ) : null}
    </Box>
  );
}

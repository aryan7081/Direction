'use client';

import { Box } from '@mui/material';

/**
 * In teaser preview, blurs only the wrapped region so the rest of the report
 * stays sharp and identical to the paid layout.
 */
export function PreviewSensitiveRegion({
  locked,
  children,
}: {
  locked: boolean;
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
    </Box>
  );
}

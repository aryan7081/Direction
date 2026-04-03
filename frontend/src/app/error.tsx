'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Box, Button, Typography } from '@mui/material';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Box
      sx={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        textAlign: 'center',
        gap: 2,
      }}
    >
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
        Something went wrong
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
        We hit an unexpected error. You can try again or go back to the homepage.
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button variant="contained" size="large" onClick={() => reset()}>
          Try again
        </Button>
        <Button component={Link} href="/" variant="outlined" size="large">
          Home
        </Button>
      </Box>
    </Box>
  );
}

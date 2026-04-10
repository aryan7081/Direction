import Link from 'next/link';
import { Box, Button, Typography } from '@mui/material';

export default function NotFound() {
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
        Page not found
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
        The page you’re looking for doesn’t exist or may have been moved.
      </Typography>
      <Button component={Link} href="/" variant="contained" size="large" sx={{ mt: 1 }}>
        Back to home
      </Button>
    </Box>
  );
}

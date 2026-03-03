'use client';

import Link from 'next/link';
import { AppBar, Box, Toolbar, Typography, Button } from '@mui/material';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ maxWidth: 900, mx: 'auto', width: '100%' }}>
          <Link href="/dashboard" style={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Direction
            </Typography>
          </Link>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <Button color="inherit">Dashboard</Button>
          </Link>
          <Link href="/game-assessment" style={{ textDecoration: 'none' }}>
            <Button color="inherit">Assessment</Button>
          </Link>
          <Link href="/careers" style={{ textDecoration: 'none' }}>
            <Button color="inherit">Careers</Button>
          </Link>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'grey.50', py: 3 }}>
        {children}
      </Box>
    </Box>
  );
}

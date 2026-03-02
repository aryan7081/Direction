'use client';

import Link from 'next/link';
import { AppBar, Box, Toolbar, Typography, Button } from '@mui/material';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ maxWidth: 900, mx: 'auto', width: '100%' }}>
          <Typography variant="h6" component={Link} href="/dashboard" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 600 }}>
            Career Discovery
          </Typography>
          <Button component={Link} href="/dashboard" color="inherit">Dashboard</Button>
          <Button component={Link} href="/assessment" color="inherit">Assessment</Button>
          <Button component={Link} href="/careers" color="inherit">Careers</Button>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'grey.50', py: 3 }}>
        {children}
      </Box>
    </Box>
  );
}

'use client';

import Link from 'next/link';
import { AppBar, Box, Toolbar, Typography, Button } from '@mui/material';
import { AnimatedBackground, type AnimatedBackgroundTheme } from './ui/AnimatedBackground';

export function Layout({ children, bgTheme = 'dashboard' }: { children: React.ReactNode; bgTheme?: AnimatedBackgroundTheme }) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafbfc', position: 'relative' }}>
      <AnimatedBackground theme={bgTheme} />
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(250,251,252,0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          color: '#111827',
          zIndex: 10,
        }}
      >
        <Toolbar sx={{ maxWidth: 960, mx: 'auto', width: '100%' }}>
          <Link href="/dashboard" style={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1.5,
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              D
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: -0.5 }}>
              Direction
            </Typography>
          </Link>
          {[
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/game-assessment', label: 'Assessment' },
            { href: '/careers', label: 'Careers' },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <Button
                sx={{
                  color: '#374151',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.88rem',
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                }}
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ minHeight: 'calc(100vh - 64px)', py: 4, position: 'relative', zIndex: 1 }}>
        {children}
      </Box>
    </Box>
  );
}

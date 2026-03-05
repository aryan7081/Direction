'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppBar, Box, Toolbar, Typography, Button, IconButton, Tooltip, Drawer, List, ListItem } from '@mui/material';
import { useAuthStore } from '@/stores/authStore';
import { AnimatedBackground, type AnimatedBackgroundTheme } from './ui/AnimatedBackground';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/game-assessment', label: 'Assessment' },
  { href: '/careers', label: 'Careers' },
];

export function Layout({ children, bgTheme = 'dashboard' }: { children: React.ReactNode; bgTheme?: AnimatedBackgroundTheme }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace('/');
    setMobileOpen(false);
  };

  const navContent = (
    <>
      {NAV_ITEMS.map((item) => (
        <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
          <Button
            fullWidth
            sx={{
              color: '#374151',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.95rem',
              borderRadius: 2,
              py: 1.5,
              justifyContent: 'flex-start',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
            }}
          >
            {item.label}
          </Button>
        </Link>
      ))}
    </>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafbfc', position: 'relative' }}>
      <AnimatedBackground theme={bgTheme} />
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(250,251,252,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          color: '#111827',
          zIndex: 10,
        }}
      >
        <Toolbar sx={{ maxWidth: 960, mx: 'auto', width: '100%', px: { xs: 1, sm: 2 }, minHeight: { xs: 56, sm: 64 } }}>
          <Link href="/dashboard" style={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box component="img" src="/logo.png" alt="Direction" sx={{ width: { xs: 32, sm: 38 }, height: { xs: 32, sm: 38 } }} />
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: -0.5, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Direction
            </Typography>
          </Link>
          {/* Desktop nav */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            {navContent}
            {user && (
              <Tooltip title="Logout">
                <IconButton onClick={handleLogout} sx={{ ml: 0.5, color: '#9ca3af', '&:hover': { color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' } }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </IconButton>
              </Tooltip>
            )}
          </Box>
          {/* Mobile: hamburger + drawer */}
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center', gap: 0.5 }}>
            {user && (
              <IconButton onClick={handleLogout} sx={{ color: '#9ca3af', '&:hover': { color: '#ef4444' } }} aria-label="Logout">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </IconButton>
            )}
            <IconButton onClick={() => setMobileOpen(true)} sx={{ color: '#374151' }} aria-label="Open menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: 280, pt: 2, px: 2 } }}
      >
        <List sx={{ pt: 1 }}>
          {NAV_ITEMS.map((item) => (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <Link href={item.href} style={{ width: '100%', textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                <Button fullWidth sx={{ justifyContent: 'flex-start', py: 1.5, textTransform: 'none', fontWeight: 600, color: '#374151' }}>
                  {item.label}
                </Button>
              </Link>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ minHeight: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' }, py: { xs: 2, sm: 4 }, position: 'relative', zIndex: 1 }}>
        {children}
      </Box>
    </Box>
  );
}

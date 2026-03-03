'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppBar, Box, Toolbar, Typography, Button, IconButton, Tooltip } from '@mui/material';
import { useAuthStore } from '@/stores/authStore';
import { AnimatedBackground, type AnimatedBackgroundTheme } from './ui/AnimatedBackground';

export function Layout({ children, bgTheme = 'dashboard' }: { children: React.ReactNode; bgTheme?: AnimatedBackgroundTheme }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

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
            <Box component="img" src="/logo.png" alt="Direction" sx={{ width: 38, height: 38 }} />
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
          {user && (
            <Tooltip title="Logout">
              <IconButton
                onClick={handleLogout}
                size="small"
                sx={{
                  ml: 1,
                  color: '#9ca3af',
                  '&:hover': { color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' },
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ minHeight: 'calc(100vh - 64px)', py: 4, position: 'relative', zIndex: 1 }}>
        {children}
      </Box>
    </Box>
  );
}

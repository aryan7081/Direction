'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useAnalyticsAuthStore } from '@/stores/analyticsAuthStore';
import { ax, createAnalyticsTheme } from './analyticsDesignSystem';

const drawerWidth = 272;
const analyticsTheme = createAnalyticsTheme();

function ChartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 3v18h18" />
      <path d="M7 16l4-6 4 3 4-7" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function LogoMark() {
  return (
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: 2,
        background: ax.gradients.brand,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(34, 211, 238, 0.25)',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 19V5" stroke="#050810" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M4 19h16" stroke="#050810" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M8 15V9l4 3 4-5v6" stroke="#050810" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Box>
  );
}

export function AnalyticsLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/analytics/login';
  const user = useAnalyticsAuthStore((s) => s.user);
  const logout = useAnalyticsAuthStore((s) => s.logout);
  const isMdUp = useMediaQuery(analyticsTheme.breakpoints.up('md'));

  if (isLogin) {
    return (
      <ThemeProvider theme={analyticsTheme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>{children}</Box>
      </ThemeProvider>
    );
  }

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        pt: 3,
        px: 2,
        pb: 2,
        background: `linear-gradient(180deg, ${ax.bg.sidebar} 0%, #04060d 100%)`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1, mb: 3 }}>
        <LogoMark />
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '1.05rem',
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              background: ax.gradients.brand,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Outcave
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.04em' }}>
            Analytics
          </Typography>
        </Box>
      </Box>

      <Typography variant="subtitle2" sx={{ px: 1.5, mb: 1, color: 'text.disabled' }}>
        Workspace
      </Typography>
      <List dense sx={{ mb: 2 }}>
        <ListItemButton
          component={Link}
          href="/analytics/dashboard"
          selected={pathname === '/analytics/dashboard'}
          sx={{
            borderRadius: 2,
            py: 1.25,
            mb: 0.5,
            '&.Mui-selected': {
              bgcolor: 'rgba(52, 211, 153, 0.1)',
              border: `1px solid rgba(52, 211, 153, 0.22)`,
              '&:hover': { bgcolor: 'rgba(52, 211, 153, 0.14)' },
            },
          }}
        >
          <ListItemIcon sx={{ color: 'primary.main', minWidth: 42 }}>
            <ChartIcon />
          </ListItemIcon>
          <ListItemText
            primary="Overview"
            secondary="KPIs & trends"
            primaryTypographyProps={{ fontWeight: 700, fontSize: '0.95rem' }}
            secondaryTypographyProps={{ variant: 'caption', sx: { opacity: 0.85 } }}
          />
        </ListItemButton>
      </List>

      <Box sx={{ flex: 1 }} />

      <Box
        sx={{
          mt: 'auto',
          p: 2,
          borderRadius: 3,
          background: ax.gradients.cardShine,
          border: `1px solid ${ax.border.subtle}`,
        }}
      >
        <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing="0.06em" textTransform="uppercase">
          Signed in
        </Typography>
        <Typography variant="body2" fontWeight={600} noWrap title={user?.email} sx={{ mt: 0.5, color: 'text.primary' }}>
          {user?.email ?? '—'}
        </Typography>
        <IconButton
          size="small"
          onClick={() => {
            logout();
            window.location.href = '/analytics/login';
          }}
          sx={{
            mt: 1.5,
            color: 'text.secondary',
            borderRadius: 2,
            border: `1px solid ${ax.border.subtle}`,
            px: 1.5,
            py: 0.75,
            width: '100%',
            justifyContent: 'flex-start',
            gap: 1,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.04)', borderColor: ax.border.strong },
          }}
          aria-label="Sign out of analytics"
        >
          <LogoutIcon />
          <Typography variant="caption" fontWeight={600}>
            Sign out
          </Typography>
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={analyticsTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: ax.bg.root }}>
        {isMdUp ? (
          <Drawer
            variant="permanent"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                borderRight: `1px solid ${ax.border.subtle}`,
                bgcolor: 'transparent',
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <>
            <AppBar
              position="fixed"
              elevation={0}
              sx={{
                borderBottom: `1px solid ${ax.border.subtle}`,
                bgcolor: 'rgba(5,8,16,0.85)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <Toolbar sx={{ gap: 1 }}>
                <LogoMark />
                <Typography fontWeight={800} sx={{ background: ax.gradients.brand, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Analytics
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 130 }}>
                  {user?.email}
                </Typography>
                <IconButton
                  size="small"
                  aria-label="Sign out"
                  onClick={() => {
                    logout();
                    window.location.href = '/analytics/login';
                  }}
                  sx={{ color: 'text.secondary', border: `1px solid ${ax.border.subtle}`, borderRadius: 2 }}
                >
                  <LogoutIcon />
                </IconButton>
              </Toolbar>
            </AppBar>
            <Toolbar />
          </>
        )}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { md: `calc(100% - ${drawerWidth}px)` },
            minHeight: '100vh',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: ax.gradients.mesh,
              pointerEvents: 'none',
              zIndex: 0,
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              backgroundImage: `radial-gradient(circle at 85% 15%, rgba(167, 139, 250, 0.08), transparent 45%)`,
              pointerEvents: 'none',
              zIndex: 0,
            },
          }}
        >
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              p: { xs: 2, sm: 2.5, md: 4 },
              maxWidth: 1480,
              mx: 'auto',
              width: '100%',
            }}
          >
            {!isMdUp && (
              <Box sx={{ mb: 2 }}>
                <ListItemButton
                  component={Link}
                  href="/analytics/dashboard"
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${ax.border.subtle}`,
                    bgcolor: 'rgba(17,24,39,0.5)',
                  }}
                >
                  <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                    <ChartIcon />
                  </ListItemIcon>
                  <ListItemText primary="Overview" primaryTypographyProps={{ fontWeight: 700 }} />
                </ListItemButton>
              </Box>
            )}
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

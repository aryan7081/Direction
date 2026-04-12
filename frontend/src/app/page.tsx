'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Typography,
  Container,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useAuthStore } from '@/stores/authStore';
import { PRODUCT_NAME } from '@/lib/productCopy';

const LandingBelowFold = dynamic(() => import('./LandingBelowFold'), {
  loading: () => <Box sx={{ minHeight: 200, bgcolor: '#fafbfc' }} aria-hidden />,
});

function GradientOrbs() {
  return (
    <Box aria-hidden className="landing-orbs-root">
      <Box className="landing-orb landing-orb-a" />
      <Box className="landing-orb landing-orb-b" />
    </Box>
  );
}

function GridPattern() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)',
        backgroundSize: '32px 32px', pointerEvents: 'none', zIndex: 0,
      }}
    />
  );
}

function SocialProofStrip() {
  return (
    <Box className="landing-social-fade" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap', mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Box aria-hidden sx={{ display: 'flex' }}>
          {['#16a34a', '#3b82f6', '#6366f1', '#f59e0b'].map((c, i) => (
            <Box
              key={i}
              sx={{
                width: 28, height: 28, borderRadius: '50%', bgcolor: c,
                border: '2px solid #fff', ml: i > 0 ? -1 : 0,
              }}
            />
          ))}
        </Box>
        <Typography sx={{ fontSize: { xs: '0.78rem', sm: '0.85rem' }, color: '#6b7280', fontWeight: 500 }}>
          <Box component="span" sx={{ fontWeight: 700, color: '#111827' }}>Many students</Box>
          {' '}are finding clarity with {PRODUCT_NAME}
        </Typography>
      </Box>
      <Chip
        label="⭐ 4.8/5 rating"
        size="small"
        sx={{ bgcolor: '#fffbeb', color: '#92400e', fontWeight: 600, border: '1px solid #fde68a', fontSize: '0.75rem' }}
      />
    </Box>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [accountMenuEl, setAccountMenuEl] = useState<null | HTMLElement>(null);
  const accountMenuOpen = Boolean(accountMenuEl);

  useEffect(() => {
    router.prefetch('/game-assessment');
  }, [router]);

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const displayName = user?.first_name || user?.email?.split('@')[0] || 'there';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafbfc', overflow: 'hidden' }}>
      <Box
        component="header"
        sx={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          px: { xs: 2, sm: 4 }, py: { xs: 1, sm: 1.5 }, minHeight: { xs: 56, sm: 64 },
          display: 'flex', alignItems: 'center',
          bgcolor: 'rgba(250,251,252,0.92)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: { xs: 0, sm: 2 }, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Box sx={{ position: 'relative', width: { xs: 112, sm: 128 }, height: { xs: 48, sm: 56 }, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image
                src="/logo.png"
                alt={PRODUCT_NAME}
                width={512}
                height={512}
                priority
                sizes="(max-width: 600px) 112px, 128px"
                style={{ height: '100%', width: 'auto', objectFit: 'contain', objectPosition: 'center' }}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, alignItems: 'center', flexShrink: 0, ml: 'auto' }}>
            {user ? (
              isSmDown ? (
                <>
                  <IconButton
                    id="landing-account-menu-button"
                    onClick={(e) => setAccountMenuEl(e.currentTarget)}
                    aria-label="Open account menu"
                    aria-expanded={accountMenuOpen ? 'true' : undefined}
                    aria-haspopup="true"
                    aria-controls={accountMenuOpen ? 'landing-account-menu' : undefined}
                    edge="end"
                    sx={{
                      color: '#374151',
                      border: '1px solid rgba(0,0,0,0.15)',
                      borderRadius: 2,
                      width: 40,
                      height: 40,
                      '&:hover': { borderColor: 'rgba(0,0,0,0.25)', bgcolor: 'rgba(0,0,0,0.03)' },
                    }}
                  >
                    <Box
                      component="span"
                      aria-hidden
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '5px',
                        width: 20,
                        height: 16,
                      }}
                    >
                      <Box sx={{ height: 2, borderRadius: 0.5, bgcolor: 'currentColor', width: '100%' }} />
                      <Box sx={{ height: 2, borderRadius: 0.5, bgcolor: 'currentColor', width: '100%' }} />
                      <Box sx={{ height: 2, borderRadius: 0.5, bgcolor: 'currentColor', width: '100%' }} />
                    </Box>
                  </IconButton>
                  <Menu
                    id="landing-account-menu"
                    anchorEl={accountMenuEl}
                    open={accountMenuOpen}
                    onClose={() => setAccountMenuEl(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    slotProps={{ list: { 'aria-labelledby': 'landing-account-menu-button' }, paper: { sx: { minWidth: 200, borderRadius: 2, mt: 0.5 } } }}
                  >
                    <MenuItem
                      onClick={() => {
                        setAccountMenuEl(null);
                        router.push('/game-assessment');
                      }}
                      sx={{ fontWeight: 600, py: 1.25 }}
                    >
                      Assessment
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setAccountMenuEl(null);
                        router.push('/dashboard');
                      }}
                      sx={{ fontWeight: 600, py: 1.25 }}
                    >
                      Dashboard
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setAccountMenuEl(null);
                        handleLogout();
                      }}
                      sx={{ color: '#6b7280', fontWeight: 600, py: 1.25 }}
                    >
                      Log out
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Link href="/game-assessment" style={{ textDecoration: 'none' }}>
                    <Button size="small" sx={{ color: '#374151', fontWeight: 600, textTransform: 'none', fontSize: { xs: '0.8rem', sm: '0.9rem' }, py: { xs: 0.75, sm: 1.25 }, px: { xs: 1, sm: 1.5 }, minHeight: 40, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
                      Assessment
                    </Button>
                  </Link>
                  <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                    <Button
                      variant="contained" size="small"
                      sx={{
                        background: 'linear-gradient(135deg, #16a34a, #15803d)', textTransform: 'none', fontWeight: 600,
                        borderRadius: 2, px: { xs: 1.5, sm: 3 }, py: { xs: 0.75, sm: 1.25 }, fontSize: { xs: '0.8rem', sm: '0.9rem' },
                        minHeight: 40, whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
                        '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)', boxShadow: '0 6px 20px rgba(22,163,74,0.4)' },
                      }}
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    size="small" onClick={handleLogout}
                    sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'none', fontSize: { xs: '0.8rem', sm: '0.9rem' }, py: { xs: 0.75, sm: 1.25 }, px: { xs: 1, sm: 1.5 }, minHeight: 40, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', color: '#374151' } }}
                  >
                    Log out
                  </Button>
                </>
              )
            ) : (
              <>
                <Link href="/login" style={{ textDecoration: 'none' }}>
                  <Button size="small" sx={{ color: '#374151', fontWeight: 600, textTransform: 'none', fontSize: { xs: '0.8rem', sm: '0.9rem' }, py: { xs: 0.75, sm: 1.25 }, px: { xs: 1, sm: 1.5 }, minHeight: 40, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
                    Sign in
                  </Button>
                </Link>
                <Link href="/game-assessment" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained" size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #16a34a, #15803d)', textTransform: 'none', fontWeight: 600,
                      borderRadius: 2, px: { xs: 1.5, sm: 3 }, py: { xs: 0.75, sm: 1.25 }, fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      minHeight: 40, whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
                      '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)', boxShadow: '0 6px 20px rgba(22,163,74,0.4)' },
                    }}
                  >
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Start Free Assessment</Box>
                    <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Start Free</Box>
                  </Button>
                </Link>
              </>
            )}
          </Box>
        </Container>
      </Box>

      <Box
        sx={{
          position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', overflow: 'hidden', pt: { xs: 10, sm: 12 }, pb: { xs: 6, sm: 8 },
        }}
      >
        <GridPattern />
        <GradientOrbs />

        <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <Container maxWidth="md" sx={{ textAlign: 'center', px: { xs: 2, sm: 3 } }}>
            <Box className="landing-reveal landing-reveal-1">
              <Chip
                label={user ? `Welcome back, ${displayName}` : 'Free for Class 9–10 Students'}
                sx={{
                  mb: 3, bgcolor: 'rgba(22,163,74,0.08)', color: '#16a34a',
                  fontWeight: 600, fontSize: '0.82rem', height: 34, border: '1px solid rgba(22,163,74,0.2)',
                }}
              />
            </Box>

            <Box className="landing-reveal landing-reveal-2">
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800, fontSize: { xs: '2.2rem', sm: '3.2rem', md: '3.8rem' },
                  lineHeight: 1.1, letterSpacing: '-0.03em', color: '#111827', mb: 2.5,
                }}
              >
                {user ? (
                  <>
                    Your career insights
                    <br />
                    <Box component="span" sx={{ background: 'linear-gradient(135deg, #16a34a 0%, #6366f1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      are waiting.
                    </Box>
                  </>
                ) : (
                  <>
                    Confused about which
                    <br />
                    <Box component="span" sx={{ background: 'linear-gradient(135deg, #16a34a 0%, #6366f1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      stream to choose?
                    </Box>
                  </>
                )}
              </Typography>
            </Box>

            <Box className="landing-reveal landing-reveal-3">
              <Typography sx={{ fontSize: { xs: '1rem', sm: '1.2rem' }, color: '#6b7280', maxWidth: 560, mx: 'auto', mb: 4, lineHeight: 1.7 }}>
                {user
                  ? 'Access your dashboard to view your career report, retake the assessment, or explore career paths.'
                  : 'Built using scientifically proven methods used by top career counsellors worldwide. Get clarity in under 15 minutes.'}
              </Typography>
            </Box>

            <Box className="landing-reveal landing-reveal-4">
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', alignItems: 'stretch', width: '100%', maxWidth: { xs: 340, sm: 'none' }, mx: 'auto' }}>
                {user ? (
                  <>
                    <Link href="/dashboard" style={{ textDecoration: 'none', width: '100%' }}>
                      <Button
                        variant="contained" size="large" fullWidth
                        sx={{
                          background: 'linear-gradient(135deg, #16a34a, #15803d)', textTransform: 'none', fontWeight: 700,
                          borderRadius: 2.5, px: 4, py: { xs: 1.75, sm: 1.5 }, fontSize: { xs: '0.95rem', sm: '1rem' }, minHeight: 48,
                          boxShadow: '0 8px 24px rgba(22,163,74,0.3)',
                          '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)', boxShadow: '0 12px 32px rgba(22,163,74,0.4)', transform: 'translateY(-1px)' },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        Go to Dashboard →
                      </Button>
                    </Link>
                    <Link href="/game-assessment" style={{ textDecoration: 'none', width: '100%' }}>
                      <Button
                        variant="outlined" size="large" fullWidth
                        sx={{
                          borderColor: 'rgba(0,0,0,0.15)', color: '#374151', textTransform: 'none', fontWeight: 600,
                          borderRadius: 2.5, px: 4, py: { xs: 1.75, sm: 1.5 }, fontSize: { xs: '0.95rem', sm: '1rem' }, minHeight: 48,
                          '&:hover': { borderColor: 'rgba(0,0,0,0.3)', bgcolor: 'rgba(0,0,0,0.02)' },
                        }}
                      >
                        Take Another Assessment
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/game-assessment" style={{ textDecoration: 'none', width: '100%' }}>
                      <Button
                        variant="contained" size="large" fullWidth
                        sx={{
                          background: 'linear-gradient(135deg, #16a34a, #15803d)', textTransform: 'none', fontWeight: 700,
                          borderRadius: 2.5, px: 4, py: { xs: 1.75, sm: 1.5 }, fontSize: { xs: '1rem', sm: '1.05rem' }, minHeight: 52,
                          boxShadow: '0 8px 24px rgba(22,163,74,0.3)',
                          transition: 'transform 0.15s ease, background 0.2s ease, box-shadow 0.2s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #15803d, #166534)',
                            boxShadow: '0 12px 32px rgba(22,163,74,0.4)',
                            transform: 'scale(1.02)',
                          },
                          '&:active': { transform: 'scale(0.98)' },
                        }}
                      >
                        Discover My Stream — It&apos;s Free →
                      </Button>
                    </Link>
                    <Link href="/login" style={{ textDecoration: 'none', width: '100%' }}>
                      <Button
                        variant="outlined" size="large" fullWidth
                        sx={{
                          borderColor: 'rgba(0,0,0,0.15)', color: '#374151', textTransform: 'none', fontWeight: 600,
                          borderRadius: 2.5, px: 4, py: { xs: 1.75, sm: 1.5 }, fontSize: { xs: '0.95rem', sm: '1rem' }, minHeight: 48,
                          '&:hover': { borderColor: 'rgba(0,0,0,0.3)', bgcolor: 'rgba(0,0,0,0.02)' },
                        }}
                      >
                        I have an account
                      </Button>
                    </Link>
                  </>
                )}
              </Box>
            </Box>

            {!user && <SocialProofStrip />}

            <Box className="landing-reveal landing-reveal-6">
              <Typography variant="caption" sx={{ display: 'block', mt: user ? 3 : 2, color: '#6b7280' }}>
                {user ? 'View your reports, retake the assessment, or explore careers.' : 'No signup needed · No credit card · 100% free assessment'}
              </Typography>
            </Box>
          </Container>
        </Box>

        <Box aria-hidden className="landing-scroll-hint">
          <Box sx={{ width: 24, height: 40, borderRadius: 12, border: '2px solid #d1d5db', display: 'flex', justifyContent: 'center', pt: '8px' }}>
            <Box sx={{ width: 4, height: 8, borderRadius: 2, bgcolor: '#9ca3af' }} />
          </Box>
        </Box>
      </Box>

      <LandingBelowFold />
    </Box>
  );
}

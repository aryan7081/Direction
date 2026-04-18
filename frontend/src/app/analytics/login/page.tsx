'use client';

import Link from 'next/link';
import { Box, Container, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { AnalyticsLoginForm } from '@/features/analytics/AnalyticsLoginForm';
import { ax } from '@/features/analytics/analyticsDesignSystem';

const BULLETS = [
  'Role-based access tied to Django permissions',
  'Separate session from student app logins',
  'Built for internal review — not indexed by search',
];

export default function AnalyticsLoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        background: ax.bg.root,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: ax.gradients.mesh,
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 15% 85%, rgba(167, 139, 250, 0.12), transparent 45%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', py: { xs: 4, md: 8 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 4, md: 8 }}
          alignItems="center"
          justifyContent="space-between"
          sx={{ flex: 1 }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ maxWidth: 480, width: '100%' }}
          >
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.2em' }}>
              Outcave internal
            </Typography>
            <Typography
              variant="h3"
              sx={{
                mt: 1,
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 1.15,
                fontSize: { xs: '1.75rem', sm: '2.25rem' },
                background: `linear-gradient(135deg, ${ax.text.primary} 0%, ${ax.text.secondary} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Metrics that stay behind the curtain.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2, lineHeight: 1.7 }}>
              Sign in with credentials issued by your team. This console is for staff and analysts — not students.
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 4 }}>
              {BULLETS.map((t) => (
                <Stack key={t} direction="row" spacing={1.5} alignItems="flex-start">
                  <Box
                    sx={{
                      mt: 0.6,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: ax.gradients.brand,
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {t}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </motion.div>

          <Box sx={{ width: '100%', maxWidth: 460 }}>
            <AnalyticsLoginForm />
          </Box>
        </Stack>

        <Typography variant="body2" color="text.disabled" sx={{ textAlign: { xs: 'center', md: 'left' }, mt: 4 }}>
          <Link
            href="/"
            style={{
              color: ax.accent.emerald,
              fontWeight: 700,
              textDecoration: 'none',
              borderBottom: `1px solid ${ax.accent.emerald}`,
            }}
          >
            ← Back to public site
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}

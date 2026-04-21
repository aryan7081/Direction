'use client';

import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import type { CareerReport } from '../types';
import { PreviewSensitiveRegion } from './PreviewSensitiveRegion';

const STREAM_THEME: Record<string, { bg: string; accent: string; border: string; icon: string }> = {
  Science: { bg: '#eff6ff', accent: '#1d4ed8', border: '#bfdbfe', icon: '🔬' },
  Commerce: { bg: '#fefce8', accent: '#a16207', border: '#fde68a', icon: '📈' },
  Arts: { bg: '#fdf2f8', accent: '#be185d', border: '#fbcfe8', icon: '🎨' },
  Humanities: { bg: '#fdf2f8', accent: '#be185d', border: '#fbcfe8', icon: '📚' },
  General: { bg: '#f3f4f6', accent: '#374151', border: '#d1d5db', icon: '🎓' },
};

function LockIcon({ color }: { color: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        color,
        filter: `drop-shadow(0 1px 2px ${alpha(color, 0.35)})`,
      }}
      aria-hidden
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
}

export function StreamSection({
  streamRecommendation,
  previewLock = false,
  layout = 'default',
  onPreviewLockedClick,
}: {
  streamRecommendation: CareerReport['stream_recommendation'];
  previewLock?: boolean;
  layout?: 'default' | 'teaser';
  onPreviewLockedClick?: () => void;
}) {
  const theme = STREAM_THEME[streamRecommendation.stream] || STREAM_THEME.General;
  const isTeaser = layout === 'teaser';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, type: 'spring', stiffness: 420, damping: 32 }}
    >
      <Box
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${theme.border}`,
          mb: isTeaser ? 0 : 3,
          height: isTeaser ? '100%' : undefined,
          display: isTeaser ? 'flex' : undefined,
          flexDirection: isTeaser ? 'column' : undefined,
          boxShadow: isTeaser
            ? `0 4px 24px -10px ${alpha('#0f172a', 0.1)}, 0 0 0 1px ${alpha('#fff', 0.8)} inset`
            : `0 10px 40px -16px ${alpha(theme.accent, 0.12)}, 0 1px 3px ${alpha('#0f172a', 0.06)}`,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            px: isTeaser ? { xs: 2, sm: 2.25 } : { xs: 2.5, sm: 3 },
            pt: isTeaser ? { xs: 2, sm: 2.25 } : { xs: 2.25, sm: 2.75 },
            pb: isTeaser ? { xs: 2, sm: 2.25 } : { xs: 2.25, sm: 2.75 },
            flexShrink: 0,
            background: `radial-gradient(120% 80% at 0% 0%, ${alpha(theme.accent, 0.14)} 0%, transparent 55%), linear-gradient(180deg, ${theme.bg} 0%, ${alpha(theme.bg, 0.65)} 100%)`,
            borderBottom: `1px solid ${alpha(theme.border, 0.85)}`,
          }}
        >
          <Stack direction="row" spacing={isTeaser ? 1.5 : 2} alignItems="flex-start">
            <Box
              sx={{
                width: isTeaser ? 52 : 58,
                height: isTeaser ? 52 : 58,
                borderRadius: 2.5,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isTeaser ? 26 : 30,
                lineHeight: 1,
                bgcolor: alpha('#fff', 0.85),
                border: `1px solid ${alpha(theme.accent, 0.2)}`,
                boxShadow: `
                  0 6px 20px -8px ${alpha(theme.accent, 0.35)},
                  inset 0 1px 0 ${alpha('#fff', 1)}
                `,
              }}
              aria-hidden
            >
              {theme.icon}
            </Box>

            <Stack spacing={isTeaser ? 1.15 : 1.35} sx={{ minWidth: 0, flex: 1 }}>
              <Box
                sx={{
                  alignSelf: 'flex-start',
                  px: 1.1,
                  py: 0.35,
                  borderRadius: 999,
                  bgcolor: alpha(theme.accent, 0.1),
                  border: `1px solid ${alpha(theme.accent, 0.22)}`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: theme.accent,
                  }}
                >
                  {isTeaser ? 'Your stream match' : 'Personalised stream'}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: isTeaser ? { xs: '1.05rem', sm: '1.12rem' } : { xs: '1.12rem', sm: '1.22rem' },
                    letterSpacing: '-0.03em',
                    lineHeight: 1.25,
                    color: '#0f172a',
                  }}
                >
                  Your recommended stream
                </Typography>
                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: isTeaser ? '0.72rem' : '0.78rem',
                    fontWeight: 500,
                    color: '#64748b',
                    lineHeight: 1.45,
                  }}
                >
                  {previewLock
                    ? isTeaser
                      ? 'We picked a path that fits you—unlock to see your stream.'
                      : 'Unlock below to see your stream and full reasoning.'
                    : isTeaser
                      ? 'We picked a path that fits you—see the full name and story below.'
                      : 'The direction we suggest for Class 11–12 and beyond, based on your profile.'}
                </Typography>
              </Box>

              <Box
                sx={{
                  mt: 0.25,
                  p: '1.5px',
                  borderRadius: 2.5,
                  background: `linear-gradient(135deg, ${theme.accent} 0%, ${alpha(theme.accent, 0.55)} 50%, ${alpha(theme.accent, 0.85)} 100%)`,
                  boxShadow: `0 10px 32px -12px ${alpha(theme.accent, 0.4)}`,
                }}
              >
                {previewLock ? (
                  <Box
                    component={onPreviewLockedClick ? 'button' : 'div'}
                    type={onPreviewLockedClick ? 'button' : undefined}
                    onClick={onPreviewLockedClick}
                    sx={{
                      borderRadius: 2.35,
                      border: 'none',
                      p: 0,
                      m: 0,
                      width: '100%',
                      display: 'block',
                      cursor: onPreviewLockedClick ? 'pointer' : 'default',
                      font: 'inherit',
                      textAlign: 'center',
                      bgcolor: theme.bg,
                      '&:focus-visible': {
                        outline: '2px solid',
                        outlineColor: 'primary.main',
                        outlineOffset: 2,
                      },
                    }}
                    aria-label="Go to payment options to unlock"
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                      spacing={1.15}
                      sx={{
                        py: isTeaser ? { xs: 1.15, sm: 1.25 } : { xs: 1.25, sm: 1.35 },
                        px: isTeaser ? { xs: 1.25, sm: 1.5 } : { xs: 1.5, sm: 1.75 },
                      }}
                    >
                      <LockIcon color={theme.accent} />
                      <Typography
                        component="span"
                        sx={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          lineHeight: 1.25,
                          letterSpacing: '0.02em',
                          color: '#334155',
                          py: 0.45,
                          px: 1.1,
                          borderRadius: 1,
                          border: `1px solid ${alpha(theme.accent, 0.4)}`,
                        }}
                      >
                        Unlock to reveal stream
                      </Typography>
                    </Stack>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      borderRadius: 2.35,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        px: isTeaser ? { xs: 1.5, sm: 1.75 } : { xs: 1.75, sm: 2 },
                        py: isTeaser ? { xs: 1.35, sm: 1.5 } : { xs: 1.5, sm: 1.65 },
                        bgcolor: '#fff',
                        textAlign: 'center',
                        background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: theme.accent,
                          fontSize: isTeaser
                            ? { xs: '1.45rem', sm: '1.65rem' }
                            : { xs: '1.55rem', sm: '1.85rem' },
                          lineHeight: 1.15,
                          letterSpacing: '-0.03em',
                        }}
                      >
                        {streamRecommendation.stream}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Stack>
          </Stack>
        </Box>

        <Box
          sx={{
            px: isTeaser ? { xs: 2, sm: 2.25 } : { xs: 2.5, sm: 3 },
            py: isTeaser ? 1.35 : 2,
            bgcolor: '#fff',
            flex: isTeaser ? 1 : undefined,
            minHeight: 0,
            borderTop: `1px solid ${alpha('#e2e8f0', 0.9)}`,
          }}
        >
          <Typography
            sx={{
              fontSize: '0.62rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#94a3b8',
              mb: 0.75,
            }}
          >
            Why this stream fits you
          </Typography>
          <PreviewSensitiveRegion
            locked={previewLock}
            onLockedClick={previewLock ? onPreviewLockedClick : undefined}
          >
            <Typography
              variant="body2"
              sx={{
                color: '#374151',
                lineHeight: 1.65,
                fontSize: isTeaser ? '0.78rem' : undefined,
                ...(isTeaser
                  ? {
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 4,
                      overflow: 'hidden',
                    }
                  : {}),
              }}
            >
              {streamRecommendation.reasoning}
            </Typography>
          </PreviewSensitiveRegion>
        </Box>
      </Box>
    </motion.div>
  );
}

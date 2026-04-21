'use client';

import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { CareerReport } from '../types';
import { PreviewSensitiveRegion } from './PreviewSensitiveRegion';

/** Matches teaser hero / career-matches headline — cohesive “premium” label. */
const STREAM_HEADLINE_GRADIENT = 'linear-gradient(105deg, #059669 0%, #0d9488 45%, #2563eb 100%)';

const STREAM_THEME: Record<string, { bg: string; accent: string; border: string; icon: string }> = {
  Science: { bg: '#eff6ff', accent: '#1d4ed8', border: '#bfdbfe', icon: '🔬' },
  Commerce: { bg: '#fefce8', accent: '#a16207', border: '#fde68a', icon: '📈' },
  Arts: { bg: '#fdf2f8', accent: '#be185d', border: '#fbcfe8', icon: '🎨' },
  Humanities: { bg: '#fdf2f8', accent: '#be185d', border: '#fbcfe8', icon: '📚' },
  General: { bg: '#f3f4f6', accent: '#374151', border: '#d1d5db', icon: '🎓' },
};

export function StreamSection({
  streamRecommendation,
  previewLock = false,
  /** Teaser: shorter card next to hero — catchier label, clamped reasoning. */
  layout = 'default',
}: {
  streamRecommendation: CareerReport['stream_recommendation'];
  previewLock?: boolean;
  layout?: 'default' | 'teaser';
}) {
  const theme = STREAM_THEME[streamRecommendation.stream] || STREAM_THEME.General;
  const isTeaser = layout === 'teaser';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
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
          boxShadow: isTeaser ? '0 4px 20px -8px rgba(15, 23, 42, 0.08)' : undefined,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: isTeaser ? 1.25 : 1.5,
            px: isTeaser ? { xs: 2, sm: 2.25 } : { xs: 2.5, sm: 3 },
            py: isTeaser ? { xs: 1.75, sm: 2 } : 2,
            bgcolor: theme.bg,
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontSize: isTeaser ? 24 : 28, lineHeight: 1 }}>{theme.icon}</Typography>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            {isTeaser ? (
              <Box sx={{ mb: 0.5 }}>
                <Typography
                  component="span"
                  sx={{
                    display: 'block',
                    fontWeight: 800,
                    fontSize: { xs: '0.7rem', sm: '0.76rem' },
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    lineHeight: 1.35,
                    background: STREAM_HEADLINE_GRADIENT,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Your recommended stream
                </Typography>
                <Box
                  sx={{
                    mt: 0.65,
                    width: { xs: 40, sm: 48 },
                    height: 3,
                    borderRadius: 2,
                    background: STREAM_HEADLINE_GRADIENT,
                    opacity: 0.85,
                    boxShadow: '0 1px 8px rgba(5, 150, 105, 0.35)',
                  }}
                  aria-hidden
                />
              </Box>
            ) : (
              <Box sx={{ mb: 0.5 }}>
                <Typography
                  component="span"
                  sx={{
                    display: 'block',
                    fontWeight: 800,
                    fontSize: { xs: '0.72rem', sm: '0.78rem' },
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    lineHeight: 1.4,
                    background: STREAM_HEADLINE_GRADIENT,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Recommended Stream
                </Typography>
                <Box
                  sx={{
                    mt: 0.75,
                    width: 56,
                    height: 3,
                    borderRadius: 2,
                    background: STREAM_HEADLINE_GRADIENT,
                    opacity: 0.85,
                    boxShadow: '0 1px 8px rgba(5, 150, 105, 0.3)',
                  }}
                  aria-hidden
                />
              </Box>
            )}
            <PreviewSensitiveRegion locked={previewLock}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: theme.accent,
                  fontSize: isTeaser ? { xs: '1.35rem', sm: '1.55rem' } : { xs: '1.5rem', sm: '1.8rem' },
                  lineHeight: 1.2,
                }}
              >
                {streamRecommendation.stream}
              </Typography>
            </PreviewSensitiveRegion>
          </Box>
        </Box>
        <Box
          sx={{
            px: isTeaser ? { xs: 2, sm: 2.25 } : { xs: 2.5, sm: 3 },
            py: isTeaser ? 1.25 : 2,
            bgcolor: '#fff',
            flex: isTeaser ? 1 : undefined,
            minHeight: 0,
          }}
        >
          <PreviewSensitiveRegion locked={previewLock}>
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

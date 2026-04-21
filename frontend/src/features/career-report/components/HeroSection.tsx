'use client';

import { Box, Chip, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { CareerReport } from '../types';
import { PreviewSensitiveRegion } from './PreviewSensitiveRegion';
import { TeaserHeroMatchesPanel } from './TeaserHeroMatchesPanel';

const BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  High: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  Moderate: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  Exploratory: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
};

/** Full-width confidence explainer — used below teaser hero+stream row. */
export function HeroConfidenceExplanation({
  hero,
  previewLock = false,
  /** Tighter spacing when shown under teaser hero+stream row. */
  compact = false,
  onPreviewLockedClick,
}: {
  hero: CareerReport['hero'];
  previewLock?: boolean;
  compact?: boolean;
  onPreviewLockedClick?: () => void;
}) {
  if (!hero.confidence_explanation) return null;
  const badge = BADGE_COLORS[hero.confidence] ?? BADGE_COLORS.Exploratory;
  return (
    <PreviewSensitiveRegion locked={previewLock} onLockedClick={previewLock ? onPreviewLockedClick : undefined}>
      <Box
        sx={{
          p: { xs: 2, sm: 2.25 },
          borderRadius: 2,
          bgcolor: badge.bg,
          border: `1px solid ${badge.border}`,
          mb: compact ? 2 : 3,
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, color: badge.text, textTransform: 'uppercase', letterSpacing: 0.5 }}
        >
          What &ldquo;{hero.confidence} Confidence&rdquo; means
        </Typography>
        <Typography variant="body2" sx={{ color: '#374151', mt: 0.5, lineHeight: 1.65, fontSize: '0.85rem' }}>
          {hero.confidence_explanation}
        </Typography>
      </Box>
    </PreviewSensitiveRegion>
  );
}

export function HeroSection({
  hero,
  previewLock = false,
  /** Teaser: tighter card, catchy headline, no confidence footer (parent renders full-width). */
  layout = 'default',
  /** When set with layout=teaser, shows locked #1/#2 + peek #3/#4 instead of blurred #1 hero. */
  careers,
  /** Preview: tap blurred hero or locked teaser slots to scroll to paywall. */
  onPreviewLockedClick,
}: {
  hero: CareerReport['hero'];
  previewLock?: boolean;
  layout?: 'default' | 'teaser';
  careers?: CareerReport['careers'];
  onPreviewLockedClick?: () => void;
}) {
  const badge = BADGE_COLORS[hero.confidence] ?? BADGE_COLORS.Exploratory;
  const isTeaser = layout === 'teaser';

  if (isTeaser && careers && careers.length > 0) {
    return <TeaserHeroMatchesPanel careers={careers} onLockedClick={onPreviewLockedClick} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          textAlign: 'center',
          py: isTeaser ? { xs: 2, sm: 2.25 } : { xs: 4, sm: 5 },
          px: isTeaser ? { xs: 2, sm: 2.25 } : 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)',
          border: '1px solid',
          borderColor: 'grey.200',
          mb: isTeaser ? 0 : 3,
          boxShadow: isTeaser ? '0 4px 20px -8px rgba(15, 23, 42, 0.08)' : undefined,
        }}
      >
        {isTeaser ? (
          <Box sx={{ mb: 1.25 }}>
            <Typography
              component="span"
              sx={{
                display: 'block',
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                background: 'linear-gradient(105deg, #059669 0%, #0d9488 40%, #2563eb 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Your #1 career match
            </Typography>
            <Typography
              sx={{
                mt: 0.5,
                fontSize: '0.68rem',
                fontWeight: 600,
                color: '#64748b',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Strongest fit · unlock to read clearly
            </Typography>
          </Box>
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              mb: 1,
              letterSpacing: 1,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
            }}
          >
            #1 Career Match
          </Typography>
        )}

        <PreviewSensitiveRegion locked={previewLock} onLockedClick={previewLock ? onPreviewLockedClick : undefined}>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            {hero.career_category ? (
              <>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: '#15803d',
                    mb: 0.75,
                    fontSize: isTeaser
                      ? { xs: '1.2rem', sm: '1.35rem' }
                      : { xs: '1.55rem', sm: '2.05rem' },
                    lineHeight: 1.2,
                  }}
                >
                  {hero.career_category}
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: '#64748b',
                    fontSize: isTeaser
                      ? { xs: '0.8rem', sm: '0.88rem' }
                      : { xs: '0.95rem', sm: '1.05rem' },
                    mb: 1,
                    lineHeight: 1.35,
                  }}
                >
                  {hero.career_name}
                </Typography>
              </>
            ) : (
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: '#111827',
                  mb: 1,
                  fontSize: isTeaser
                    ? { xs: '1.25rem', sm: '1.45rem' }
                    : { xs: '1.6rem', sm: '2.2rem' },
                }}
              >
                {hero.career_name}
              </Typography>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Typography
              sx={{
                fontSize: isTeaser
                  ? { xs: '1.85rem', sm: '2.1rem' }
                  : { xs: '2.4rem', sm: '3rem' },
                fontWeight: 800,
                color: '#16a34a',
                lineHeight: 1,
                mb: isTeaser ? 1 : 1.5,
              }}
            >
              {hero.score_percent}%
            </Typography>
          </motion.div>

          <Chip
            label={`${hero.confidence} Confidence`}
            sx={{
              bgcolor: badge.bg,
              color: badge.text,
              border: `1px solid ${badge.border}`,
              fontWeight: 600,
              fontSize: isTeaser ? '0.75rem' : '0.82rem',
              height: isTeaser ? 28 : 32,
            }}
          />
        </PreviewSensitiveRegion>
      </Box>

      {!isTeaser && hero.confidence_explanation && (
        <HeroConfidenceExplanation hero={hero} previewLock={previewLock} compact={false} />
      )}
    </motion.div>
  );
}

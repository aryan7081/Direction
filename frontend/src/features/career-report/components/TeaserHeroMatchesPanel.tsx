'use client';

import { Box, Chip, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import { motion } from 'framer-motion';
import type { ReportCareer } from '../types';
import { isAcademicStreamBucketLabel, sortCareersByRank } from '../utils/careerRankHelpers';

const RANK_COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#d97706'];

const shimmer = keyframes`
  0% { transform: translateX(-120%) skewX(-10deg); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translateX(200%) skewX(-10deg); opacity: 0; }
`;

function MiniLockedSlot({
  rank,
  accent,
  onClick,
}: {
  rank: 1 | 2;
  accent: string;
  onClick?: () => void;
}) {
  const isFirst = rank === 1;
  return (
    <Box
      component={onClick ? 'button' : 'div'}
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={onClick ? `Go to payment options to unlock #${rank} match` : undefined}
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        boxSizing: 'border-box',
        outline: 'none',
        font: 'inherit',
        textAlign: 'center',
        width: '100%',
        appearance: 'none',
        WebkitAppearance: 'none',
        cursor: onClick ? 'pointer' : 'default',
        border: `1.5px solid ${alpha(accent, 0.45)}`,
        background: `linear-gradient(150deg, ${alpha('#0f172a', 0.96)} 0%, ${alpha('#1e293b', 0.94)} 100%)`,
        minHeight: { xs: 104, sm: 112 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 1,
        py: 1.25,
        boxShadow: `inset 0 1px 0 ${alpha('#fff', 0.06)}`,
        '&:focus-visible': onClick
          ? { outline: '2px solid', outlineColor: accent, outlineOffset: 2 }
          : undefined,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '50%',
            height: '100%',
            background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.1), transparent)',
            animation: `${shimmer} 2.6s ease-in-out infinite`,
          }}
        />
      </Box>
      <Chip
        label={`#${rank}`}
        size="small"
        sx={{
          height: 22,
          fontSize: '0.62rem',
          fontWeight: 800,
          bgcolor: accent,
          color: '#fff',
          position: 'relative',
          zIndex: 1,
        }}
      />
      <Typography sx={{ fontSize: '1.35rem', mt: 0.75, lineHeight: 1, position: 'relative', zIndex: 1 }} aria-hidden>
        🔒
      </Typography>
      <Typography
        sx={{
          mt: 0.5,
          fontSize: '0.62rem',
          fontWeight: 700,
          color: alpha('#e2e8f0', 0.92),
          textAlign: 'center',
          lineHeight: 1.35,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {isFirst ? 'Strongest' : 'Runner-up'}
      </Typography>
      <Typography
        sx={{
          mt: 0.35,
          fontSize: '0.55rem',
          fontWeight: 600,
          color: alpha('#94a3b8', 0.95),
          textAlign: 'center',
          lineHeight: 1.3,
          position: 'relative',
          zIndex: 1,
        }}
      >
        Unlock to reveal
      </Typography>
    </Box>
  );
}

function MiniPeekSlot({
  career,
  colorIndex,
  listPosition,
}: {
  career: ReportCareer;
  colorIndex: number;
  listPosition: 3 | 4;
}) {
  const accent = RANK_COLORS[colorIndex] ?? '#6b7280';
  const showCategory =
    !!career.career_category && !isAcademicStreamBucketLabel(career.career_category);
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1.5px solid ${alpha(accent, 0.35)}`,
        background: `linear-gradient(165deg, ${alpha('#f0fdf4', 0.95)} 0%, #fff 55%, ${alpha('#fffbeb', 0.5)} 100%)`,
        minHeight: { xs: 104, sm: 112 },
        p: { xs: 1.15, sm: 1.25 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: `0 6px 20px -10px ${alpha(accent, 0.35)}`,
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 0.5, mb: 0.5 }}>
          <Chip
            label={`#${listPosition}`}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.6rem',
              fontWeight: 800,
              bgcolor: accent,
              color: '#fff',
            }}
          />
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: accent, lineHeight: 1 }}>
            {career.score_percent}%
          </Typography>
        </Box>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { xs: '0.72rem', sm: '0.78rem' },
            color: '#15803d',
            lineHeight: 1.25,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {career.career_name}
        </Typography>
        {showCategory ? (
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '0.62rem',
              color: '#64748b',
              mt: 0.25,
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {career.career_category}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

/**
 * Teaser-only: left column — locked #1 & #2, visible peek at #3 & #4 (matches CareerCards strategy).
 */
export function TeaserHeroMatchesPanel({
  careers,
  onLockedClick,
}: {
  careers: ReportCareer[];
  /** Preview: tap locked #1/#2 to scroll to paywall. */
  onLockedClick?: () => void;
}) {
  const sorted = sortCareersByRank(careers);
  const r1 = sorted[0];
  const r2 = sorted[1];
  const r3 = sorted[2];
  const r4 = sorted[3];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <Box
        sx={{
          borderRadius: 3,
          p: { xs: 1.15, sm: 1.75 },
          background: 'linear-gradient(145deg, #f8fafc 0%, #f0fdf4 35%, #eff6ff 100%)',
          border: '1px solid',
          borderColor: alpha('#0f172a', 0.08),
          boxShadow: '0 4px 24px -12px rgba(15, 23, 42, 0.12)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: { xs: 1, sm: 1.5 } }}>
          <Typography
            sx={{
              fontSize: { xs: '0.85rem', sm: '1rem' },
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(105deg, #059669 0%, #0d9488 45%, #2563eb 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Your career matches
          </Typography>
          <Typography
            sx={{
              mt: 0.45,
              fontSize: '0.65rem',
              fontWeight: 600,
              color: '#64748b',
              letterSpacing: '0.03em',
            }}
          >
            #1 &amp; #2 locked · #3 &amp; #4 preview below
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: { xs: 1, sm: 1.25 },
          }}
        >
          {r1 ? <MiniLockedSlot rank={1} accent={RANK_COLORS[0]} onClick={onLockedClick} /> : null}
          {r2 ? <MiniLockedSlot rank={2} accent={RANK_COLORS[1]} onClick={onLockedClick} /> : null}
          {r3 ? <MiniPeekSlot career={r3} colorIndex={2} listPosition={3} /> : null}
          {r4 ? <MiniPeekSlot career={r4} colorIndex={3} listPosition={4} /> : null}
        </Box>

        {!r3 && !r4 && (
          <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center', mt: 1, fontStyle: 'italic' }}>
            Unlock the report for your full ranked list.
          </Typography>
        )}
      </Box>
    </motion.div>
  );
}

'use client';

import { useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Collapse, Divider, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import { motion } from 'framer-motion';
import type { ReportCareer } from '../types';
import { isAcademicStreamBucketLabel, sortCareersByRank } from '../utils/careerRankHelpers';
import { PreviewSensitiveRegion } from './PreviewSensitiveRegion';

const RANK_COLORS = ['#16a34a', '#3b82f6', '#f59e0b'];
const CONFIDENCE_CHIP: Record<string, 'success' | 'info' | 'warning'> = {
  High: 'success',
  Moderate: 'info',
  Exploratory: 'warning',
};

const shimmer = keyframes`
  0% { transform: translateX(-120%) skewX(-12deg); opacity: 0; }
  15% { opacity: 1; }
  100% { transform: translateX(220%) skewX(-12deg); opacity: 0; }
`;

const pulseSoft = keyframes`
  0%, 100% { opacity: 0.85; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.06); }
`;

function LockedTopMatchMysteryCard({
  rank,
  accentColor,
  onClick,
}: {
  rank: 1 | 2;
  accentColor: string;
  onClick?: () => void;
}) {
  const isFirst = rank === 1;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank === 1 ? 0.05 : 0.12, duration: 0.45 }}
      style={{ height: '100%' }}
    >
      <Card
        elevation={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (!onClick) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick ? 'Go to payment options to unlock this match' : undefined}
        sx={{
          height: '100%',
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          border: `2px solid ${alpha(accentColor, 0.55)}`,
          background: `linear-gradient(155deg, ${alpha('#0f172a', 0.97)} 0%, ${alpha('#1e293b', 0.95)} 42%, ${alpha('#334155', 0.88)} 100%)`,
          boxShadow: `0 12px 40px -12px ${alpha(accentColor, 0.35)}, inset 0 1px 0 ${alpha('#fff', 0.08)}`,
          cursor: onClick ? 'pointer' : 'default',
          '&:focus-visible': onClick
            ? { outline: '2px solid', outlineColor: accentColor, outlineOffset: 2 }
            : undefined,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '55%',
              height: '100%',
              background: 'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.14) 45%, transparent 90%)',
              animation: `${shimmer} 2.8s ease-in-out infinite`,
            }}
          />
        </Box>
        <CardContent
          sx={{
            p: { xs: 2, sm: 2.25 },
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            minHeight: { xs: 168, sm: 176 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Chip
            label={`#${rank}`}
            size="small"
            sx={{
              bgcolor: accentColor,
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.7rem',
              height: 26,
              boxShadow: `0 4px 12px ${alpha(accentColor, 0.45)}`,
            }}
          />
          <Box
            sx={{
              mt: 1.25,
              fontSize: { xs: '2rem', sm: '2.25rem' },
              lineHeight: 1,
              animation: `${pulseSoft} 2.2s ease-in-out infinite`,
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.35))',
            }}
            aria-hidden
          >
            🔐
          </Box>
          <Typography
            sx={{
              mt: 1.25,
              fontWeight: 800,
              fontSize: { xs: '0.95rem', sm: '1.02rem' },
              color: '#f8fafc',
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
            }}
          >
            {isFirst ? 'Your strongest match' : 'Your runner-up'}
          </Typography>
          <Typography
            sx={{
              mt: 0.75,
              fontSize: '0.72rem',
              fontWeight: 600,
              color: alpha('#e2e8f0', 0.88),
              lineHeight: 1.45,
              maxWidth: 200,
              mx: 'auto',
            }}
          >
            {isFirst
              ? 'Hidden until unlock — names, scores & why you fit'
              : 'Hidden until unlock — see how close #2 is to #1'}
          </Typography>
          <Typography
            sx={{
              mt: 1.25,
              fontSize: '0.62rem',
              fontWeight: 700,
              color: accentColor,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Unlock full report
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CareerPreviewTeaserSection({
  careers,
  onPreviewLockedClick,
}: {
  careers: ReportCareer[];
  onPreviewLockedClick?: () => void;
}) {
  const sorted = sortCareersByRank(careers);
  const r1 = sorted[0];
  const r2 = sorted[1];
  const r3 = sorted[2];
  const r4 = sorted[3];
  const hasPeek = !!(r3 || r4);

  return (
    <Box sx={{ mb: { xs: 3, sm: 4 } }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 800,
          color: '#0f172a',
          letterSpacing: '-0.02em',
          mb: 0.35,
          fontSize: { xs: '1rem', sm: '1.25rem' },
        }}
      >
        Your career matches
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ display: { xs: 'none', sm: 'block' }, mb: 2.25, lineHeight: 1.65, maxWidth: 520 }}
      >
        The top two spots are yours to unlock — we hide them on purpose so your strongest fits stay exciting.
        {hasPeek ? ' Scroll down for a real preview of your #3 and #4 matches.' : ''}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ display: { xs: 'block', sm: 'none' }, mb: 1.5, lineHeight: 1.45, fontSize: '0.78rem' }}
      >
        #1 &amp; #2 locked · #3 &amp; #4 preview below.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: { xs: 1.35, sm: 2 },
          mb: { xs: 2, sm: 3 },
          alignItems: 'stretch',
        }}
      >
        {r1 && (
          <LockedTopMatchMysteryCard rank={1} accentColor={RANK_COLORS[0]} onClick={onPreviewLockedClick} />
        )}
        {r2 && (
          <LockedTopMatchMysteryCard rank={2} accentColor={RANK_COLORS[1]} onClick={onPreviewLockedClick} />
        )}
      </Box>

      {hasPeek && (
        <>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap',
              mb: { xs: 1.5, sm: 2 },
              p: { xs: 1.15, sm: 1.75 },
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(22, 163, 74, 0.1) 100%)',
              border: '1px solid',
              borderColor: alpha('#f59e0b', 0.35),
            }}
          >
            <Typography component="span" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' }, lineHeight: 1 }} aria-hidden>
              ✨
            </Typography>
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#b45309', fontSize: { xs: '0.78rem', sm: '0.82rem' }, letterSpacing: '-0.01em' }}>
                Sneak peek: your #3 &amp; #4 matches
              </Typography>
              <Typography
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  fontSize: '0.72rem',
                  color: '#78716c',
                  fontWeight: 600,
                  mt: 0.25,
                  lineHeight: 1.45,
                }}
              >
                Real roles below — so you see how the list feels before you unlock #1 and #2.
              </Typography>
            </Box>
          </Box>

          {r3 && <CareerCard career={r3} index={2} previewLock={false} displayRank={3} />}
          {r4 && <CareerCard career={r4} index={3} previewLock={false} displayRank={4} />}
        </>
      )}

      {!hasPeek && (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Unlock the report to see your full ranked list.
        </Typography>
      )}
    </Box>
  );
}

function CareerCard({
  career,
  index,
  previewLock = false,
  displayRank,
}: {
  career: ReportCareer;
  index: number;
  previewLock?: boolean;
  /** When set (e.g. teaser #3/#4), chip shows list position instead of raw `career.rank`. */
  displayRank?: number;
}) {
  const color = RANK_COLORS[index] ?? '#6b7280';
  const isTeaserPeek34 = displayRank === 3 || displayRank === 4;
  const showCategory =
    !!career.career_category && !(isTeaserPeek34 && isAcademicStreamBucketLabel(career.career_category));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 * Math.min(index, 3) }}
    >
      <Card
        variant="outlined"
        sx={{ borderRadius: 3, borderLeft: 4, borderLeftColor: color, mb: 2.5 }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <PreviewSensitiveRegion locked={previewLock}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip
                  label={`#${displayRank ?? career.rank}`}
                  size="small"
                  sx={{ bgcolor: color, color: '#fff', fontWeight: 700, fontSize: '0.75rem', height: 26 }}
                />
                <Box>
                  <Typography
                    sx={{
                      display: 'block',
                      fontWeight: 800,
                      color: '#15803d',
                      fontSize: '1.1rem',
                      lineHeight: 1.25,
                      mb: showCategory ? 0.35 : 0,
                    }}
                  >
                    {career.career_name}
                  </Typography>
                  {showCategory ? (
                    <Typography sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.875rem', lineHeight: 1.35, mb: 0.15 }}>
                      {career.career_category}
                    </Typography>
                  ) : null}
                  {!isTeaserPeek34 ? (
                    <Typography variant="caption" color="text.secondary">
                      {career.stream}
                    </Typography>
                  ) : null}
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1 }}>
                  {career.score_percent}%
                </Typography>
                <Chip
                  label={career.confidence}
                  size="small"
                  color={CONFIDENCE_CHIP[career.confidence] ?? 'default'}
                  variant="outlined"
                  sx={{ mt: 0.5, height: 22, fontSize: '0.7rem' }}
                />
              </Box>
            </Box>

            {/* Short description */}
            {career.description && (
              <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.82rem', mb: 1.5, fontStyle: 'italic' }}>
                {career.description}
              </Typography>
            )}

            {/* Why it matches */}
            <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.7, mb: 2 }}>
              {career.why_match}
            </Typography>

            <Divider sx={{ my: 1.5 }} />

            {/* Meta grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
              <MetaItem label="Work Style" value={career.work_style} />
              <MetaItem label="Education Path" value={career.education_path} />
              {career.min_education && <MetaItem label="Minimum Education" value={career.min_education} />}
              {career.salary_range && <MetaItem label="Salary Range" value={career.salary_range} />}
              {career.growth_outlook && <MetaItem label="Growth Outlook" value={career.growth_outlook} />}
            </Box>
          </PreviewSensitiveRegion>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>
        {label}
      </Typography>
      <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.5 }}>
        {value}
      </Typography>
    </Box>
  );
}

export function CareerCards({
  careers,
  previewLock = false,
  onPreviewLockedClick,
}: {
  careers: ReportCareer[];
  previewLock?: boolean;
  onPreviewLockedClick?: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const sorted = sortCareersByRank(careers);

  if (previewLock) {
    return <CareerPreviewTeaserSection careers={sorted} onPreviewLockedClick={onPreviewLockedClick} />;
  }

  const hasMore = sorted.length > 3;
  const visibleCareers = showAll ? sorted : sorted.slice(0, 3);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Your Top Career Matches
      </Typography>

      {visibleCareers.slice(0, 3).map((c, i) => (
        <CareerCard key={c.career_id} career={c} index={i} previewLock={previewLock} />
      ))}

      {hasMore && (
        <>
          <Collapse in={showAll}>
            {sorted.slice(3).map((c, i) => (
              <CareerCard key={c.career_id} career={c} index={3 + i} previewLock={previewLock} />
            ))}
          </Collapse>

          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Button
              onClick={() => setShowAll(!showAll)}
              sx={{ textTransform: 'none', fontWeight: 600, color: '#6366f1' }}
            >
              {showAll ? '▲ Show fewer matches' : `▼ Show ${sorted.length - 3} more matches`}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}

'use client';

import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { ReportTrait } from '../types';

const ICON_MAP: Record<string, string> = {
  brain: '🧠',
  calculator: '🔢',
  lightbulb: '💡',
  'message-circle': '💬',
  users: '👥',
  trophy: '🏆',
  zap: '⚡',
  calendar: '📅',
};

const SHORT_LABELS: Record<string, string> = {
  'Analytical Reasoning': 'Analytical',
  'Quantitative Comfort': 'Numbers',
  'Creativity & Innovation': 'Creativity',
  'Verbal & Communication': 'Communication',
  'Social Orientation': 'Social',
  'Leadership Drive': 'Leadership',
  'Risk Appetite': 'Risk-Taking',
  'Structure & Discipline': 'Discipline',
};

function getLevel(score: number): { label: string; color: string; bg: string } {
  if (score >= 8) return { label: 'Excellent', color: '#15803d', bg: '#f0fdf4' };
  if (score >= 6) return { label: 'Strong', color: '#1d4ed8', bg: '#eff6ff' };
  if (score >= 4) return { label: 'Developing', color: '#d97706', bg: '#fffbeb' };
  return { label: 'Growing', color: '#dc2626', bg: '#fef2f2' };
}

function getBarColor(score: number): string {
  if (score >= 8) return '#16a34a';
  if (score >= 6) return '#3b82f6';
  if (score >= 4) return '#f59e0b';
  return '#ef4444';
}

function TraitTile({ trait, index }: { trait: ReportTrait; index: number }) {
  const emoji = ICON_MAP[trait.icon] || '●';
  const shortLabel = SHORT_LABELS[trait.label] || trait.label;
  const level = getLevel(trait.score);
  const barColor = getBarColor(trait.score);
  const pct = (trait.score / trait.max) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.05 * index, type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: 2.5,
          bgcolor: '#fff',
          border: '1px solid #e5e7eb',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: barColor,
            boxShadow: `0 4px 16px ${barColor}15`,
            transform: 'translateY(-2px)',
          },
        }}
      >
        {/* Top: icon + score */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography sx={{ fontSize: { xs: 18, sm: 22 } }}>{emoji}</Typography>
            <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: { xs: '0.8rem', sm: '0.88rem' }, lineHeight: 1.2 }}>
              {shortLabel}
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: 800, color: barColor, fontSize: { xs: '1.1rem', sm: '1.3rem' }, lineHeight: 1 }}>
            {trait.score}
          </Typography>
        </Box>

        {/* Bar */}
        <Box sx={{ position: 'relative', height: 6, borderRadius: 3, bgcolor: '#f3f4f6', mb: 1, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ delay: 0.1 * index + 0.2, duration: 0.6, ease: 'easeOut' }}
            style={{
              height: '100%',
              borderRadius: 3,
              background: barColor,
            }}
          />
        </Box>

        {/* Level badge */}
        <Chip
          label={level.label}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.62rem',
            fontWeight: 700,
            bgcolor: level.bg,
            color: level.color,
            border: 'none',
          }}
        />
      </Box>
    </motion.div>
  );
}

export function TraitRadarChart({ traits }: { traits: ReportTrait[] }) {
  const sorted = [...traits].sort((a, b) => b.score - a.score);
  const strongest = sorted.slice(0, 3);
  const developing = sorted.filter((t) => t.score < 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card variant="outlined" sx={{ borderRadius: 3, mb: 4, overflow: 'visible' }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Your Trait Profile
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Your 30 responses were analyzed across 15 dimensions (interests, work traits, and personality) and consolidated into these 8 core career traits. Each is scored 0–10.
          </Typography>

          {/* Quick summary line */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
              Strongest:
            </Typography>
            {strongest.map((t) => (
              <Chip
                key={t.trait}
                label={`${ICON_MAP[t.icon] || ''} ${SHORT_LABELS[t.label] || t.label}`}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  bgcolor: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                }}
              />
            ))}
            {developing.length > 0 && (
              <>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827', ml: 0.5 }}>
                  Developing:
                </Typography>
                {developing.slice(0, 2).map((t) => (
                  <Chip
                    key={t.trait}
                    label={`${ICON_MAP[t.icon] || ''} ${SHORT_LABELS[t.label] || t.label}`}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      bgcolor: '#fffbeb',
                      color: '#92400e',
                      border: '1px solid #fde68a',
                    }}
                  />
                ))}
              </>
            )}
          </Box>

          {/* Trait grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            {traits.map((t, i) => (
              <TraitTile key={t.trait} trait={t} index={i} />
            ))}
          </Box>

          {/* Legend */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 1.5, sm: 2.5 }, mt: 2.5, flexWrap: 'wrap' }}>
            {[
              { label: 'Excellent (8+)', color: '#16a34a' },
              { label: 'Strong (6–7)', color: '#3b82f6' },
              { label: 'Developing (4–5)', color: '#f59e0b' },
              { label: 'Growing (0–3)', color: '#ef4444' },
            ].map((l) => (
              <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: l.color }} />
                <Typography sx={{ fontSize: '0.68rem', color: '#6b7280', fontWeight: 500 }}>
                  {l.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

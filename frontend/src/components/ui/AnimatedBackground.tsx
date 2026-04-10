'use client';

import { Box, useMediaQuery, useTheme } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';

interface FloatingItem {
  emoji: string;
  x: string;
  y: string;
  size: number;
  delay: number;
  duration: number;
}

const float = (delay: number, duration: number) => ({
  animate: {
    y: [0, -14, 0, 10, 0],
    x: [0, 6, -5, 3, 0],
    rotate: [0, 6, -4, 2, 0],
    scale: [1, 1.06, 0.96, 1.03, 1],
  },
  transition: { duration, delay, repeat: Infinity, ease: 'easeInOut' as const },
});

function FloatingIcon({ emoji, x, y, size, delay, duration }: FloatingItem) {
  return (
    <motion.div
      style={{ position: 'absolute', left: x, top: y, fontSize: size, zIndex: 0, pointerEvents: 'none', willChange: 'transform' }}
      {...float(delay, duration)}
    >
      {emoji}
    </motion.div>
  );
}

function GradientOrb({ color, size, top, left, right, bottom, delay = 0 }: {
  color: string; size: number; top?: string; left?: string; right?: string; bottom?: string; delay?: number;
}) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        top, left, right, bottom,
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }}
      animate={{ scale: [1, 1.15, 1], x: [0, 12, 0], y: [0, -10, 0] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

function DotGrid() {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.025) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

/* ── Preset themes ── */

const THEMES: Record<string, { icons: FloatingItem[]; orbs: Array<{ color: string; size: number; top?: string; left?: string; right?: string; bottom?: string; delay?: number }> }> = {
  dashboard: {
    icons: [
      { emoji: '📊', x: '6%', y: '10%', size: 30, delay: 0, duration: 6 },
      { emoji: '🎯', x: '88%', y: '8%', size: 28, delay: 1.5, duration: 7 },
      { emoji: '🚀', x: '82%', y: '70%', size: 32, delay: 0.8, duration: 5.5 },
      { emoji: '💡', x: '10%', y: '75%', size: 26, delay: 2, duration: 6.5 },
      { emoji: '🎓', x: '50%', y: '5%', size: 24, delay: 3, duration: 6 },
      { emoji: '⭐', x: '92%', y: '40%', size: 22, delay: 1.2, duration: 7.5 },
    ],
    orbs: [
      { color: 'rgba(22,163,74,0.07)', size: 350, top: '-5%', right: '-3%' },
      { color: 'rgba(59,130,246,0.05)', size: 280, bottom: '5%', left: '-3%', delay: 2 },
    ],
  },
  logic: {
    icons: [
      { emoji: '🧩', x: '5%', y: '8%', size: 32, delay: 0, duration: 6 },
      { emoji: '🔢', x: '90%', y: '10%', size: 28, delay: 1, duration: 7 },
      { emoji: '🧠', x: '85%', y: '65%', size: 30, delay: 0.5, duration: 5.5 },
      { emoji: '⚡', x: '8%', y: '70%', size: 26, delay: 2, duration: 6.5 },
      { emoji: '🔍', x: '50%', y: '3%', size: 24, delay: 1.5, duration: 5.8 },
      { emoji: '📐', x: '92%', y: '40%', size: 22, delay: 3, duration: 6.2 },
    ],
    orbs: [
      { color: 'rgba(139,92,246,0.08)', size: 320, top: '-5%', right: '-4%' },
      { color: 'rgba(59,130,246,0.06)', size: 260, bottom: '10%', left: '-3%', delay: 1.5 },
    ],
  },
  risk: {
    icons: [
      { emoji: '🎯', x: '6%', y: '10%', size: 30, delay: 0, duration: 6 },
      { emoji: '⚖️', x: '88%', y: '8%', size: 28, delay: 1.2, duration: 7 },
      { emoji: '🏆', x: '85%', y: '68%', size: 32, delay: 0.5, duration: 5.5 },
      { emoji: '💪', x: '10%', y: '72%', size: 26, delay: 2, duration: 6.5 },
      { emoji: '🎲', x: '48%', y: '4%', size: 24, delay: 1.8, duration: 6 },
      { emoji: '🦁', x: '92%', y: '38%', size: 22, delay: 3, duration: 7 },
    ],
    orbs: [
      { color: 'rgba(245,158,11,0.08)', size: 320, top: '-5%', left: '-3%' },
      { color: 'rgba(239,68,68,0.05)', size: 250, bottom: '8%', right: '-4%', delay: 2 },
    ],
  },
  planner: {
    icons: [
      { emoji: '📅', x: '5%', y: '8%', size: 30, delay: 0, duration: 6 },
      { emoji: '⏰', x: '90%', y: '10%', size: 28, delay: 1, duration: 7 },
      { emoji: '📋', x: '86%', y: '66%', size: 30, delay: 0.5, duration: 5.5 },
      { emoji: '✅', x: '8%', y: '72%', size: 26, delay: 2, duration: 6.5 },
      { emoji: '🗓️', x: '52%', y: '3%', size: 24, delay: 1.5, duration: 6 },
      { emoji: '📌', x: '92%', y: '42%', size: 22, delay: 3, duration: 6.2 },
    ],
    orbs: [
      { color: 'rgba(22,163,74,0.08)', size: 300, top: '-5%', right: '-3%' },
      { color: 'rgba(16,185,129,0.06)', size: 250, bottom: '5%', left: '-4%', delay: 1.5 },
    ],
  },
  scenario: {
    icons: [
      { emoji: '💬', x: '6%', y: '10%', size: 30, delay: 0, duration: 6 },
      { emoji: '🤔', x: '88%', y: '8%', size: 28, delay: 1.2, duration: 7 },
      { emoji: '💡', x: '84%', y: '68%', size: 30, delay: 0.5, duration: 5.5 },
      { emoji: '🎭', x: '10%', y: '70%', size: 26, delay: 2, duration: 6.5 },
      { emoji: '📝', x: '50%', y: '4%', size: 24, delay: 1.8, duration: 5.8 },
      { emoji: '🌟', x: '92%', y: '40%', size: 22, delay: 3, duration: 7 },
    ],
    orbs: [
      { color: 'rgba(59,130,246,0.08)', size: 320, top: '-5%', left: '-3%' },
      { color: 'rgba(139,92,246,0.06)', size: 260, bottom: '8%', right: '-4%', delay: 2 },
    ],
  },
};

/** Static orbs only — no infinite motion (mobile / reduced-motion friendly). */
function StaticOrb({ color, size, top, left, right, bottom }: {
  color: string; size: number; top?: string; left?: string; right?: string; bottom?: string;
}) {
  return (
    <Box
      sx={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        top, left, right, bottom,
        filter: 'blur(40px)',
        pointerEvents: 'none',
        opacity: 0.85,
      }}
    />
  );
}

export function AnimatedBackground({ theme = 'dashboard' }: { theme?: keyof typeof THEMES }) {
  const muiTheme = useTheme();
  const isSmDown = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isMdDown = useMediaQuery(muiTheme.breakpoints.down('md'));
  const prefersReduced = useReducedMotion();
  // Assessment (scenario): disable floating emojis + moving orbs on phones and tablets — less distraction, better focus.
  const calm =
    Boolean(prefersReduced) ||
    (theme === 'scenario' ? isMdDown : isSmDown);

  const t = THEMES[theme] ?? THEMES.dashboard;

  return (
    <Box sx={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <DotGrid />
      {calm
        ? t.orbs.map((orb, i) => <StaticOrb key={i} color={orb.color} size={orb.size} top={orb.top} left={orb.left} right={orb.right} bottom={orb.bottom} />)
        : t.orbs.map((orb, i) => (
            <GradientOrb key={i} {...orb} />
          ))}
      {!calm &&
        t.icons.map((icon, i) => (
          <FloatingIcon key={i} {...icon} />
        ))}
    </Box>
  );
}

export type AnimatedBackgroundTheme = keyof typeof THEMES;

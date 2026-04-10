'use client';

import { Box, Typography } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import type { QuestionVisual } from '../questionVisualConfig';

type QuestionPromptArtProps = {
  visual: QuestionVisual;
  questionId: string;
};

/**
 * Compact, question-specific header: soft motion + one-line coaching copy.
 * Respects prefers-reduced-motion (static decor only).
 */
export function QuestionPromptArt({ visual, questionId }: QuestionPromptArtProps) {
  const reduceMotion = useReducedMotion();

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        mb: 2,
        minHeight: 76,
        background: visual.gradient,
        border: '1px solid rgba(15,23,42,0.06)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset',
      }}
    >
      {!reduceMotion && (
        <>
          <motion.div
            key={`${questionId}-a`}
            initial={{ opacity: 0.5, scale: 0.85, x: -10, y: 4 }}
            animate={{
              opacity: 0.9,
              scale: 1,
              x: [0, 6, 0],
              y: [4, 0, 4],
            }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: visual.blobA,
              filter: 'blur(28px)',
              top: -36,
              left: -24,
              pointerEvents: 'none',
            }}
          />
          <motion.div
            key={`${questionId}-b`}
            initial={{ opacity: 0.45, scale: 0.9, x: 10, y: -6 }}
            animate={{
              opacity: 0.85,
              scale: 1,
              x: [0, -8, 0],
              y: [-6, 4, -6],
            }}
            transition={{
              duration: 6.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: visual.blobB,
              filter: 'blur(26px)',
              bottom: -28,
              right: -12,
              pointerEvents: 'none',
            }}
          />
        </>
      )}
      {reduceMotion && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.35,
            background: `radial-gradient(circle at 20% 30%, ${visual.blobA}, transparent 55%), radial-gradient(circle at 85% 70%, ${visual.blobB}, transparent 50%)`,
            pointerEvents: 'none',
          }}
        />
      )}

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1.75,
          px: 1.75,
          py: 1.5,
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: 48,
            height: 48,
            flexShrink: 0,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.88)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.45rem',
            lineHeight: 1,
            boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
            border: '1px solid rgba(255,255,255,0.9)',
          }}
        >
          {!reduceMotion ? (
            <motion.span
              key={questionId}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            >
              {visual.icon}
            </motion.span>
          ) : (
            <span>{visual.icon}</span>
          )}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="p"
            sx={{
              fontSize: '0.65rem',
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: visual.accentColor,
              lineHeight: 1.2,
              mb: 0.35,
            }}
          >
            {visual.title}
          </Typography>
          <Typography
            component="p"
            sx={{
              fontSize: { xs: '0.78rem', sm: '0.82rem' },
              color: '#374151',
              lineHeight: 1.45,
              fontWeight: 500,
            }}
          >
            {visual.microHint}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

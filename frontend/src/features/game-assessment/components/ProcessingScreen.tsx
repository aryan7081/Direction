'use client';

import { useEffect } from 'react';
import { Box, CircularProgress, Typography, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';

const MESSAGES = [
  'Analyzing your responses...',
  'Mapping your natural strengths...',
  'Matching with career paths...',
  'Almost there...',
];

export function ProcessingScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 4000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
        textAlign: 'center',
        gap: 3,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress size={64} thickness={2.5} sx={{ color: 'primary.main' }} />
          <motion.div
            style={{
              position: 'absolute',
              inset: -8,
              borderRadius: '50%',
            }}
            animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.12, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '2px solid',
                borderColor: 'primary.light',
                opacity: 0.4,
              }}
            />
          </motion.div>
        </Box>
      </motion.div>

      <Box sx={{ width: '100%', maxWidth: 320, mt: 1 }}>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 3.5, ease: 'easeInOut' }}
          style={{ transformOrigin: 'left' }}
        >
          <LinearProgress
            sx={{
              height: 4,
              borderRadius: 2,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': { borderRadius: 2 },
            }}
          />
        </motion.div>
      </Box>

      {MESSAGES.map((msg, i) => (
        <motion.div
          key={msg}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.9 }}
        >
          <Typography
            color="text.secondary"
            fontWeight={500}
            sx={{ fontSize: '1rem' }}
          >
            {msg}
          </Typography>
        </motion.div>
      ))}
    </Box>
  );
}

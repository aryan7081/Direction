'use client';

import { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
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
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <CircularProgress size={56} thickness={3} />
      </motion.div>

      {MESSAGES.map((msg, i) => (
        <motion.div
          key={msg}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 1 }}
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

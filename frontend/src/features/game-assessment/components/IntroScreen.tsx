'use client';

import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { ButtonSpinner } from '@/components/ui/Loaders';

const GAMES = [
  { icon: '🧩', title: 'Logic Challenge', desc: '5 brain teasers to test your reasoning' },
  { icon: '🎯', title: 'Decision Maker', desc: '5 scenarios to reveal your risk & leadership style' },
  { icon: '📅', title: 'Weekly Planner', desc: 'Design your ideal week with drag & drop' },
  { icon: '💬', title: 'Situations', desc: '10 real-life scenarios — no right or wrong answers' },
];

export function IntroScreen({ onStart }: { onStart: () => void }) {
  const [starting, setStarting] = useState(false);

  const handleClick = async () => {
    setStarting(true);
    try {
      await onStart();
    } finally {
      setStarting(false);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4 } }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', letterSpacing: -0.5, mb: 1, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Discover Your Career DNA
        </Typography>
        <Typography sx={{ color: '#6b7280', maxWidth: 480, mx: 'auto', fontSize: { xs: '0.9rem', sm: '0.95rem' }, lineHeight: 1.7, px: 1 }}>
          Play 4 quick activities. No textbooks, no stress — just be yourself.
          We&apos;ll map your natural strengths across 8 traits.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
          mb: 4,
        }}
      >
        {GAMES.map((g, i) => (
          <motion.div
            key={g.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 * i }}
          >
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(12px)',
                borderRadius: 2.5,
                border: '1px solid rgba(0,0,0,0.06)',
                p: 2.5,
                height: '100%',
                display: 'flex',
                gap: 2,
                alignItems: 'flex-start',
                transition: 'all 0.25s ease',
                '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' },
              }}
            >
              <Box sx={{ fontSize: 28, lineHeight: 1 }}>{g.icon}</Box>
              <Box>
                <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>{g.title}</Typography>
                <Typography sx={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.5 }}>{g.desc}</Typography>
              </Box>
            </Box>
          </motion.div>
        ))}
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{ color: '#9ca3af', mb: 2, fontSize: '0.88rem' }}>
          Takes about 10–15 minutes. Your answers are private.
        </Typography>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ width: '100%', maxWidth: 320, margin: '0 auto' }}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleClick}
            disabled={starting}
            sx={{
              px: 5,
              py: { xs: 1.75, sm: 1.5 },
              minHeight: 48,
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2.5,
              fontSize: '1rem',
              boxShadow: '0 8px 24px rgba(22,163,74,0.3)',
              '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)', boxShadow: '0 12px 32px rgba(22,163,74,0.4)' },
            }}
          >
            {starting ? <><ButtonSpinner /> Starting...</> : "Let\u0027s Go →"}
          </Button>
        </motion.div>
      </Box>
    </motion.div>
  );
}

'use client';

import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const GAMES = [
  { icon: '🧩', title: 'Logic Challenge', desc: '5 brain teasers to test your reasoning' },
  { icon: '🎯', title: 'Decision Maker', desc: '5 scenarios to reveal your risk & leadership style' },
  { icon: '📅', title: 'Weekly Planner', desc: 'Design your ideal week with drag & drop' },
  { icon: '💬', title: 'Situations', desc: '10 real-life scenarios — no right or wrong answers' },
];

export function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Discover Your Career DNA
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 480, mx: 'auto' }}>
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
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Typography fontSize={28}>{g.icon}</Typography>
                <Box>
                  <Typography fontWeight={600}>{g.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {g.desc}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Takes about 10–15 minutes. Your answers are private.
        </Typography>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button variant="contained" size="large" onClick={onStart} sx={{ px: 5, py: 1.5 }}>
            Let&apos;s Go
          </Button>
        </motion.div>
      </Box>
    </motion.div>
  );
}

'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';

export function NextSteps({
  stream,
  topCareer,
}: {
  stream?: string;
  topCareer?: string;
}) {
  const steps = [
    {
      icon: '👨‍👩‍👧',
      title: 'Discuss with your parents',
      desc: `Show them this report and the stream recommendation${stream ? ` (${stream})` : ''}. Having a data-backed conversation removes guesswork.`,
    },
    {
      icon: '🏫',
      title: 'Talk to your school counsellor',
      desc: 'Share your PDF report with a counsellor at school. They can help align your subject choices with your assessment results.',
    },
    {
      icon: '🔍',
      title: `Explore ${topCareer || 'your top career'} online`,
      desc: `Watch YouTube videos, read articles, and find professionals in ${topCareer || 'your top career match'} to understand what a day in this career looks like.`,
    },
    {
      icon: '📚',
      title: 'Start building relevant skills',
      desc: 'Check the Development Roadmap above and pick one small action to start this week. Progress compounds — even 30 minutes a week adds up.',
    },
  ];

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, mb: 4 }}>
      <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          ✅ Your Next Steps
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
          Here&apos;s what to do with this report — start with step 1 this week.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <Box sx={{ fontSize: 24, flexShrink: 0, pt: 0.25 }}>{step.icon}</Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem', mb: 0.25 }}>
                    {i + 1}. {step.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.7 }}>
                    {step.desc}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

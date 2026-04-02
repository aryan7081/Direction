'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { WorkingStyleItem } from '../types';

function StyleItem({ item, index }: { item: WorkingStyleItem; index: number }) {
  const position = item.position;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.08 * index }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
        <Typography sx={{ fontSize: 20, minWidth: 28, textAlign: 'center' }}>
          {item.emoji}
        </Typography>
        <Box sx={{ flex: 1 }}>
          {/* Labels */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: position <= 35 ? 700 : 500,
                color: position <= 35 ? '#1d4ed8' : '#9ca3af',
              }}
            >
              {item.label_low}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: position >= 65 ? 700 : 500,
                color: position >= 65 ? '#7c3aed' : '#9ca3af',
              }}
            >
              {item.label_high}
            </Typography>
          </Box>
          {/* Mini spectrum */}
          <Box
            sx={{
              position: 'relative',
              height: 6,
              borderRadius: 3,
              background: 'linear-gradient(90deg, #bfdbfe, #e5e7eb, #ddd6fe)',
              mb: 0.75,
            }}
          >
            <motion.div
              initial={{ left: '50%' }}
              animate={{ left: `${position}%` }}
              transition={{ delay: 0.1 * index + 0.3, duration: 0.5, type: 'spring' }}
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: position <= 35 ? '#3b82f6' : position >= 65 ? '#7c3aed' : '#6b7280',
                border: '2px solid #fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
              }}
            />
          </Box>
          {/* Insight */}
          <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.5 }}>
            {item.insight}
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
}

export function WorkingStyleSection({ items }: { items: WorkingStyleItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card variant="outlined" sx={{ borderRadius: 3, mb: 4 }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Your Working Style
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            How you prefer to work, learn, and make decisions.
            Understanding this helps you choose environments where you&apos;ll thrive.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              '& > div:not(:last-child)': {
                borderBottom: '1px solid #f3f4f6',
              },
            }}
          >
            {items.map((item, i) => (
              <StyleItem key={item.slug} item={item} index={i} />
            ))}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

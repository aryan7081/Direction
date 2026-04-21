'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { LessNaturalCareer } from '../types';
import { PreviewSensitiveRegion } from './PreviewSensitiveRegion';

export function LessNaturalCareers({ items, previewLock = false }: { items: LessNaturalCareer[]; previewLock?: boolean }) {
  if (!items || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <Card variant="outlined" sx={{ borderRadius: 3, mb: 4 }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Careers That May Need Extra Effort
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
            These are not closed doors — they are areas where deliberate skill-building would be needed.
            Understanding this helps you make informed decisions.
          </Typography>

          <PreviewSensitiveRegion locked={previewLock}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {items.map((item, i) => (
                <motion.div
                  key={item.domain}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#374151', mb: 0.5 }}>
                      {item.domain}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.7 }}>
                      {item.note}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </PreviewSensitiveRegion>
        </CardContent>
      </Card>
    </motion.div>
  );
}

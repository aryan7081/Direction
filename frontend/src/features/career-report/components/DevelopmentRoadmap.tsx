'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { CareerReport } from '../types';
import { PreviewSensitiveRegion } from './PreviewSensitiveRegion';

const STEPS = [
  { key: 'class_10' as const, title: 'Class 10 — Build Your Foundation', color: '#16a34a' },
  { key: 'class_11_12' as const, title: 'Class 11–12 — Choose Your Stream', color: '#3b82f6' },
  { key: 'after_12th' as const, title: 'After 12th — Launch Your Career', color: '#8b5cf6' },
];

export function DevelopmentRoadmap({
  roadmap,
  previewLock = false,
}: {
  roadmap: CareerReport['roadmap'];
  previewLock?: boolean;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, mb: 4 }}>
      <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Development Roadmap
        </Typography>
        <PreviewSensitiveRegion locked={previewLock}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            A step-by-step guide tailored to your top career match.
          </Typography>
        </PreviewSensitiveRegion>

        <Box sx={{ position: 'relative', pl: 3 }}>
          {/* Vertical line */}
          <Box
            sx={{
              position: 'absolute',
              left: 10,
              top: 4,
              bottom: 4,
              width: 3,
              bgcolor: 'grey.200',
              borderRadius: 2,
            }}
          />

          {STEPS.map((step, i) => {
            const text = roadmap[step.key];
            if (!text) return null;

            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <Box sx={{ position: 'relative', mb: 3 }}>
                  {/* Dot */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: -27,
                      top: 4,
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      bgcolor: step.color,
                      border: '3px solid #fff',
                      boxShadow: `0 0 0 2px ${step.color}33`,
                    }}
                  />

                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: step.color, mb: 0.5 }}
                  >
                    {step.title}
                  </Typography>
                  <PreviewSensitiveRegion locked={previewLock}>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {text}
                    </Typography>
                  </PreviewSensitiveRegion>
                </Box>
              </motion.div>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}

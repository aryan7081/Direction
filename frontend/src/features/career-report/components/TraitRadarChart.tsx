'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import type { ReportTrait } from '../types';

export function TraitRadarChart({ traits }: { traits: ReportTrait[] }) {
  const data = traits.map((t) => ({
    trait: t.label,
    score: t.score,
    fullMark: t.max,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card
        variant="outlined"
        sx={{ borderRadius: 3, mb: 4, overflow: 'visible' }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Your 8-Trait Profile
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This radar chart shows how your natural abilities spread across 8 core traits.
            The further a point extends outward, the stronger that trait.
          </Typography>

          <Box sx={{ width: '100%', height: { xs: 300, sm: 400 } }}>
            <ResponsiveContainer>
              <RadarChart data={data} cx="50%" cy="50%" outerRadius="68%">
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="trait"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 10]}
                  tick={{ fontSize: 9 }}
                  tickCount={6}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#16a34a"
                  fill="#16a34a"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

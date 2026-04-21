'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { ReportCareer } from '../types';
import { PreviewSensitiveRegion } from './PreviewSensitiveRegion';
import { sortCareersByRank } from '../utils/careerRankHelpers';

const COLORS = ['#16a34a', '#3b82f6', '#f59e0b'];

export function CareerComparison({
  careers,
  comparisonText,
  previewLock = false,
}: {
  careers: ReportCareer[];
  comparisonText?: string;
  previewLock?: boolean;
}) {
  const chartCareers = previewLock ? sortCareersByRank(careers) : careers;

  const data = chartCareers.map((c) => ({
    name: c.career_name,
    match: c.score_percent,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card variant="outlined" sx={{ borderRadius: 3, mb: 4 }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Career Comparison
          </Typography>
          {previewLock ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
              Unlock the full report to see your side-by-side career comparison.
            </Typography>
          ) : comparisonText ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
              {comparisonText}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Side-by-side comparison of your top career matches by compatibility percentage.
            </Typography>
          )}

          <PreviewSensitiveRegion locked={previewLock}>
            {data.length > 0 ? (
              <Box sx={{ width: '100%', height: Math.min(220, 56 + data.length * 48) }}>
                <ResponsiveContainer>
                  <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={130}
                      tick={{ fontSize: 12, fontWeight: 600 }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Match']}
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                    />
                    <Bar dataKey="match" radius={[0, 6, 6, 0]} barSize={32}>
                      {data.map((_, i) => (
                        <Cell key={i} fill={COLORS[i] ?? '#6b7280'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              previewLock && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, fontStyle: 'italic' }}>
                  Not enough ranked matches to chart — unlock for the full comparison.
                </Typography>
              )
            )}
          </PreviewSensitiveRegion>
        </CardContent>
      </Card>
    </motion.div>
  );
}

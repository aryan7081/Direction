'use client';

import { Box, Card, CardContent, Chip, Divider, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { ReportCareer } from '../types';

const RANK_COLORS = ['#16a34a', '#3b82f6', '#f59e0b'];
const CONFIDENCE_CHIP: Record<string, 'success' | 'info' | 'warning'> = {
  High: 'success',
  Moderate: 'info',
  Exploratory: 'warning',
};

function CareerCard({ career, index }: { career: ReportCareer; index: number }) {
  const color = RANK_COLORS[index] ?? '#6b7280';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 * index }}
    >
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          borderLeft: 4,
          borderLeftColor: color,
          mb: 2.5,
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Chip
                label={`#${career.rank}`}
                size="small"
                sx={{
                  bgcolor: color,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  height: 26,
                }}
              />
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                  {career.career_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {career.stream}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1 }}>
                {career.score_percent}%
              </Typography>
              <Chip
                label={career.confidence}
                size="small"
                color={CONFIDENCE_CHIP[career.confidence] ?? 'default'}
                variant="outlined"
                sx={{ mt: 0.5, height: 22, fontSize: '0.7rem' }}
              />
            </Box>
          </Box>

          {/* Why it matches */}
          <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.7, mb: 2 }}>
            {career.why_match}
          </Typography>

          <Divider sx={{ my: 1.5 }} />

          {/* Meta grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            <MetaItem label="Work Style" value={career.work_style} />
            <MetaItem label="Education Path" value={career.education_path} />
            {career.salary_range && <MetaItem label="Salary Range" value={career.salary_range} />}
            {career.growth_outlook && <MetaItem label="Growth Outlook" value={career.growth_outlook} />}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>
        {label}
      </Typography>
      <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.5 }}>
        {value}
      </Typography>
    </Box>
  );
}

export function CareerCards({ careers }: { careers: ReportCareer[] }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Top 3 Career Matches
      </Typography>
      {careers.map((c, i) => (
        <CareerCard key={c.career_id} career={c} index={i} />
      ))}
    </Box>
  );
}

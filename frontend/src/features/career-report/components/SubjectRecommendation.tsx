'use client';

import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { SubjectRecommendation as SubjectRecType } from '../types';

function SubjectCard({
  combo,
  isPrimary,
  index,
}: {
  combo: SubjectRecType['primary'];
  isPrimary: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index }}
    >
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 2.5,
          bgcolor: isPrimary ? '#f0fdf4' : '#fff',
          border: `1px solid ${isPrimary ? '#bbf7d0' : '#e5e7eb'}`,
          mb: isPrimary ? 2 : 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {isPrimary && (
            <Chip
              label="Recommended"
              size="small"
              sx={{ height: 22, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#16a34a', color: '#fff' }}
            />
          )}
          <Typography sx={{ fontWeight: 700, color: isPrimary ? '#15803d' : '#374151', fontSize: '0.95rem' }}>
            {combo.label}
          </Typography>
        </Box>

        {/* Subject pills */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          {combo.subjects.map((subj) => (
            <Chip
              key={subj}
              label={subj}
              size="small"
              sx={{
                height: 26,
                fontSize: '0.75rem',
                fontWeight: 600,
                bgcolor: isPrimary ? '#dcfce7' : '#f3f4f6',
                color: isPrimary ? '#166534' : '#374151',
              }}
            />
          ))}
        </Box>

        {/* Best for */}
        <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', mb: 0.75 }}>
          <Box component="span" sx={{ fontWeight: 600 }}>Best for: </Box>
          {combo.best_for}
        </Typography>

        {/* Why */}
        {isPrimary && (
          <Typography sx={{ fontSize: '0.8rem', color: '#374151', lineHeight: 1.6, mt: 1 }}>
            {combo.why}
          </Typography>
        )}
      </Box>
    </motion.div>
  );
}

export function SubjectRecommendationSection({
  recommendation,
  stream,
}: {
  recommendation: SubjectRecType;
  stream: string;
}) {
  if (!recommendation?.primary) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
    >
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          mb: 4,
          background: 'linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%)',
          borderColor: '#d1fae5',
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            📚 Recommended Subjects for Class 11-12
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Based on your interest profile and {stream} stream recommendation,
            here are the specific subject combinations that align best with your strengths.
          </Typography>

          {/* Primary recommendation */}
          <SubjectCard combo={recommendation.primary} isPrimary index={0} />

          {/* Alternatives */}
          {recommendation.alternatives.length > 0 && (
            <>
              <Typography
                sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#6b7280', mt: 2, mb: 1 }}
              >
                Also worth considering:
              </Typography>
              {recommendation.alternatives.map((alt, i) => (
                <SubjectCard key={alt.label} combo={alt} isPrimary={false} index={i + 1} />
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

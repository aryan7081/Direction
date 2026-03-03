'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import confetti from 'canvas-confetti';
import { TRAIT_LABELS, type SessionResult } from '../types';

function fireConfetti() {
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#16a34a', '#3b82f6', '#f59e0b', '#ec4899'],
  });
}

export function GameResultsPage({ result }: { result: SessionResult }) {
  useEffect(() => {
    const timer = setTimeout(fireConfetti, 400);
    return () => clearTimeout(timer);
  }, []);

  const radarData = result.trait_scores.map((t) => ({
    trait: TRAIT_LABELS[t.trait_name] ?? t.trait_name,
    score: t.normalized_score,
    fullMark: 10,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Your Career DNA
        </Typography>
        <Typography color="text.secondary">
          Here&apos;s what makes you, you. Your unique blend of 8 traits.
        </Typography>
      </Box>

      {/* Radar Chart */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent sx={{ p: { xs: 1, sm: 3 } }}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ textAlign: 'center' }}>
            Trait Profile
          </Typography>
          <Box sx={{ width: '100%', height: { xs: 300, sm: 380 } }}>
            <ResponsiveContainer>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="trait"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 10]}
                  tick={{ fontSize: 10 }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#16a34a"
                  fill="#16a34a"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Box>

          {/* Score pills */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              justifyContent: 'center',
              mt: 2,
            }}
          >
            {result.trait_scores
              .slice()
              .sort((a, b) => b.normalized_score - a.normalized_score)
              .map((t) => (
                <Chip
                  key={t.trait_name}
                  label={`${TRAIT_LABELS[t.trait_name] ?? t.trait_name}: ${t.normalized_score.toFixed(1)}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
              ))}
          </Box>
        </CardContent>
      </Card>

      {/* Top Careers */}
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Top Career Matches
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
        {result.career_matches.map((c, i) => (
          <motion.div
            key={c.career_id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 * i }}
          >
            <Card
              variant="outlined"
              sx={{
                borderLeft: 4,
                borderColor:
                  i === 0 ? 'success.main' : i === 1 ? 'info.main' : 'warning.main',
              }}
            >
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Chip
                      label={`#${c.rank}`}
                      size="small"
                      color={i === 0 ? 'success' : 'default'}
                    />
                    <Typography fontWeight={600}>{c.career_name}</Typography>
                  </Box>
                  <Chip label={c.stream} size="small" variant="outlined" sx={{ mb: 1 }} />
                  {c.description && (
                    <Typography variant="body2" color="text.secondary">
                      {c.description}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h5" fontWeight={700} color="primary.main">
                    {c.score_percent}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    compatibility
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>

      {/* CTA */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <Button variant="outlined">Go to Dashboard</Button>
        </Link>
        <Link href="/careers" style={{ textDecoration: 'none' }}>
          <Button variant="contained">Explore All Careers</Button>
        </Link>
      </Box>
    </motion.div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Chip, Container, Typography } from '@mui/material';
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

const RANK_COLORS = ['#16a34a', '#3b82f6', '#f59e0b'];

export function GameResultsPage({ result }: { result: SessionResult }) {
  const router = useRouter();

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
    <Container maxWidth="sm" sx={{ py: { xs: 1, sm: 2 } }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Title */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', letterSpacing: -0.5, mb: 0.5 }}>
            Your Career DNA
          </Typography>
          <Typography sx={{ color: '#6b7280', fontSize: '0.95rem' }}>
            Here&apos;s what makes you, you. Your unique blend of 8 traits.
          </Typography>
        </Box>

        {/* Radar Chart */}
        <Box
          sx={{
            bgcolor: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(12px)',
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.06)',
            p: { xs: 2, sm: 3 },
            mb: 3,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827', textAlign: 'center', mb: 1 }}>
            Trait Profile
          </Typography>
          <Box sx={{ width: '100%', height: { xs: 300, sm: 380 } }}>
            <ResponsiveContainer>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="trait" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="#16a34a" fill="#16a34a" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, justifyContent: 'center', mt: 2 }}>
            {result.trait_scores
              .slice()
              .sort((a, b) => b.normalized_score - a.normalized_score)
              .map((t) => (
                <Chip
                  key={t.trait_name}
                  label={`${TRAIT_LABELS[t.trait_name] ?? t.trait_name}: ${t.normalized_score.toFixed(1)}`}
                  size="small"
                  sx={{
                    fontWeight: 500,
                    fontSize: '0.74rem',
                    bgcolor: 'rgba(22,163,74,0.06)',
                    color: '#374151',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                />
              ))}
          </Box>
        </Box>

        {/* Top Careers */}
        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827', mb: 2 }}>
          Top Career Matches
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4 }}>
          {result.career_matches.map((c, i) => (
            <motion.div
              key={c.career_id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 * i, duration: 0.4 }}
            >
              <Box
                sx={{
                  bgcolor: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: 2.5,
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderLeft: `4px solid ${RANK_COLORS[i] ?? '#6b7280'}`,
                  p: { xs: 2, sm: 2.5 },
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 1,
                  transition: 'all 0.25s ease',
                  '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' },
                }}
              >
                <Box sx={{ flex: 1, minWidth: 180 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Chip
                      label={`#${c.rank}`}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        height: 22,
                        bgcolor: `${RANK_COLORS[i]}14`,
                        color: RANK_COLORS[i],
                        border: `1px solid ${RANK_COLORS[i]}33`,
                      }}
                    />
                    <Typography sx={{ fontWeight: 700, color: '#111827' }}>{c.career_name}</Typography>
                  </Box>
                  <Chip
                    label={c.stream}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      bgcolor: 'rgba(0,0,0,0.04)',
                      color: '#6b7280',
                      mb: 0.5,
                    }}
                  />
                  {c.description && (
                    <Typography sx={{ fontSize: '0.85rem', color: '#6b7280', mt: 0.5 }}>
                      {c.description}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: RANK_COLORS[i] }}>
                    {c.score_percent}%
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#9ca3af' }}>compatibility</Typography>
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>

        {/* CTAs */}
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/dashboard')}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: 'rgba(0,0,0,0.15)', color: '#374151' }}
          >
            Dashboard
          </Button>
          <Button
            variant="contained"
            onClick={() => router.push(`/report?session=${result.session_id}`)}
            sx={{
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              boxShadow: '0 4px 14px rgba(22,163,74,0.25)',
              '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)' },
            }}
          >
            🔓 Unlock Full Career Report
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.push('/careers')}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: 'rgba(0,0,0,0.15)', color: '#374151' }}
          >
            Explore Careers
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
}

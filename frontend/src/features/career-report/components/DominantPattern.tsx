'use client';

import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { DominantPattern as DominantPatternType } from '../types';

export function DominantPattern({ pattern }: { pattern: DominantPatternType }) {
  if (!pattern) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          mb: 4,
          background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)',
          borderColor: '#bfdbfe',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Typography
            variant="overline"
            sx={{ color: '#1d4ed8', fontWeight: 600, letterSpacing: 1.5 }}
          >
            Your Dominant Pattern
          </Typography>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: '#1e40af', mt: 0.5, mb: 1.5 }}
          >
            {pattern.name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.8, mb: 2.5 }}>
            {pattern.description}
          </Typography>

          {/* Top RIASEC codes that drive this pattern */}
          {pattern.top_riasec && pattern.top_riasec.length > 0 && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(29,78,216,0.12)',
                mb: 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#1e40af',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  mb: 1.5,
                }}
              >
                Driven by your top interests
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {pattern.top_riasec.map((r, i) => (
                  <motion.div
                    key={r.slug}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 1.5,
                        bgcolor: i === 0 ? '#dbeafe' : '#f3f4f6',
                        border: `1px solid ${i === 0 ? '#93c5fd' : '#e5e7eb'}`,
                      }}
                    >
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: 0.75,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          bgcolor: i === 0 ? '#2563eb' : i === 1 ? '#3b82f6' : '#6b7280',
                          color: '#fff',
                        }}
                      >
                        {r.code}
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#1e40af', lineHeight: 1.2 }}>
                          {r.label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: '#6b7280' }}>
                          {r.score}/10
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </Box>

              {/* Strongest work trait */}
              {pattern.strongest_trait && (
                <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Typography sx={{ fontSize: '0.72rem', color: '#6b7280' }}>
                    Strongest work trait:
                  </Typography>
                  <Chip
                    label={`${pattern.strongest_trait.label} (${pattern.strongest_trait.score}/10)`}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      bgcolor: '#f0fdf4',
                      color: '#15803d',
                      border: '1px solid #bbf7d0',
                    }}
                  />
                </Box>
              )}
            </Box>
          )}

          {/* Career examples */}
          {pattern.career_examples && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>
                Careers that fit:
              </Typography>
              {pattern.career_examples.split(', ').map((career) => (
                <Chip
                  key={career}
                  label={career}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    bgcolor: '#f3f4f6',
                    color: '#374151',
                  }}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getCareers } from './api';
import { ListSkeleton } from '@/components/ui/Loaders';
import { Box, Container, Typography, Alert, Chip, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';

export function CareersListPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['careers'],
    queryFn: getCareers,
  });

  const careers = Array.isArray(data) ? data : [];

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ py: 2 }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
        <ListSkeleton count={6} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 2 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Failed to load careers. Please ensure you&apos;re logged in and try again.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 1, sm: 2 }, px: { xs: 2, sm: 3 } }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', letterSpacing: -0.5, mb: 3 }}>
          Career Database
        </Typography>
      </motion.div>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {careers.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.03 }}
          >
            <Box
              component={Link}
              href={`/careers/${c.slug}`}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
                bgcolor: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(12px)',
                borderRadius: 2.5,
                border: '1px solid rgba(0,0,0,0.06)',
                p: { xs: 2, sm: 2.5 },
                transition: 'all 0.25s ease',
                '&:hover': {
                  boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
                  borderColor: '#bbf7d0',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>
                  {c.name}
                </Typography>
                <Chip
                  label={c.stream}
                  size="small"
                  sx={{
                    mt: 0.5,
                    height: 22,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    bgcolor: 'rgba(22,163,74,0.08)',
                    color: '#16a34a',
                    border: '1px solid rgba(22,163,74,0.15)',
                  }}
                />
              </Box>
              <Typography sx={{ color: '#9ca3af', fontSize: '1.1rem' }}>→</Typography>
            </Box>
          </motion.div>
        ))}
      </Box>
    </Container>
  );
}

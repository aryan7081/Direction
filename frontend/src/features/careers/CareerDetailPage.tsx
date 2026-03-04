'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { getCareerBySlug } from './api';
import { DetailSkeleton } from '@/components/ui/Loaders';
import { Box, Button, Chip, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';

export function CareerDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const { data: career, isLoading, error } = useQuery({
    queryKey: ['career', slug],
    queryFn: () => getCareerBySlug(slug),
    enabled: !!slug,
  });

  if (error || (!isLoading && !career)) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="error">Career not found.</Typography>
        <Button sx={{ mt: 2, textTransform: 'none', fontWeight: 600 }} onClick={() => router.push('/careers')}>
          ← Back to Careers
        </Button>
      </Container>
    );
  }

  if (isLoading || !career) return <DetailSkeleton />;

  const infoItems = [
    { label: 'Education', value: career.min_education },
    { label: 'Salary Range', value: career.salary_range },
    { label: 'Growth Outlook', value: career.growth_outlook },
  ].filter((i) => i.value);

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 1, sm: 2 }, px: { xs: 2, sm: 3 } }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <Button
          size="small"
          onClick={() => router.push('/careers')}
          sx={{ mb: 2, textTransform: 'none', fontWeight: 600, color: '#6b7280' }}
        >
          ← Back to Careers
        </Button>

        <Box
          sx={{
            bgcolor: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(12px)',
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.06)',
            p: { xs: 3, sm: 4 },
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', letterSpacing: -0.5, mb: 1 }}>
            {career.name}
          </Typography>
          <Chip
            label={career.stream}
            size="small"
            sx={{
              mb: 2.5,
              fontWeight: 600,
              bgcolor: 'rgba(22,163,74,0.08)',
              color: '#16a34a',
              border: '1px solid rgba(22,163,74,0.15)',
            }}
          />
          <Typography sx={{ color: '#6b7280', lineHeight: 1.7, mb: 3, fontSize: '0.95rem' }}>
            {career.description}
          </Typography>

          {infoItems.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                p: 2.5,
                borderRadius: 2,
                bgcolor: '#f9fafb',
                border: '1px solid rgba(0,0,0,0.04)',
                mb: 3,
              }}
            >
              {infoItems.map((item) => (
                <Box key={item.label} sx={{ display: 'flex', gap: 1 }}>
                  <Typography sx={{ fontSize: '0.88rem', color: '#9ca3af', fontWeight: 500, minWidth: 110 }}>
                    {item.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.88rem', color: '#374151', fontWeight: 500 }}>
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          <Button
            variant="contained"
            fullWidth
            onClick={() => router.push('/game-assessment')}
            sx={{
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2.5,
              py: 1.3,
              fontSize: '0.95rem',
              boxShadow: '0 6px 20px rgba(22,163,74,0.25)',
              '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)' },
            }}
          >
            Take Assessment to See Match →
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
}

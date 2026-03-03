'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getCareers } from './api';
import { ListSkeleton } from '@/components/ui/Loaders';
import { Box, Card, CardContent, Typography, Alert, Skeleton } from '@mui/material';

export function CareersListPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['careers'],
    queryFn: getCareers,
  });

  const careers = Array.isArray(data) ? data : [];

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 720, mx: 'auto', p: 2 }}>
        <Skeleton variant="text" width={180} height={36} sx={{ mb: 2 }} />
        <ListSkeleton count={6} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 720, mx: 'auto', p: 2 }}>
        <Alert severity="error">
          Failed to load careers. Please ensure you&apos;re logged in and try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', p: 2 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Career Database</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {careers.map((c) => (
          <Card
            key={c.id}
            component={Link}
            href={`/careers/${c.slug}`}
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              '&:hover': { borderColor: 'primary.main', boxShadow: 1 },
              border: 1,
              borderColor: 'transparent',
            }}
          >
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>{c.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{c.stream}</Typography>
              </Box>
              <Typography color="text.secondary">→</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

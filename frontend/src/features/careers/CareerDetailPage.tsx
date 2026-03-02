'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getCareerBySlug } from './api';
import { Box, Button, Card, CardContent, Chip, Typography } from '@mui/material';

export function CareerDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: career, isLoading, error } = useQuery({
    queryKey: ['career', slug],
    queryFn: () => getCareerBySlug(slug),
    enabled: !!slug,
  });

  if (error || (!isLoading && !career)) {
    return (
      <Box sx={{ maxWidth: 640, mx: 'auto', p: 2, textAlign: 'center' }}>
        <Typography color="error">Career not found.</Typography>
        <Button component={Link} href="/careers" color="primary" sx={{ mt: 2 }}>
          Back to Careers
        </Button>
      </Box>
    );
  }

  if (isLoading || !career) {
    return (
      <Box sx={{ maxWidth: 640, mx: 'auto', p: 2 }}>
        <Typography color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', p: 2 }}>
      <Button component={Link} href="/careers" size="small" sx={{ mb: 2 }}>
        ← Back to Careers
      </Button>
      <Card>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>{career.name}</Typography>
          <Chip label={career.stream} color="primary" variant="outlined" sx={{ mb: 2 }} size="small" />
          <Typography color="text.secondary" sx={{ mb: 3 }}>{career.description}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {career.min_education && (
              <Typography variant="body2">
                <Box component="span" sx={{ color: 'text.secondary' }}>Education:</Box> {career.min_education}
              </Typography>
            )}
            {career.salary_range && (
              <Typography variant="body2">
                <Box component="span" sx={{ color: 'text.secondary' }}>Salary Range:</Box> {career.salary_range}
              </Typography>
            )}
            {career.growth_outlook && (
              <Typography variant="body2">
                <Box component="span" sx={{ color: 'text.secondary' }}>Growth Outlook:</Box> {career.growth_outlook}
              </Typography>
            )}
          </Box>
          <Button component={Link} href="/assessment" variant="contained" color="primary" sx={{ mt: 3 }}>
            Take Assessment to See Match
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

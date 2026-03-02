'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getAssessmentResult } from './api';
import { downloadReport } from '@/features/reports/api';
import { Box, Button, Card, CardContent, Chip, Typography, Alert } from '@mui/material';
import type { AssessmentResult } from '@/types';

export function ResultPage() {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attempt');

  const { data, isLoading, error } = useQuery({
    queryKey: ['result', attemptId],
    queryFn: () => getAssessmentResult(Number(attemptId)),
    enabled: !!attemptId,
  });

  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (!attemptId || error) {
    return (
      <Box sx={{ maxWidth: 640, mx: 'auto', p: 2, textAlign: 'center' }}>
        <Typography color="error">Invalid or missing result.</Typography>
        <Button component={Link} href="/dashboard" color="primary" sx={{ mt: 2 }}>
          Go to Dashboard
        </Button>
      </Box>
    );
  }

  if (isLoading || !data) {
    return (
      <Box sx={{ maxWidth: 640, mx: 'auto', p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">Loading your results...</Typography>
      </Box>
    );
  }

  const result = data as AssessmentResult;
  const stream = result.stream_recommendation;
  const careers = Array.isArray(result.career_recommendations) ? result.career_recommendations : [];

  const handleDownload = async () => {
    setDownloadError(null);
    setDownloading(true);
    try {
      await downloadReport(Number(attemptId));
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : 'Failed to generate report');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', p: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>Your Results</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Based on your assessment, here are your top matches.</Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Recommended Stream</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={stream?.primary || '—'} color="primary" variant="outlined" />
              {stream?.secondary && <Chip label={stream.secondary} variant="outlined" />}
              {stream?.tertiary && <Chip label={stream.tertiary} variant="outlined" />}
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Top Career Matches</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {careers.map((c, i) => (
                <Card
                  key={c.career_id}
                  component={Link}
                  href={`/careers/${c.career_slug}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': { borderColor: 'primary.main', boxShadow: 1 },
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">#{i + 1}</Typography>
                        <Typography variant="subtitle1" fontWeight={600}>{c.career_name}</Typography>
                        <Typography variant="body2" color="text.secondary">{c.stream}</Typography>
                      </Box>
                      <Typography color="primary.main" fontWeight={600}>{c.compatibility_percent}% match</Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>

          {downloadError && (
            <Alert severity="error" onClose={() => setDownloadError(null)} sx={{ mt: 2 }}>
              {downloadError}
            </Alert>
          )}
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button variant="outlined" color="primary" fullWidth onClick={handleDownload} disabled={downloading}>
              {downloading ? 'Downloading...' : 'Download PDF Report'}
            </Button>
            <Button component={Link} href="/dashboard" fullWidth>
              Dashboard
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

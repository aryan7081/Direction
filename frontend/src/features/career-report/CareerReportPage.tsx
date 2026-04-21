'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { AxiosError } from 'axios';
import { Button, Container, Typography } from '@mui/material';
import { PageLoader } from '@/components/ui/Loaders';
import { fetchCareerReport, downloadReportPdf } from './api';
import { CareerReportContent } from './CareerReportContent';

export function CareerReportPage({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const { data: report, isLoading, error } = useQuery({
    queryKey: ['career-report', sessionId],
    queryFn: () => fetchCareerReport(sessionId),
    enabled: !!sessionId,
  });

  useEffect(() => {
    if (!report?.premium_upgrade?.available) return;
    if (typeof window === 'undefined' || window.location.hash !== '#premium-upgrade') return;
    const id = window.setTimeout(() => {
      document.getElementById('premium-upgrade')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    return () => window.clearTimeout(id);
  }, [report, sessionId]);

  const handleDownloadPdf = async () => {
    setDownloadError(null);
    setDownloading(true);
    try {
      await downloadReportPdf(sessionId);
    } catch {
      setDownloadError('PDF generation failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return <PageLoader message="Generating your career report..." />;
  }

  if (error) {
    const ax = error as AxiosError<{ code?: string; detail?: string }>;
    if (ax.response?.status === 402 && ax.response.data?.code === 'PREMIUM_EXTENSION_REQUIRED') {
      return (
        <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 800, mb: 1 }}>Almost there</Typography>
          <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 420, mx: 'auto' }}>
            {ax.response.data?.detail ||
              'Complete your premium assessment to unlock the full report included in your bundle.'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push(`/game-assessment?premium_continue=${sessionId}`)}
            sx={{ textTransform: 'none', fontWeight: 700, mr: 1 }}
          >
            Continue premium assessment
          </Button>
          <Button variant="outlined" onClick={() => router.push('/dashboard')} sx={{ textTransform: 'none' }}>
            Dashboard
          </Button>
        </Container>
      );
    }
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography color="error" gutterBottom>
          Failed to load report. The session may not be completed yet.
        </Typography>
        <Button variant="outlined" onClick={() => router.push('/dashboard')} sx={{ mt: 2 }}>
          Go to Dashboard
        </Button>
      </Container>
    );
  }

  if (!report) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography color="error" gutterBottom>
          No report data.
        </Typography>
        <Button variant="outlined" onClick={() => router.push('/dashboard')} sx={{ mt: 2 }}>
          Go to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="md"
      sx={{
        py: { xs: 2, sm: 4 },
        px: { xs: 2, sm: 3 },
        /* Space for fixed counseling bar so footer content is not hidden */
        pb: { xs: 18, sm: 16 },
      }}
    >
      <CareerReportContent
        variant="full"
        report={report}
        sessionId={sessionId}
        downloading={downloading}
        downloadError={downloadError}
        onDownloadPdf={handleDownloadPdf}
      />
    </Container>
  );
}

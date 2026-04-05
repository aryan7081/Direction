'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { CareerReportPage } from '@/features/career-report/CareerReportPage';
import { ReportTeaserPage } from '@/features/career-report/ReportTeaserPage';
import { fetchReportTeaser } from '@/features/career-report/api';
import { PageLoader } from '@/components/ui/Loaders';
import { Container, Typography, Button } from '@mui/material';

function ReportInner() {
  const params = useSearchParams();
  const sessionId = params.get('session');

  if (!sessionId) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography color="error">No session ID provided.</Typography>
        <Button href="/dashboard" sx={{ mt: 2 }}>
          Go to Dashboard
        </Button>
      </Container>
    );
  }

  return <ReportGate sessionId={sessionId} />;
}

function ReportGate({ sessionId }: { sessionId: string }) {
  const { data: teaser, isLoading } = useQuery({
    queryKey: ['report-teaser', sessionId],
    queryFn: () => fetchReportTeaser(sessionId),
    enabled: !!sessionId,
  });

  if (isLoading) return <PageLoader message="Loading report..." />;

  if (teaser?.report_accessible ?? teaser?.is_paid) {
    return <CareerReportPage sessionId={sessionId} />;
  }

  return <ReportTeaserPage sessionId={sessionId} />;
}

export default function ReportPage() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader message="Loading report..." />}>
        <ReportInner />
      </Suspense>
    </Layout>
  );
}

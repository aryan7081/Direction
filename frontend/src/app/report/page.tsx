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
      <Layout>
        <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
          <Typography color="error">No session ID provided.</Typography>
          <Button href="/dashboard" sx={{ mt: 2 }}>
            Go to Dashboard
          </Button>
        </Container>
      </Layout>
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

  if (isLoading) {
    return (
      <Layout>
        <PageLoader message="Loading report..." />
      </Layout>
    );
  }

  if (teaser?.report_accessible ?? teaser?.is_paid) {
    return (
      <Layout>
        <CareerReportPage sessionId={sessionId} />
      </Layout>
    );
  }

  return (
    <Layout noMainPadding>
      <ReportTeaserPage sessionId={sessionId} />
    </Layout>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<PageLoader message="Loading report..." />}>
      <ReportInner />
    </Suspense>
  );
}

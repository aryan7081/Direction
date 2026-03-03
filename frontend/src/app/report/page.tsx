'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { CareerReportPage } from '@/features/career-report/CareerReportPage';
import { PageLoader } from '@/components/ui/Loaders';
import { Box, Container, Typography, Button } from '@mui/material';

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

  return <CareerReportPage sessionId={sessionId} />;
}

export default function ReportPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <Suspense fallback={<PageLoader message="Loading report..." />}>
          <ReportInner />
        </Suspense>
      </Layout>
    </ProtectedRoute>
  );
}

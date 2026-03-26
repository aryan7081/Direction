import { Suspense } from 'react';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { AssessmentPage } from '@/features/assessment/AssessmentPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageLoader } from '@/components/ui/Loaders';

export default function Assessment() {
  return (
    <ProtectedRoute>
      <Layout>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader message="Loading assessment..." />}>
            <AssessmentPage />
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </ProtectedRoute>
  );
}

import { Suspense } from 'react';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { ResultPage } from '@/features/assessment/ResultPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ResultSkeleton } from '@/components/ui/Loaders';

export default function Result() {
  return (
    <ProtectedRoute>
      <Layout>
        <ErrorBoundary>
          <Suspense fallback={<ResultSkeleton />}>
            <ResultPage />
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </ProtectedRoute>
  );
}

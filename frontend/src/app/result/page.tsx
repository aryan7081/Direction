import { Suspense } from 'react';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { ResultPage } from '@/features/assessment/ResultPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Result() {
  return (
    <ProtectedRoute>
      <Layout>
        <ErrorBoundary>
          <Suspense fallback={<div className="p-6 text-center text-gray-500">Loading...</div>}>
            <ResultPage />
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </ProtectedRoute>
  );
}

import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { AssessmentPage } from '@/features/assessment/AssessmentPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Assessment() {
  return (
    <ProtectedRoute>
      <Layout>
        <ErrorBoundary>
          <AssessmentPage />
        </ErrorBoundary>
      </Layout>
    </ProtectedRoute>
  );
}

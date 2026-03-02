import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { CareerDetailPage } from '@/features/careers/CareerDetailPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function CareerDetail() {
  return (
    <ProtectedRoute>
      <Layout>
        <ErrorBoundary>
          <CareerDetailPage />
        </ErrorBoundary>
      </Layout>
    </ProtectedRoute>
  );
}

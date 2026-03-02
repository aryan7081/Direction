import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { CareersListPage } from '@/features/careers/CareersListPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Careers() {
  return (
    <ProtectedRoute>
      <Layout>
        <ErrorBoundary>
          <CareersListPage />
        </ErrorBoundary>
      </Layout>
    </ProtectedRoute>
  );
}

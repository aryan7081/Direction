import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <Layout>
        <ErrorBoundary>
          <DashboardPage />
        </ErrorBoundary>
      </Layout>
    </ProtectedRoute>
  );
}

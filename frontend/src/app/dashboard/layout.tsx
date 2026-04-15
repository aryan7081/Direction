import type { Metadata } from 'next';

/** Logged-in area — avoid indexing private dashboards. */
export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}

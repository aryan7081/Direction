import type { Metadata } from 'next';
import { AnalyticsLayoutClient } from '@/features/analytics/AnalyticsLayoutClient';

export const metadata: Metadata = {
  title: 'Analytics',
  robots: { index: false, follow: false },
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <AnalyticsLayoutClient>{children}</AnalyticsLayoutClient>;
}

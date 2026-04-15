import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/seo/site';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `Terms of Service for ${SITE_NAME} — career discovery platform for students in India.`,
  alternates: { canonical: '/terms' },
  openGraph: {
    title: `Terms of Service | ${SITE_NAME}`,
    url: '/terms',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

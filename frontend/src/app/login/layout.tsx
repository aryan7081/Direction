import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/seo/site';

export const metadata: Metadata = {
  title: 'Sign in',
  description: `Sign in to ${SITE_NAME} with Google to save your career assessment progress and view your dashboard.`,
  alternates: { canonical: '/login' },
  openGraph: {
    title: `Sign in | ${SITE_NAME}`,
    url: '/login',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}

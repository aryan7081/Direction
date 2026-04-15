import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/seo/site';

export const metadata: Metadata = {
  title: 'Password help',
  description: `Account recovery information for ${SITE_NAME}. Registration uses Google Sign-In — reset your Google account if needed.`,
  alternates: { canonical: '/forgot-password' },
  robots: { index: false, follow: true },
  openGraph: {
    title: `Password help | ${SITE_NAME}`,
    url: '/forgot-password',
  },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/seo/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy Policy for ${SITE_NAME} — how we collect, use, and protect your data (including Google Sign-In).`,
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: `Privacy Policy | ${SITE_NAME}`,
    url: '/privacy',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}

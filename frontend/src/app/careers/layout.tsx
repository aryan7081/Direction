import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/seo/site';

export const metadata: Metadata = {
  title: 'Careers catalog',
  description: `Explore career paths matched to your stream and profile — browse roles, descriptions, and outlook on ${SITE_NAME}.`,
  alternates: { canonical: '/careers' },
  openGraph: {
    title: `Careers | ${SITE_NAME}`,
    url: '/careers',
  },
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}

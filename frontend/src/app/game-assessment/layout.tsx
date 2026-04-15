import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/seo/site';

export const metadata: Metadata = {
  title: 'Career assessment',
  description: `Interactive career questionnaire: RIASEC interests, personality, values, readiness, and aptitude. Get your stream fit and career matches — ${SITE_NAME}.`,
  alternates: { canonical: '/game-assessment' },
  openGraph: {
    title: `Career assessment | ${SITE_NAME}`,
    url: '/game-assessment',
  },
};

export default function GameAssessmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}

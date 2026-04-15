import type { Metadata } from 'next';

/** Session-specific report URLs should not be indexed. */
export const metadata: Metadata = {
  title: 'Career report',
  robots: { index: false, follow: false },
};

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return children;
}

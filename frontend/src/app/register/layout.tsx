import type { Metadata } from 'next';

/** Legacy URL; page redirects to sign-in. */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}

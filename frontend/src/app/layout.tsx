import type { Metadata, Viewport } from 'next';
import { Inter, DM_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.outcave.in';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Direction by Outcave | Career Discovery for Students',
  description:
    'Confused about Science, Commerce, or Arts? Take a free 30-question assessment and get stream and career guidance backed by RIASEC and behavioural science.',
  icons: { icon: '/logo.png', apple: '/logo.png' },
  openGraph: {
    title: 'Direction by Outcave | Career Discovery for Students',
    description:
      'Science, Commerce, or Arts — get a clear stream recommendation and career matches tailored for Indian students.',
    url: '/',
    siteName: 'Direction by Outcave',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Direction — career discovery for students',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Direction by Outcave | Career Discovery for Students',
    description:
      'Stream and career guidance for Indian students — RIASEC-based assessment and personalised report.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

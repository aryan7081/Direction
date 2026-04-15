import type { Metadata, Viewport } from 'next';
import { Inter, DM_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { SiteStructuredData } from '@/components/seo/SiteStructuredData';
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/seo/site';

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: { icon: '/logo.png', apple: '/logo.png' },
  openGraph: {
    title: `${SITE_NAME} | Career discovery for Class 9–10 students`,
    description:
      'Science, Commerce, or Arts — stream recommendation and career matches for Indian students (RIASEC-style assessment).',
    url: '/',
    siteName: SITE_NAME,
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: `${SITE_NAME} — career discovery for students`,
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | Career discovery for students`,
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
        <SiteStructuredData />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

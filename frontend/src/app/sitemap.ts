import type { MetadataRoute } from 'next';

const defaultSite = 'https://www.outcave.in';

/** Public marketing and app entry routes (no authenticated-only URLs). */
const PATHS = [
  '/',
  '/login',
  '/forgot-password',
  '/game-assessment',
  '/careers',
  '/terms',
  '/privacy',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || defaultSite).replace(/\/$/, '');
  const lastModified = new Date();

  return PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));
}

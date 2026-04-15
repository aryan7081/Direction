/** Canonical site URL for metadata, JSON-LD, and sitemaps (no trailing slash). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.outcave.in'
).replace(/\/$/, '');

export const SITE_NAME = 'Outcave';

export const SITE_TAGLINE = 'Career discovery for Class 9–10 students';

/** Default ~155 chars for shared meta description. */
export const DEFAULT_DESCRIPTION =
  'Free career questionnaire for Indian students: RIASEC interests, personality, values & aptitude. Get Science, Commerce, or Arts stream guidance and career matches.';

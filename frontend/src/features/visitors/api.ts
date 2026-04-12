import { api } from '@/lib/api';

/**
 * Call when user opens the website to record their IP in the admin panel.
 * No auth required. Fires once per app load.
 *
 * Skips on localhost/127.0.0.1 by default so `next dev` / `next start` without Django
 * does not hammer the Next.js rewrite (and avoids ECONNREFUSED noise in the terminal).
 * Set NEXT_PUBLIC_ENABLE_VISITOR_TRACKING=true to force tracking against a local API.
 */
export async function trackVisitor(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (process.env.NEXT_PUBLIC_DISABLE_VISITOR_TRACKING === 'true') return;

  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    if (process.env.NEXT_PUBLIC_ENABLE_VISITOR_TRACKING !== 'true') return;
  }

  try {
    await api.get('/visitors/track/');
  } catch {
    // Silently ignore - tracking is non-critical
  }
}

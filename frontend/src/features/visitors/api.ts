import { api } from '@/lib/api';

/**
 * Call when user opens the website to record their IP in the admin panel.
 * No auth required. Fires once per app load.
 */
export async function trackVisitor(): Promise<void> {
  try {
    await api.get('/visitors/track/');
  } catch {
    // Silently ignore - tracking is non-critical
  }
}

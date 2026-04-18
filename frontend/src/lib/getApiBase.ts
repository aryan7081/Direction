const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Resolved API base URL (browser: proxy / env / LAN; SSR: env default).
 */
export function getApiBase(): string {
  if (typeof window === 'undefined') return DEFAULT_API_BASE;
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname?.includes('trycloudflare.com')) {
    const tunnelUrl = process.env.NEXT_PUBLIC_API_URL_TUNNEL;
    if (tunnelUrl) return tunnelUrl;
  }
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return '/api';
  }
  if (host.includes('vercel.app') || host === 'outcave.in' || host === 'www.outcave.in') {
    return '/api';
  }
  if (envUrl) return envUrl;
  return `${window.location.protocol}//${window.location.hostname}:8000/api`;
}

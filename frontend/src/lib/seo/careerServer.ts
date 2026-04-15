import { cache } from 'react';
import type { Career } from '@/types';

/** Server-only fetch for metadata & JSON-LD (ISR). */
export const getCareerBySlugCached = cache(
  async (slug: string): Promise<Career | null> => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const url = `${base.replace(/\/$/, '')}/careers/${encodeURIComponent(slug)}/`;
    try {
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) return null;
      return res.json() as Promise<Career>;
    } catch {
      return null;
    }
  }
);

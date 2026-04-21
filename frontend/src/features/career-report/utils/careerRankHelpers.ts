import type { ReportCareer } from '../types';

/** Stable sort by numeric rank (handles string ranks from JSON). */
export function sortCareersByRank(careers: ReportCareer[]): ReportCareer[] {
  return [...careers].sort((a, b) => Number(a.rank) - Number(b.rank));
}

/** Science / Commerce / Arts style labels — not shown on teaser #3/#4 peek (avoids duplicating stream). */
export function isAcademicStreamBucketLabel(s: string | undefined): boolean {
  if (!s) return false;
  return /^(Science|Commerce|Arts|Humanities|General)$/i.test(s.trim());
}

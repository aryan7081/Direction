import type { ReportCareer } from '../types';

/** Stable sort by numeric rank (handles string ranks from JSON). */
export function sortCareersByRank(careers: ReportCareer[]): ReportCareer[] {
  return [...careers].sort((a, b) => Number(a.rank) - Number(b.rank));
}

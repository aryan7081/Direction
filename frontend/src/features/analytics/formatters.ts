import type { DeltaMetric } from './types';

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-IN').format(n);
}

/** Short labels for chart X-axis (calendar dates from API, YYYY-MM-DD). */
export function formatChartAxisDate(isoDate: string): string {
  const parts = isoDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return isoDate;
  const [y, m, d] = parts;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export function humanizeProductType(key: string): string {
  if (!key) return 'Unknown';
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function humanizeTier(key: string): string {
  if (!key || key === 'null') return 'Unspecified';
  return humanizeProductType(key);
}

export function humanizeStatus(key: string): string {
  if (!key) return 'Unknown';
  return humanizeProductType(key);
}

export function deltaColor(d: DeltaMetric, inverse = false): string {
  if (d.change_pct === 0) return 'text.secondary';
  const up = d.change_pct > 0;
  const good = inverse ? !up : up;
  return good ? '#86efac' : '#fca5a5';
}

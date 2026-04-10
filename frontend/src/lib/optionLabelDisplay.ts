/**
 * Strip legacy "A) " … "D) " prefixes from MCQ option copy (aptitude items).
 * Safe for Likert labels (no match → unchanged).
 */
export function optionLabelForDisplay(text: string): string {
  return text.replace(/^[A-Da-d]\)\s*/, '').trim();
}

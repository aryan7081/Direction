import type { ScenarioQuestion } from './types';
import type { LikertFaceStep } from './components/LikertFaceIcon';

const LIKERT_SECTIONS = new Set([
  'riasec-interests',
  'work-personality',
  'values',
  'readiness',
]);

const INTEREST_RANK: Record<string, LikertFaceStep> = {
  'not interested': 0,
  'slightly interested': 1,
  interested: 2,
  'very interested': 3,
};

const AGREE_RANK: Record<string, LikertFaceStep> = {
  disagree: 0,
  'slightly agree': 1,
  agree: 2,
  'strongly agree': 3,
};

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Phase 1/2 Likert quick_pick items (interest or agree). Aptitude MCQs and behavioral scenarios excluded.
 */
export function isLikertScaleQuestion(question: ScenarioQuestion): boolean {
  if (question.question_format !== 'quick_pick') return false;
  if (question.scenario_behavioral) return false;
  const sec = question.section_category_slug || '';
  if (!LIKERT_SECTIONS.has(sec)) return false;
  const opts = question.options;
  if (!opts || opts.length !== 4) return false;
  const norms = opts.map((o) => norm(o.text));
  return norms.every((n) => n in INTEREST_RANK) || norms.every((n) => n in AGREE_RANK);
}

/** Face icon step for this option text, or null if not a known Likert label. */
export function getLikertStepForOptionText(text: string): LikertFaceStep | null {
  const n = norm(text);
  if (n in INTEREST_RANK) return INTEREST_RANK[n];
  if (n in AGREE_RANK) return AGREE_RANK[n];
  return null;
}

import type { ScenarioQuestion } from './types';

/** Visual + copy for the prompt header — driven by API metadata (section, focus, format). */
export type QuestionVisual = {
  title: string;
  microHint: string;
  icon: string;
  gradient: string;
  blobA: string;
  blobB: string;
  accentColor: string;
};

const SECTION_DEFAULTS: Record<
  string,
  Omit<QuestionVisual, 'microHint'> & { microHint?: string }
> = {
  'riasec-interests': {
    title: 'Interest check',
    icon: '🎯',
    gradient: 'linear-gradient(125deg, #ecfdf5 0%, #eff6ff 45%, #fef3c7 100%)',
    blobA: 'rgba(34,197,94,0.22)',
    blobB: 'rgba(59,130,246,0.2)',
    accentColor: '#15803d',
  },
  'work-personality': {
    title: 'Your style',
    icon: '🧠',
    gradient: 'linear-gradient(125deg, #f5f3ff 0%, #ede9fe 40%, #fce7f3 100%)',
    blobA: 'rgba(139,92,246,0.2)',
    blobB: 'rgba(236,72,153,0.15)',
    accentColor: '#6d28d9',
  },
  values: {
    title: 'What matters',
    icon: '⚖️',
    gradient: 'linear-gradient(125deg, #fff7ed 0%, #ffedd5 50%, #fef9c3 100%)',
    blobA: 'rgba(249,115,22,0.18)',
    blobB: 'rgba(234,179,8,0.16)',
    accentColor: '#c2410c',
  },
  readiness: {
    title: 'Readiness',
    icon: '🛤️',
    gradient: 'linear-gradient(125deg, #ecfeff 0%, #e0f2fe 50%, #f0fdf4 100%)',
    blobA: 'rgba(14,165,233,0.18)',
    blobB: 'rgba(34,197,94,0.14)',
    accentColor: '#0369a1',
  },
  aptitude: {
    title: 'Quick aptitude',
    icon: '✨',
    gradient: 'linear-gradient(125deg, #f0fdf4 0%, #ecfeff 55%, #eef2ff 100%)',
    blobA: 'rgba(16,185,129,0.2)',
    blobB: 'rgba(99,102,241,0.18)',
    accentColor: '#0d9488',
  },
  'behavioral-scenarios': {
    title: 'Real-life moment',
    icon: '🧭',
    gradient: 'linear-gradient(125deg, #eef2ff 0%, #e0e7ff 45%, #fce7f3 100%)',
    blobA: 'rgba(79,70,229,0.2)',
    blobB: 'rgba(217,70,239,0.12)',
    accentColor: '#4338ca',
  },
};

const PRIMARY_FOCUS_HINT: Record<string, string> = {
  riasec_realistic: 'Focus on hands-on tasks, tools, building, fixing, and being active.',
  riasec_investigative: 'Focus on science, ideas, research, and figuring out how things work.',
  riasec_artistic: 'Focus on creating, designing, performing, and expressing yourself.',
  riasec_social: 'Focus on helping, teaching, listening, and working with people.',
  riasec_enterprising: 'Focus on leading, persuading, starting projects, and business energy.',
  riasec_conventional: 'Focus on organisation, data, routines, and clear procedures.',
  extraversion: 'How you gain energy around people and in groups.',
  conscientiousness: 'How you plan, follow through, and handle deadlines.',
  openness: 'How curious you are about new ideas and experiences.',
  personality_A: 'Cooperation, kindness, and how you handle social friction.',
  personality_ES: 'Staying steady when pressure or setbacks show up.',
  values_money: 'Financial goals and what earning means to you — no judgment.',
  values_impact: 'Helping others and contributing beyond yourself.',
  values_security: 'Stability, predictability, and low career risk.',
  values_growth: 'Learning, challenge, and getting better over time.',
  values_creativity: 'Freedom to choose how you work and express ideas.',
  values_balance: 'Time for life outside work or study.',
  readiness: 'How clear and active you are about your next steps.',
  behavioral_scenario: 'Imagine you are really in this situation — then choose.',
  numerical: 'Short number puzzle — work it out at your own pace.',
  abstract: 'Look for the pattern; pick the option that continues it best.',
  verbal: 'Words, meaning, and language — read carefully.',
  spatial: 'Visualise shapes, rotation, and how things fit together.',
};

const CONTEXT_HINT: Record<string, string> = {
  career: 'Think about real activities and roles — not exam marks.',
  self: 'Answer for how you usually are, not how you wish you sounded.',
  values: 'Pick what honestly fits you; every answer is valid.',
  school: 'Picture a normal week at school when you read this.',
  future: 'Think about how prepared you feel for what comes after school.',
  numerical: 'Aptitude taps are short — your best guess is enough.',
  abstract: 'Pattern items reward calm looking, not speed.',
  verbal: 'Language items — trust your reading.',
  spatial: 'Mentally rotate or sketch in the air if that helps.',
};

function aptitudeSubtestHint(sub: string | undefined): string | null {
  if (!sub) return null;
  return PRIMARY_FOCUS_HINT[sub] ?? null;
}

export function resolveQuestionVisual(q: ScenarioQuestion | undefined | null): QuestionVisual {
  if (!q?.id) {
    return {
      title: 'Your turn',
      microHint: 'Read the question once, then choose the option that fits you best.',
      icon: '✏️',
      gradient: 'linear-gradient(125deg, #f8fafc 0%, #f1f5f9 50%, #eef2ff 100%)',
      blobA: 'rgba(148,163,184,0.2)',
      blobB: 'rgba(99,102,241,0.12)',
      accentColor: '#475569',
    };
  }

  const section = q.section_category_slug || '';
  const base = SECTION_DEFAULTS[section];
  const ctx = q.question_context || '';
  const focus = q.primary_focus || '';
  const sub = q.aptitude_subtest || '';
  const fmt = q.question_format || '';

  const fallback: QuestionVisual = {
    title: 'Your turn',
    microHint: 'Read the question once, then choose the option that fits you best.',
    icon: '✏️',
    gradient: 'linear-gradient(125deg, #f8fafc 0%, #f1f5f9 50%, #eef2ff 100%)',
    blobA: 'rgba(148,163,184,0.2)',
    blobB: 'rgba(99,102,241,0.12)',
    accentColor: '#475569',
  };

  if (!base) {
    return fallback;
  }

  const fromFocus = PRIMARY_FOCUS_HINT[focus];
  const fromSub = aptitudeSubtestHint(sub);
  const fromCtx = CONTEXT_HINT[ctx];

  let microHint =
    fromFocus ||
    fromSub ||
    base.microHint ||
    fromCtx ||
    fallback.microHint;

  if (section === 'aptitude' && fmt === 'puzzle') {
    microHint = fromSub || fromFocus || 'Short puzzle — no timer, just your best reasoning.';
  }

  return {
    title: base.title,
    icon: base.icon,
    gradient: base.gradient,
    blobA: base.blobA,
    blobB: base.blobB,
    accentColor: base.accentColor,
    microHint,
  };
}

/** Right-aligned helper next to progress — matches question type so students know how to answer. */
export function resolveOptionHelper(q: ScenarioQuestion | undefined | null): string {
  if (!q?.id) return 'Pick what feels most natural';
  const sec = q.section_category_slug || '';
  const fmt = q.question_format || '';

  if (sec === 'behavioral-scenarios' || q.scenario_behavioral) {
    return 'What would you most likely do?';
  }
  if (sec === 'aptitude') {
    if (fmt === 'puzzle') return 'Pick the answer you think is correct.';
    return 'Read carefully, then tap your best answer.';
  }
  if (sec === 'riasec-interests') {
    return 'How interesting is this to you?';
  }
  if (sec === 'work-personality') {
    return 'How true is this for you usually?';
  }
  if (sec === 'values') {
    return 'What honestly matters more to you?';
  }
  if (sec === 'readiness') {
    return 'How much does this sound like you now?';
  }
  return 'Pick what feels most natural';
}

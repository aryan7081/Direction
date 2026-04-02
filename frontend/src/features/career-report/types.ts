/* ── Legacy 8-trait types (kept for career matching context) ─────── */

export interface ReportTrait {
  trait: string;
  label: string;
  icon: string;
  score: number;
  max: number;
  description: string;
}

/* ── 15-Dimension Profile types ──────────────────────────────────── */

export interface RiasecDimension {
  slug: string;
  label: string;
  short: string;
  code: string;
  emoji: string;
  score: number;
  max: number;
  description: string;
  careers_hint: string;
}

export interface InterestProfile {
  holland_code: string;
  dimensions: RiasecDimension[];
}

export interface CoreTrait {
  slug: string;
  label: string;
  emoji: string;
  score: number;
  max: number;
  description: string;
  stream_connection: string;
}

export interface PersonalityDimension {
  slug: string;
  label_low: string;
  label_high: string;
  emoji: string;
  score: number;
  max: number;
  position: number; // 0-100 for spectrum slider
  description: string;
  insight: string;
}

/* ── Dominant Pattern (RIASEC-based) ─────────────────────────────── */

export interface DominantPatternRiasec {
  slug: string;
  label: string;
  code: string;
  score: number;
}

export interface DominantPattern {
  name: string;
  description: string;
  career_examples: string;
  top_codes: string[];
  top_riasec: DominantPatternRiasec[];
  strongest_trait: {
    slug: string;
    label: string;
    score: number;
  };
}

/* ── Subject Recommendation ──────────────────────────────────────── */

export interface SubjectCombo {
  subjects: string[];
  label: string;
  best_for: string;
  why: string;
}

export interface SubjectRecommendation {
  primary: SubjectCombo;
  alternatives: SubjectCombo[];
}

/* ── Working Style ───────────────────────────────────────────────── */

export interface WorkingStyleItem {
  slug: string;
  label_low: string;
  label_high: string;
  emoji: string;
  score: number;
  max: number;
  position: number;
  insight: string;
}

/* ── Career types ────────────────────────────────────────────────── */

export interface ReportCareer {
  rank: number;
  career_id: number;
  career_name: string;
  career_slug: string;
  stream: string;
  description: string;
  score_percent: number;
  confidence: 'High' | 'Moderate' | 'Exploratory';
  why_match: string;
  work_style: string;
  education_path: string;
  min_education: string;
  salary_range: string;
  growth_outlook: string;
}

export interface ReportStudent {
  name?: string;
  email?: string;
  age?: number;
  grade?: string;
  school?: string;
  date_of_birth?: string;
}

export interface LessNaturalCareer {
  domain: string;
  examples: string;
  trait: string;
  score: number;
  note: string;
}

export interface AreaToImprove {
  trait: string;
  label: string;
  score: number;
  tip: string;
  steps: string[];
  is_stretch?: boolean;
}

/* ── Full Report ─────────────────────────────────────────────────── */

export interface CareerReport {
  session_id: string;
  completed_at: string | null;
  generated_at: string;
  student: ReportStudent;
  hero: {
    career_name: string;
    score_percent: number;
    confidence: string;
    confidence_explanation: string;
  };
  // 8-trait (internal, kept for career card why_match)
  traits: ReportTrait[];
  // 15-dimension student-facing profile
  interest_profile: InterestProfile;
  core_traits: CoreTrait[];
  personality_style: PersonalityDimension[];
  dominant_pattern: DominantPattern;
  subject_recommendation: SubjectRecommendation;
  working_style: WorkingStyleItem[];
  // Career data
  careers: ReportCareer[];
  career_comparison_text: string;
  less_natural_careers: LessNaturalCareer[];
  stream_recommendation: {
    stream: string;
    reasoning: string;
  };
  roadmap: {
    class_10: string;
    class_11_12: string;
    after_12th: string;
  };
  areas_to_improve: AreaToImprove[];
  disclaimer: string;
}

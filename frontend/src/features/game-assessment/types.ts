export type AssessmentTier = 'free' | 'premium';

// ─── Game Content ───

export interface LogicTask {
  id: string;
  type: string;
  prompt: string;
  options: string[];
  time_limit: number;
}

export interface RiskOption {
  id: string;
  text: string;
}

export interface RiskScenario {
  id: string;
  prompt: string;
  options: RiskOption[];
}

export interface PlannerActivity {
  id: string;
  label: string;
  color: string;
  category: string;
}

export interface PlannerConfig {
  activities: PlannerActivity[];
  days: string[];
  time_slots: string[];
  instructions: string;
}

export interface ScenarioOption {
  id: string;
  text: string;
}

export interface ScenarioQuestion {
  id: string;
  prompt: string;
  options: ScenarioOption[];
}

export interface GameContent {
  logic_tasks: LogicTask[];
  risk_scenarios: RiskScenario[];
  planner_config: PlannerConfig;
  scenario_questions: ScenarioQuestion[];
  assessment_tier?: AssessmentTier;
  question_counts?: { free: number; premium: number };
}

// ─── Events ───

export interface GameEvent {
  game: string;
  event_type: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

// ─── Results ───

export interface TraitScore {
  trait_name: string;
  raw_score: number;
  normalized_score: number;
}

export interface CareerMatch {
  career_id: number;
  career_name: string;
  career_slug: string;
  career_category?: string;
  stream: string;
  description: string;
  score: number;
  score_percent: number;
  rank: number;
}

export interface SessionResult {
  session_id: string;
  completed_at: string;
  trait_scores: TraitScore[];
  career_matches: CareerMatch[];
}

// ─── Assessment State ───

export type GamePhase =
  | 'intro'
  | 'logic'
  | 'save_progress'
  | 'risk'
  | 'planner'
  | 'scenario'
  | 'processing'
  | 'results';

export const PHASE_ORDER: GamePhase[] = [
  'intro',
  'logic',
  'save_progress',
  'risk',
  'planner',
  'scenario',
  'processing',
  'results',
];

export const TRAIT_LABELS: Record<string, string> = {
  analytical_reasoning: 'Analytical Reasoning',
  quantitative_comfort: 'Quantitative Comfort',
  creativity_innovation: 'Creativity & Innovation',
  verbal_communication: 'Verbal & Communication',
  social_orientation: 'Social Orientation',
  leadership_drive: 'Leadership Drive',
  risk_appetite: 'Risk Appetite',
  structure_discipline: 'Structure & Discipline',
};

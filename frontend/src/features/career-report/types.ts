export interface ReportTrait {
  trait: string;
  label: string;
  icon: string;
  score: number;
  max: number;
  description: string;
}

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

export interface DominantPatternKeyTrait {
  trait: string;
  label: string;
  score: number;
  max: number;
}

export interface DominantPattern {
  name: string;
  description: string;
  key_traits?: DominantPatternKeyTrait[];
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
  traits: ReportTrait[];
  careers: ReportCareer[];
  career_comparison_text: string;
  dominant_pattern: DominantPattern;
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

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface AnswerOption {
  id: number;
  text: string;
  order: number;
}

export interface QuestionMetadata {
  code?: string;
  format?: string;
  context?: string;
  section?: string;
  primary_focus?: string;
  secondary_signal?: string;
}

export interface Question {
  id: number;
  text: string;
  category: Category;
  order: number;
  answer_options: AnswerOption[];
  metadata?: QuestionMetadata;
}

export interface Career {
  id: number;
  name: string;
  slug: string;
  stream: string;
  description: string;
  min_education?: string;
  salary_range?: string;
  growth_outlook?: string;
}

export interface CareerRecommendation {
  career_id: number;
  career_name: string;
  career_slug: string;
  stream: string;
  compatibility_score: number;
  compatibility_percent: number;
}

export interface StreamRecommendation {
  primary: string;
  secondary: string;
  tertiary: string;
  scores: Record<string, number>;
}

export interface AssessmentResult {
  result_id: number;
  category_scores: Record<string, number>;
  stream_recommendation: StreamRecommendation;
  career_recommendations: CareerRecommendation[];
}

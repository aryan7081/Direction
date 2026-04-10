import { api } from '@/lib/api';
import type {
  AssessmentTier,
  GameContent,
  GameEvent,
  GamePhase,
  SessionResult,
} from './types';

export async function fetchGameContent(): Promise<GameContent> {
  const { data } = await api.get('/game/content/');
  return data;
}

export async function startGameSession(): Promise<{
  session_id: string;
  started_at: string;
  assessment_tier: string;
}> {
  const { data } = await api.post('/game/start/');
  return data;
}

export async function fetchPremiumExtensionContent(sessionId: string): Promise<{
  session_id: string;
  scenario_questions: GameContent['scenario_questions'];
}> {
  const { data } = await api.get('/game/premium-extension/content/', {
    params: { session_id: sessionId },
  });
  return data;
}

export async function submitPremiumExtension(sessionId: string): Promise<{ session_id: string }> {
  const { data } = await api.post('/game/premium-extension/submit/', {
    session_id: sessionId,
  });
  return data;
}

export async function saveProgress(
  sessionId: string,
  email: string
): Promise<void> {
  await api.post('/game/save-progress/', {
    session_id: sessionId,
    email,
  });
}

export interface CreateAccountResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}

export async function createAccountFromSession(
  sessionId: string,
  email: string,
  password: string
): Promise<CreateAccountResponse> {
  const { data } = await api.post('/game/create-account/', {
    session_id: sessionId,
    email,
    password,
  });
  return data;
}

export async function logEvents(
  sessionId: string,
  events: GameEvent[]
): Promise<{ logged: number }> {
  const { data } = await api.post('/game/log-event/', {
    session_id: sessionId,
    events,
  });
  return data;
}

export async function submitSession(
  sessionId: string
): Promise<SessionResult> {
  const { data } = await api.post('/game/submit/', {
    session_id: sessionId,
  });
  return data;
}

export async function fetchSessionResult(
  sessionId: string
): Promise<SessionResult> {
  const { data } = await api.get(`/game/results/${sessionId}/`);
  return data;
}

export interface GameDashboardData {
  attempts: {
    id: string;
    is_complete: boolean;
    started_at: string;
    completed_at: string | null;
    created_at: string;
    resume_phase?: GamePhase;
    is_report_paid?: boolean;
    assessment_tier?: AssessmentTier;
    premium_unlocked?: boolean;
    premium_extension_complete?: boolean;
  }[];
  latest_result_session_id: string | null;
  latest_report_paid?: boolean;
}

export async function fetchGameDashboard(): Promise<GameDashboardData> {
  const { data } = await api.get('/game/dashboard/');
  return data;
}

export interface ResumeInfo {
  session: {
    session_id: string;
    started_at: string;
    resume_phase: GamePhase;
    /** Count of scenario answers logged; next question index (capped server-side if needed). */
    scenario_answer_index?: number;
    assessment_tier?: AssessmentTier;
  } | null;
}

export async function fetchResumeSession(): Promise<ResumeInfo> {
  const { data } = await api.get('/game/resume/');
  return data;
}

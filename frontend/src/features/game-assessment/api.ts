import { api } from '@/lib/api';
import type { GameContent, GameEvent, GamePhase, SessionResult } from './types';

export async function fetchGameContent(): Promise<GameContent> {
  const { data } = await api.get('/game/content/');
  return data;
}

export async function startGameSession(): Promise<{ session_id: string; started_at: string }> {
  const { data } = await api.post('/game/start/');
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
  } | null;
}

export async function fetchResumeSession(): Promise<ResumeInfo> {
  const { data } = await api.get('/game/resume/');
  return data;
}

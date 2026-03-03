import { api } from '@/lib/api';
import type { GameContent, GameEvent, SessionResult } from './types';

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

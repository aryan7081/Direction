import { create } from 'zustand';
import type { GamePhase, GameEvent, GameContent, SessionResult } from './types';

interface GameAssessmentState {
  sessionId: string | null;
  phase: GamePhase;
  content: GameContent | null;
  eventQueue: GameEvent[];
  result: SessionResult | null;
  loading: boolean;
  error: string | null;

  setSessionId: (id: string) => void;
  setPhase: (phase: GamePhase) => void;
  setContent: (content: GameContent) => void;
  pushEvent: (event: GameEvent) => void;
  drainEvents: () => GameEvent[];
  setResult: (result: SessionResult) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initial = {
  sessionId: null,
  phase: 'intro' as GamePhase,
  content: null,
  eventQueue: [] as GameEvent[],
  result: null,
  loading: false,
  error: null,
};

export const useGameStore = create<GameAssessmentState>((set, get) => ({
  ...initial,

  setSessionId: (id) => set({ sessionId: id }),
  setPhase: (phase) => set({ phase }),
  setContent: (content) => set({ content }),

  pushEvent: (event) =>
    set((s) => ({ eventQueue: [...s.eventQueue, event] })),

  drainEvents: () => {
    const events = get().eventQueue;
    set({ eventQueue: [] });
    return events;
  },

  setResult: (result) => set({ result }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set(initial),
}));

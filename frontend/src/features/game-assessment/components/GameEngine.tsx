'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Alert, Container } from '@mui/material';
import { PageLoader } from '@/components/ui/Loaders';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../store';
import {
  fetchGameContent,
  startGameSession,
  logEvents,
  submitSession,
  fetchResumeSession,
} from '../api';
import { GameProgressBar } from './GameProgressBar';
import { IntroScreen } from './IntroScreen';
import { LogicGame } from './LogicGame';
import { RiskSimulator } from './RiskSimulator';
import { PlannerGame } from './PlannerGame';
import { ScenarioSection } from './ScenarioSection';
import { ProcessingScreen } from './ProcessingScreen';
import type { GamePhase } from '../types';

const GAME_PHASES: GamePhase[] = ['logic', 'risk', 'planner', 'scenario'];

interface GameEngineProps {
  resumeSessionId?: string | null;
  viewSessionId?: string | null;
}

export function GameEngine({ resumeSessionId, viewSessionId }: GameEngineProps) {
  const router = useRouter();
  const {
    sessionId,
    phase,
    content,
    result,
    error,
    setSessionId,
    setPhase,
    setContent,
    drainEvents,
    setResult,
    setError,
    reset,
  } = useGameStore();

  const [subProgress, setSubProgress] = useState(0);
  const [initializing, setInitializing] = useState(true);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    reset();

    (async () => {
      try {
        if (viewSessionId) {
          setInitializing(false);
          router.replace(`/report?session=${viewSessionId}`);
          return;
        }

        const contentData = await fetchGameContent();
        setContent(contentData);

        if (resumeSessionId) {
          setSessionId(resumeSessionId);
          try {
            const resumeInfo = await fetchResumeSession();
            if (resumeInfo.session && resumeInfo.session.session_id === resumeSessionId) {
              const rp = resumeInfo.session.resume_phase;
              const validPhases: GamePhase[] = ['logic', 'risk', 'planner', 'scenario', 'processing'];
              setPhase(validPhases.includes(rp) ? rp : 'logic');
            } else {
              setPhase('logic');
            }
          } catch {
            setPhase('logic');
          }
        }
      } catch {
        setError('Failed to load. Please try again.');
      } finally {
        setInitializing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flushEvents = useCallback(async () => {
    if (!sessionId) return;
    const events = drainEvents();
    if (events.length > 0) {
      try {
        await logEvents(sessionId, events);
      } catch {
        setError('Failed to save progress. Please try again.');
      }
    }
  }, [sessionId, drainEvents, setError]);

  const handleStart = useCallback(async () => {
    try {
      const { session_id } = await startGameSession();
      setSessionId(session_id);
      setPhase('logic');
    } catch {
      setError('Failed to start session. Please try again.');
    }
  }, [setSessionId, setPhase, setError]);

  const advancePhase = useCallback(async () => {
    await flushEvents();
    const currentIdx = GAME_PHASES.indexOf(phase as GamePhase);
    if (currentIdx >= 0 && currentIdx < GAME_PHASES.length - 1) {
      setPhase(GAME_PHASES[currentIdx + 1]);
      setSubProgress(0);
    } else {
      setPhase('processing');
    }
  }, [flushEvents, phase, setPhase]);

  const handleProcessingDone = useCallback(async () => {
    if (!sessionId) return;
    try {
      await flushEvents();
      await submitSession(sessionId);
      router.replace(`/report?session=${sessionId}`);
    } catch {
      setError('Scoring failed. Please try again.');
      setPhase('scenario');
    }
  }, [sessionId, flushEvents, setPhase, setError, router]);

  if (initializing) {
    return <PageLoader message="Preparing your assessment..." />;
  }

  const bgTheme =
    phase === 'logic' ? 'logic'
    : phase === 'risk' ? 'risk'
    : phase === 'planner' ? 'planner'
    : phase === 'scenario' ? 'scenario'
    : 'dashboard';

  return (
    <Box sx={{ position: 'relative', minHeight: '80vh' }}>
      <AnimatedBackground theme={bgTheme} />
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {phase !== 'intro' && phase !== 'results' && (
          <GameProgressBar phase={phase} subProgress={subProgress} />
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
          >
            {phase === 'intro' && <IntroScreen onStart={handleStart} />}

            {phase === 'logic' && content && (
              <LogicGame tasks={content.logic_tasks} onComplete={advancePhase} onProgress={setSubProgress} />
            )}

            {phase === 'risk' && content && (
              <RiskSimulator scenarios={content.risk_scenarios} onComplete={advancePhase} onProgress={setSubProgress} />
            )}

            {phase === 'planner' && content && (
              <PlannerGame config={content.planner_config} onComplete={advancePhase} onProgress={setSubProgress} />
            )}

            {phase === 'scenario' && content && (
              <ScenarioSection questions={content.scenario_questions} onComplete={advancePhase} onProgress={setSubProgress} />
            )}

            {phase === 'processing' && <ProcessingScreen onDone={handleProcessingDone} />}
          </motion.div>
        </AnimatePresence>
      </Container>
    </Box>
  );
}

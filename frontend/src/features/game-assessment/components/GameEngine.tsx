'use client';

import { useEffect, useCallback, useState } from 'react';
import { Box, Alert, Container } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../store';
import { fetchGameContent, startGameSession, logEvents, submitSession } from '../api';
import { GameProgressBar } from './GameProgressBar';
import { IntroScreen } from './IntroScreen';
import { LogicGame } from './LogicGame';
import { RiskSimulator } from './RiskSimulator';
import { PlannerGame } from './PlannerGame';
import { ScenarioSection } from './ScenarioSection';
import { ProcessingScreen } from './ProcessingScreen';
import { GameResultsPage } from './GameResultsPage';
import type { GamePhase } from '../types';

const GAME_PHASES: GamePhase[] = ['logic', 'risk', 'planner', 'scenario'];

export function GameEngine() {
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

  useEffect(() => {
    reset();
    fetchGameContent()
      .then(setContent)
      .catch(() => setError('Failed to load game content'));
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
      const res = await submitSession(sessionId);
      setResult(res);
      setPhase('results');
    } catch {
      setError('Scoring failed. Please try again.');
      setPhase('scenario');
    }
  }, [sessionId, flushEvents, setResult, setPhase, setError]);

  if (!content && phase === 'intro') {
    return (
      <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
        Loading games...
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {phase !== 'intro' && phase !== 'results' && (
        <GameProgressBar phase={phase} subProgress={subProgress} />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35 }}
        >
          {phase === 'intro' && <IntroScreen onStart={handleStart} />}

          {phase === 'logic' && content && (
            <LogicGame tasks={content.logic_tasks} onComplete={advancePhase} />
          )}

          {phase === 'risk' && content && (
            <RiskSimulator scenarios={content.risk_scenarios} onComplete={advancePhase} />
          )}

          {phase === 'planner' && content && (
            <PlannerGame config={content.planner_config} onComplete={advancePhase} />
          )}

          {phase === 'scenario' && content && (
            <ScenarioSection questions={content.scenario_questions} onComplete={advancePhase} />
          )}

          {phase === 'processing' && <ProcessingScreen onDone={handleProcessingDone} />}

          {phase === 'results' && result && <GameResultsPage result={result} />}
        </motion.div>
      </AnimatePresence>
    </Container>
  );
}

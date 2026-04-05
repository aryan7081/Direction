'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Box, Alert, Button, Container, Typography } from '@mui/material';
import { PageLoader } from '@/components/ui/Loaders';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../store';
import { useAuthStore } from '@/stores/authStore';
import { googleAuth } from '@/features/auth/api';
import {
  fetchGameContent,
  startGameSession,
  logEvents,
  submitSession,
  fetchResumeSession,
  fetchPremiumExtensionContent,
  submitPremiumExtension,
} from '../api';
import { GameProgressBar } from './GameProgressBar';
import { IntroScreen } from './IntroScreen';
import { LogicGame } from './LogicGame';
import { SaveProgressScreen } from './SaveProgressScreen';
import { RiskSimulator } from './RiskSimulator';
import { PlannerGame } from './PlannerGame';
import { ScenarioSection } from './ScenarioSection';
import { ProcessingScreen } from './ProcessingScreen';
import { DirectionalSnapshotModal } from './DirectionalSnapshotModal';
import type { GamePhase } from '../types';

const GAME_PHASES: GamePhase[] = ['scenario'];

interface GameEngineProps {
  resumeSessionId?: string | null;
  viewSessionId?: string | null;
  /** After ₹99 bundle: continue with premium-only questions for this session. */
  premiumContinueSessionId?: string | null;
}

export function GameEngine({
  resumeSessionId,
  viewSessionId,
  premiumContinueSessionId,
}: GameEngineProps) {
  if (premiumContinueSessionId) {
    return <PremiumExtensionEngine sessionId={premiumContinueSessionId} />;
  }
  return (
    <MainAssessmentEngine resumeSessionId={resumeSessionId} viewSessionId={viewSessionId} />
  );
}

/** Extra questions after premium bundle payment (authenticated). */
function PremiumExtensionEngine({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const {
    phase,
    error,
    scenarioStartIndex,
    scenarioGateCompletedCount,
    setSessionId,
    setPhase,
    drainEvents,
    setError,
    setScenarioStartIndex,
    setScenarioGateCompletedCount,
    reset,
  } = useGameStore();

  const [subProgress, setSubProgress] = useState(0);
  const [initializing, setInitializing] = useState(true);
  const initDoneRef = useRef(false);

  const { data, isLoading, error: qError } = useQuery({
    queryKey: ['game-premium-extension', sessionId],
    queryFn: () => fetchPremiumExtensionContent(sessionId),
    enabled: !!sessionId && !!user,
    retry: false,
  });

  useEffect(() => {
    if (!user || !data || initDoneRef.current) return;
    initDoneRef.current = true;
    reset();
    setSessionId(sessionId);
    setPhase('scenario');
    setScenarioStartIndex(0);
    setScenarioGateCompletedCount(0);
    setSubProgress(0);
    setInitializing(false);
  }, [user, data, sessionId, reset, setSessionId, setPhase, setScenarioStartIndex, setScenarioGateCompletedCount]);

  const flushEvents = useCallback(async () => {
    const events = drainEvents();
    if (events.length > 0) {
      try {
        await logEvents(sessionId, events);
      } catch {
        setError('Failed to save progress. Please try again.');
      }
    }
  }, [sessionId, drainEvents, setError]);

  const advancePhase = useCallback(async () => {
    await flushEvents();
    setPhase('processing');
  }, [flushEvents, setPhase]);

  const handleProcessingDone = useCallback(async () => {
    try {
      await flushEvents();
      await submitPremiumExtension(sessionId);
      router.replace(`/report?session=${sessionId}`);
    } catch {
      setError('Could not update your profile. Please try again.');
      setPhase('scenario');
    }
  }, [sessionId, flushEvents, setPhase, setError, router]);

  const handleScenarioAuthGate = useCallback(
    async (resumeAtIndex: number, completedCount: number) => {
      await flushEvents();
      setScenarioStartIndex(resumeAtIndex);
      setScenarioGateCompletedCount(completedCount);
      const qLen = data?.scenario_questions?.length ?? 20;
      setSubProgress(completedCount / qLen);
      setPhase('save_progress');
    },
    [flushEvents, data, setScenarioStartIndex, setScenarioGateCompletedCount, setPhase]
  );

  const [linkingAccount, setLinkingAccount] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const handleGoogleSignIn = useCallback(
    async (credential: string) => {
      setLinkingAccount(true);
      try {
        const res = await googleAuth(credential, sessionId);
        setAuth(res.user, res.access, res.refresh);
        const idx = useGameStore.getState().scenarioStartIndex;
        const qLen = data?.scenario_questions?.length ?? 20;
        setSubProgress(Math.min(idx, qLen) / qLen);
        setPhase('scenario');
      } catch {
        setError('Sign in failed. Please try again.');
      } finally {
        setLinkingAccount(false);
      }
    },
    [sessionId, setPhase, setError, setAuth, data]
  );

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Typography sx={{ mb: 2, fontWeight: 700 }}>Sign in required</Typography>
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          Sign in to continue your premium assessment for this session.
        </Typography>
        <Button variant="contained" href="/login" sx={{ textTransform: 'none' }}>
          Go to sign in
        </Button>
      </Container>
    );
  }

  if (qError || (!isLoading && !data)) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {(qError as Error)?.message || 'Could not load premium questions. Check payment or try again.'}
        </Alert>
        <Button variant="outlined" onClick={() => router.push(`/report?session=${sessionId}`)}>
          Back to results
        </Button>
      </Container>
    );
  }

  if (initializing || isLoading || !data) {
    return <PageLoader message="Loading premium questions..." />;
  }

  const qCount = data.scenario_questions.length;

  return (
    <Box sx={{ position: 'relative', minHeight: '80vh' }}>
      <AnimatedBackground theme="scenario" />
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 }, position: 'relative', zIndex: 2 }}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {phase !== 'processing' && (
          <GameProgressBar phase={phase} subProgress={subProgress} scenarioQuestionTotal={qCount} />
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
          >
            {phase === 'save_progress' && (
              <SaveProgressScreen
                onGoogleSignIn={handleGoogleSignIn}
                loading={linkingAccount}
                questionsCompleted={scenarioGateCompletedCount || 5}
              />
            )}
            {phase === 'scenario' && (
              <ScenarioSection
                questions={data.scenario_questions}
                startIndex={scenarioStartIndex}
                isAuthenticated={!!user}
                onAuthGate={handleScenarioAuthGate}
                onComplete={advancePhase}
                onProgress={setSubProgress}
              />
            )}
            {phase === 'processing' && <ProcessingScreen onDone={handleProcessingDone} />}
          </motion.div>
        </AnimatePresence>
      </Container>
    </Box>
  );
}

function MainAssessmentEngine({
  resumeSessionId,
  viewSessionId,
}: {
  resumeSessionId?: string | null;
  viewSessionId?: string | null;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = !!user;
  const {
    sessionId,
    phase,
    content,
    error,
    scenarioStartIndex,
    scenarioGateCompletedCount,
    setSessionId,
    setPhase,
    setContent,
    drainEvents,
    setError,
    setScenarioStartIndex,
    setScenarioGateCompletedCount,
    reset,
  } = useGameStore();

  const [subProgress, setSubProgress] = useState(0);
  const [initializing, setInitializing] = useState(true);
  const initDoneRef = useRef(false);

  const needsResumeData = Boolean(resumeSessionId && isAuthenticated);

  const { data: resumeInfo, isFetched: resumeFetched } = useQuery({
    queryKey: ['game-resume'],
    queryFn: fetchResumeSession,
    enabled: needsResumeData,
    staleTime: 60 * 1000,
  });

  const contentQueryEnabled = !needsResumeData || resumeFetched;

  const { data: contentData } = useQuery({
    queryKey: ['game-content', 'free'],
    queryFn: fetchGameContent,
    enabled: contentQueryEnabled,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (contentData) setContent(contentData);
  }, [contentData, setContent]);

  useEffect(() => {
    if (viewSessionId) {
      setInitializing(false);
      router.replace(`/report?session=${viewSessionId}`);
      return;
    }

    if (!contentData || !contentQueryEnabled) return;

    if (initDoneRef.current) return;
    initDoneRef.current = true;

    reset();
    setContent(contentData);

    (async () => {
      try {
        if (resumeSessionId) {
          setSessionId(resumeSessionId);
          if (isAuthenticated) {
            try {
              const ri = resumeInfo;
              if (ri?.session && ri.session.session_id === resumeSessionId) {
                const rp = ri.session.resume_phase;
                const validPhases: GamePhase[] = ['scenario', 'processing'];
                setPhase(
                  validPhases.includes(rp as GamePhase) ? (rp as GamePhase) : 'scenario'
                );
                const idx = ri.session.scenario_answer_index ?? 0;
                const qLen = contentData.scenario_questions?.length ?? 1;
                const maxIndex = Math.max(0, qLen - 1);
                setScenarioStartIndex(Math.min(idx, maxIndex));
                setSubProgress(qLen > 0 ? Math.min(idx, qLen) / qLen : 0);
              } else {
                setPhase('scenario');
              }
            } catch {
              setPhase('scenario');
            }
          } else {
            setPhase('scenario');
          }
        }
      } catch {
        setError('Failed to load. Please try again.');
      } finally {
        setInitializing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentData, contentQueryEnabled, viewSessionId, resumeSessionId, isAuthenticated, resumeInfo]);

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

  const activeContent = content ?? contentData;
  const scenarioQCount = activeContent?.scenario_questions?.length ?? 30;

  const handleScenarioAuthGate = useCallback(
    async (resumeAtIndex: number, completedCount: number) => {
      await flushEvents();
      setScenarioStartIndex(resumeAtIndex);
      setScenarioGateCompletedCount(completedCount);
      const qLen = activeContent?.scenario_questions.length ?? 30;
      setSubProgress(completedCount / qLen);
      setPhase('save_progress');
    },
    [
      flushEvents,
      activeContent,
      setScenarioStartIndex,
      setScenarioGateCompletedCount,
      setPhase,
    ]
  );

  const handleStart = useCallback(async () => {
    try {
      const result = await startGameSession();
      setSessionId(result.session_id);
      setScenarioStartIndex(0);
      setScenarioGateCompletedCount(0);
      setSubProgress(0);
      setPhase('scenario');
    } catch (err: unknown) {
      const msg = String(err instanceof Error ? err.message : err);
      const code = (err as { code?: string })?.code;
      const isNetwork =
        code === 'ERR_NETWORK' ||
        /network|failed|fetch|connection|refused/i.test(msg);
      setError(
        isNetwork
          ? 'Cannot reach server. Ensure backend runs with: python manage.py runserver 0.0.0.0:8000'
          : 'Failed to start session. Please try again.'
      );
    }
  }, [setSessionId, setPhase, setError, setScenarioStartIndex, setScenarioGateCompletedCount]);

  const advancePhase = useCallback(async () => {
    await flushEvents();
    const currentIdx = GAME_PHASES.indexOf(phase as GamePhase);
    if (currentIdx >= 0 && currentIdx < GAME_PHASES.length - 1) {
      const nextPhase = GAME_PHASES[currentIdx + 1];
      setPhase(nextPhase);
      setSubProgress(0);
    } else {
      setPhase('processing');
    }
  }, [flushEvents, phase, setPhase]);

  const handleLogicComplete = useCallback(async () => {
    await flushEvents();
    setSubProgress(0);
    setPhase('scenario');
  }, [flushEvents, setPhase]);

  const [linkingAccount, setLinkingAccount] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const handleGoogleSignIn = useCallback(
    async (credential: string) => {
      if (!sessionId) return;
      setLinkingAccount(true);
      try {
        const res = await googleAuth(credential, sessionId);
        setAuth(res.user, res.access, res.refresh);
        const idx = useGameStore.getState().scenarioStartIndex;
        const qLen = activeContent?.scenario_questions.length ?? 30;
        setSubProgress(Math.min(idx, qLen) / qLen);
        setPhase('scenario');
      } catch {
        setError('Sign in failed. Please try again.');
      } finally {
        setLinkingAccount(false);
      }
    },
    [sessionId, setPhase, setError, setAuth, activeContent]
  );

  const handleProcessingDone = useCallback(async () => {
    if (!sessionId) return;
    try {
      await flushEvents();
      await submitSession(sessionId);
      setPhase('results');
    } catch {
      setError('Scoring failed. Please try again.');
      setPhase('scenario');
    }
  }, [sessionId, flushEvents, setPhase, setError]);

  const handleDirectionalSnapshotContinue = useCallback(() => {
    if (!sessionId) return;
    router.replace(`/report?session=${sessionId}`);
  }, [sessionId, router]);

  if (!contentQueryEnabled || initializing || !contentData) {
    return <PageLoader message="Preparing your assessment..." />;
  }

  const bgTheme =
    phase === 'logic' || phase === 'save_progress'
      ? 'logic'
      : phase === 'risk'
        ? 'risk'
        : phase === 'planner'
          ? 'planner'
          : phase === 'scenario'
            ? 'scenario'
            : 'dashboard';

  return (
    <Box sx={{ position: 'relative', minHeight: '80vh' }}>
      <DirectionalSnapshotModal
        open={phase === 'results' && !!sessionId}
        onContinue={handleDirectionalSnapshotContinue}
      />
      <AnimatedBackground theme={bgTheme} />
      <Container
        maxWidth="md"
        sx={{
          py: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 3 },
          position: 'relative',
          zIndex: 2,
          isolation: 'isolate',
        }}
      >
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {phase !== 'intro' && phase !== 'results' && (
          <GameProgressBar
            phase={phase}
            subProgress={subProgress}
            scenarioQuestionTotal={scenarioQCount}
          />
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
          >
            {phase === 'intro' && (
              <IntroScreen questionCounts={contentData.question_counts} onStart={handleStart} />
            )}

            {phase === 'logic' && activeContent && (
              <LogicGame
                tasks={activeContent.logic_tasks}
                onComplete={handleLogicComplete}
                onProgress={setSubProgress}
              />
            )}

            {phase === 'save_progress' && (
              <SaveProgressScreen
                onGoogleSignIn={handleGoogleSignIn}
                loading={linkingAccount}
                questionsCompleted={
                  scenarioGateCompletedCount || activeContent?.logic_tasks?.length || 5
                }
              />
            )}

            {phase === 'risk' && activeContent && (
              <RiskSimulator
                scenarios={activeContent.risk_scenarios}
                onComplete={advancePhase}
                onProgress={setSubProgress}
              />
            )}

            {phase === 'planner' && activeContent && (
              <PlannerGame
                config={activeContent.planner_config}
                onComplete={advancePhase}
                onProgress={setSubProgress}
              />
            )}

            {phase === 'scenario' && activeContent && (
              <ScenarioSection
                questions={activeContent.scenario_questions}
                startIndex={scenarioStartIndex}
                isAuthenticated={isAuthenticated}
                onAuthGate={handleScenarioAuthGate}
                onComplete={advancePhase}
                onProgress={setSubProgress}
              />
            )}

            {phase === 'processing' && <ProcessingScreen onDone={handleProcessingDone} />}
          </motion.div>
        </AnimatePresence>
      </Container>
    </Box>
  );
}

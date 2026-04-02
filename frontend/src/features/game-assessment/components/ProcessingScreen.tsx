'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const ANALYSIS_STEPS = [
  { label: 'Analyzing your RIASEC interests...', icon: '🎯', trait: 'Realistic · Investigative · Artistic · Social · Enterprising · Conventional' },
  { label: 'Measuring your core work traits...', icon: '🧠', trait: 'Curiosity · Persistence · Initiative · Empathy · Planning' },
  { label: 'Reading your personality style...', icon: '✨', trait: 'Energy · Risk · Structure · Direction' },
  { label: 'Matching against 127+ career paths...', icon: '💼', trait: 'Computing match scores across all career profiles' },
  { label: 'Identifying your best-fit stream...', icon: '🎓', trait: 'Science · Commerce · Arts · Humanities' },
  { label: 'Building your personalized report...', icon: '📊', trait: 'Trait analysis · Career cards · Development roadmap' },
];

const TOTAL_DURATION = 7000;
const STEP_DURATION = TOTAL_DURATION / ANALYSIS_STEPS.length;

export function ProcessingScreen({ onDone }: { onDone: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / TOTAL_DURATION) * 100, 100);
      setProgress(pct);

      const step = Math.min(Math.floor(elapsed / STEP_DURATION), ANALYSIS_STEPS.length - 1);
      setCurrentStep(step);

      if (elapsed >= TOTAL_DURATION) {
        clearInterval(progressInterval);
      }
    }, 50);

    const doneTimer = setTimeout(onDone, TOTAL_DURATION + 500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 480, textAlign: 'center', gap: 4, px: 2 }}>
      {/* Animated radar/pulse visualization */}
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
        <Box sx={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Outer pulse rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: '2px solid', borderColor: i === 0 ? '#16a34a' : i === 1 ? '#6366f1' : '#3b82f6',
              }}
              animate={{ scale: [1, 1.5 + i * 0.2], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
            />
          ))}

          {/* Inner spinning arcs */}
          <motion.div
            style={{ position: 'absolute', width: 100, height: 100, borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#16a34a', borderRightColor: '#6366f1' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            style={{ position: 'absolute', width: 72, height: 72, borderRadius: '50%', border: '2px solid transparent', borderBottomColor: '#3b82f6', borderLeftColor: '#f59e0b' }}
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          {/* Center icon */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ fontSize: 36, zIndex: 1 }}
            >
              {ANALYSIS_STEPS[currentStep].icon}
            </motion.div>
          </AnimatePresence>
        </Box>
      </motion.div>

      {/* Step label */}
      <Box sx={{ minHeight: 80 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.05rem', sm: '1.15rem' }, color: '#111827', mb: 0.5 }}>
              {ANALYSIS_STEPS[currentStep].label}
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#6b7280', fontWeight: 500 }}>
              {ANALYSIS_STEPS[currentStep].trait}
            </Typography>
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Progress bar */}
      <Box sx={{ width: '100%', maxWidth: 360 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6, borderRadius: 3, bgcolor: '#e5e7eb',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              background: 'linear-gradient(90deg, #16a34a, #6366f1)',
              transition: 'transform 0.1s linear',
            },
          }}
        />
        <Typography sx={{ mt: 1, fontSize: '0.78rem', color: '#9ca3af', fontWeight: 600 }}>
          {Math.round(progress)}% complete
        </Typography>
      </Box>

      {/* Completed steps trail */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 320 }}>
        {ANALYSIS_STEPS.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={i <= currentStep ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
          >
            <Box
              sx={{
                width: 32, height: 32, borderRadius: '50%',
                bgcolor: i < currentStep ? '#ecfdf5' : i === currentStep ? '#f0fdf4' : '#f3f4f6',
                border: i < currentStep ? '2px solid #16a34a' : i === currentStep ? '2px solid #6366f1' : '1px solid #e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: i < currentStep ? 12 : 14,
                transition: 'all 0.3s ease',
              }}
            >
              {i < currentStep ? '✓' : step.icon}
            </Box>
          </motion.div>
        ))}
      </Box>

      <Typography sx={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 500, fontStyle: 'italic' }}>
        Your profile is unique — this takes a moment to get right
      </Typography>
    </Box>
  );
}

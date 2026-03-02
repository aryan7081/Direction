'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  getQuestions,
  startAssessment,
  submitAssessment,
} from './api';
import { Box, Button, Card, CardContent, Typography, RadioGroup, FormControlLabel, Radio, LinearProgress } from '@mui/material';
import type { Question } from '@/types';

export function AssessmentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [started, setStarted] = useState(false);

  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ['questions'],
    queryFn: getQuestions,
  });

  const startMutation = useMutation({
    mutationFn: startAssessment,
    onSuccess: (data) => {
      setAttemptId(data.attempt_id);
      setStarted(true);
    },
  });

  const submitMutation = useMutation({
    mutationFn: ({ attemptId, responses }: { attemptId: number; responses: { question_id: number; answer_option_id: number }[] }) =>
      submitAssessment(
        attemptId,
        responses.map((r) => ({ question_id: r.question_id, answer_option_id: r.answer_option_id }))
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.push(`/result?attempt=${variables.attemptId}`);
    },
  });

  const handleStart = () => {
    if (!attemptId) startMutation.mutate();
    else setStarted(true);
  };

  const handleSelect = (qId: number, optId: number) => {
    setResponses((prev) => ({ ...prev, [qId]: optId }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleSubmit = () => {
    if (!attemptId) return;
    const resps = Object.entries(responses).map(([qId, optId]) => ({
      question_id: parseInt(qId, 10),
      answer_option_id: optId,
    }));
    if (resps.length !== questions.length) return;
    submitMutation.mutate({ attemptId, responses: resps });
  };

  const currentQ = questions[currentIndex] as Question | undefined;
  const answeredCount = Object.keys(responses).length;
  const canSubmit = answeredCount === questions.length && questions.length > 0;

  if (questionsLoading || !started) {
    return (
      <Box sx={{ maxWidth: 640, mx: 'auto', p: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom>Career Assessment</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Answer {questions.length} questions to discover careers that match your interests.
            </Typography>
            <Button variant="contained" color="primary" size="large" fullWidth onClick={handleStart} disabled={startMutation.isPending}>
              {startMutation.isPending ? 'Starting...' : 'Start Assessment'}
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', p: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">Question {currentIndex + 1} of {questions.length}</Typography>
          <Typography variant="body2" color="text.secondary">{answeredCount} answered</Typography>
        </Box>
        <LinearProgress variant="determinate" value={questions.length ? (answeredCount / questions.length) * 100 : 0} sx={{ height: 8, borderRadius: 1 }} color="primary" />
      </Box>

      <Card>
        <CardContent>
          {currentQ && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{currentQ.category?.name}</Typography>
              <Typography variant="h6" sx={{ mb: 3 }}>{currentQ.text}</Typography>
              <RadioGroup
                value={responses[currentQ.id] != null ? String(responses[currentQ.id]) : ''}
                onChange={(_, val) => handleSelect(currentQ.id, Number(val))}
              >
                {(Array.isArray(currentQ.answer_options) ? currentQ.answer_options : []).map((opt, idx) => (
                  <FormControlLabel
                    key={opt.id}
                    value={opt.id}
                    control={<Radio />}
                    label={`${String.fromCharCode(65 + idx)}. ${opt.text}`}
                    sx={{
                      m: 0,
                      mb: 1.5,
                      p: 1.5,
                      borderRadius: 1,
                      border: 1,
                      borderColor: responses[currentQ.id] === opt.id ? 'primary.main' : 'divider',
                      bgcolor: responses[currentQ.id] === opt.id ? 'primary.light' : 'background.paper',
                      color: responses[currentQ.id] === opt.id ? 'primary.dark' : 'text.primary',
                      '& .MuiFormControlLabel-label': { color: 'inherit' },
                      '& .MuiRadio-root': { color: 'inherit' },
                    }}
                  />
                ))}
              </RadioGroup>
            </>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button onClick={handlePrev} disabled={currentIndex === 0}>
              Previous
            </Button>
            {currentIndex < questions.length - 1 ? (
              <Button variant="contained" color="primary" onClick={handleNext}>Next</Button>
            ) : (
              <Button variant="contained" color="primary" onClick={handleSubmit} disabled={!canSubmit}>
                {submitMutation.isPending ? 'Submitting...' : 'Submit & See Results'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

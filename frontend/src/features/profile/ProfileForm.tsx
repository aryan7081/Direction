'use client';

import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  FormHelperText,
} from '@mui/material';
import { updateProfile, type Profile, type ProfileUpdate } from './api';
import { ButtonSpinner } from '@/components/ui/Loaders';

const FINANCIAL_TIERS = [
  { value: '', label: 'Not specified' },
  { value: 'low', label: 'Limited (need scholarships/vocational options)' },
  { value: 'medium', label: 'Moderate (can afford degree courses)' },
  { value: 'high', label: 'Comfortable (can afford premium education)' },
  { value: 'prefer_not', label: 'Prefer not to say' },
];

const SUBJECTS = [
  { slug: 'math', label: 'Mathematics' },
  { slug: 'science', label: 'Science' },
  { slug: 'english', label: 'English' },
  { slug: 'social_science', label: 'Social Science' },
] as const;

function hasProfileData(profile: Profile | null): boolean {
  if (!profile) return false;
  if (profile.financial_tier) return true;
  const marks = profile.subject_marks || {};
  return Object.keys(marks).length > 0;
}

export function ProfileForm({ profile, onSuccess }: { profile: Profile | null; onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    if (profile != null) {
      setShowForm(!hasProfileData(profile));
    }
  }, [profile]);

  useEffect(
    () => () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    },
    []
  );
  const [successMessage, setSuccessMessage] = useState(false);
  const [financialTier, setFinancialTier] = useState(profile?.financial_tier ?? '');
  const [marks, setMarks] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    for (const s of SUBJECTS) {
      m[s.slug] = profile?.subject_marks?.[s.slug] != null ? String(profile.subject_marks[s.slug]) : '';
    }
    return m;
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFinancialTier(profile?.financial_tier ?? '');
    if (profile?.subject_marks) {
      const m: Record<string, string> = {};
      for (const s of SUBJECTS) {
        m[s.slug] = profile.subject_marks[s.slug] != null ? String(profile.subject_marks[s.slug]) : '';
      }
      setMarks(m);
    }
  }, [profile]);

  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: ProfileUpdate) => updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setError(null);
      setSuccessMessage(true);
      setShowForm(false);
      onSuccess?.();
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSuccessMessage(false), 4000);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.detail || err?.message || 'Failed to save');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(false);

    const subject_marks: Record<string, number> = {};
    for (const s of SUBJECTS) {
      const val = marks[s.slug]?.trim();
      if (val) {
        const num = parseFloat(val);
        if (isNaN(num) || num < 0 || num > 100) {
          setError(`${s.label} must be between 0 and 100`);
          return;
        }
        subject_marks[s.slug] = num;
      }
    }

    mutation.mutate({
      financial_tier: financialTier || undefined,
      subject_marks: Object.keys(subject_marks).length > 0 ? subject_marks : undefined,
    });
  };

  const profileHasData = hasProfileData(profile);

  if (!showForm) {
    return (
      <Box
        sx={{
          bgcolor: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(12px)',
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.06)',
          p: { xs: 2.5, sm: 3.5 },
        }}
      >
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccessMessage(false)}>
            Saved successfully!
          </Alert>
        )}
        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827', mb: 0.5 }}>
          Your Profile
        </Typography>
        <Typography sx={{ color: '#6b7280', mb: 2, fontSize: '0.9rem' }}>
          {profileHasData
            ? 'Your profile is saved. Recommendations will use your financial situation and subject marks.'
            : 'Your profile has been saved.'}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setShowForm(true)}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: 'rgba(0,0,0,0.15)', color: '#374151' }}
        >
          Edit profile
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        borderRadius: 3,
        border: '1px solid rgba(0,0,0,0.06)',
        p: { xs: 2.5, sm: 3.5 },
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827', mb: 0.5 }}>
        Your Profile
      </Typography>
      <Typography sx={{ color: '#6b7280', mb: 2, fontSize: '0.9rem' }}>
        Add your financial situation and latest subject marks for better recommendations.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && (
          <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <FormControl size="small">
          <InputLabel>Family financial situation</InputLabel>
          <Select
            value={financialTier}
            label="Family financial situation"
            onChange={(e) => setFinancialTier(e.target.value)}
          >
            {FINANCIAL_TIERS.map((t) => (
              <MenuItem key={t.value || 'none'} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Affects which careers we recommend</FormHelperText>
        </FormControl>

        <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#374151', mt: 1 }}>
          Latest subject marks (% – leave blank if unknown)
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {SUBJECTS.map((s) => (
            <TextField
              key={s.slug}
              size="small"
              label={s.label}
              type="number"
              inputProps={{ min: 0, max: 100, step: 0.5 }}
              value={marks[s.slug] ?? ''}
              onChange={(e) => setMarks((prev) => ({ ...prev, [s.slug]: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          ))}
        </Box>

        <Button
          type="submit"
          variant="contained"
          disabled={mutation.isPending}
          sx={{
            alignSelf: 'flex-start',
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            boxShadow: '0 4px 14px rgba(22,163,74,0.2)',
            '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)' },
          }}
        >
          {mutation.isPending ? <><ButtonSpinner /> Saving...</> : 'Save profile'}
        </Button>
      </Box>
    </Box>
  );
}

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Box, Button, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { PageLoader, ButtonSpinner } from '@/components/ui/Loaders';
import { fetchCareerReport, downloadReportPdf } from './api';
import { HeroSection } from './components/HeroSection';
import { StreamSection } from './components/StreamSection';
import { SubjectRecommendationSection } from './components/SubjectRecommendation';
import { DominantPattern } from './components/DominantPattern';
import { InterestProfile } from './components/InterestProfile';
import { WorkDNA } from './components/WorkDNA';
import { PersonalityStyle } from './components/PersonalityStyle';
import { WorkingStyleSection } from './components/WorkingStyleSection';
import { CareerCards } from './components/CareerCards';
import { CareerComparison } from './components/CareerComparison';
import { LessNaturalCareers } from './components/LessNaturalCareers';
import { DevelopmentRoadmap } from './components/DevelopmentRoadmap';
import { AreasToImprove } from './components/AreasToImprove';
import { NextSteps } from './components/NextSteps';

export function CareerReportPage({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const { data: report, isLoading, error } = useQuery({
    queryKey: ['career-report', sessionId],
    queryFn: () => fetchCareerReport(sessionId),
    enabled: !!sessionId,
  });

  const handleDownloadPdf = async () => {
    setDownloadError(null);
    setDownloading(true);
    try {
      await downloadReportPdf(sessionId);
    } catch {
      setDownloadError('PDF generation failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return <PageLoader message="Generating your career report..." />;
  }

  if (error || !report) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography color="error" gutterBottom>
          Failed to load report. The session may not be completed yet.
        </Typography>
        <Button variant="outlined" onClick={() => router.push('/dashboard')} sx={{ mt: 2 }}>
          Go to Dashboard
        </Button>
      </Container>
    );
  }

  const studentName = report.student?.name || 'Student';

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
      {/* ── Back link ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
        <Button
          size="small"
          onClick={() => router.push('/dashboard')}
          sx={{ fontWeight: 500, mb: 2 }}
        >
          ← Back to Dashboard
        </Button>
      </motion.div>

      {/* ── Student header ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', fontSize: { xs: '1.5rem', sm: '2rem' } }}
          >
            Career Intelligence Report
          </Typography>
          <Typography sx={{ color: '#6b7280', fontSize: '0.95rem', mt: 0.5 }}>
            Prepared for <Box component="span" sx={{ fontWeight: 700, color: '#111827' }}>{studentName}</Box>
            {report.student?.grade && <> · {report.student.grade}</>}
            {report.student?.school && <> · {report.student.school}</>}
          </Typography>
          <Typography sx={{ color: '#9ca3af', fontSize: '0.8rem', mt: 0.5 }}>
            {report.generated_at && `Generated on ${report.generated_at}`}
            {report.completed_at && ` · Assessment completed ${report.completed_at}`}
          </Typography>
          <Typography sx={{ color: '#9ca3af', fontSize: '0.72rem', mt: 0.5 }}>
            Assessed across 15 scientifically-backed dimensions · 30 questions · RIASEC + Work Traits + Personality
          </Typography>
        </Box>
      </motion.div>

      {/* ── PDF Download ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            p: { xs: 2, sm: 2.5 },
            mb: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)',
            border: '1px solid #d1fae5',
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>
              📄 Download Your Report as PDF
            </Typography>
            <Typography sx={{ color: '#6b7280', fontSize: '0.8rem' }}>
              Save, print, or share with parents and school counsellors
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleDownloadPdf}
            disabled={downloading}
            sx={{
              borderRadius: 2, minHeight: 44, minWidth: 180, textTransform: 'none', fontWeight: 700,
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              boxShadow: '0 4px 14px rgba(22,163,74,0.25)',
              '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)' },
            }}
          >
            {downloading ? <><ButtonSpinner size={18} /> Generating...</> : '⬇ Download PDF'}
          </Button>
        </Box>
        {downloadError && (
          <Typography color="error" variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
            {downloadError}
          </Typography>
        )}
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1: THE BIG ANSWERS
          What career? What stream? What subjects?
         ══════════════════════════════════════════════════════════════ */}

      <HeroSection hero={report.hero} />

      <StreamSection streamRecommendation={report.stream_recommendation} />

      {report.subject_recommendation && (
        <SubjectRecommendationSection
          recommendation={report.subject_recommendation}
          stream={report.stream_recommendation?.stream || ''}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2: YOUR PROFILE
          Who you are across 15 dimensions
         ══════════════════════════════════════════════════════════════ */}

      {report.dominant_pattern && (
        <DominantPattern pattern={report.dominant_pattern} />
      )}

      {report.interest_profile && (
        <InterestProfile profile={report.interest_profile} />
      )}

      {report.core_traits && report.core_traits.length > 0 && (
        <WorkDNA traits={report.core_traits} />
      )}

      {report.personality_style && report.personality_style.length > 0 && (
        <PersonalityStyle dimensions={report.personality_style} />
      )}

      {report.working_style && report.working_style.length > 0 && (
        <WorkingStyleSection items={report.working_style} />
      )}

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3: CAREER MATCHES
          Detailed career cards and comparison
         ══════════════════════════════════════════════════════════════ */}

      <CareerCards careers={report.careers} />

      <CareerComparison careers={report.careers} comparisonText={report.career_comparison_text} />

      {report.less_natural_careers && report.less_natural_careers.length > 0 && (
        <LessNaturalCareers items={report.less_natural_careers} />
      )}

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4: YOUR GROWTH PATH
          Roadmap, areas to improve, next steps
         ══════════════════════════════════════════════════════════════ */}

      <DevelopmentRoadmap roadmap={report.roadmap} />

      <AreasToImprove areas={report.areas_to_improve} />

      <NextSteps
        stream={report.stream_recommendation?.stream}
        topCareer={report.hero?.career_name}
      />

      {/* ── Disclaimer ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f9fafb', border: '1px solid #e5e7eb', mb: 4 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', lineHeight: 1.6 }}>
            {report.disclaimer}
          </Typography>
        </Box>
      </motion.div>

      {/* ── Share with parents / WhatsApp ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <Box
          sx={{
            p: { xs: 2.5, sm: 3 }, borderRadius: 3,
            background: 'linear-gradient(135deg, #ecfdf5 0%, #eff6ff 100%)',
            border: '1px solid #d1fae5', mb: 4, textAlign: 'center',
          }}
        >
          <Typography sx={{ fontWeight: 700, color: '#111827', mb: 0.5, fontSize: '1rem' }}>
            📱 Share with your parents
          </Typography>
          <Typography sx={{ color: '#6b7280', fontSize: '0.85rem', mb: 2, lineHeight: 1.6 }}>
            Send a quick summary to your parents or counsellor on WhatsApp
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              const topCareer = report.hero?.career_name || 'my career match';
              const topCat = report.hero?.career_category;
              const stream = report.stream_recommendation?.stream || 'my recommended stream';
              const holland = report.interest_profile?.holland_code || '';
              const text = encodeURIComponent(
                `🎓 I just took a career assessment on Outcave!\n\n` +
                `My recommended stream: ${stream}\n` +
                (topCat ? `Career field: ${topCat}\n` : '') +
                `My #1 career match: ${topCareer}\n` +
                `${holland ? `My Holland Code: ${holland}\n` : ''}` +
                `\nThe report has my full 15-dimension profile, career matches, and a development roadmap.\n\n` +
                `Try it free: ${window.location.origin}/game-assessment`
              );
              window.open(`https://wa.me/?text=${text}`, '_blank');
            }}
            sx={{
              bgcolor: '#25D366', textTransform: 'none', fontWeight: 700,
              borderRadius: 2, px: 3, '&:hover': { bgcolor: '#1eb954' },
            }}
          >
            Share on WhatsApp
          </Button>
        </Box>
      </motion.div>

      {/* ── Bottom actions ── */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 6, flexWrap: 'wrap' }}>
        <Button variant="outlined" onClick={() => router.push('/dashboard')} sx={{ borderRadius: 2 }}>
          Back to Dashboard
        </Button>
        <Button
          variant="contained" onClick={handleDownloadPdf} disabled={downloading}
          sx={{ borderRadius: 2 }}
        >
          {downloading ? <><ButtonSpinner size={18} /> Generating...</> : 'Download PDF Report'}
        </Button>
        <Button variant="outlined" onClick={() => router.push('/careers')} sx={{ borderRadius: 2 }}>
          Explore All Careers
        </Button>
      </Box>
    </Container>
  );
}

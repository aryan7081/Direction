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
import { DominantPattern } from './components/DominantPattern';
import { TraitRadarChart } from './components/TraitRadarChart';
import { TraitBreakdown } from './components/TraitBreakdown';
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

      {/* ── Student header + report date ── */}
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
        </Box>
      </motion.div>

      {/* ── PDF Download Banner ── */}
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

      {/* ── Hero — Top Career Match ── */}
      <HeroSection hero={report.hero} />

      {/* ── Stream Recommendation (elevated to own section) ── */}
      <StreamSection streamRecommendation={report.stream_recommendation} />

      {/* ── Dominant Pattern with key traits ── */}
      {report.dominant_pattern && (
        <DominantPattern pattern={report.dominant_pattern} />
      )}

      {/* ── Trait Radar ── */}
      <TraitRadarChart traits={report.traits} />

      {/* ── Trait Breakdown (with icons) ── */}
      <TraitBreakdown traits={report.traits} />

      {/* ── Career Cards (capped at 3 + expand) ── */}
      <CareerCards careers={report.careers} />

      {/* ── Career Comparison ── */}
      <CareerComparison careers={report.careers} comparisonText={report.career_comparison_text} />

      {/* ── Less Natural Careers ── */}
      {report.less_natural_careers && report.less_natural_careers.length > 0 && (
        <LessNaturalCareers items={report.less_natural_careers} />
      )}

      {/* ── Development Roadmap ── */}
      <DevelopmentRoadmap roadmap={report.roadmap} />

      {/* ── Areas to Develop / Stretch Goals ── */}
      <AreasToImprove areas={report.areas_to_improve} />

      {/* ── Your Next Steps ── */}
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
              const stream = report.stream_recommendation?.stream || 'my recommended stream';
              const text = encodeURIComponent(
                `🎓 I just took a career assessment on Direction by Outcave!\n\n` +
                `My recommended stream: ${stream}\n` +
                `My #1 career match: ${topCareer}\n\n` +
                `The report has detailed trait analysis, career matches, and a development roadmap.\n\n` +
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

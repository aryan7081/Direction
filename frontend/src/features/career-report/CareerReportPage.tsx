'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Box, Button, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { PageLoader, ButtonSpinner } from '@/components/ui/Loaders';
import { fetchCareerReport, downloadReportPdf } from './api';
import { HeroSection } from './components/HeroSection';
import { DominantPattern } from './components/DominantPattern';
import { TraitRadarChart } from './components/TraitRadarChart';
import { TraitBreakdown } from './components/TraitBreakdown';
import { CareerCards } from './components/CareerCards';
import { CareerComparison } from './components/CareerComparison';
import { LessNaturalCareers } from './components/LessNaturalCareers';
import { DevelopmentRoadmap } from './components/DevelopmentRoadmap';
import { AreasToImprove } from './components/AreasToImprove';

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

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
      {/* Action bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            mb: 3,
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Button
            size="small"
            onClick={() => router.push('/dashboard')}
            sx={{ fontWeight: 500, alignSelf: { xs: 'flex-start', sm: 'auto' } }}
          >
            ← Back to Dashboard
          </Button>
          <Button
            variant="contained"
            onClick={handleDownloadPdf}
            disabled={downloading}
            sx={{ borderRadius: 2, minHeight: 44 }}
          >
            {downloading ? <><ButtonSpinner size={18} /> Generating PDF...</> : 'Download PDF Report'}
          </Button>
        </Box>

        {downloadError && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {downloadError}
          </Typography>
        )}
      </motion.div>

      {/* Hero + Stream + Confidence explanation */}
      <HeroSection hero={report.hero} streamRecommendation={report.stream_recommendation} />

      {/* Dominant Pattern */}
      {report.dominant_pattern && (
        <DominantPattern pattern={report.dominant_pattern} />
      )}

      {/* Radar */}
      <TraitRadarChart traits={report.traits} />

      {/* Trait breakdown */}
      <TraitBreakdown traits={report.traits} />

      {/* Career cards */}
      <CareerCards careers={report.careers} />

      {/* Comparison bar chart with analysis */}
      <CareerComparison careers={report.careers} comparisonText={report.career_comparison_text} />

      {/* Careers that may need extra effort */}
      {report.less_natural_careers && report.less_natural_careers.length > 0 && (
        <LessNaturalCareers items={report.less_natural_careers} />
      )}

      {/* Roadmap */}
      <DevelopmentRoadmap roadmap={report.roadmap} />

      {/* Improvement areas with practical steps */}
      <AreasToImprove areas={report.areas_to_improve} />

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: '#f9fafb',
            border: '1px solid #e5e7eb',
            mb: 4,
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', lineHeight: 1.6 }}>
            {report.disclaimer}
          </Typography>
        </Box>
      </motion.div>

      {/* Share with parents / WhatsApp */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Box
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ecfdf5 0%, #eff6ff 100%)',
            border: '1px solid #d1fae5',
            mb: 4,
            textAlign: 'center',
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
              bgcolor: '#25D366',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              '&:hover': { bgcolor: '#1eb954' },
            }}
          >
            Share on WhatsApp
          </Button>
        </Box>
      </motion.div>

      {/* Bottom actions */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 6, flexWrap: 'wrap' }}>
        <Button variant="outlined" onClick={() => router.push('/dashboard')} sx={{ borderRadius: 2 }}>
          Back to Dashboard
        </Button>
        <Button
          variant="contained"
          onClick={handleDownloadPdf}
          disabled={downloading}
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

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Box, Button, Container, Divider, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { PageLoader, ButtonSpinner } from '@/components/ui/Loaders';
import { fetchCareerReport, downloadReportPdf } from './api';
import { HeroSection } from './components/HeroSection';
import { TraitRadarChart } from './components/TraitRadarChart';
import { TraitBreakdown } from './components/TraitBreakdown';
import { CareerCards } from './components/CareerCards';
import { CareerComparison } from './components/CareerComparison';
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
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
      {/* Action bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Button
            size="small"
            onClick={() => router.push('/dashboard')}
            sx={{ fontWeight: 500 }}
          >
            ← Back to Dashboard
          </Button>
          <Button
            variant="contained"
            onClick={handleDownloadPdf}
            disabled={downloading}
            sx={{ borderRadius: 2 }}
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

      {/* Hero + Stream */}
      <HeroSection hero={report.hero} streamRecommendation={report.stream_recommendation} />

      {/* Radar */}
      <TraitRadarChart traits={report.traits} />

      {/* Trait breakdown */}
      <TraitBreakdown traits={report.traits} />

      {/* Career cards */}
      <CareerCards careers={report.careers} />

      {/* Comparison bar chart */}
      <CareerComparison careers={report.careers} />

      {/* Roadmap */}
      <DevelopmentRoadmap roadmap={report.roadmap} />

      {/* Improvement areas */}
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

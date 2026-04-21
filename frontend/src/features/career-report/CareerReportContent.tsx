'use client';

import { Box, Button, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ButtonSpinner } from '@/components/ui/Loaders';
import { HeroSection, HeroConfidenceExplanation } from './components/HeroSection';
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
import { TraitRadarChart } from './components/TraitRadarChart';
import { PremiumUpgradeCard } from './components/PremiumUpgradeCard';
import { CounselingStickyCta } from './components/CounselingStickyCta';
import { PREMIUM_UPGRADE_FROM_REPORT_INR } from '@/lib/productCopy';
import type { CareerReport } from './types';

export interface CareerReportContentProps {
  report: CareerReport;
  sessionId: string;
  variant: 'full' | 'preview';
  downloading?: boolean;
  downloadError?: string | null;
  onDownloadPdf?: () => void;
}

export function CareerReportContent({
  report,
  sessionId,
  variant,
  downloading = false,
  downloadError = null,
  onDownloadPdf,
}: CareerReportContentProps) {
  const router = useRouter();
  const isFull = variant === 'full';
  const previewLock = variant === 'preview';

  const studentName = report.student?.name || 'Student';
  const snap = report.assessment_snapshot;
  const nAnswered = snap?.answered_count;
  const tierNote = snap?.premium_extension_complete ? 'Phase 1 + premium extension' : 'Phase 1';
  const responseNote =
    typeof nAnswered === 'number' && nAnswered > 0
      ? `${nAnswered} questionnaire responses`
      : 'Your questionnaire responses';

  const readiness = report.readiness;
  const readinessBox = readiness ? (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
    >
      <Box
        sx={{
          mb: previewLock ? { xs: 1.5, sm: 2 } : 3,
          p: previewLock ? { xs: 1.5, sm: 2 } : 2.5,
          borderRadius: 2,
          bgcolor: '#f8fafc',
          border: '1px solid #e2e8f0',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: 1,
            mb: 0.5,
          }}
        >
          Career readiness
        </Typography>
        <Typography
          sx={{
            fontWeight: 800,
            color: '#111827',
            fontSize: previewLock ? '0.95rem' : '1rem',
            mb: 0.75,
          }}
        >
          {readiness.headline}
        </Typography>
        <Typography
          sx={{
            color: '#475569',
            fontSize: previewLock ? '0.85rem' : '0.88rem',
            lineHeight: 1.6,
          }}
        >
          {readiness.detail}
        </Typography>
      </Box>
    </motion.div>
  ) : null;

  const bigAnswers = (
    <>
      {previewLock ? (
        <>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1.75, sm: 2 },
              alignItems: 'stretch',
              mb: 0,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <HeroSection hero={report.hero} previewLock layout="teaser" careers={report.careers} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <StreamSection
                streamRecommendation={report.stream_recommendation}
                previewLock
                layout="teaser"
              />
            </Box>
          </Box>
          <HeroConfidenceExplanation hero={report.hero} previewLock compact />
        </>
      ) : (
        <>
          <HeroSection hero={report.hero} previewLock={false} />
          <StreamSection streamRecommendation={report.stream_recommendation} previewLock={false} />
        </>
      )}
      {readinessBox}
      {report.subject_recommendation && (
        <SubjectRecommendationSection
          recommendation={report.subject_recommendation}
          stream={report.stream_recommendation?.stream || ''}
          previewLock={previewLock}
        />
      )}
      <CareerCards careers={report.careers} previewLock={previewLock} />
      <CareerComparison careers={report.careers} comparisonText={report.career_comparison_text} previewLock={previewLock} />
      {report.less_natural_careers && report.less_natural_careers.length > 0 && (
        <LessNaturalCareers items={report.less_natural_careers} previewLock={previewLock} />
      )}
    </>
  );

  const profileAndGrowth = (
    <>
      {report.dominant_pattern && <DominantPattern pattern={report.dominant_pattern} />}
      {report.interest_profile && <InterestProfile profile={report.interest_profile} />}
      {report.core_traits && report.core_traits.length > 0 && <WorkDNA traits={report.core_traits} />}
      {report.personality_style && report.personality_style.length > 0 && (
        <PersonalityStyle dimensions={report.personality_style} />
      )}
      {report.working_style && report.working_style.length > 0 && (
        <WorkingStyleSection items={report.working_style} />
      )}
      {report.traits && report.traits.length > 0 && (
        <TraitRadarChart traits={report.traits} answeredCount={nAnswered} />
      )}
      <DevelopmentRoadmap roadmap={report.roadmap} previewLock={previewLock} />
      <AreasToImprove areas={report.areas_to_improve} />
      <NextSteps
        stream={report.stream_recommendation?.stream}
        topCareer={report.hero?.career_name}
        previewLock={previewLock}
      />
    </>
  );

  const disclaimer = (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: isFull ? 0.5 : 0 }}>
      <Box
        sx={{
          p: previewLock ? 1.5 : 2,
          borderRadius: 2,
          bgcolor: '#f9fafb',
          border: '1px solid #e5e7eb',
          mb: previewLock ? { xs: 1.5, sm: 2 } : 4,
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', lineHeight: 1.6 }}>
          {report.disclaimer}
        </Typography>
      </Box>
    </motion.div>
  );

  return (
    <>
      {isFull && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
          <Button size="small" onClick={() => router.push('/dashboard')} sx={{ fontWeight: 500, mb: 2 }}>
            ← Back to Dashboard
          </Button>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: isFull ? 0.4 : 0.25 }}
      >
        <Box sx={{ textAlign: 'center', mb: previewLock ? { xs: 1.25, sm: 2 } : 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#111827',
              letterSpacing: '-0.02em',
              fontSize: previewLock
                ? { xs: '1.05rem', sm: '1.35rem' }
                : { xs: '1.5rem', sm: '2rem' },
            }}
          >
            {previewLock ? (
              <>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                  Your career report
                </Box>
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Career Intelligence Report
                </Box>
              </>
            ) : (
              'Career Intelligence Report'
            )}
          </Typography>
          <Typography
            sx={{
              color: '#6b7280',
              fontSize: previewLock ? { xs: '0.78rem', sm: '0.95rem' } : '0.95rem',
              mt: previewLock ? { xs: 0.35, sm: 0.5 } : 0.5,
              lineHeight: 1.35,
            }}
          >
            Prepared for{' '}
            <Box component="span" sx={{ fontWeight: 700, color: '#111827' }}>
              {studentName}
            </Box>
            {report.student?.grade && (
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {' '}
                · {report.student.grade}
              </Box>
            )}
            {report.student?.school && (
              <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
                {' '}
                · {report.student.school}
              </Box>
            )}
          </Typography>
          <Typography
            sx={{
              color: '#9ca3af',
              fontSize: previewLock ? { xs: '0.68rem', sm: '0.8rem' } : '0.8rem',
              mt: previewLock ? { xs: 0.25, sm: 0.5 } : 0.5,
              display: previewLock ? { xs: 'none', sm: 'block' } : 'block',
            }}
          >
            {report.generated_at && `Generated on ${report.generated_at}`}
            {report.completed_at && ` · Assessment completed ${report.completed_at}`}
          </Typography>
          <Typography
            sx={{
              color: '#9ca3af',
              fontSize: previewLock ? { xs: '0.62rem', sm: '0.72rem' } : '0.72rem',
              mt: previewLock ? { xs: 0.25, sm: 0.5 } : 0.5,
              display: previewLock ? { xs: 'none', md: 'block' } : 'block',
              lineHeight: 1.45,
            }}
          >
            15 profile dimensions · {responseNote} · {tierNote} · RIASEC, personality (Big Five–style), values,
            readiness &amp; aptitude
          </Typography>
        </Box>
      </motion.div>

      {isFull && (
        <>
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
                onClick={onDownloadPdf}
                disabled={downloading}
                sx={{
                  borderRadius: 2,
                  minHeight: 44,
                  minWidth: 180,
                  textTransform: 'none',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  boxShadow: '0 4px 14px rgba(22,163,74,0.25)',
                  '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)' },
                }}
              >
                {downloading ? (
                  <>
                    <ButtonSpinner size={18} /> Generating...
                  </>
                ) : (
                  '⬇ Download PDF'
                )}
              </Button>
            </Box>
            {downloadError && (
              <Typography color="error" variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
                {downloadError}
              </Typography>
            )}
          </motion.div>

          {report.premium_upgrade?.available && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <PremiumUpgradeCard
                sessionId={sessionId}
                upgradePriceInr={report.premium_upgrade.price_inr ?? PREMIUM_UPGRADE_FROM_REPORT_INR}
              />
            </motion.div>
          )}
        </>
      )}

      {bigAnswers}

      {profileAndGrowth}

      {disclaimer}

      {isFull && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
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

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 6, flexWrap: 'wrap' }}>
            <Button variant="outlined" onClick={() => router.push('/dashboard')} sx={{ borderRadius: 2 }}>
              Back to Dashboard
            </Button>
            <Button
              variant="contained"
              onClick={onDownloadPdf}
              disabled={downloading}
              sx={{ borderRadius: 2 }}
            >
              {downloading ? (
                <>
                  <ButtonSpinner size={18} /> Generating...
                </>
              ) : (
                'Download PDF Report'
              )}
            </Button>
            <Button variant="outlined" onClick={() => router.push('/careers')} sx={{ borderRadius: 2 }}>
              Explore All Careers
            </Button>
          </Box>

          <CounselingStickyCta sessionId={sessionId} counselingRequest={report.counseling_request} />
        </>
      )}
    </>
  );
}

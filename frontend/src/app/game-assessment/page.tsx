'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { GameEngine } from '@/features/game-assessment/components/GameEngine';
import { PageLoader } from '@/components/ui/Loaders';

function GameAssessmentInner() {
  const searchParams = useSearchParams();
  const resumeSessionId = searchParams.get('resume');
  const viewSessionId = searchParams.get('view');
  const premiumContinueSessionId = searchParams.get('premium_continue');

  return (
    <GameEngine
      resumeSessionId={resumeSessionId}
      viewSessionId={viewSessionId}
      premiumContinueSessionId={premiumContinueSessionId}
    />
  );
}

export default function GameAssessmentPage() {
  return (
    <Suspense fallback={<PageLoader message="Loading assessment..." />}>
      <GameAssessmentInner />
    </Suspense>
  );
}

'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { GameEngine } from '@/features/game-assessment/components/GameEngine';
import { PageLoader } from '@/components/ui/Loaders';

function GameAssessmentInner() {
  const searchParams = useSearchParams();
  const resumeSessionId = searchParams.get('resume');
  const viewSessionId = searchParams.get('view');

  return (
    <GameEngine
      resumeSessionId={resumeSessionId}
      viewSessionId={viewSessionId}
    />
  );
}

export default function GameAssessmentPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<PageLoader message="Loading assessment..." />}>
        <GameAssessmentInner />
      </Suspense>
    </ProtectedRoute>
  );
}

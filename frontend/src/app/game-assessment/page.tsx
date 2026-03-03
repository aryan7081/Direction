'use client';

import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { GameEngine } from '@/features/game-assessment/components/GameEngine';

export default function GameAssessmentPage() {
  return (
    <ProtectedRoute>
      <GameEngine />
    </ProtectedRoute>
  );
}

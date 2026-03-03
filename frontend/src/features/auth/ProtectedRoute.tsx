'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { PageLoader } from '@/components/ui/Loaders';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const access = useAuthStore((s) => s.access);
  const router = useRouter();

  useEffect(() => {
    if (access === null && typeof window !== 'undefined') {
      const token = localStorage.getItem('access');
      if (!token) router.replace('/login');
    }
  }, [access, router]);

  if (access === null && typeof window !== 'undefined') {
    const token = localStorage.getItem('access');
    if (!token) {
      return <PageLoader message="Checking authentication..." />;
    }
  }

  return <>{children}</>;
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

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
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

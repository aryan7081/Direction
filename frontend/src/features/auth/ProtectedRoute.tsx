'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { PageLoader } from '@/components/ui/Loaders';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const access = useAuthStore((s) => s.access);
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = access ?? localStorage.getItem('access');
    if (!token) {
      router.replace('/login');
    } else {
      setChecked(true);
    }
  }, [access, router]);

  if (!checked) {
    return <PageLoader message="Checking authentication..." />;
  }

  return <>{children}</>;
}

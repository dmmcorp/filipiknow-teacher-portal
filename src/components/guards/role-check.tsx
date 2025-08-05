'use client';

import { useCheckRole } from '@/hooks/use-check-role';
import { useConvexAuth } from 'convex/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Only allow users with the "teacher" role, otherwise redirect to "/"
export function ClientRoleGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { data: role, isLoading: isRoleLoading } = useCheckRole();
  const [allowed, setAllowed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !isRoleLoading) {
      if (!isAuthenticated || role !== 'teacher') {
        router.replace('/');
      } else {
        setAllowed(true);
      }
    }
  }, [isAuthenticated, isAuthLoading, isRoleLoading, role, router]);

  if (isAuthLoading || isRoleLoading) return null;
  if (!allowed) return null;

  return <>{children}</>;
}

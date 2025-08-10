'use client';

import { useCheckRole } from '@/hooks/use-check-role';
import { useConvexAuth } from 'convex/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { data: role, isLoading: isRoleLoading } = useCheckRole();

  useEffect(() => {
    if (!isAuthLoading && !isRoleLoading) {
      if (!isAuthenticated) {
        window.location.href = '/';
      }

      if (role !== 'admin') {
        // Redirect non-admin users to appropriate routes
        switch (role) {
          case 'teacher':
            router.replace('/teacher');
            break;
          default:
            window.location.href = '/';
        }
        return;
      }
    }
  }, [isAuthenticated, isAuthLoading, isRoleLoading, role, router]);

  // Show nothing while checking authentication and role
  if (isAuthLoading || isRoleLoading) {
    return null;
  }

  // Only render children if authenticated and system admin
  if (isAuthenticated && role === 'admin') {
    return <>{children}</>;
  }
  return <>Loading...</>;
}

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requirePremium?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requirePremium = false,
}: ProtectedRouteProps) {
  const { user, loading, isAdmin, isPremium } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/');
        return;
      }

      if (requireAdmin && !isAdmin) {
        router.push('/');
        return;
      }

      if (requirePremium && !isPremium) {
        router.push('/premium');
        return;
      }
    }
  }, [user, loading, isAdmin, isPremium, requireAdmin, requirePremium, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireAdmin && !isAdmin) {
    return null;
  }

  if (requirePremium && !isPremium) {
    return null;
  }

  return <>{children}</>;
}

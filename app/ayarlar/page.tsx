'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AyarlarPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Kullanıcı giriş yapmışsa dashboard'daki profil tab'ına yönlendir
        router.replace('/dashboard?tab=profile');
      } else {
        // Kullanıcı giriş yapmamışsa ana sayfaya yönlendir
        router.replace('/');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Yönlendiriliyor...</p>
      </div>
    </div>
  );
}


'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center transition-colors">
      <div className="w-12 h-12 border-4 border-gray-200 dark:border-slate-800 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );
}

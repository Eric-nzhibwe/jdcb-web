'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }
    router.replace(user.role === 'client' ? '/client/dashboard' : '/contractor/dashboard');
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function RootPage() {
  const { user, loading, firebaseReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!firebaseReady || loading) return;
    if (!user) { router.replace('/login'); return; }
    router.replace(user.role === 'client' ? '/client/dashboard' : '/contractor/dashboard');
  }, [user, loading, firebaseReady, router]);

  if (!firebaseReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <h1 className="text-xl font-black text-gray-900">Firebase not configured</h1>
          <p className="text-sm text-gray-500">
            The <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_FIREBASE_*</code> environment
            variables are missing. Add them in your Render dashboard under <strong>Environment</strong> and redeploy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );
}

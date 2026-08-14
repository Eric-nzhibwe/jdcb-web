'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { getInitials } from '@/lib/utils';

export default function ClientProfilePage() {
  const { user } = useAuth();
  const initials = getInitials(user?.displayName ?? 'U');

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white">Profile</h1>
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
            <span className="text-xl font-black text-accent">{initials}</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user?.displayName}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            ['Email', user?.email],
            ['Phone', user?.phone || '—'],
            ['Company', user?.company || '—'],
          ].map(([label, val]) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{val}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

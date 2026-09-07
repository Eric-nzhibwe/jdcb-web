'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { ProfileEditor } from '@/components/profile/ProfileEditor';

export default function ClientProfilePage() {
  const { user, updateProfile } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your personal information and photo</p>
      </div>
      <Card>
        <ProfileEditor user={user} onSave={updateProfile} />
      </Card>
    </div>
  );
}

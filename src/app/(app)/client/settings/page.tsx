'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ClientSettingsPage() {
  const { user, logout, updateProfile } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [notifyEmail, setNotifyEmail] = useState(user?.notifyEmail ?? true);
  const [notifySms,   setNotifySms]   = useState(user?.notifySms ?? false);

  const handleToggle = async (key: 'notifyEmail' | 'notifySms', value: boolean) => {
    if (key === 'notifyEmail') setNotifyEmail(value);
    else setNotifySms(value);
    await updateProfile({ [key]: value });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account preferences</p>
      </div>

      <Card>
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Profile</h2>
        <div className="space-y-3">
          {[['Name', user?.displayName], ['Email', user?.email], ['Role', user?.role]].map(([label, val]) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{val}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
            <p className="text-xs text-gray-400">Toggle between light and dark theme</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDark ? 'bg-primary' : 'bg-gray-200'}`}
            role="switch"
            aria-checked={isDark}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isDark ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </Card>

      <Card>
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Notifications</h2>
        <div className="space-y-4">
          {[
            { key: 'notifyEmail' as const, label: 'Email Notifications', value: notifyEmail },
            { key: 'notifySms'   as const, label: 'SMS Notifications',   value: notifySms },
          ].map(({ key, label, value }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              <button
                onClick={() => handleToggle(key, !value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                role="switch"
                aria-checked={value}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Button variant="danger" onClick={logout} className="w-full">Sign Out</Button>
    </div>
  );
}

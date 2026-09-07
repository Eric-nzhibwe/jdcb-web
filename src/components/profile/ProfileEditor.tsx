'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Loader2, Check, X, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { uploadProfilePhoto } from '@/services/storage';
import { updateUserProfile } from '@/services/auth';
import { getInitials } from '@/lib/utils';
import type { User } from '@/types';

interface ProfileEditorProps {
  user: User;
  onSave: (updates: Partial<User>) => Promise<void>;
}

type State = 'idle' | 'saving' | 'success' | 'error';

export function ProfileEditor({ user, onSave }: ProfileEditorProps) {
  const [editing,     setEditing]     = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [phone,       setPhone]       = useState(user.phone ?? '');
  const [company,     setCompany]     = useState(user.company ?? '');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile,   setPhotoFile]   = useState<File | null>(null);
  const [state,       setState]       = useState<State>('idle');
  const [errorMsg,    setErrorMsg]    = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPhoto = photoPreview ?? user.photoURL ?? null;
  const initials     = getInitials(user.displayName);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrorMsg('Image must be under 5 MB.'); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setErrorMsg('');
  };

  const handleCancel = useCallback(() => {
    setEditing(false);
    setDisplayName(user.displayName);
    setPhone(user.phone ?? '');
    setCompany(user.company ?? '');
    setPhotoPreview(null);
    setPhotoFile(null);
    setErrorMsg('');
    setState('idle');
  }, [user]);

  const handleSave = async () => {
    if (!displayName.trim()) { setErrorMsg('Name is required.'); return; }
    setState('saving'); setErrorMsg('');
    try {
      let photoURL = user.photoURL;
      if (photoFile) {
        photoURL = await uploadProfilePhoto(user.id, photoFile);
      }
      const updates: Partial<User> = {
        displayName: displayName.trim(),
        phone: phone.trim(),
        company: company.trim(),
        ...(photoURL !== user.photoURL && { photoURL }),
      };
      await onSave(updates);
      setState('success');
      setEditing(false);
      setPhotoFile(null);
      setPhotoPreview(null);
      setTimeout(() => setState('idle'), 2000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save. Try again.');
      setState('error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative flex-shrink-0">
          {currentPhoto ? (
            <img
              src={currentPhoto}
              alt={user.displayName}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-primary/20"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center ring-4 ring-primary/20">
              <span className="text-2xl font-black text-white">{initials}</span>
            </div>
          )}
          {editing && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-md hover:bg-primary-dark transition-colors"
              aria-label="Change photo"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex-1 min-w-0">
          {!editing ? (
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white truncate">{user.displayName}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mt-0.5">{user.role}</p>
              {user.company && <p className="text-sm text-gray-400 truncate">{user.company}</p>}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Click the camera icon to change your photo (max 5 MB)</p>
          )}
        </div>

        {!editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="w-4 h-4" /> Edit
          </Button>
        )}
      </div>

      {/* Fields */}
      {editing ? (
        <div className="space-y-4">
          <Input
            label="Full Name *"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your full name"
          />
          <Input
            label="Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+260 97 000 0000"
          />
          <Input
            label="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Your company or business name"
          />

          {errorMsg && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{errorMsg}</p>
          )}

          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={handleCancel} disabled={state === 'saving'}>
              <X className="w-4 h-4" /> Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} loading={state === 'saving'}>
              {state === 'saving' ? 'Saving…' : <><Check className="w-4 h-4" /> Save Changes</>}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-700">
          {[
            ['Email',   user.email],
            ['Phone',   user.phone  || '—'],
            ['Company', user.company || '—'],
          ].map(([label, val]) => (
            <div key={label} className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white max-w-[60%] text-right truncate">{val}</span>
            </div>
          ))}
        </div>
      )}

      {state === 'success' && !editing && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
          <Check className="w-4 h-4" /> Profile updated successfully
        </div>
      )}
    </div>
  );
}

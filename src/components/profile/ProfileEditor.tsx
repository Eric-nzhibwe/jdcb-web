'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Check, X, Pencil, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { uploadProfilePhoto } from '@/services/storage';
import { getInitials } from '@/lib/utils';
import type { User } from '@/types';

interface ProfileEditorProps {
  user: User;
  onSave: (updates: Partial<User>) => Promise<void>;
}

type SaveState = 'idle' | 'saving' | 'success' | 'error';
type PhotoState = 'idle' | 'uploading' | 'done' | 'error';

export function ProfileEditor({ user, onSave }: ProfileEditorProps) {
  // Profile fields
  const [editing,     setEditing]     = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [phone,       setPhone]       = useState(user.phone ?? '');
  const [company,     setCompany]     = useState(user.company ?? '');
  const [saveState,   setSaveState]   = useState<SaveState>('idle');
  const [saveError,   setSaveError]   = useState('');

  // Photo — saved immediately on pick, independent of the form
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(user.photoURL ?? null);
  const [photoState,   setPhotoState]   = useState<PhotoState>('idle');
  const [photoError,   setPhotoError]   = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = getInitials(user.displayName);

  /* ── Photo upload — fires immediately when file is chosen ── */
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset input so same file can be re-selected if needed
    e.target.value = '';
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image must be under 5 MB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select an image file.');
      return;
    }

    // Show local preview instantly
    const localPreview = URL.createObjectURL(file);
    setCurrentPhoto(localPreview);
    setPhotoState('uploading');
    setPhotoError('');
    setUploadProgress(0);

    try {
      // Compress + save to Firestore in one step (no Firebase Storage / CORS needed)
      const downloadURL = await uploadProfilePhoto(user.id, file, (pct) => {
        setUploadProgress(pct);
      });

      // Update local auth state so the rest of the UI reflects the new photo
      await onSave({ photoURL: downloadURL });
      setCurrentPhoto(downloadURL);
      setUploadProgress(100);
      setPhotoState('done');
      setTimeout(() => { setPhotoState('idle'); setUploadProgress(0); }, 2000);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Photo upload failed. Try again.');
      setPhotoState('error');
      setUploadProgress(0);
      // Revert preview back to last saved photo
      setCurrentPhoto(user.photoURL ?? null);
    }
  }, [user.id, user.photoURL, onSave]);

  /* ── Profile field save ── */
  const handleSave = useCallback(async () => {
    if (!displayName.trim()) { setSaveError('Name is required.'); return; }
    setSaveState('saving'); setSaveError('');
    try {
      await onSave({
        displayName: displayName.trim(),
        phone:   phone.trim(),
        company: company.trim(),
      });
      setSaveState('success');
      setEditing(false);
      setTimeout(() => setSaveState('idle'), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save. Try again.');
      setSaveState('error');
    }
  }, [displayName, phone, company, onSave]);

  const handleCancel = useCallback(() => {
    setEditing(false);
    setDisplayName(user.displayName);
    setPhone(user.phone ?? '');
    setCompany(user.company ?? '');
    setSaveError('');
    setSaveState('idle');
  }, [user]);

  return (
    <div className="space-y-6">

      {/* ── Avatar row ── */}
      <div className="flex items-center gap-5">
        <div className="relative flex-shrink-0">
          {/* Photo or initials */}
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

          {/* Upload-state overlay */}
          {photoState === 'uploading' && (
            <div className="absolute inset-0 rounded-2xl bg-black/60 flex flex-col items-center justify-center gap-1 px-2">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
              <div className="w-full bg-white/30 rounded-full h-1.5 mt-1">
                <div
                  className="bg-white h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-white text-[10px] font-semibold">{uploadProgress}%</span>
            </div>
          )}
          {photoState === 'done' && (
            <div className="absolute inset-0 rounded-2xl bg-green-500/60 flex items-center justify-center">
              <Check className="w-7 h-7 text-white" />
            </div>
          )}

          {/* Camera button — always visible so photo can be changed any time */}
          <button
            type="button"
            onClick={() => { setPhotoError(''); fileInputRef.current?.click(); }}
            disabled={photoState === 'uploading'}
            className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Change profile photo"
          >
            {photoState === 'uploading'
              ? <Loader2 className="w-4 h-4 text-white animate-spin" />
              : <Camera className="w-4 h-4 text-white" />
            }
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-black text-gray-900 dark:text-white truncate">{user.displayName}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mt-0.5">{user.role}</p>
          {user.company && <p className="text-sm text-gray-400 truncate">{user.company}</p>}
          <p className="text-xs text-gray-400 mt-1">Tap the camera to update your photo instantly</p>
        </div>

        {!editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="w-4 h-4" /> Edit
          </Button>
        )}
      </div>

      {/* Photo error */}
      {photoError && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg flex items-center gap-2">
          <X className="w-4 h-4 flex-shrink-0" /> {photoError}
        </p>
      )}

      {/* Photo success */}
      {photoState === 'done' && (
        <p className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4" /> Photo saved successfully
        </p>
      )}

      {/* ── Profile fields ── */}
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

          {saveError && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{saveError}</p>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
              disabled={saveState === 'saving'}
            >
              <X className="w-4 h-4" /> Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              loading={saveState === 'saving'}
            >
              {saveState === 'saving' ? 'Saving…' : <><Check className="w-4 h-4" /> Save Changes</>}
            </Button>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {[
            ['Email',   user.email],
            ['Phone',   user.phone   || '—'],
            ['Company', user.company || '—'],
          ].map(([label, val]) => (
            <div key={label} className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white max-w-[60%] text-right truncate">{val}</span>
            </div>
          ))}
        </div>
      )}

      {/* Profile save success */}
      {saveState === 'success' && !editing && (
        <p className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4" /> Profile updated successfully
        </p>
      )}
    </div>
  );
}

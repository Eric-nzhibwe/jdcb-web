import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  type UploadTaskSnapshot,
} from 'firebase/storage';
import { storage } from '@/lib/firebase';

export interface UploadProgressCallback {
  (progress: number): void;   // 0–100
}

/**
 * Upload a profile photo for a user with real progress reporting.
 * Always overwrites profile_photos/{userId}/avatar.jpg — one file per user.
 * Returns the public download URL on completion.
 */
export function uploadProfilePhoto(
  userId: string,
  file: File,
  onProgress?: UploadProgressCallback,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const filePath   = `profile_photos/${userId}/avatar.jpg`;
    const storageRef = ref(storage, filePath);

    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type || 'image/jpeg',
      cacheControl: 'public, max-age=31536000',
    });

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const pct = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        onProgress?.(pct);
      },
      (error) => {
        // Firebase storage error codes
        console.error('[Storage] Upload error:', error.code, error.message);
        switch (error.code) {
          case 'storage/unauthorized':
            reject(new Error('Permission denied. Please sign in and try again.'));
            break;
          case 'storage/canceled':
            reject(new Error('Upload was cancelled.'));
            break;
          case 'storage/quota-exceeded':
            reject(new Error('Storage quota exceeded.'));
            break;
          default:
            reject(new Error(`Upload failed: ${error.message}`));
        }
      },
      async () => {
        try {
          // Add cache-buster so browser fetches the new photo
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          const sep = url.includes('?') ? '&' : '?';
          resolve(`${url}${sep}t=${Date.now()}`);
        } catch (err) {
          reject(err);
        }
      },
    );
  });
}

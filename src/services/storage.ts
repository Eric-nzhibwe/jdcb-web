import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  type UploadTaskSnapshot,
} from 'firebase/storage';
import { storage } from '@/lib/firebase';

/**
 * Compress an image file to a max width/height of 400 px and convert to JPEG.
 * Runs entirely in the browser — typical selfie goes from ~3 MB → ~30 KB.
 */
function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX = 400;
      let { width, height } = img;
      if (width > height) {
        if (width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
      } else {
        if (height > MAX) { width = Math.round((width * MAX) / height); height = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width  = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(blob ?? file),
        'image/jpeg',
        0.82,
      );
    };

    // If compression fails for any reason, fall back to original file
    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    img.src = objectUrl;
  });
}

/**
 * Compress and upload a profile photo using a resumable upload task.
 *
 * Progress is reported in three phases:
 *   0–10 %   : before compression starts
 *  10–40 %   : compression (instant, but gives visual feedback)
 *  40–95 %   : real byte-level Firebase upload progress
 *  95–100 %  : fetching the final download URL
 *
 * Using uploadBytesResumable instead of uploadBytes gives us:
 *  • Real per-chunk progress events (no more stuck-at-40 %)
 *  • Automatic retry on transient network errors
 *  • Cancellable uploads
 *  • Clear error codes (storage/unauthorized, storage/canceled, etc.)
 */
export function uploadProfilePhoto(
  userId: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    onProgress?.(10);

    // ── Phase 1: compress ──────────────────────────────────────────────────
    let compressed: Blob;
    try {
      compressed = await compressImage(file);
    } catch {
      // Compression failure is non-fatal — upload the original
      compressed = file;
    }
    onProgress?.(40);

    // ── Phase 2: resumable upload ──────────────────────────────────────────
    const filePath   = `profile_photos/${userId}/avatar.jpg`;
    const storageRef = ref(storage, filePath);

    const uploadTask = uploadBytesResumable(storageRef, compressed, {
      contentType: 'image/jpeg',
      cacheControl: 'public, max-age=31536000',
    });

    uploadTask.on(
      'state_changed',

      // Progress snapshot — maps bytes transferred to the 40–95 % band
      (snapshot: UploadTaskSnapshot) => {
        const { bytesTransferred, totalBytes } = snapshot;
        if (totalBytes > 0) {
          const uploadPct = bytesTransferred / totalBytes; // 0.0 → 1.0
          const scaled    = Math.round(40 + uploadPct * 55); // 40 → 95
          onProgress?.(Math.min(scaled, 95));
        }
      },

      // Error handler — surfaces a readable message instead of a raw code
      (error) => {
        const messages: Record<string, string> = {
          'storage/unauthorized':    'Permission denied. Please sign in again.',
          'storage/canceled':        'Upload was cancelled.',
          'storage/unknown':         'Network error. Check your connection and try again.',
          'storage/quota-exceeded':  'Storage quota exceeded. Contact support.',
          'storage/invalid-checksum':'File corrupted during transfer. Please try again.',
        };
        const msg = messages[error.code] ?? `Upload failed (${error.code}). Try again.`;
        reject(new Error(msg));
      },

      // Completion handler
      async () => {
        try {
          onProgress?.(95);
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          onProgress?.(100);
          // Cache-buster so the browser always fetches the new photo
          const sep = url.includes('?') ? '&' : '?';
          resolve(`${url}${sep}t=${Date.now()}`);
        } catch (err) {
          reject(err);
        }
      },
    );
  });
}

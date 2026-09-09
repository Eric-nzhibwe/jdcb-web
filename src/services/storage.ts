/**
 * Profile photo storage — Firestore base64 strategy
 *
 * Instead of uploading to Firebase Storage (which requires CORS configuration),
 * we compress the image to a small JPEG, convert it to a base64 data URL, and
 * store it directly in the user's Firestore document.
 *
 * Why this works:
 *  - No CORS issues — we never make a cross-origin request to a storage bucket
 *  - No extra SDK setup — uses Firestore which is already wired up
 *  - Fast — a 400px JPEG compresses to ~20–40 KB, well within Firestore's 1 MB doc limit
 *  - Works everywhere — local, Render, any deployment
 */

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Compress an image to a max width/height of 400px and return a JPEG data URL.
 */
function compressToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
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
      if (!ctx) { reject(new Error('Canvas not supported')); return; }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Compression failed')); return; }
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror   = () => reject(new Error('Failed to read compressed image'));
          reader.readAsDataURL(blob);
        },
        'image/jpeg',
        0.82,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not load image'));
    };

    img.src = objectUrl;
  });
}

/**
 * Compress and save a profile photo.
 *
 * Stores the compressed image as a base64 data URL in Firestore under
 * users/{userId}.photoURL — no Firebase Storage or CORS required.
 *
 * onProgress: 0 → 30 (compressing) → 80 (saving to Firestore) → 100 (done)
 */
export async function uploadProfilePhoto(
  userId: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  onProgress?.(10);

  // Validate
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image must be under 10 MB.');
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file.');
  }

  // Compress to a small JPEG data URL
  let dataURL: string;
  try {
    dataURL = await compressToDataURL(file);
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : 'Image compression failed. Try a different photo.'
    );
  }
  onProgress?.(60);

  // Rough size check after compression (Firestore doc limit is 1 MB)
  const approxBytes = Math.round((dataURL.length * 3) / 4);
  if (approxBytes > 900 * 1024) {
    throw new Error('Compressed image is still too large. Try a smaller photo.');
  }

  // Save directly to Firestore — no Storage bucket, no CORS
  try {
    await updateDoc(doc(db, 'users', userId), { photoURL: dataURL });
  } catch (err: any) {
    console.error('[Profile] Firestore write error:', err);
    if (err?.code === 'permission-denied') {
      throw new Error('Permission denied. Please sign in again.');
    }
    throw new Error('Failed to save photo. Check your connection and try again.');
  }
  onProgress?.(100);

  return dataURL;
}

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

/**
 * Compress an image file to a max width/height of 400px and convert to JPEG.
 * This runs entirely in the browser and makes uploads ~10x faster.
 */
function compressImage(file: File): Promise<Blob> {
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
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => { blob ? resolve(blob) : resolve(file); },
        'image/jpeg',
        0.82,   // quality — good balance of size vs appearance
      );
    };

    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    img.src = objectUrl;
  });
}

/**
 * Compress and upload a profile photo.
 * Always writes to profile_photos/{userId}/avatar.jpg — one file per user.
 * onProgress receives values 0–100 twice: 50 when compression is done, 100 when uploaded.
 */
export async function uploadProfilePhoto(
  userId: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  onProgress?.(10);

  // Compress first — typical selfie goes from 3 MB → ~30 KB
  const compressed = await compressImage(file);
  onProgress?.(40);

  const filePath   = `profile_photos/${userId}/avatar.jpg`;
  const storageRef = ref(storage, filePath);

  await uploadBytes(storageRef, compressed, {
    contentType: 'image/jpeg',
    cacheControl: 'public, max-age=31536000',
  });
  onProgress?.(90);

  const url = await getDownloadURL(storageRef);
  onProgress?.(100);

  // Cache-buster so browser always loads the new photo
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}t=${Date.now()}`;
}

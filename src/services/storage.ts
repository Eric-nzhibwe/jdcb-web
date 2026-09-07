import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

/**
 * Upload a profile photo for a user.
 * Always overwrites the same path (avatar.jpg) so there's only ever one file per user.
 * Returns the public download URL.
 */
export async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
  // Always store as avatar.jpg regardless of original extension —
  // this overwrites the previous photo cleanly with no leftover files.
  const filePath   = `profile_photos/${userId}/avatar.jpg`;
  const storageRef = ref(storage, filePath);

  await uploadBytes(storageRef, file, {
    contentType: file.type || 'image/jpeg',
    cacheControl: 'public, max-age=31536000',  // CDN-cacheable for 1 year
  });

  // Add a cache-buster to the URL so the browser doesn't serve the old photo
  const url = await getDownloadURL(storageRef);
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}t=${Date.now()}`;
}
